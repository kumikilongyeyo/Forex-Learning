# Data and source policy — v0.2

## Historical candles

Primary downloader: https://github.com/Leo4815162342/dukascopy-node

V0.2 downloads **bid-side M15** candles for 2020–2025 and aggregates H1/H4 locally from the same M15 series. The app does not claim Dukascopy is the single “official” FX price. Retail spot FX is OTC and provider feeds can differ.

Generated historical JSON is local-only and excluded from Git.

## Training-label policy

Dense drills deliberately separate factual market data from trainer-generated labels:

- `structure`: directional-efficiency + ATR-scaled ruleset.
- `direction`: future close bucketed against an ATR threshold; explicitly hindsight, not a signal.
- `candles`: OHLC body/range classification.
- `EMA`: price / EMA20 / EMA50 alignment.
- `RSI`: RSI(14) zone.
- `risk`: USD-major pip-value and position-size math.

A rule-based answer is never presented as proof that discretionary chart reading has only one objectively correct interpretation.

## Retail FX / risk facts

CFTC retail OTC forex advisory:
https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CustomerAdvisory_MustKnowForex.html

## Historical-event primary sources

### Federal Reserve
- March 15, 2020 implementation note: https://www.federalreserve.gov/newsevents/pressreleases/monetary20200315a1.htm
- June 15, 2022 FOMC statement: https://www.federalreserve.gov/newsevents/pressreleases/monetary20220615a.htm
- September 18, 2024 FOMC statement: https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm

### European Central Bank
- July 21, 2022 monetary policy decisions: https://www.ecb.europa.eu/press/pr/date/2022/html/ecb.mp220721~53e5bdd317.en.html
- June 6, 2024 monetary policy decisions: https://www.ecb.europa.eu/press/pr/date/2024/html/ecb.mp240606~2148ecdb3c.en.html

### Bank of England
- September 2022 Monetary Policy Summary: https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2022/september-2022

### Bank of Japan
- March 19, 2024 Changes in the Monetary Policy Framework: https://www.boj.or.jp/en/mopo/mpmdeci/state_2024/k240319a.htm

### Japan Ministry of Finance
- April–June 2024 FX intervention operations: https://www.mof.go.jp/english/policy/international_policy/reference/feio/quarter/2024_2Qe.html

## Event timing rule

Use exact release time only when the primary source clearly provides one. Otherwise the app labels the timestamp as a chart/day/meeting anchor and does not pretend the official document establishes an exact intraday reaction second.

## Prohibited shortcuts

- No fabricated candles labeled as historical.
- No unsourced event narrative presented as fact.
- No “RSI 70 = sell” or equivalent signal shortcuts.
- No outcome-only grading presented as trade quality.
- No assumed favorable ordering when stop and target share one OHLC candle.
- No real-money execution or performance guarantee.
