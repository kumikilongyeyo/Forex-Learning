# Forex Lab PH

A Taglish forex learning guide with adaptive coaching, dense historical drills, replay, trading-session simulation, and sourced historical-event challenges.

## Easiest desktop install — no Node.js, no Terminal

### macOS

1. Download `Forex-Lab-PH-<version>-universal.pkg` from **GitHub Releases**.
2. Double-click the installer.
3. Open **Forex Lab PH** from Applications.
4. Go to **Practice** and click **Install Starter Data**.

The Mac app bundles its own runtime. You do **not** need to install Node.js, npm, Git, or run Terminal commands.

Install a newer `.pkg` over the existing app to update. The package uses macOS upgrade replacement, so the old app bundle is replaced while progress and market data are preserved in Application Support.

> The current direct Mac build is not Developer-ID notarized yet. If macOS blocks first launch, Control-click **Forex Lab PH** in Applications → **Open** → confirm once.

See `docs/MAC_APP.md`.

### Windows

1. Download `Forex-Lab-PH-<version>-Windows-x64.exe` from **GitHub Releases**.
2. Run the installer.
3. Open **Forex Lab PH** from the Start menu or desktop shortcut.
4. Go to **Practice** and click **Install Starter Data**.

The Windows app also bundles its own runtime. No Node.js, npm, Git, PowerShell, or Command Prompt setup is required.

Windows uses a stable NSIS upgrade GUID. Installing a newer Forex Lab PH installer replaces the older installed program files instead of creating a second app. Progress and downloaded market data live separately under the app user-data directory and are preserved across upgrades.

> The current Windows build is unsigned, so Microsoft SmartScreen may show **Windows protected your PC**. Use **More info → Run anyway** only if you downloaded the installer from this repository's official GitHub Release.

See `docs/WINDOWS_APP.md`.

## What v0.4 adds — Adaptive Coach

The original four-tab curriculum stays intact. A persistent **Coach** drawer adds a second learning layer that adapts from the learner's actual evidence instead of replacing the course order.

### Learner model
- Separate mastery estimates for foundations, candles, structure, regime, levels, risk, volatility, indicators, fundamentals, discipline, entry, stop placement and execution.
- Recent evidence is weighted more than old evidence.
- Mastery states include introduced, learning, functional, proficient, mastered and retention-check due.
- Interest/time spent is tracked separately from ability so preferred topics can influence framing without letting weak required skills disappear.

### Root-gap detection
- Explicit skill dependencies identify upstream weaknesses that may be causing several downstream mistakes.
- Example: weak trend-vs-range recognition can be prioritized before repeatedly drilling entry selection.
- Failure types distinguish recognition, context, risk/calculation, execution, discipline and high-confidence misconception patterns.

### Gap lessons + explanation ladder
- Repeated misses unlock progressively simpler vetted explanations: normal → simpler → analogy/mental model → one-rule rescue.
- Gap lessons include a focused check and feed the result back into the learner model.
- The core uses fixed educational content rather than unrestricted AI-generated trading advice.

### Adaptive Gauntlet
- Ten-question gauntlets are weighted toward the current root gap and weak skills.
- Tracks accuracy, confidence fit, applied/pressure performance and per-skill breakdown.
- Wrong + high confidence is treated as stronger misconception evidence than an uncertain miss.

### Focus Guard
- Choose 15 / 30 / 45 / 60 minutes or let the coach recommend a session length.
- The timer counts active foreground learning time.
- Reaching the target never kills a question; the learner is told to finish the current item and stop.
- Falling recent accuracy, repeated mistakes and slowing coach-response times can trigger an early rest recommendation.
- Sessions can deliberately end with “good session for today — come back fresh tomorrow” instead of rewarding endless grinding.

### Adaptive daily plan / weekly report
- Normal mix: about 60% forward curriculum, 25% remediation and 15% retention/review.
- Critical foundational gaps can temporarily raise remediation to about 45% without trapping the learner there forever.
- Weekly reporting separates focus time, performance, failure patterns, top interest and root gap.

See `docs/ADAPTIVE_COACH.md` for the scoring and adaptation boundaries.

## Core learning system

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
Inside the Mac and Windows apps, Practice shows:

- **Install Starter Data** — EUR/USD, GBP/USD, USD/JPY.
- **Install Full 6-Pair Data** — adds AUD/USD, USD/CAD, USD/CHF.

The app downloads 2020–2025 **M15 bid OHLC** from Dukascopy via `dukascopy-node`, then aggregates the same candles into **H1 and H4** locally. No fake fallback candles are used.

### Progress
- Lesson completion and quiz accuracy.
- Dense-drill accuracy by skill.
- Spaced-repetition due status.
- Historical replay journal.
- Trading-session summaries and drawdown.
- Adaptive Coach maintains a separate local learner profile and Focus Guard session history.

## Simulator accuracy boundaries

- **No fake historical candles.** Missing pack = Practice disables itself.
- Spot FX is OTC; Dukascopy is one provider/feed, not a universal official FX price.
- Dataset is **bid-side OHLC**. Trading-session P/L does **not** model spread, ask-side entry, slippage, commissions, swaps, or latency.
- Position sizing uses a **USD training account** and supports the six USD-major pairs in the data pack.
- If stop and target are both touched inside the same OHLC candle, the result is marked **ambiguous** instead of guessing which happened first.
- Dense-drill “correct answers” use explicit trainer rules. Structure labels are rule-based classifications; future-direction drills are hindsight outcome buckets, not trading signals.
- Adaptive mastery/fatigue scores are educational estimates from in-app behavior, not medical measures, credentials or trading-performance guarantees.
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
npm run desktop:build:win
```

## Testing

```bash
npm test
npm run check
```

The release gate covers forex math, pip conventions, position sizing, P/L conversion for USD majors, bracket ambiguity, indicators, drill generation, spaced repetition, adaptive mastery/root-gap logic, fatigue, Gauntlet scoring, aggregation, historical-event sourcing, desktop syntax, static feature checks, and desktop package builds.

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
macOS universal PKG/ZIP + Windows x64 EXE/ZIP
   ↓
GitHub Release
```

See `docs/RELEASE_REVIEW.md`, `docs/DATA_SOURCES.md`, `docs/ADAPTIVE_COACH.md`, `docs/MAC_APP.md`, and `docs/WINDOWS_APP.md`.

This project is educational software, not financial advice, a signal service, a broker, or a profitability claim. Past market behavior does not guarantee future results.
