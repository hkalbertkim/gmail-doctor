import test from 'node:test';
import assert from 'node:assert/strict';
import {fingerprint,captureBaseline,compareBaseline} from '../src/baseline.js';
test('same rule with different Gmail ID is trusted',()=>{
 const a={id:'a',criteria:{from:'x'},action:{forward:'z@example.com'}};
 const b={id:'b',criteria:{from:'x'},action:{forward:'z@example.com'}};
 assert.equal(fingerprint(a),fingerprint(b));
 assert.equal(compareBaseline(captureBaseline({filters:[a]}),{filters:[b]}).changed,false);
});
test('forwarding target mutation is detected',()=>{
 const a={id:'a',criteria:{from:'x'},action:{forward:'old@example.com'}};
 const b={id:'a',criteria:{from:'x'},action:{forward:'new@example.com'}};
 const delta=compareBaseline(captureBaseline({filters:[a]}),{filters:[b]});
 assert.equal(delta.added.length,1);assert.equal(delta.removed.length,1);
});
test('added filter is detected',()=>{
 const d=compareBaseline(captureBaseline({filters:[]}),{filters:[{criteria:{subject:'security'},action:{addLabelIds:['TRASH']}}]});
 assert.equal(d.added.length,1);
});
