# Forex Lab PH

A localhost-first Taglish forex learning guide and historical practice lab. The UI stays deliberately simple: **Learn**, **Practice**, **Progress**, and **Sources**.

## What v0.2 includes

### Learn
- 60 sequential core lessons across 10 modules.
- Taglish explanations with quiz-gated progression.
- Foundations → chart reading → structure → risk → indicators → sessions → fundamentals → backtesting → psychology.

### Practice
Practice has four sub-modes so the main UI does not turn into a cockpit:

1. **Dense drills** — 20-question sessions generated from random historical windows. Categories cover structure, future-outcome buckets, candle reading, EMA alignment, RSI zones, and USD-major risk sizing. Weak and due skills are weighted more heavily using local spaced repetition.
2. **Replay** — random historical window with the future hidden. Lock BUY / SELL / NO TRADE, then reveal +1, +5, or all future candles.
3. **Trading session** — USD training account, random historical start, live-style candle stepping/auto-play, market BUY/SELL, risk %, stop, target, approximate lot sizing, manual close, session P/L, max drawdown, and risk-discipline flags.
4. **Historical events** — mystery challenges around sourced real-world central-bank/intervention events. The headline/date is revealed only after your decision and replay.

### Progress
- Lesson completion and quiz accuracy.
- Dense-drill accuracy by skill.
- Spaced-repetition due status.
- Historical replay journal.
- Trading-session summaries and drawdown.

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:4173**.

The learning course works immediately. Historical Practice modes require the local data pack.

## Install real 2020–2025 data

Sample pack — EUR/USD, GBP/USD, USD/JPY:

```bash
npm run data:sample
```

Full pack — EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, USD/CHF:

```bash
npm run data:all
```

V0.2 downloads **M15 bid OHLC** from Dukascopy via `dukascopy-node`, then locally aggregates the same candles into **H1 and H4**. That keeps timeframe relationships internally consistent. The six-year M15 pack is much larger than v0.1 H1-only data and can take a while to download.

Historical JSON stays local and is ignored by Git.

## Simulator accuracy boundaries

- **No fake historical candles.** Missing pack = Practice disables itself.
- Spot FX is OTC; Dukascopy is one provider/feed, not a universal official FX price.
- Dataset is **bid-side OHLC**. Trading-session P/L does **not** model spread, ask-side entry, slippage, commissions, swaps, or latency.
- Position sizing uses a **USD training account** and supports the six USD-major pairs in the data pack.
- If stop and target are both touched inside the same OHLC candle, the result is marked **ambiguous** instead of guessing which happened first.
- Dense-drill “correct answers” use explicit trainer rules. Structure labels are rule-based classifications; future-direction drills are hindsight outcome buckets, not trading signals.
- The trainer flags risk above 2% as a discipline warning. That is a learning guardrail, not a universal trading rule.
- PHT display uses the IANA timezone `Asia/Manila`.

## Testing

```bash
npm test
npm run check
```

The release gate covers math, pip conventions, position sizing, P/L conversion for USD majors, bracket ambiguity, technical indicators, drill generation, spaced repetition, H1/H4 aggregation, sourced events, static feature checks, JS syntax, and manual Chromium interaction QA.

## Easy updates

If you cloned the repo with Git:

```bash
npm run update
```

This performs a fast-forward pull, refreshes dependencies, and reruns release checks. Downloaded historical data and browser progress stay local.

macOS: double-click `start.command` after setup.

Windows: double-click `start.bat` after setup.

## Release workflow

```text
feature/*
   ↓
build + tests
   ↓
Chromium interaction QA
   ↓
UX/UI review
Senior developer review
Teacher/instructor review
Forex-accuracy review
   ↓
PR + GitHub Actions
   ↓
main
```

See `docs/RELEASE_REVIEW.md` and `docs/DATA_SOURCES.md`.

This project is educational software, not financial advice, a signal service, a broker, or a profitability claim. Past market behavior does not guarantee future results.
