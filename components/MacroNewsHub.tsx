import React, { useState, useEffect } from 'react';
import { Globe, TrendingUp, TrendingDown, ArrowRight, Zap, AlertCircle, Bookmark, Share2, Loader2 } from 'lucide-react';

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

const INITIAL_IMPACT: Record<string, MarketImpact[]> = {
    us: [
        { sector: 'Financials', effect: 'positive', rationale: 'Higher-for-longer rates support net interest margins.', assets: ['JPM', 'GS', 'XLF'] },
        { sector: 'Tech/Growth', effect: 'negative', rationale: 'Persistent inflation expectations pressure multiples.', assets: ['QQQ', 'NVDA', 'MSFT'] }
    ],
    china: [
        { sector: 'Consumer Discretionary', effect: 'mixed', rationale: 'Stimulus vs. weak confidence dynamic.', assets: ['BABA', 'JD', 'KWEB'] },
        { sector: 'EV / Green Tech', effect: 'positive', rationale: 'Focus on "New Growth Drivers" and tech self-reliance.', assets: ['BYD', 'NIO', 'CATL'] }
    ],
    me: [
        { sector: 'Energy', effect: 'positive', rationale: 'Rising geopolitical risk premium in Brent/WTI.', assets: ['XOM', 'CVX', 'USO'] },
        { sector: 'Airlines / Logistics', effect: 'negative', rationale: 'Higher fuel costs and route disruptions.', assets: ['LUV', 'DAL', 'FDX'] }
    ],
    asia: [
        { sector: 'Semiconductors', effect: 'positive', rationale: 'Surging global AI demand boosting Korean/Taiwanese exports.', assets: ['TSM', 'Samsung', 'SK Hynix'] },
        { sector: 'Carry Trade', effect: 'mixed', rationale: 'Closing of Yen carry trade could trigger global liquidity shifts.', assets: ['USD/JPY', 'Global Stocks'] }
    ],
    sa: [
        { sector: 'Materials / Mining', effect: 'positive', rationale: 'Higher copper and gold prices benefit regional exporters.', assets: ['VALE', 'SCCO', 'FCX'] },
        { sector: 'EM Equities', effect: 'mixed', rationale: 'Yield differentials vs local fiscal risks.', assets: ['EWW', 'EWZ', 'ILF'] }
    ]
};

export default function MacroNewsHub() {
    const [activeRegion, setActiveRegion] = useState('us');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const impactData = INITIAL_IMPACT[activeRegion] || INITIAL_IMPACT.us;

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/macro-news?region=${activeRegion}`);
                const data = await res.json();
                if (data.news) {
                    setNews(data.news);
                }
            } catch (err) {
                console.error('Failed to fetch macro news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [activeRegion]);

    return (
        <div id="macro-news-hub" className="space-y-6">
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
                    <Zap className={`w-4 h-4 text-yellow-400 ${loading ? 'animate-spin' : 'animate-pulse'}`} />
                    <span className="text-xs font-medium text-white">{loading ? 'FETCHING...' : 'LIVE ANALYSIS'}</span>
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

                    <div className="space-y-3 relative min-h-[400px]">
                        {loading && news.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {news.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url.startsWith('http') ? item.url : `https://news.google.com/search?q=${encodeURIComponent(item.title)}`}
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
                                                    {item.tags.slice(0, 3).map(tag => (
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
                                {news.length === 0 && !loading && (
                                    <div className="p-8 text-center text-gray-500">
                                        No recent news found for this region.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Impact Analysis sidebar */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">MARKET IMPACT</h3>

                    <div className="space-y-4">
                        {impactData.map((impact, idx) => (
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
                                    Regional shifts in {activeRegion.toUpperCase()} suggest a strategic rebalancing toward {impactData[0].sector} while maintaining defensive hedges.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
