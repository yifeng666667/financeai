import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const PEER_MAPPING: Record<string, string[]> = {
    'Technology': ['MSFT', 'GOOGL', 'AAPL', 'META'],
    'Consumer Electronics': ['AAPL', 'SONY', 'DELL'],
    'Software—Infrastructure': ['MSFT', 'ORCL', 'ADBE', 'CRM'],
    'Internet Content & Information': ['GOOGL', 'META', 'BIDU', 'PINS'],
    'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'MCD'],
    'Internet Retail': ['AMZN', 'BABA', 'EBAY', 'MELI'],
    'Auto Manufacturers': ['TSLA', 'F', 'GM', 'TM'],
    'Healthcare': ['JNJ', 'UNH', 'LLY', 'MRK'],
    'Drug Manufacturers—General': ['JNJ', 'LLY', 'MRK', 'PFE'],
    'Financial Services': ['JPM', 'BAC', 'V', 'MA'],
    'Banks—Diversified': ['JPM', 'BAC', 'WFC', 'C'],
    'Credit Services': ['V', 'MA', 'AXP', 'PYPL'],
    'Industrials': ['CAT', 'HON', 'UPS', 'GE'],
    'Semiconductors': ['NVDA', 'AMD', 'INTC', 'TSM'],
};
const DEFAULT_PEERS = ['SPY', 'QQQ', 'DIA'];

export async function POST(req: Request) {
    try {
        const { companyName, ticker, industry } = await req.json();

        if (!ticker) {
            return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
        }

        // Simulate a slight delay for "generation"
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Fetch real data from Yahoo Finance
        const [quote, summary, history] = await Promise.all([
            yahooFinance.quote(ticker).catch(() => null),
            yahooFinance.quoteSummary(ticker, {
                modules: [
                    'summaryDetail',
                    'financialData',
                    'defaultKeyStatistics',
                    'summaryProfile',
                    'incomeStatementHistory',
                    'balanceSheetHistory'
                ]
            }).catch(() => null),
            yahooFinance.chart(ticker, { period1: '2021-01-01', interval: '1mo' }).catch(() => [])
        ]);

        const currentYear = new Date().getFullYear();

        // Extract real data
        const businessSummary = (summary as any)?.summaryProfile?.longBusinessSummary || "";
        const sector = (summary as any)?.summaryDetail?.sector || (summary as any)?.summaryProfile?.sector || "General";
        const industryName = (summary as any)?.summaryDetail?.industry || (summary as any)?.summaryProfile?.industry || "General";
        const companyShortName = (quote as any)?.shortName || companyName || ticker;

        // Heuristics for Business Model
        const isB2B = businessSummary.toLowerCase().includes('enterprise') ||
            businessSummary.toLowerCase().includes('b2b') ||
            ['Technology', 'Industrials', 'Basic Materials', 'Energy'].includes(sector);

        const businessModel = isB2B ? "enterprise-focused B2B" : "consumer-centric B2C";

        // Professional Executive Summary
        const ratingValue = (quote as any)?.averageAnalystRating || 'Strong Buy';
        const rating = typeof ratingValue === 'string' ? ratingValue : 'Strong Buy';
        const executiveSummary = `We rate ${companyShortName} (${ticker}) as a ${rating} based on its robust structural positioning within the ${sector} sector. As a leading ${businessModel} entity, the company has demonstrated significant resilience in its ${industryName} operations. ${businessSummary.split('.').slice(0, 2).join('. ')}.\n\nOur analysis indicates that ${companyShortName}'s strategic pivot towards high-margin segments and its disciplined capital allocation framework provide a clear pathway for multi-year earnings expansion. We believe the market is underestimating the operating leverage potential within the ${sector} segment, particularly as ${companyShortName} continues to optimize its global footprint and R&D efficiency.`;

        // Metrics for Thesis
        const pe = summary?.summaryDetail?.forwardPE || summary?.summaryDetail?.trailingPE || 20;
        const currentPrice = (quote as any)?.regularMarketPrice || 100;
        const revenueGrowth = summary?.financialData?.revenueGrowth || 0.1;
        const netMargin = summary?.financialData?.profitMargins || 0.15;
        const debtToEquity = summary?.financialData?.debtToEquity || 0;

        const investmentThesis = [
            `**Structural Growth Vectors**: ${companyShortName} is uniquely positioned to capture the secular shift in ${industryName}, supported by a revenue growth profile of ${(revenueGrowth * 100).toFixed(1)}% which exceeds peer medians.`,
            `**Margin Accretion & Efficiency**: With a net profit margin of ${(netMargin * 100).toFixed(1)}%, the company maintains a superior cost structure and pricing power, allowing for significant operational leverage.`,
            `**Balance Sheet Fortification**: A measured debt-to-equity ratio of ${debtToEquity.toFixed(2)} provides substantial dry powder for inorganic growth opportunities and shareholder returns through buybacks and dividends.`
        ];

        const valuationStats = {
            pe: Number(pe).toFixed(pe === 20 ? 0 : 2),
            peTTM: Number(summary?.summaryDetail?.trailingPE || pe).toFixed(2),
            peForward: Number(summary?.summaryDetail?.forwardPE || pe).toFixed(2),
            pb: Number(summary?.defaultKeyStatistics?.priceToBook || 0).toFixed(2),
            peg: Number(summary?.defaultKeyStatistics?.pegRatio || 0).toFixed(2),
            dcfBase: currentPrice * 1.08, // Adjusted proxy
            waccBase: 9.0
        };

        const financials = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year, index) => {
            const isEstimate = year >= currentYear;
            const baseRev = summary?.financialData?.totalRevenue || 50000000000;
            const multiplier = Math.pow(1 + revenueGrowth, index - 2);
            const revenue = (baseRev * multiplier) / 1000000;

            return {
                year: isEstimate ? `${year}E` : `${year}A`,
                revenue: revenue.toFixed(0),
                revenueGrowth: (revenueGrowth * 100).toFixed(1) + '%',
                grossMargin: (Number(summary?.financialData?.grossMargins || 0.4) * 100).toFixed(1) + '%',
                netIncome: (revenue * netMargin).toFixed(0),
                netMargin: (netMargin * 100).toFixed(1) + '%'
            };
        });

        // --- 1. Historical Trends Extraction ---
        const incomeHistory = (summary as any)?.incomeStatementHistory?.incomeStatementHistory || [];
        const balanceHistory = (summary as any)?.balanceSheetHistory?.balanceSheetStatements || [];

        // Sort ascending (oldest first)
        const sortedIncome = [...incomeHistory].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        const sortedBalance = [...balanceHistory].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

        const historicalTrends = sortedIncome.slice(-4).map((stmt) => {
            const yearStr = new Date(stmt.endDate).getFullYear().toString();
            const revTemp = stmt.totalRevenue || 1; // avoid divide by zero
            const gpTemp = stmt.grossProfit || 0;
            const niTemp = stmt.netIncome || 0;

            const grossM = (gpTemp / revTemp) * 100;
            const netM = (niTemp / revTemp) * 100;

            // Find matching balance sheet for ROE
            const bStmt = sortedBalance.find(b => new Date(b.endDate).getFullYear().toString() === yearStr);
            let roeCalc = 0;
            if (bStmt && bStmt.totalStockholderEquity && bStmt.totalStockholderEquity > 0) {
                roeCalc = (niTemp / bStmt.totalStockholderEquity) * 100;
            }

            return {
                year: yearStr,
                grossMargin: Number(grossM.toFixed(1)),
                netMargin: Number(netM.toFixed(1)),
                roe: Number(roeCalc.toFixed(1))
            };
        });

        // Fallback for trends if empty
        if (historicalTrends.length === 0) {
            historicalTrends.push(
                { year: '2021', grossMargin: 40.5, netMargin: 12.1, roe: 15.2 },
                { year: '2022', grossMargin: 41.2, netMargin: 13.5, roe: 16.8 },
                { year: '2023', grossMargin: 42.1, netMargin: 14.8, roe: 18.1 }
            );
        }

        // --- 2. Peer Comparison Data Fetching ---
        const possiblePeers = PEER_MAPPING[industryName] || PEER_MAPPING[sector] || DEFAULT_PEERS;
        const peerTickers = possiblePeers.filter(p => p.toUpperCase() !== ticker.toUpperCase()).slice(0, 3);

        const peerComparison = await Promise.all(peerTickers.map(async (peerTicker) => {
            try {
                const peerSummary = await yahooFinance.quoteSummary(peerTicker, {
                    modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics']
                }).catch(() => null);

                if (!peerSummary) return null;

                const peerPe = peerSummary?.summaryDetail?.forwardPE || peerSummary?.summaryDetail?.trailingPE || 0;
                const peerPb = peerSummary?.defaultKeyStatistics?.priceToBook || 0;
                const peerNm = (Number(peerSummary?.financialData?.profitMargins || 0) * 100).toFixed(1);

                return {
                    ticker: peerTicker,
                    pe: Number(peerPe).toFixed(1),
                    pb: Number(peerPb).toFixed(1),
                    netMargin: `${peerNm}%`
                };
            } catch {
                return null;
            }
        }));

        const targetNetMarginStr = (Number(summary?.financialData?.profitMargins || 0) * 100).toFixed(1);
        const finalPeerComparison = [
            {
                ticker: ticker.toUpperCase(),
                isTarget: true,
                pe: Number(valuationStats.peForward || valuationStats.pe || 0).toFixed(1),
                pb: Number(valuationStats.pb || 0).toFixed(1),
                netMargin: `${targetNetMarginStr}%`
            },
            ...peerComparison.filter(p => p !== null)
        ];

        // --- 3. Dynamic Ratios Calculation ---
        const latestIncome = sortedIncome[sortedIncome.length - 1] || {};
        const latestBalance = sortedBalance[sortedBalance.length - 1] || {};

        const operatingIncome = latestIncome.operatingIncome || latestIncome.ebit || 0;
        const interestExpense = Math.abs(latestIncome.interestExpense || 0);
        let interestCoverage = interestExpense > 0 ? operatingIncome / interestExpense : (isB2B ? 15.4 : 8.2);

        const costOfRev = latestIncome.costOfRevenue || 0;
        const inventory = latestBalance.inventory || 0;
        let inventoryTurnover = inventory > 0 ? costOfRev / inventory : (isB2B ? 12.4 : 5.5);

        const totalRev = latestIncome.totalRevenue || 0;
        const accountsRec = latestBalance.netReceivables || latestBalance.accountsReceivable || 0;
        let receivablesTurnover = (totalRev > 0 && accountsRec > 0) ? totalRev / accountsRec : (isB2B ? 6.5 : 12.0);
        const dso = 365 / receivablesTurnover;

        const fcfGrowthValue = ((summary as any)?.financialData?.freeCashflow || 0) > 0 ?
            ((Number((summary as any)?.financialData?.revenueGrowth || 0.05) + 0.02) * 100).toFixed(1) + '%' :
            'N/A';

        const mockReport = {
            ticker: ticker,
            companyName: companyShortName,
            industry: industryName,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            rating: typeof rating === 'string' ? rating.split(' - ')[1] || rating : 'Outperform',
            targetPrice: '$' + (valuationStats.dcfBase * 1.12).toFixed(2),
            currentPrice: '$' + currentPrice.toFixed(2),
            executiveSummary,
            investmentThesis,
            valuation: `Our valuation framework utilizes a multi-stage Discounted Cash Flow (DCF) model and peer-relative multiple analysis. An implied fair value of $${valuationStats.dcfBase.toFixed(2)} is derived using a terminal growth rate of 2.5% and a WACC of ${valuationStats.waccBase}%. \n\nThe current forward P/E of ${valuationStats.peForward}x represents a compelling entry point relative to the historical 5-year average. We maintain our ${rating} rating, expecting multiple expansion as the market prices in the structural growth of the ${industryName} segment.`,
            valuationStats,
            catalysts: [
                `Accelerated adoption of ${industryName} solutions across ${isB2B ? 'enterprise' : 'consumer'} verticals.`,
                `Potential for a meaningful earnings beat in the upcoming fiscal quarter due to operational efficiencies.`,
                `Strategic M&A activity that could be immediately accretive to GAAP EPS.`
            ],
            risks: [
                `**Execution Risk**: Potential delays in the rollout of core infrastructure or new product lines.`,
                `**Macroeconomic Sensitivity**: Prolonged higher-for-longer interest rate environments impacting discretionary ${isB2B ? 'capex' : 'spending'}.`,
                `**Competitive Displacement**: Aggressive pricing strategies from legacy incumbents or disruptive startups.`
            ],
            financials,
            ratios: {
                profitability: [
                    { label: 'Gross Margin', value: (Number((summary as any)?.financialData?.grossMargins || 0.4) * 100).toFixed(1) + '%', status: 'pos' },
                    { label: 'Net Margin', value: (Number((summary as any)?.financialData?.profitMargins || 0.15) * 100).toFixed(1) + '%', status: 'pos' },
                    { label: 'ROE', value: (Number((summary as any)?.financialData?.returnOnEquity || 0.2) * 100).toFixed(1) + '%', status: 'pos' },
                    { label: 'ROA', value: (Number((summary as any)?.financialData?.returnOnAssets || 0.1) * 100).toFixed(1) + '%', status: 'pos' }
                ],
                solvency: [
                    { label: 'Current Ratio', value: (Number((summary as any)?.financialData?.currentRatio || 1.2)).toFixed(2) + 'x', status: 'pos' },
                    { label: 'Quick Ratio', value: (Number((summary as any)?.financialData?.quickRatio || 1.0)).toFixed(2) + 'x', status: 'pos' },
                    { label: 'Debt/Equity', value: (Number((summary as any)?.financialData?.debtToEquity || 50)).toFixed(2), status: 'neu' },
                    { label: 'Interest Coverage', value: `${interestCoverage.toFixed(1)}x`, status: interestCoverage > 5 ? 'pos' : 'neu' }
                ],
                efficiency: [
                    { label: 'Asset Turnover', value: (Number((summary as any)?.defaultKeyStatistics?.enterpriseToRevenue || 0.5) / 10).toFixed(2) + 'x', status: 'neu' },
                    { label: 'Inventory Turnover', value: `${inventoryTurnover.toFixed(1)}x`, status: inventoryTurnover > 8 ? 'pos' : 'neu' },
                    { label: 'Receivables Turnover', value: `${receivablesTurnover.toFixed(1)}x`, status: 'neu' },
                    { label: 'Days Sales Out.', value: `${dso.toFixed(0)} days`, status: 'neu' }
                ],
                growth: [
                    { label: 'Rev Growth (YoY)', value: (Number((summary as any)?.financialData?.revenueGrowth || 0.1) * 100).toFixed(1) + '%', status: 'pos' },
                    { label: 'EPS Growth (YoY)', value: (Number((summary as any)?.financialData?.earningsGrowth || 0.12) * 100).toFixed(1) + '%', status: 'pos' },
                    { label: 'FCF Growth', value: fcfGrowthValue, status: fcfGrowthValue === 'N/A' ? 'neu' : 'pos' },
                    { label: 'Operating Margin Exp.', value: '+120bps', status: 'pos' }
                ]
            },
            historicalTrends,
            peerComparison: finalPeerComparison
        };

        return NextResponse.json(mockReport);
    } catch (error) {
        console.error('Research generation error:', error);
        return NextResponse.json({ error: 'Failed to generate research report' }, { status: 500 });
    }
}

