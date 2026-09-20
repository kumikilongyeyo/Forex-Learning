import { loadProgress } from './core.js';
import {
  SKILL_META, loadCoachState, saveCoachState, ingestProgress, buildMasteryModel,
  detectRootGap, gapLesson, interestProfile, confidenceCalibration, failureSummary,
  fatigueScore, recommendedMinutes, sessionPlan, chooseGauntletQuestions,
  scoreGauntlet, weeklyReport, clamp
} from './adaptive.js';

const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c]));
const labelSkill = s => SKILL_META[s]?.label || String(s || '').replaceAll('-', ' ');
let coach = ingestProgress(loadProgress(), loadCoachState());
let drawerTab = 'coach';
let timerHandle = null;
let contextHandle = null;
let syncHandle = null;
let currentGauntlet = null;
let toastTimer = null;
let targetNoticeShown = Boolean(coach.activeSession?.targetNoticeShown);
let fatigueNoticeAt = coach.attempts.length;
let lastActivityAt = Date.now();
const IDLE_MS = 90 * 1000;

function markActivity() { lastActivityAt = Date.now(); }
function isEngaged(now = Date.now()) { return !document.hidden && now - lastActivityAt <= IDLE_MS; }

function persist() { saveCoachState(coach); }

function mount() {
  if (document.querySelector('#coachFab')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <button id="coachFab" class="coach-fab" aria-controls="coachDrawer" aria-expanded="false">
      <span class="coach-dot"></span><span>Coach</span><strong id="coachFabTime"></strong>
    </button>
    <aside id="coachDrawer" class="coach-drawer" aria-hidden="true">
      <header class="coach-header"><div><span class="coach-kicker">Adaptive Forex Coach</span><h2>Your training brain</h2></div><button id="coachClose" class="coach-icon" aria-label="Close coach">×</button></header>
      <nav class="coach-tabs" aria-label="Coach sections">
        <button data-coach-tab="coach">Coach</button><button data-coach-tab="plan">Plan</button><button data-coach-tab="gauntlet">Gauntlet</button><button data-coach-tab="report">Report</button>
      </nav>
      <div id="coachBody" class="coach-body"></div>
    </aside>
    <div id="coachToast" class="coach-toast" role="status" aria-live="polite"></div>
  `);
  document.querySelector('#coachFab').onclick = toggleDrawer;
  document.querySelector('#coachClose').onclick = () => setDrawer(false);
  document.querySelectorAll('[data-coach-tab]').forEach(b => b.onclick = () => { drawerTab = b.dataset.coachTab; renderDrawer(); });
  renderDrawer();
  startLoops();
}

function setDrawer(open) {
  const drawer = document.querySelector('#coachDrawer');
  const fab = document.querySelector('#coachFab');
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  fab.setAttribute('aria-expanded', String(open));
  if (open) renderDrawer();
}
function toggleDrawer() { setDrawer(!document.querySelector('#coachDrawer')?.classList.contains('open')); }

function toast(message, tone = '') {
  const el = document.querySelector('#coachToast');
  if (!el) return;
  el.textContent = message;
  el.className = `coach-toast show ${tone}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'coach-toast'; }, 6500);
}

function startLoops() {
  clearInterval(timerHandle); clearInterval(contextHandle); clearInterval(syncHandle);
  timerHandle = setInterval(tickTimer, 1000);
  contextHandle = setInterval(trackContext, 10000);
  syncHandle = setInterval(syncProgress, 2500);
  ['pointerdown','keydown','wheel','touchstart'].forEach(type => document.addEventListener(type, markActivity, { passive:true }));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) markActivity();
    if (!document.hidden && coach.activeSession && !coach.activeSession.paused) coach.activeSession.lastTickAt = Date.now();
  });
  document.addEventListener('click', event => {
    const view = event.target.closest?.('[data-view]')?.dataset.view;
    const practice = event.target.closest?.('[data-practice]')?.dataset.practice;
    if (view) coach.interests[`view:${view}`] = (coach.interests[`view:${view}`] || 0) + 1;
    if (practice) coach.interests[`practice:${practice}`] = (coach.interests[`practice:${practice}`] || 0) + 2;
  }, { passive:true });
  tickTimer();
}

function syncProgress() {
  const before = coach.attempts.length;
  coach = ingestProgress(loadProgress(), coach);
  if (coach.attempts.length !== before) {
    persist();
    const fatigue = fatigueScore(coach.attempts);
    if (fatigue.score >= 70 && coach.attempts.length - fatigueNoticeAt >= 2) {
      fatigueNoticeAt = coach.attempts.length;
      toast(`Focus Guard: ${fatigue.reasons.join(', ') || 'learning quality is dropping'}. Finish the current item, then consider stopping.`, 'rest');
    }
    if (document.querySelector('#coachDrawer')?.classList.contains('open')) renderDrawer();
  }
}

function currentContext() {
  const view = document.querySelector('.tab.active')?.dataset.view || location.hash.slice(1) || 'learn';
  if (view === 'practice') return `practice:${document.querySelector('.practice-tab.active')?.dataset.practice || 'overview'}`;
  const lessonTitle = document.querySelector('.lesson-page .hero h2')?.textContent?.trim();
  return lessonTitle ? `lesson:${lessonTitle}` : `view:${view}`;
}

function trackContext() {
  if (!isEngaged()) return;
  const key = currentContext();
  coach.contextTime[key] = (coach.contextTime[key] || 0) + 10;
  persist();
}

function sessionElapsed(s) { return Math.max(0, Number(s?.activeSeconds || 0)); }
function remainingSeconds() {
  const s = coach.activeSession;
  if (!s) return null;
  return Math.max(0, s.targetMinutes * 60 - sessionElapsed(s));
}
function fmt(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  return `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;
}

function tickTimer() {
  const s = coach.activeSession;
  const now = Date.now();
  if (s && !s.paused && isEngaged(now)) {
    const prior = Number(s.lastTickAt || now);
    const delta = Math.min(3, Math.max(0, (now - prior) / 1000));
    s.activeSeconds = Number(s.activeSeconds || 0) + delta;
    s.lastTickAt = now;
    const remaining = remainingSeconds();
    if (remaining <= 0 && !targetNoticeShown) {
      targetNoticeShown = true; s.targetNoticeShown = true; persist();
      toast('Good session target reached. Finish your current question—then stop here and let the lesson settle.', 'rest');
    }
    if (Math.floor(s.activeSeconds) % 15 === 0) persist();
  } else if (s) s.lastTickAt = now;
  const fabTime = document.querySelector('#coachFabTime');
  if (fabTime) fabTime.textContent = s ? fmt(remainingSeconds()) : '';
  const timerText = document.querySelector('#coachTimerText');
  if (timerText) timerText.textContent = s ? fmt(remainingSeconds()) : '--:--';
  const timerBar = document.querySelector('#coachTimerBar');
  if (timerBar && s) timerBar.style.width = `${clamp(sessionElapsed(s) / (s.targetMinutes * 60) * 100)}%`;
}

function startSession(minutes) {
  const chosen = clamp(Number(minutes) || recommendedMinutes(coach), 10, 90);
  coach.activeSession = { startedAt:new Date().toISOString(), targetMinutes:chosen, activeSeconds:0, lastTickAt:Date.now(), paused:false, targetNoticeShown:false };
  targetNoticeShown = false;
  persist(); renderDrawer();
  toast(`Focus Guard started: ${chosen} minutes. It will tell you when enough is enough.`);
}
function pauseSession() {
  if (!coach.activeSession) return;
  coach.activeSession.paused = !coach.activeSession.paused;
  coach.activeSession.lastTickAt = Date.now(); persist(); renderDrawer();
}
function endSession() {
  const s = coach.activeSession;
  if (!s) return;
  const fatigue = fatigueScore(coach.attempts);
  coach.sessions.push({ ...s, endedAt:new Date().toISOString(), fatigue:fatigue.score });
  coach.sessions = coach.sessions.slice(-365);
  coach.activeSession = null; targetNoticeShown = false; persist(); renderDrawer();
  const minutes = Math.max(1, Math.round(s.activeSeconds / 60));
  const rest = fatigue.score >= 48 || minutes >= 45;
  toast(rest ? `Good session: ${minutes} min. Stop here and come back fresh tomorrow.` : `Session saved: ${minutes} min. Short, clean work beats grinding tired.`, 'rest');
}

function renderDrawer() {
  document.querySelectorAll('[data-coach-tab]').forEach(b => b.classList.toggle('active', b.dataset.coachTab === drawerTab));
  const body = document.querySelector('#coachBody');
  if (!body) return;
  if (drawerTab === 'coach') renderCoach(body);
  if (drawerTab === 'plan') renderPlan(body);
  if (drawerTab === 'gauntlet') renderGauntlet(body);
  if (drawerTab === 'report') renderReport(body);
  tickTimer();
}

function masteryBadge(item) {
  const tone = item.score >= 75 ? 'good' : item.score >= 55 ? 'mid' : item.attempts ? 'weak' : 'muted';
  return `<div class="coach-skill ${tone}"><div><strong>${escapeHtml(labelSkill(item.skill))}</strong><small>${escapeHtml(item.state)} • ${item.attempts} evidence</small></div><b>${item.attempts ? item.score : '—'}</b></div>`;
}

function renderCoach(body) {
  const root = detectRootGap(coach);
  const fatigue = fatigueScore(coach.attempts);
  const lesson = root ? gapLesson(coach, root.skill) : null;
  const calibration = confidenceCalibration(coach);
  const recommended = recommendedMinutes(coach);
  body.innerHTML = `
    <section class="coach-hero">
      <span class="coach-kicker">Today</span>
      <h3>${root ? `Fix ${escapeHtml(labelSkill(root.skill))} first.` : 'Build evidence, then the coach adapts.'}</h3>
      <p>${root ? `This looks like the highest-leverage gap${root.downstream?.length ? ` and may be dragging down ${root.downstream.map(labelSkill).join(', ')}` : ''}.` : 'Complete lessons and drills normally. The coach watches patterns instead of judging one bad answer.'}</p>
    </section>
    <section class="coach-card focus-card">
      <div class="coach-row"><div><span class="coach-kicker">Focus Guard</span><h3 id="coachTimerText">--:--</h3></div><span class="focus-state">${escapeHtml(fatigue.label)}</span></div>
      <div class="coach-progress"><span id="coachTimerBar"></span></div>
      ${coach.activeSession ? `<p>${coach.activeSession.paused ? 'Paused. Rest is allowed.' : 'Timer counts engaged foreground learning time and pauses after 90 seconds idle. It will not cut off a question.'}</p><div class="coach-actions"><button id="pauseCoach">${coach.activeSession.paused ? 'Resume' : 'Pause'}</button><button id="endCoach" class="danger-soft">End session</button></div>` : `<p>Recommended today: <strong>${recommended} min</strong>. You can change this in Plan.</p><button id="quickStartCoach" class="coach-primary">Start ${recommended}-min session</button>`}
    </section>
    ${lesson ? `<section class="coach-card gap-card"><span class="coach-kicker">Gap lesson • ${escapeHtml(lesson.levelLabel)}</span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.explanation)}</p><div class="coach-actions"><button id="simplerGap">Explain even simpler</button><button id="testGap" class="coach-primary">Test this gap</button></div><div id="gapTestArea"></div></section>` : ''}
    <section class="coach-card"><div class="coach-row"><div><span class="coach-kicker">Confidence calibration</span><strong>${escapeHtml(calibration.label)}</strong></div><b>${calibration.samples ? `${calibration.gap > 0 ? '+' : ''}${calibration.gap}` : '—'}</b></div><p>${calibration.samples ? `${calibration.samples} confidence-tagged answers. Positive gap = confidence is running ahead of accuracy.` : 'Gauntlet and gap checks collect confidence so the app can detect confident misconceptions.'}</p></section>
  `;
  body.querySelector('#quickStartCoach')?.addEventListener('click', () => startSession(recommended));
  body.querySelector('#pauseCoach')?.addEventListener('click', pauseSession);
  body.querySelector('#endCoach')?.addEventListener('click', endSession);
  body.querySelector('#simplerGap')?.addEventListener('click', () => {
    const skill = root.skill;
    coach.explanationLevels[skill] = clamp(Number(coach.explanationLevels[skill] || 0) + 1, 0, 3);
    persist(); renderDrawer();
  });
  body.querySelector('#testGap')?.addEventListener('click', () => renderGapCheck(root.skill));
}

function renderGapCheck(skill) {
  const area = document.querySelector('#gapTestArea');
  if (!area) return;
  delete area.dataset.done;
  const l = gapLesson(coach, skill);
  const started = Date.now();
  area.innerHTML = `<div class="gap-check"><strong>${escapeHtml(l.check.q)}</strong><div class="coach-choice-grid">${l.check.choices.map(c => `<button data-gap-answer="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><div class="confidence-row"><span>Confidence</span>${[25,50,75,100].map(n => `<button data-gap-confidence="${n}" class="${n===50?'active':''}">${n}%</button>`).join('')}</div><div id="gapResult"></div></div>`;
  let confidence = 50;
  area.querySelectorAll('[data-gap-confidence]').forEach(b => b.onclick = () => { confidence = Number(b.dataset.gapConfidence); area.querySelectorAll('[data-gap-confidence]').forEach(x => x.classList.toggle('active', x === b)); });
  area.querySelectorAll('[data-gap-answer]').forEach(b => b.onclick = () => {
    if (area.dataset.done) return;
    area.dataset.done = '1';
    const correct = b.dataset.gapAnswer === l.check.answer;
    area.querySelectorAll('[data-gap-answer]').forEach(x => { x.disabled = true; if (x.dataset.gapAnswer === l.check.answer) x.classList.add('correct'); });
    if (!correct) b.classList.add('wrong');
    coach.attempts.push({ source:'gap-lesson', skill, correct, answer:b.dataset.gapAnswer, expected:l.check.answer, confidence, responseMs:Date.now()-started, at:new Date().toISOString() });
    persist();
    area.querySelector('#gapResult').innerHTML = `<p class="coach-result ${correct?'good':'weak'}"><strong>${correct?'Good.':'Gap still active.'}</strong> ${correct ? 'We will retest this later in a different context.' : 'The coach will increase remediation weight and simplify again if this repeats.'}</p>`;
  });
}

function renderPlan(body) {
  const plan = sessionPlan(coach, coach.settings.autoRecommend ? null : coach.settings.sessionMinutes);
  const root = plan.rootGap;
  body.innerHTML = `
    <section class="coach-hero"><span class="coach-kicker">Adaptive session plan</span><h3>${plan.minutes} minutes, with a reason.</h3><p>${escapeHtml(plan.reason)}</p></section>
    <section class="coach-card"><label class="coach-label">Session length</label><div class="duration-grid">${[15,30,45,60].map(n => `<button data-duration="${n}" class="${!coach.settings.autoRecommend && coach.settings.sessionMinutes===n?'active':''}">${n} min</button>`).join('')}<button data-duration="auto" class="${coach.settings.autoRecommend?'active':''}">Coach decides</button></div></section>
    <section class="coach-timeline">${plan.phases.map((p,i) => `<div><span>${i+1}</span><div><strong>${escapeHtml(p.name)}</strong><small>${p.minutes} min</small></div></div>`).join('')}</section>
    ${root ? `<section class="coach-card"><span class="coach-kicker">Why this detour exists</span><h3>${escapeHtml(labelSkill(root.skill))} • ${root.score}/100</h3><p>We keep the main curriculum moving, but temporarily increase weakness work. The coach does not trap you in remedial mode forever.</p><div class="ratio-bar"><span style="width:${root.score < 48 ? 45 : 25}%"></span></div><small>${root.score < 48 ? '45% remediation / 40% curriculum / 15% review' : '25% remediation / 60% curriculum / 15% review'}</small></section>` : ''}
    <button id="startPlan" class="coach-primary coach-full">Start this session</button>
  `;
  body.querySelectorAll('[data-duration]').forEach(b => b.onclick = () => {
    if (b.dataset.duration === 'auto') coach.settings.autoRecommend = true;
    else { coach.settings.autoRecommend = false; coach.settings.sessionMinutes = Number(b.dataset.duration); }
    persist(); renderDrawer();
  });
  body.querySelector('#startPlan').onclick = () => startSession(plan.minutes);
}

function renderGauntlet(body) {
  if (!currentGauntlet) {
    const last = coach.gauntlets.at(-1);
    body.innerHTML = `<section class="coach-hero"><span class="coach-kicker">Adaptive Gauntlet</span><h3>Know it → see it → apply it → pressure test it.</h3><p>Questions are weighted toward your root gaps. Confidence is scored separately so confidently wrong answers become misconceptions, not ordinary misses.</p></section>
      ${last ? `<section class="coach-card"><span class="coach-kicker">Last Gauntlet</span><div class="score-orb">${last.score.overall}</div><p>Accuracy ${last.score.accuracy} • confidence fit ${last.score.confidenceFit} • applied/pressure ${last.score.pressure}</p></section>` : ''}
      <button id="startGauntlet" class="coach-primary coach-full">Start 10-question Gauntlet</button>`;
    body.querySelector('#startGauntlet').onclick = startGauntlet;
    return;
  }
  if (currentGauntlet.done) return renderGauntletSummary(body);
  renderGauntletQuestion(body);
}

function startGauntlet() {
  currentGauntlet = { questions:chooseGauntletQuestions(coach, 10), index:0, answers:[], selected:null, confidence:50, startedAt:new Date().toISOString(), questionStarted:Date.now(), done:false };
  renderDrawer();
}

function renderGauntletQuestion(body) {
  const g = currentGauntlet;
  const q = g.questions[g.index];
  body.innerHTML = `<section class="coach-hero"><span class="coach-kicker">${escapeHtml(q.stage)} • ${g.index+1}/${g.questions.length}</span><h3>${escapeHtml(labelSkill(q.skill))}</h3><p>${escapeHtml(q.q)}</p></section>
    <div class="coach-choice-grid large">${q.choices.map(c => `<button data-gauntlet-answer="${escapeHtml(c)}" class="${g.selected===c?'active':''}">${escapeHtml(c)}</button>`).join('')}</div>
    <section class="coach-card"><label class="coach-label">How confident are you?</label><div class="confidence-row gauntlet-confidence">${[25,50,75,100].map(n => `<button data-gauntlet-confidence="${n}" class="${g.confidence===n?'active':''}">${n}%</button>`).join('')}</div></section>
    <button id="lockGauntlet" class="coach-primary coach-full" ${g.selected?'':'disabled'}>Lock answer</button>`;
  body.querySelectorAll('[data-gauntlet-answer]').forEach(b => b.onclick = () => { g.selected=b.dataset.gauntletAnswer; renderGauntletQuestion(body); });
  body.querySelectorAll('[data-gauntlet-confidence]').forEach(b => b.onclick = () => { g.confidence=Number(b.dataset.gauntletConfidence); renderGauntletQuestion(body); });
  body.querySelector('#lockGauntlet').onclick = lockGauntlet;
}

function lockGauntlet() {
  const g = currentGauntlet; const q = g.questions[g.index];
  if (!g.selected) return;
  const correct = g.selected === q.answer;
  const row = { questionId:q.id, skill:q.skill, stage:q.stage, answer:g.selected, expected:q.answer, correct, confidence:g.confidence, responseMs:Date.now()-g.questionStarted, at:new Date().toISOString() };
  g.answers.push(row);
  coach.attempts.push({ ...row, source:'gauntlet' });
  coach.attempts = coach.attempts.slice(-2500);
  persist();
  g.index += 1; g.selected=null; g.confidence=50; g.questionStarted=Date.now();
  if (g.index >= g.questions.length) g.done=true;
  renderDrawer();
}

function renderGauntletSummary(body) {
  const g = currentGauntlet;
  if (!g.score) {
    g.score = scoreGauntlet(g.answers);
    coach.gauntlets.push({ at:new Date().toISOString(), startedAt:g.startedAt, score:g.score, answers:g.answers });
    coach.gauntlets = coach.gauntlets.slice(-100); persist();
  }
  const rows = Object.entries(g.score.breakdown).sort((a,b) => a[1].score-b[1].score);
  const root = detectRootGap(coach);
  body.innerHTML = `<section class="coach-hero center"><span class="coach-kicker">Gauntlet complete</span><div class="score-orb big">${g.score.overall}</div><h3>${g.score.overall >= 80 ? 'Strong transfer.' : g.score.overall >= 65 ? 'Functional, with gaps.' : 'We found useful weaknesses.'}</h3><p>Outcome is not punishment. This score exists to restructure what comes next.</p></section>
    <div class="metric-grid"><div><strong>${g.score.accuracy}</strong><small>Accuracy</small></div><div><strong>${g.score.confidenceFit}</strong><small>Confidence fit</small></div><div><strong>${g.score.pressure}</strong><small>Applied/pressure</small></div></div>
    <section class="coach-card"><span class="coach-kicker">Skill breakdown</span>${rows.map(([skill,v]) => `<div class="mini-row"><span>${escapeHtml(labelSkill(skill))}</span><strong>${v.score}</strong></div>`).join('')}</section>
    ${root ? `<section class="coach-card gap-card"><span class="coach-kicker">Next root gap</span><h3>${escapeHtml(labelSkill(root.skill))}</h3><p>This now gets extra weight in your next plan${root.downstream?.length ? ` because it may be affecting ${root.downstream.map(labelSkill).join(', ')}` : ''}.</p></section>` : ''}
    <button id="finishGauntlet" class="coach-primary coach-full">Use results in my plan</button>`;
  body.querySelector('#finishGauntlet').onclick = () => { currentGauntlet=null; drawerTab='plan'; renderDrawer(); };
}

function renderReport(body) {
  const mastery = buildMasteryModel(coach).filter(x => x.attempts).sort((a,b) => a.score-b.score);
  const failures = failureSummary(coach).slice(0,4);
  const interests = interestProfile(coach).slice(0,5);
  const week = weeklyReport(coach);
  const fatigue = fatigueScore(coach.attempts);
  body.innerHTML = `<section class="coach-hero"><span class="coach-kicker">Learning profile</span><h3>${mastery.length ? `${mastery.length} skills with evidence.` : 'Not enough evidence yet.'}</h3><p>The coach separates performance, interest and focus. Low interest never lets you skip an important weak skill—it only changes how examples are framed.</p></section>
    <section class="coach-card"><span class="coach-kicker">Weak → strong</span><div class="skill-stack">${mastery.length ? mastery.map(masteryBadge).join('') : '<p>Finish a few lessons/drills first.</p>'}</div></section>
    <section class="coach-card"><span class="coach-kicker">Failure pattern</span>${failures.length ? failures.map(x => `<div class="mini-row"><span>${escapeHtml(x.type)}</span><strong>${x.count}</strong></div>`).join('') : '<p>No repeated failure pattern yet.</p>'}</section>
    <section class="coach-card"><span class="coach-kicker">Interest / time spent</span>${interests.length ? interests.map(x => `<div class="mini-row"><span>${escapeHtml(x.topic.replace('view:','').replace('practice:','Practice • ').replace('lesson:','Lesson • '))}</span><strong>${Math.max(1,Math.round(x.seconds/60))}m</strong></div>`).join('') : '<p>Interest profile grows from voluntary time and choices, not from wrong answers.</p>'}</section>
    <section class="coach-card"><span class="coach-kicker">Last 7 days</span><div class="metric-grid compact"><div><strong>${week.minutes}</strong><small>Focus min</small></div><div><strong>${week.attempts}</strong><small>Answers</small></div><div><strong>${fatigue.score}</strong><small>Current fatigue</small></div></div><p>${week.rootGap ? `Priority: ${escapeHtml(labelSkill(week.rootGap.skill))}.` : 'Keep collecting evidence.'} ${week.topInterest ? `Most time: ${escapeHtml(week.topInterest.topic.replaceAll(':',' • '))}.` : ''}</p></section>`;
}

window.addEventListener('DOMContentLoaded', mount);
if (document.readyState !== 'loading') mount();
