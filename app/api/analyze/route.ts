import { NextResponse } from 'next/server';

// Mock AI analysis for development.
// Recommend replacing with actual Google Gen AI SDK integration.
export async function POST(req: Request) {
    try {
        const { title, content } = await req.json();

        const lowerText = (title + ' ' + content).toLowerCase();
        let sentiment = 'Neutral';
        let impactScore = 50;
        let affectedSectors: string[] = [];

        if (lowerText.match(/surge|jump|buy|growth|record|profit|up|bull|soar|high|optimism/)) {
            sentiment = 'Bullish';
            impactScore = Math.floor(70 + Math.random() * 25);
            affectedSectors = ['科技', '消费'];
        } else if (lowerText.match(/drop|fall|sell|loss|panic|down|bear|crash|decline|pessimism/)) {
            sentiment = 'Bearish';
            impactScore = Math.floor(10 + Math.random() * 30);
            affectedSectors = ['金融', '房地产'];
        } else {
            sentiment = 'Neutral';
            impactScore = Math.floor(40 + Math.random() * 20);
            affectedSectors = ['公用事业', '黄金'];
        }

        const mockAnalysis = {
            sentiment,
            impactScore, // 0-100 scale
            summary: `• 核心要点: 本文主要讨论了「${title}」的宏观影响。\n• 穿透结论: 预计该事件将对${affectedSectors.join('、')}板块产生${sentiment === 'Neutral' ? '较为温和' : '明显的'}的短期情绪扰动，需关注后续催化剂。`,
            affectedSectors,
            entities: ['SPX', 'TSLA', 'AAPL', 'NVDA', 'BABA', 'HSI'].sort(() => Math.random() - 0.5).slice(0, 3)
        };

        // Simulate AI thinking time
        await new Promise(r => setTimeout(r, 1200));

        return NextResponse.json(mockAnalysis);
    } catch (error) {
        console.error('Error analyzing news:', error);
        return NextResponse.json({ error: 'Failed to analyze news' }, { status: 500 });
    }
}
