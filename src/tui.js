import { select, checkbox, input } from '@inquirer/prompts';
import { assess, readSettings, applyAction } from './core.js';
import { renderReport, formatFinding } from './presentation.js';
import { logo, layout } from './theme.js';
import { steps, renderReview } from './takeover.js';
import { spawn } from 'node:child_process';

const line = '─'.repeat(54);
export function dashboard(rows=[]) {
  const warnings=rows.reduce((n,r)=>n+(r.warnings||0),0);
  const unchecked=rows.filter(r=>r.error||r.unchecked).length;
  const head=[logo({color:process.stdout.isTTY&&!process.env.NO_COLOR}),line,
    'SECURITY COMMAND CENTER',
    `  ACCOUNTS ${rows.length}    WARNINGS ${warnings}    INCOMPLETE ${unchecked}`,line,
    'CONNECTED ACCOUNTS'];
  if(!rows.length) head.push('  No Gmail accounts connected');
  for(const r of rows) head.push(`  ${r.email.padEnd(32)} ${r.error?'ERROR':r.unchecked?'INCOMPLETE':r.warnings? r.warnings+' WARNING(S)':'NO FLAGGED SETTINGS'}`);
  head.push(line,'Note: Gmail settings scan does not prove account security.');
  return head.join('\n');
}
export async function launchTui({getAccounts, addAccount, scanAccount, saveBackup, provider, demo=false, startWithTakeover=false}) {
  if(!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Interactive mode requires a terminal. Use gmail-doctor scan --all for scripts.');
  const results=new Map();
  const chooseAccount=async()=> {
    const list=await getAccounts();
    if(!list.length) return null;
    return select({message:'Choose Gmail account',choices:list.map(value=>({name:value,value}))});
  };
  const inspect=async email=>{
    const data=await scanAccount(email);
    results.set(email,data);
    console.log(layout(renderReport({email,findings:data.findings,errors:data.errors,demo}),{color:!process.env.NO_COLOR}));
    return data;
  };
  const takeover=async()=>{
    const account=await chooseAccount();
    if(!account) {console.log('Add an account first.');return;}
    const review={};
    console.log('Account: '+account+' — Google security review is manual. Gmail Doctor cannot certify account safety.');
    for(const step of steps) {
      console.log('\n'+step.title+'\n'+step.help+'\n'+step.url);
      const action=await select({message:'What would you like to do?',choices:[
        {name:'Open official Google page',value:'open'},
        {name:step.id==='twoStep'?'Confirmed 2-Step Verification is enabled':'Mark as reviewed (no suspicious activity noticed)',value:'reviewed'},
        {name:step.id==='twoStep'?'2-Step Verification is OFF / I need help':'Report suspicious activity',value:'suspicious'},
        {name:'Skip (not checked)',value:'skip'},
        {name:'Finish review',value:'finish'}
      ]});
      if(action==='finish')break;
      if(action==='open') {
        const opener=process.platform==='darwin'?'open':'xdg-open';
        const child=spawn(opener,[step.url],{stdio:'ignore'});
        child.on('error',()=>console.log('Open manually: '+step.url));
        const verdict=await select({message:'After reviewing Google, record your observation',choices:[
          {name:step.id==='twoStep'?'I checked Google and 2-Step Verification is ON':'Reviewed; no suspicious activity noticed',value:'reviewed'},
          {name:step.id==='twoStep'?'2-Step Verification is OFF / setup not complete':'Suspicious activity noticed',value:'suspicious'},
          {name:'Not checked',value:'skip'}
        ]});
        if(verdict!=='skip')review[step.id]=verdict;
      } else if(action!=='skip')review[step.id]=action;
    }
    console.log('\n'+renderReview(review));
    if(review.twoStep!=='reviewed') console.log('ACTION: Verify and enable 2-Step Verification at https://myaccount.google.com/signinoptions/two-step-verification');
    console.log('No Google account security settings were changed by Gmail Doctor.');
  };
  const review=async()=>{
    const email=await chooseAccount();
    if(!email) { console.log('Add an account first.'); return; }
    const data=await inspect(email);
    if(data.errors.length) { console.log('Incomplete scan: repairs disabled.'); return; }
    const available=data.actions.filter(a=>a.kind==='delete-filter');
    if(!available.length) {console.log('No supported automated repairs for this account.');return;}
    const selected=await checkbox({message:'Select filters to review for deletion (nothing is changed yet)',choices:available.map((a,i)=>({
      value:a.id, name: formatFinding(data.findings.find(f=>f.id==='filter:'+a.id)||{severity:'review',detail:a.label,id:''},i+1).replaceAll('\n','  '), checked:false
    }))});
    if(!selected.length) { console.log('No changes selected.'); return; }
    const chosen=available.filter(a=>selected.includes(a.id));
    console.log('\nREPAIR PLAN — '+email);
    for(const a of chosen) console.log('  - '+formatFinding(data.findings.find(f=>f.id==='filter:'+a.id),1).replaceAll('\n',' '));
    console.log('Settings will be backed up locally before any changes.');
    const confirmation=await input({message:'Type REPAIR to approve these exact changes (anything else cancels)'});
    if(confirmation!=='REPAIR') { console.log('Cancelled. No changes made.'); return; }
    const current=await scanAccount(email);
    if(current.errors.length || chosen.some(a=>{
      const original=data.settings.filters?.find(f=>f.id===a.id);
      const latest=current.settings.filters?.find(f=>f.id===a.id);
      return !original || !latest || JSON.stringify(original)!==JSON.stringify(latest);
    })) {
      console.log('Settings changed or scan incomplete. No repairs made; rescan and review again.');
      return;
    }
    const path=await saveBackup(current.settings,email);
    console.log('Backup:',path);
    const api=await provider(email);
    for(const action of chosen) {
      await applyAction(api,action);
      console.log('Removed selected filter.');
    }
    const after=await inspect(email);
    console.log(`Verified: ${after.findings.filter(x=>x.severity==='warning').length} warning(s) remaining. Check account security separately.`);
  };
  if (startWithTakeover) { await takeover(); return; }
  while(true) {
    const list=await getAccounts();
    console.log('\n'+dashboard(list.map(email=>({email,...(results.get(email)||{})}))));
    const choice=await select({message:'Select action',choices:[
      {name:'Account Takeover Check — guided Google security review',value:'takeover'},
      {name:'Scan all accounts',value:'scan'},
      {name:'Review findings / repair selected filters',value:'review'},
      {name:'Add Google account',value:'add'},
      {name:'Exit',value:'exit'}
    ]});
    if(choice==='exit') break;
    if(choice==='add') {await addAccount();continue;}
    if(choice==='takeover') {await takeover();continue;}
    if(choice==='review') {await review();continue;}
    if(choice==='scan') {
      if(!list.length) { console.log('No accounts connected. Choose Add Google account first.'); continue; }
      for(const email of list) {
        try {await inspect(email);}
        catch(e) {console.log('Scan incomplete for '+email+': '+e.message);results.set(email,{error:e.message});}
      }
    }
  }
}
