export const STORAGE_KEY = 'forex-lab-progress-v1';

export function pipSize(pair) {
  return pair.toUpperCase().endsWith('JPY') ? 0.01 : 0.0001;
}

export function pipsBetween(pair, a, b) {
  return Math.abs(b - a) / pipSize(pair);
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

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { completed: saved.completed || {}, quiz: saved.quiz || {}, practice: saved.practice || [] };
  } catch {
    return { completed: {}, quiz: {}, practice: [] };
  }
}

export function saveProgress(progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* localhost storage may be unavailable in hardened/file contexts */ }
}
