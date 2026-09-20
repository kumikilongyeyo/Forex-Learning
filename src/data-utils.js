export function aggregateCandles(candles, minutes) {
  if (!Array.isArray(candles) || !Number.isFinite(minutes) || minutes <= 0) return [];
  const bucketMs = minutes * 60_000;
  const buckets = new Map();
  for (const c of candles) {
    if (!c || ![c.timestamp,c.open,c.high,c.low,c.close].every(Number.isFinite)) continue;
    const key = Math.floor(c.timestamp / bucketMs) * bucketMs;
    const b = buckets.get(key);
    if (!b) buckets.set(key, { timestamp: key, open: c.open, high: c.high, low: c.low, close: c.close, volume: Number(c.volume) || 0 });
    else {
      b.high = Math.max(b.high, c.high);
      b.low = Math.min(b.low, c.low);
      b.close = c.close;
      b.volume += Number(c.volume) || 0;
    }
  }
  return [...buckets.values()].sort((a, b) => a.timestamp - b.timestamp);
}
