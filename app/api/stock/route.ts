import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let ticker = searchParams.get('ticker') || 'SPY'; // Default to S&P 500 ETF
    const period1 = searchParams.get('period1') || '2023-01-01'; // Default fetch a year back

    // Some basic mapping for crypto vs stock
    ticker = ticker.toUpperCase();

    try {
        const queryOptions = {
            period1: period1,
            period2: new Date().toISOString().split('T')[0],
            interval: '1d' as const
        };
        const result = await yahooFinance.chart(ticker, queryOptions);

        // Format specifically for TradingView lightweight-charts:
        // { time: 'YYYY-MM-DD', open, high, low, close } 
        // Volume will be a separate series
        const formattedData = result.quotes.map(day => ({
            time: day.date.toISOString().split('T')[0],
            open: day.open,
            high: day.high,
            low: day.low,
            close: day.close,
            volume: day.volume
        })).filter(day => day.open !== null && day.close !== null); // prevent null days

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let newsEvents: any[] = [];
        try {
            const newsResult = await yahooFinance.search(ticker, { newsCount: 20 });
            if (newsResult.news) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newsEvents = newsResult.news.map((n: any) => {
                    const dateObj = new Date(n.providerPublishTime);
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const isBull = Math.random() > 0.5; // Stub for AI sentiment
                    const types = ['Earnings', 'Product', 'Macro', 'Policy', 'Management', 'Competition'];
                    const randomType = types[Math.floor(Math.random() * types.length)];

                    return {
                        date: dateStr,
                        headline: n.title,
                        type: randomType,
                        sentiment: isBull ? 'bullish' : 'bearish',
                        t1Return: isBull ? `+${(Math.random() * 2 + 0.5).toFixed(1)}%` : `-${(Math.random() * 2 + 0.5).toFixed(1)}%`
                    };
                });
            }
        } catch (e) {
            console.error("Error fetching news events:", e);
        }

        return NextResponse.json({ data: formattedData, events: newsEvents });
    } catch (error) {
        console.error(`Error fetching stock data for ${ticker}:`, error);
        return NextResponse.json({ error: 'Failed to fetch tracking data', message: String(error) }, { status: 500 });
    }
}
