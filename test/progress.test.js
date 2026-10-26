import test from 'node:test';
import assert from 'node:assert/strict';
import { progress } from '../src/progress.js';
test('startup announces all three stages',()=>{
  const s=progress('start',0,3);
  assert.match(s,/\[1\/3\]/);
  assert.match(s,/\[2\/3\]/);
  assert.match(s,/\[3\/3\]/);
});
test('scanning identifies current account and index',()=>{
 assert.match(progress('scanning',1,3,'test@example.com'),/SCANNING 2\/3 · test@example.com/);
});
test('manual Google checks never appear as verified',()=>{
 assert.match(progress('manual',2,2),/NOT VERIFIED/);
});
