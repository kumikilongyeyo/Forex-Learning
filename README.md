# Forex Lab PH

A simple Taglish forex learning guide + historical replay trainer that runs on localhost. The learning UI is deliberately minimal: **Learn**, **Practice**, **Progress**, and **Sources**.

## Quick start

Requires Node.js 18+. The easiest launch is `start.command` on macOS or `start.bat` on Windows. From a terminal:

```bash
npm run dev
```

Open **http://127.0.0.1:4173**.

The curriculum works immediately. Practice mode requires real historical candles.

## Install real 2020–2025 practice data

```bash
npm install
npm run data:sample
npm run dev
```

`data:sample` downloads H1 data for EUR/USD, GBP/USD and USD/JPY for 2020–2025 using `dukascopy-node`. `data:all` expands to six major pairs.

Historical JSON stays local and is ignored by Git because it is generated data and can become large.

## Modes

- **Learn** — 60 structured core lessons, Taglish explanations, objective quiz gates.
- **Practice** — random real historical windows with the future hidden; lock BUY / SELL / NO TRADE, then replay actual candles.
- **Progress** — local lesson/quiz/practice history.
- **Sources** — data provenance and risk boundaries.

## Accuracy rules

1. No fake historical candles.
2. Practice separates **decision quality** from **outcome**.
3. If both stop and target occur inside the same OHLC candle, higher-resolution data is required; never assume favorable ordering.
4. FX is OTC, so provider feeds can differ slightly.
5. PHT display uses `Asia/Manila` rather than hard-coded foreign session times.
6. Indicators are taught as price-derived tools, not signals that guarantee direction.
7. No real-money execution, personalized advice or profit claims.

## Testing

```bash
npm test
npm run check
```

## Easy patch updates

If you cloned the repo with Git:

```bash
npm run update
```

This performs a fast-forward `git pull`, installs pinned dependencies, and reruns the release checks. Downloaded historical data is ignored by Git and stays local. Browser learning progress also stays local.

## Patch workflow

Use feature branches and pull requests:

```text
main              released / passing
feature/*         new learning or simulator work
fix/*             patches
```

Release only after tests + role review in `docs/RELEASE_REVIEW.md` pass.

## Data / learning sources

- Historical candles: `dukascopy-node` / Dukascopy data feed
- Risk and OTC-market mechanics: U.S. CFTC
- Historical macro lessons: official Fed, BLS, ECB, BOE, BOJ and government releases

This project is educational software, not financial advice. Past market behavior does not guarantee future results.
