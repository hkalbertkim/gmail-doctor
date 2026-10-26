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
export function mouseScrollDirection(chunk) {
 const input=String(chunk);
 const events=[...input.matchAll(/\[<([0-9]+);[0-9]+;[0-9]+[Mm]/g)];
 if(!events.length)return 0;
 const code=Number(events[events.length-1][1]);
 return (code & 64) ? ((code & 1) ? 1 : -1) : 0;
}
export function scrollWindow(items, pageSize, offset=0) {
 const size=Math.max(1,Math.floor(pageSize));
 const max=Math.max(0,items.length-size);
 const start=Math.max(0,Math.min(max,offset));
 return {items:items.slice(start,start+size),start,max};
}
export async function launchCommandUi({getAccounts,scanAccount,checkBaseline}) {
 if(!process.stdin.isTTY||!process.stdout.isTTY) throw new Error('The dashboard requires an interactive terminal.');
 const e=React.createElement;
 function App(){
  const {exit}=useApp();
  const {stdout}=useStdout();
  const width=Math.max(42,(stdout.columns||80)-2);
  const height=Math.max(16,(stdout.rows||30)-1);
  const contentHeight=Math.max(4,height-13);
  const [command,setCommand]=useState('');
  const commandRef=useRef('');
  const updateCommand=value=>{commandRef.current=value;setCommand(value);};
  const [running,setRunning]=useState(false);
  const [step,setStep]=useState('Connecting accounts');
  const [accounts,setAccounts]=useState([]);
  const [rows,setRows]=useState([]);
  const [messages,setMessages]=useState([]);
  const [scroll,setScroll]=useState(null);
  const add=(text,color='white')=>setMessages(old=>[...old,{text:String(text),color}].slice(-100));
  const section=(title)=>{add('');add('━━ '+title+' ━━','cyan');};
  async function scan(){
   setRunning(true);
   section('GMAIL SCAN');
   add('Starting read-only scan…','gray');
   try {
    const list=await getAccounts();
    setAccounts(list);
    if(!list.length){setStep('No accounts configured');add('Use gmail-doctor account add to connect a Google account.','yellow');return;}
    const next=[];
    for(let i=0;i<list.length;i++){
     const email=list[i];
     setStep('Scanning '+(i+1)+'/'+list.length+' · '+email);
     try{
      const data=await scanAccount(email);
      const baseline=await checkBaseline(email,data.settings);
      const item={email,warnings:data.findings.filter(x=>x.severity==='warning').length,unchecked:data.errors.length,baseline};
      next.push(item);
      add('✓ '+email,'green');
      add('   '+item.warnings+' warning(s) · '+item.unchecked+' incomplete · baseline '+(baseline?(baseline.changed?'changed':'unchanged'):'not set'),item.warnings?'yellow':'gray');
     }catch(err){
      next.push({email,error:true,warnings:0});
      add('✗ '+email+': scan incomplete ('+err.message+')','red');
     }
     setRows([...next]);
    }
    setStep('Automated scan complete · Google account checks NOT VERIFIED');
    add('✓ Gmail settings scan complete','green');
    add('! Google account checks NOT VERIFIED: 2FA, sessions, recovery and apps.','yellow');
   } finally {setRunning(false);}
  }
  useEffect(()=>{scan();},[]);
  const entries=[
    ...rows.map(row=>({text:row.email+'  '+(row.error?'SCAN FAILED':row.warnings+' warning(s)'+(row.unchecked?' · INCOMPLETE':'')),color:row.error?'red':row.warnings?'yellow':'green'})),
    {text:'────────── Activity ──────────',color:'gray'},
    ...messages
  ];
  const available=contentHeight-3;
  const maxScroll=Math.max(0,entries.length-available);
  const offset=scroll===null?maxScroll:Math.min(scroll,maxScroll);
  const visible=scrollWindow(entries,available,offset);
  useEffect(()=>{
    const handler=chunk=>{
      const direction=mouseScrollDirection(chunk);
      if(direction) setScroll(old=>Math.max(0,Math.min(maxScroll,(old===null?maxScroll:old)+direction*3)));
    };
    process.stdin.on('data',handler);
    return ()=>process.stdin.off('data',handler);
  },[maxScroll]);
  useInput((key,k)=> {
   if(k.pageUp || key==='[5~'){setScroll(current=>Math.max(0,(current===null?maxScroll:current)-Math.max(1,available-2)));return;}
   if(k.pageDown || key==='[6~'){setScroll(current=>Math.min(maxScroll,(current===null?maxScroll:current)+Math.max(1,available-2)));return;}
   if(k.upArrow && commandRef.current===''){setScroll(current=>Math.max(0,(current===null?maxScroll:current)-1));return;}
   if(k.downArrow && commandRef.current===''){setScroll(current=>Math.min(maxScroll,(current===null?maxScroll:current)+1));return;}
   if(k.escape){updateCommand('');return;}
   if(k.return){
    const {cmd,args}=parseCommand(commandRef.current);updateCommand('');
    if(running)return;
    if(cmd==='/quit'||cmd==='/exit'){exit();return;}
    if(cmd==='/scan'){scan();return;}
    if(cmd==='/accounts'){section('CONNECTED ACCOUNTS');for(const name of accounts)add('• '+name,'cyan');if(!accounts.length)add('No accounts connected.','yellow');return;}
    if(cmd==='/security'){
      section('GOOGLE SECURITY REVIEW');
      add('! NOT VERIFIED: 2FA, devices, recovery and app permissions.','yellow');
      add('Google Security Checkup:','gray');
      add('  https://myaccount.google.com/security-checkup','cyan');
      add('Two-Step Verification:','gray');
      add('  https://myaccount.google.com/signinoptions/two-step-verification','cyan');
      return;
    }
    if(cmd==='/review'){section('FILTER REVIEW');add('No changes made. To review removals run:','yellow');add('  gmail-doctor repair --account EMAIL','cyan');return;}
    if(cmd==='/help'){section('COMMANDS');add('/scan · /accounts · /security · /review · /help · /quit','cyan');return;}
    add('Unknown command. Type /help.','yellow');
    return;
   }
   if(k.backspace||k.delete){updateCommand(commandRef.current.slice(0,-1));return;}
   if(!k.ctrl&&!k.meta&&key&&key.length===1)updateCommand(commandRef.current.length<120?commandRef.current+key:commandRef.current);
  });
  const p=panelState(rows,step);
  return e(Box,{flexDirection:'column',width,height,overflowY:'hidden'},
   e(Box,{flexDirection:'column',flexShrink:0,paddingX:1},
    e(Text,{bold:true,color:'cyan'},'◆ Gmail Doctor'),
    e(Text,{color:'gray'},'Accounts ',p.accounts,'  ·  Warnings ',p.warnings,'  ·  Incomplete ',p.incomplete),
    e(Text,{color:running?'yellow':'green',wrap:'truncate-end'},step)),
   e(Box,{height:1,flexShrink:0}),
   e(Box,{flexDirection:'column',height:contentHeight+2,overflowY:'hidden',flexShrink:0,paddingX:1},
    e(Text,{bold:true,color:'gray'},(running?'Scanning':'Results')+(maxScroll?('  ·  '+(offset+1)+'–'+Math.min(entries.length,offset+available)+'/'+entries.length):'')),
    ...visible.items.map((item,i)=>e(Text,{key:offset+i,color:item.color,wrap:'truncate-end'},item.text))),
   e(Box,{flexGrow:1,minHeight:0}),
   e(Text,{color:'gray'},'─'.repeat(Math.max(1,width-1))),
   e(Box,{paddingX:1,flexShrink:0},
    e(Text,{color:'green'},'› '),e(Text,{wrap:'truncate-end'},command||'Type /help or /scan ...')),
   e(Text,{color:'gray'},'─'.repeat(Math.max(1,width-1))),
   e(Text,{color:'gray',wrap:'truncate-end'},'  /scan  /accounts  /security  /review  /help  /quit   ·   ↑↓ / wheel scroll'),
   e(Text,{color:'yellow',wrap:'truncate-end'},'  2FA, sessions, recovery: NOT VERIFIED · Review directly with Google'));


 }
 const alt=process.stdout.isTTY && process.env.TERM!=='dumb';
 if(alt)process.stdout.write('\x1b[?1049h\x1b[H\x1b[?1000h\x1b[?1006h');
 try {
  const instance=render(e(App),{exitOnCtrlC:true});
  await instance.waitUntilExit();
 } finally {
  if(alt)process.stdout.write('\x1b[?1006l\x1b[?1000l\x1b[?1049l');
 }
}
