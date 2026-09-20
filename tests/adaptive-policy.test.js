import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCoachState, masteryForSkill, learningStopLoss, sessionPlan, difficultyBand
} from '../src/adaptive.js';

const row = (skill, correct, minutesAgo = 0) => ({
  skill, correct, at:new Date(Date.now() - minutesAgo * 60000).toISOString()
});

test('one lucky answer cannot create fake mastery', () => {
  const coach = defaultCoachState();
  coach.attempts = [row('risk', true)];
  const mastery = masteryForSkill(coach, 'risk');
  assert.ok(mastery.score <= 45);
  assert.notEqual(mastery.state, 'mastered');
  assert.notEqual(mastery.state, 'proficient');
});

test('early evidence remains capped until sample volume grows', () => {
  const coach = defaultCoachState();
  coach.attempts = [row('structure', true, 3), row('structure', true, 2), row('structure', true, 1)];
  assert.ok(masteryForSkill(coach, 'structure').score <= 60);
  coach.attempts.push(row('structure', true, 0), row('structure', true, 0), row('structure', true, 0), row('structure', true, 0));
  assert.ok(masteryForSkill(coach, 'structure').score > 60);
});

test('learning stop-loss activates after repeated same-skill misses', () => {
  const coach = defaultCoachState();
  coach.attempts = [
    row('regime', false, 3), row('regime', false, 2), row('regime', false, 1)
  ];
  const stop = learningStopLoss(coach);
  assert.equal(stop.skill, 'regime');
  assert.equal(stop.prerequisite, 'structure');
  assert.ok(stop.misses >= 3);
});

test('learning stop-loss changes the adaptive plan instead of grinding the same item', () => {
  const coach = defaultCoachState();
  coach.attempts = [
    row('regime', false, 5), row('regime', false, 4), row('regime', false, 3), row('regime', false, 2),
    row('entry-selection', false, 1)
  ];
  const plan = sessionPlan(coach, 30);
  assert.equal(plan.phases.reduce((s,p) => s + p.minutes, 0), 30);
  assert.ok(plan.phases.some(p => /Learning stop-loss/.test(p.name)));
  assert.ok(/stop grinding/i.test(plan.reason));
});

test('difficulty band does not jump to hard from tiny samples', () => {
  const coach = defaultCoachState();
  coach.attempts = [row('candles', true)];
  assert.equal(difficultyBand(coach, 'candles'), 'guided');
});
