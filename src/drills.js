import { candleType, emaAlignment, hindsightDirection, positionSizeLots, regimeLabel, riskAmount, rsiZone } from './core.js';

export const DRILL_SKILLS = ['structure', 'direction', 'candles', 'ema', 'rsi', 'risk'];

export const DIFFICULTIES = {
  beginner: { label: 'Beginner', context: 100, horizon: 8, showPair: true, showDate: true, indicators: true },
  normal: { label: 'Normal', context: 90, horizon: 12, showPair: true, showDate: false, indicators: false },
  hard: { label: 'Hard', context: 70, horizon: 16, showPair: false, showDate: false, indicators: false },
  expert: { label: 'Expert', context: 55, horizon: 20, showPair: false, showDate: false, indicators: false }
};

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const shuffle = (arr, rng) => [...arr].sort(() => rng() - 0.5);
const drillCleanPair = pair => pair.replace('/', '');
const round = (n, digits = 2) => Number(n.toFixed(digits));

function randomPivot(candles, context, horizon, rng) {
  const min = Math.max(context, 70);
  const max = candles.length - horizon - 2;
  if (max <= min) return null;
  return Math.floor(min + rng() * (max - min));
}

function metadata(meta, candle, difficulty) {
  return {
    pair: difficulty.showPair ? meta.pair : 'Pair hidden',
    timeframe: meta.timeframe,
    timestamp: difficulty.showDate ? candle.timestamp : null,
    rawPair: meta.pair
  };
}

function structureDrill(candles, meta, difficulty, rng) {
  const pivot = randomPivot(candles, difficulty.context, 2, rng);
  if (pivot == null) return null;
  const visible = candles.slice(pivot - difficulty.context + 1, pivot + 1);
  const answer = regimeLabel(visible);
  return {
    skill: 'structure',
    prompt: 'Based on the trainer ruleset, ano ang current market regime?',
    choices: ['uptrend', 'downtrend', 'range'],
    answer,
    visible,
    hidden: [],
    meta: metadata(meta, candles[pivot], difficulty),
    showEma: false,
    explanation: `Ruleset label: ${answer}. This is a structured classification drill, not a prediction. The label uses recent directional efficiency + ATR-scaled movement.`
  };
}

function directionDrill(candles, meta, difficulty, rng) {
  const pivot = randomPivot(candles, difficulty.context, difficulty.horizon, rng);
  if (pivot == null) return null;
  const visible = candles.slice(pivot - difficulty.context + 1, pivot + 1);
  const hidden = candles.slice(pivot + 1, pivot + 1 + difficulty.horizon);
  const answer = hindsightDirection(candles, pivot, difficulty.horizon, 0.5);
  return {
    skill: 'direction',
    prompt: `Outcome drill: after ${difficulty.horizon} candles, which result bucket happened?`,
    choices: ['buy', 'sell', 'no-trade'],
    answer,
    visible,
    hidden,
    meta: metadata(meta, candles[pivot], difficulty),
    showEma: false,
    explanation: `Hindsight outcome bucket: ${answer}. BUY/SELL means the future close moved at least 0.5 ATR in that direction; NO TRADE means it stayed inside that threshold. This is not a trading signal.`
  };
}

function candleDrill(candles, meta, difficulty, rng) {
  const pivot = randomPivot(candles, difficulty.context, 2, rng);
  if (pivot == null) return null;
  const visible = candles.slice(pivot - difficulty.context + 1, pivot + 1);
  const answer = candleType(candles[pivot]);
  return {
    skill: 'candles',
    prompt: 'Classify the LAST candle only.',
    choices: ['bullish', 'bearish', 'doji'],
    answer,
    visible,
    hidden: [],
    meta: metadata(meta, candles[pivot], difficulty),
    showEma: false,
    explanation: answer === 'doji'
      ? 'The candle body is ≤10% of its full high-low range, so this trainer labels it doji-like.'
      : `Close is ${answer === 'bullish' ? 'above' : 'below'} open, so it is ${answer}. Candle color alone does not predict the next candle.`
  };
}

function emaDrill(candles, meta, difficulty, rng) {
  const pivot = randomPivot(candles, Math.max(difficulty.context, 60), 2, rng);
  if (pivot == null) return null;
  const visible = candles.slice(pivot - Math.max(difficulty.context, 60) + 1, pivot + 1);
  const answer = emaAlignment(visible);
  return {
    skill: 'ema',
    prompt: 'What is the EMA 20/50 alignment at the last candle?',
    choices: ['bullish', 'bearish', 'mixed'],
    answer,
    visible,
    hidden: [],
    meta: metadata(meta, candles[pivot], difficulty),
    showEma: true,
    explanation: `${answer} alignment. Bullish = price > EMA20 > EMA50; bearish = price < EMA20 < EMA50; otherwise mixed. Alignment is descriptive, not a standalone entry.`
  };
}

function rsiDrill(candles, meta, difficulty, rng) {
  const pivot = randomPivot(candles, Math.max(difficulty.context, 40), 2, rng);
  if (pivot == null) return null;
  const visible = candles.slice(pivot - Math.max(difficulty.context, 40) + 1, pivot + 1);
  const result = rsiZone(visible);
  const answer = result.zone;
  return {
    skill: 'rsi',
    prompt: 'Where is RSI(14) at the last candle?',
    choices: ['high', 'neutral', 'low'],
    answer,
    visible,
    hidden: [],
    meta: metadata(meta, candles[pivot], difficulty),
    showEma: false,
    explanation: `RSI ≈ ${result.value == null ? 'n/a' : result.value.toFixed(1)} → ${answer}. High/low momentum zones are not automatic SELL/BUY commands.`
  };
}

function riskDrill(candles, meta, difficulty, rng) {
  const pivot = randomPivot(candles, 30, 2, rng);
  if (pivot == null) return null;
  const candle = candles[pivot];
  const balance = pick([5000, 10000, 20000, 30000, 50000], rng);
  const riskPercent = pick([0.5, 1, 1.5, 2], rng);
  const stopPips = pick([15, 20, 25, 30, 40, 50], rng);
  const lots = positionSizeLots({ pair: drillCleanPair(meta.pair), price: candle.close, balance, riskPercent, stopPips });
  const target = round(lots, 2);
  const decoys = [round(target * 0.5, 2), round(target * 1.5, 2), round(target * 2, 2)]
    .filter((v, i, a) => v > 0 && v !== target && a.indexOf(v) === i);
  const choices = shuffle([target, ...decoys].slice(0, 4).map(v => `${v.toFixed(2)} lots`), rng);
  return {
    skill: 'risk',
    prompt: `USD account: $${balance.toLocaleString()} • risk ${riskPercent}% • stop ${stopPips} pips. Approx. position size?`,
    choices,
    answer: `${target.toFixed(2)} lots`,
    visible: candles.slice(Math.max(0, pivot - 35), pivot + 1),
    hidden: [],
    meta: metadata(meta, candle, difficulty),
    showEma: false,
    explanation: `Risk budget = $${riskAmount(balance, riskPercent).toFixed(2)}. Using the pair's USD pip-value at the historical price gives ≈ ${target.toFixed(2)} lots. Spread/slippage are not included.`
  };
}

export function makeDrill({ candles, meta, difficulty = 'normal', skill = 'structure', rng = Math.random }) {
  const config = DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  const factories = { structure: structureDrill, direction: directionDrill, candles: candleDrill, ema: emaDrill, rsi: rsiDrill, risk: riskDrill };
  const factory = factories[skill] || factories.structure;
  return factory(candles, meta, config, rng);
}
