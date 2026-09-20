# Adaptive Coach v0.4

Adaptive Coach is a deterministic learning layer that sits beside the existing Forex Lab curriculum. It does not invent trading signals, rewrite historical candles, or silently replace the core lesson order.

## What it models

The coach keeps separate views of:

- skill mastery;
- recurring failure type;
- prerequisite/root gaps;
- confidence calibration;
- voluntary interest/time spent;
- session focus/fatigue signals;
- retention due status.

Interest never substitutes for mastery. If a learner likes historical events but struggles with risk, the app may frame more examples around events, but it does not remove required risk work.

## Root-gap logic

Skills have explicit dependencies. Example:

`structure -> regime -> entry selection -> execution`

and

`candles -> volatility -> stop placement -> execution`.

A weak prerequisite receives extra priority when downstream skills are also weak. This avoids treating every visible mistake as an independent problem.

## Explanation ladder

Gap lessons use vetted explanation variants rather than unrestricted generated forex advice:

1. normal explanation;
2. simpler explanation;
3. analogy / visual mental model;
4. one-rule rescue.

Repeated misses move the learner down the simplification ladder. The learner can also manually request a simpler explanation.

## Adaptive Gauntlet

The Gauntlet samples questions with extra weight on the current root gap and weak skills. It measures:

- accuracy;
- confidence fit;
- applied/pressure performance;
- per-skill breakdown.

A wrong answer at high confidence is classified as stronger misconception evidence than a low-confidence miss.

## Focus Guard

The session timer is intentionally not a punishment timer. The learner can select 15, 30, 45 or 60 minutes, or let the coach recommend a duration.

When the target is reached, the app tells the learner to finish the current item and stop. It never forcibly closes a question.

Focus Guard estimates learning fatigue from non-medical behavioral signals such as:

- falling recent accuracy;
- repeated consecutive mistakes;
- slowing response time on coach-scored items.

If these signals become strong, the coach recommends ending the session or switching to lighter review.

## Adaptive session mix

Normal sessions target roughly:

- 60% forward curriculum;
- 25% weakness remediation;
- 15% mixed review / retention.

When a foundational gap becomes critical, remediation can temporarily increase to about 45%, while the main curriculum still continues.

## Privacy / storage

Adaptive data stays in browser/Electron local storage under `forex-lab-adaptive-coach-v1`. Existing Forex Lab progress continues to use its original local progress key. No learner profile is uploaded by this feature.

## Boundary

This feature adapts education, not real-money recommendations. Mastery scores are estimates from in-app evidence; they are not credentials, profitability claims, or guarantees of trading performance.
