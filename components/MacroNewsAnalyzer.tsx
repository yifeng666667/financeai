'use client';

import React, { useState } from 'react';
import {
    Brain,
    Sparkles,
    ChevronRight,
    Layers,
    Target,
    Info,
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    Loader2,
    Plus
} from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';

interface AnalysisResult {
    systemicInterpretation: {
        headline: string;
        points: string[];
    };
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    impactScore: number;
    summary: string;
    industryChain: {
        upstream: string;
        midstream: string;
        downstream: string;
    };
    stockIndications: {
        ticker: string;
        rating: string;
        reason: string;
    }[];
}

export default function MacroNewsAnalyzer({ onStockClick }: { onStockClick?: (ticker: string) => void }) {
    const { addHolding } = usePortfolio();
    const [newsInput, setNewsInput] = useState('');
    const [isAdding, setIsAdding] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleAddHolding = async (e: React.MouseEvent, ticker: string) => {
        e.stopPropagation();
        setIsAdding(ticker);
        try {
            await addHolding(ticker, "1");
        } catch (error) {
            console.error('Failed to add holding:', error);
        } finally {
            setIsAdding(null);
        }
    };

    const handleAnalyze = async () => {
        if (!newsInput.trim()) return;

        setIsAnalyzing(true);
        setResult(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'User Input News', content: String(newsInput) })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mt-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800/60 bg-gradient-to-r from-blue-600/10 to-purple-600/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                        <Brain className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">AI Macro News Intelligence</h2>
                        <p className="text-base text-slate-400 mt-1">Deep structural analysis of market-moving events</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-200/80">Premium AI Model</span>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Input Area */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="relative group">
                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
                                Input Intelligence Context (Text or URL)
                            </label>
                            <textarea
                                value={newsInput}
                                onChange={(e) => setNewsInput(e.target.value)}
                                placeholder="Paste news content, article link, market rumors, or policy updates here for detailed structural analysis..."
                                className="w-full h-64 bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all resize-none text-base leading-relaxed"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
                                {newsInput.length} chars
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !newsInput.trim()}
                            className={`w-full py-4 text-lg rounded-xl flex items-center justify-center gap-3 font-bold transition-all ${isAnalyzing || !newsInput.trim()
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 active:scale-[0.98]'
                                }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Generating Analysis...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-6 h-6" />
                                    <span>Generate Intelligence</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Area */}
                    <div className="lg:col-span-7">
                        {!result && !isAnalyzing ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-800/50 rounded-3xl bg-slate-950/20">
                                <Activity className="w-16 h-16 text-slate-700 mb-6" />
                                <h3 className="text-slate-400 text-lg font-medium italic">Waiting for market intelligence input...</h3>
                                <p className="text-slate-600 text-base mt-3 max-w-sm">
                                    Our AI will parse the text or URL, analyze impact across industry chains, and surface specific trade opportunities.
                                </p>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="h-full space-y-6 animate-pulse">
                                <div className="h-32 bg-slate-800/30 rounded-2xl" />
                                <div className="h-28 bg-slate-800/30 rounded-2xl" />
                                <div className="h-56 bg-slate-800/30 rounded-2xl" />
                                <div className="h-40 bg-slate-800/30 rounded-2xl" />
                            </div>
                        ) : result && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                {/* Systemic Interpretation (New) */}
                                <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                                            <Sparkles className="w-5 h-5" />
                                            <span>Systemic Interpretation</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-5 leading-snug">
                                            {result.systemicInterpretation.headline}
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.systemicInterpretation.points.map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                    <p className="text-slate-300 text-base leading-relaxed">{point}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Sentiment & Impact */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-5 rounded-2xl border ${result.sentiment === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                        result.sentiment === 'Bearish' ? 'bg-rose-500/10 border-rose-500/20' :
                                            'bg-slate-500/10 border-slate-500/20'
                                        }`}>
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Sentiment Rating</span>
                                        <div className="flex items-center gap-2">
                                            {result.sentiment === 'Bullish' ? <TrendingUp className="w-6 h-6 text-emerald-400" /> :
                                                result.sentiment === 'Bearish' ? <TrendingDown className="w-6 h-6 text-rose-400" /> :
                                                    <Activity className="w-6 h-6 text-slate-400" />}
                                            <span className={`text-2xl font-bold ${result.sentiment === 'Bullish' ? 'text-emerald-400' :
                                                result.sentiment === 'Bearish' ? 'text-rose-400' :
                                                    'text-slate-200'
                                                }`}>{result.sentiment}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Impact Confidence</span>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-2xl font-bold text-white">{result.impactScore}%</span>
                                            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${result.impactScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Strategic Summary */}
                                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4 text-blue-400 font-bold text-sm uppercase tracking-wider">
                                        <Target className="w-5 h-5" />
                                        <span>Strategic Summary</span>
                                    </div>
                                    <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">
                                        {result.summary}
                                    </p>
                                </div>

                                {/* Industry Chain Analysis */}
                                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-5 text-purple-400 font-bold text-sm uppercase tracking-wider">
                                        <Layers className="w-5 h-5" />
                                        <span>Industry Chain Impact</span>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="flex gap-4">
                                            <div className="w-1.5 h-auto bg-blue-500/40 rounded-full" />
                                            <div>
                                                <h4 className="text-slate-200 text-sm font-bold mb-1.5">Upstream / Supply</h4>
                                                <p className="text-slate-400 text-base leading-relaxed">{result.industryChain.upstream}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-1.5 h-auto bg-purple-500/40 rounded-full" />
                                            <div>
                                                <h4 className="text-slate-200 text-sm font-bold mb-1.5">Midstream / Operations</h4>
                                                <p className="text-slate-400 text-base leading-relaxed">{result.industryChain.midstream}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-1.5 h-auto bg-indigo-500/40 rounded-full" />
                                            <div>
                                                <h4 className="text-slate-200 text-sm font-bold mb-1.5">Downstream / Consumer</h4>
                                                <p className="text-slate-400 text-base leading-relaxed">{result.industryChain.downstream}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Indications */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider px-1">
                                        <Activity className="w-5 h-5" />
                                        <span>Indicative Stock Universe</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.stockIndications.map((stock, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => onStockClick && onStockClick(stock.ticker)}
                                                className={`bg-slate-900/60 border border-slate-800 rounded-xl p-5 transition-all duration-300 ${onStockClick ? 'hover:border-blue-500 cursor-pointer hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] group' : 'hover:border-slate-700'}`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{stock.ticker}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => handleAddHolding(e, stock.ticker)}
                                                            disabled={isAdding === stock.ticker}
                                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 transition-all flex items-center gap-1.5"
                                                            title="Add to Portfolio"
                                                        >
                                                            {isAdding === stock.ticker ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Plus className="w-4 h-4" />
                                                            )}
                                                            <span className="text-xs font-bold">Add</span>
                                                        </button>
                                                        <span className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${stock.rating === 'Buy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            stock.rating === 'Sell' ? 'bg-rose-500/20 text-rose-400' :
                                                                'bg-slate-700 text-slate-300'
                                                            }`}>
                                                            {stock.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-snug">{stock.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Tip */}
            <div className="px-8 py-5 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-500 shrink-0" />
                <p className="text-xs text-slate-500 font-medium">
                    Analysis accounts for global liquidity, technical indicators, and fundamental sector mappings. Always perform independent due diligence.
                </p>
            </div>
        </div>
    );
}
