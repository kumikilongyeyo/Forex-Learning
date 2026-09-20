export const STORAGE_KEY = 'forex-lab-progress-v1';

export function pipSize(pair) {
  return pair.toUpperCase().replace('/', '').endsWith('JPY') ? 0.01 : 0.0001;
}

export function pipsBetween(pair, a, b) {
  return Math.abs(b - a) / pipSize(pair);
}

export function signedPips(pair, direction, entry, exit) {
  const raw = (exit - entry) / pipSize(pair);
  return direction === 'sell' ? -raw : raw;
}

export function riskAmount(balance, riskPercent) {
  if (!Number.isFinite(balance) || balance <= 0) return 0;
  if (!Number.isFinite(riskPercent) || riskPercent <= 0) return 0;
  return balance * (riskPercent / 100);
}

export function riskReward(entry, stop, target) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  return risk === 0 ? 0 : reward / risk;
}

export function priceFromPips(pair, direction, entry, pips, kind = 'stop') {
  const delta = Math.abs(Number(pips) || 0) * pipSize(pair);
  if (direction === 'buy') return kind === 'stop' ? entry - delta : entry + delta;
  return kind === 'stop' ? entry + delta : entry - delta;
}

export function pipValuePerStandardLotUSD(pair, price) {
  const clean = pair.toUpperCase().replace('/', '');
  if (!Number.isFinite(price) || price <= 0) return 0;
  const units = 100000;
  const pip = pipSize(clean);
  if (clean.endsWith('USD')) return units * pip;
  if (clean.startsWith('USD')) return (units * pip) / price;
  return 0;
}

export function positionSizeLots({ pair, price, balance, riskPercent, stopPips }) {
  const risk = riskAmount(balance, riskPercent);
  const pipValue = pipValuePerStandardLotUSD(pair, price);
  if (!risk || !pipValue || !Number.isFinite(stopPips) || stopPips <= 0) return 0;
  return risk / (stopPips * pipValue);
}

export function tradePnlUsd({ pair, direction, entry, exit, lots }) {
  const clean = pair.toUpperCase().replace('/', '');
  if (![entry, exit, lots].every(Number.isFinite) || entry <= 0 || exit <= 0 || lots <= 0) return 0;
  const signedMove = direction === 'sell' ? entry - exit : exit - entry;
  const quotePnl = signedMove * (lots * 100000);
  if (clean.endsWith('USD')) return quotePnl;
  if (clean.startsWith('USD')) return quotePnl / exit;
  return 0;
}

export function ema(values, period) {
  if (!Array.isArray(values) || period <= 0 || values.length < period) return [];
  const multiplier = 2 / (period + 1);
  const seed = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const output = Array(period - 1).fill(null);
  let prev = seed;
  output.push(seed);
  for (let i = period; i < values.length; i += 1) {
    prev = (values[i] - prev) * multiplier + prev;
    output.push(prev);
  }
  return output;
}

export function rsi(values, period = 14) {
  if (!Array.isArray(values) || values.length <= period) return Array(values?.length || 0).fill(null);
  const out = Array(period).fill(null);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const change = values[i] - values[i - 1];
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const score = () => avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  out.push(score());
  for (let i = period + 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    avgGain = ((avgGain * (period - 1)) + Math.max(change, 0)) / period;
    avgLoss = ((avgLoss * (period - 1)) + Math.max(-change, 0)) / period;
    out.push(score());
  }
  return out;
}

export function atr(candles, period = 14) {
  if (!Array.isArray(candles) || candles.length < period + 1) return Array(candles?.length || 0).fill(null);
  const tr = [null];
  for (let i = 1; i < candles.length; i += 1) {
    const c = candles[i];
    const prev = candles[i - 1];
    tr.push(Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close)));
  }
  const out = Array(period).fill(null);
  let prevAtr = tr.slice(1, period + 1).reduce((a, b) => a + b, 0) / period;
  out.push(prevAtr);
  for (let i = period + 1; i < tr.length; i += 1) {
    prevAtr = ((prevAtr * (period - 1)) + tr[i]) / period;
    out.push(prevAtr);
  }
  return out;
}

export function efficiencyRatio(values) {
  if (!Array.isArray(values) || values.length < 3) return 0;
  const net = Math.abs(values.at(-1) - values[0]);
  let travel = 0;
  for (let i = 1; i < values.length; i += 1) travel += Math.abs(values[i] - values[i - 1]);
  return travel === 0 ? 0 : net / travel;
}

export function regimeLabel(candles) {
  if (!Array.isArray(candles) || candles.length < 30) return 'range';
  const sample = candles.slice(-60);
  const closes = sample.map(c => c.close);
  const er = efficiencyRatio(closes);
  const atrValues = atr(sample, 14).filter(v => v != null);
  const recentAtr = atrValues.at(-1) || Math.abs(closes.at(-1) - closes[0]) || 1;
  const net = closes.at(-1) - closes[0];
  if (er < 0.28 || Math.abs(net) < recentAtr * 1.1) return 'range';
  return net > 0 ? 'uptrend' : 'downtrend';
}

export function hindsightDirection(candles, pivot, horizon = 12, thresholdAtr = 0.5) {
  if (!Array.isArray(candles) || pivot < 20 || pivot + horizon >= candles.length) return 'no-trade';
  const history = candles.slice(Math.max(0, pivot - 40), pivot + 1);
  const atrValues = atr(history, 14).filter(v => v != null);
  const baseline = atrValues.at(-1) || Math.abs(history.at(-1).high - history.at(-1).low) || 1;
  const move = candles[pivot + horizon].close - candles[pivot].close;
  if (Math.abs(move) < baseline * thresholdAtr) return 'no-trade';
  return move > 0 ? 'buy' : 'sell';
}

export function candleType(candle) {
  if (!candle) return 'doji';
  const range = Math.max(candle.high - candle.low, Number.EPSILON);
  const body = Math.abs(candle.close - candle.open);
  if (body / range <= 0.1) return 'doji';
  return candle.close > candle.open ? 'bullish' : 'bearish';
}

export function emaAlignment(candles) {
  const closes = candles.map(c => c.close);
  const fast = ema(closes, 20).at(-1);
  const slow = ema(closes, 50).at(-1);
  const close = closes.at(-1);
  if (![fast, slow, close].every(Number.isFinite)) return 'mixed';
  if (close > fast && fast > slow) return 'bullish';
  if (close < fast && fast < slow) return 'bearish';
  return 'mixed';
}

export function rsiZone(candles) {
  const score = rsi(candles.map(c => c.close), 14).at(-1);
  if (!Number.isFinite(score)) return { zone: 'neutral', value: null };
  if (score >= 70) return { zone: 'high', value: score };
  if (score <= 30) return { zone: 'low', value: score };
  return { zone: 'neutral', value: score };
}

export function toPhilippineTime(timestamp) {
  const date = new Date(typeof timestamp === 'number' ? timestamp : Date.parse(timestamp));
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).format(date);
}

export function evaluateBracket({ direction, entry, stop, target, candles }) {
  const isBuy = direction === 'buy';
  for (const candle of candles) {
    const hitStop = isBuy ? candle.low <= stop : candle.high >= stop;
    const hitTarget = isBuy ? candle.high >= target : candle.low <= target;
    if (hitStop && hitTarget) return { status: 'ambiguous', candle };
    if (hitStop) return { status: 'stop', candle };
    if (hitTarget) return { status: 'target', candle };
  }
  return { status: 'open', candle: candles[candles.length - 1] || null };
}

export function directionOutcome(direction, entry, finalClose) {
  if (direction === 'no-trade') return { r: null, label: 'No trade taken' };
  const delta = finalClose - entry;
  const favorable = direction === 'buy' ? delta : -delta;
  return { favorable, label: favorable > 0 ? 'Price moved in your direction' : favorable < 0 ? 'Price moved against you' : 'Flat finish' };
}

export function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REVIEW_INTERVALS = [0, 6 * 3600e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 14 * 24 * 3600e3];

export function recordSkillAttempt(stats = {}, skill, correct, now = Date.now()) {
  const prev = stats[skill] || { attempts: 0, correct: 0, streak: 0, box: 0, dueAt: 0 };
  const box = correct ? Math.min(5, prev.box + 1) : 0;
  return {
    ...stats,
    [skill]: {
      attempts: prev.attempts + 1,
      correct: prev.correct + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0,
      box,
      dueAt: now + REVIEW_INTERVALS[box]
    }
  };
}

export function skillAccuracy(stat) {
  return stat?.attempts ? stat.correct / stat.attempts : 0;
}

export function pickWeakSkill(stats = {}, skills = [], now = Date.now(), rng = Math.random) {
  if (!skills.length) return null;
  const scored = skills.map(skill => {
    const stat = stats[skill];
    if (!stat) return { skill, score: 100 + rng() };
    const accuracyPenalty = (1 - skillAccuracy(stat)) * 50;
    const dueBonus = stat.dueAt <= now ? 30 : 0;
    const lowVolumeBonus = Math.max(0, 10 - stat.attempts) * 2;
    return { skill, score: accuracyPenalty + dueBonus + lowVolumeBonus + rng() * 3 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].skill;
}

export function defaultProgress() {
  return { completed: {}, quiz: {}, practice: [], drills: [], skillStats: {}, sessions: [], events: [] };
}

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...defaultProgress(), ...saved, completed: saved.completed || {}, quiz: saved.quiz || {}, practice: saved.practice || [], drills: saved.drills || [], skillStats: saved.skillStats || {}, sessions: saved.sessions || [], events: saved.events || [] };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* localhost storage may be unavailable in hardened/file contexts */ }
}
