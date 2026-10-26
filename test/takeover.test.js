import test from 'node:test';
import assert from 'node:assert/strict';
import {steps,summary,renderReview} from '../src/takeover.js';
test('2FA must be explicitly user reviewed and is first',()=>{
 assert.equal(steps[0].id,'twoStep');
 assert.match(steps[0].url,/two-step-verification/);
 assert.equal(summary({}).notChecked,steps.length);
});
test('no account security check can be auto-marked safe',()=>{
 assert.equal(summary({}).notChecked,steps.length);
 assert.match(renderReview({}),/not independently verified/);
 assert.match(renderReview({}),/NOT CHECKED/);
});
test('manual reported concerns remain concerns',()=>{
 const r=summary({activity:'suspicious',devices:'reviewed'});
 assert.equal(r.flagged,1);assert.equal(r.reviewed,1);assert.equal(r.notChecked,steps.length-2);
});
test('only known official Google URLs are used',()=>{
 assert.ok(steps.every(x=>x.url.startsWith('https://myaccount.google.com/')));
});
