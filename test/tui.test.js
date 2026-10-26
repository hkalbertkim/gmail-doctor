import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboard} from '../src/tui.js';
test('dashboard shows count and warning without credentials',()=>{
 const output=dashboard([{email:'test@example.com',warnings:3,unchecked:0},{email:'other@example.com',unchecked:1}]);
 assert.match(output,/ACCOUNTS 2/);
 assert.match(output,/WARNINGS 3/);
 assert.match(output,/INCOMPLETE 1/);
 assert.match(output,/test@example.com/);
});
