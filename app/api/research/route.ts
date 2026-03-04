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

        // Metrics for Thesis
        const pe = summary?.summaryDetail?.forwardPE || summary?.summaryDetail?.trailingPE || 20;
        const currentPrice = (quote as any)?.regularMarketPrice || 100;
        const revenueGrowth = summary?.financialData?.revenueGrowth || 0.1;
        const netMargin = summary?.financialData?.profitMargins || 0.15;
        const debtToEquity = summary?.financialData?.debtToEquity || 0;

        const pegValue = summary?.defaultKeyStatistics?.pegRatio || 0;
        const valuationStats = {
            pe: Number(pe).toFixed(pe === 20 ? 0 : 2),
            peTTM: Number(summary?.summaryDetail?.trailingPE || pe).toFixed(2),
            peForward: Number(summary?.summaryDetail?.forwardPE || pe).toFixed(2),
            pb: Number(summary?.defaultKeyStatistics?.priceToBook || 0).toFixed(2),
            peg: pegValue === 0 ? (Number(pe) / (revenueGrowth * 100)).toFixed(2) : Number(pegValue).toFixed(2),
            pePercentile: 72, // Mocked percentile for demonstration
            peHistoricalLow: (Number(pe) * 0.65).toFixed(1),
            peHistoricalHigh: (Number(pe) * 1.45).toFixed(1),
            peHistoricalMean: (Number(pe) * 0.95).toFixed(1),
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

            // Fix: Use totalRevenue - costOfRevenue if grossProfit is missing
            let gpTemp = stmt.grossProfit;
            if (gpTemp === undefined || gpTemp === null || gpTemp === 0) {
                if (stmt.totalRevenue && stmt.costOfRevenue) {
                    gpTemp = stmt.totalRevenue - stmt.costOfRevenue;
                } else {
                    // If both are missing, use a fallback based on summary data
                    const baseGrossRatio = Number((summary as any)?.financialData?.grossMargins || 0.4);
                    gpTemp = revTemp * baseGrossRatio;
                }
            }

            const niTemp = stmt.netIncome || 0;

            const grossM = (gpTemp / revTemp) * 100;
            const netM = (niTemp / revTemp) * 100;

            // Find matching balance sheet for ROE/ROA
            const bStmt = sortedBalance.find(b => new Date(b.endDate).getFullYear().toString() === yearStr);
            let roeCalc = 0;

            // ROE = Net Income / Shareholder Equity
            // Use common variations of equity field names
            const equity = bStmt?.totalStockholderEquity || bStmt?.stockholdersEquity || bStmt?.totalEquity;
            const totalAssets = bStmt?.totalAssets;

            if (equity && equity !== 0) {
                roeCalc = (niTemp / equity) * 100;
            } else if (totalAssets && totalAssets !== 0) {
                // ROA proxy if equity is missing: Net Income / Total Assets * 2 (typical levered ROE proxy)
                roeCalc = (niTemp / totalAssets) * 200;
            } else if (netM > 0) {
                // Final Fallback: use the current ROE from summary
                const baseRoe = Number((summary as any)?.financialData?.returnOnEquity || 0.2);
                roeCalc = baseRoe * 100 * (0.9 + (Math.random() * 0.2));
            }

            return {
                year: yearStr,
                grossMargin: Number(grossM.toFixed(1)),
                netMargin: Number(netM.toFixed(1)),
                roe: Number(roeCalc.toFixed(1))
            };
        });

        // Fallback for trends if empty or mostly zeros (some API calls return empty arrays but don't error)
        if (historicalTrends.length === 0 || historicalTrends.every(t => t.grossMargin === 0 && t.roe === 0)) {
            const baseGross = Number((summary as any)?.financialData?.grossMargins || 0.4) * 100;
            const baseNet = Number((summary as any)?.financialData?.profitMargins || 0.15) * 100;
            const baseRoe = Number((summary as any)?.financialData?.returnOnEquity || 0.2) * 100;

            // Generate a small trend based on current metrics if historical is missing
            const years = [currentYear - 3, currentYear - 2, currentYear - 1];
            historicalTrends.length = 0; // Clear existing if it was all zeros
            years.forEach((y, i) => {
                const varFactor = 0.9 + (Math.random() * 0.2); // Random variance +/- 10%
                historicalTrends.push({
                    year: y.toString(),
                    grossMargin: Number((baseGross * varFactor).toFixed(1)),
                    netMargin: Number((baseNet * varFactor).toFixed(1)),
                    roe: Number((baseRoe * varFactor).toFixed(1))
                });
            });
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
        const interestCoverage = interestExpense > 0 ? operatingIncome / interestExpense : (isB2B ? 15.4 : 8.2);

        const costOfRev = latestIncome.costOfRevenue || 0;
        const inventory = latestBalance.inventory || 0;
        const inventoryTurnover = inventory > 0 ? costOfRev / inventory : (isB2B ? 12.4 : 5.5);

        const totalRev = latestIncome.totalRevenue || 0;
        const accountsRec = latestBalance.netReceivables || latestBalance.accountsReceivable || 0;
        const receivablesTurnover = (totalRev > 0 && accountsRec > 0) ? totalRev / accountsRec : (isB2B ? 6.5 : 12.0);
        const dso = 365 / receivablesTurnover;

        const fcfGrowthValue = ((summary as any)?.financialData?.freeCashflow || 0) > 0 ?
            ((Number((summary as any)?.financialData?.revenueGrowth || 0.05) + 0.02) * 100).toFixed(1) + '%' :
            'N/A';

        // --- 4. Historical Prices for Valuation Bands ---
        // Fetch 5 years of extremely smoothed monthly/quarterly data to keep payload reasonable
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        let historicalPrices: Array<{ date: string; price: number }> = [];
        try {
            const histData = await yahooFinance.historical(ticker, {
                period1: startDate,
                interval: '1mo'
            });
            historicalPrices = histData.map(d => ({
                date: d.date.toISOString().substring(0, 7), // YYYY-MM
                price: Number((d.adjClose || d.close || 0).toFixed(2))
            }));
        } catch (error) {
            console.warn(`Could not fetch historical pricing for ${ticker}`, error);
        }

        const mockReport = {
            ticker: ticker,
            companyName: companyShortName,
            industry: industryName,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            rating: typeof rating === 'string' ? rating.split(' - ')[1] || rating : 'Outperform',
            targetPrice: '$' + (valuationStats.dcfBase * 1.12).toFixed(2),
            currentPrice: '$' + currentPrice.toFixed(2),
            valuationStats,
            historicalPrices,
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

