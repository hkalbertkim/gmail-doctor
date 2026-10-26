import React, {useState,useEffect,useRef} from 'react';
import {render,Box,Text,useInput,useApp,useStdout} from 'ink';

export const commandNames=['/scan','/accounts','/security','/review','/help','/quit'];
export function parseCommand(value) {
 const [cmd,...rest]=value.trim().split(/\s+/);
 return {cmd:cmd||'/help',args:rest};
}
export function panelState(rows=[],step='Ready') {
 return {accounts:rows.length,warnings:rows.reduce((n,r)=>n+(r.warnings||0),0),incomplete:rows.filter(r=>r.error||r.unchecked).length,step};
}
export async function launchCommandUi({getAccounts,scanAccount,checkBaseline}) {
 if(!process.stdin.isTTY||!process.stdout.isTTY) throw new Error('The dashboard requires an interactive terminal.');
 const e=React.createElement;
 function App(){
  const {exit}=useApp();
  const {stdout}=useStdout();
  const width=Math.min(80,Math.max(42,(stdout.columns||80)-2));
  const [command,setCommand]=useState('');
  const commandRef=useRef('');
  const updateCommand=value=>{commandRef.current=value;setCommand(value);};
  const [running,setRunning]=useState(false);
  const [step,setStep]=useState('Connecting accounts');
  const [accounts,setAccounts]=useState([]);
  const [rows,setRows]=useState([]);
  const [messages,setMessages]=useState(['Starting read-only account scan...']);
  const add=msg=>setMessages(old=>[...old,String(msg)].slice(-14));
  async function scan(){
   setRunning(true);
   try {
    const list=await getAccounts();
    setAccounts(list);
    if(!list.length){setStep('No accounts configured');add('Use gmail-doctor account add to connect a Google account.');return;}
    const next=[];
    for(let i=0;i<list.length;i++){
     const email=list[i];
     setStep('Scanning '+(i+1)+'/'+list.length+' · '+email);
     try{
      const data=await scanAccount(email);
      const baseline=await checkBaseline(email,data.settings);
      const item={email,warnings:data.findings.filter(x=>x.severity==='warning').length,unchecked:data.errors.length,baseline};
      next.push(item);
      add(email+': '+item.warnings+' warning(s), '+item.unchecked+' incomplete; baseline '+(baseline?(baseline.changed?'changed':'unchanged'):'not set'));
     }catch(err){
      next.push({email,error:true,warnings:0});
      add(email+': scan incomplete ('+err.message+')');
     }
     setRows([...next]);
    }
    setStep('Automated scan complete · Google account checks NOT VERIFIED');
    add('2FA, sessions, recovery methods and app access require review on Google.');
   } finally {setRunning(false);}
  }
  useEffect(()=>{scan();},[]);
  useInput((key,k)=>{
   if(k.escape){updateCommand('');return;}
   if(k.return){
    const {cmd,args}=parseCommand(commandRef.current);updateCommand('');
    if(running)return;
    if(cmd==='/quit'||cmd==='/exit'){exit();return;}
    if(cmd==='/scan'){scan();return;}
    if(cmd==='/accounts'){add(accounts.length?accounts.join(' · '):'No accounts connected.');return;}
    if(cmd==='/security'){
      add('NOT VERIFIED: 2FA, devices, recovery, app permissions.');
      add('Google: https://myaccount.google.com/security-checkup');
      add('2FA: https://myaccount.google.com/signinoptions/two-step-verification');
      return;
    }
    if(cmd==='/review'){add('To review and approve filter deletion, exit and run gmail-doctor repair --account EMAIL. No changes made.');return;}
    if(cmd==='/help'){add('Commands: '+commandNames.join('  '));return;}
    add('Unknown command. Type /help.');
    return;
   }
   if(k.backspace||k.delete){updateCommand(commandRef.current.slice(0,-1));return;}
   if(!k.ctrl&&!k.meta&&key&&key.length===1)updateCommand(commandRef.current.length<120?commandRef.current+key:commandRef.current);
  });
  const p=panelState(rows,step);
  return e(Box,{flexDirection:'column',width},
   e(Box,{borderStyle:'round',borderColor:'cyan',paddingX:1,flexDirection:'column'},
    e(Text,{bold:true,color:'cyan'},'◈ GMAIL DOCTOR  ·  SECURITY CENTER'),
    e(Text,null,'Accounts ',p.accounts,'   Warnings ',p.warnings,'   Incomplete ',p.incomplete),
    e(Text,{color:running?'yellow':'green'},step)),
   e(Box,{borderStyle:'round',borderColor:'gray',paddingX:1,flexDirection:'column',height:Math.max(10,Math.min(23,(stdout.rows||30)-11))},
    e(Text,{bold:true,color:'cyan'},'RESULTS · '+(running?'SCANNING':'READY')),
    ...rows.map(row=>e(Text,{key:row.email,color:row.error?'red':row.warnings?'yellow':'green'},row.email+'  '+(row.error?'SCAN FAILED':row.warnings+' warning(s)'+(row.unchecked?' · INCOMPLETE':'')))),
    e(Text,{color:'gray'},'────────── Activity ──────────'),
    ...messages.slice(-Math.max(3,Math.min(10,(stdout.rows||30)-18))).map((x,i)=>e(Text,{key:i,wrap:'truncate-end'},x))),
   e(Box,{borderStyle:'round',borderColor:'cyan',paddingX:1},
    e(Text,{color:'green'},'› '),e(Text,null,command||'Type /help or /scan ...')),
   e(Text,{color:'gray'},'/scan   /accounts   /security   /review   /help   /quit'),
   e(Text,{color:'yellow'},'Google login sessions and 2FA cannot be verified by Gmail API.'));
 }
 const instance=render(e(App));
 await instance.waitUntilExit();
}
