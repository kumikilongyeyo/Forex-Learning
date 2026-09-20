import { modules, lessonCount } from './curriculum.js';
import {
  loadProgress, saveProgress, toPhilippineTime, directionOutcome, evaluateBracket,
  riskReward, positionSizeLots, priceFromPips, riskAmount, tradePnlUsd,
  recordSkillAttempt, pickWeakSkill, skillAccuracy
} from './core.js';
import { renderCandles } from './chart.js';
import { DRILL_SKILLS, DIFFICULTIES, makeDrill } from './drills.js';
import { HISTORICAL_EVENTS, nearestIndex } from './events.js';

const app = document.querySelector('#app');
const tabs = [...document.querySelectorAll('.tab')];
let progress = loadProgress();
let activeModule = modules[0].id;
let activeLesson = null;
let manifest = null;
let datasetCache = { path: null, data: null };
let practiceMode = 'drills';
let replayState = null;
let drillState = null;
let sessionState = null;
let eventState = null;
let autoTimer = null;

const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c]));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const money = n => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cleanPair = pair => pair.replace('/', '');

function clearAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

function setView(view) {
  clearAuto();
  tabs.forEach(t => t.classList.toggle('active', t.dataset.view === view));
  location.hash = view;
  if (view === 'learn') renderLearn();
  if (view === 'practice') renderPractice();
  if (view === 'progress') renderProgress();
  if (view === 'about') renderSources();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

tabs.forEach(t => t.addEventListener('click', () => setView(t.dataset.view)));

function completionPct() {
  return Math.round(Object.keys(progress.completed || {}).length / lessonCount * 100);
}

const lessonSequence = modules.flatMap(m => m.lessons.map(l => l.id));
function isUnlocked(id) {
  const index = lessonSequence.indexOf(id);
  return index <= 0 || Boolean(progress.completed?.[lessonSequence[index - 1]]);
}

function sidebarHtml() {
  return `<aside class="sidebar"><h2>Curriculum</h2>${modules.map(m => {
    const done = m.lessons.filter(l => progress.completed?.[l.id]).length;
    return `<button class="module-btn ${activeModule === m.id ? 'active' : ''}" data-module="${m.id}">${escapeHtml(m.title)}<small>${done}/${m.lessons.length} lessons</small></button>`;
  }).join('')}</aside>`;
}

function renderLearn() {
  const module = modules.find(m => m.id === activeModule) || modules[0];
  if (activeLesson) return renderLesson(activeLesson);
  app.innerHTML = `<div class="layout">${sidebarHtml()}<section class="content">
    <div class="hero"><span class="eyebrow">Structured learning path</span><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.subtitle)}</p>
    <div class="stats-row"><span class="pill">${lessonCount} core lessons</span><span class="pill">Taglish explanations</span><span class="pill">Progress ${completionPct()}%</span></div></div>
    <div class="lesson-list">${module.lessons.map((l, i) => {
      const unlocked = isUnlocked(l.id);
      return `<article class="lesson-row ${progress.completed?.[l.id] ? 'done' : ''} ${unlocked ? '' : 'locked'}" data-lesson="${l.id}" data-unlocked="${unlocked}"><span class="lesson-num">${progress.completed?.[l.id] ? '✓' : unlocked ? i + 1 : '🔒'}</span><div><div class="lesson-title">${escapeHtml(l.title)}</div><div class="lesson-meta">${escapeHtml(unlocked ? l.objective : 'Pass the previous lesson to unlock.')}</div></div><span class="lesson-meta">${l.minutes} min</span></article>`;
    }).join('')}</div>
  </section></div>`;
  bindLearnNav();
}

function bindLearnNav() {
  app.querySelectorAll('[data-module]').forEach(b => b.addEventListener('click', () => { activeModule = b.dataset.module; activeLesson = null; renderLearn(); }));
  app.querySelectorAll('[data-lesson]').forEach(b => b.addEventListener('click', () => { if (b.dataset.unlocked !== 'true') return; activeLesson = b.dataset.lesson; renderLearn(); }));
}

function renderLesson(id) {
  const module = modules.find(m => m.lessons.some(l => l.id === id));
  const l = module.lessons.find(x => x.id === id);
  app.innerHTML = `<div class="layout">${sidebarHtml()}<section class="content lesson-page">
    <button class="ghost" id="backLessons">← ${escapeHtml(module.title)}</button>
    <div class="hero"><span class="eyebrow">${l.minutes} min • lesson</span><h2>${escapeHtml(l.title)}</h2><p class="objective">Goal: ${escapeHtml(l.objective)}</p></div>
    <div class="card"><strong>Key ideas</strong><div class="keypoints">${l.points.map(p => `<div class="keypoint">${escapeHtml(p)}</div>`).join('')}</div></div>
    <div class="card quiz"><span class="eyebrow">Knowledge check</span><h3>${escapeHtml(l.quiz.question)}</h3><div class="choices">${l.quiz.choices.map(c => `<button class="choice" data-answer="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><div id="feedback"></div></div>
  </section></div>`;
  app.querySelector('#backLessons').onclick = () => { activeLesson = null; renderLearn(); };
  bindLearnNav();
  app.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
    const correct = btn.dataset.answer === l.quiz.answer;
    app.querySelectorAll('.choice').forEach(x => { x.disabled = true; if (x.dataset.answer === l.quiz.answer) x.classList.add('correct'); });
    if (!correct) btn.classList.add('wrong');
    app.querySelector('#feedback').innerHTML = `<div class="feedback"><strong>${correct ? 'Correct.' : 'Not quite.'}</strong> ${escapeHtml(l.quiz.explain)}</div>`;
    progress.quiz[l.id] = { correct, at: new Date().toISOString() };
    if (correct) progress.completed[l.id] = true;
    saveProgress(progress);
  });
}

async function loadManifest() {
  try {
    const r = await fetch('./public/data/manifest.json', { cache: 'no-store' });
    manifest = r.ok ? await r.json() : { datasets: [] };
  } catch { manifest = { datasets: [] }; }
}

async function loadDataset(path) {
  if (datasetCache.path === path && datasetCache.data) return datasetCache.data;
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error('Dataset failed to load');
  const raw = await r.json();
  const data = Array.isArray(raw) ? raw : raw.candles;
  datasetCache = { path, data };
  return data;
}

function datasetOptions(filter = () => true) {
  return (manifest?.datasets || []).map((d, i) => ({ d, i })).filter(({ d }) => filter(d))
    .map(({ d, i }) => `<option value="${i}">${escapeHtml(d.pair)} • ${escapeHtml(d.timeframe)} • ${d.from}–${d.to}</option>`).join('');
}

function noDataHtml() {
  return `<div class="data-warning"><strong>Real-data pack not installed yet.</strong><p>Forex Lab refuses to invent historical candles. From the repo folder run:</p><code class="code">npm install\nnpm run data:sample</code><p>The v0.2 sample installs EUR/USD, GBP/USD and USD/JPY for <strong>M15 + H1 + H4</strong> across 2020–2025. Use <code>npm run data:all</code> for all six majors.</p></div>`;
}

async function renderPractice() {
  await loadManifest();
  const hasData = Boolean(manifest?.datasets?.length);
  app.innerHTML = `<section class="hero compact-hero"><span class="eyebrow">Practice lab</span><h1>Train on what actually happened.</h1><p>Four modes. Same historical dataset. Different skills. Display timezone: Asia/Manila (PHT).</p></section>
    <nav class="practice-tabs" aria-label="Practice modes">
      ${[['drills','Dense drills'],['replay','Replay'],['session','Trading session'],['events','Historical events']].map(([id,label]) => `<button class="practice-tab ${practiceMode === id ? 'active' : ''}" data-practice="${id}">${label}</button>`).join('')}
    </nav>
    ${hasData ? '' : noDataHtml()}
    <section id="practiceBody"></section>`;
  app.querySelectorAll('[data-practice]').forEach(b => b.onclick = () => { clearAuto(); practiceMode = b.dataset.practice; renderPractice(); });
  if (!hasData) {
    app.querySelector('#practiceBody').innerHTML = `<div class="mode-grid muted-grid">${modeIntroCards()}</div>`;
    return;
  }
  if (practiceMode === 'drills') await renderDrills();
  if (practiceMode === 'replay') await renderReplay();
  if (practiceMode === 'session') await renderSession();
  if (practiceMode === 'events') await renderEvents();
}

function modeIntroCards() {
  return [
    ['Dense drills','20-question sessions generated from random historical windows. Weak skills return more often.'],
    ['Replay','Lock BUY / SELL / NO TRADE, then uncover the real future one candle at a time.'],
    ['Trading session','Use a USD training account, position size, stop, target, manual close, drawdown and replay.'],
    ['Historical events','Mystery challenges around verified central-bank and intervention events.']
  ].map(([t,d]) => `<div class="card"><strong>${t}</strong><p class="lesson-meta">${d}</p></div>`).join('');
}

/* -------------------- Dense drills -------------------- */
async function renderDrills() {
  const body = app.querySelector('#practiceBody');
  body.innerHTML = `<div class="mode-head"><div><span class="eyebrow">Dense drill mode</span><h2>20 questions. Weak skills come back.</h2><p>Generated from real historical windows; answer labels follow explicit trainer rules, not vibes.</p></div>
  <div class="toolbar"><select id="drillDataset">${datasetOptions()}</select><select id="drillDifficulty">${Object.entries(DIFFICULTIES).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('')}</select><button class="primary" id="startDrills">Start 20 drills</button></div></div>
  <div id="drillArea" class="card empty-state"><strong>Ready when you are.</strong><p>Your weakest due skill is weighted first. Categories: structure, direction outcome, candles, EMA, RSI and risk sizing.</p></div>`;
  body.querySelector('#startDrills').onclick = startDrillSession;
}

async function startDrillSession() {
  const datasetIndex = Number(app.querySelector('#drillDataset').value);
  const difficulty = app.querySelector('#drillDifficulty').value;
  const meta = manifest.datasets[datasetIndex];
  const candles = await loadDataset(meta.path);
  drillState = { datasetIndex, difficulty, candles, meta, total: 20, asked: 0, score: 0, current: null, answered: false };
  nextDrill();
}

function nextDrill() {
  if (!drillState) return;
  if (drillState.asked >= drillState.total) return renderDrillSummary();
  const skill = pickWeakSkill(progress.skillStats, DRILL_SKILLS) || DRILL_SKILLS[drillState.asked % DRILL_SKILLS.length];
  let drill = makeDrill({ candles: drillState.candles, meta: drillState.meta, difficulty: drillState.difficulty, skill });
  if (!drill) drill = makeDrill({ candles: drillState.candles, meta: drillState.meta, difficulty: drillState.difficulty, skill: 'candles' });
  drillState.current = drill;
  drillState.answered = false;
  drillState.asked += 1;
  renderDrillQuestion();
}

function drillMetaText(drill) {
  const bits = [drill.meta.pair, drill.meta.timeframe];
  if (drill.meta.timestamp) bits.push(toPhilippineTime(drill.meta.timestamp) + ' PHT');
  else bits.push('date hidden');
  return bits.join(' • ');
}

function renderDrillQuestion() {
  const d = drillState.current;
  const area = app.querySelector('#drillArea');
  area.className = 'drill-layout';
  area.innerHTML = `<div class="card chart-card"><div class="chart-toolbar"><span>${escapeHtml(drillMetaText(d))}</span><span class="spacer"></span><span class="pill">${escapeHtml(d.skill)}</span></div><div id="drillChart" class="chart"></div></div>
  <aside class="card"><span class="eyebrow">Question ${drillState.asked}/${drillState.total} • score ${drillState.score}</span><h3>${escapeHtml(d.prompt)}</h3><div class="choices drill-choices">${d.choices.map(c => `<button class="choice" data-drill-answer="${escapeHtml(c)}">${escapeHtml(String(c).toUpperCase())}</button>`).join('')}</div><div id="drillFeedback"></div></aside>`;
  renderCandles(area.querySelector('#drillChart'), d.visible, { showEma: d.showEma });
  area.querySelectorAll('[data-drill-answer]').forEach(b => b.onclick = () => answerDrill(b.dataset.drillAnswer));
}

function answerDrill(answer) {
  if (!drillState || drillState.answered) return;
  drillState.answered = true;
  const d = drillState.current;
  const correct = answer === String(d.answer);
  if (correct) drillState.score += 1;
  progress.skillStats = recordSkillAttempt(progress.skillStats, d.skill, correct);
  progress.drills.unshift({ skill: d.skill, correct, answer, expected: d.answer, pair: d.meta.rawPair, timeframe: d.meta.timeframe, at: new Date().toISOString() });
  progress.drills = progress.drills.slice(0, 1000);
  saveProgress(progress);
  app.querySelectorAll('[data-drill-answer]').forEach(b => { b.disabled = true; if (b.dataset.drillAnswer === String(d.answer)) b.classList.add('correct'); });
  const selected = [...app.querySelectorAll('[data-drill-answer]')].find(b => b.dataset.drillAnswer === answer);
  if (!correct && selected) selected.classList.add('wrong');
  if (d.hidden?.length) renderCandles(app.querySelector('#drillChart'), [...d.visible, ...d.hidden], { showEma: d.showEma });
  app.querySelector('#drillFeedback').innerHTML = `<div class="feedback"><strong>${correct ? 'Correct.' : `Answer: ${escapeHtml(String(d.answer).toUpperCase())}.`}</strong> ${escapeHtml(d.explanation)}</div><button class="primary full" id="nextDrill">${drillState.asked >= drillState.total ? 'Finish session' : 'Next drill'}</button>`;
  app.querySelector('#nextDrill').onclick = nextDrill;
}

function renderDrillSummary() {
  const pct = Math.round(drillState.score / drillState.total * 100);
  app.querySelector('#drillArea').className = 'card empty-state';
  app.querySelector('#drillArea').innerHTML = `<span class="eyebrow">Drill session complete</span><h2>${drillState.score}/${drillState.total} • ${pct}%</h2><p>The Progress tab now weights weak/due skills for your next session. A high score means you matched the trainer rules—not that future trading results are guaranteed.</p><button class="primary" id="againDrills">Run another 20</button>`;
  app.querySelector('#againDrills').onclick = startDrillSession;
}

/* -------------------- Historical replay -------------------- */
async function renderReplay() {
  const body = app.querySelector('#practiceBody');
  body.innerHTML = `<div class="mode-head"><div><span class="eyebrow">Blind replay</span><h2>Decide first. Future second.</h2><p>Outcome is shown after you lock the decision. It is not retroactively called a “good trade.”</p></div><div class="toolbar"><select id="replayDataset">${datasetOptions()}</select><select id="replayDifficulty">${Object.entries(DIFFICULTIES).map(([k,v]) => `<option value="${k}" ${k==='normal'?'selected':''}>${v.label}</option>`).join('')}</select><button class="ghost" id="newReplay">New scenario</button></div></div>
  <div class="practice-grid"><div class="card chart-card"><div id="replayChart" class="chart"></div></div><aside class="control-stack">
  <div class="card"><span class="eyebrow">Decision</span><h3 id="replayTitle">Loading…</h3><p id="replayMeta"></p><div class="decision-grid"><button class="decision buy" data-replay-decision="buy">BUY</button><button class="decision sell" data-replay-decision="sell">SELL</button><button class="decision no-trade" data-replay-decision="no-trade">NO TRADE</button></div></div>
  <div class="card"><span class="eyebrow">Replay</span><div class="button-row"><button class="primary" id="replayNext" disabled>+1 candle</button><button class="ghost" id="replayFive" disabled>+5</button><button class="ghost" id="replayAll" disabled>Reveal all</button></div><div id="replayOutcome" class="lesson-meta">Lock a decision first.</div></div>
  <div class="card"><strong>Why?</strong><textarea id="replayNote" rows="5" placeholder="Write the setup or the reason you skipped."></textarea></div></aside></div>`;
  body.querySelector('#newReplay').onclick = startReplay;
  body.querySelector('#replayDataset').onchange = startReplay;
  body.querySelector('#replayDifficulty').onchange = startReplay;
  body.querySelectorAll('[data-replay-decision]').forEach(b => b.onclick = () => lockReplayDecision(b.dataset.replayDecision));
  body.querySelector('#replayNext').onclick = () => revealReplay(1);
  body.querySelector('#replayFive').onclick = () => revealReplay(5);
  body.querySelector('#replayAll').onclick = () => revealReplay(999);
  await startReplay();
}

async function startReplay() {
  const index = Number(app.querySelector('#replayDataset').value);
  const difficulty = app.querySelector('#replayDifficulty').value;
  const meta = manifest.datasets[index];
  const candles = await loadDataset(meta.path);
  const cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  const context = cfg.context, future = 30;
  const pivot = Math.floor(context + Math.random() * Math.max(1, candles.length - context - future - 2));
  replayState = { index, meta, candles, difficulty, pivot, visible: candles.slice(pivot-context+1,pivot+1), hidden: candles.slice(pivot+1,pivot+1+future), revealed: 0, decision: null, logged: false };
  app.querySelector('#replayTitle').textContent = cfg.showPair ? `${meta.pair} • ${meta.timeframe}` : `Pair hidden • ${meta.timeframe}`;
  app.querySelector('#replayMeta').textContent = cfg.showDate ? `${toPhilippineTime(candles[pivot].timestamp)} PHT` : 'Historical date hidden until completion.';
  app.querySelector('#replayOutcome').textContent = 'Lock BUY / SELL / NO TRADE first.';
  app.querySelector('#replayNote').value = '';
  app.querySelectorAll('[data-replay-decision]').forEach(b => { b.disabled = false; b.classList.remove('selected'); });
  ['#replayNext','#replayFive','#replayAll'].forEach(id => app.querySelector(id).disabled = true);
  drawReplay();
}

function drawReplay() {
  if (!replayState) return;
  renderCandles(app.querySelector('#replayChart'), [...replayState.visible, ...replayState.hidden.slice(0, replayState.revealed)]);
}

function lockReplayDecision(decision) {
  if (!replayState || replayState.decision) return;
  replayState.decision = decision;
  replayState.note = app.querySelector('#replayNote').value.trim();
  replayState.entry = replayState.visible.at(-1).close;
  app.querySelectorAll('[data-replay-decision]').forEach(b => { b.disabled = true; b.classList.toggle('selected', b.dataset.replayDecision === decision); });
  ['#replayNext','#replayFive','#replayAll'].forEach(id => app.querySelector(id).disabled = false);
  app.querySelector('#replayOutcome').textContent = 'Decision locked. Reveal the real future.';
}

function revealReplay(count) {
  if (!replayState?.decision) return;
  replayState.revealed = Math.min(replayState.hidden.length, replayState.revealed + count);
  drawReplay();
  const last = [...replayState.visible, ...replayState.hidden.slice(0, replayState.revealed)].at(-1);
  const out = directionOutcome(replayState.decision, replayState.entry, last.close);
  const done = replayState.revealed >= replayState.hidden.length;
  app.querySelector('#replayMeta').textContent = `${toPhilippineTime(last.timestamp)} PHT${done ? ' • complete' : ''}`;
  app.querySelector('#replayOutcome').innerHTML = `<strong>${escapeHtml(out.label)}</strong><br>${done ? 'Outcome shown. Now judge your reasoning separately.' : `${replayState.hidden.length - replayState.revealed} future candles remain hidden.`}`;
  if (done) {
    ['#replayNext','#replayFive','#replayAll'].forEach(id => app.querySelector(id).disabled = true);
    if (!replayState.logged) {
      replayState.logged = true;
      progress.practice.unshift({ pair: replayState.meta.pair, timeframe: replayState.meta.timeframe, decision: replayState.decision, note: replayState.note, entry: replayState.entry, final: last.close, historicalAt: last.timestamp, at: new Date().toISOString() });
      progress.practice = progress.practice.slice(0, 300);
      saveProgress(progress);
    }
  }
}

/* -------------------- Trading session -------------------- */
async function renderSession() {
  const body = app.querySelector('#practiceBody');
  const h1Index = manifest.datasets.findIndex(d => d.timeframe === 'H1');
  body.innerHTML = `<div class="mode-head"><div><span class="eyebrow">Trading-session simulator</span><h2>Plan risk. Then watch the market move.</h2><p>USD training account • PHT clock • historical bid OHLC. Spread/slippage are not modeled, so this is learning—not broker-grade P/L.</p></div><div class="toolbar"><select id="sessionDataset">${datasetOptions()}</select><button class="ghost" id="newSession">New session</button></div></div><div id="sessionArea"></div>`;
  if (h1Index >= 0) body.querySelector('#sessionDataset').value = String(h1Index);
  body.querySelector('#sessionDataset').onchange = startSession;
  body.querySelector('#newSession').onclick = startSession;
  await startSession();
}

async function startSession() {
  clearAuto();
  const index = Number(app.querySelector('#sessionDataset').value);
  const meta = manifest.datasets[index];
  const candles = await loadDataset(meta.path);
  const context = 90, futureBars = 80;
  const pivot = Math.floor(context + Math.random() * Math.max(1, candles.length - context - futureBars - 2));
  sessionState = {
    index, meta, candles, pivot, context, future: candles.slice(pivot + 1, pivot + 1 + futureBars), revealed: 0,
    history: candles.slice(pivot - context + 1, pivot + 1), startBalance: 10000, balance: 10000, peak: 10000, maxDrawdown: 0,
    trades: [], openTrade: null, violations: 0, ended: false, logged: false
  };
  renderSessionState();
}

function currentSessionCandle() {
  return [...sessionState.history, ...sessionState.future.slice(0, sessionState.revealed)].at(-1);
}

function renderSessionState() {
  if (!sessionState) return;
  const s = sessionState;
  const current = currentSessionCandle();
  const levels = s.openTrade ? [
    { price: s.openTrade.entry, label: 'ENTRY', kind: 'entry' },
    { price: s.openTrade.stop, label: 'STOP', kind: 'stop' },
    { price: s.openTrade.target, label: 'TARGET', kind: 'target' }
  ] : [];
  const pnl = s.balance - s.startBalance;
  app.querySelector('#sessionArea').innerHTML = `<div class="session-stats"><div><span>Balance</span><strong>${money(s.balance)}</strong></div><div><span>Session P/L</span><strong class="${pnl >= 0 ? 'positive' : 'negative'}">${pnl >= 0 ? '+' : ''}${money(pnl)}</strong></div><div><span>Max drawdown</span><strong>${s.maxDrawdown.toFixed(2)}%</strong></div><div><span>Trades</span><strong>${s.trades.length}</strong></div></div>
  <div class="practice-grid"><div class="card chart-card"><div class="chart-toolbar"><span>${escapeHtml(s.meta.pair)} • ${escapeHtml(s.meta.timeframe)}</span><span class="spacer"></span><span>${toPhilippineTime(current.timestamp)} PHT</span></div><div id="sessionChart" class="chart"></div><div class="replay-strip"><button class="primary" id="sessionNext" ${s.ended?'disabled':''}>+1 candle</button><button class="ghost" id="sessionFive" ${s.ended?'disabled':''}>+5</button><button class="ghost" id="sessionAuto" ${s.ended?'disabled':''}>${autoTimer ? 'Pause' : '▶ Auto'}</button><button class="ghost" id="sessionEnd" ${s.ended?'disabled':''}>End session</button></div></div>
  <aside class="control-stack">${s.ended ? sessionSummaryHtml() : s.openTrade ? openTradeHtml() : tradeTicketHtml()}</aside></div>`;
  renderCandles(app.querySelector('#sessionChart'), [...s.history, ...s.future.slice(0, s.revealed)], { levels });
  app.querySelector('#sessionNext')?.addEventListener('click', () => stepSession(1));
  app.querySelector('#sessionFive')?.addEventListener('click', () => stepSession(5));
  app.querySelector('#sessionAuto')?.addEventListener('click', toggleSessionAuto);
  app.querySelector('#sessionEnd')?.addEventListener('click', () => endSession('manual'));
  app.querySelector('#restartSession')?.addEventListener('click', startSession);
  app.querySelector('#placeTrade')?.addEventListener('click', placeTrade);
  app.querySelector('#closeTrade')?.addEventListener('click', () => closeTradeAtMarket('manual'));
  ['riskPct','stopPips','targetPips','tradeDirection'].forEach(id => app.querySelector(`#${id}`)?.addEventListener('input', updateTicketEstimate));
  updateTicketEstimate();
}

function tradeTicketHtml() {
  return `<div class="card"><span class="eyebrow">Trade ticket</span><label>Direction<select id="tradeDirection"><option value="buy">BUY</option><option value="sell">SELL</option></select></label><div class="form-grid"><label>Risk %<input id="riskPct" type="number" min="0.1" max="10" step="0.1" value="1"></label><label>Stop (pips)<input id="stopPips" type="number" min="1" max="500" step="1" value="30"></label><label>Target (pips)<input id="targetPips" type="number" min="1" max="1000" step="1" value="60"></label></div><div id="ticketEstimate" class="ticket-estimate"></div><button class="primary full" id="placeTrade">Place market trade</button><p class="fineprint">Trainer flags risk above 2% as a discipline violation. That is a training guardrail, not a universal law.</p></div>`;
}

function updateTicketEstimate() {
  if (!sessionState || sessionState.openTrade || sessionState.ended) return;
  const box = app.querySelector('#ticketEstimate');
  if (!box) return;
  const pair = cleanPair(sessionState.meta.pair);
  const price = currentSessionCandle().close;
  const riskPct = Number(app.querySelector('#riskPct').value);
  const stopPips = Number(app.querySelector('#stopPips').value);
  const targetPips = Number(app.querySelector('#targetPips').value);
  const lots = positionSizeLots({ pair, price, balance: sessionState.balance, riskPercent: riskPct, stopPips });
  const rr = stopPips > 0 ? targetPips / stopPips : 0;
  box.innerHTML = `<span>Risk budget <strong>${money(riskAmount(sessionState.balance, riskPct))}</strong></span><span>Approx size <strong>${lots.toFixed(2)} lots</strong></span><span>Planned R:R <strong>1:${rr.toFixed(2)}</strong></span>`;
}

function placeTrade() {
  const s = sessionState;
  if (!s || s.openTrade || s.ended) return;
  const direction = app.querySelector('#tradeDirection').value;
  const riskPercent = Number(app.querySelector('#riskPct').value);
  const stopPips = Number(app.querySelector('#stopPips').value);
  const targetPips = Number(app.querySelector('#targetPips').value);
  if (!(riskPercent > 0 && stopPips > 0 && targetPips > 0)) return;
  const pair = cleanPair(s.meta.pair);
  const entry = currentSessionCandle().close;
  const lots = positionSizeLots({ pair, price: entry, balance: s.balance, riskPercent, stopPips });
  if (!Number.isFinite(lots) || lots <= 0) return;
  const stop = priceFromPips(pair, direction, entry, stopPips, 'stop');
  const target = priceFromPips(pair, direction, entry, targetPips, 'target');
  const riskUsd = riskAmount(s.balance, riskPercent);
  if (riskPercent > 2) s.violations += 1;
  s.openTrade = { direction, entry, stop, target, stopPips, targetPips, riskPercent, riskUsd, lots, openedAt: currentSessionCandle().timestamp };
  renderSessionState();
}

function openTradeHtml() {
  const t = sessionState.openTrade;
  return `<div class="card"><span class="eyebrow">Open ${escapeHtml(t.direction.toUpperCase())}</span><div class="ticket-estimate stacked"><span>Entry <strong>${t.entry.toFixed(t.entry > 20 ? 3 : 5)}</strong></span><span>Stop <strong>${t.stop.toFixed(t.stop > 20 ? 3 : 5)}</strong></span><span>Target <strong>${t.target.toFixed(t.target > 20 ? 3 : 5)}</strong></span><span>Size <strong>${t.lots.toFixed(2)} lots</strong></span><span>Risk <strong>${money(t.riskUsd)} (${t.riskPercent}%)</strong></span><span>R:R <strong>1:${riskReward(t.entry, t.stop, t.target).toFixed(2)}</strong></span></div><button class="ghost full" id="closeTrade">Close at current price</button><p class="fineprint">OHLC cannot tell which came first when stop and target are both inside one candle. Forex Lab marks that trade ambiguous instead of guessing.</p></div>`;
}

function stepSession(count = 1) {
  const s = sessionState;
  if (!s || s.ended) return;
  for (let i = 0; i < count && !s.ended; i += 1) {
    if (s.revealed >= s.future.length) { endSession('data-end'); break; }
    s.revealed += 1;
    const candle = s.future[s.revealed - 1];
    if (s.openTrade) {
      const result = evaluateBracket({ ...s.openTrade, candles: [candle] });
      if (result.status !== 'open') resolveTrade(result.status, candle);
    }
    if (s.revealed >= s.future.length) endSession('data-end');
  }
  if (!s.ended) renderSessionState();
}

function resolveTrade(status, candle) {
  const s = sessionState, t = s.openTrade;
  if (!t) return;
  let pnl = 0;
  if (status === 'stop') pnl = -t.riskUsd;
  if (status === 'target') pnl = t.riskUsd * (t.targetPips / t.stopPips);
  s.trades.push({ ...t, status, pnl, closedAt: candle.timestamp });
  if (status !== 'ambiguous') applySessionPnl(pnl);
  s.openTrade = null;
}

function closeTradeAtMarket(reason = 'manual') {
  const s = sessionState, t = s.openTrade;
  if (!t) return;
  const candle = currentSessionCandle();
  const pnl = tradePnlUsd({ pair: cleanPair(s.meta.pair), direction: t.direction, entry: t.entry, exit: candle.close, lots: t.lots });
  s.trades.push({ ...t, status: reason, pnl, closedAt: candle.timestamp, exit: candle.close });
  applySessionPnl(pnl);
  s.openTrade = null;
  renderSessionState();
}

function applySessionPnl(pnl) {
  const s = sessionState;
  s.balance += pnl;
  s.peak = Math.max(s.peak, s.balance);
  const dd = s.peak > 0 ? (s.peak - s.balance) / s.peak * 100 : 0;
  s.maxDrawdown = Math.max(s.maxDrawdown, dd);
}

function toggleSessionAuto() {
  if (autoTimer) { clearAuto(); renderSessionState(); return; }
  autoTimer = setInterval(() => {
    if (!sessionState || sessionState.ended) { clearAuto(); return; }
    stepSession(1);
  }, 700);
  renderSessionState();
}

function endSession(reason) {
  const s = sessionState;
  if (!s || s.ended) return;
  clearAuto();
  if (s.openTrade) {
    const t = s.openTrade;
    const candle = currentSessionCandle();
    const pnl = tradePnlUsd({ pair: cleanPair(s.meta.pair), direction: t.direction, entry: t.entry, exit: candle.close, lots: t.lots });
    s.trades.push({ ...t, status: 'session-end', pnl, closedAt: candle.timestamp, exit: candle.close });
    applySessionPnl(pnl);
    s.openTrade = null;
  }
  s.ended = true;
  s.endReason = reason;
  if (!s.logged) {
    s.logged = true;
    progress.sessions.unshift({ pair: s.meta.pair, timeframe: s.meta.timeframe, startBalance: s.startBalance, finalBalance: s.balance, pnl: s.balance - s.startBalance, maxDrawdown: s.maxDrawdown, trades: s.trades.length, violations: s.violations, at: new Date().toISOString() });
    progress.sessions = progress.sessions.slice(0, 100);
    saveProgress(progress);
  }
  renderSessionState();
}

function sessionSummaryHtml() {
  const s = sessionState;
  const pnl = s.balance - s.startBalance;
  const ambiguous = s.trades.filter(t => t.status === 'ambiguous').length;
  return `<div class="card"><span class="eyebrow">Session complete</span><h2 class="${pnl >= 0 ? 'positive' : 'negative'}">${pnl >= 0 ? '+' : ''}${money(pnl)}</h2><div class="ticket-estimate stacked"><span>Final balance <strong>${money(s.balance)}</strong></span><span>Max drawdown <strong>${s.maxDrawdown.toFixed(2)}%</strong></span><span>Trades <strong>${s.trades.length}</strong></span><span>Risk flags >2% <strong>${s.violations}</strong></span><span>Ambiguous OHLC trades <strong>${ambiguous}</strong></span></div><p class="fineprint">Do not treat this P/L as executable broker performance. Dataset uses historical bid OHLC and does not model spread, slippage, commissions or latency.</p><button class="primary full" id="restartSession">New random session</button></div>`;
}

/* -------------------- Historical events -------------------- */
async function renderEvents() {
  const body = app.querySelector('#practiceBody');
  body.innerHTML = `<div class="mode-head"><div><span class="eyebrow">Historical event challenges</span><h2>Trade the chart before you know the headline.</h2><p>Event explanations come from official central-bank/government sources. The future is still hidden first.</p></div><button class="primary" id="newEvent">New mystery event</button></div><div id="eventArea" class="card empty-state"><strong>Mystery mode.</strong><p>The pair is shown, but the event title/date stay hidden until you complete the reveal.</p></div>`;
  body.querySelector('#newEvent').onclick = startMysteryEvent;
}

async function startMysteryEvent() {
  const available = HISTORICAL_EVENTS.map(event => ({ event, index: manifest.datasets.findIndex(d => d.pair === event.pair && d.timeframe === event.timeframe) })).filter(x => x.index >= 0);
  if (!available.length) {
    app.querySelector('#eventArea').innerHTML = `<strong>No matching H1 event data installed.</strong><p>Run the v0.2 data installer first.</p>`;
    return;
  }
  const chosen = available[Math.floor(Math.random() * available.length)];
  const meta = manifest.datasets[chosen.index];
  const candles = await loadDataset(meta.path);
  const pivot = nearestIndex(candles, chosen.event.anchor);
  const context = 90;
  if (pivot < context || pivot + chosen.event.revealBars >= candles.length) return startMysteryEvent();
  eventState = { event: chosen.event, index: chosen.index, meta, candles, pivot, visible: candles.slice(pivot-context+1,pivot+1), hidden: candles.slice(pivot+1,pivot+1+chosen.event.revealBars), revealed: 0, decision: null, logged: false };
  renderEventState();
}

function renderEventState() {
  const e = eventState;
  if (!e) return;
  const complete = e.revealed >= e.hidden.length;
  app.querySelector('#eventArea').className = 'practice-grid';
  app.querySelector('#eventArea').innerHTML = `<div class="card chart-card"><div class="chart-toolbar"><span>${escapeHtml(e.meta.pair)} • ${escapeHtml(e.meta.timeframe)}</span><span class="spacer"></span><span>${complete ? toPhilippineTime(e.candles[e.pivot].timestamp) + ' PHT' : 'date hidden'}</span></div><div id="eventChart" class="chart"></div></div><aside class="control-stack">
  <div class="card"><span class="eyebrow">${complete ? escapeHtml(e.event.category) : 'Mystery historical event'}</span><h3>${complete ? escapeHtml(e.event.title) : 'What would you do before seeing the next candles?'}</h3>${complete ? `<p>${escapeHtml(e.event.summary)}</p><a class="source-link" href="${escapeHtml(e.event.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(e.event.sourceTitle)} ↗</a>` : `<div class="decision-grid"><button class="decision buy" data-event-decision="buy" ${e.decision?'disabled':''}>BUY</button><button class="decision sell" data-event-decision="sell" ${e.decision?'disabled':''}>SELL</button><button class="decision no-trade" data-event-decision="no-trade" ${e.decision?'disabled':''}>NO TRADE</button></div>`}</div>
  <div class="card"><span class="eyebrow">Replay</span><div class="button-row"><button class="primary" id="eventNext" ${e.decision && !complete ? '' : 'disabled'}>+1 candle</button><button class="ghost" id="eventAll" ${e.decision && !complete ? '' : 'disabled'}>Reveal all</button></div><div id="eventOutcome" class="lesson-meta">${complete ? eventOutcomeText() : e.decision ? 'Decision locked. Reveal the actual market window.' : 'Decision first; headline later.'}</div></div></aside>`;
  renderCandles(app.querySelector('#eventChart'), [...e.visible, ...e.hidden.slice(0, e.revealed)]);
  app.querySelectorAll('[data-event-decision]').forEach(b => b.onclick = () => { if (!e.decision) { e.decision = b.dataset.eventDecision; e.entry = e.visible.at(-1).close; renderEventState(); } });
  app.querySelector('#eventNext')?.addEventListener('click', () => revealEvent(1));
  app.querySelector('#eventAll')?.addEventListener('click', () => revealEvent(999));
}

function eventOutcomeText() {
  const e = eventState;
  if (!e?.decision) return '';
  const last = [...e.visible, ...e.hidden].at(-1);
  return `${directionOutcome(e.decision, e.entry, last.close).label}. Historical reaction shown; this does not make the decision automatically good or bad.`;
}

function revealEvent(count) {
  const e = eventState;
  if (!e?.decision) return;
  e.revealed = Math.min(e.hidden.length, e.revealed + count);
  const complete = e.revealed >= e.hidden.length;
  if (complete && !e.logged) {
    e.logged = true;
    progress.events.unshift({ id: e.event.id, decision: e.decision, pair: e.event.pair, at: new Date().toISOString() });
    progress.events = progress.events.slice(0, 100);
    saveProgress(progress);
  }
  renderEventState();
}

/* -------------------- Progress and sources -------------------- */
function renderProgress() {
  const completed = Object.keys(progress.completed || {}).length;
  const quizzes = Object.values(progress.quiz || {});
  const correct = quizzes.filter(q => q.correct).length;
  const drillTotal = progress.drills.length;
  const drillCorrect = progress.drills.filter(d => d.correct).length;
  const sessions = progress.sessions || [];
  const skills = DRILL_SKILLS.map(skill => ({ skill, stat: progress.skillStats?.[skill] })).sort((a, b) => skillAccuracy(a.stat) - skillAccuracy(b.stat));
  app.innerHTML = `<section class="hero"><span class="eyebrow">Local progress</span><h1>Find the weak spots.</h1><p>Stored only in this browser. The app weights weak and due drill categories more heavily next time.</p></section>
  <div class="metric-grid"><div class="card metric"><strong>${completed}/${lessonCount}</strong><span>Lessons passed</span></div><div class="card metric"><strong>${quizzes.length ? Math.round(correct / quizzes.length * 100) : 0}%</strong><span>Lesson quiz accuracy</span></div><div class="card metric"><strong>${drillTotal ? Math.round(drillCorrect / drillTotal * 100) : 0}%</strong><span>Dense drill accuracy</span></div><div class="card metric"><strong>${sessions.length}</strong><span>Trading sessions</span></div></div>
  <div class="card"><strong>Skill mastery</strong><div class="skill-list">${skills.map(({ skill, stat }) => { const pct = stat?.attempts ? Math.round(stat.correct / stat.attempts * 100) : 0; const due = !stat || stat.dueAt <= Date.now(); return `<div class="skill-row"><div><strong>${escapeHtml(skill)}</strong><small>${stat?.attempts || 0} attempts • ${due ? 'due now' : 'scheduled review'}</small></div><div class="mini-progress"><span style="width:${pct}%"></span></div><b>${pct}%</b></div>`; }).join('')}</div></div>
  <div class="card"><strong>Recent session results</strong>${sessions.length ? `<table><thead><tr><th>Market</th><th>P/L</th><th>Drawdown</th><th>Trades</th><th>Risk flags</th></tr></thead><tbody>${sessions.slice(0,10).map(s => `<tr><td>${escapeHtml(s.pair)} ${escapeHtml(s.timeframe)}</td><td class="${s.pnl >= 0 ? 'positive' : 'negative'}">${s.pnl >= 0 ? '+' : ''}${money(s.pnl)}</td><td>${s.maxDrawdown.toFixed(2)}%</td><td>${s.trades}</td><td>${s.violations}</td></tr>`).join('')}</tbody></table>` : '<p class="lesson-meta">No completed sessions yet.</p>'}</div>`;
}

function renderSources() {
  app.innerHTML = `<section class="hero"><span class="eyebrow">Accuracy & provenance</span><h1>Real data, explicit rules, honest limitations.</h1><p>Forex Lab separates factual source material from trainer-generated labels. Spot FX is OTC, so provider candles can differ slightly.</p></section>
  <div class="card"><h3>Historical price data</h3><p><strong>Dukascopy via dukascopy-node</strong>. V0.2 downloads bid-side M15 data and aggregates H1/H4 locally. Practice does not fabricate candles when the pack is missing.</p><a class="source-link" href="https://github.com/Leo4815162342/dukascopy-node" target="_blank" rel="noreferrer">Open-source downloader ↗</a></div>
  <div class="card"><h3>Dense-drill labels</h3><p>Structure and future-direction answers use transparent trainer rules (directional efficiency, ATR thresholds, EMA/RSI formulas). They are educational labels, not claims that a discretionary chart has one objectively correct interpretation.</p></div>
  <div class="card"><h3>Trading simulator limits</h3><p>USD training account only. Lot sizing supports the six majors in the data pack. Historical bid OHLC is used; spread, slippage, commissions and latency are omitted. Same-candle stop+target is marked ambiguous.</p></div>
  <div class="card"><h3>Primary historical-event sources</h3><p>Event cards cite the Federal Reserve, ECB, Bank of England, Bank of Japan and Japan Ministry of Finance. Event anchors are intentionally described as exact only when the primary source gives a release time.</p></div>
  <div class="card"><h3>Risk boundary</h3><p>This is an educational replay tool, not personalized financial advice, a signal service, a broker, or a profitability claim. Real-money execution is intentionally out of scope.</p><a class="source-link" href="https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html" target="_blank" rel="noreferrer">CFTC retail OTC forex advisory ↗</a></div>`;
}

const initial = (location.hash || '#learn').slice(1);
setView(['learn','practice','progress','about'].includes(initial) ? initial : 'learn');
