# Release review — v0.1.0

Release gate uses four lenses. “10/10” means every listed release criterion passes; it is not a claim of objective perfection or guaranteed trading correctness.

## Senior UX/UI designer — 10/10 gate
- [x] Only four top-level sections.
- [x] Primary actions visible without nested navigation.
- [x] Learning and practice are separated.
- [x] Responsive layout for desktop/mobile.
- [x] Minimal palette and restrained decoration.
- [x] Practice warns when real data is not installed instead of showing fake data.

## Senior developer — 10/10 gate
- [x] Dependency-free learning UI; no framework needed at runtime.
- [x] Pure calculation functions covered by automated tests.
- [x] Historical data is generated locally and excluded from Git.
- [x] Static server prevents accidental file-directory browsing.
- [x] Future candles are hidden until a decision is locked.
- [x] Intrabar both-hit case is marked ambiguous in core logic.
- [x] `npm run check` passes.
- [x] Browser interaction harness passes Learn → quiz → Practice empty state → Progress with zero page errors.
- [x] Replay harness passes decision lock → next candle → full reveal → PHT timestamp → completed controls disabled.

## Teacher / instructor — 10/10 gate
- [x] Curriculum progresses foundations → charts → structure → risk → indicators → sessions → fundamentals → backtesting → psychology.
- [x] Every lesson has an explicit learning objective.
- [x] Every lesson has a knowledge check.
- [x] Explanations distinguish observation from prediction.
- [x] No-trade is taught as a valid decision.
- [x] Outcomes are separated from decision quality.

## Forex accuracy review — 10/10 gate
- [x] Base/quote, bid/ask, spread, pip conventions correct.
- [x] JPY pip convention handled in code/tests.
- [x] RSI/EMA/ATR described as derived tools, not guarantees.
- [x] R-multiple, risk %, drawdown and leverage lessons avoid profit promises.
- [x] Spot FX OTC caveat is explicit.
- [x] PHT uses Asia/Manila and warns about foreign DST shifts.
- [x] Macro lessons prefer official primary sources.
- [x] No personalized trade calls or broker execution.

## Remaining planned work after v0.1.0
- Add M15/H4 aggregation from locally downloaded M1 data.
- Add event-mode overlays with primary-source citations per event.
- Add structured strategy-specific drills where “correct” means rule compliance, not hindsight profit.
- Add Playwright/browser CI once kept lightweight enough for the repo.

## Final verification evidence

- Unit tests: 6/6 passing.
- Static gate: 60 lessons found; BUY/SELL/NO TRADE and Asia/Manila checks pass.
- JavaScript syntax checks: app, chart, core, curriculum, downloader pass.
- HTTP smoke: root page, JS asset and manifest routes respond correctly.
- Browser QA: rendered through system Chromium with an inline test harness because this environment blocks browser navigation to localhost. QA-only mock candles were used only to exercise UI behavior; the released app itself refuses to fabricate historical candles.
