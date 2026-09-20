import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDrill, DRILL_SKILLS } from '../src/drills.js';
import { HISTORICAL_EVENTS, nearestIndex } from '../src/events.js';

const candles=Array.from({length:400},(_,i)=>{const base=1.05+i*.0002;return {timestamp:Date.UTC(2022,0,1)+i*3600000,open:base,high:base+.0008,low:base-.0006,close:base+.0004,volume:10};});
const meta={pair:'EUR/USD',timeframe:'H1'};
for(const skill of DRILL_SKILLS)test(`drill factory creates ${skill} question`,()=>{const d=makeDrill({candles,meta,difficulty:'normal',skill,rng:()=>.5});assert.equal(d.skill,skill);assert.ok(d.prompt);assert.ok(d.choices.includes(d.answer));assert.ok(d.visible.length>0);});
test('historical events are sourced and cover required pairs',()=>{assert.ok(HISTORICAL_EVENTS.length>=8);assert.ok(HISTORICAL_EVENTS.every(e=>e.sourceUrl.startsWith('https://')));assert.ok(HISTORICAL_EVENTS.some(e=>e.pair==='USD/JPY'));assert.ok(HISTORICAL_EVENTS.some(e=>e.pair==='GBP/USD'));});
test('nearestIndex finds close timestamp',()=>{assert.equal(nearestIndex(candles,new Date(candles[123].timestamp+1000).toISOString()),123);});

import { aggregateCandles } from '../src/data-utils.js';
test('M15 aggregation preserves OHLC semantics',()=>{const base=Date.UTC(2024,0,1);const rows=[0,15,30,45,60].map((m,i)=>({timestamp:base+m*60000,open:1+i*.001,high:1.002+i*.001,low:.999+i*.001,close:1.001+i*.001,volume:1}));const h1=aggregateCandles(rows,60);assert.equal(h1.length,2);assert.equal(h1[0].open,1);assert.ok(Math.abs(h1[0].close-1.004)<1e-12);assert.ok(Math.abs(h1[0].high-1.005)<1e-12);assert.ok(Math.abs(h1[0].low-.999)<1e-12);assert.equal(h1[0].volume,4);});
