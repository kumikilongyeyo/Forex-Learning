import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:4173';
const now = Date.now();
const adaptiveState = {
  version: 1,
  attempts: Array.from({ length: 5 }, (_, i) => ({
    source: 'smoke-fixture',
    skill: 'regime',
    correct: false,
    confidence: i < 3 ? 90 : 50,
    responseMs: 3500 + i * 400,
    at: new Date(now - (5 - i) * 60000).toISOString()
  })),
  contextTime: {}, sessions: [], explanationLevels: {}, interests: {},
  settings: { sessionMinutes: 30, autoRecommend: true },
  gauntlets: [], lastSeenProgressHash: '', activeSession: null
};

const server = spawn(process.execPath, ['scripts/serve.mjs'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser;

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(URL);
      if (response.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Local Forex Lab server did not become ready');
}

async function clickAndWait(page, selector) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(state => {
    localStorage.setItem('forex-lab-adaptive-coach-v1', JSON.stringify(state));
  }, adaptiveState);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.locator('#coachFab').waitFor({ state: 'visible' });
  await clickAndWait(page, '#coachFab');
  await page.locator('#coachDrawer.open').waitFor({ state: 'visible' });

  const hero = await page.locator('#coachBody .coach-hero h3').first().textContent();
  if (!/Trend vs range/i.test(hero || '')) throw new Error(`Expected seeded root gap in Coach hero, got: ${hero}`);

  await clickAndWait(page, '#testGap');
  await clickAndWait(page, '[data-gap-answer="Range"]');
  await page.locator('#gapResult .coach-result').waitFor({ state: 'visible' });

  // Re-open the same gap test. This specifically guards against stale data-done state.
  await clickAndWait(page, '#testGap');
  await clickAndWait(page, '[data-gap-answer="Range"]');
  const secondResult = await page.locator('#gapResult .coach-result').textContent();
  if (!secondResult?.trim()) throw new Error('Second gap retest did not produce a result');

  await clickAndWait(page, '[data-coach-tab="plan"]');
  await clickAndWait(page, '[data-duration="15"]');
  await clickAndWait(page, '#startPlan');
  await clickAndWait(page, '[data-coach-tab="coach"]');
  const timer = await page.locator('#coachTimerText').textContent();
  if (!timer || timer === '--:--') throw new Error('Focus Guard timer did not start');
  await clickAndWait(page, '#pauseCoach');
  const pausedText = await page.locator('.focus-card').textContent();
  if (!/Paused/i.test(pausedText || '')) throw new Error('Focus Guard did not pause');
  await clickAndWait(page, '#endCoach');

  await clickAndWait(page, '[data-coach-tab="gauntlet"]');
  await clickAndWait(page, '#startGauntlet');
  for (let i = 0; i < 10; i += 1) {
    const firstAnswer = page.locator('[data-gauntlet-answer]').first();
    await firstAnswer.waitFor({ state: 'visible' });
    await firstAnswer.click();
    await clickAndWait(page, '#lockGauntlet');
  }
  await page.locator('#finishGauntlet').waitFor({ state: 'visible' });
  const gauntletText = await page.locator('#coachBody').textContent();
  if (!/Gauntlet complete/i.test(gauntletText || '')) throw new Error('Gauntlet summary did not render');

  await clickAndWait(page, '#finishGauntlet');
  await clickAndWait(page, '[data-coach-tab="report"]');
  const report = await page.locator('#coachBody').textContent();
  if (!/Learning profile/i.test(report || '') || !/Failure pattern/i.test(report || '')) throw new Error('Adaptive report did not render expected sections');

  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log('Adaptive Coach browser smoke passed: drawer, gap retest, Focus Guard, Gauntlet, report, zero console/page errors.');
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill('SIGTERM');
}
