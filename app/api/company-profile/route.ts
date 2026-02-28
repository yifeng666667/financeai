import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker') || 'AAPL';

    // In a real app, this would hit a financial data API (e.g. Yahoo Finance, FMP, Polygon)
    // Here we provide high-quality mock profiles for the top tech/finance tickers

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles: Record<string, any> = {
        'AAPL': {
            name: "Apple Inc.",
            intro: "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories globally.",
            businessModel: "Hardware sales (iPhone, Mac, iPad) heavily integrated with a high-margin Services ecosystem (App Store, iCloud, Apple Music).",
            profitability: "Industry-leading gross margins (~45%) driven by premium device pricing and a rapidly growing services segment (~70% gross margin).",
            analystTake: {
                rating: "Outperform",
                targetPrice: "$210.00",
                catalysts: "iPhone upgrade supercycle driven by Apple Intelligence integration; continued Services revenue expansion.",
                risks: "Slowing consumer spending in key markets like China; regulatory scrutiny over App Store fees."
            },
            valuation: {
                pe: "28.5x",
                pb: "42.1x",
                peg: "1.8x",
                pePercentile: 65,
                pbPercentile: 82,
                dcfValue: "$195.50",
                status: "Fair Valued",
                wacc: "8.2%"
            },
            fundamentals: {
                grossMargin: "45.2%",
                operatingMargin: "30.1%",
                netMargin: "25.3%",
                roe: "145.8%",
                roa: "28.4%",
                revenueGrowth: "2.1%",
                epsGrowth: "5.4%",
                currentRatio: "1.05",
                debtToEquity: "1.45"
            },
            comparables: [] // to be populated
        },
        'MSFT': {
            name: "Microsoft Corporation",
            intro: "Microsoft develops and supports software, services, devices, and solutions worldwide, primarily known for Windows and Office.",
            businessModel: "Recurring subscription revenue via Microsoft 365, enterprise cloud computing (Azure), and consumer hardware/gaming (Xbox).",
            profitability: "Exceptional operating margins (~44%) fueled by the high operational leverage of its commercial cloud segments.",
            analystTake: {
                rating: "Strong Buy",
                targetPrice: "$450.00",
                catalysts: "Aggressive monetization of generative AI tools (Copilot); sustained market share gains in public cloud infrastructure.",
                risks: "Macroeconomic impacts on enterprise IT budgets; regulatory pushback on major acquisitions."
            },
            valuation: {
                pe: "35.2x",
                pb: "12.8x",
                peg: "2.1x",
                pePercentile: 88,
                pbPercentile: 75,
                dcfValue: "$480.20",
                status: "Undervalued",
                wacc: "7.8%"
            },
            fundamentals: {
                grossMargin: "69.8%",
                operatingMargin: "44.6%",
                netMargin: "36.2%",
                roe: "38.5%",
                roa: "18.2%",
                revenueGrowth: "15.2%",
                epsGrowth: "20.1%",
                currentRatio: "1.22",
                debtToEquity: "0.28"
            },
            comparables: []
        },
        'NVDA': {
            name: "NVIDIA Corporation",
            intro: "NVIDIA accelerates computing globally, specializing in graphics processing units (GPUs) and AI computing infrastructure.",
            businessModel: "Selling high-performance hardware and bundled software stacks (CUDA) primarily to data centers, gamers, and automotive markets.",
            profitability: "Record-breaking gross margins (+70%) due to unprecedented global demand and pricing power for its Hopper architecture AI chips.",
            analystTake: {
                rating: "Strong Buy",
                targetPrice: "$1,050.00",
                catalysts: "Insatiable demand for generative AI training and inference hardware; hyperscaler capital expenditure cycles.",
                risks: "Potential supply chain constraints at TSMC; geopolitical export restrictions targeting advanced semiconductors."
            },
            valuation: {
                pe: "72.4x",
                pb: "38.5x",
                peg: "0.8x",
                pePercentile: 45,
                pbPercentile: 95,
                dcfValue: "$980.00",
                status: "Overvalued",
                wacc: "9.5%"
            },
            fundamentals: {
                grossMargin: "73.8%",
                operatingMargin: "54.1%",
                netMargin: "48.8%",
                roe: "65.4%",
                roa: "38.2%",
                revenueGrowth: "125.8%",
                epsGrowth: "400.2%",
                currentRatio: "3.55",
                debtToEquity: "0.22"
            },
            comparables: []
        },
        'TSLA': {
            name: "Tesla, Inc.",
            intro: "Tesla designs, develops, manufactures, and sells fully electric vehicles, and energy generation and storage systems.",
            businessModel: "Direct-to-consumer EV sales augmented by high-margin software (FSD) and a rapidly growing energy storage business.",
            profitability: "Industry-leading automotive gross margins that have recently compressed due to aggressive price cuts to defend market share.",
            analystTake: {
                rating: "Hold",
                targetPrice: "$220.00",
                catalysts: "Launch of next-gen mass-market vehicle architecture; acceleration in autonomous driving (FSD v12) adoption rates.",
                risks: "Slowing global EV adoption; intense competition from legacy automakers and heavily subsidized Chinese EV brands."
            },
            valuation: {
                pe: "45.1x",
                pb: "9.2x",
                peg: "3.5x",
                pePercentile: 25,
                pbPercentile: 40,
                dcfValue: "$180.50",
                status: "Overvalued",
                wacc: "11.2%"
            },
            fundamentals: {
                grossMargin: "17.6%",
                operatingMargin: "8.2%",
                netMargin: "15.5%",
                roe: "28.1%",
                roa: "13.4%",
                revenueGrowth: "18.8%",
                epsGrowth: "115.4%",
                currentRatio: "1.52",
                debtToEquity: "0.06"
            },
            comparables: []
        },
        'JPM': {
            name: "JPMorgan Chase & Co.",
            intro: "JPMorgan Chase is a leading global financial services firm providing investment banking, commercial banking, and asset management.",
            businessModel: "Diversified revenue streams spanning consumer lending, robust institutional trading, and massive wealth management fees.",
            profitability: "Consistently generating high Return on Tangible Common Equity (ROTCE ~20%) through scale efficiencies and strategic acquisitions.",
            analystTake: {
                rating: "Buy",
                targetPrice: "$205.00",
                catalysts: "Higher-for-longer interest rate environment supporting Net Interest Income (NII); rebound in investment banking deal flow.",
                risks: "Potential economic recession leading to higher loan defaults; increased capital requirements from US regulators (Basel III endgame)."
            },
            valuation: {
                pe: "11.5x",
                pb: "1.8x",
                peg: "1.2x",
                pePercentile: 85,
                pbPercentile: 92,
                dcfValue: "$215.00",
                status: "Undervalued",
                wacc: "8.5%"
            },
            fundamentals: {
                grossMargin: "N/A",
                operatingMargin: "35.8%",
                netMargin: "28.5%",
                roe: "16.2%",
                roa: "1.3%",
                revenueGrowth: "14.5%",
                epsGrowth: "22.8%",
                currentRatio: "N/A",
                debtToEquity: "1.12"
            },
            comparables: []
        }
    };

    // Generic fallback for any other ticker
    const fallbackProfile = {
        name: ticker,
        intro: `${ticker} operates as a publicly traded company engaged in its respective industry, providing goods or services to a global client base.`,
        businessModel: "Generates revenue through the sale of core products and associated services, focusing on expanding market share and operational scale.",
        profitability: "Maintains stable gross margins characteristic of its sector, balancing growth investments with shareholder return initiatives.",
        analystTake: {
            rating: "Neutral",
            targetPrice: "N/A",
            catalysts: "Execution of strategic roadmap; potential macroeconomic tailwinds within its operating sector.",
            risks: "Competitive pressures from industry peers; potential shifts in consumer demand or regulatory environment."
        },
        valuation: {
            pe: "15.0x",
            pb: "2.5x",
            peg: "1.5x",
            pePercentile: 50,
            pbPercentile: 50,
            dcfValue: "N/A",
            status: "Fair Valued",
            wacc: "10.0%"
        },
        fundamentals: {
            grossMargin: "30.0%",
            operatingMargin: "15.0%",
            netMargin: "10.0%",
            roe: "15.0%",
            roa: "8.0%",
            revenueGrowth: "8.0%",
            epsGrowth: "10.0%",
            currentRatio: "1.50",
            debtToEquity: "0.50"
        },
        comparables: []
    };

    const data = profiles[ticker] || fallbackProfile;

    // Fetch dynamic Yahoo Finance data
    try {
        const [recs, qs] = await Promise.all([
            yahooFinance.recommendationsBySymbol(ticker).catch(() => null),
            yahooFinance.quoteSummary(ticker, { modules: ['assetProfile', 'price', 'summaryDetail'] }).catch(() => null)
        ]);

        if (qs?.assetProfile) {
            data.sector = qs.assetProfile.sector || 'N/A';
            data.industry = qs.assetProfile.industry || 'N/A';
        }
        if (qs?.summaryDetail) {
            data.marketCap = qs.summaryDetail.marketCap;
        }

        if (recs && recs.recommendedSymbols && recs.recommendedSymbols.length > 0) {
            data.comparables = recs.recommendedSymbols.slice(0, 5).map(s => ({
                ticker: s.symbol,
                name: s.symbol // Yahoo Finance only gives symbol, not name
            }));
        } else {
            // Static backup if Yahoo Finance fails
            data.comparables = [
                { ticker: 'SPY', name: 'S&P 500 ETF' },
                { ticker: 'QQQ', name: 'Nasdaq 100 ETF' }
            ];
        }
    } catch (e) {
        console.error("Error fetching dynamic Yahoo Finance profile data", e);
    }

    return NextResponse.json(data);
}
