import test from 'node:test';
import assert from 'node:assert/strict';
import {logo,layout} from '../src/theme.js';
test('theme color can be disabled',()=>{
 assert.doesNotMatch(logo({color:false}),/\x1b\[/);
 assert.doesNotMatch(layout('Status   REVIEW NEEDED',{color:false}),/\x1b\[/);
});
test('warning highlighted',()=>assert.match(layout('  1. [WARNING] Mail filter',{color:true}),/\x1b\[33m/));
