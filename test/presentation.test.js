import test from 'node:test';
import assert from 'node:assert/strict';
import {renderReport,renderSummary} from '../src/presentation.js';
test('filter display is readable and hides internal Gmail filter id',()=>{
  const s=renderReport({email:'someone@example.com',findings:[{id:'filter:long-opaque-1234',severity:'warning',detail:'Filter long-opaque-1234: forwards to sample@example.net; matching {"from":"*@steampowered.com"}'}],errors:[]});
  assert.match(s,/Matches: from=\*@steampowered.com/);
  assert.match(s,/Forward to sample@example.net/);
  assert.doesNotMatch(s,/long-opaque-1234/);
});
test('scan reports incomplete checks without suggesting clean account',()=>{
  const s=renderReport({email:'x@example.com',findings:[],errors:['filters: HTTP 403']});
  assert.match(s,/INCOMPLETE/);
  assert.match(s,/filters: HTTP 403/);
});
test('multi account summary uses table not JSON',()=>{
 const s=renderSummary([{email:'one@gmail.com',warnings:3,unchecked:0},{email:'two@gmail.com',error:'timeout'}]);
 assert.match(s,/one@gmail.com/);
 assert.match(s,/ERROR/);
 assert.doesNotMatch(s,/"email":/);
});
