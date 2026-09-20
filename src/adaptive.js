export const COACH_STORAGE_KEY = 'forex-lab-adaptive-coach-v1';

export const SKILL_META = {
  foundations: { label: 'Forex foundations', parent: null },
  candles: { label: 'Candles', parent: 'foundations' },
  structure: { label: 'Market structure', parent: 'candles' },
  regime: { label: 'Trend vs range', parent: 'structure' },
  levels: { label: 'Support / resistance', parent: 'structure' },
  risk: { label: 'Risk sizing', parent: 'foundations' },
  volatility: { label: 'Volatility / ATR', parent: 'candles' },
  indicators: { label: 'Indicators', parent: 'candles' },
  sessions: { label: 'Sessions / timing', parent: 'foundations' },
  fundamentals: { label: 'Fundamentals / news', parent: 'foundations' },
  'entry-selection': { label: 'Entry selection', parent: 'regime' },
  'stop-placement': { label: 'Stop placement', parent: 'volatility' },
  discipline: { label: 'NO TRADE / discipline', parent: 'regime' },
  execution: { label: 'Trade execution', parent: 'entry-selection' },
  retention: { label: 'Retention', parent: null }
};

export const DEPENDENCIES = {
  candles: ['foundations'],
  structure: ['candles'],
  regime: ['structure'],
  levels: ['structure'],
  volatility: ['candles'],
  indicators: ['candles'],
  'entry-selection': ['regime', 'levels', 'structure'],
  'stop-placement': ['volatility', 'structure', 'risk'],
  discipline: ['regime', 'risk'],
  execution: ['entry-selection', 'stop-placement', 'risk', 'discipline'],
  fundamentals: ['sessions']
};

const MODULE_SKILLS = {
  m1: 'foundations', m2: 'candles', m3: 'structure', m4: 'levels', m5: 'risk',
  m6: 'indicators', m7: 'sessions', m8: 'fundamentals', m9: 'execution', m10: 'discipline'
};

const CORE_FOCUS = {
  foundations: 'Forex Foundations', candles: 'Candles & Price', structure: 'Market Structure',
  regime: 'Market Structure', levels: 'Support, Resistance & Location', risk: 'Risk & Position Sizing',
  volatility: 'Indicators / ATR', indicators: 'Indicators', sessions: 'Sessions & Philippine Time',
  fundamentals: 'Fundamentals & News', 'entry-selection': 'Strategy Building & Backtesting',
  'stop-placement': 'Risk & Position Sizing', discipline: 'Psychology & Execution', execution: 'Psychology & Execution'
};

const DRILL_SKILL_MAP = {
  structure: 'structure', direction: 'regime', candles: 'candles', ema: 'indicators', rsi: 'indicators', risk: 'risk'
};

export const EXPLANATION_LIBRARY = {
  foundations: {
    title: 'Base vs quote currency',
    levels: [
      'A forex pair is a comparison. In EUR/USD, EUR is what you are measuring and USD is the ruler used to price it.',
      'Think “1 EUR costs how many USD?” If EUR/USD is 1.1000, one euro costs about 1.10 dollars.',
      'Left side = thing. Right side = price tag. EUR / USD → EUR is the thing, USD is the price tag.',
      'One rule only: read the pair as “one LEFT currency costs X RIGHT currency.” Ignore everything else until that feels automatic.'
    ],
    check: { q: 'EUR/USD rises from 1.10 to 1.12. Which currency strengthened relative to the other?', choices: ['EUR', 'USD', 'Neither'], answer: 'EUR' }
  },
  candles: {
    title: 'Read the candle before interpreting it',
    levels: [
      'A candle stores four facts: open, high, low and close. Body shows open-to-close; wicks show the extremes reached.',
      'Body = where price started and finished. Wick = where price visited but did not finish.',
      'Imagine a trip: open is home, high/low are the furthest places visited, close is where the trip ended.',
      'One rule: body tells the start/finish relationship. Wicks only tell excursions. A wick alone is not a reversal signal.'
    ],
    check: { q: 'A long upper wick proves the next candle must fall. True or false?', choices: ['True', 'False'], answer: 'False' }
  },
  structure: {
    title: 'Structure is a sequence, not one candle',
    levels: [
      'Uptrend structure repeatedly makes higher highs and higher lows. Downtrend structure repeatedly makes lower highs and lower lows.',
      'Do not judge trend from one green or red candle. Compare important swing points.',
      'Stairs analogy: stairs climbing = HH + HL. Stairs descending = LH + LL. Flat messy stairs = range.',
      'One rule: mark the last two meaningful highs and lows. If both sides are not progressing, do not force a trend label.'
    ],
    check: { q: 'HH → HL → HH is most consistent with:', choices: ['Uptrend structure', 'Downtrend structure', 'No information'], answer: 'Uptrend structure' }
  },
  regime: {
    title: 'Trend vs range before direction',
    levels: [
      'A trend travels directionally; a range repeatedly rotates between areas. The same entry logic should not be used in both.',
      'Ask “Is price making progress?” If it keeps coming back to the same zone, treat it more like a range.',
      'Trend = walking somewhere. Range = pacing around the room.',
      'One rule: before BUY or SELL, answer only this: TREND, RANGE, or UNCLEAR. If unclear, NO TRADE is allowed.'
    ],
    check: { q: 'Price keeps rejecting the same high and low zones with little net progress. Best label?', choices: ['Trend', 'Range', 'Guaranteed breakout'], answer: 'Range' }
  },
  levels: {
    title: 'Zones, not magic laser lines',
    levels: [
      'Support and resistance are areas where price previously reacted. Treat them as zones because FX does not respect one exact pixel.',
      'Look for repeated reaction areas, not the single perfect price.',
      'Think parking zone, not parking dot. Price can enter the area before reacting.',
      'One rule: draw the smallest reasonable area that contains repeated reactions. Do not move it just to make a trade look valid.'
    ],
    check: { q: 'Support/resistance is usually better treated as:', choices: ['An exact one-pixel price', 'A reaction zone'], answer: 'A reaction zone' }
  },
  risk: {
    title: 'Risk first, size second',
    levels: [
      'Choose how much account money you can lose first. Stop distance then determines position size.',
      'Same account risk + wider stop = smaller position. Same risk + tighter stop = larger position.',
      'Your loss budget is a pizza. Wider stop means cutting that pizza into smaller position-size slices.',
      'One rule: risk dollars are fixed before the trade. Never increase size just because the setup “feels obvious.”'
    ],
    check: { q: 'Same account risk, but the stop becomes twice as wide. Position size should generally:', choices: ['Increase', 'Decrease', 'Stay identical'], answer: 'Decrease' }
  },
  volatility: {
    title: 'Normal noise vs invalidation',
    levels: [
      'Volatility describes normal movement size. A stop inside ordinary noise can be hit even when the broader idea remains intact.',
      'ATR is not direction. It helps estimate how much price has recently been moving.',
      'If the market normally breathes 20 pips, a 3-pip stop may be sitting inside its normal breath.',
      'One rule: stop location comes from thesis invalidation; volatility is a sanity check that the stop is not buried inside ordinary noise.'
    ],
    check: { q: 'ATR rising automatically means BUY. True or false?', choices: ['True', 'False'], answer: 'False' }
  },
  indicators: {
    title: 'Indicator = context, not command',
    levels: [
      'Indicators summarize price. They can support a decision, but they do not override structure and context.',
      'RSI above 70 means recent upside momentum has been strong; it does not mean price must immediately fall.',
      'Dashboard analogy: high engine RPM tells you something about the car; it does not tell you where the road turns next.',
      'One rule: never convert one indicator threshold directly into BUY or SELL. Ask what price structure is doing first.'
    ],
    check: { q: 'RSI > 70 is an automatic SELL signal. True or false?', choices: ['True', 'False'], answer: 'False' }
  },
  'entry-selection': {
    title: 'Good idea ≠ good entry',
    levels: [
      'Direction can be reasonable while entry location is poor. Entry quality depends on regime, location, confirmation and invalidation.',
      'Do not chase because price already moved. Ask where your idea becomes invalid and whether reward still makes sense from here.',
      'Bus analogy: knowing the right bus route does not mean jumping onto it while it is speeding past you.',
      'One rule: before entry state 3 things—regime, location, invalidation. If one is missing, wait.'
    ],
    check: { q: 'You correctly expect an uptrend but price is extended directly under resistance. Best default?', choices: ['Chase immediately', 'Wait for a better setup', 'Double size'], answer: 'Wait for a better setup' }
  },
  'stop-placement': {
    title: 'The stop marks “my idea is wrong”',
    levels: [
      'A stop should sit beyond a meaningful invalidation point, then position size adjusts to keep account risk controlled.',
      'Do not choose stop distance only from how much money you want to make. Find invalidation first.',
      'A stop is the fire exit for the thesis. Put it where the thesis has actually failed—not where normal noise can tap it.',
      'One rule: structure decides the stop location; risk math decides the position size.'
    ],
    check: { q: 'Which should normally come first?', choices: ['Choose lot size, then invent stop', 'Choose invalidation/stop, then size the position'], answer: 'Choose invalidation/stop, then size the position' }
  },
  discipline: {
    title: 'NO TRADE is a valid decision',
    levels: [
      'Trading quality includes refusing low-quality setups. Activity is not the same as skill.',
      'If regime, location or risk is unclear, waiting protects both capital and decision quality.',
      'A goalkeeper does not dive every second. They move when there is actually a shot.',
      'One rule: uncertainty is information. If your setup rule is not present, NO TRADE is the correct action.'
    ],
    check: { q: 'No clear setup exists. Which is a valid professional action?', choices: ['Force BUY', 'Force SELL', 'NO TRADE'], answer: 'NO TRADE' }
  },
  fundamentals: {
    title: 'News changes risk, not certainty',
    levels: [
      'Macro releases and central banks can change expectations quickly. The key skill is knowing when event risk is unusually high.',
      'You do not need to predict every headline. You need a plan for volatility, timing and exposure.',
      'Weather analogy: a storm warning does not tell you the exact raindrop path, but it changes whether you leave the windows open.',
      'One rule: around major scheduled news, know the event time first and reduce assumptions about normal price behavior.'
    ],
    check: { q: 'A major data release guarantees a predictable direction. True or false?', choices: ['True', 'False'], answer: 'False' }
  }
};

export const GAUNTLET_BANK = [
  { id:'g1', skill:'structure', stage:'know', q:'HH → HL → HH most strongly describes what?', choices:['Uptrend structure','Downtrend structure','A spread calculation'], answer:'Uptrend structure' },
  { id:'g2', skill:'regime', stage:'see', q:'Price repeatedly rotates between the same upper and lower zones. Best first label?', choices:['Range','Strong trend','Guaranteed breakout'], answer:'Range' },
  { id:'g3', skill:'discipline', stage:'apply', q:'Structure is mixed, major resistance is nearby, and your rules do not show an entry. Best action?', choices:['BUY','SELL','NO TRADE'], answer:'NO TRADE' },
  { id:'g4', skill:'risk', stage:'know', q:'You keep the same dollar risk but double stop distance. What happens to position size?', choices:['Smaller','Larger','Same'], answer:'Smaller' },
  { id:'g5', skill:'indicators', stage:'misconception', q:'RSI is 76 during a strong uptrend. What does RSI alone prove?', choices:['Immediate SELL','Strong recent momentum, not a guaranteed reversal','Price cannot rise further'], answer:'Strong recent momentum, not a guaranteed reversal' },
  { id:'g6', skill:'volatility', stage:'apply', q:'ATR rises sharply. What is the safest interpretation?', choices:['Market is moving more, direction still needs context','Automatic BUY','Automatic SELL'], answer:'Market is moving more, direction still needs context' },
  { id:'g7', skill:'levels', stage:'see', q:'Price reacted several times around 1.1000–1.1020. How should that area usually be treated?', choices:['Reaction zone','Exact 1.1011 laser line','Irrelevant'], answer:'Reaction zone' },
  { id:'g8', skill:'entry-selection', stage:'apply', q:'Uptrend is valid, but price is extended directly into resistance. Best default?', choices:['Wait for better location/confirmation','Chase BUY','Double risk'], answer:'Wait for better location/confirmation' },
  { id:'g9', skill:'stop-placement', stage:'apply', q:'What should define a stop before position size is calculated?', choices:['Thesis invalidation','Desired profit','Random round number'], answer:'Thesis invalidation' },
  { id:'g10', skill:'candles', stage:'misconception', q:'A long upper wick guarantees the next candle will be bearish. True?', choices:['True','False'], answer:'False' },
  { id:'g11', skill:'fundamentals', stage:'apply', q:'A high-impact release is minutes away. What changes first?', choices:['Risk/volatility assumptions','The future becomes certain','Technical levels stop existing forever'], answer:'Risk/volatility assumptions' },
  { id:'g12', skill:'foundations', stage:'know', q:'EUR/USD rises. In relative terms, which side strengthened?', choices:['EUR','USD','Neither by definition'], answer:'EUR' },
  { id:'g13', skill:'discipline', stage:'pressure', q:'You lost two simulated trades and immediately see a mediocre setup. Best process decision?', choices:['Increase size to recover','Take it because you need a win','Judge the setup by rules; skip it if weak'], answer:'Judge the setup by rules; skip it if weak' },
  { id:'g14', skill:'risk', stage:'pressure', q:'A setup feels “certain.” Your training risk cap is 2%. Best response?', choices:['Keep risk within plan','Raise to 8%','Remove the stop'], answer:'Keep risk within plan' },
  { id:'g15', skill:'regime', stage:'retention', q:'Why identify regime before choosing an entry tactic?', choices:['Trend and range behavior reward different tactics','It predicts every candle','It removes losses'], answer:'Trend and range behavior reward different tactics' }
];

export function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }

export function defaultCoachState() {
  return {
    version: 1, attempts: [], contextTime: {}, sessions: [], explanationLevels: {}, interests: {},
    settings: { sessionMinutes: 30, autoRecommend: true }, gauntlets: [], lastSeenProgressHash: '', activeSession: null
  };
}

export function loadCoachState(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(COACH_STORAGE_KEY)) || {};
    const base = defaultCoachState();
    return {
      ...base, ...saved,
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      contextTime: saved.contextTime || {}, sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
      explanationLevels: saved.explanationLevels || {}, interests: saved.interests || {},
      settings: { ...base.settings, ...(saved.settings || {}) }, gauntlets: Array.isArray(saved.gauntlets) ? saved.gauntlets : []
    };
  } catch { return defaultCoachState(); }
}

export function saveCoachState(state, storage = globalThis.localStorage) {
  try { storage?.setItem(COACH_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function mapLessonToSkill(id = '') {
  const moduleId = String(id).match(/^(m\d+)/)?.[1];
  return MODULE_SKILLS[moduleId] || 'foundations';
}
export function mapDrillSkill(skill = '') { return DRILL_SKILL_MAP[skill] || skill || 'foundations'; }

export function progressFingerprint(progress = {}) {
  const quiz = Object.entries(progress.quiz || {}).map(([id,v]) => `${id}:${v?.correct ? 1 : 0}:${v?.at || ''}`).join('|');
  const drill = (progress.drills || []).slice(0, 80).map(x => `${x.skill}:${x.correct ? 1 : 0}:${x.at || ''}`).join('|');
  const sessions = (progress.sessions || []).slice(0, 20).map(x => `${x.at || x.endedAt || ''}:${x.pnl ?? x.sessionPnl ?? ''}`).join('|');
  return `${quiz}#${drill}#${sessions}`;
}

export function ingestProgress(progress = {}, coach = defaultCoachState()) {
  const fingerprint = progressFingerprint(progress);
  if (fingerprint === coach.lastSeenProgressHash) return coach;
  const known = new Set(coach.attempts.filter(a => a.sourceId).map(a => a.sourceId));
  const additions = [];
  for (const [id, q] of Object.entries(progress.quiz || {})) {
    const sourceId = `quiz:${id}:${q?.at || ''}`;
    if (!known.has(sourceId)) additions.push({ sourceId, source:'lesson', skill:mapLessonToSkill(id), correct:Boolean(q?.correct), at:q?.at || new Date().toISOString(), confidence:null, responseMs:null });
  }
  for (const d of progress.drills || []) {
    const sourceId = `drill:${d.at || ''}:${d.skill || ''}:${d.answer || ''}`;
    if (!known.has(sourceId)) additions.push({ sourceId, source:'drill', skill:mapDrillSkill(d.skill), correct:Boolean(d.correct), at:d.at || new Date().toISOString(), confidence:null, responseMs:null, expected:d.expected, answer:d.answer });
  }
  return { ...coach, attempts:[...coach.attempts, ...additions].slice(-2500), lastSeenProgressHash:fingerprint };
}

function recencyWeight(at, now) {
  const ageDays = Math.max(0, (now - new Date(at || 0).getTime()) / 86400000);
  return Math.max(0.35, Math.exp(-ageDays / 30));
}
export function skillEvidence(coach, skill, now = Date.now()) {
  return (coach.attempts || []).filter(a => a.skill === skill).map(a => ({ ...a, weight:recencyWeight(a.at, now) }));
}

function evidenceCap(attempts) {
  if (attempts <= 1) return 45;
  if (attempts <= 3) return 60;
  if (attempts <= 6) return 75;
  return 100;
}

export function masteryForSkill(coach, skill, now = Date.now()) {
  const items = skillEvidence(coach, skill, now);
  if (!items.length) return { skill, score:0, state:'unseen', attempts:0, accuracy:null, confidenceGap:null, due:true };
  const totalWeight = items.reduce((s,a) => s + a.weight, 0);
  const correctWeight = items.reduce((s,a) => s + (a.correct ? a.weight : 0), 0);
  const accuracy = totalWeight ? correctWeight / totalWeight : 0;
  const volume = clamp(items.length / 12, 0, 1);
  const recent = items.slice(-5);
  const consistency = recent.length ? recent.filter(a => a.correct).length / recent.length : accuracy;
  const rawScore = clamp((accuracy * 64) + (consistency * 20) + (volume * 16));
  const score = Math.round(Math.min(rawScore, evidenceCap(items.length)));
  const confidenced = items.filter(a => Number.isFinite(a.confidence));
  const confidenceAvg = confidenced.length ? confidenced.reduce((s,a) => s + a.confidence, 0) / confidenced.length : null;
  const confidenceGap = confidenceAvg == null ? null : Math.round(confidenceAvg - accuracy * 100);
  const last = items.at(-1);
  const days = (now - new Date(last.at).getTime()) / 86400000;
  const retentionDays = score >= 85 ? 30 : score >= 70 ? 14 : score >= 55 ? 7 : 2;
  const due = days >= retentionDays;
  const state = score >= 88 ? (due ? 'retention check' : 'mastered') : score >= 75 ? 'proficient' : score >= 58 ? 'functional' : score >= 35 ? 'learning' : 'introduced';
  return { skill, score, state, attempts:items.length, accuracy:Math.round(accuracy * 100), confidenceGap, due, retentionDays };
}

export function buildMasteryModel(coach, now = Date.now()) {
  return Object.keys(SKILL_META).map(skill => masteryForSkill(coach, skill, now));
}

export function failureType(attempt) {
  if (attempt.correct) return 'correct';
  if (Number(attempt.confidence) >= 80) return 'misconception';
  if (attempt.skill === 'risk') return 'calculation / risk gap';
  if (attempt.skill === 'discipline') return 'discipline / impulse gap';
  if (['regime','structure','candles','levels'].includes(attempt.skill)) return 'recognition gap';
  if (['entry-selection','stop-placement','execution'].includes(attempt.skill)) return 'execution gap';
  if (['fundamentals','sessions'].includes(attempt.skill)) return 'context gap';
  return 'knowledge gap';
}

export function failureSummary(coach) {
  const counts = {};
  for (const a of coach.attempts || []) {
    if (a.correct) continue;
    const type = failureType(a);
    counts[type] = (counts[type] || 0) + 1;
  }
  return Object.entries(counts).map(([type,count]) => ({ type,count })).sort((a,b) => b.count - a.count);
}

export function learningStopLoss(coach, now = Date.now()) {
  const recent = (coach.attempts || [])
    .filter(a => now - new Date(a.at || 0).getTime() <= 90 * 60000)
    .slice(-12);
  if (recent.length < 3) return null;
  const skills = [...new Set(recent.map(a => a.skill).filter(Boolean))];
  let best = null;
  for (const skill of skills) {
    const rows = recent.filter(a => a.skill === skill).slice(-5);
    let consecutiveMisses = 0;
    for (const a of [...rows].reverse()) {
      if (a.correct) break;
      consecutiveMisses += 1;
    }
    const wrongCount = rows.filter(a => !a.correct).length;
    const misses = Math.max(consecutiveMisses, wrongCount);
    if ((consecutiveMisses >= 3 || wrongCount >= 4) && (!best || misses > best.misses)) {
      best = { skill, misses, prerequisite:(DEPENDENCIES[skill] || [])[0] || null };
    }
  }
  return best;
}

export function detectRootGap(coach, now = Date.now()) {
  const model = Object.fromEntries(buildMasteryModel(coach, now).map(x => [x.skill, x]));
  const candidates = Object.values(model).filter(x => x.attempts >= 2 && x.score < 72);
  if (!candidates.length) return null;
  let best = null;
  for (const item of candidates) {
    const downstream = Object.entries(DEPENDENCIES).filter(([,deps]) => deps.includes(item.skill)).map(([k]) => model[k]).filter(Boolean);
    const downstreamWeak = downstream.filter(x => x.attempts >= 1 && x.score < 65).length;
    const misses = skillEvidence(coach, item.skill, now).filter(a => !a.correct).length;
    const score = (100 - item.score) + downstreamWeak * 15 + Math.min(20, misses * 2);
    if (!best || score > best.priority) best = { ...item, priority:Math.round(score), downstream:downstream.filter(x => x.score < 65).map(x => x.skill) };
  }
  return best;
}

export function explanationLevelFor(coach, skill) {
  const recent = skillEvidence(coach, skill).slice(-8);
  const wrong = recent.filter(a => !a.correct).length;
  const manual = Number(coach.explanationLevels?.[skill] || 0);
  return clamp(Math.max(manual, wrong <= 1 ? 0 : wrong <= 3 ? 1 : wrong <= 5 ? 2 : 3), 0, 3);
}

export function gapLesson(coach, skill) {
  const lib = EXPLANATION_LIBRARY[skill] || EXPLANATION_LIBRARY.foundations;
  const level = explanationLevelFor(coach, skill);
  const labels = ['Normal explanation','Simpler explanation','Analogy / visual model','One-rule rescue'];
  return { skill, title:lib.title, level, levelLabel:labels[level], explanation:lib.levels[level], check:lib.check };
}

export function interestProfile(coach) {
  const merged = { ...(coach.contextTime || {}) };
  for (const [k,v] of Object.entries(coach.interests || {})) merged[k] = (merged[k] || 0) + Number(v || 0) * 60;
  const rows = Object.entries(merged).map(([topic,seconds]) => ({ topic, seconds:Math.round(seconds), score:Math.round(Math.log10(1 + seconds) * 28) }));
  rows.sort((a,b) => b.seconds - a.seconds);
  return rows;
}

export function confidenceCalibration(coach) {
  const rows = (coach.attempts || []).filter(a => Number.isFinite(a.confidence));
  if (!rows.length) return { samples:0, averageConfidence:null, accuracy:null, gap:null, label:'Not enough evidence' };
  const averageConfidence = rows.reduce((s,a) => s + a.confidence, 0) / rows.length;
  const accuracy = rows.filter(a => a.correct).length / rows.length * 100;
  const gap = averageConfidence - accuracy;
  return { samples:rows.length, averageConfidence:Math.round(averageConfidence), accuracy:Math.round(accuracy), gap:Math.round(gap), label:gap > 12 ? 'Often overconfident' : gap < -12 ? 'Often underconfident' : 'Well calibrated' };
}

export function fatigueScore(attempts = []) {
  const recent = attempts.slice(-12);
  if (recent.length < 4) return { score:15, label:'Fresh', reasons:[] };
  const first = recent.slice(0, Math.ceil(recent.length / 2));
  const last = recent.slice(Math.ceil(recent.length / 2));
  const acc = arr => arr.filter(a => a.correct).length / Math.max(1, arr.length);
  const firstAcc = acc(first), lastAcc = acc(last);
  const wrongRun = [...recent].reverse().findIndex(a => a.correct);
  const consecutiveWrong = wrongRun === -1 ? recent.length : wrongRun;
  const timed = recent.filter(a => Number.isFinite(a.responseMs));
  let timePenalty = 0;
  if (timed.length >= 4) {
    const half = Math.floor(timed.length / 2);
    const avg = arr => arr.reduce((s,a) => s + a.responseMs, 0) / arr.length;
    const a = avg(timed.slice(0,half)), b = avg(timed.slice(half));
    if (b > a * 1.35) timePenalty = 18;
  }
  const accuracyDrop = Math.max(0, firstAcc - lastAcc) * 55;
  const repeatPenalty = Math.min(30, consecutiveWrong * 8);
  const score = Math.round(clamp(10 + accuracyDrop + repeatPenalty + timePenalty));
  const reasons = [];
  if (accuracyDrop > 12) reasons.push('accuracy is dropping');
  if (consecutiveWrong >= 2) reasons.push('mistakes are repeating');
  if (timePenalty) reasons.push('responses are slowing down');
  return { score, label:score >= 70 ? 'Stop soon' : score >= 48 ? 'Tiring' : score >= 28 ? 'Working' : 'Fresh', reasons };
}

export function difficultyBand(coach, skill) {
  const m = masteryForSkill(coach, skill);
  if (m.attempts < 2 || m.score < 35) return 'guided';
  if (m.score < 55) return 'easy';
  if (m.score < 75) return 'normal';
  if (m.score < 88) return 'hard';
  return m.due ? 'retention' : 'expert';
}

export function recommendedMinutes(coach) {
  const stop = learningStopLoss(coach);
  const root = detectRootGap(coach);
  const fatigue = fatigueScore(coach.attempts || []);
  if (stop || fatigue.score >= 70) return 15;
  const due = buildMasteryModel(coach).filter(x => x.attempts && x.due).length;
  if (root && due >= 2) return 45;
  if (root || due) return 30;
  return 25;
}

export function sessionPlan(coach, requestedMinutes = null) {
  const root = detectRootGap(coach);
  const stop = learningStopLoss(coach);
  const minutes = clamp(Number(requestedMinutes) || recommendedMinutes(coach), 10, 90);
  const heavyGap = root && root.score < 48;
  const ratios = heavyGap ? [0.10,0.45,0.25,0.15,0.05] : [0.10,0.25,0.40,0.20,0.05];
  const coreFocus = root ? CORE_FOCUS[root.skill] || 'Next core lesson' : 'Next core lesson';
  const remediationName = stop && stop.skill === root?.skill
    ? `Learning stop-loss: pause ${SKILL_META[stop.skill]?.label || stop.skill}; review ${stop.prerequisite ? SKILL_META[stop.prerequisite]?.label || stop.prerequisite : 'the prerequisite'} instead`
    : root ? `Gap lesson: ${SKILL_META[root.skill]?.label || root.skill}` : 'Weak-skill review';
  const names = ['Warm-up / retention', remediationName, `Next major lesson: ${coreFocus}`, 'Historical / applied practice', 'Mini Gauntlet + review'];
  let used = 0;
  const phases = ratios.map((ratio,i) => {
    const remainingPhases = ratios.length - i - 1;
    const maxHere = Math.max(1, minutes - used - remainingPhases);
    const proposed = i === ratios.length - 1 ? minutes - used : Math.max(1, Math.round(minutes * ratio));
    const m = Math.min(maxHere, proposed);
    used += m;
    return { name:names[i], minutes:m };
  });
  const reason = stop && stop.skill === root?.skill
    ? `You have repeated the same miss ${stop.misses} times recently. Learning Stop-Loss is active: stop grinding that exact item and rescue the prerequisite before retesting.`
    : root ? `${SKILL_META[root.skill]?.label || root.skill} is the highest-priority gap based on repeated misses and prerequisite impact.`
    : 'No major root gap yet; keep a balanced session and collect more evidence.';
  return { minutes, rootGap:root, stopLoss:stop, phases, reason };
}

export function chooseGauntletQuestions(coach, count = 10) {
  const root = detectRootGap(coach);
  const weak = buildMasteryModel(coach).filter(x => x.attempts && x.score < 75).sort((a,b) => a.score - b.score).map(x => x.skill);
  const priority = [root?.skill, ...(root?.downstream || []), ...weak].filter(Boolean);
  const ranked = [...GAUNTLET_BANK].sort((a,b) => {
    const ai = priority.indexOf(a.skill), bi = priority.indexOf(b.skill);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
  const picked = [];
  const seen = new Set();
  for (const q of ranked) {
    if (picked.length >= count) break;
    if (!seen.has(q.id)) { picked.push(q); seen.add(q.id); }
  }
  return picked;
}

export function scoreGauntlet(answers = []) {
  if (!answers.length) return { overall:0, accuracy:0, confidenceFit:0, pressure:0, breakdown:{} };
  const correct = answers.filter(a => a.correct).length;
  const accuracy = Math.round(correct / answers.length * 100);
  const calibrated = answers.filter(a => Number.isFinite(a.confidence));
  const confidenceError = calibrated.length ? calibrated.reduce((s,a) => s + Math.abs(a.confidence - (a.correct ? 100 : 0)), 0) / calibrated.length : 50;
  const confidenceFit = Math.round(clamp(100 - confidenceError));
  const pressureRows = answers.filter(a => a.stage === 'pressure' || a.stage === 'apply');
  const pressure = pressureRows.length ? Math.round(pressureRows.filter(a => a.correct).length / pressureRows.length * 100) : accuracy;
  const breakdown = {};
  for (const a of answers) {
    breakdown[a.skill] ||= { attempts:0, correct:0 };
    breakdown[a.skill].attempts += 1;
    breakdown[a.skill].correct += a.correct ? 1 : 0;
  }
  for (const v of Object.values(breakdown)) v.score = Math.round(v.correct / v.attempts * 100);
  const overall = Math.round(accuracy * 0.65 + confidenceFit * 0.15 + pressure * 0.20);
  return { overall, accuracy, confidenceFit, pressure, breakdown };
}

export function weeklyReport(coach, now = Date.now()) {
  const since = now - 7 * 86400000;
  const attempts = (coach.attempts || []).filter(a => new Date(a.at).getTime() >= since);
  const sessions = (coach.sessions || []).filter(s => new Date(s.startedAt || 0).getTime() >= since);
  const minutes = Math.round(sessions.reduce((sum,s) => sum + Number(s.activeSeconds || 0), 0) / 60);
  const bySkill = {};
  for (const a of attempts) {
    bySkill[a.skill] ||= { attempts:0, correct:0 };
    bySkill[a.skill].attempts += 1; bySkill[a.skill].correct += a.correct ? 1 : 0;
  }
  const rows = Object.entries(bySkill).map(([skill,v]) => ({ skill, attempts:v.attempts, accuracy:Math.round(v.correct/v.attempts*100) })).sort((a,b) => a.accuracy - b.accuracy);
  const root = detectRootGap(coach, now);
  const interest = interestProfile(coach)[0] || null;
  return { minutes, attempts:attempts.length, weakest:rows[0] || null, strongest:rows.at(-1) || null, rootGap:root, topInterest:interest, stopLoss:learningStopLoss(coach, now) };
}
