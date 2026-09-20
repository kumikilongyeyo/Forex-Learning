export const HISTORICAL_EVENTS = [
  {
    id: 'fed-emergency-2020-03',
    title: 'Fed emergency easing during the COVID shock',
    pair: 'EUR/USD',
    timeframe: 'H1',
    anchor: '2020-03-16T00:00:00Z',
    category: 'Central bank / crisis',
    revealBars: 24,
    summary: 'On March 15, 2020 the Federal Reserve cut the federal-funds target range to 0–0.25% and announced large Treasury/MBS purchases as the COVID shock intensified. The chart anchor is the surrounding trading window, not a claim about an exact tick reaction.',
    sourceTitle: 'Federal Reserve — March 15, 2020 implementation note',
    sourceUrl: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20200315a1.htm'
  },
  {
    id: 'fed-75bp-2022-06',
    title: 'Fed raises rates by 75 basis points',
    pair: 'EUR/USD',
    timeframe: 'H1',
    anchor: '2022-06-15T18:00:00Z',
    category: 'Central bank',
    revealBars: 24,
    summary: 'On June 15, 2022 the FOMC raised the target range to 1.50–1.75%, a 75 bp increase. The statement was released at 2:00 p.m. EDT (18:00 UTC).',
    sourceTitle: 'Federal Reserve — June 15, 2022 FOMC statement',
    sourceUrl: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20220615a.htm'
  },
  {
    id: 'ecb-first-hike-2022-07',
    title: 'ECB raises key rates by 50 basis points',
    pair: 'EUR/USD',
    timeframe: 'H1',
    anchor: '2022-07-21T12:00:00Z',
    category: 'Central bank',
    revealBars: 24,
    summary: 'On July 21, 2022 the ECB raised its three key interest rates by 50 bp and approved the Transmission Protection Instrument. This challenge studies the surrounding market window; the anchor is deliberately coarse rather than pretending every feed shares one reaction timestamp.',
    sourceTitle: 'ECB — Monetary policy decisions, 21 July 2022',
    sourceUrl: 'https://www.ecb.europa.eu/press/pr/date/2022/html/ecb.mp220721~53e5bdd317.en.html'
  },
  {
    id: 'boe-2022-09',
    title: 'Bank of England raises Bank Rate to 2.25%',
    pair: 'GBP/USD',
    timeframe: 'H1',
    anchor: '2022-09-22T11:00:00Z',
    category: 'Central bank',
    revealBars: 30,
    summary: 'Published September 22, 2022, the MPC decision raised Bank Rate by 0.5 percentage points to 2.25%. The surrounding GBP market was also dealing with unusually large macro and fiscal uncertainty.',
    sourceTitle: 'Bank of England — September 2022 Monetary Policy Summary',
    sourceUrl: 'https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2022/september-2022'
  },
  {
    id: 'boj-framework-2024-03',
    title: 'Bank of Japan changes its monetary-policy framework',
    pair: 'USD/JPY',
    timeframe: 'H1',
    anchor: '2024-03-19T03:00:00Z',
    category: 'Central bank',
    revealBars: 30,
    summary: 'On March 19, 2024 the BOJ said QQE with Yield Curve Control and the negative-interest-rate policy had fulfilled their roles and shifted to guiding the short-term interest rate as its primary policy tool. BOJ decision timing can vary, so the challenge uses a meeting-day chart anchor.',
    sourceTitle: 'Bank of Japan — Changes in the Monetary Policy Framework',
    sourceUrl: 'https://www.boj.or.jp/en/mopo/mpmdeci/state_2024/k240319a.htm'
  },
  {
    id: 'japan-intervention-2024-04',
    title: 'Japan intervenes in USD/JPY',
    pair: 'USD/JPY',
    timeframe: 'H1',
    anchor: '2024-04-29T06:00:00Z',
    category: 'FX intervention',
    revealBars: 36,
    summary: 'Japan’s Ministry of Finance records ¥5,918.5 billion of intervention on April 29, 2024, selling U.S. dollars and buying yen. A second operation followed on May 1; total April–June intervention was ¥9,788.5 billion. The official record gives dates and amounts, not an exact intraday timestamp, so this challenge uses a day anchor.',
    sourceTitle: 'Japan Ministry of Finance — FX intervention operations, Apr–Jun 2024',
    sourceUrl: 'https://www.mof.go.jp/english/policy/international_policy/reference/feio/quarter/2024_2Qe.html'
  },
  {
    id: 'ecb-cut-2024-06',
    title: 'ECB cuts key rates by 25 basis points',
    pair: 'EUR/USD',
    timeframe: 'H1',
    anchor: '2024-06-06T12:00:00Z',
    category: 'Central bank',
    revealBars: 24,
    summary: 'On June 6, 2024 the ECB decided to lower its three key interest rates by 25 bp after nine months of holding rates steady.',
    sourceTitle: 'ECB — Monetary policy decisions, 6 June 2024',
    sourceUrl: 'https://www.ecb.europa.eu/press/pr/date/2024/html/ecb.mp240606~2148ecdb3c.en.html'
  },
  {
    id: 'fed-cut-2024-09',
    title: 'Fed begins easing with a 50 bp cut',
    pair: 'EUR/USD',
    timeframe: 'H1',
    anchor: '2024-09-18T18:00:00Z',
    category: 'Central bank',
    revealBars: 24,
    summary: 'On September 18, 2024 the FOMC lowered the federal-funds target range by 0.5 percentage point to 4.75–5.00%. The statement was released at 2:00 p.m. EDT (18:00 UTC).',
    sourceTitle: 'Federal Reserve — September 18, 2024 FOMC statement',
    sourceUrl: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm'
  }
];

export function nearestIndex(candles, timestamp) {
  const target = Date.parse(timestamp);
  if (!Array.isArray(candles) || !candles.length || !Number.isFinite(target)) return -1;
  let lo = 0, hi = candles.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (candles[mid].timestamp < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return 0;
  const prev = lo - 1;
  return Math.abs(candles[lo].timestamp - target) < Math.abs(candles[prev].timestamp - target) ? lo : prev;
}
