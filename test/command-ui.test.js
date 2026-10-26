import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCommand,panelState,commandNames,openVerifiedGooglePage,GOOGLE_SECURITY,GOOGLE_2FA} from '../src/command-ui.js';
test('parse commands',()=>assert.equal(parseCommand('/scan').cmd,'/scan'));
test('panel counts',()=>assert.equal(panelState([{warnings:2},{error:true}]).incomplete,1));
test('browser opens only official Google URLs',()=>{
 const calls=[];
 const fake=(cmd,args)=>{calls.push([cmd,args]);return {on(){},unref(){}};};
 openVerifiedGooglePage(GOOGLE_SECURITY,{platform:'darwin',spawnProcess:fake});
 openVerifiedGooglePage(GOOGLE_2FA,{platform:'darwin',spawnProcess:fake});
 assert.deepEqual(calls.map(x=>x[0]),['open','open']);
 assert.throws(()=>openVerifiedGooglePage('https://evil.example',{platform:'darwin',spawnProcess:fake}));
});
test('no automatic repair command',()=>assert.equal(commandNames.includes('/repair'),false));
