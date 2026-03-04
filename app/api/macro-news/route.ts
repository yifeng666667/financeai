import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
});

// Mapping of regions to Google News RSS URLs
const REGION_FEEDS: Record<string, string> = {
    us: 'https://news.google.com/rss/search?q=US+economy+markets&hl=en-US&gl=US&ceid=US:en',
    china: 'https://news.google.com/rss/search?q=China+economy+markets&hl=en-US&gl=US&ceid=US:en',
    me: 'https://news.google.com/rss/search?q=Middle+East+economy+energy+markets&hl=en-US&gl=US&ceid=US:en',
    asia: 'https://news.google.com/rss/search?q=Asia+Pacific+economy+semiconductors+markets&hl=en-US&gl=US&ceid=US:en',
    sa: 'https://news.google.com/rss/search?q=South+America+economy+commodities+markets&hl=en-US&gl=US&ceid=US:en',
};

function getSentiment(title: string): 'bullish' | 'bearish' | 'neutral' {
    const bullishWords = ['surge', 'gain', 'growth', 'rise', 'positive', 'expansion', 'jump', 'boost', 'rally', 'recovery'];
    const bearishWords = ['drop', 'fall', 'decline', 'negative', 'contraction', 'plunge', 'slump', 'crisis', 'risk', 'slowdown', 'worry'];

    const lowerTitle = title.toLowerCase();

    let score = 0;
    bullishWords.forEach(word => { if (lowerTitle.includes(word)) score++; });
    bearishWords.forEach(word => { if (lowerTitle.includes(word)) score--; });

    if (score > 0) return 'bullish';
    if (score < 0) return 'bearish';
    return 'neutral';
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'us';

    const feedUrl = REGION_FEEDS[region] || REGION_FEEDS.us;

    try {
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items.slice(0, 10).map((item, index) => {
            const title = item.title || 'No Title';
            return {
                id: `${region}-${index}`,
                title: title,
                source: item.creator || item.author || feed.title?.replace(' - Google News', '') || 'Google News',
                time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ago' : 'Recently',
                impactScore: 5 + Math.floor(Math.random() * 5), // Mock impact score for now
                sentiment: getSentiment(title),
                tags: item.categories || ['Market', 'Macro'],
                url: item.link || `https://news.google.com/search?q=${encodeURIComponent(title)}`
            };
        });

        return NextResponse.json({ news: items });
    } catch (error) {
        console.error('Error fetching dynamic macro news:', error);
        return NextResponse.json({ error: 'Failed to fetch macro news' }, { status: 500 });
    }
}
