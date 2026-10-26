import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,applyAction,readSettings} from '../src/core.js';
test('flags forwarding and destructive filter and proposes only supported repair actions',()=>{
 const v=assess({autoForwarding:{enabled:true,emailAddress:'a@b.com'},filters:[{id:'x',criteria:{from:'google.com'},action:{addLabelIds:['TRASH']}}],sendAs:[{isPrimary:false,sendAsEmail:'alias@example.com'}]});
 assert.equal(v.actions.length,1);
 assert.deepEqual(v.actions.map(x=>x.kind),['delete-filter']);
 assert.equal(v.findings.filter(x=>x.severity==='warning').length,2);
});
test('does not flag harmless labels as malicious',()=>assert.equal(assess({filters:[{id:'a',action:{addLabelIds:['STARRED']}}]}).actions.length,0));
test('delete filter uses encoded ID',async()=>{
 const calls=[]; await applyAction(async(...v)=>{calls.push(v);return{}},{kind:'delete-filter',id:'a/b'});
 assert.deepEqual(calls[0],['DELETE','settings/filters/a%2Fb']);
});
test('forwarding is manual only for consumer accounts',()=>{
 const v=assess({autoForwarding:{enabled:true,emailAddress:'x@y.com'}});
 assert.equal(v.actions.length,0);
 assert.equal(v.findings[0].severity,'warning');
});
test('partial scan tracks errors',async()=>{
 const r=await readSettings(async(_method,p)=>{if(p==='settings/pop')throw new Error('403');return{};});
 assert.equal(r.errors.length,1);assert.ok(r.errors[0].includes('pop'));
});
