'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, FileText, ChevronRight, CheckCircle2, TrendingUp, AlertTriangle, Briefcase, Zap } from 'lucide-react';

interface Company {
    ticker: string;
    name: string;
}

interface Industry {
    name: string;
    icon: React.ReactNode;
    companies: Company[];
}

const INDUSTRIES: Industry[] = [
    {
        name: 'Technology',
        icon: <Zap className="w-4 h-4 text-blue-400" />,
        companies: [
            { ticker: 'AAPL', name: 'Apple Inc.' },
            { ticker: 'MSFT', name: 'Microsoft Corp.' },
            { ticker: 'NVDA', name: 'NVIDIA Corp.' },
            { ticker: 'GOOGL', name: 'Alphabet Inc.' },
            { ticker: 'AMZN', name: 'Amazon.com Inc.' },
            { ticker: 'META', name: 'Meta Platforms Inc.' },
            { ticker: 'TSLA', name: 'Tesla Inc.' },
            { ticker: 'AMD', name: 'Advanced Micro Devices' },
            { ticker: 'CRM', name: 'Salesforce Inc.' },
            { ticker: 'ADBE', name: 'Adobe Inc.' }
        ]
    },
    {
        name: 'Financials',
        icon: <Briefcase className="w-4 h-4 text-emerald-400" />,
        companies: [
            { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
            { ticker: 'BAC', name: 'Bank of America Corp.' },
            { ticker: 'WFC', name: 'Wells Fargo & Co.' },
            { ticker: 'GS', name: 'Goldman Sachs Group' },
            { ticker: 'MS', name: 'Morgan Stanley' },
            { ticker: 'C', name: 'Citigroup Inc.' },
            { ticker: 'V', name: 'Visa Inc.' },
            { ticker: 'MA', name: 'Mastercard Inc.' },
            { ticker: 'AXP', name: 'American Express Co.' },
            { ticker: 'BLK', name: 'BlackRock Inc.' }
        ]
    },
    {
        name: 'Healthcare',
        icon: <CheckCircle2 className="w-4 h-4 text-rose-400" />,
        companies: [
            { ticker: 'UNH', name: 'UnitedHealth Group' },
            { ticker: 'LLY', name: 'Eli Lilly and Company' },
            { ticker: 'JNJ', name: 'Johnson & Johnson' },
            { ticker: 'PFE', name: 'Pfizer Inc.' },
            { ticker: 'MRK', name: 'Merck & Co.' },
            { ticker: 'ABBV', name: 'AbbVie Inc.' },
            { ticker: 'TMO', name: 'Thermo Fisher Scientific' },
            { ticker: 'DHR', name: 'Danaher Corp.' },
            { ticker: 'SYK', name: 'Stryker Corp.' },
            { ticker: 'BMY', name: 'Bristol-Myers Squibb' },
        ]
    },
    {
        name: 'Commodities/Energy',
        icon: <TrendingUp className="w-4 h-4 text-orange-400" />,
        companies: [
            { ticker: 'XOM', name: 'Exxon Mobil Corp.' },
            { ticker: 'CVX', name: 'Chevron Corp.' },
            { ticker: 'COP', name: 'ConocoPhillips' },
            { ticker: 'EOG', name: 'EOG Resources' },
            { ticker: 'SLB', name: 'Schlumberger N.V.' },
            { ticker: 'NEM', name: 'Newmont Corp.' },
            { ticker: 'FCX', name: 'Freeport-McMoRan Inc.' },
            { ticker: 'BHP', name: 'BHP Group Ltd.' },
            { ticker: 'RIO', name: 'Rio Tinto Group' },
            { ticker: 'VALE', name: 'Vale S.A.' },
        ]
    }
];

interface ReportData {
    ticker: string;
    companyName: string;
    industry: string;
    date: string;
    rating: string;
    targetPrice: string;
    currentPrice: string;
    executiveSummary: string;
    investmentThesis: string[];
    valuation: string;
    catalysts: string[];
    risks: string[];
    financials?: Array<{
        year: string;
        revenue: string;
        revenueGrowth: string;
        grossMargin: string;
        netIncome: string;
        netMargin: string;
    }>;
    valuationStats?: {
        pe: string;
        peTTM: string;
        peForward: string;
        pb: string;
        peg: string;
        dcfBase: number;
        waccBase: number;
    };
}

export default function EquityResearchReport() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userWacc, setUserWacc] = useState<number>(9.5);

    const handleSelectCompany = (company: Company, industryName: string) => {
        setSelectedCompany(company);
        setPrompt(`Generate a comprehensive institutional equity research report on ${company.name} (${company.ticker}). Focus on their competitive moat, structural growth drivers in the ${industryName} sector, valuation relative to peers, and key risks to the downside.`);
        setReportData(null); // Clear previous
        setError(null);
    };

    const generateReport = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        setReportData(null);
        setUserWacc(9.5); // Reset wacc on new report

        try {
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    ticker: selectedCompany?.ticker,
                    companyName: selectedCompany?.name,
                    industry: INDUSTRIES.find(i => i.companies.some(c => c.ticker === selectedCompany?.ticker))?.name || 'General'
                }),
            });

            if (!response.ok) throw new Error('Failed to generate report');

            const data = await response.json();
            setReportData(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred during generation.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Filter companies based on search
    const filteredIndustries = INDUSTRIES.map(ind => ({
        ...ind,
        companies: ind.companies.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.ticker.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(ind => ind.companies.length > 0);

    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-[#0a0e17] text-gray-100 p-4 lg:p-6 gap-6 overflow-hidden">

            {/* Left Sidebar: Discovery & Search */}
            <div className="w-full lg:w-1/4 xl:w-1/5 flex flex-col gap-4 border border-[#ffffff10] rounded-2xl bg-[#ffffff05] backdrop-blur-md p-4 h-full shrink-0 overflow-y-auto hide-scrollbar shadow-2xl">

                <div className="mb-2">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Coverage Universe
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Select an equity to generate intelligence</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search ticker or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#00000040] border border-[#ffffff15] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-gray-200 placeholder-gray-600"
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4 mt-2 custom-scrollbar">
                    {filteredIndustries.map((ind, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                {ind.icon}
                                {ind.name}
                            </div>
                            <div className="space-y-1">
                                {ind.companies.map(company => (
                                    <button
                                        key={company.ticker}
                                        onClick={() => handleSelectCompany(company, ind.name)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all flex items-center justify-between group ${selectedCompany?.ticker === company.ticker
                                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                            : 'border-transparent hover:bg-[#ffffff0a] text-gray-300 hover:text-white'
                                            }`}
                                    >
                                        <div>
                                            <span className="font-bold mr-2">{company.ticker}</span>
                                            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-1">{company.name}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 opacity-0 transition-opacity ${selectedCompany?.ticker === company.ticker ? 'opacity-100 text-blue-400' : 'group-hover:opacity-100'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filteredIndustries.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            No equites found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            {/* Right Content: Report Generation & View */}
            <div className="w-full lg:w-3/4 xl:w-4/5 flex flex-col h-full gap-4">

                {/* Engine Input Section */}
                <div className="border border-[#ffffff10] rounded-2xl bg-[#ffffff05] backdrop-blur-md p-5 shadow-2xl shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            Alpha Intelligence Engine
                        </h1>
                        <div className="text-xs font-mono text-gray-500 bg-[#00000040] px-3 py-1 rounded-full border border-[#ffffff0a]">
                            MODEL: LLM-O1-FINANCE-PRO
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-3">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Select a company from the left or enter your qualitative research prompt here..."
                            className="flex-1 bg-[#00000040] border border-[#ffffff15] text-gray-200 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none placeholder-gray-600"
                        />
                        <button
                            onClick={generateReport}
                            disabled={isGenerating || !prompt.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 whitespace-nowrap min-w-[200px]"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Synthesizing...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                    {error && <div className="text-red-400 text-xs mt-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}
                </div>

                {/* Generated Report View */}
                <div className="flex-1 border border-[#ffffff10] rounded-2xl bg-[#ffffff05] backdrop-blur-md overflow-hidden flex flex-col relative shadow-2xl">
                    {/* Header Bar of Report */}
                    <div className="h-12 border-b border-[#ffffff10] bg-[#00000060] flex items-center px-6 justify-between shrink-0">
                        <div className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
                            Institutional Research Document
                        </div>
                        {reportData && (
                            <div className="text-xs text-gray-500 font-mono">
                                ID: RES-{Math.floor(Math.random() * 90000) + 10000} • {reportData.date}
                            </div>
                        )}
                    </div>

                    {/* Report Body */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e17]/50 backdrop-blur-sm z-10">
                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">Compiling Institutional Analysis...</h3>
                                <p className="text-sm text-gray-400 max-w-sm text-center">Parsing terminal data, extracting qualitative theses, and formulating valuation models.</p>
                            </div>
                        ) : reportData ? (
                            <div className="max-w-4xl mx-auto space-y-10 pb-10">
                                {/* Report Header Logo & Date */}
                                <div className="flex justify-between items-start border-b border-[#ffffff15] pb-6 mb-8">
                                    <div>
                                        <h2 className="text-4xl font-extrabold text-white mb-2">{reportData.companyName}</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="bg-[#ffffff10] px-3 py-1 rounded text-white font-mono">{reportData.ticker}</span>
                                            <span>Sector: {reportData.industry}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-3xl font-black text-emerald-400 mb-1">{reportData.rating.toUpperCase()}</div>
                                        <div className="text-sm text-gray-400">Target Price: <span className="text-white font-bold">{reportData.targetPrice}</span></div>
                                        <div className="text-sm text-gray-400">Current Price: <span className="text-white">{reportData.currentPrice}</span></div>
                                    </div>
                                </div>

                                {/* Executive Summary */}
                                <section>
                                    <h3 className="text-xl font-bold text-indigo-300 mb-4 pb-2 border-b border-indigo-500/20 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" /> Executive Summary
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed text-[15px]">
                                        {reportData.executiveSummary}
                                    </p>
                                </section>

                                {/* Investment Thesis */}
                                <section>
                                    <h3 className="text-xl font-bold text-blue-300 mb-4 pb-2 border-b border-blue-500/20">
                                        Core Investment Thesis
                                    </h3>
                                    <ul className="space-y-4">
                                        {reportData.investmentThesis.map((thesis, i) => {
                                            const [boldPart, ...rest] = thesis.split('**');
                                            if (rest.length > 0) {
                                                return (
                                                    <li key={i} className="flex gap-4">
                                                        <div className="shrink-0 w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/20">{i + 1}</div>
                                                        <p className="text-gray-300 text-[15px] leading-relaxed">
                                                            <strong className="text-white">{rest[0]}</strong>{rest[1]}
                                                        </p>
                                                    </li>
                                                )
                                            }
                                            return (
                                                <li key={i} className="flex gap-4">
                                                    <div className="shrink-0 w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/20">{i + 1}</div>
                                                    <p className="text-gray-300 text-[15px] leading-relaxed">{thesis}</p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </section>

                                {/* Financial Summary */}
                                {reportData.financials && reportData.financials.length > 0 && (
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-200 mb-4 pb-2 border-b border-gray-700/50">
                                            Financial Summary & Projections
                                        </h3>
                                        <div className="overflow-x-auto bg-[#ffffff05] rounded-xl border border-[#ffffff0a]">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[#ffffff05] border-b border-[#ffffff0a] text-xs uppercase tracking-wider text-gray-400">
                                                        <th className="p-3 font-semibold">Metric</th>
                                                        {reportData.financials.map(f => (
                                                            <th key={f.year} className={`p-3 font-mono font-semibold text-right ${f.year.includes('E') ? 'text-indigo-300' : 'text-gray-300'}`}>
                                                                {f.year}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm divide-y divide-[#ffffff0a]">
                                                    <tr className="hover:bg-[#ffffff05] transition-colors">
                                                        <td className="p-3 font-medium text-gray-300">Revenue ($M)</td>
                                                        {reportData.financials.map(f => (
                                                            <td key={f.year} className="p-3 font-mono text-white text-right">{f.revenue}</td>
                                                        ))}
                                                    </tr>
                                                    <tr className="hover:bg-[#ffffff05] transition-colors">
                                                        <td className="p-3 font-medium text-gray-300">Revenue Growth</td>
                                                        {reportData.financials.map(f => (
                                                            <td key={f.year} className="p-3 font-mono text-emerald-400 text-right">{f.revenueGrowth}</td>
                                                        ))}
                                                    </tr>
                                                    <tr className="hover:bg-[#ffffff05] transition-colors">
                                                        <td className="p-3 font-medium text-gray-300">Gross Margin</td>
                                                        {reportData.financials.map(f => (
                                                            <td key={f.year} className="p-3 font-mono text-gray-300 text-right">{f.grossMargin}</td>
                                                        ))}
                                                    </tr>
                                                    <tr className="hover:bg-[#ffffff05] transition-colors">
                                                        <td className="p-3 font-medium text-gray-300">Net Income ($M)</td>
                                                        {reportData.financials.map(f => (
                                                            <td key={f.year} className="p-3 font-mono text-blue-300 text-right">{f.netIncome}</td>
                                                        ))}
                                                    </tr>
                                                    <tr className="hover:bg-[#ffffff05] transition-colors border-b-0">
                                                        <td className="p-3 font-medium text-gray-300">Net Margin</td>
                                                        {reportData.financials.map(f => (
                                                            <td key={f.year} className="p-3 font-mono text-indigo-300 text-right">{f.netMargin}</td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                )}

                                {/* Valuation */}
                                <section className="bg-gradient-to-br from-[#ffffff05] to-transparent p-6 rounded-xl border border-[#ffffff0a]">
                                    <h3 className="text-xl font-bold text-emerald-300 mb-4 pb-2 border-b border-emerald-500/20">Valuation & Methodology</h3>

                                    {reportData.valuationStats && (
                                        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-[#ffffff05] p-3 rounded-lg border border-[#ffffff0a]">
                                                <div className="text-sm text-gray-400 mb-1">P/E (TTM)</div>
                                                <div className="text-xl font-mono text-white">{reportData.valuationStats.peTTM}x</div>
                                            </div>
                                            <div className="bg-[#ffffff05] p-3 rounded-lg border border-[#ffffff0a]">
                                                <div className="text-sm text-gray-400 mb-1">Forward P/E</div>
                                                <div className="text-xl font-mono text-white">{reportData.valuationStats.peForward}x</div>
                                            </div>
                                            <div className="bg-[#ffffff05] p-3 rounded-lg border border-[#ffffff0a]">
                                                <div className="text-sm text-gray-400 mb-1">P/B</div>
                                                <div className="text-xl font-mono text-white">{reportData.valuationStats.pb}x</div>
                                            </div>
                                            <div className="bg-[#ffffff05] p-3 rounded-lg border border-[#ffffff0a]">
                                                <div className="text-sm text-gray-400 mb-1">PEG Ratio</div>
                                                <div className="text-xl font-mono text-white">{reportData.valuationStats.peg}</div>
                                            </div>
                                        </div>
                                    )}

                                    {reportData.valuationStats && (
                                        <div className="mb-6 bg-[#0a0e17] p-5 rounded-lg border border-emerald-500/20">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-sm font-bold text-gray-300">DCF Sensitivity Analysis</div>
                                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-500/20 flex items-center gap-2">
                                                    Implied Fair Value:
                                                    <span className="font-mono font-bold text-white">
                                                        ${(reportData.valuationStats.dcfBase * (reportData.valuationStats.waccBase / userWacc)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-gray-400 font-mono">
                                                    <span>WACC: 7.0%</span>
                                                    <span className="text-emerald-400 font-bold w-12 text-center">{userWacc.toFixed(1)}%</span>
                                                    <span>WACC: 12.0%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="7.0"
                                                    max="12.0"
                                                    step="0.1"
                                                    value={userWacc}
                                                    onChange={(e) => setUserWacc(parseFloat(e.target.value))}
                                                    className="w-full accent-emerald-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="text-xs text-center text-gray-500 mt-2">
                                                    Adjust the Weighted Average Cost of Capital to see the impact on our DCF model.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-gray-400 text-[15px] leading-relaxed italic border-l-2 border-emerald-500/30 pl-4 py-1">
                                        {reportData.valuation}
                                    </p>
                                </section>

                                {/* Catalysts & Risks (2 Col Grid) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Catalysts */}
                                    <section>
                                        <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                                            Near-Term Catalysts
                                        </h3>
                                        <ul className="space-y-3">
                                            {reportData.catalysts.map((cat, i) => (
                                                <li key={i} className="flex gap-3 text-[14px] text-gray-300">
                                                    <span className="text-green-500 mt-1">•</span>
                                                    <span className="leading-snug">{cat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* Risks */}
                                    <section>
                                        <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                                            Downside Risks
                                        </h3>
                                        <ul className="space-y-3">
                                            {reportData.risks.map((risk, i) => {
                                                const [boldPart, ...rest] = risk.split('**');
                                                if (rest.length > 0) {
                                                    return (
                                                        <li key={i} className="flex gap-3 text-[14px] text-gray-300">
                                                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                            <span className="leading-snug"><strong className="text-rose-200">{rest[0]}</strong>{rest[1]}</span>
                                                        </li>
                                                    )
                                                }
                                                return (
                                                    <li key={i} className="flex gap-3 text-[14px] text-gray-300">
                                                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                        <span className="leading-snug">{risk}</span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </section>
                                </div>

                                <div className="mt-12 pt-6 border-t border-[#ffffff10] text-center text-xs text-gray-600">
                                    <p>CONFIDENTIAL AND PROPRIETARY. AI-GENERATED FOR DEMONSTRATION ONLY.</p>
                                    <p className="mt-1">Not investment advice. Please consult a registered financial advisor.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                <FileText className="w-16 h-16 mb-4 stroke-[1]" />
                                <h3 className="text-xl font-medium text-gray-400 mb-2">No Report Generated</h3>
                                <p className="text-sm max-w-md text-center">
                                    Select an equity from the coverage universe on the left, or input a custom prompt detailing the specific analysis required to generate an institutional-grade research document.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
