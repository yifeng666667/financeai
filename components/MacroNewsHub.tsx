'use client';

import React, { useState } from 'react';
import { Globe, TrendingUp, TrendingDown, ArrowRight, Zap, AlertCircle, Bookmark, Share2 } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    impactScore: number; // 1-10
    sentiment: 'bullish' | 'bearish' | 'neutral';
    tags: string[];
    url: string;
}

interface MarketImpact {
    sector: string;
    effect: 'positive' | 'negative' | 'mixed';
    rationale: string;
    assets: string[];
}

const REGIONS = [
    { id: 'us', name: 'United States', icon: '🇺🇸' },
    { id: 'china', name: 'China', icon: '🇨🇳' },
    { id: 'me', name: 'Middle East', icon: '🌍' },
    { id: 'asia', name: 'Asia Pacific', icon: '🌏' },
    { id: 'sa', name: 'South America', icon: '🌎' },
];

const MACRO_DATA: Record<string, { news: NewsItem[]; impact: MarketImpact[] }> = {
    us: {
        news: [
            { id: 'u1', title: 'Fed Signals "Caution" on Rate Cuts as Services Sector Remains Robust', source: 'Bloomberg', time: '2h ago', impactScore: 9, sentiment: 'neutral', tags: ['Monetary Policy', 'Inflation'], url: 'https://www.bloomberg.com/markets' },
            { id: 'u9', title: 'US Treasury Yields Spike to 4.5% Following Surprisingly Hot Jobs Report', source: 'WSJ', time: '4h ago', impactScore: 9, sentiment: 'bearish', tags: ['Bonds', 'Labor'], url: 'https://www.wsj.com/finance' },
            { id: 'u7', title: 'Tech Giants Announce Unified AI Safety Consortium in Washington', source: 'Reuters', time: '1h ago', impactScore: 8, sentiment: 'bullish', tags: ['AI', 'Tech'], url: 'https://www.reuters.com/technology' },
            { id: 'u2', title: 'New 10% Import Duty Effective Today; Market Impact Limited Initially', source: 'Reuters', time: '5h ago', impactScore: 7, sentiment: 'bearish', tags: ['Trade', 'Tariffs'], url: 'https://www.reuters.com/markets' },
            { id: 'u8', title: 'Retail Sales Flatline as Student Loan Repayments Bite into Spending', source: 'CNBC', time: '12h ago', impactScore: 7, sentiment: 'bearish', tags: ['Retail', 'Consumer'], url: 'https://www.cnbc.com/economy' },
            { id: 'u3', title: 'Consumer Confidence Jumps in Feb Despite Elevated Inflation Expectations', source: 'WSJ', time: '8h ago', impactScore: 6, sentiment: 'bullish', tags: ['Consumers'], url: 'https://www.wsj.com/economy' },
            { id: 'u4', title: 'Housing Starts Rebound Slightly in Midwest, Plunge in Northeast', source: 'MarketWatch', time: '10h ago', impactScore: 5, sentiment: 'neutral', tags: ['Housing', 'Real Estate'], url: 'https://www.marketwatch.com/investing' },
            { id: 'u5', title: 'Manufacturing Activity Expands Modestly After 16 Months of Contraction', source: 'ISM', time: '1d ago', impactScore: 5, sentiment: 'bullish', tags: ['Manufacturing', 'PMI'], url: 'https://www.ismworld.org/' }
        ],
        impact: [
            { sector: 'Financials', effect: 'positive', rationale: 'Higher-for-longer rates support net interest margins.', assets: ['JPM', 'GS', 'XLF'] },
            { sector: 'Tech/Growth', effect: 'negative', rationale: 'Persistent inflation expectations pressure multiples.', assets: ['QQQ', 'NVDA', 'MSFT'] }
        ]
    },
    china: {
        news: [
            { id: 'c3', title: 'Manufacturing PMI Contracts for Third Month; Property Sector Struggles', source: 'Caixin', time: '7h ago', impactScore: 9, sentiment: 'bearish', tags: ['Economy', 'PMI'], url: 'https://www.caixinglobal.com/economy/' },
            { id: 'c1', title: 'Politburo Signals "Moderately Loose" Monetary Policy to Expand Demand', source: 'SCMP', time: '1h ago', impactScore: 8, sentiment: 'bullish', tags: ['Stimulus', 'Liquidity'], url: 'https://www.scmp.com/economy' },
            { id: 'c4', title: 'PBOC Cuts Reserve Requirement Ratio By 50 Bps Ahead of Lunar New Year', source: 'Reuters', time: '2h ago', impactScore: 8, sentiment: 'bullish', tags: ['PBOC', 'RRR'], url: 'https://www.reuters.com/world/china/' },
            { id: 'c2', title: 'China 2026 Growth Target Likely Set at 4.5% - 5.0%', source: 'Xinhua', time: '4h ago', impactScore: 7, sentiment: 'neutral', tags: ['GDP', 'Policy'], url: 'https://english.news.cn/business/' },
            { id: 'c5', title: 'New Energy Vehicle Sales Penetration Surpasses 45% Milestone', source: 'CPCA', time: '12h ago', impactScore: 6, sentiment: 'bullish', tags: ['EV', 'Auto'], url: 'http://www.cpcaauto.com/' },
            { id: 'c6', title: 'Regulatory Body Drafts New Rules for Generative AI Domestic Models', source: 'CCTV', time: '1d ago', impactScore: 6, sentiment: 'neutral', tags: ['AI', 'Regulation'], url: 'https://english.cctv.com/business/' },
            { id: 'c7', title: 'Foreign Direct Investment Posts First Increase in Eight Months', source: 'Bloomberg', time: '1d ago', impactScore: 5, sentiment: 'bullish', tags: ['FDI', 'Capital'], url: 'https://www.bloomberg.com/asia' },
            { id: 'c8', title: 'Local Government Restructuring Debt Initiatives Start in 5 Provinces', source: 'Securities Times', time: '2d ago', impactScore: 5, sentiment: 'neutral', tags: ['LGFV', 'Debt'], url: 'https://www.stcn.com/' }
        ],
        impact: [
            { sector: 'Consumer Discretionary', effect: 'mixed', rationale: 'Stimulus vs. weak confidence dynamic.', assets: ['BABA', 'JD', 'KWEB'] },
            { sector: 'EV / Green Tech', effect: 'positive', rationale: 'Focus on "New Growth Drivers" and tech self-reliance.', assets: ['BYD', 'NIO', 'CATL'] }
        ]
    },
    me: {
        news: [
            { id: 'm1', title: 'Oil Surges as Geopolitical Tensions Escalate in the Gulf', source: 'Al Jazeera', time: '30m ago', impactScore: 10, sentiment: 'bearish', tags: ['Geopolitics', 'Oil'], url: 'https://www.aljazeera.com/economy/' },
            { id: 'm3', title: 'OPEC+ Keeps Production Targets Unchanged Amid Global Demand Uncertainty', source: 'Reuters', time: '4h ago', impactScore: 9, sentiment: 'neutral', tags: ['OPEC', 'Energy'], url: 'https://www.reuters.com/business/energy/' },
            { id: 'm4', title: 'Saudi Arabia PIF Announces $50 Billion AI and Tech Infrastructure Fund', source: 'Bloomberg', time: '2h ago', impactScore: 8, sentiment: 'bullish', tags: ['PIF', 'Tech'], url: 'https://www.bloomberg.com/middleeast' },
            { id: 'm5', title: 'Dubai Real Estate Transactions Hit New All-Time High in Q1', source: 'Gulf News', time: '1d ago', impactScore: 7, sentiment: 'bullish', tags: ['Real Estate', 'Dubai'], url: 'https://gulfnews.com/business' },
            { id: 'm2', title: 'UAE Non-Oil Economy Expands 5.1% Driven by Tech and Logistics', source: 'Khaleej Times', time: '6h ago', impactScore: 6, sentiment: 'bullish', tags: ['Growth', 'Diversification'], url: 'https://www.khaleejtimes.com/business' },
            { id: 'm6', title: 'Qatar Inks 20-Year LNG Supply Deal with European Energy Firms', source: 'Financial Times', time: '1d ago', impactScore: 6, sentiment: 'bullish', tags: ['LNG', 'Exports'], url: 'https://www.ft.com/companies/energy' },
            { id: 'm7', title: 'Regional Tech Startups See Record VC Funding Defying Global Slowdown', source: 'Wamda', time: '2d ago', impactScore: 5, sentiment: 'bullish', tags: ['Venture Capital', 'Startup'], url: 'https://www.wamda.com/' }
        ],
        impact: [
            { sector: 'Energy', effect: 'positive', rationale: 'Rising geopolitical risk premium in Brent/WTI.', assets: ['XOM', 'CVX', 'USO'] },
            { sector: 'Airlines / Logistics', effect: 'negative', rationale: 'Higher fuel costs and route disruptions.', assets: ['LUV', 'DAL', 'FDX'] }
        ]
    },
    asia: {
        news: [
            { id: 'a2', title: 'South Korea Semiconductor Exports Projected to Break Record in Feb', source: 'Yonhap', time: '5h ago', impactScore: 9, sentiment: 'bullish', tags: ['Chips', 'Exports'], url: 'https://en.yna.co.kr/business' },
            { id: 'a1', title: 'BoJ Governor Hints at Potential Rate Hike as Inflation Nears 2%', source: 'Nikkei', time: '3h ago', impactScore: 8, sentiment: 'bearish', tags: ['BoJ', 'JPY'], url: 'https://asia.nikkei.com/Economy' },
            { id: 'a3', title: 'India Core Inflation Drops to 42-Month Low, Opening Door for RBI Cut', source: 'Economic Times', time: '4h ago', impactScore: 8, sentiment: 'bullish', tags: ['India', 'RBI'], url: 'https://economictimes.indiatimes.com/news/economy' },
            { id: 'a4', title: 'Taiwan Tech Giants Pivot Supply Chains Further into Southeast Asia', source: 'DigiTimes', time: '8h ago', impactScore: 7, sentiment: 'neutral', tags: ['Supply Chain', 'Tech'], url: 'https://www.digitimes.com/' },
            { id: 'a5', title: 'Japan Wage Negotiations Result in Highest Base Pay Increase Since 1993', source: 'Kyodo', time: '1d ago', impactScore: 7, sentiment: 'bullish', tags: ['Wages', 'Japan'], url: 'https://english.kyodonews.net/business' },
            { id: 'a6', title: 'Vietnam Manufacturing Enjoys Export Boom From Global Reshoring', source: 'VNExpress', time: '12h ago', impactScore: 6, sentiment: 'bullish', tags: ['Manufacturing', 'Vietnam'], url: 'https://e.vnexpress.net/news/business' },
            { id: 'a7', title: 'Singapore Narrows Growth Forecast to Upper Range Amid Robust Trade', source: 'Straits Times', time: '1d ago', impactScore: 5, sentiment: 'bullish', tags: ['GDP', 'Singapore'], url: 'https://www.straitstimes.com/business' }
        ],
        impact: [
            { sector: 'Semiconductors', effect: 'positive', rationale: 'Surging global AI demand boosting Korean/Taiwanese exports.', assets: ['TSM', 'Samsung', 'SK Hynix'] },
            { sector: 'Carry Trade', effect: 'mixed', rationale: 'Closing of Yen carry trade could trigger global liquidity shifts.', assets: ['USD/JPY', 'Global Stocks'] }
        ]
    },
    sa: {
        news: [
            { id: 's3', title: 'Argentina Posts First Monthly Budget Surplus in 12 Years Under Milei', source: 'La Nacion', time: '5h ago', impactScore: 9, sentiment: 'bullish', tags: ['Argentina', 'Fiscal'], url: 'https://www.lanacion.com.ar/economia/' },
            { id: 's4', title: 'Lithium Triangle Nations Propose Unified Framework for Extraction Royalties', source: 'Reuters', time: '8h ago', impactScore: 8, sentiment: 'bearish', tags: ['Lithium', 'Mining'], url: 'https://www.reuters.com/markets/commodities/' },
            { id: 's1', title: 'Peru Emerges as Fastest Growing Major LatAm Economy Amid Metal Boom', source: 'El Comercio', time: '2h ago', impactScore: 7, sentiment: 'bullish', tags: ['Mining', 'Commodities'], url: 'https://elcomercio.pe/economia/' },
            { id: 's2', title: 'Brazil Growth Forecast Cut to 1.6% for 2026; High Debt Concerns', source: 'Folha', time: '9h ago', impactScore: 7, sentiment: 'bearish', tags: ['Fiscal', 'Brazil'], url: 'https://www1.folha.uol.com.br/mercado/' },
            { id: 's5', title: 'Mexico Central Bank Holds Rate at 11%, Defies Expectations of Early Cut', source: 'El Financiero', time: '1d ago', impactScore: 7, sentiment: 'neutral', tags: ['Banxico', 'Rates'], url: 'https://www.elfinanciero.com.mx/economia/' },
            { id: 's6', title: 'Chile Copper Exports Surge 14% Y/Y Due to Global Supply Constraints', source: 'Diario Financiero', time: '12h ago', impactScore: 6, sentiment: 'bullish', tags: ['Copper', 'Chile'], url: 'https://www.df.cl/mercados' },
            { id: 's7', title: 'Colombia Introduces Healthcare Reform Bill Sparking Market Jitters', source: 'El Tiempo', time: '1d ago', impactScore: 5, sentiment: 'bearish', tags: ['Policy', 'Colombia'], url: 'https://www.eltiempo.com/economia' }
        ],
        impact: [
            { sector: 'Materials / Mining', effect: 'positive', rationale: 'Higher copper and gold prices benefit regional exporters.', assets: ['VALE', 'SCCO', 'FCX'] },
            { sector: 'EM Equities', effect: 'mixed', rationale: 'Yield differentials vs local fiscal risks.', assets: ['EWW', 'EWZ', 'ILF'] }
        ]
    }
};

export default function MacroNewsHub() {
    const [activeRegion, setActiveRegion] = useState('us');
    const data = MACRO_DATA[activeRegion];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Globe className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">GLOBAL MACRO NEWS HUB</h2>
                        <p className="text-sm text-gray-400">Regional intelligence & market cross-impact analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="text-xs font-medium text-white">LIVE ANALYSIS</span>
                </div>
            </div>

            {/* Region Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto scroller-hide">
                {REGIONS.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => setActiveRegion(region.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeRegion === region.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-y-[-1px]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span>{region.icon}</span>
                        {region.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* News Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">TOP REGIONAL HEADLINES</h3>
                        <span className="text-xs text-indigo-400 font-medium cursor-pointer hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>

                    <div className="space-y-3">
                        {data.news.map((item) => (
                            <a
                                key={item.id}
                                href={`https://news.google.com/search?q=${encodeURIComponent(item.title)}&hl=en-US&gl=US&ceid=US:en`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group relative p-4 bg-white/5 hover:bg-white/[0.08] backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                                                item.sentiment === 'bearish' ? 'bg-rose-500/20 text-rose-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {item.sentiment}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium">{item.source} • {item.time}</span>
                                        </div>
                                        <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                                            {item.title}
                                        </h4>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded-full text-gray-400">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${item.impactScore >= 8 ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-500/30'
                                            }`}>
                                            <span className="text-xs font-bold text-white">{item.impactScore}</span>
                                        </div>
                                        <span className="text-[8px] text-gray-500 font-bold uppercase">Impact</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Impact Analysis sidebar */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">MARKET IMPACT</h3>

                    <div className="space-y-4">
                        {data.impact.map((impact, idx) => (
                            <div
                                key={idx}
                                className="p-5 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        {impact.effect === 'positive' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                                        {impact.sector}
                                    </h4>
                                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${impact.effect === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                        {impact.effect}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 leading-relaxed italic">
                                    "{impact.rationale}"
                                </p>

                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Target Assets</span>
                                    <div className="flex flex-wrap gap-2">
                                        {impact.assets.map(asset => (
                                            <span key={asset} className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-indigo-300 border border-white/5">
                                                {asset}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-white">AI Strategy Insight</p>
                                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                    Regional shifts in {activeRegion.toUpperCase()} suggest a strategic rebalancing toward {data.impact[0].sector} while maintaining defensive hedges.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
