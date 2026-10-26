import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCommand,panelState,commandNames,scrollWindow,mouseScrollDirection} from '../src/command-ui.js';
test('parse command input',()=>assert.deepEqual(parseCommand('/scan'),{cmd:'/scan',args:[]}));
test('empty command shows help',()=>assert.equal(parseCommand('').cmd,'/help'));
test('summary counts errors without interpreting unverified Google security as safe',()=>{
 const s=panelState([{email:'a',warnings:3,unchecked:0},{email:'b',error:true}]);
 assert.equal(s.warnings,3);assert.equal(s.incomplete,1);
});
test('repair is never a direct command',()=>assert.equal(commandNames.includes('/repair'),false));

test('scroll window clamps offsets and moves only the result items',()=>{
 const values=Array.from({length:80},(_,i)=>i);
 assert.deepEqual(scrollWindow(values,10,30).items,[30,31,32,33,34,35,36,37,38,39]);
 assert.equal(scrollWindow(values,10,1000).start,70);
});

test('xterm SGR wheel events scroll the result pane',()=>{
 assert.equal(mouseScrollDirection('\x1b[<64;10;8M'),-1);
 assert.equal(mouseScrollDirection('\x1b[<65;10;8M'),1);
 assert.equal(mouseScrollDirection('ordinary input'),0);
});
