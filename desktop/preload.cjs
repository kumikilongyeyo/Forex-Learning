const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('forexLabDesktop', {
  isDesktop: true,
  getVersion: () => ipcRenderer.invoke('app-version'),
  installData: mode => ipcRenderer.invoke('install-data', mode),
  openUpdates: () => ipcRenderer.invoke('open-updates')
});

let lastProgress = null;
let enhancing = false;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function injectDesktopStyle() {
  if (document.querySelector('#forexLabDesktopStyle')) return;
  const style = document.createElement('style');
  style.id = 'forexLabDesktopStyle';
  style.textContent = `.desktop-status{margin-top:10px;padding:10px 12px;border:1px solid #4f4326;background:#15130e;border-radius:9px;color:#c8bea5;font-size:12px;line-height:1.5}.desktop-status small{display:block;margin-top:5px;color:#9f967f}.desktop-card{border-color:#354252}`;
  document.head.appendChild(style);
}

function renderProgress(payload) {
  lastProgress = payload;
  const status = document.querySelector('#desktopDataStatus');
  if (!status) return;
  const pct = payload?.total ? Math.round((payload.completed || 0) / payload.total * 100) : 0;
  status.innerHTML = `<strong>${escapeHtml(payload?.message || 'Working…')}</strong>${payload?.total ? `<div class="progressbar" style="margin-top:9px"><span style="width:${pct}%"></span></div><small>${pct}%</small>` : ''}`;
}

async function installData(mode) {
  const buttons = [...document.querySelectorAll('#installSampleData,#installFullData')];
  buttons.forEach(button => { button.disabled = true; });
  renderProgress({ message: mode === 'all' ? 'Preparing full six-pair download…' : 'Preparing starter download…' });
  try {
    await ipcRenderer.invoke('install-data', mode);
    window.location.reload();
  } catch (error) {
    renderProgress({ message: `Install failed: ${error?.message || 'Unknown error'}` });
    buttons.forEach(button => { button.disabled = false; });
  }
}

function enhanceNoDataCard() {
  const card = [...document.querySelectorAll('.data-warning')].find(node => node.textContent.includes('Real-data pack not installed yet.'));
  if (!card || card.querySelector('#installSampleData')) return;
  card.innerHTML = `<strong>Historical practice data is not installed yet.</strong><p>No Terminal needed. Install the real 2020–2025 Dukascopy pack directly inside the app.</p><div class="button-row"><button class="primary" id="installSampleData">Install Starter Data</button><button class="ghost" id="installFullData">Install Full 6-Pair Data</button></div><div id="desktopDataStatus" class="desktop-status">Starter: EUR/USD, GBP/USD, USD/JPY • M15/H1/H4.</div><p class="fineprint">Forex Lab still refuses to invent missing historical candles. Your market data lives in Application Support and survives app updates.</p>`;
  card.querySelector('#installSampleData').addEventListener('click', () => installData('sample'));
  card.querySelector('#installFullData').addEventListener('click', () => installData('all'));
  if (lastProgress) renderProgress(lastProgress);
}

async function enhanceSources() {
  if (window.location.hash !== '#about' || document.querySelector('#desktopUpdateCard')) return;
  const hero = document.querySelector('main .hero');
  if (!hero || !hero.textContent.includes('Accuracy & provenance')) return;
  const card = document.createElement('div');
  card.className = 'card desktop-card';
  card.id = 'desktopUpdateCard';
  card.innerHTML = `<h3>Mac desktop app</h3><p>You are running the self-contained app. No Node.js is required. Updates replace the installed app bundle while preserving learning progress and historical market data.</p><div class="button-row"><button class="primary" id="checkDesktopUpdates">Check for Updates</button><span class="pill" id="desktopVersion">Version…</span></div><p class="fineprint">Installing a newer PKG uses upgrade replacement, so obsolete files from the previous installed app bundle are removed.</p>`;
  hero.insertAdjacentElement('afterend', card);
  card.querySelector('#checkDesktopUpdates').addEventListener('click', () => ipcRenderer.invoke('open-updates'));
  try {
    const version = await ipcRenderer.invoke('app-version');
    const badge = card.querySelector('#desktopVersion');
    if (badge) badge.textContent = `v${version}`;
  } catch {}
}

function enhanceDesktopUI() {
  if (enhancing) return;
  enhancing = true;
  try {
    injectDesktopStyle();
    enhanceNoDataCard();
    enhanceSources();
  } finally {
    enhancing = false;
  }
}

ipcRenderer.on('data-progress', (_event, payload) => renderProgress(payload));

window.addEventListener('DOMContentLoaded', () => {
  enhanceDesktopUI();
  const observer = new MutationObserver(enhanceDesktopUI);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(enhanceDesktopUI, 0));
});
