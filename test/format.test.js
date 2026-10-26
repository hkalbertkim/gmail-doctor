import test from 'node:test';
import assert from 'node:assert/strict';
import {wrapText,displayWidth} from '../src/format.js';
test('long 2FA help wraps to bounded width',()=>{
 const s=wrapText('Check Google security. If disabled, enable two-step authentication using official account settings.',48);
 assert.ok(s.split('\n').every(line=>displayWidth(line)<=48));
 assert.ok(s.includes('\n'));
});
test('keeps intentional line breaks',()=>{
 assert.equal(wrapText('First step\nSecond step',48),'First step\nSecond step');
});
test('long URL tokens are broken',()=>{
 const s=wrapText('https://myaccount.google.com/signinoptions/two-step-verification',42);
 assert.ok(s.split('\n').every(l=>displayWidth(l)<=42));
});
