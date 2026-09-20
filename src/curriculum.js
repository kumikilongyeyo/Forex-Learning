const q = (question, choices, answer, explain) => ({ question, choices, answer, explain });
const lesson = (id, title, minutes, objective, points, quiz, drill = '') => ({ id, title, minutes, objective, points, quiz, drill });

export const modules = [
  {
    id:'m1', title:'1. Forex Foundations', subtitle:'Ano ba talaga ang tina-trade mo?',
    lessons:[
      lesson('m1l1','What forex actually is',12,'Understand currencies as a relative price, not a magic money machine.',[
        'Forex = pagpapalit o pag-trade ng isang currency laban sa isa pa. EUR/USD is one relative price.',
        'Spot retail forex is generally OTC: walang iisang centralized spot exchange price.',
        'Your platform/dealer feed can differ slightly from another feed. Small candle differences can be normal.'
      ],q('Sa EUR/USD, ano ang base currency?',['USD','EUR','Pareho','Wala'],'EUR','The first currency is the base; the second is the quote.')),
      lesson('m1l2','Base vs quote currency',10,'Read pair prices without guessing.',[
        'EUR/USD = 1.1000 means roughly 1 EUR is priced at 1.10 USD on that feed.',
        'If EUR/USD rises, EUR strengthened relative to USD, USD weakened relative to EUR, or both forces contributed.',
        'Always say “relative to” — currencies move against each other.'
      ],q('USD/JPY rises from 150 to 151. Which statement is safest?',['JPY strengthened vs USD','USD strengthened vs JPY','Both currencies rose equally'],'USD strengthened vs JPY','A rising USD/JPY quote means one USD buys more JPY.')),
      lesson('m1l3','Major, minor and cross pairs',10,'Know what you are looking at before thinking about setups.',[
        'Majors include USD and are usually the most liquid retail FX pairs.',
        'Crosses do not contain USD, e.g. EUR/GBP.',
        'Liquidity and spreads vary by pair and time; do not assume every pair behaves the same.'
      ],q('Which is a cross pair?',['EUR/USD','USD/JPY','EUR/GBP','GBP/USD'],'EUR/GBP','EUR/GBP contains no USD.')),
      lesson('m1l4','Bid, ask and spread',14,'Understand why trades start slightly negative.',[
        'Bid = price available to sell; ask = price available to buy.',
        'Spread = ask minus bid and is a trading cost.',
        'Spreads can widen during illiquid periods and news; backtests that ignore cost can look unrealistically good.'
      ],q('If bid=1.1000 and ask=1.1002, spread is roughly…',['0.2 pip','2 pips','20 pips','200 pips'],'2 pips','For most non-JPY majors, one pip is 0.0001.')),
      lesson('m1l5','Pips and pipettes',14,'Measure price movement correctly.',[
        'Most FX pairs: 1 pip = 0.0001. JPY pairs: 1 pip = 0.01.',
        'A fifth decimal on many non-JPY quotes is a pipette (1/10 pip).',
        'Pips describe movement; money impact depends on position size.'
      ],q('USD/JPY moves 150.20 → 150.70. Movement?',['5 pips','50 pips','500 pips','0.5 pip'],'50 pips','JPY-pair pip size is 0.01, so 0.50 / 0.01 = 50.')),
      lesson('m1l6','Why beginners lose',12,'Start with survival instead of prediction.',[
        'Leverage magnifies gains and losses; it does not improve your forecast.',
        'Frequent trading adds spread/commission costs and creates more opportunities for execution mistakes.',
        'Learning goal #1 is repeatable decision quality and risk control — not “win every trade.”'
      ],q('Which is the healthiest first goal?',['Double an account fast','Never lose','Follow a tested risk process','Trade every session'],'Follow a tested risk process','A process can be evaluated. Guaranteed outcomes cannot.'))
    ]
  },
  {
    id:'m2', title:'2. Candles & Price', subtitle:'Read what happened before guessing what happens next.',
    lessons:[
      lesson('m2l1','OHLC anatomy',12,'Read a candle literally.',[
        'Open: first traded price in the candle period; high/low: extremes; close: last price.',
        'A green candle only says close > open for that period. It does not promise the next candle is green.',
        'Wicks show traded excursion, not automatically “rejection.” Context matters.'
      ],q('A bullish candle guarantees the next candle rises.',['True','False'],'False','One candle is historical information, not a guarantee.')),
      lesson('m2l2','Body vs wick',12,'Separate observation from storytelling.',[
        'Large body = relatively large open-to-close displacement for that candle.',
        'Long wick = price traded far from the body at some point.',
        'Do not attach psychology to a wick without location, trend, liquidity and follow-through context.'
      ],q('A long upper wick by itself means…',['Guaranteed sell','Guaranteed reversal','Price traded higher then closed lower within that candle','Manipulation'],'Price traded higher then closed lower within that candle','That is the literal fact; the rest requires context.')),
      lesson('m2l3','Timeframes',14,'Understand that one market can look different across scales.',[
        'M15, H1, H4 and D1 are aggregations of the same evolving market.',
        'An H1 pullback can be several M5 trends.',
        'Pick a decision timeframe and a context timeframe to avoid random zooming.'
      ],q('An H1 candle contains how many M15 candles?',['2','4','15','60'],'4','60 minutes / 15 = 4.')),
      lesson('m2l4','Volatility vs direction',12,'Stop confusing movement size with trend direction.',[
        'Volatility describes magnitude/variability of movement.',
        'A market can be highly volatile and still end near where it started.',
        'ATR measures recent range behavior; it does not tell you buy or sell.'
      ],q('ATR mainly measures…',['Direction','Volatility/range','Fair value','Interest rate'],'Volatility/range','ATR is not directional.')),
      lesson('m2l5','Gaps and weekend structure',10,'Know why FX charts can look discontinuous.',[
        'Retail spot FX trades nearly 24/5, not continuously through the weekend.',
        'Weekend/news repricing can create a visible gap between Friday and Monday quotes.',
        'Stops are not guaranteed to fill exactly at the requested price in fast/gapped markets.'
      ],q('A stop-loss always fills at the exact stop price.',['True','False'],'False','Fast markets and gaps can create slippage.')),
      lesson('m2l6','Observation drill',10,'Describe a chart without predicting it.',[
        'Say: “price made a higher high.” Not: “market makers hunted everyone.”',
        'Separate observation, hypothesis, and action.',
        'This habit reduces hindsight storytelling.'
      ],q('Which is an observation?',['Buyers will definitely win','Price closed above the prior swing high','Banks are trapping sellers','It must reverse'],'Price closed above the prior swing high','That statement can be checked directly on the chart.'))
    ]
  },
  {
    id:'m3', title:'3. Market Structure', subtitle:'Trend, range, break, failure.',
    lessons:[
      lesson('m3l1','Swing highs and lows',14,'Mark structure consistently.',[
        'A swing high/low is a local turning point; exact algorithms vary.',
        'Use a consistent rule instead of moving the swing after seeing the future.',
        'Structure is descriptive, not a standalone entry signal.'
      ],q('Why define swing rules before testing?',['To improve colors','To avoid hindsight moving the goalposts','To guarantee profit'],'To avoid hindsight moving the goalposts','Consistent definitions make backtests comparable.')),
      lesson('m3l2','HH / HL uptrend',16,'Recognize a basic rising structure.',[
        'A sequence of meaningful higher highs and higher lows can describe an uptrend.',
        'One higher high is not enough to prove a durable trend.',
        'Trend strength and trade location are separate questions.'
      ],q('Classic rising structure is…',['LH + LL','HH + HL','HH + LL','Equal highs only'],'HH + HL','Higher highs plus higher lows.')),
      lesson('m3l3','LH / LL downtrend',16,'Recognize a basic falling structure.',[
        'Lower highs and lower lows can describe a downtrend.',
        'Do not short purely because price fell; consider location and invalidation.',
        'After an extended move, downside may still continue — “too low” is not analysis.'
      ],q('Classic falling structure is…',['LH + LL','HH + HL','HL + LL','Equal lows'],'LH + LL','Lower highs plus lower lows.')),
      lesson('m3l4','Ranges',16,'Identify when trend logic is inappropriate.',[
        'Range = price repeatedly rotates within a bounded area.',
        'Middle of a range often offers worse location than edges for range strategies.',
        'Breakouts can fail; do not assume touching outside = permanent breakout.'
      ],q('For a basic range strategy, the least informative location is often…',['Near range edge','Middle of range','Prior extreme'],'Middle of range','The middle usually offers less asymmetric location.')),
      lesson('m3l5','Breakout vs close',14,'Define a breakout instead of eyeballing it.',[
        'A wick through a level and a close through a level are different events.',
        'You can require close, retest, displacement, or other rules — but define them before testing.',
        'Stricter confirmation usually means later entry; every filter has trade-offs.'
      ],q('Best backtest practice?',['Change breakout definition per chart','Define breakout criteria in advance','Ignore failed breakouts'],'Define breakout criteria in advance','Predefined rules reduce hindsight bias.')),
      lesson('m3l6','Failed breaks',14,'Spot when continuation did not hold.',[
        'A failed breakout occurs when price breaches a defined boundary but does not sustain acceptance by your rule.',
        'Failure can be useful information but is not an automatic reversal signal.',
        'Record how often your exact definition works before trusting it.'
      ],q('A failed breakout guarantees reversal.',['True','False'],'False','It changes information; it does not guarantee the next direction.'))
    ]
  },
  {
    id:'m4', title:'4. Support, Resistance & Location', subtitle:'Zones, not magical laser lines.',
    lessons:[
      lesson('m4l1','Horizontal levels',14,'Use levels as areas of prior interaction.',[
        'Support/resistance are usually better treated as zones than exact one-pixel prices.',
        'More touches do not automatically make a level stronger forever.',
        'A level matters only if your strategy defines how it changes decisions.'
      ],q('Best mental model for many S/R areas?',['Exact magical line','Zone of prior interaction','Guaranteed reversal point'],'Zone of prior interaction','Market prices are not obligated to react to one exact pixel.')),
      lesson('m4l2','Previous high / low',12,'Use simple objective references.',[
        'Prior day/week highs and lows are objective landmarks.',
        'They can cluster orders/liquidity but do not guarantee reaction.',
        'Mark them before the session if they belong to your plan.'
      ],q('A prior-day high is useful because it is…',['Guaranteed resistance','An objective historical reference','Always a sell signal'],'An objective historical reference','It is observable without hindsight.')),
      lesson('m4l3','Role reversal',12,'Understand level context changes.',[
        'Old resistance can later act as support and vice versa, but this is a behavior to test, not a law.',
        'Retest depth and timing vary.',
        'Define what counts as a successful retest.'
      ],q('“Resistance becomes support every time.”',['True','False'],'False','Role reversal is common language, not a guarantee.')),
      lesson('m4l4','Confluence without clutter',14,'Combine independent reasons without indicator soup.',[
        'Confluence means multiple relevant conditions align under a defined setup.',
        'Three correlated momentum indicators are not three independent reasons.',
        'More filters reduce trades and can overfit historical data.'
      ],q('Adding more indicators always improves a strategy.',['True','False'],'False','More conditions can overfit and reduce robustness.')),
      lesson('m4l5','Location before trigger',12,'Avoid chasing technically valid signals in bad places.',[
        'A trigger can be valid yet poorly located relative to nearby support/resistance.',
        'Think: context → location → trigger → invalidation.',
        'If target space is tiny relative to stop distance, skip may be rational.'
      ],q('A good trigger with terrible reward space should be…',['Always taken','Evaluated against the plan and possibly skipped','Doubled in size'],'Evaluated against the plan and possibly skipped','Setup quality includes location and risk/reward.')),
      lesson('m4l6','No-trade skill',10,'Treat inactivity as an active decision.',[
        'No-trade is valid when your setup is absent.',
        'A strategy with rules should also contain explicit skip rules.',
        'Opportunity cost is real, but forcing trades can be more expensive.'
      ],q('If your setup rules are not met…',['Trade smaller anyway','Skip the trade','Move rules after entry'],'Skip the trade','Rule compliance matters more than action frequency.'))
    ]
  },
  {
    id:'m5', title:'5. Risk & Position Sizing', subtitle:'The part that keeps you alive long enough to learn.',
    lessons:[
      lesson('m5l1','Risk per trade',16,'Translate percentage risk into money.',[
        'Risk % should be calculated from current account equity/balance according to your plan.',
        '₱100,000 × 1% = ₱1,000 planned risk before slippage/fees.',
        'Risk sizing does not make a bad strategy profitable; it controls damage.'
      ],q('₱80,000 account at 0.5% planned risk =',['₱40','₱400','₱4,000','₱8,000'],'₱400','80,000 × 0.005 = 400.')),
      lesson('m5l2','Stop-loss as invalidation',16,'Place stops for a reason, then size around them.',[
        'A stop should represent where your trade thesis is invalidated under the strategy.',
        'Do not pick lot size first and squeeze the stop to make the money risk fit.',
        'Wider stop → smaller size for the same money risk.'
      ],q('Same money risk, wider stop means…',['Larger size','Smaller size','Same size always'],'Smaller size','Position size adapts to stop distance.')),
      lesson('m5l3','R-multiple',14,'Compare trades independent of account size.',[
        '1R = the amount you planned to lose if the stop is hit.',
        '+2R means profit equal to twice planned initial risk.',
        'R-multiples make different trade sizes easier to compare.'
      ],q('Risk ₱500, profit ₱1,000 =',['+0.5R','+1R','+2R','+5R'],'+2R','1,000 / 500 = 2R.')),
      lesson('m5l4','Risk:reward ratio',14,'Calculate potential reward relative to stop distance.',[
        'Entry 100, stop 99, target 102 = 1 unit risk vs 2 units potential reward = 2R target.',
        'High R:R does not automatically mean high expectancy; win rate and execution matter.',
        'Targets should be market/strategy-based, not chosen only to create pretty ratios.'
      ],q('Can a 1:5 R:R strategy lose money?',['No','Yes'],'Yes','If its win rate/fees/execution produce negative expectancy, it can lose.')),
      lesson('m5l5','Drawdown',14,'Understand why recovery gets harder.',[
        'A 50% loss requires a 100% gain on the remaining capital to recover.',
        'Large drawdowns change both psychology and mathematical recovery burden.',
        'Risk caps exist to prevent one bad period from ending the learning process.'
      ],q('After losing 50%, required gain to return to start is…',['50%','75%','100%','150%'],'100%','Half the capital must double to return to the original amount.')),
      lesson('m5l6','Leverage',16,'Understand leverage without worshipping it.',[
        'Leverage allows controlling a larger notional position with less margin.',
        'It magnifies P/L relative to deposited capital and can accelerate losses.',
        'Available leverage is not recommended leverage.'
      ],q('Higher leverage improves signal accuracy.',['True','False'],'False','Leverage changes exposure, not forecasting skill.'))
    ]
  },
  {
    id:'m6', title:'6. Indicators', subtitle:'Tools, not prophecy.',
    lessons:[
      lesson('m6l1','EMA',14,'Use moving averages as a lagging summary.',[
        'EMA weights recent prices more heavily than an SMA.',
        'EMA direction/position can summarize trend behavior but is derived from price.',
        'Crossovers lag and can whipsaw in ranges.'
      ],q('EMA is derived primarily from…',['Future prices','Past/current price data','Central bank speeches only'],'Past/current price data','It is a transformation of observed price.')),
      lesson('m6l2','RSI',16,'Read momentum without the 70=sell meme.',[
        'RSI is a bounded momentum oscillator, commonly 0–100.',
        '70/30 are conventional reference levels, not automatic reversal commands.',
        'Strong trends can remain “overbought/oversold” for extended periods.'
      ],q('RSI above 70 means guaranteed sell.',['True','False'],'False','It describes momentum relative to its lookback, not certainty.')),
      lesson('m6l3','ATR',14,'Use recent true range to frame volatility.',[
        'ATR incorporates gaps relative to prior close through true range logic.',
        'ATR can help normalize stop/volatility expectations across periods.',
        'ATR has no bullish/bearish direction.'
      ],q('If ATR doubles, safest conclusion is…',['Trend doubled','Recent range/volatility increased','Buy immediately'],'Recent range/volatility increased','ATR is about magnitude, not direction.')),
      lesson('m6l4','MACD',14,'Understand what a momentum/trend transform is doing.',[
        'MACD is built from differences between moving averages and a signal line.',
        'It is still derived from price and therefore lagging.',
        'Divergence is contextual evidence, not a guaranteed reversal.'
      ],q('MACD uses price-derived moving averages.',['True','False'],'True','Its core construction is based on EMAs.')),
      lesson('m6l5','Bollinger Bands',14,'Understand volatility envelopes.',[
        'Bands are commonly a moving average plus/minus a multiple of standard deviation.',
        'Touching a band does not automatically mean reversal.',
        'Band width can help describe changing volatility.'
      ],q('Upper-band touch automatically means short.',['True','False'],'False','Band touches need context and a defined strategy.')),
      lesson('m6l6','Indicator discipline',12,'Use as few tools as your strategy needs.',[
        'Every indicator should answer a specific question.',
        'Avoid adding indicators only because a chart feels uncertain.',
        'Price + one or two complementary tools is easier to audit than indicator soup.'
      ],q('Best reason to add an indicator?',['Looks professional','It answers a specific tested question','More colors'],'It answers a specific tested question','Tools should have a defined purpose.'))
    ]
  },
  {
    id:'m7', title:'7. Sessions & Philippine Time', subtitle:'When liquidity changes while you are in UTC+8.',
    lessons:[
      lesson('m7l1','Why sessions matter',14,'Connect time-of-day with liquidity conditions.',[
        'FX activity changes as major financial centers open/overlap.',
        'Different pairs can behave differently across sessions.',
        'Session patterns are tendencies, not guaranteed volatility windows.'
      ],q('Session timing guarantees direction.',['True','False'],'False','Timing can affect liquidity/volatility, not guarantee direction.')),
      lesson('m7l2','Asia session',12,'Understand the first major regional trading block of the PH day.',[
        'Tokyo and other Asia-Pacific centers contribute liquidity during Philippine daytime.',
        'JPY, AUD and NZD pairs can be especially relevant, but behavior varies.',
        'Use exact timezone conversion, not a static meme infographic.'
      ],q('Why avoid memorizing one permanent London time in PHT?',['Charts lie','DST shifts London/New York relative to Manila','PHT changes weekly'],'DST shifts London/New York relative to Manila','Manila stays UTC+8 while London/NY change daylight-saving offsets.')),
      lesson('m7l3','London session',12,'Recognize a major liquidity period.',[
        'London is a major FX center and overlaps with late Asia and later New York.',
        'European data releases can create abrupt moves.',
        'Do not infer “London open = breakout” without testing.'
      ],q('London open always breaks the Asian range.',['True','False'],'False','That is a popular heuristic, not a law.')),
      lesson('m7l4','New York session',12,'Understand USD-heavy event risk.',[
        'US releases and Fed communication commonly occur during New York hours.',
        'London/New York overlap can bring high activity.',
        'Spread/slippage risk can rise around major announcements.'
      ],q('Major news can increase slippage risk.',['True','False'],'True','Fast repricing can reduce fill quality.')),
      lesson('m7l5','DST for Filipinos',14,'Convert sessions correctly year-round.',[
        'Philippine time is UTC+8 year-round and does not observe DST.',
        'New York and London do observe seasonal clock changes.',
        'Therefore their local opens shift by one hour in PHT depending on season.'
      ],q('Does Manila observe daylight saving time?',['Yes','No'],'No','Asia/Manila remains UTC+8.')),
      lesson('m7l6','Session journal',10,'Measure your own performance by time window.',[
        'Tag each simulation by PHT session window.',
        'Compare decision quality and rule compliance by session.',
        'Do not optimize around tiny samples; collect enough repetitions.'
      ],q('10 trades are enough to declare a session edge forever.',['True','False'],'False','Small samples are noisy and vulnerable to luck.'))
    ]
  },
  {
    id:'m8', title:'8. Fundamentals & News', subtitle:'Why macro expectations can move currencies.',
    lessons:[
      lesson('m8l1','Interest rates',16,'Understand rate expectations as a major FX driver.',[
        'Currencies respond to expected relative monetary policy, not just today’s rate number.',
        'Markets can price expected changes before a central-bank meeting.',
        'A hike can coincide with currency weakness if the decision was already priced or guidance disappoints.'
      ],q('A rate hike guarantees currency strength immediately.',['True','False'],'False','Markets trade expectations and relative outlook, not a one-variable rule.')),
      lesson('m8l2','Inflation / CPI',16,'Connect inflation data to policy expectations.',[
        'Inflation data can alter expectations for future central-bank policy.',
        'Actual vs consensus expectation often matters more than “high vs low” alone.',
        'Revisions and details can matter too.'
      ],q('Why compare CPI actual vs expectation?',['Markets often price expectations beforehand','CPI has no units','Because charts require it'],'Markets often price expectations beforehand','Surprise relative to expectations can drive repricing.')),
      lesson('m8l3','Employment',14,'Understand why jobs data can matter.',[
        'Employment and wage data inform growth/inflation expectations.',
        'US NFP is widely watched but reaction depends on the full release and expectations.',
        'Avoid placing oversized bets seconds before high-impact releases.'
      ],q('NFP direction is always predictable from headline jobs alone.',['True','False'],'False','Other components and prior expectations matter.')),
      lesson('m8l4','Central banks',16,'Know the institutions behind major-currency policy.',[
        'Fed → USD; ECB → EUR; BOE → GBP; BOJ → JPY, among others.',
        'Statements, forecasts and press conferences can matter as much as the rate decision.',
        'Use official releases when studying historical events.'
      ],q('Best source for what a central bank actually announced?',['Random repost','Official central-bank release','Anonymous signal group'],'Official central-bank release','Primary sources reduce transcription and context errors.')),
      lesson('m8l5','Intervention',14,'Understand that authorities can directly enter FX markets.',[
        'Some governments/central banks intervene in currency markets.',
        'Intervention can cause abrupt moves and may occur around stressed conditions.',
        'Historical event mode should cite official authority records where available.'
      ],q('FX intervention can create abrupt moves.',['True','False'],'True','Direct official action can materially change order flow.')),
      lesson('m8l6','News risk plan',14,'Decide what you will do before a release.',[
        'A plan can say: no new entries X minutes around specified events.',
        'If your strategy trades news, model spread/slippage honestly.',
        '“I will decide in the moment” is not a reproducible rule.'
      ],q('Best time to define news-risk rules?',['Before trading','After losing','During the spike'],'Before trading','Precommitment reduces impulsive decisions.'))
    ]
  },
  {
    id:'m9', title:'9. Strategy Building & Backtesting', subtitle:'Turn ideas into rules you can falsify.',
    lessons:[
      lesson('m9l1','Setup vs strategy',14,'Separate one chart pattern from a complete system.',[
        'A setup is an entry context; a strategy also defines risk, exits, skips and management.',
        'Rules should be specific enough that another person can reproduce your test.',
        'If every losing chart becomes a new exception, you are overfitting.'
      ],q('A complete strategy needs…',['Only an entry','Entry plus risk/exit/skip rules','Only an indicator'],'Entry plus risk/exit/skip rules','Execution and risk rules matter as much as entry.')),
      lesson('m9l2','Expectancy',16,'Combine win rate and payoff instead of worshipping one metric.',[
        'Simplified expectancy = winRate × avgWin − lossRate × avgLoss.',
        'A sub-50% win-rate strategy can be profitable if average winners exceed losses enough.',
        'Fees/slippage must be included.'
      ],q('Can 40% win rate be profitable?',['Never','Yes, depending on average win/loss and costs','Only on Mondays'],'Yes, depending on average win/loss and costs','Win rate alone is incomplete.')),
      lesson('m9l3','Sample size',14,'Avoid declaring victory after ten trades.',[
        'Small samples can be dominated by luck and market regime.',
        'Test across different years and volatility regimes.',
        'Keep out-of-sample periods when possible.'
      ],q('Which test is more credible?',['12 cherry-picked trades','Hundreds of rules-based trades across regimes','3 winning screenshots'],'Hundreds of rules-based trades across regimes','Broader samples reduce cherry-picking.')),
      lesson('m9l4','Look-ahead bias',16,'Stop accidentally seeing the future.',[
        'Do not use indicators/labels computed with future information.',
        'Historical replay must hide future candles before the decision.',
        'Do not move swing labels after future candles reveal themselves.'
      ],q('Seeing future candles while choosing an entry creates…',['Slippage','Look-ahead bias','Spread'],'Look-ahead bias','The decision used information unavailable in real time.')),
      lesson('m9l5','Intrabar ambiguity',16,'Know when OHLC data cannot resolve sequence.',[
        'If one H1 candle touches both your stop and target, H1 OHLC does not reveal which came first.',
        'Resolve with lower-timeframe/tick data or mark the result ambiguous.',
        'Never silently assume the favorable sequence.'
      ],q('H1 candle hits both SL and TP. Correct response with no finer data?',['Count win','Count loss','Mark ambiguous / inspect finer data'],'Mark ambiguous / inspect finer data','OHLC does not contain the path inside the candle.')),
      lesson('m9l6','Walk-forward mindset',14,'Keep testing new periods instead of polishing the past.',[
        'Develop on one sample, validate on untouched data, then paper test forward.',
        'A strategy can degrade as market conditions change.',
        'Patch the method only with evidence, not one emotional loss.'
      ],q('Best use of untouched data?',['Tune rules repeatedly','Validate after rules are set','Delete losing periods'],'Validate after rules are set','Untouched data helps estimate generalization.'))
    ]
  },
  {
    id:'m10', title:'10. Psychology & Execution', subtitle:'Your rules are useless if you stop following them.',
    lessons:[
      lesson('m10l1','FOMO',12,'Recognize chase behavior.',[
        'FOMO often appears after a large move when planned entry location is already gone.',
        'Missing a trade is not a trading loss.',
        'Define chase limits or skip rules before the move.'
      ],q('Missing a setup equals losing money.',['True','False'],'False','No position means no trading P/L.')),
      lesson('m10l2','Revenge trading',12,'Stop using the next trade to emotionally repair the last one.',[
        'Losses are part of any probabilistic strategy.',
        'Increasing size because you “need it back” changes risk without evidence.',
        'Use daily risk/attempt caps if impulse control is a problem.'
      ],q('After a loss, double size to recover faster.',['Good rule','Bad rule unless independently justified by tested system','Always required'],'Bad rule unless independently justified by tested system','Emotion is not a sizing model.')),
      lesson('m10l3','Overtrading',12,'Measure unnecessary activity.',[
        'More trades mean more exposure to spread, slippage and mistakes.',
        'Quality filters should reduce action when conditions are absent.',
        'Track rule violations separately from losses.'
      ],q('A losing trade can still be well executed.',['True','False'],'True','Good decisions can have losing outcomes.')),
      lesson('m10l4','Outcome bias',14,'Judge the decision, not only the P/L.',[
        'A bad gamble can win once; a sound setup can lose once.',
        'Score rule compliance, risk, entry logic and execution separately from outcome.',
        'This simulator stores both decision notes and price outcome.'
      ],q('Profit automatically proves the decision was good.',['True','False'],'False','Outcome alone cannot validate the process.')),
      lesson('m10l5','Journaling',14,'Create feedback you can actually use.',[
        'Record setup, timeframe, entry, risk, reason, emotion, result and rule compliance.',
        'Use tags so recurring mistakes are measurable.',
        'Screenshots help, but structured fields enable statistics.'
      ],q('Most useful journal data is…',['Only screenshots','Structured reasons + risk + result + rule compliance','Only profit'],'Structured reasons + risk + result + rule compliance','That data can reveal patterns.')),
      lesson('m10l6','Graduation rule',14,'Know when not to go live.',[
        'Finish curriculum, pass objective quizzes, and complete a large paper/replay sample first.',
        'Use stable risk and no unexplained rule changes during validation.',
        'Real money adds emotion and execution differences; simulator success is not a guarantee.'
      ],q('Simulator profitability guarantees live profitability.',['True','False'],'False','Live fills, costs, psychology and future regimes can differ.'))
    ]
  }
];

export const lessonCount = modules.reduce((n,m)=>n+m.lessons.length,0);
