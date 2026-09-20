import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCoachState, ingestProgress, masteryForSkill, detectRootGap, gapLesson,
  fatigueScore, sessionPlan, chooseGauntletQuestions, scoreGauntlet,
  confidenceCalibration, weeklyReport
} from '../src/adaptive.js';

function attempt(skill, correct, minutesAgo, extra = {}) {
  return { skill, correct, at:new Date(Date.now() - minutesAgo * 60000).toISOString(), ...extra };
}

test('progress ingestion imports lessons and drills once', () => {
  const progress = {
    quiz:{ m3l1:{ correct:false, at:'2026-09-20T10:00:00Z' } },
    drills:[{ skill:'direction', correct:false, answer:'buy', expected:'no-trade', at:'2026-09-20T10:05:00Z' }]
  };
  let coach = ingestProgress(progress, defaultCoachState());
  assert.equal(coach.attempts.length, 2);
  assert.equal(coach.attempts.some(x => x.skill === 'structure'), true);
  assert.equal(coach.attempts.some(x => x.skill === 'regime'), true);
  coach = ingestProgress(progress, coach);
  assert.equal(coach.attempts.length, 2);
});

test('mastery reacts to repeated recent success and failure', () => {
  const strong = defaultCoachState();
  strong.attempts = Array.from({length:12}, (_,i) => attempt('risk', true, i));
  const weak = defaultCoachState();
  weak.attempts = Array.from({length:12}, (_,i) => attempt('risk', i < 3, i));
  assert.ok(masteryForSkill(strong, 'risk').score > masteryForSkill(weak, 'risk').score);
  assert.ok(masteryForSkill(strong, 'risk').score >= 85);
  assert.ok(masteryForSkill(weak, 'risk').score < 55);
});

test('root gap prefers weak prerequisite that affects downstream skills', () => {
  const coach = defaultCoachState();
  coach.attempts = [
    ...Array.from({length:8}, (_,i) => attempt('regime', i < 2, i)),
    ...Array.from({length:5}, (_,i) => attempt('entry-selection', i < 2, i + 10)),
    ...Array.from({length:6}, (_,i) => attempt('risk', true, i + 20))
  ];
  const root = detectRootGap(coach);
  assert.equal(root.skill, 'regime');
  assert.ok(root.downstream.includes('entry-selection'));
});

test('explanation ladder gets simpler after repeated misses', () => {
  const coach = defaultCoachState();
  coach.attempts = Array.from({length:6}, (_,i) => attempt('indicators', false, i));
  const lesson = gapLesson(coach, 'indicators');
  assert.equal(lesson.level, 3);
  assert.match(lesson.levelLabel, /One-rule/);
});

test('fatigue rises when accuracy drops and wrong answers repeat', () => {
  const fresh = [attempt('risk', true, 8), attempt('risk', true, 7), attempt('risk', true, 6), attempt('risk', true, 5)];
  const tired = [
    attempt('risk', true, 8, {responseMs:3000}), attempt('risk', true, 7, {responseMs:3200}),
    attempt('risk', false, 4, {responseMs:6000}), attempt('risk', false, 3, {responseMs:7000}),
    attempt('risk', false, 2, {responseMs:8000}), attempt('risk', false, 1, {responseMs:9000})
  ];
  assert.ok(fatigueScore(tired).score > fatigueScore(fresh).score);
  assert.ok(fatigueScore(tired).reasons.length >= 1);
});

test('adaptive session plan increases remediation for a critical gap', () => {
  const coach = defaultCoachState();
  coach.attempts = Array.from({length:10}, (_,i) => attempt('regime', i === 0, i));
  const plan = sessionPlan(coach, 40);
  assert.equal(plan.minutes, 40);
  assert.equal(plan.rootGap.skill, 'regime');
  assert.match(plan.phases[1].name, /Gap lesson/);
  assert.equal(plan.phases.reduce((s,p) => s + p.minutes, 0), 40);
});

test('gauntlet prioritizes learner weakness and scores confidence separately', () => {
  const coach = defaultCoachState();
  coach.attempts = Array.from({length:8}, (_,i) => attempt('stop-placement', i < 2, i));
  const questions = chooseGauntletQuestions(coach, 6);
  assert.equal(questions.length, 6);
  assert.ok(questions.some(q => q.skill === 'stop-placement'));
  const scored = scoreGauntlet([
    {skill:'risk',stage:'know',correct:true,confidence:75},
    {skill:'regime',stage:'apply',correct:false,confidence:100},
    {skill:'discipline',stage:'pressure',correct:true,confidence:75}
  ]);
  assert.equal(scored.accuracy, 67);
  assert.ok(scored.confidenceFit < 80);
  assert.ok(scored.pressure >= 50);
});

test('confidence calibration flags overconfidence', () => {
  const coach = defaultCoachState();
  coach.attempts = [
    attempt('regime', false, 3, {confidence:100}),
    attempt('regime', false, 2, {confidence:90}),
    attempt('regime', true, 1, {confidence:100})
  ];
  const c = confidenceCalibration(coach);
  assert.equal(c.samples, 3);
  assert.equal(c.label, 'Often overconfident');
});

test('weekly report keeps focus time separate from performance', () => {
  const coach = defaultCoachState();
  coach.attempts = [attempt('risk', true, 10), attempt('regime', false, 20)];
  coach.sessions = [{ startedAt:new Date(Date.now()-3600000).toISOString(), activeSeconds:1800 }];
  const report = weeklyReport(coach);
  assert.equal(report.minutes, 30);
  assert.equal(report.attempts, 2);
});
