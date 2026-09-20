import { getHistoricalRates } from 'dukascopy-node';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { aggregateCandles } from '../src/data-utils.js';

const sample = process.argv.includes('--sample');
const all = process.argv.includes('--all');
if (!sample && !all) { console.error('Use --sample or --all'); process.exit(1); }

const pairs = all ? ['eurusd','gbpusd','usdjpy','audusd','usdcad','usdchf'] : ['eurusd','gbpusd','usdjpy'];
const years = [2020,2021,2022,2023,2024,2025];
const outDir = join(process.cwd(), 'public', 'data');
await mkdir(outDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  provider: 'Dukascopy via dukascopy-node 1.50.0',
  priceType: 'bid',
  timezone: 'UTC source; UI converts to Asia/Manila',
  notes: 'M15 is downloaded directly. H1 and H4 are aggregated locally from the same M15 candles for timeframe consistency.',
  datasets: []
};

function normalizeRows(rows) {
  return rows.map(r => {
    const timestamp = typeof r.timestamp === 'number' ? r.timestamp : Date.parse(r.timestamp);
    const open = Number(r.open), high = Number(r.high), low = Number(r.low), close = Number(r.close);
    if (!Number.isFinite(timestamp) || ![open, high, low, close].every(Number.isFinite)) return null;
    return { timestamp, open, high, low, close, volume: Number(r.volume ?? r.tickVolume ?? 0) || 0 };
  }).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);
}

async function writeDataset(pair, timeframe, candles) {
  const filename = `${pair.toUpperCase()}-${timeframe}-2020-2025.json`;
  await writeFile(join(outDir, filename), JSON.stringify(candles));
  manifest.datasets.push({
    pair: pair.toUpperCase().replace(/(.{3})(.{3})/, '$1/$2'),
    timeframe,
    from: 2020,
    to: 2025,
    candles: candles.length,
    path: `./public/data/${filename}`
  });
}

for (const pair of pairs) {
  const m15 = [];
  for (const year of years) {
    const from = new Date(`${year}-01-01T00:00:00Z`);
    const to = new Date(`${year + 1}-01-01T00:00:00Z`);
    console.log(`Downloading ${pair.toUpperCase()} ${year} M15…`);
    const rows = await getHistoricalRates({
      instrument: pair,
      dates: { from, to },
      timeframe: 'm15',
      priceType: 'bid',
      format: 'json',
      volumes: true,
      ignoreFlats: true,
      batchSize: 8,
      pauseBetweenBatchesMs: 500
    });
    m15.push(...normalizeRows(rows));
  }
  m15.sort((a, b) => a.timestamp - b.timestamp);
  const h1 = aggregateCandles(m15, 60);
  const h4 = aggregateCandles(m15, 240);
  await writeDataset(pair, 'M15', m15);
  await writeDataset(pair, 'H1', h1);
  await writeDataset(pair, 'H4', h4);
}

manifest.datasets.sort((a, b) => a.pair.localeCompare(b.pair) || ['M15','H1','H4'].indexOf(a.timeframe) - ['M15','H1','H4'].indexOf(b.timeframe));
await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Done. ${manifest.datasets.length} datasets written to public/data/.`);
