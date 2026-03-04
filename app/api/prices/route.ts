import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get('tickers');

    if (!tickersParam) {
        return NextResponse.json({ error: 'Tickers parameter is required' }, { status: 400 });
    }

    const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase());

    try {
        // Fetch current quotes for all requested tickers
        const results = await Promise.all(
            tickers.map(async (ticker) => {
                try {
                    const quote = await yahooFinance.quote(ticker);
                    return {
                        ticker,
                        price: quote.regularMarketPrice,
                        change: quote.regularMarketChangePercent,
                        name: quote.shortName || quote.longName || ticker
                    };
                } catch (e) {
                    console.error(`Error fetching quote for ${ticker}:`, e);
                    return { ticker, error: 'Failed to fetch quote' };
                }
            })
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error('Batch price fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
    }
}
