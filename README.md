# Forex Lab PH

A Taglish forex learning guide with dense historical drills, replay, trading-session simulation, and sourced historical-event challenges.

## Easiest Mac install — no Node.js, no Terminal

For normal Mac use, download the desktop installer from **GitHub Releases**:

1. Download `Forex-Lab-PH-<version>-universal.pkg`.
2. Double-click the installer.
3. Open **Forex Lab PH** from Applications.
4. Go to **Practice** and click **Install Starter Data**.

The Mac app bundles its own runtime. You do **not** need to install Node.js, npm, Git, or run Terminal commands.

### Updating the Mac app

Install the newer `.pkg` over the existing app. The package uses macOS **upgrade replacement**, so the installed app bundle is atomically replaced and obsolete paths from the previous app version are removed.

The app deliberately preserves:

- learning / drill / session progress;
- downloaded historical market data.

Those live in macOS Application Support, outside the replaceable app bundle. On a version change, Forex Lab also clears old Electron HTTP / code / GPU caches.

It does **not** automatically delete arbitrary installer files from your Downloads folder.

> The current direct build is not Developer-ID notarized yet. If macOS blocks first launch, Control-click **Forex Lab PH** in Applications → **Open** → confirm once.

See `docs/MAC_APP.md` for the desktop packaging/update details.

## What v0.3 includes

### Learn
- 60 sequential core lessons across 10 modules.
- Taglish explanations with quiz-gated progression.
- Foundations → chart reading → structure → risk → indicators → sessions → fundamentals → backtesting → psychology.

### Practice
Practice has four sub-modes so the main UI stays simple:

1. **Dense drills** — 20-question sessions generated from random historical windows. Categories cover structure, future-outcome buckets, candle reading, EMA alignment, RSI zones, and USD-major risk sizing. Weak and due skills are weighted more heavily using local spaced repetition.
2. **Replay** — random historical window with the future hidden. Lock BUY / SELL / NO TRADE, then reveal +1, +5, or all future candles.
3. **Trading session** — USD training account, random historical start, candle stepping/auto-play, market BUY/SELL, risk %, stop, target, approximate lot sizing, manual close, session P/L, max drawdown, and risk-discipline flags.
4. **Historical events** — mystery challenges around sourced real-world central-bank/intervention events. The headline/date is revealed only after your decision and replay.

### Desktop data install
Inside the Mac app, Practice shows:

- **Install Starter Data** — EUR/USD, GBP/USD, USD/JPY.
- **Install Full 6-Pair Data** — adds AUD/USD, USD/CAD, USD/CHF.

The app downloads 2020–2025 **M15 bid OHLC** from Dukascopy via `dukascopy-node`, then aggregates the same candles into **H1 and H4** locally. No fake fallback candles are used.

### Progress
- Lesson completion and quiz accuracy.
- Dense-drill accuracy by skill.
- Spaced-repetition due status.
- Historical replay journal.
- Trading-session summaries and drawdown.

## Simulator accuracy boundaries

- **No fake historical candles.** Missing pack = Practice disables itself.
- Spot FX is OTC; Dukascopy is one provider/feed, not a universal official FX price.
- Dataset is **bid-side OHLC**. Trading-session P/L does **not** model spread, ask-side entry, slippage, commissions, swaps, or latency.
- Position sizing uses a **USD training account** and supports the six USD-major pairs in the data pack.
- If stop and target are both touched inside the same OHLC candle, the result is marked **ambiguous** instead of guessing which happened first.
- Dense-drill “correct answers” use explicit trainer rules. Structure labels are rule-based classifications; future-direction drills are hindsight outcome buckets, not trading signals.
- The trainer flags risk above 2% as a discipline warning. That is a learning guardrail, not a universal trading rule.
- PHT display uses the IANA timezone `Asia/Manila`.

## Developer / browser mode

Only developers need Node.js:

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

Developer data commands:

```bash
npm run data:sample
npm run data:all
```

Desktop development/build commands:

```bash
npm run desktop:dev
npm run desktop:build:mac
```

## Testing

```bash
npm test
npm run check
```

The release gate covers forex math, pip conventions, position sizing, P/L conversion for USD majors, bracket ambiguity, indicators, drill generation, spaced repetition, aggregation, historical-event sourcing, desktop syntax, static feature checks, and browser interaction QA.

## Release workflow

```text
feature/*
   ↓
build + tests
   ↓
UX/UI + Senior Dev + Instructor + Forex review
   ↓
PR + GitHub Actions
   ↓
main
   ↓
macOS universal PKG/ZIP build
   ↓
GitHub Release
```

See `docs/RELEASE_REVIEW.md`, `docs/DATA_SOURCES.md`, and `docs/MAC_APP.md`.

This project is educational software, not financial advice, a signal service, a broker, or a profitability claim. Past market behavior does not guarantee future results.
