import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
});

export async function GET() {
    try {
        const feedUrls = [
            'https://finance.yahoo.com/news/rssindex',
            'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', // CNBC Finance
            'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', // WSJ Business
        ];

        const allItems = [];
        for (const url of feedUrls) {
            const feed = await parser.parseURL(url);
            const items = feed.items.map(item => ({
                id: item.guid || item.link,
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet,
                source: feed.title || 'Finance News',
            }));
            allItems.push(...items);
        }

        allItems.sort((a, b) => {
            const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
            const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json({ items: allItems.slice(0, 50) });
    } catch (error) {
        console.error('Error fetching RSS:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
