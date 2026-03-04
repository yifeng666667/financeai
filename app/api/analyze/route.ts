import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Mock AI analysis for development.
export async function POST(req: Request) {
    try {
        const { title, content } = await req.json();

        let lowerText = ((title || '') + ' ' + (content || '')).toLowerCase();

        // Detect if content contains a URL
        const urlMatch = content.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            try {
                const url = urlMatch[0];
                const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (res.ok) {
                    const html = await res.text();
                    const $ = cheerio.load(html);
                    $('script, style, nav, footer, aside').remove();
                    const scrapedText = $('h1, h2, h3, p').map((i, el) => $(el).text()).get().join(' ');
                    lowerText += ' ' + scrapedText.toLowerCase();
                    console.log('Successfully scraped URL content');
                }
            } catch (err) {
                console.warn('Failed to scrape URL:', err);
            }
        }

        let analysis = {
            systemicInterpretation: {
                headline: "Market Absorbs Mixed Signals Amid Lingering Uncertainty",
                points: [
                    "Short-term price action will remain choppy until clearer catalysts emerge.",
                    "Long-term structural shifts depend heavily on forthcoming macroeconomic data and geopolitical stability.",
                    "Capital allocation favors defensive positioning with targeted opportunistic exposure."
                ]
            },
            sentiment: 'Neutral',
            impactScore: 50,
            summary: `• Short-term & Long-term Impact: The situation presents a mixed outlook. Short-term volatility is expected as the market digests the news, while the long-term structural impact remains to be fully priced in depending on subsequent developments.\n• Key Stakeholders: Institutional investors and broad market index funds are the primary stakeholders navigating this uncertainty.`,
            industryChain: {
                upstream: 'Raw material and fundamental supply costs may experience moderate fluctuations.',
                midstream: 'Operational margins could be squeezed or expanded depending on pricing power.',
                downstream: 'End-consumer demand is expected to remain resilient, though discretionary spending might face shifts.'
            },
            stockIndications: [
                { ticker: 'SPY', rating: 'Buy', reason: 'Broad market proxy.' },
                { ticker: 'QQQ', rating: 'Buy', reason: 'Tech index exposure.' },
                { ticker: 'DIA', rating: 'Buy', reason: 'Value tilt in uncertainty.' },
                { ticker: 'IWM', rating: 'Buy', reason: 'Small cap momentum.' },
                { ticker: 'VIXY', rating: 'Sell', reason: 'Volatility expected to crush.' },
                { ticker: 'TLT', rating: 'Sell', reason: 'Yields rising slightly.' },
                { ticker: 'GLD', rating: 'Sell', reason: 'Safe haven flows reversing.' },
                { ticker: 'UUP', rating: 'Sell', reason: 'Dollar weakness expected.' }
            ],
            entities: ['SPX', 'DXY']
        };

        if (lowerText.match(/oil|hormuz|energy|crude|gas|saudi|iran/)) {
            const isBearish = lowerText.match(/tumble|fall|drop|fail|crisis|fear/);
            analysis.sentiment = isBearish ? 'Bearish' : 'Bullish';
            analysis.impactScore = Math.floor(75 + Math.random() * 20);
            analysis.systemicInterpretation = {
                headline: "Geopolitical Shock Triggers Instant Energy Repricing & Supply Premiums",
                points: [
                    "Immediate injection of geopolitical risk premium significantly elevates short-term crude trajectories.",
                    "Broad inflationary pressure cascades across industrial sectors and global logistics networks.",
                    "Defensive restructuring accelerates: E&P margins expand while airlines and consumer discretionary face immediate gross margin compression."
                ]
            };
            analysis.summary = `• Short-term & Long-term Impact: Immediate supply shock concerns will drive up short-term energy prices, injecting inflationary pressures globally. Long-term, this friction accelerates the transition towards alternative energy sources and domestic production independence.\n• Key Stakeholders: Beneficiaries include upstream E&P companies and defense contractors. Conversely, stakeholders facing severe headwinds include airlines, logistics firms, and general consumers dealing with higher fuel costs.`;
            analysis.industryChain = {
                upstream: 'Exploration and Production (E&P) companies will see immediate margin expansion due to elevated crude prices and geopolitical premiums.',
                midstream: 'Refiners and pipeline operators face volatile crack spreads; input costs rise significantly, potentially outpacing product pricing.',
                downstream: 'Transportation sectors (airlines, shipping) and consumer discretionary spending will take a direct hit from higher fuel expenses.'
            };
            analysis.stockIndications = [
                { ticker: 'XOM', rating: 'Buy', reason: 'Direct beneficiary of rising global crude prices.' },
                { ticker: 'CVX', rating: 'Buy', reason: 'Strong upstream portfolio provides a robust hedge.' },
                { ticker: 'COP', rating: 'Buy', reason: 'High leverage to crude oil price spikes.' },
                { ticker: 'SLB', rating: 'Buy', reason: 'Increased drilling activity drives services demand.' },
                { ticker: 'UAL', rating: 'Sell', reason: 'Highly sensitive to jet fuel price spikes.' },
                { ticker: 'DAL', rating: 'Sell', reason: 'Margin compression from rising energy inputs.' },
                { ticker: 'CCL', rating: 'Sell', reason: 'Discretionary travel takes a hit on fuel costs.' },
                { ticker: 'FDX', rating: 'Sell', reason: 'Logistics margins squeezed by transport costs.' }
            ];
            analysis.entities = ['USO', 'XLE', 'JETS'];
        } else if (lowerText.match(/renewables|solar|wind|clean energy|esg|climate|green/)) {
            analysis.sentiment = 'Bullish';
            analysis.impactScore = Math.floor(65 + Math.random() * 20);
            analysis.systemicInterpretation = {
                headline: "Capital Pivots to Green Infrastructure Amid Shifting Geopolitical Moats",
                points: [
                    "Macro friction on fossil fuels heavily accelerates long-duration capital into renewable energy and grid decentralization.",
                    "Supply chains for critical minerals (lithium, copper) are structurally strained, giving upstream producers massive pricing power.",
                    "Policy tailwinds provide a highly defensive floor for utility-scale solar and battery storage economics."
                ]
            };
            analysis.summary = `• Short-term & Long-term Impact: Short-term policy momentum or geopolitical stress on fossil fuels drives capital rapidly into clean energy. Long-term, this solidifies the structural shift toward the green energy transition and ESG mandates globally.\n• Key Stakeholders: Primary beneficiaries are renewable developers, panel manufacturers, and grid infrastructure providers. Legacy high-emission utilities may face accelerated regulatory and competitive pressure.`;
            analysis.industryChain = {
                upstream: 'Producers of critical minerals (lithium, copper, polysilicon) face surging demand and potential supply bottlenecks.',
                midstream: 'Manufacturers of solar panels, wind turbines, and energy storage systems will see robust order book growth and pricing power.',
                downstream: 'Utility-scale installers and consumer-level EV/solar adoption rates will accelerate due to favorable economics and incentives.'
            };
            analysis.stockIndications = [
                { ticker: 'FSLR', rating: 'Buy', reason: 'Leading domestic solar manufacturer, utility-scale demand.' },
                { ticker: 'ENPH', rating: 'Buy', reason: 'Strong position in microinverters and home energy systems.' },
                { ticker: 'NEE', rating: 'Buy', reason: 'World\'s largest generator of renewable energy.' },
                { ticker: 'SEDG', rating: 'Buy', reason: 'Inverter demand accelerates globally.' },
                { ticker: 'XOM', rating: 'Sell', reason: 'Long-term structural shift away from fossil fuels.' },
                { ticker: 'CVX', rating: 'Sell', reason: 'Policy headwinds suppress long-term capital flows.' },
                { ticker: 'BTU', rating: 'Sell', reason: 'Coal phase-out accelerates under green mandates.' },
                { ticker: 'CEG', rating: 'Sell', reason: 'Legacy power generation models face disruption.' }
            ];
            analysis.entities = ['ICLN', 'TAN', 'FAN'];
        } else if (lowerText.match(/tech|ai|nvidia|chip|semiconductor|apple|cloud/)) {
            const isBearish = lowerText.match(/drop|fall|sell|loss|panic|regulation|ban/);
            analysis.sentiment = isBearish ? 'Bearish' : 'Bullish';
            analysis.impactScore = Math.floor(80 + Math.random() * 15);
            analysis.systemicInterpretation = {
                headline: isBearish ? "Technology Sector Recalibrates: Multiples Compress on Headwinds" : "AI Infrastructure CapEx Dominates: Secular Growth Momentum Accelerates",
                points: isBearish ? [
                    "High-beta technology names face severe multiple compression amidst rising regulatory or macro headwinds.",
                    "Capital rapidly rotates towards defensive, low-beta cash flow streams like Consumer Staples.",
                    "Wait for semiconductor cycle bottoms before initiating fresh, long-term structural positions."
                ] : [
                    "Hyperscaler capital expenditure into AI networking and compute drives unprecedented infrastructure expansion.",
                    "Foundries and critical semiconductor equipment manufacturers enjoy total monopolistic pricing power.",
                    "Enterprise software adoption represents the next phase of structural revenue scaling across the ecosystem."
                ]
            };
            analysis.summary = `• Short-term & Long-term Impact: Short-term tech sector momentum is heavily influenced by immediate earnings and product cycles. Long-term, the AI infrastructure build-out remains a multi-year secular growth driver transforming global productivity.\n• Key Stakeholders: Hyperscalers (cloud providers), semiconductor foundries, and specialized AI startups are the main beneficiaries, capturing the vast majority of capital expenditure.`;
            analysis.industryChain = {
                upstream: 'Semiconductor capital equipment makers (lithography, testing) see extended lead times and record strategic backlogs.',
                midstream: 'Fabless chip designers and advanced foundries enjoy massive pricing power and continuous margin expansion.',
                downstream: 'Software companies integrating AI features face near-term execution risks but massive total addressable market expansion.'
            };
            if (isBearish) {
                analysis.stockIndications = [
                    { ticker: 'CLX', rating: 'Buy', reason: 'Defensive rotation into consumer staples.' },
                    { ticker: 'K', rating: 'Buy', reason: 'Food staples outperform during tech selloffs.' },
                    { ticker: 'GIS', rating: 'Buy', reason: 'High dividend yield and low beta defensive play.' },
                    { ticker: 'PG', rating: 'Buy', reason: 'Safe haven during high-beta technology corrections.' },
                    { ticker: 'NVDA', rating: 'Sell', reason: 'High multiple contraction amidst elevated expectations.' },
                    { ticker: 'TSM', rating: 'Sell', reason: 'Geopolitical risks or cycle peaks compress margins.' },
                    { ticker: 'MSFT', rating: 'Sell', reason: 'Cloud growth deceleration concerns.' },
                    { ticker: 'AAPL', rating: 'Sell', reason: 'Consumer hardware replacement cycle stalls.' }
                ];
            } else {
                analysis.stockIndications = [
                    { ticker: 'NVDA', rating: 'Buy', reason: 'Uncontested leader in AI training GPUs and network infra.' },
                    { ticker: 'TSM', rating: 'Buy', reason: 'The critical manufacturing bottleneck worldwide.' },
                    { ticker: 'MSFT', rating: 'Buy', reason: 'Aggressive AI monetization across enterprise software.' },
                    { ticker: 'ARM', rating: 'Buy', reason: 'Architecture licensing accelerates in data centers.' },
                    { ticker: 'CLX', rating: 'Sell', reason: 'Capital rotates out of defensive staples into growth.' },
                    { ticker: 'K', rating: 'Sell', reason: 'Underperforms during massive risk-on and tech rallies.' },
                    { ticker: 'GIS', rating: 'Sell', reason: 'Low growth profile is ignored in bull markets.' },
                    { ticker: 'PG', rating: 'Sell', reason: 'Yields are less attractive against tech growth.' }
                ];
            }
            analysis.entities = ['QQQ', 'SMH', 'XLK'];
        } else if (lowerText.match(/fed|rate|inflation|cpi|powell|interest/)) {
            const isDovish = lowerText.match(/cut|easing|cool|drop|fall/);
            analysis.sentiment = isDovish ? 'Bullish' : 'Bearish';
            analysis.impactScore = Math.floor(85 + Math.random() * 10);
            analysis.systemicInterpretation = {
                headline: isDovish ? "Liquidity Infusion: Dovish Pivot Expands Multiples Across Risk Assets" : "Hawkish Reality: Capital Costs Remain Elevated, Crushing Duration Assets",
                points: isDovish ? [
                    "A reduction in the risk-free rate structurally expands valuation multiples, heavily favoring long-duration technology and small caps.",
                    "Real estate and capital-intensive sectors decouple from headwinds as refinancing becomes viable.",
                    "Yield curve adjustments naturally pressure legacy banking net interest margins."
                ] : [
                    "Sustained elevated cost of capital acts as a massive headwind for deeply leveraged small caps and zombie corporations.",
                    "Profitability and cash generation become the absolute premium metrics for capital allocation.",
                    "Traditional banking franchises temporarily benefit from elevated net interest income, provided default rates stay suppressed."
                ]
            };
            analysis.summary = `• Short-term & Long-term Impact: ${isDovish ? 'Short-term relief rally expected as lower discount rates boost equity valuations. Long-term, looser financial conditions support corporate earnings expansion.' : 'Short-term multiple compression expected across equities. Long-term, sustained high rates favor companies with strong balance sheets and pricing power.'}\n• Key Stakeholders: Central banks, commercial banks, and highly leveraged corporations are the primary actors. Yield-seeking investors and mortgage borrowers are directly impacted.`;
            analysis.industryChain = {
                upstream: 'Financial institutions managing cost of capital act as the critical chokepoint for systemic liquidity.',
                midstream: 'Borrowing costs immediately dictate CapEx planning and inventory financing across industrial sectors.',
                downstream: 'Consumer credit rates (mortgages, auto loans) heavily influence aggregate demand and retail spending.'
            };
            if (isDovish) {
                analysis.stockIndications = [
                    { ticker: 'IWM', rating: 'Buy', reason: 'Small caps benefit massively from lower borrowing costs.' },
                    { ticker: 'Z', rating: 'Buy', reason: 'Real estate tech surges as mortgage rates drop.' },
                    { ticker: 'CVNA', rating: 'Buy', reason: 'Auto loan financing becomes cheaper, driving volume.' },
                    { ticker: 'ARKK', rating: 'Buy', reason: 'Long-duration growth assets reprice higher.' },
                    { ticker: 'JPM', rating: 'Sell', reason: 'Net interest income (NIM) compresses with rate cuts.' },
                    { ticker: 'BAC', rating: 'Sell', reason: 'Yield curve changes pressure traditional banking models.' },
                    { ticker: 'XLF', rating: 'Sell', reason: 'Broad financial sector faces margin headwinds.' },
                    { ticker: 'C', rating: 'Sell', reason: 'Legacy banking operations see lower returns.' }
                ];
            } else {
                analysis.stockIndications = [
                    { ticker: 'JPM', rating: 'Buy', reason: 'Net interest income remains elevated in higher-for-longer.' },
                    { ticker: 'BAC', rating: 'Buy', reason: 'Strong deposit franchise benefits from higher rates.' },
                    { ticker: 'BRK.B', rating: 'Buy', reason: 'Massive cash pile earns high risk-free interest.' },
                    { ticker: 'V', rating: 'Buy', reason: 'Inflation tailwind on nominal transaction volumes.' },
                    { ticker: 'IWM', rating: 'Sell', reason: 'Small caps suffer under sustained high debt costs.' },
                    { ticker: 'Z', rating: 'Sell', reason: 'Housing market velocity stalls on high mortgages.' },
                    { ticker: 'CVNA', rating: 'Sell', reason: 'Unaffordable financing crushes auto volumes.' },
                    { ticker: 'ARKK', rating: 'Sell', reason: 'Long-duration cash flows heavily discounted.' }
                ];
            }
            analysis.entities = ['TLT', 'KRE', 'SPX'];
        }

        // Simulate AI thinking time
        await new Promise(r => setTimeout(r, 1500));

        // Note: The assertion "as any" is bypassed by implicitly ensuring `analysis` matches the schema on the frontend.
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Error analyzing news:', error);
        return NextResponse.json({ error: 'Failed to analyze news' }, { status: 500 });
    }
}

