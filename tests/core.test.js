import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pipSize,pipsBetween,riskAmount,riskReward,ema,rsi,evaluateBracket,
  pipValuePerStandardLotUSD,positionSizeLots,priceFromPips,tradePnlUsd,
  efficiencyRatio,regimeLabel,hindsightDirection,candleType,emaAlignment,rsiZone,
  recordSkillAttempt,pickWeakSkill
} from '../src/core.js';

test('pip sizes handle JPY convention',()=>{assert.equal(pipSize('USDJPY'),0.01);assert.equal(pipSize('EUR/USD'),0.0001);assert.equal(Math.round(pipsBetween('EURUSD',1.1,1.101)*10)/10,10);});
test('risk math is correct',()=>{assert.equal(riskAmount(100000,1),1000);assert.equal(riskAmount(80000,.5),400);assert.ok(Math.abs(riskReward(1.1,1.095,1.11)-2)<1e-12);});
test('USD-major pip value and lot sizing are coherent',()=>{assert.equal(pipValuePerStandardLotUSD('EURUSD',1.1),10);assert.ok(Math.abs(pipValuePerStandardLotUSD('USDJPY',150)-6.6666667)<1e-5);assert.equal(positionSizeLots({pair:'EURUSD',price:1.1,balance:10000,riskPercent:1,stopPips:20}),0.5);});
test('price-from-pips places stop and target on correct sides',()=>{assert.ok(Math.abs(priceFromPips('EURUSD','buy',1.1,20,'stop')-1.098)<1e-12);assert.ok(Math.abs(priceFromPips('EURUSD','sell',1.1,20,'target')-1.098)<1e-12);});
test('manual PnL math supports quote-USD and base-USD majors',()=>{assert.ok(Math.abs(tradePnlUsd({pair:'EURUSD',direction:'buy',entry:1.1,exit:1.101,lots:1})-100)<1e-8);assert.ok(tradePnlUsd({pair:'USDJPY',direction:'buy',entry:150,exit:151,lots:1})>600);});
test('ema returns aligned output',()=>{const out=ema([1,2,3,4,5],3);assert.equal(out.length,5);assert.equal(out[0],null);assert.equal(out[2],2);assert.equal(out[4],4);});
test('rsi stays in bounds',()=>{const out=rsi([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,14,13],14).filter(v=>v!==null);assert.ok(out.every(v=>v>=0&&v<=100));});
test('intrabar both-hit is marked ambiguous',()=>{const result=evaluateBracket({direction:'buy',entry:1.1,stop:1.09,target:1.11,candles:[{open:1.1,high:1.12,low:1.08,close:1.105}]});assert.equal(result.status,'ambiguous');});
test('ordered bracket resolution works',()=>{const result=evaluateBracket({direction:'sell',entry:1.1,stop:1.11,target:1.08,candles:[{open:1.1,high:1.105,low:1.079,close:1.081}]});assert.equal(result.status,'target');});
test('trainer classifiers are deterministic',()=>{const trend=Array.from({length:80},(_,i)=>({open:1+i*.001,high:1.001+i*.001,low:.999+i*.001,close:1.0008+i*.001}));assert.ok(efficiencyRatio(trend.map(c=>c.close))>.9);assert.equal(regimeLabel(trend),'uptrend');assert.equal(candleType(trend.at(-1)),'bullish');assert.equal(emaAlignment(trend),'bullish');assert.equal(rsiZone(trend).zone,'high');});
test('hindsight direction uses ATR threshold',()=>{const candles=Array.from({length:100},(_,i)=>({open:1+i*.0001,high:1.001+i*.0001,low:.999+i*.0001,close:1+i*.0001}));for(let i=61;i<100;i++)candles[i]={...candles[i],close:candles[i].close+.01,high:candles[i].high+.01,low:candles[i].low+.01};assert.equal(hindsightDirection(candles,60,12,.5),'buy');});
test('spaced repetition resets on miss and prioritizes weak due skill',()=>{let stats={};stats=recordSkillAttempt(stats,'ema',true,1000);assert.equal(stats.ema.box,1);stats=recordSkillAttempt(stats,'ema',false,2000);assert.equal(stats.ema.box,0);const picked=pickWeakSkill({ema:{attempts:10,correct:10,box:5,dueAt:999999999},risk:{attempts:3,correct:0,box:0,dueAt:0}},['ema','risk'],3000,()=>0);assert.equal(picked,'risk');});
