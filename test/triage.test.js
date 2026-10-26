import {test} from 'node:test';
import assert from 'node:assert/strict';
import {triageText,scenarios} from '../src/triage.js';
test('triage guide has actionable situations and verified official paths',()=>{
 assert.equal(scenarios.length,5);
 const t=triageText();
 assert.match(t,/cannot bypass 2FA/i);
 assert.match(t,/accounts.google.com\/signin\/recovery/);
 assert.match(t,/myaccount.google.com\/security-checkup/);
 assert.match(t,/No Gmail settings are changed/);
});
