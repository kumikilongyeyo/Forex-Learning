const { app, BrowserWindow, protocol, ipcMain, shell, session } = require('electron');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'forexlab',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

const RELEASE_URL = 'https://github.com/kumikilongyeyo/Forex-Learning/releases/latest';
const PAIRS_SAMPLE = ['eurusd', 'gbpusd', 'usdjpy'];
const PAIRS_ALL = ['eurusd', 'gbpusd', 'usdjpy', 'audusd', 'usdcad', 'usdchf'];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
let mainWindow = null;
let installPromise = null;

function webRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, 'web') : path.resolve(__dirname, '..');
}

function dataRoot() {
  return path.join(app.getPath('userData'), 'market-data');
}

function safePath(root, relative) {
  const base = path.resolve(root);
  const full = path.resolve(base, relative);
  return full === base || full.startsWith(base + path.sep) ? full : null;
}

function mimeType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webp': 'image/webp'
  }[ext] || 'application/octet-stream';
}

async function readResponse(file) {
  try {
    const body = await fsp.readFile(file);
    return new Response(body, { status: 200, headers: { 'content-type': mimeType(file), 'cache-control': 'no-store' } });
  } catch {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
}

async function installProtocol() {
  protocol.handle('forexlab', async request => {
    const url = new URL(request.url);
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';

    if (rel.startsWith('public/data/')) {
      const dataRel = rel.slice('public/data/'.length);
      const installed = safePath(dataRoot(), dataRel);
      if (installed && fs.existsSync(installed)) return readResponse(installed);

      if (dataRel === 'manifest.json') {
        const fallback = safePath(webRoot(), 'public/data/manifest.json');
        return readResponse(fallback);
      }
      return new Response('Dataset not installed', { status: 404 });
    }

    const file = safePath(webRoot(), rel);
    if (!file) return new Response('Forbidden', { status: 403 });
    return readResponse(file);
  });
}

async function cleanupOldVersionCache() {
  const userData = app.getPath('userData');
  const marker = path.join(userData, 'installed-version.json');
  let prior = null;
  try { prior = JSON.parse(await fsp.readFile(marker, 'utf8')).version; } catch {}
  const current = app.getVersion();
  if (prior && prior !== current) {
    await session.defaultSession.clearCache();
    await Promise.all(['Code Cache', 'GPUCache'].map(name => fsp.rm(path.join(userData, name), { recursive: true, force: true }).catch(() => {})));
  }
  await fsp.mkdir(userData, { recursive: true });
  await fsp.writeFile(marker, JSON.stringify({ version: current, updatedAt: new Date().toISOString() }, null, 2));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#0b0d10',
    title: 'Forex Lab PH',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('forexlab://')) {
      event.preventDefault();
      if (/^https:\/\//i.test(url)) shell.openExternal(url);
    }
  });

  win.loadURL('forexlab://app/index.html');
  return win;
}

function sendProgress(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('data-progress', payload);
}

function normalizeRows(rows) {
  return rows.map(r => {
    const timestamp = typeof r.timestamp === 'number' ? r.timestamp : Date.parse(r.timestamp);
    const open = Number(r.open), high = Number(r.high), low = Number(r.low), close = Number(r.close);
    if (!Number.isFinite(timestamp) || ![open, high, low, close].every(Number.isFinite)) return null;
    return { timestamp, open, high, low, close, volume: Number(r.volume ?? r.tickVolume ?? 0) || 0 };
  }).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);
}

async function installHistoricalData(mode) {
  const pairs = mode === 'all' ? PAIRS_ALL : PAIRS_SAMPLE;
  const totalBatches = pairs.length * YEARS.length;
  let completedBatches = 0;
  const outDir = dataRoot();
  await fsp.mkdir(outDir, { recursive: true });

  const [{ getHistoricalRates }, dataUtils] = await Promise.all([
    import('dukascopy-node'),
    import(pathToFileURL(path.join(webRoot(), 'src', 'data-utils.js')).href)
  ]);
  const { aggregateCandles, dedupeCandles } = dataUtils;

  const manifest = {
    generatedAt: new Date().toISOString(),
    provider: 'Dukascopy via dukascopy-node 1.50.0',
    priceType: 'bid',
    timezone: 'UTC source; UI converts to Asia/Manila',
    notes: 'Installed by the Forex Lab PH desktop app. M15 is downloaded directly; H1/H4 are aggregated locally.',
    datasets: []
  };

  async function writeDataset(pair, timeframe, candles) {
    const filename = `${pair.toUpperCase()}-${timeframe}-2020-2025.json`;
    await fsp.writeFile(path.join(outDir, filename), JSON.stringify(candles));
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
    for (const year of YEARS) {
      sendProgress({ phase: 'download', pair: pair.toUpperCase(), year, completed: completedBatches, total: totalBatches, message: `Downloading ${pair.toUpperCase()} ${year} M15…` });
      const rows = await getHistoricalRates({
        instrument: pair,
        dates: { from: new Date(`${year}-01-01T00:00:00Z`), to: new Date(`${year + 1}-01-01T00:00:00Z`) },
        timeframe: 'm15',
        priceType: 'bid',
        format: 'json',
        volumes: true,
        ignoreFlats: true,
        batchSize: 8,
        pauseBetweenBatchesMs: 500
      });
      m15.push(...normalizeRows(rows));
      completedBatches += 1;
      sendProgress({ phase: 'download', pair: pair.toUpperCase(), year, completed: completedBatches, total: totalBatches, message: `Downloaded ${pair.toUpperCase()} ${year}.` });
    }

    sendProgress({ phase: 'process', pair: pair.toUpperCase(), completed: completedBatches, total: totalBatches, message: `Building ${pair.toUpperCase()} M15 / H1 / H4…` });
    const cleanM15 = dedupeCandles(m15);
    await writeDataset(pair, 'M15', cleanM15);
    await writeDataset(pair, 'H1', aggregateCandles(cleanM15, 60));
    await writeDataset(pair, 'H4', aggregateCandles(cleanM15, 240));
  }

  manifest.datasets.sort((a, b) => a.pair.localeCompare(b.pair) || ['M15', 'H1', 'H4'].indexOf(a.timeframe) - ['M15', 'H1', 'H4'].indexOf(b.timeframe));
  await fsp.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  sendProgress({ phase: 'done', completed: totalBatches, total: totalBatches, message: `${manifest.datasets.length} datasets installed. Practice is ready.` });
  return { ok: true, datasets: manifest.datasets.length, dataDir: outDir };
}

ipcMain.handle('app-version', () => app.getVersion());
ipcMain.handle('open-updates', () => shell.openExternal(RELEASE_URL));
ipcMain.handle('install-data', async (_event, mode) => {
  if (!['sample', 'all'].includes(mode)) throw new Error('Unknown data-pack mode');
  if (installPromise) return installPromise;
  installPromise = installHistoricalData(mode).catch(error => {
    sendProgress({ phase: 'error', message: error?.message || 'Data installation failed.' });
    throw error;
  }).finally(() => { installPromise = null; });
  return installPromise;
});

app.whenReady().then(async () => {
  await installProtocol();
  await cleanupOldVersionCache();
  mainWindow = createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
