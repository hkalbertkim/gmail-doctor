import React,{useState,useEffect,useRef} from 'react';
import {render,Box,Text,Static,useInput,useApp} from 'ink';
import {spawn} from 'node:child_process';

export const commandNames=['/scan','/accounts','/security','/2fa','/review','/help','/quit'];
export function parseCommand(value) {
 const [cmd,...args]=value.trim().split(/\s+/);
 return {cmd:cmd||'/help',args};
}
export function panelState(rows=[],step='Ready') {
 return {accounts:rows.length,warnings:rows.reduce((n,r)=>n+(r.warnings||0),0),incomplete:rows.filter(r=>r.error||r.unchecked).length,step};
}
export const GOOGLE_SECURITY='https://myaccount.google.com/security-checkup';
export const GOOGLE_2FA='https://myaccount.google.com/signinoptions/two-step-verification';
export function openVerifiedGooglePage(url,{platform=process.platform,spawnProcess=spawn}={}) {
 if(![GOOGLE_SECURITY,GOOGLE_2FA].includes(url))throw new Error('Unapproved external URL');
 const command=platform==='darwin'?'open':platform==='win32'?'cmd':'xdg-open';
 const args=platform==='win32'?['/c','start','',url]:[url];
 const child=spawnProcess(command,args,{stdio:'ignore'});
 child.on?.('error',()=>{});
 child.unref?.();
 return url;
}
export async function launchCommandUi({getAccounts,scanAccount,checkBaseline}) {
 if(!process.stdin.isTTY||!process.stdout.isTTY)throw new Error('Interactive terminal required.');
 const e=React.createElement;
 function App(){
  const {exit}=useApp();
  const [history,setHistory]=useState([]);
  const nextId=useRef(0);
  const [command,setCommand]=useState('');
  const commandRef=useRef('');
  const [running,setRunning]=useState(false);
  const [accounts,setAccounts]=useState([]);
  const [rows,setRows]=useState([]);
  const [status,setStatus]=useState('Starting scan');
  const runningRef=useRef(false);
  const push=(text,color='white')=>setHistory(items=>[...items,{id:nextId.current++,text,color}]);
  const updateCommand=text=>{commandRef.current=text;setCommand(text);};
  async function scan(){
   if(runningRef.current)return;
   runningRef.current=true;setRunning(true);
   push('','gray');push('◆ Gmail settings scan','cyan');
   try{
    const list=await getAccounts();setAccounts(list);
    if(!list.length){push('No accounts connected. Run: gmail-doctor account add','yellow');setStatus('No accounts');return;}
    const next=[];
    for(let i=0;i<list.length;i++){
     const email=list[i];setStatus('Scanning '+(i+1)+'/'+list.length+' · '+email);
     try{
      const data=await scanAccount(email);
      const baseline=await checkBaseline(email,data.settings);
      const item={email,warnings:data.findings.filter(f=>f.severity==='warning').length,unchecked:data.errors.length,baseline};
      next.push(item);
      push('✓ '+email+' · '+item.warnings+' warning(s), '+item.unchecked+' incomplete',item.warnings?'yellow':'green');
      if(baseline?.changed)push('  Trusted baseline changed','yellow');
     }catch(err){next.push({email,error:true});push('✗ '+email+': '+err.message,'red');}
     setRows([...next]);
    }
    push('✓ Gmail settings scan completed','green');
    push('! 2FA, devices, recovery and third-party access: NOT VERIFIED','yellow');
    push('  Use /security to open Google Security Checkup','cyan');
    setStatus('Scan complete · Google review pending');
   }catch(err){push('Scan failed: '+err.message,'red');setStatus('Scan failed');}
   finally{runningRef.current=false;setRunning(false);}
  }
  useEffect(()=>{scan();},[]);
  useInput((key,k)=>{
   if(k.escape){updateCommand('');return;}
   if(k.return){
    const {cmd}=parseCommand(commandRef.current);updateCommand('');
    if(runningRef.current)return;
    if(cmd==='/quit'||cmd==='/exit'){exit();return;}
    if(cmd==='/scan'){scan();return;}
    if(cmd==='/accounts'){push('');push('CONNECTED ACCOUNTS','cyan');accounts.forEach(x=>push('• '+x,'cyan'));return;}
    if(cmd==='/security'||cmd==='/2fa'){
      const url=cmd==='/security'?GOOGLE_SECURITY:GOOGLE_2FA;
      push('');push(cmd==='/security'?'GOOGLE SECURITY CHECKUP':'TWO-STEP VERIFICATION','cyan');
      push('Opening Google in your browser. Confirm the correct account.','yellow');
      push(url,'cyan');
      try{openVerifiedGooglePage(url);}catch(error){push('Could not open browser: '+error.message,'red');}
      return;
    }
    if(cmd==='/review'){push('');push('FILTER REVIEW','cyan');push('Run: gmail-doctor repair --account EMAIL','yellow');push('No Gmail settings changed.');return;}
    if(cmd==='/help'){push('');push('COMMANDS','cyan');push(commandNames.join('   '),'cyan');return;}
    push('Unknown command. Type /help.','yellow');
    return;
   }
   if(k.backspace||k.delete){updateCommand(commandRef.current.slice(0,-1));return;}
   if(!k.ctrl&&!k.meta&&key?.length===1)updateCommand((commandRef.current+key).slice(0,200));
  });
  const totals=panelState(rows,status);
  return e(Box,{flexDirection:'column'},
   e(Static,{items:history},item=>e(Box,{key:item.id,paddingX:1},e(Text,{color:item.color},item.text||' '))),
   e(Box,{flexDirection:'column',marginTop:1},
    e(Text,{color:'cyan',bold:true},'◆ Gmail Doctor'),
    e(Text,{color:'gray'},'Accounts ',totals.accounts,' · Warnings ',totals.warnings,' · Incomplete ',totals.incomplete),
    e(Text,{color:running?'yellow':'green'},status),
    e(Text,{color:'gray'},'──────────────────────────────────────────────────'),
    e(Box,null,e(Text,{color:'green'},'› '),e(Text,null,command||'Type /help, /security or /scan ...')),
    e(Text,{color:'gray'},'──────────────────────────────────────────────────'),
    e(Text,{color:'gray'},'/scan  /accounts  /security  /2fa  /review  /help  /quit')));
 }
 const instance=render(e(App),{exitOnCtrlC:true});
 await instance.waitUntilExit();
}
