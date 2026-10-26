#!/usr/bin/env node
import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { readFile, mkdir, writeFile, chmod } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { assess, readSettings, applyAction } from '../src/core.js';

const scope = 'openid email https://www.googleapis.com/auth/gmail.settings.basic';
const appDir = join(homedir(), '.gmail-doctor');
const keychainName = 'gmail-doctor-oauth-v1';
const args = process.argv.slice(2);
const command = args[0] || 'help';
const selectedAccount = args.includes('--account') ? args[args.indexOf('--account') + 1]?.toLowerCase() : null;
const demo = args.includes('--demo');
const fixture = {
  autoForwarding: { enabled: true, emailAddress: 'unknown@example.net' },
  filters: [{ id: 'suspicious-1', criteria: { subject: 'security alert' }, action: { addLabelIds: ['TRASH'], removeLabelIds: ['INBOX'] } }],
  sendAs: [{sendAsEmail:'test@gmail.com',isPrimary:true}], pop:{ accessWindow:'disabled' }, imap:{enabled:false},
  forwardingAddresses: [{forwardingEmail:'unknown@example.net'}]
};
function help() {
  console.log(`Gmail Doctor v0.2 — Gmail settings audit and repair
Usage:
  gmail-doctor scan [--demo] [--json]
  gmail-doctor repair [--demo] [--dry-run]
  gmail-doctor account add
  gmail-doctor account list
  gmail-doctor scan --all
  gmail-doctor scan --account you@gmail.com
  gmail-doctor repair --account you@gmail.com [--dry-run]
  gmail-doctor logout --account you@gmail.com
  gmail-doctor help

First create a Google Cloud Desktop OAuth client, enable Gmail API,
download its JSON and set GMAIL_DOCTOR_OAUTH_CLIENT=/absolute/path/client.json.
A Google browser sign-in is launched on first live scan.
No mail body is accessed. Gmail account sessions, recovery settings,
Family Link and other apps' OAuth grants are NOT inspected.
A clean scan does NOT guarantee that your account is secure.`);
}
function clientConfig(json) {
  const c = json.installed;
  if (!c?.client_id || !c?.client_secret) throw new Error('Expected Google Desktop OAuth client JSON (installed).');
  return c;
}
async function getClient() {
  const p = process.env.GMAIL_DOCTOR_OAUTH_CLIENT;
  if (!p) throw new Error('Set GMAIL_DOCTOR_OAUTH_CLIENT to your Google Desktop OAuth client JSON path.');
  return clientConfig(JSON.parse(await readFile(resolve(p), 'utf8')));
}
function keychain(op, account, value) {
  if (process.platform !== 'darwin') throw new Error('Token persistence currently supports macOS Keychain only.');
  const params = op === 'read' ? ['find-generic-password','-s',keychainName,'-a',account,'-w'] :
    op === 'delete' ? ['delete-generic-password','-s',keychainName,'-a',account] :
    ['add-generic-password','-U','-s',keychainName,'-a',account,'-w',value];
  try { return execFileSync('/usr/bin/security', params, {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); }
  catch { return null; }
}
async function tokenRequest(form) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(form)
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Google OAuth token request failed: ' + (data.error || res.status));
  return data;
}
async function browserLogin(client) {
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(20).toString('hex');
  let finish;
  const authResult = new Promise((ok, fail)=> { finish = {ok,fail}; });
  const server = createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
      if (url.searchParams.get('state') !== state) throw new Error('OAuth state mismatch');
      const code = url.searchParams.get('code');
      if (!code) throw new Error('Authorization failed or was rejected');
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}).end('<h2>Gmail Doctor authorized</h2><p>Return to your terminal. You can close this tab.</p>');
      finish.ok(code);
    } catch(e) { res.writeHead(400).end('Authorization error'); finish.fail(e); }
  });
  server.listen(0, '127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  const redirect_uri = 'http://127.0.0.1:' + server.address().port + '/callback';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  for (const [k,v] of Object.entries({client_id:client.client_id,redirect_uri,response_type:'code',scope,state,code_challenge:challenge,code_challenge_method:'S256',access_type:'offline',prompt:'consent'})) url.searchParams.set(k,v);
  console.log('Opening Google sign-in in your browser...');
  const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
  const child = spawn(opener,[url.toString()],{stdio:'ignore'});
  child.on('error',()=>console.error('Open this URL yourself:',url.toString()));
  const timeout = setTimeout(()=>finish.fail(new Error('Browser sign-in timeout')),180000);
  try {
    const code = await authResult;
    return await tokenRequest({code,client_id:client.client_id,client_secret:client.client_secret,redirect_uri,grant_type:'authorization_code',code_verifier:verifier});
  } finally { clearTimeout(timeout); server.close(); }
}
const accountFile = join(appDir, 'accounts.json');
async function accounts() {
  try { const values = JSON.parse(await readFile(accountFile, 'utf8')); return Array.isArray(values) ? values : []; }
  catch (e) { if (e.code === 'ENOENT') return []; throw e; }
}
async function remember(email) {
  await mkdir(appDir, {recursive:true,mode:0o700});
  const list = await accounts();
  if (!list.includes(email)) await writeFile(accountFile, JSON.stringify([...list,email].sort(),null,2), {mode:0o600});
  await chmod(accountFile,0o600);
}
async function forget(email) {
  await writeFile(accountFile,JSON.stringify((await accounts()).filter(x=>x!==email),null,2),{mode:0o600});
}
async function identityFromToken(token, clientId) {
  if (!token) throw new Error('Google did not provide an identity token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid Google identity token');
  const check = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token='+encodeURIComponent(token));
  if (!check.ok) throw new Error('Google identity verification endpoint rejected token');
  const payload = await check.json();
  if (!['https://accounts.google.com','accounts.google.com'].includes(payload.iss) || payload.aud !== clientId || payload.exp * 1000 <= Date.now() || !payload.email || payload.email_verified !== true)
    throw new Error('Google account identity verification failed');
  return payload.email.toLowerCase();
}
async function addAccount() {
  const c = await getClient();
  const tokens = await browserLogin(c);
  const email = await identityFromToken(tokens.id_token,c.client_id);
  if (!tokens.refresh_token) throw new Error('Google did not issue an offline token; account not saved.');
  const key = c.client_id + ':' + email;
  keychain('write',key,tokens.refresh_token);
  if (keychain('read',key) !== tokens.refresh_token) throw new Error('Could not save token securely in Keychain.');
  await remember(email);
  console.log('Added account:',email);
}
async function accessToken(email) {
  if (!email) throw new Error('Specify an account or run gmail-doctor account add first.');
  const known = await accounts();
  if (!known.includes(email)) throw new Error('Unknown account '+email+'; run gmail-doctor account add.');

  const c = await getClient();
  const saved = keychain('read',c.client_id+':'+email);
  if (!saved) throw new Error('No local Keychain authorization for '+email+'; run gmail-doctor account add.');
  const data = await tokenRequest({refresh_token:saved,client_id:c.client_id,client_secret:c.client_secret,grant_type:'refresh_token'});
  return data.access_token;
}
function gmailApi(token) {
  return async (method,path,body) => {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/'+path, {
      method, headers:{'Authorization':'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
      ...(body?{body:JSON.stringify(body)}:{})
    });
    if (res.status === 204) return {};
    if (!res.ok) throw new Error('Gmail API ' + method + ' ' + path + ' HTTP ' + res.status);
    return res.json();
  };
}
async function report(api, jsonMode=false) {
  const {settings,errors} = demo ? {settings:fixture,errors:[]} : await readSettings(api);
  const assessed = assess(settings);
  const result = {...assessed, errors, coverage: Object.keys(settings)};
  if (jsonMode) console.log(JSON.stringify(result,null,2));
  else {
    console.log('\nGmail Doctor '+(demo?'DEMO (no Gmail connection)':'live scan'));
    for (const item of assessed.findings) console.log('['+item.severity.toUpperCase()+'] '+item.detail);
    if (!assessed.findings.length) console.log('No flagged settings found in scanned categories.');
    for (const err of errors) console.log('[NOT CHECKED] '+err);
    console.log('\nCannot assess: sign-in devices, active sessions, recovery options, Family Link, third-party OAuth grants.');
    console.log('Review: https://myaccount.google.com/security-checkup');
    console.log('This is a settings audit, not proof that your account is safe.');
  }
  return {settings,...result};
}
async function saveBackup(data, email) {
  await mkdir(join(appDir,'backups'),{recursive:true,mode:0o700});
  const p = join(appDir,'backups','settings-'+encodeURIComponent(email || 'demo')+'-'+new Date().toISOString().replaceAll(':','-')+'.json');
  await writeFile(p,JSON.stringify(data,null,2),{mode:0o600,flag:'wx'});
  await chmod(p,0o600);
  return p;
}
async function main() {
  if (command==='help'||args.includes('--help')) { help(); return; }
  if (command === 'account') {
    if (args[1] === 'add') return addAccount();
    if (args[1] === 'list') { const list=await accounts(); console.log(list.length?list.join('\n'):'No accounts registered. Run gmail-doctor account add.'); return; }
    throw new Error('Use gmail-doctor account add or gmail-doctor account list.');
  }
  if (command==='logout') {
    const list=await accounts();
    const email=selectedAccount || (list.length===1?list[0]:null);
    if (!email || !list.includes(email)) throw new Error('Specify a registered --account email.');
    const c=await getClient();
    keychain('delete',c.client_id+':'+email);
    await forget(email);
    console.log('Removed local authorization for '+email+'. Revoke Google access separately at https://myaccount.google.com/connections');
    return;
  }
  if (!['scan','repair'].includes(command)) throw new Error('Unknown command. Run gmail-doctor help.');
  if (args.includes('--all')) {
    if (command!=='scan') throw new Error('--all only supports scan, never repair.');
    if (demo) throw new Error('Demo cannot scan multiple accounts.');
    const list=await accounts();
    if (!list.length) throw new Error('No accounts registered. Run gmail-doctor account add.');
    const summary=[];
    for (const email of list) {
      console.log('\nAccount:',email);
      try {
        const result=await report(gmailApi(await accessToken(email)));
        summary.push({email,warnings:result.findings.filter(f=>f.severity==='warning').length,unchecked:result.errors.length});
      } catch(e) {console.log('[ERROR] '+e.message);summary.push({email,error:e.message});}
    }
    console.log('\nSummary:',JSON.stringify(summary,null,2));
    if (summary.some(x=>x.error||x.unchecked)) process.exitCode=1;
    return;
  }
  const list=demo?[]:await accounts();
  const email=demo?null:(selectedAccount||(list.length===1?list[0]:null));
  if (!demo && !email) throw new Error('Multiple/no accounts registered: use --account email, or gmail-doctor scan --all.');
  if (!demo && !list.includes(email)) throw new Error('Account not registered: '+email);
  if (!demo) console.log('Account:',email);
  const api = demo ? async ()=>{throw new Error('Demo forbids API writes');} : gmailApi(await accessToken(email));
  const result = await report(api,args.includes('--json') && command==='scan');
  if (command!=='repair') return;
  if (result.errors.length) throw new Error('Partial scan: repair disabled until all settings read successfully.');
  if (!result.actions.length) { console.log('No automated repairs proposed.'); return; }
  if (demo) { console.log('Demo mode: no changes can be made.'); return; }
  if (args.includes('--dry-run')) { console.log('Dry run: no changes made. Proposed:',result.actions); return; }
  console.log('\nOnly individual, explicitly confirmed repairs will run.');
  const backup = await saveBackup(result.settings, email);
  console.log('Settings backup saved locally:',backup);
  const rl = createInterface({input:stdin,output:stdout});
  try {
    for (const action of result.actions) {
      const answer = (await rl.question('Apply: '+action.label+'? Type YES to confirm: ')).trim();
      if (answer !== 'YES') { console.log('Skipped'); continue; }
      await applyAction(api,action);
      console.log('Applied:',action.label);
    }
  } finally { rl.close(); }
  const verification = await readSettings(api);
  const after = assess(verification.settings);
  console.log('Post-repair remaining flagged findings:',after.findings.filter(x=>x.severity==='warning').length);
  if (verification.errors.length) console.log('Post-repair scan incomplete:',verification.errors.join('; '));
  console.log('Secure your Google account separately: https://myaccount.google.com/security-checkup');
}
main().catch(e=>{console.error('Error:',e.message); process.exitCode=1;});
