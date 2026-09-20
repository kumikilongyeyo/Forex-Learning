import { ema } from './core.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}) => {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
};

export function renderCandles(container, candles, { showEma = false } = {}) {
  container.innerHTML = '';
  if (!candles.length) {
    container.innerHTML = '<div class="empty-chart">No candle data loaded.</div>';
    return;
  }
  const width = Math.max(container.clientWidth || 800, 360);
  const height = 420;
  const pad = { t: 20, r: 56, b: 30, l: 12 };
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': 'Historical candlestick chart' });
  svg.classList.add('price-chart');
  const max = Math.max(...candles.map(c => c.high));
  const min = Math.min(...candles.map(c => c.low));
  const range = max - min || 1;
  const xStep = (width - pad.l - pad.r) / candles.length;
  const y = p => pad.t + (max - p) / range * (height - pad.t - pad.b);
  for (let i = 0; i <= 4; i += 1) {
    const yy = pad.t + i * (height - pad.t - pad.b) / 4;
    svg.append(el('line', { x1: pad.l, x2: width - pad.r, y1: yy, y2: yy, class: 'grid-line' }));
    const price = max - i * range / 4;
    const label = el('text', { x: width - pad.r + 8, y: yy + 4, class: 'axis-label' });
    label.textContent = price.toFixed(price >= 20 ? 2 : 5);
    svg.append(label);
  }
  candles.forEach((c, i) => {
    const x = pad.l + i * xStep + xStep / 2;
    const up = c.close >= c.open;
    svg.append(el('line', { x1: x, x2: x, y1: y(c.high), y2: y(c.low), class: `wick ${up ? 'up' : 'down'}` }));
    const bodyY = Math.min(y(c.open), y(c.close));
    const bodyH = Math.max(Math.abs(y(c.open) - y(c.close)), 1.2);
    svg.append(el('rect', { x: x - Math.max(xStep * 0.28, 1), y: bodyY, width: Math.max(xStep * 0.56, 2), height: bodyH, rx: 1, class: `body ${up ? 'up' : 'down'}` }));
  });
  if (showEma) {
    const closes = candles.map(c => c.close);
    [[20, 'ema-fast'], [50, 'ema-slow']].forEach(([period, cls]) => {
      const series = ema(closes, period);
      const points = series.map((v, i) => v == null ? null : `${pad.l + i * xStep + xStep / 2},${y(v)}`).filter(Boolean).join(' ');
      if (points) svg.append(el('polyline', { points, class: cls, fill: 'none' }));
    });
  }
  container.append(svg);
}
