import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCommand,panelState,commandNames} from '../src/command-ui.js';
test('parse command input',()=>assert.deepEqual(parseCommand('/scan'),{cmd:'/scan',args:[]}));
test('empty command shows help',()=>assert.equal(parseCommand('').cmd,'/help'));
test('summary counts errors without interpreting unverified Google security as safe',()=>{
 const s=panelState([{email:'a',warnings:3,unchecked:0},{email:'b',error:true}]);
 assert.equal(s.warnings,3);assert.equal(s.incomplete,1);
});
test('repair is never a direct command',()=>assert.equal(commandNames.includes('/repair'),false));
