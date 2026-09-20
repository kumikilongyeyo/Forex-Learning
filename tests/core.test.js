import test from 'node:test';import assert from 'node:assert/strict';
import { pipSize,pipsBetween,riskAmount,riskReward,ema,rsi,evaluateBracket } from '../src/core.js';

test('pip sizes handle JPY convention',()=>{assert.equal(pipSize('USDJPY'),0.01);assert.equal(pipSize('EURUSD'),0.0001);assert.equal(Math.round(pipsBetween('EURUSD',1.1,1.101)*10)/10,10);});
test('risk math is correct',()=>{assert.equal(riskAmount(100000,1),1000);assert.equal(riskAmount(80000,.5),400);assert.ok(Math.abs(riskReward(1.1,1.095,1.11)-2)<1e-12);});
test('ema returns aligned output',()=>{const out=ema([1,2,3,4,5],3);assert.equal(out.length,5);assert.equal(out[0],null);assert.equal(out[2],2);assert.equal(out[4],4);});
test('rsi stays in bounds',()=>{const out=rsi([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,14,13],14).filter(v=>v!==null);assert.ok(out.every(v=>v>=0&&v<=100));});
test('intrabar both-hit is marked ambiguous',()=>{const result=evaluateBracket({direction:'buy',entry:1.1,stop:1.09,target:1.11,candles:[{open:1.1,high:1.12,low:1.08,close:1.105}]});assert.equal(result.status,'ambiguous');});
test('ordered bracket resolution works',()=>{const result=evaluateBracket({direction:'sell',entry:1.1,stop:1.11,target:1.08,candles:[{open:1.1,high:1.105,low:1.079,close:1.081}]});assert.equal(result.status,'target');});
