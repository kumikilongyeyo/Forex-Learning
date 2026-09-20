# Release review — v0.2.0

“10/10” means every criterion defined below passes. It does **not** mean financial markets, discretionary chart interpretation, or the software can never produce an edge case.

## Senior UX/UI designer — 10/10 gate
- [x] Only four top-level sections remain: Learn / Practice / Progress / Sources.
- [x] Practice complexity is contained in one four-item subnav.
- [x] Dense drill screen keeps chart + one question panel only.
- [x] Replay actions are progressive: decision → reveal.
- [x] Trading session separates account stats, chart controls, and trade ticket.
- [x] Historical-event context appears after the decision/replay, reducing hindsight leakage.
- [x] Responsive desktop/mobile CSS retained.
- [x] Missing historical data shows one clear installer path instead of fake fallback content.

## Senior developer — 10/10 gate
- [x] Plain HTML/CSS/JS runtime; no frontend framework required.
- [x] 21 automated tests pass.
- [x] USD-major pip value and lot-size math tested.
- [x] Quote-USD and base-USD manual P/L math tested.
- [x] Stop/target both-hit candle remains explicitly ambiguous.
- [x] M15 → H1/H4 OHLC aggregation extracted to a pure tested function.
- [x] Dense-drill generation tested across all six skills.
- [x] Spaced-repetition reset/prioritization tested.
- [x] Event nearest-timestamp lookup and source coverage tested.
- [x] Static gate verifies four practice modes, M15/H1/H4 data path, bid price type, >=8 sourced events, and >=60 lessons.
- [x] JavaScript syntax checks cover app, chart, core, curriculum, drills, events, data utilities, downloader, server, updater.
- [x] Chromium inline interaction QA passes Dense Drills → Replay → Trading Session → Historical Events → Progress with zero page/console errors.
- [x] QA mock candles are browser-test-only and removed before release.

## Teacher / instructor — 10/10 gate
- [x] Existing structured curriculum remains sequential and quiz gated.
- [x] Dense drills are repeated retrieval practice instead of one-off examples.
- [x] Weak/due categories reappear via spaced repetition.
- [x] Difficulty tiers progressively hide pair/date/context clues.
- [x] Future-outcome drill explicitly teaches hindsight-vs-signal distinction.
- [x] No-trade remains a valid replay decision.
- [x] Risk sizing is practiced numerically rather than described only in prose.
- [x] Trading-session mode makes the learner set risk, stop and target before seeing future candles.
- [x] Historical-event challenges reveal primary-source context after the learner commits.

## Forex accuracy review — 10/10 gate
- [x] JPY and non-JPY pip conventions remain tested.
- [x] Position-size math uses USD account + USD-major-specific pip value.
- [x] Manual P/L handles pairs where USD is quote or base.
- [x] Bid-side OHLC limitation is explicit; no broker-grade P/L claim.
- [x] Spread/slippage/commission/swap/latency omissions are explicit.
- [x] Spot FX OTC caveat remains explicit.
- [x] EMA/RSI/ATR labels are descriptive, not guaranteed signals.
- [x] Structure labels disclose their algorithmic ruleset.
- [x] Event claims link to official Fed/ECB/BOE/BOJ/MOF material.
- [x] Coarse event anchors are disclosed when primary sources do not establish exact intraday timing.
- [x] PHT uses `Asia/Manila`.
- [x] No personalized trade calls, real-money execution, or profit promises.

## Final verification evidence

- Automated tests: **21/21 passing**.
- Static gate: **60 lessons, 4 practice modes, M15/H1/H4 path, 8 sourced events**.
- Chromium interaction QA: **pass, zero page/console errors**.
- Visual review: dense-drill, trading-session, event-reveal and progress screens checked at 1440×1000.
- Release must still pass GitHub Actions on the exact PR head and again on `main` after merge.
