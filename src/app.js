import { modules, lessonCount } from './curriculum.js';
import { loadProgress, saveProgress, toPhilippineTime, directionOutcome, evaluateBracket, riskReward } from './core.js';
import { renderCandles } from './chart.js';

const app = document.querySelector('#app');
const tabs = [...document.querySelectorAll('.tab')];
let progress = loadProgress();
let activeModule = modules[0].id;
let activeLesson = null;
let manifest = null;
let dataset = null;
let scenario = null;
let revealTimer = null;

const escapeHtml = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

function setView(view) {
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
  return `<aside class="sidebar"><h2>Curriculum</h2>${modules.map(m=>{
    const done = m.lessons.filter(l=>progress.completed?.[l.id]).length;
    return `<button class="module-btn ${activeModule===m.id?'active':''}" data-module="${m.id}">${escapeHtml(m.title)}<small>${done}/${m.lessons.length} lessons</small></button>`;
  }).join('')}</aside>`;
}

function renderLearn() {
  const module = modules.find(m=>m.id===activeModule) || modules[0];
  if (activeLesson) return renderLesson(activeLesson);
  app.innerHTML = `<div class="layout">${sidebarHtml()}<section class="content">
    <div class="hero"><span class="eyebrow">Structured learning path</span><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.subtitle)}</p>
    <div class="stats-row"><span class="pill">${lessonCount} core lessons</span><span class="pill">Taglish explanations</span><span class="pill">Progress ${completionPct()}%</span></div></div>
    <div class="lesson-list">${module.lessons.map((l,i)=>{const unlocked=isUnlocked(l.id);return `<article class="lesson-row ${progress.completed?.[l.id]?'done':''} ${unlocked?'':'locked'}" data-lesson="${l.id}" data-unlocked="${unlocked}"><span class="lesson-num">${progress.completed?.[l.id]?'✓':unlocked?i+1:'🔒'}</span><div><div class="lesson-title">${escapeHtml(l.title)}</div><div class="lesson-meta">${escapeHtml(unlocked?l.objective:'Pass the previous lesson to unlock.')}</div></div><span class="lesson-meta">${l.minutes} min</span></article>`;}).join('')}</div>
  </section></div>`;
  bindLearnNav();
}

function bindLearnNav() {
  app.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>{activeModule=b.dataset.module;activeLesson=null;renderLearn();}));
  app.querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.unlocked!=='true') return; activeLesson=b.dataset.lesson;renderLearn();}));
}

function renderLesson(id) {
  const module = modules.find(m=>m.lessons.some(l=>l.id===id));
  const l = module.lessons.find(x=>x.id===id);
  app.innerHTML = `<div class="layout">${sidebarHtml()}<section class="content lesson-page">
    <button class="ghost" id="backLessons">← ${escapeHtml(module.title)}</button>
    <div class="hero"><span class="eyebrow">${l.minutes} min • lesson</span><h2>${escapeHtml(l.title)}</h2><p class="objective">Goal: ${escapeHtml(l.objective)}</p></div>
    <div class="card"><strong>Key ideas</strong><div class="keypoints">${l.points.map(p=>`<div class="keypoint">${escapeHtml(p)}</div>`).join('')}</div></div>
    <div class="card quiz"><span class="eyebrow">Knowledge check</span><h3>${escapeHtml(l.quiz.question)}</h3><div class="choices">${l.quiz.choices.map(c=>`<button class="choice" data-answer="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div><div id="feedback"></div></div>
  </section></div>`;
  document.querySelector('#backLessons').onclick=()=>{activeLesson=null;renderLearn();};
  bindLearnNav();
  app.querySelectorAll('.choice').forEach(btn=>btn.onclick=()=>{
    const correct=btn.dataset.answer===l.quiz.answer;
    app.querySelectorAll('.choice').forEach(x=>{x.disabled=true;if(x.dataset.answer===l.quiz.answer)x.classList.add('correct');});
    if(!correct)btn.classList.add('wrong');
    app.querySelector('#feedback').innerHTML=`<div class="feedback"><strong>${correct?'Correct.':'Not quite.'}</strong> ${escapeHtml(l.quiz.explain)}</div>`;
    progress.quiz[l.id]={correct,at:new Date().toISOString()};
    if(correct)progress.completed[l.id]=true;
    saveProgress(progress);
  });
}

async function loadManifest() {
  try { const r=await fetch('./public/data/manifest.json',{cache:'no-store'}); manifest=await r.json(); }
  catch { manifest={datasets:[]}; }
}

async function loadDataset(path) {
  const r=await fetch(path,{cache:'no-store'});
  if(!r.ok) throw new Error('Dataset failed to load');
  return r.json();
}

function pickScenario(candles) {
  if (candles.length < 150) return null;
  const context=90, future=30;
  const min=context, max=candles.length-future-1;
  const pivot=Math.floor(min+Math.random()*(max-min));
  return { pivot, context, future, visible:candles.slice(pivot-context,pivot+1), hidden:candles.slice(pivot+1,pivot+1+future), revealed:0, decision:null };
}

async function renderPractice() {
  await loadManifest();
  const hasData=manifest?.datasets?.length;
  app.innerHTML=`<section class="hero"><span class="eyebrow">Historical replay lab</span><h1>Practice on real market data.</h1><p>Random historical window, future candles hidden. Make a decision first, then reveal what actually happened. Outcome ≠ decision quality.</p></section>
  ${!hasData?`<div class="data-warning"><strong>Real-data pack not installed yet.</strong><p>We deliberately do not generate fake candles. From the repo folder run:</p><code class="code">npm install\nnpm run data:sample</code><p>Sample installs real H1 data across 2020–2025. <code>npm run data:all</code> installs the wider pack.</p></div>`:''}
  <div class="practice-grid">
    <div class="card chart-card"><div class="chart-toolbar"><select id="datasetSelect" ${hasData?'':'disabled'}>${hasData?manifest.datasets.map((d,i)=>`<option value="${i}">${d.pair} • ${d.timeframe} • ${d.from}–${d.to}</option>`).join(''):'<option>No dataset</option>'}</select><button class="ghost" id="newScenario" ${hasData?'':'disabled'}>New random scenario</button><span class="spacer"></span><label><input type="checkbox" id="emaToggle"> EMA 20/50</label></div><div class="chart" id="chart"></div></div>
    <aside class="control-stack">
      <div class="card"><span class="eyebrow">Decision</span><h3 id="scenarioTitle">${hasData?'Load a scenario':'Install data first'}</h3><p id="scenarioMeta">Dates are hidden until reveal. Display timezone: Asia/Manila.</p><div class="decision-grid"><button class="decision buy" data-decision="buy" ${hasData?'':'disabled'}>BUY</button><button class="decision sell" data-decision="sell" ${hasData?'':'disabled'}>SELL</button><button class="decision no-trade" data-decision="no-trade" ${hasData?'':'disabled'}>NO TRADE</button></div></div>
      <div class="card"><span class="eyebrow">Replay</span><div class="control-stack"><button class="primary" id="nextCandle" disabled>Reveal next candle</button><button class="ghost" id="revealAll" disabled>Reveal all</button><div id="outcome" class="lesson-meta">Choose first. No answer-changing after reveal.</div></div></div>
      <div class="card"><strong>Why?</strong><p class="lesson-meta">Write a 1–2 sentence reason before revealing. This is intentionally local-only.</p><textarea id="tradeNote" rows="5" style="width:100%;background:#0e1115;color:#e8eaed;border:1px solid #2a3038;border-radius:9px;padding:9px" placeholder="Example: H1 higher lows, but price is directly under resistance, so I skip."></textarea></div>
    </aside>
  </div>`;
  if(!hasData){ renderCandles(app.querySelector('#chart'),[]); return; }
  app.querySelector('#newScenario').onclick=()=>startScenario();
  app.querySelector('#datasetSelect').onchange=()=>{dataset=null;scenario=null;startScenario();};
  app.querySelector('#emaToggle').onchange=()=>drawScenario();
  app.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>lockDecision(b.dataset.decision));
  app.querySelector('#nextCandle').onclick=()=>revealNext();
  app.querySelector('#revealAll').onclick=()=>revealAll();
  await startScenario();
}

async function startScenario() {
  clearInterval(revealTimer);
  const index=Number(app.querySelector('#datasetSelect').value);
  const d=manifest.datasets[index];
  if(!dataset || dataset.__path!==d.path){
    const data=await loadDataset(d.path); dataset=Array.isArray(data)?data:data.candles; dataset.__path=d.path;
  }
  scenario=pickScenario(dataset);
  if(!scenario){app.querySelector('#outcome').textContent='Dataset is too short for replay.';return;}
  app.querySelector('#scenarioTitle').textContent=`${d.pair} • ${d.timeframe}`;
  app.querySelector('#scenarioMeta').textContent='Historical date hidden. Future locked.';
  app.querySelector('#outcome').textContent='Choose BUY / SELL / NO TRADE, then reveal.';
  app.querySelector('#tradeNote').value='';
  app.querySelector('#nextCandle').disabled=true;app.querySelector('#revealAll').disabled=true;
  app.querySelectorAll('[data-decision]').forEach(b=>{b.disabled=false;b.style.opacity='1'});
  drawScenario();
}

function drawScenario() {
  if(!scenario)return;
  const candles=[...scenario.visible,...scenario.hidden.slice(0,scenario.revealed)];
  renderCandles(app.querySelector('#chart'),candles,{showEma:app.querySelector('#emaToggle')?.checked});
}

function lockDecision(decision) {
  if(!scenario || scenario.decision)return;
  scenario.decision=decision;
  scenario.note=app.querySelector('#tradeNote').value.trim();
  scenario.entry=scenario.visible.at(-1).close;
  app.querySelectorAll('[data-decision]').forEach(b=>{b.disabled=true;b.style.opacity=b.dataset.decision===decision?'1':'.38'});
  app.querySelector('#nextCandle').disabled=false;app.querySelector('#revealAll').disabled=false;
  app.querySelector('#outcome').textContent='Decision locked. Now reveal the actual future candles.';
}

function revealNext() {
  if(!scenario?.decision || scenario.revealed>=scenario.hidden.length)return;
  scenario.revealed+=1; drawScenario(); updateOutcome();
}
function revealAll(){ if(!scenario?.decision)return;scenario.revealed=scenario.hidden.length;drawScenario();updateOutcome(true); }

function updateOutcome(done=false) {
  const last=[...scenario.visible,...scenario.hidden.slice(0,scenario.revealed)].at(-1);
  const out=directionOutcome(scenario.decision,scenario.entry,last.close);
  const all= scenario.revealed>=scenario.hidden.length || done;
  app.querySelector('#scenarioMeta').textContent=`Last revealed: ${toPhilippineTime(last.timestamp)} PHT${all?' • scenario complete':''}`;
  app.querySelector('#outcome').innerHTML=`<strong>${escapeHtml(out.label)}</strong><br>${all?'Historical window complete. Review your reason before judging yourself.':'More future remains hidden.'}`;
  if(all){
    app.querySelector('#nextCandle').disabled=true;
    app.querySelector('#revealAll').disabled=true;
    const d=manifest.datasets[Number(app.querySelector('#datasetSelect').value)];
    progress.practice.unshift({pair:d.pair,timeframe:d.timeframe,decision:scenario.decision,entry:scenario.entry,final:last.close,note:scenario.note,at:new Date().toISOString(),historicalAt:last.timestamp});
    progress.practice=progress.practice.slice(0,200);saveProgress(progress);
  }
}

function renderProgress(){
  const completed=Object.keys(progress.completed||{}).length;
  const quizzes=Object.values(progress.quiz||{});const correct=quizzes.filter(q=>q.correct).length;
  const practices=progress.practice||[];
  app.innerHTML=`<section class="hero"><span class="eyebrow">Local progress</span><h1>Measure the process.</h1><p>Progress is stored only in this browser using localStorage. P/L is intentionally not the only scoreboard.</p></section>
  <div class="metric-grid"><div class="card metric"><strong>${completed}/${lessonCount}</strong><span>Lessons passed</span></div><div class="card metric"><strong>${quizzes.length?Math.round(correct/quizzes.length*100):0}%</strong><span>Quiz accuracy</span></div><div class="card metric"><strong>${practices.length}</strong><span>Historical decisions logged</span></div></div>
  <div class="card"><strong>Course completion</strong><div class="progressbar" style="margin-top:12px"><span style="width:${completionPct()}%"></span></div></div>
  <div class="card"><strong>Recent practice</strong>${practices.length?`<table><thead><tr><th>Pair</th><th>Decision</th><th>Reason</th><th>Logged</th></tr></thead><tbody>${practices.slice(0,12).map(p=>`<tr><td>${escapeHtml(p.pair)} ${escapeHtml(p.timeframe)}</td><td>${escapeHtml(p.decision.toUpperCase())}</td><td>${escapeHtml(p.note||'—')}</td><td>${new Date(p.at).toLocaleDateString('en-PH')}</td></tr>`).join('')}</tbody></table>`:'<p class="lesson-meta">No replay decisions yet.</p>'}</div>`;
}

function renderSources(){
  app.innerHTML=`<section class="hero"><span class="eyebrow">Accuracy & provenance</span><h1>Where the material comes from.</h1><p>Primary sources for market structure facts, official economic events, and regulatory risk warnings. Historical prices are downloaded locally and never presented as one universal “official” FX price.</p></section>
  <div class="card"><h3>Historical price data</h3><p><strong>Dukascopy via dukascopy-node</strong> — open-source downloader used by the data-install scripts. Spot FX is OTC, so feeds may differ slightly between dealers/providers.</p><a class="source-link" href="https://github.com/Leo4815162342/dukascopy-node" target="_blank" rel="noreferrer">Open project ↗</a></div>
  <div class="card"><h3>Risk / market structure</h3><p><strong>U.S. CFTC</strong> — retail OTC forex mechanics, dealer relationship, leverage and loss-risk warnings.</p><a class="source-link" href="https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html" target="_blank" rel="noreferrer">CFTC advisory ↗</a></div>
  <div class="card"><h3>Official macro-event sources</h3><p>Federal Reserve, BLS, ECB, Bank of England, Bank of Japan and government intervention records are preferred for historical event lessons instead of reposted trading-blog summaries.</p></div>
  <div class="card"><h3>Important boundary</h3><p>This app teaches concepts and replay discipline. It does not provide personalized investment advice, broker recommendations, live signals, or a claim that any strategy is profitable.</p></div>`;
}

const initial=(location.hash||'#learn').slice(1);
setView(['learn','practice','progress','about'].includes(initial)?initial:'learn');
