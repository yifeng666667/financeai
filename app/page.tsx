'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import dynamic from 'next/dynamic';
import {
  Briefcase,
  Cpu,
  HeartPulse,
  Landmark,
  Leaf,
  Zap,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Activity,
  ShieldAlert,
  Users,
  Banknote,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const TradingChart = dynamic(() => import('../components/TradingChart'), { ssr: false });
import RiskSparkline from '../components/RiskSparkline';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import VaRDistribution from '../components/VaRDistribution';
import CompanyRadarScorecard from '../components/CompanyRadarScorecard';
import MacroNewsHub from '../components/MacroNewsHub';

// Mock Sector Data with Industry details
const SECTOR_DATA = [
  {
    id: 'tech',
    name: 'Technology',
    ticker: 'XLK',
    icon: Cpu,
    trend: '+1.2%',
    desc: 'Software, Hardware, AI',
    industries: [
      { name: 'Semiconductors', value: '+3.4%', change: '+1.2%', stocks: ['NVDA', 'AMD', 'AVGO', 'INTC', 'TSM'] },
      { name: 'Software - Infrastructure', value: '+1.8%', change: '+0.5%', stocks: ['MSFT', 'ORCL', 'PANW', 'SNOW', 'PLTR'] },
      { name: 'Software - Application', value: '+0.9%', change: '+0.2%', stocks: ['CRM', 'ADBE', 'NOW', 'INTU', 'WDAY'] },
      { name: 'Hardware', value: '-0.2%', change: '-0.1%', stocks: ['AAPL', 'DELL', 'HPQ', 'STX', 'WDC'] },
      { name: 'Internet Content', value: '+2.1%', change: '+1.5%', stocks: ['GOOGL', 'META', 'NFLX', 'SNAP', 'PINS'] }
    ]
  },
  {
    id: 'fin',
    name: 'Financials',
    ticker: 'XLF',
    icon: Landmark,
    trend: '-0.4%',
    desc: 'Banks, Insurance, Real Estate',
    industries: [
      { name: 'Banks - Diversified', value: '-0.8%', change: '-0.5%', stocks: ['JPM', 'BAC', 'WFC', 'C', 'GS'] },
      { name: 'Asset Management', value: '+0.4%', change: '+0.2%', stocks: ['BLK', 'BX', 'MS', 'KKR', 'APO'] },
      { name: 'Credit Services', value: '+1.2%', change: '+0.9%', stocks: ['V', 'MA', 'AXP', 'PYPL', 'COF'] }
    ]
  },
  {
    id: 'health',
    name: 'Healthcare',
    ticker: 'XLV',
    icon: HeartPulse,
    trend: '+0.8%',
    desc: 'Pharma, Biotech, Devices',
    industries: [
      { name: 'Drug Manufacturers', value: '+0.5%', change: '+0.1%', stocks: ['LLY', 'JNJ', 'PFE', 'ABBV', 'MRK'] },
      { name: 'Biotechnology', value: '+2.4%', change: '+1.8%', stocks: ['VRTX', 'AMGN', 'GILD', 'REGN', 'BIIB'] },
      { name: 'Medical Devices', value: '+1.1%', change: '+0.7%', stocks: ['ISRG', 'MDT', 'SYK', 'BSX', 'EW'] }
    ]
  },
  { id: 'energy', name: 'Energy', ticker: 'XLE', icon: Zap, trend: '+2.1%', desc: 'Oil, Gas, Consumables', industries: [] },
  { id: 'consumer', name: 'Consumer', ticker: 'XLY', icon: Briefcase, trend: '-0.1%', desc: 'Retail, E-commerce, Autos', industries: [] },
  { id: 'esg', name: 'Clean Energy', ticker: 'ICLN', icon: Leaf, trend: '+3.5%', desc: 'Solar, Wind, Renewables', industries: [] },
];

const SECTORS = SECTOR_DATA;

interface OHLCV {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CategorizedNews {
  category: string;
  count: number;
  sentimentRatio: { bullish: number; bearish: number; neutral: number };
  keywords: string[];
}

interface NewsArticle {
  id: number;
  source: string;
  time: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  categories: string[];
}

interface AIAnalysis {
  date: string;
  summary: string;
  marketReaction: { dayReturn: string; volumeChange: string; volatilityChange: string };
  historicalSimilarities: { matchedEvents: number; avgT1Return: string; avgT5Return: string; winRateT1: string; winRateT5: string };
  aiForecast: { outlook: string; prob7D: string; prob30D: string };
  eventCategories: CategorizedNews[];
  articles: NewsArticle[];
}

const MARKETS_NEWS: { title: string; source: string; time: string; sentiment: 'Bullish' | 'Bearish' | 'Neutral'; region: string; category: string; impact: string }[] = [
  { title: "Fed Signals Potential Rate Cut as Inflation Softens", source: "Macro Watch", time: "2h ago", sentiment: 'Bullish', region: 'US', category: 'Macro', impact: 'High' },
  { title: "Eurozone PMI Hits 6-Month Low Amid Energy Concerns", source: "EuroStats", time: "4h ago", sentiment: 'Bearish', region: 'EU', category: 'Industrial', impact: 'Medium' },
  { title: "Nvidia Supply Chain Expands into Vietnam and India", source: "Tech Pulse", time: "5h ago", sentiment: 'Bullish', region: 'Asia', category: 'Semis', impact: 'High' },
  { title: "Oil Prices Stabilize After Brief Middle East Flare-up", source: "Energy Daily", time: "7h ago", sentiment: 'Neutral', region: 'Global', category: 'Energy', impact: 'Medium' },
  { title: "Japan's Nikkei Reaches All-Time High on Corporate Reforms", source: "Asian Markets", time: "1d ago", sentiment: 'Bullish', region: 'Asia', category: 'Equity', impact: 'High' },
  { title: "US Consumer Spending Slows in Q1; Retailers Wary", source: "Retail Signal", time: "1d ago", sentiment: 'Bearish', region: 'US', category: 'Consumer', impact: 'Medium' },
  { title: "New AI Regulation Framework Proposed in Brussels", source: "Policy Pro", time: "2d ago", sentiment: 'Neutral', region: 'EU', category: 'Policy', impact: 'Low' },
  { title: "Emerging Market Debt Levels Spark IMF Concerns", source: "World Finance", time: "2d ago", sentiment: 'Bearish', region: 'Global', category: 'Debt', impact: 'Medium' },
];

interface MarketNews {
  title: string;
  source: string;
  time: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  region: string;
  category: string;
  impact: string;
}

interface PageChartEvent {
  date: string;
  headline: string;
  type: 'Earnings' | 'Product' | 'Macro' | 'Policy' | 'Management' | 'Competition';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  t1Return?: string;
}

interface CompanyProfile {
  name: string;
  intro: string;
  businessModel: string;
  profitability: string;
  sector?: string;
  industry?: string;
  analystTake: { rating: string; targetPrice: string; catalysts: string; risks: string; };
  valuation: { pe: string; pb: string; peg: string; pePercentile: number; pbPercentile: number; dcfValue: string; status: string; wacc: string; };
  fundamentals: { grossMargin: string; operatingMargin: string; netMargin: string; roe: string; roa: string; revenueGrowth: string; epsGrowth: string; currentRatio: string; debtToEquity: string; };
  comparables: { ticker: string; name: string }[];
}

interface RiskIndicator {
  name: string;
  value: string | number;
  change: string;
  status: 'Bullish' | 'Neutral' | 'Bearish';
  description: string;
  insight: string;
}



const RISK_INDICATORS: (RiskIndicator & { trendData: number[] })[] = [
  { name: 'VIX Index', value: '14.2', change: '-2.1%', status: 'Bullish', description: 'Fear & Tail-Risk', insight: 'VIX is currently bottoming out, suggesting market complacency. While technically bullish for momentum, it increases the risk of a sharp correction if macro data surprises.', trendData: [18, 17, 19, 16, 15, 14.5, 14.2] },
  { name: 'Credit Spreads', value: '345bps', change: '+12bps', status: 'Neutral', description: 'TED/High Yield Spreads', insight: 'Spreads are widening slightly in the High Yield sector, indicating some liquidity stress in lower-tier corporate debt. Monitor for spillover into broader equity markets.', trendData: [320, 325, 330, 328, 335, 340, 345] },
  { name: 'Put/Call Ratio', value: '0.82', change: '+0.05', status: 'Neutral', description: 'Options Sentiment', insight: 'The ratio is in the neutral zone, neither showing extreme greed nor panic. Institutional positioning is balanced ahead of the next FOMC meeting.', trendData: [0.75, 0.78, 0.82, 0.80, 0.85, 0.83, 0.82] },
  { name: 'A/D Line', value: '+1,240', change: '+150', status: 'Bullish', description: 'Market Breadth', insight: 'Breadth is expanding, with more stocks hitting new 52-week highs than lows. This suggests the current rally is well-supported and not just driven by Mega-Cap tech.', trendData: [800, 950, 1100, 1050, 1200, 1180, 1240] },
  { name: '10Y-2Y Spread', value: '-32bps', change: '+5bps', status: 'Bearish', description: 'Recession Warning', insight: 'The yield curve remains inverted, though the spread is narrowing (disinverting). Historically, disinversion after a long period of inversion is a more immediate signal of an impending economic slowdown.', trendData: [-45, -42, -40, -38, -35, -34, -32] },
  { name: '200DMA Breadth', value: '64%', change: '-2%', status: 'Bullish', description: '% Stocks > 200DMA', insight: '64% of S&P 500 stocks are above their long-term average. This is healthy, providing a cushion for the index even if leading stocks take a breather.', trendData: [58, 60, 62, 65, 68, 66, 64] },
];

const MARKET_RISK_NEWS = [
  { title: "VIX hits multi-month lows as equity markets reach new highs", url: "https://finance.yahoo.com", source: "Yahoo Finance" },
  { title: "Credit spreads widen as commercial real estate concerns mount", url: "https://www.cnbc.com", source: "CNBC" },
  { title: "Options market signals cautious optimism ahead of inflation data", url: "https://www.wsj.com", source: "WSJ" }
];

const CORRELATION_NEWS = [
  { title: "Tech-S&P 500 correlation reaches record levels in 2024", url: "https://finance.yahoo.com", source: "Yahoo Finance" },
  { title: "Bitcoin decoupling from gold as digital asset adoption climbs", url: "https://www.bloomberg.com", source: "Bloomberg" },
  { title: "Emerging markets show unexpected resilience against US dollar strength", url: "https://www.reuters.com", source: "Reuters" }
];

const VAR_NEWS = [
  { title: "Hedge funds increase tail-risk protection as geo-political risks rise", url: "https://www.reuters.com", source: "Reuters" },
  { title: "VaR models under fire as market volatility patterns shift", url: "https://www.ft.com", source: "Financial Times" },
  { title: "Black Swan hedging strategies see record inflows this quarter", url: "https://www.wsj.com", source: "WSJ" }
];

const CORRELATION_DATA = [
  { pair: ['S&P 500', 'Nasdaq 100'], value: 0.94, trend: 'Increasing' },
  { pair: ['S&P 500', 'Bitcoin'], value: 0.42, trend: 'Decreasing' },
  { pair: ['S&P 500', 'Gold'], value: -0.15, trend: 'Stable' },
  { pair: ['Nasdaq 100', 'US 10Y Yield'], value: -0.65, trend: 'Increasing' },
  { pair: ['Bitcoin', 'Gold'], value: 0.28, trend: 'Increasing' },
  { pair: ['Gold', 'USD Index'], value: -0.78, trend: 'Stable' },
];

const VAR_SCENARIOS = [
  {
    id: '1987',
    description: '1-Day Value at Risk Analysis (95% Confidence)',
    currentVaR: '1.45%',
    expectedShortfall: '4.12%',
    stressScenario: '1987 BLACK MONDAY',
    estimatedLoss: '-22.6%',
    riskSummary: 'The current market VaR of 1.45% indicates that there is a 95% probability that the portfolio will not lose more than 1.45% of its value in a single day. However, historical correlation shifts suggest that in a high-volatility event, the diversification benefit across sectors could drop by 30%, leading to a "VaR Breach."',
    recommendation: 'Hedge high-beta technology exposures with inverse ETFs or treasury bonds to lower the tail-risk from current levels.'
  },
  {
    id: '2008',
    description: '1-Day Value at Risk Analysis (99% Confidence)',
    currentVaR: '2.10%',
    expectedShortfall: '6.50%',
    stressScenario: '2008 FINANCIAL CRISIS',
    estimatedLoss: '-35.2%',
    riskSummary: 'Systemic banking failures and liquidity dry-ups could lead to unprecedented margin calls. The portfolio\'s heavy weighting in tech might initially seem insulated but is highly vulnerable to a broader credit freeze tightening multiples.',
    recommendation: 'Increase allocation to short-duration sovereign debt and gold to provide uncorrelated liquidity buffers during severe credit contractions.'
  },
  {
    id: '2020',
    description: '1-Week Value at Risk Analysis (95% Confidence)',
    currentVaR: '3.80%',
    expectedShortfall: '8.20%',
    stressScenario: '2020 COVID CRASH',
    estimatedLoss: '-28.4%',
    riskSummary: 'An exogenous velocity shock severely impacts near-term cash flows globally. While software and cloud infrastructure show resilience, hardware supply chains connected to the portfolio could face massive disruptions.',
    recommendation: 'Rotate out of hardware-dependent semi-caps and increase weighting in pure-play SaaS businesses with bulletproof balance sheets.'
  }
];



// Model Portfolios
const AGGRESSIVE_GROWTH_PORTFOLIO = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 822.79, change: 0, weight: 20, color: 'hsl(120, 70%, 60%)' },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 175.22, change: 0, weight: 15, color: 'hsl(0, 70%, 60%)' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 192.53, change: 0, weight: 15, color: 'hsl(300, 70%, 60%)' },
  { ticker: 'PLTR', name: 'Palantir Technologies', price: 24.50, change: 0, weight: 10, color: 'hsl(210, 70%, 40%)' },
  { ticker: 'SMCI', name: 'Super Micro Computer', price: 1020.50, change: 0, weight: 10, color: 'hsl(240, 70%, 60%)' },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings', price: 320.15, change: 0, weight: 10, color: 'hsl(10, 70%, 50%)' },
  { ticker: 'META', name: 'Meta Platforms', price: 502.30, change: 0, weight: 5, color: 'hsl(220, 70%, 60%)' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 0, weight: 5, color: 'hsl(15, 70%, 60%)' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.50, change: 0, weight: 5, color: 'hsl(200, 70%, 60%)' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 178.22, change: 0, weight: 5, color: 'hsl(30, 70%, 50%)' },
];

const GROWTH_PORTFOLIO = [
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.50, change: 0, weight: 15, color: 'hsl(200, 70%, 60%)' },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 0, weight: 15, color: 'hsl(0, 0%, 80%)' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 822.79, change: 0, weight: 15, color: 'hsl(120, 70%, 60%)' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 0, weight: 10, color: 'hsl(15, 70%, 60%)' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 178.22, change: 0, weight: 10, color: 'hsl(30, 70%, 50%)' },
  { ticker: 'META', name: 'Meta Platforms', price: 502.30, change: 0, weight: 10, color: 'hsl(220, 70%, 60%)' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', price: 1305.20, change: 0, weight: 5, color: 'hsl(340, 70%, 50%)' },
  { ticker: 'LLY', name: 'Eli Lilly', price: 754.20, change: 0, weight: 5, color: 'hsl(350, 70%, 60%)' },
  { ticker: 'NFLX', name: 'Netflix Inc.', price: 620.10, change: 0, weight: 5, color: 'hsl(0, 80%, 50%)' },
  { ticker: 'CRM', name: 'Salesforce Inc.', price: 308.20, change: 0, weight: 10, color: 'hsl(200, 80%, 40%)' },
];

const BALANCED_PORTFOLIO = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 0, weight: 10, color: 'hsl(0, 0%, 80%)' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.50, change: 0, weight: 10, color: 'hsl(200, 70%, 60%)' },
  { ticker: 'JPM', name: 'JPMorgan Chase', price: 188.22, change: 0, weight: 10, color: 'hsl(210, 50%, 40%)' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', price: 158.40, change: 0, weight: 10, color: 'hsl(0, 60%, 50%)' },
  { ticker: 'PG', name: 'Procter & Gamble', price: 160.20, change: 0, weight: 10, color: 'hsl(240, 40%, 40%)' },
  { ticker: 'UNH', name: 'UnitedHealth Group', price: 482.15, change: 0, weight: 10, color: 'hsl(220, 60%, 50%)' },
  { ticker: 'V', name: 'Visa Inc.', price: 282.15, change: 0, weight: 10, color: 'hsl(40, 80%, 50%)' },
  { ticker: 'WMT', name: 'Walmart Inc.', price: 60.50, change: 0, weight: 10, color: 'hsl(200, 80%, 50%)' },
  { ticker: 'XOM', name: 'Exxon Mobil', price: 112.30, change: 0, weight: 10, color: 'hsl(0, 50%, 40%)' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', price: 410.20, change: 0, weight: 10, color: 'hsl(280, 50%, 40%)' },
];

const MOCK_SCORECARDS: Record<string, { data: { Value: number, Growth: number, Quality: number, Momentum: number, Volatility: number }, bullCase: string[], bearCase: string[] }> = {
  'NVDA': {
    data: { Value: 15, Growth: 98, Quality: 85, Momentum: 95, Volatility: 30 },
    bullCase: ['AI GPU demand continues to outpace supply through 2026', 'Data center revenue grew 400% YoY with gross margins expanding', 'CUDA software ecosystem creates insurmountable hardware moat'],
    bearCase: ['P/E ratio extremely stretched leaving no room for execution errors', 'Sovereign AI spending might pull forward future demand', 'Custom silicon (ASICs) from hyperscalers threatening market share']
  },
  'AAPL': {
    data: { Value: 45, Growth: 35, Quality: 95, Momentum: 60, Volatility: 80 },
    bullCase: ['Services segment growing steadily with >70% gross margins', 'Massive installed base of 2B+ active devices globally', 'Unmatched free cash flow generation and aggressive buybacks'],
    bearCase: ['iPhone upgrade cycles are lengthening significantly', 'Regulatory pressures globally targeting App Store fees', 'Lagging behind peers in generative AI feature rollout']
  },
  'AMD': {
    data: { Value: 25, Growth: 85, Quality: 70, Momentum: 80, Volatility: 40 },
    bullCase: ['MI300X gaining traction as a viable alternative to NVIDIA', 'Continued market share capture from Intel in Server CPU (EPYC)', 'Improving gross margins via product mix shift'],
    bearCase: ['PC recovery remains slower than anticipated', 'Still functionally far behind NVDA in software stack (ROCm)', 'Gaming segment revenue contracting dramatically']
  },
  'MSFT': {
    data: { Value: 35, Growth: 70, Quality: 98, Momentum: 75, Volatility: 70 },
    bullCase: ['Copilot monetization accelerating across M365 user base', 'Azure cloud growth re-accelerating due to AI workloads', 'Strongest balance sheet in tech with AAA rating'],
    bearCase: ['OpenAI partnership structure poses long-term IP risks', 'Capital expenditure for AI datacenters expanding rapidly', 'Valuation commands historically high premium']
  },
  'TSLA': {
    data: { Value: 20, Growth: 40, Quality: 50, Momentum: 30, Volatility: 15 },
    bullCase: ['FSD v12 showing step-change improvements in autonomy', 'Energy storage deployment growing at 100%+ YoY', 'Next-Gen unboxed manufacturing to drastically cut COGS'],
    bearCase: ['EV demand structurally slowing globally', 'Relentless price cuts destroying operating margins', 'Fierce competition from BYD and Chinese domestic EV makers']
  },
  'PLTR': {
    data: { Value: 10, Growth: 55, Quality: 75, Momentum: 90, Volatility: 20 },
    bullCase: ['AIP bootcamp strategy driving unprecedented commercial adoption', 'US Government defense spending providing extremely sticky revenue', 'Achieved consistent GAAP profitability signaling maturity'],
    bearCase: ['Lumpy government contract cycles make revenue hard to model', 'Valuation >20x Price-to-Sales is priced for perfection', 'SBC (Stock-Based Compensation) still relatively high']
  },
  'DEFAULT': {
    data: { Value: 50, Growth: 50, Quality: 60, Momentum: 50, Volatility: 50 },
    bullCase: ['Solid market position with stable recurring revenue base', 'Recent cost-cutting measures improving operating margins'],
    bearCase: ['Macroeconomic headwinds affecting broader industry spend', 'Valuation appears fully priced given standard growth trajectory']
  }
};

export default function DashboardV3() {
  const [activeStressIndex, setActiveStressIndex] = useState(0);
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const { portfolioHoldings, addHolding: addToPortfolio, removeHolding: removeFromPortfolio, updateWeight: updateHoldingWeight, applyModelPortfolio } = usePortfolio();

  const [viewMode, setViewMode] = useState<'sectors' | 'industry' | 'stock' | 'markets' | 'portfolio'>('sectors');
  const [selectedSector, setSelectedSector] = useState<typeof SECTORS[0] | null>(null);
  const [activeEventCategory, setActiveEventCategory] = useState<string | null>(null);
  const [stockData, setStockData] = useState<OHLCV[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [ticker, setTicker] = useState('AAPL');
  const [chartEvents, setChartEvents] = useState<PageChartEvent[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateAnalysis, setDateAnalysis] = useState<AIAnalysis | null>(null);

  const [activeTab, setActiveTab] = useState<'Fundamentals' | 'Business & Mgmt' | 'Comparables' | '📋 Overview'>('📋 Overview');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  // AI Sales Copilot States
  const [copilotContent, setCopilotContent] = useState<string>('');
  const [isGeneratingCopilot, setIsGeneratingCopilot] = useState<boolean>(false);

  const [marketNewsFilter, setMarketNewsFilter] = useState<'All' | 'Bullish' | 'Bearish'>('All');
  const [marketRegionFilter, setMarketRegionFilter] = useState<'All' | 'US' | 'EU' | 'Asia' | 'Global'>('All');



  useEffect(() => {
    fetchStockData(ticker);
    fetchCompanyProfile(ticker);
  }, [ticker]);

  const fetchCompanyProfile = async (symbol: string) => {
    try {
      const res = await fetch(`/api/company-profile?ticker=${symbol}`);
      const data = await res.json();
      setCompanyProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStockData = async (symbol: string) => {
    setLoadingData(true);
    try {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      const period1 = Math.floor(threeYearsAgo.getTime() / 1000).toString();

      const res = await fetch(`/api/stock?ticker=${symbol}&period1=${period1}`);
      const result = await res.json();
      if (result.data) {
        setStockData(result.data);
        const dummyEvents = result.data.filter((_: any, i: number) => i > 0 && i % 25 === 0).map((d: any) => {
          const isBull = Math.random() > 0.5;
          const types: PageChartEvent['type'][] = ['Earnings', 'Product', 'Macro', 'Policy', 'Management', 'Competition'];
          const randomType = types[Math.floor(Math.random() * types.length)];
          return {
            date: d.time,
            headline: isBull ? "Strong momentum highlighted in recent sector coverage. Management optimistic on Q4." : "Analysts downgrade stock citing macro headwinds and margin compression.",
            type: randomType,
            sentiment: isBull ? 'bullish' : 'bearish',
            t1Return: isBull ? '+2.4%' : '-1.5%'
          } as PageChartEvent;
        });
        setChartEvents(dummyEvents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const GLOBAL_INDICES = [
    { name: 'S&P 500', value: '5,137.08', change: '+0.80%' },
    { name: 'Nasdaq', value: '16,274.94', change: '+1.14%' },
    { name: 'Dow Jones', value: '39,087.38', change: '+0.23%' },
    { name: 'Nikkei 225', value: '39,910.82', change: '+1.90%' },
    { name: 'FTSE 100', value: '7,682.50', change: '+0.69%' },
    { name: 'SSE Comp', value: '3,027.02', change: '+0.39%' },
    { name: 'DAX', value: '17,735.07', change: '+0.32%' },
    { name: 'Hang Seng', value: '16,589.44', change: '+0.47%' }
  ];

  const handleSectorClick = (sector: typeof SECTORS[0]) => {
    setSelectedSector(sector);
    setViewMode('industry');
  };

  const getIndustryMockData = (sectorId: string) => {
    const defaultStocks = [
      { ticker: 'AAPL', name: 'Apple Inc.', change: '+1.2%', weight: '21.4%', price: '$189.45', marketCap: '$2.94T', peRatio: '28.4' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', change: '+0.8%', weight: '19.8%', price: '$415.50', marketCap: '$3.08T', peRatio: '35.2' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', change: '+3.4%', weight: '12.1%', price: '$822.79', marketCap: '$2.05T', peRatio: '72.8' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', change: '-0.2%', weight: '8.5%', price: '$142.65', marketCap: '$1.79T', peRatio: '24.1' },
      { ticker: 'META', name: 'Meta Platforms', change: '+1.5%', weight: '6.2%', price: '$502.30', marketCap: '$1.28T', peRatio: '32.5' },
      { ticker: 'AVGO', name: 'Broadcom Inc.', change: '+2.1%', weight: '4.5%', price: '$1,305.20', marketCap: '$605.4B', peRatio: '45.2' },
      { ticker: 'TSLA', name: 'Tesla Inc.', change: '-1.4%', weight: '3.8%', price: '$175.22', marketCap: '$558.1B', peRatio: '42.1' },
      { ticker: 'AMD', name: 'Advanced Micro Devices', change: '+4.2%', weight: '3.1%', price: '$192.53', marketCap: '$311.2B', peRatio: '84.6' },
      { ticker: 'CRM', name: 'Salesforce Inc.', change: '+0.5%', weight: '2.4%', price: '$308.20', marketCap: '$298.4B', peRatio: '68.2' },
      { ticker: 'ADBE', name: 'Adobe Inc.', change: '-0.8%', weight: '1.9%', price: '$548.12', marketCap: '$246.5B', peRatio: '48.9' },
    ];

    if (sectorId === 'fin') {
      defaultStocks[0] = { ticker: 'JPM', name: 'JPMorgan Chase', change: '+0.5%', weight: '15.2%', price: '$188.22', marketCap: '$542.1B', peRatio: '11.8' };
      defaultStocks[1] = { ticker: 'V', name: 'Visa Inc.', change: '+0.9%', weight: '12.1%', price: '$282.15', marketCap: '$520.4B', peRatio: '31.5' };
      defaultStocks[2] = { ticker: 'MA', name: 'Mastercard', change: '+1.1%', weight: '10.5%', price: '$476.30', marketCap: '$442.1B', peRatio: '36.2' };
    } else if (sectorId === 'health') {
      defaultStocks[0] = { ticker: 'LLY', name: 'Eli Lilly', change: '+2.1%', weight: '14.5%', price: '$754.20', marketCap: '$716.4B', peRatio: '128.4' };
      defaultStocks[1] = { ticker: 'UNH', name: 'UnitedHealth Group', change: '-0.3%', weight: '11.8%', price: '$482.15', marketCap: '$446.2B', peRatio: '22.1' };
      defaultStocks[2] = { ticker: 'JNJ', name: 'Johnson & Johnson', change: '+0.1%', weight: '9.2%', price: '$158.40', marketCap: '$382.1B', peRatio: '14.5' };
    } else if (sectorId === 'energy') {
      defaultStocks[0] = { ticker: 'XOM', name: 'Exxon Mobil', change: '+1.5%', weight: '22.4%', price: '$112.30', marketCap: '$445.2B', peRatio: '12.4' };
      defaultStocks[1] = { ticker: 'CVX', name: 'Chevron Corp.', change: '+0.8%', weight: '18.5%', price: '$155.12', marketCap: '$288.4B', peRatio: '11.9' };
      defaultStocks[2] = { ticker: 'COP', name: 'ConocoPhillips', change: '+2.3%', weight: '9.8%', price: '$118.45', marketCap: '$138.2B', peRatio: '13.1' };
    } else if (sectorId === 'consumer') {
      defaultStocks[0] = { ticker: 'AMZN', name: 'Amazon.com Inc.', change: '+1.8%', weight: '24.5%', price: '$178.22', marketCap: '$1.85T', peRatio: '61.2' };
      defaultStocks[1] = { ticker: 'TSLA', name: 'Tesla Inc.', change: '-1.4%', weight: '14.2%', price: '$175.22', marketCap: '$558.1B', peRatio: '42.1' };
      defaultStocks[2] = { ticker: 'HD', name: 'Home Depot', change: '+0.5%', weight: '8.4%', price: '$378.15', marketCap: '$374.2B', peRatio: '24.5' };
    } else if (sectorId === 'esg') {
      defaultStocks[0] = { ticker: 'NEE', name: 'NextEra Energy', change: '+2.5%', weight: '18.4%', price: '$58.20', marketCap: '$118.4B', peRatio: '16.2' };
      defaultStocks[1] = { ticker: 'ENPH', name: 'Enphase Energy', change: '+5.2%', weight: '12.1%', price: '$122.15', marketCap: '$16.4B', peRatio: '28.4' };
      defaultStocks[2] = { ticker: 'FSLR', name: 'First Solar', change: '+4.1%', weight: '9.5%', price: '$155.40', marketCap: '$16.2B', peRatio: '21.5' };
    }

    const newsMap: Record<string, { source: string; time: string; title: string; categories: string[] }[]> = {
      tech: [
        { source: 'AI Pulse', time: '1h ago', title: 'Nvidia H200 shipments accelerate, infrastructure cycle peak delayed to 2026.', categories: ['AI', 'Semis'] },
        { source: 'Cloud Monitor', time: '3h ago', title: 'Enterprise cloud spending exceeds forecasts as generative AI projects hit production.', categories: ['Cloud', 'Enterprise'] },
        { source: 'Edge Computing', time: '5h ago', title: 'Apple integrates on-device LLMs across M3/M4 lineup, boosting replacement cycle expectations.', categories: ['Consumer Tech', 'AI'] },
        { source: 'CyberWatch', time: '1d ago', title: 'Global cybersecurity incident volume surges; vendor consolidation benefits Top 3 players.', categories: ['Security', 'SaaS'] },
        { source: 'Semi Daily', time: '1d ago', title: 'TSMC reports 95% utilization for 3nm nodes; supply constraints to persist through Q3.', categories: ['Semis', 'Supply Chain'] },
        { source: 'Regulation Insight', time: '2d ago', title: 'EU Data Act implementation reaches final phase: Impact analysis for US Hyperscalers.', categories: ['Policy', 'Big Tech'] },
        { source: 'NextGen HW', time: '2d ago', title: 'Solid-state battery breakthroughs by key startups threaten traditional EV supply dominance.', categories: ['Hardware', 'EVs'] },
        { source: 'Software Signal', time: '3d ago', title: 'Consumption-based pricing models gain favor as SaaS churn stabilizes post-2023 highs.', categories: ['SaaS', 'Revenue Models'] },
        { source: 'Web3 Monitor', time: '4d ago', title: 'Institutional adoption of decentralized infra (DePIN) doubles in trailing 6 months.', categories: ['Web3', 'Infrastructure'] },
        { source: 'Macro Tech', time: '5d ago', title: 'Capital intensive nature of AI clusters driving significant shifts in tech debt structures.', categories: ['Finance', 'Capex'] },
      ],
      fin: [
        { source: 'Fed Watcher', time: '1h ago', title: 'Dot plot suggests higher-for-longer regime; NIM expansion potential for regional banks.', categories: ['Rates', 'NIM'] },
        { source: 'Credit Risk', time: '3h ago', title: 'Commercial real estate exposure stress-tested; larger banks show robust capital buffers.', categories: ['CRE', 'Stability'] },
        { source: 'FinTech Pulse', time: '6h ago', title: 'Real-time payment adoption acceleration disrupts traditional interchange revenue models.', categories: ['Payments', 'Disruption'] },
        { source: 'Wealth Management', time: '1d ago', title: 'Net new asset inflows surge into high-yield alternatives as market volatility returns.', categories: ['AUM', 'Flows'] },
        { source: 'Insurance Intel', time: '1d ago', title: 'Climate-related premium adjustments hit profitability limits in coastal territories.', categories: ['Insurance', 'Climate'] },
        { source: 'M&A Signal', time: '2d ago', title: 'Consolidation in the regional banking space picks up as regulatory costs mount.', categories: ['Consolidation', 'Policy'] },
        { source: 'Consumer Credit', time: '2d ago', title: 'Delinquency rates for mid-to-low Tier subprime segments reach 5-year highs.', categories: ['Credit', 'Retail'] },
        { source: 'Digital Assets', time: '3d ago', title: 'ETF-driven institutional flows stabilize BTC/ETH correlations with traditional equity.', categories: ['Wealth', 'ETFs'] },
        { source: 'Equity Research', time: '4d ago', title: 'Investment banking pipelines show strongest revival since 2021 as IPO markets thaw.', categories: ['IB', 'Capital Markets'] },
        { source: 'Compliance Daily', time: '5d ago', title: 'Anti-money laundering fines reach record totals in 2024; operational risk stays high.', categories: ['Risk', 'Regulation'] },
      ],
      health: [
        { source: 'Biotech Bio', time: '2h ago', title: 'FDA accelerated approval for novel GLP-1 variations triggers sector-wide rerating.', categories: ['FDA', 'Pharma'] },
        { source: 'Genomics Hub', time: '4h ago', title: 'CRISPR therapy costs projected to fall 40% with automated manufacturing integration.', categories: ['Genomics', 'Manufacturing'] },
        { source: 'Pharma Daily', time: '7h ago', title: 'Medicare drug price negotiation results: Top 5 impacts on oncology pipelines.', categories: ['Policy', 'Oncology'] },
        { source: 'HealthTech News', time: '1d ago', title: 'Hospital systems report record labor shortages driving telehealth platform adoption.', categories: ['Digital Health', 'Macro'] },
        { source: 'Patent Watch', time: '1d ago', title: 'Upcoming 2025 patent cliffs: Analyzing the generic entry threat for multi-blockbuster drugs.', categories: ['Patents', 'Generics'] },
        { source: 'Clinical Trials', time: '2d ago', title: 'Phase III data failure in Alzheimer’s candidate sends ripples through mid-cap biotech.', categories: ['R&D', 'Trials'] },
        { source: 'Medical Devices', time: '2d ago', title: 'Supply chain stabilization leads to inventory restocking in orthopedic hardware.', categories: ['Devices', 'Supplies'] },
        { source: 'Global Health', time: '3d ago', title: 'Emerging market expansion strategies: Focus on specialized diagnostic centers.', categories: ['Diagnostics', 'Expansion'] },
        { source: 'Bio-Investment', time: '4d ago', title: 'VC funding for early-stage longevity research reaches $4B in YTD 2024.', categories: ['VC', 'Longevity'] },
        { source: 'Reg Tracker', time: '5d ago', title: 'Revised labeling requirements for biologics: Cost implications for manufacturers.', categories: ['Regulation', 'Biologics'] },
      ],
      energy: [
        { source: 'OPEC Watch', time: '1h ago', title: 'OPEC+ meeting confirms production cut extensions; market balance tightens for Q3.', categories: ['Supply', 'Geopolitics'] },
        { source: 'Shale Signal', time: '4h ago', title: 'Permian Basin efficiency gains offset higher service costs; production hit record highs.', categories: ['Permian', 'E&P'] },
        { source: 'LNG Tracker', time: '6h ago', title: 'US LNG export terminals face regulatory halt: Long-term pricing implications for EU.', categories: ['LNG', 'Policy'] },
        { source: 'Refining Daily', time: '1d ago', title: 'Complex crack spreads normalize as global refining capacity additions come online.', categories: ['Downstream', 'Refining'] },
        { source: 'Energy Macro', time: '1d ago', title: 'Strategic Petroleum Reserve (SPR) refill schedule announced: Support for WTI floor.', categories: ['Macro', 'Oil'] },
        { source: 'Grid Intelligence', time: '2d ago', title: 'Aging transmission infrastructure becomes a bottleneck for upstream gas projects.', categories: ['Infra', 'Gas'] },
        { source: 'O&G Services', time: '2d ago', title: 'Offshore rig utilization rates hit multi-year cycle highs; day rates surge 15%.', categories: ['Offshore', 'Services'] },
        { source: 'Renewable Hybrid', time: '3d ago', title: 'Major integrated oils pivot back to core hydrocarbon assets for higher ROE.', categories: ['Strategy', 'Energy Mix'] },
        { source: 'Carbon Focus', time: '4d ago', title: 'Carbon capture and sequestration (CCS) tax credit clarity drives industrial FID.', categories: ['CCS', 'Climate'] },
        { source: 'Global Geostrategy', time: '5d ago', title: 'Middle East geopolitical risk premium remains elevated amid maritime disruptions.', categories: ['Geopolitics', 'Risk'] },
      ],
      consumer: [
        { source: 'Retail Round', time: '2h ago', title: 'E-commerce penetration reaches new plateau; focus shifts to logistics efficiency.', categories: ['Retail', 'Logistics'] },
        { source: 'Auto Insight', time: '5h ago', title: 'EV inventory build-up leads to aggressive price wars among legacy manufacturers.', categories: ['Auto', 'Pricing'] },
        { source: 'Spending Signal', time: '8h ago', title: 'Luxury segment shows resilience while mid-tier consumer shifts to value brands.', categories: ['Consumer', 'Luxury'] },
        { source: 'Supply Chain Daily', time: '1d ago', title: 'Panama Canal drought easing, reducing transit lead times for seasonal goods.', categories: ['Supply Chain', 'Global'] },
        { source: 'Food & Bev', time: '1d ago', title: 'Commodity price deflation in coffee/cocoa provides margin tailwind for CPG giants.', categories: ['CPG', 'Margins'] },
        { source: 'Ad Market Monitor', time: '2d ago', title: 'Digital ad spend forecasts revised upward driven by retail media networks.', categories: ['Ads', 'Media'] },
        { source: 'Housing Hub', time: '2d ago', title: 'Home improvement projects rebound as lock-in effect for mortgages stabilizes.', categories: ['Durable Goods', 'Housing'] },
        { source: 'Global Consumer', time: '3d ago', title: 'China domestic consumption recovery remains tepid despite stimulus measures.', categories: ['China', 'Macro'] },
        { source: 'Brands Weekly', time: '4d ago', title: 'Sustainability certifications become a table-stake differentiator for Gen Z.', categories: ['ESG', 'Direct-to-Consumer'] },
        { source: 'Travel Pulse', time: '5d ago', title: 'International air travel demand exceeds 2019 levels; premium cabins outperform.', categories: ['Travel', 'Services'] },
      ],
      esg: [
        { source: 'Solar Signal', time: '2h ago', title: 'Solar module prices hit record lows as oversupply from SE Asia persists.', categories: ['Solar', 'Pricing'] },
        { source: 'Wind Watch', time: '5h ago', title: 'Offshore wind lease auctions see renewed interest following revised subsidy terms.', categories: ['Wind', 'Subsidies'] },
        { source: 'Battery Bio', time: '8h ago', title: 'LFP battery chemistry gains market share over NCM in utility-scale storage.', categories: ['Storage', 'Battery'] },
        { source: 'Climate Policy', time: '1d ago', title: 'Green Hydrogen tax credits (45V) guidance finalized: Massive CAPEX unlocked.', categories: ['Hydrogen', 'Policy'] },
        { source: 'ESG Flows', time: '1d ago', title: 'Anti-ESG sentiment leads to fund rebranding, but actual divestment remains minimal.', categories: ['Finance', 'ESG'] },
        { source: 'EV Infra', time: '2d ago', title: 'National Electric Vehicle Infrastructure (NEVI) funding rollout reaches 10 states.', categories: ['EV Infra', 'Public Policy'] },
        { source: 'Rare Earth Daily', time: '2d ago', title: 'Alternative magnet technologies reduce reliance on critical mineral imports.', categories: ['Resources', 'Supply Chain'] },
        { source: 'Circular Econ', time: '3d ago', title: 'Plastic recycling mandates in EU drive huge investment in chemical recycling.', categories: ['Recycling', 'Industry'] },
        { source: 'Grid Tech', time: '4d ago', title: 'Virtual Power Plants (VPPs) transition from pilot to regional grid operator tools.', categories: ['Grid', 'VPP'] },
        { source: 'Biofuel Monitor', time: '5d ago', title: 'Sustainable Aviation Fuel (SAF) mandates create floor for feedstock pricing.', categories: ['Biofuels', 'AgriTech'] },
      ]
    };

    const news = newsMap[sectorId] || newsMap.tech;
    return { stocks: defaultStocks, news };
  };

  const handleDateSelect = async (date: string) => {
    if (selectedDate === date) return;

    setSelectedDate(date);
    setDateAnalysis(null);
    setActiveEventCategory(null);

    try {
      const res = await fetch(`/api/analyze-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ticker })
      });
      const data = await res.json();
      setDateAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  };

  // AI Sales Copilot Streaming Function
  const generateCopilotContent = async (type: 'pitch' | 'objection' | 'analyst_report', audience?: 'Hedge Fund' | 'Long-Only') => {
    setIsGeneratingCopilot(true);
    setCopilotContent('');
    setActiveTab('📋 Overview');

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, type, audience })
      });

      if (!response.body) throw new Error('ReadableStream processing failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setCopilotContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error('Error streaming copilot content:', error);
      setCopilotContent('Failed to generate insights. Please try again.');
    } finally {
      setIsGeneratingCopilot(false);
    }
  };

  const totalWeight = portfolioHoldings.reduce((acc, h) => acc + h.weight, 0) || 1;
  const getSectorForTicker = (ticker: string) => {
    for (const sector of SECTORS) {
      if (sector.ticker === ticker) return sector.name;
      for (const industry of sector.industries) {
        if (industry.stocks && industry.stocks.includes(ticker)) return sector.name;
      }
    }
    if (['AMZN', 'TSLA', 'HD'].includes(ticker)) return 'Consumer';
    if (['XOM', 'CVX', 'COP'].includes(ticker)) return 'Energy';
    if (['NEE', 'ENPH', 'FSLR'].includes(ticker)) return 'Clean Energy';
    if (['JPM', 'V', 'MA'].includes(ticker)) return 'Financials';
    if (['LLY', 'UNH', 'JNJ'].includes(ticker)) return 'Healthcare';
    return 'Other';
  };

  const sectorWeights: Record<string, number> = {};
  portfolioHoldings.forEach((h: any) => {
    const sector = getSectorForTicker(h.ticker);
    sectorWeights[sector] = (sectorWeights[sector] || 0) + h.weight;
  });

  const dominantSector = Object.keys(sectorWeights).length > 0
    ? Object.keys(sectorWeights).reduce((a, b) => sectorWeights[a] > sectorWeights[b] ? a : b)
    : 'None';
  const dominantWeight = sectorWeights[dominantSector] || 0;

  const getMockBeta = (ticker: string) => {
    const s = getSectorForTicker(ticker);
    if (s === 'Technology') return 1.3;
    if (s === 'Consumer') return 1.2;
    if (s === 'Financials') return 1.1;
    if (s === 'Healthcare') return 0.8;
    if (s === 'Energy') return 0.9;
    if (s === 'Clean Energy') return 1.4;
    return 1.0;
  };

  const portfolioBeta = portfolioHoldings.length > 0
    ? portfolioHoldings.reduce((acc, h) => acc + (getMockBeta(h.ticker) * (h.weight / totalWeight)), 0)
    : 1.0;

  const aiInsightText = dominantWeight > 50
    ? `Based on your current allocation, your portfolio has a high concentration in **${dominantSector} (${dominantWeight}% absolute weight)**. While this can drive returns, it increases specific sector risk.`
    : portfolioHoldings.length === 0
      ? "Add assets to your portfolio to generate AI-driven allocation insights and risk metrics."
      : `Your portfolio shows a balanced diversification with the highest weight in **${dominantSector} (${dominantWeight}% absolute weight)**. Sector concentration risk remains moderate.`;

  const aiRecommendationText = portfolioBeta > 1.1
    ? `Consider rebalancing to include more **Defensive (Healthcare/Energy)** sectors to lower your overall Portfolio Beta which is currently elevated at **${portfolioBeta.toFixed(2)}**.`
    : portfolioBeta < 0.9
      ? `Your portfolio is highly defensive with a Beta of **${portfolioBeta.toFixed(2)}**. You may underperform in strong bull markets. Consider adding **Technology** exposure.`
      : `Your portfolio risk is well-balanced with a Beta of **${portfolioBeta.toFixed(2)}**. Maintain current strategic allocations.`;

  return (
    <div className="flex h-screen w-screen bg-[#0a0e17] text-gray-100 overflow-hidden font-sans">

      {/* LEFT SIDEBAR (Legacy Auth & Nav retained) */}
      <aside className="w-64 border-r border-[#ffffff0a] bg-[#0a0e17] flex flex-col hide-scrollbar shrink-0 shadow-xl z-10" style={{ backdropFilter: 'blur(20px)' }}>
        <div className="p-6 flex items-center gap-3 font-semibold text-lg tracking-tight mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            AI
          </div>
          AlphaTerminal
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1">
          <button
            onClick={() => setViewMode('sectors')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${viewMode === 'sectors' || viewMode === 'industry' || viewMode === 'stock' ? 'bg-[#ffffff0a] text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-[#ffffff05]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            Event Dashboard
          </button>
          <button
            onClick={() => setViewMode('markets')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${viewMode === 'markets' ? 'bg-[#ffffff0a] text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-[#ffffff05]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            Markets
          </button>
          <button
            onClick={() => setViewMode('portfolio')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${viewMode === 'portfolio' ? 'bg-[#ffffff0a] text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200 hover:bg-[#ffffff05]'}`}
          >
            <Briefcase size={18} />
            My Portfolio
          </button>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#ffffff05] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-[#ffffff0a]">
          {loading ? (
            <div className="text-gray-400 text-sm">Loading auth...</div>
          ) : user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-gray-700" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate">{user.displayName}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </div>
              </div>
              <button onClick={() => logout()} className="w-full py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:text-white text-gray-400 rounded-lg text-sm transition font-medium">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => signInWithGoogle()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
              Sign In with Google
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0e17] overflow-y-auto">

        {viewMode === 'sectors' ? (
          <div className="flex flex-col w-full h-full relative z-0">
            {/* Global Indices Ticker */}
            <div className="w-full bg-[#0a0e17] border-b border-[#ffffff0a] py-2 overflow-hidden flex whitespace-nowrap sticky top-0 z-20 shrink-0 shadow-lg">
              <div className="animate-ticker flex gap-12 px-6">
                {[...GLOBAL_INDICES, ...GLOBAL_INDICES, ...GLOBAL_INDICES].map((idx, i) => (
                  <div key={i} className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-400 text-sm font-semibold tracking-wide">{idx.name}</span>
                    <span className="text-gray-200 font-mono text-sm">{idx.value}</span>
                    <span className={`text-sm font-mono font-bold ${idx.change.startsWith('+') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]'}`}>
                      {idx.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTORS GRID VIEW */}
            <div className="p-10 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100vh-45px)] ambient-glow-bg z-10 shrink-0">
              <div className="text-center mb-12 space-y-4 relative z-10">
                <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold tracking-[0.2em] mb-3 uppercase shadow-[0_0_15px_rgba(59,130,246,0.3)]">Market Intelligence</div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gradient-primary drop-shadow-2xl">
                  Select Industry Sector
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg pt-2 leading-relaxed">
                  Explore predictive AI models, historical patterns, and real-time news impact customized for specific market domains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative z-10">
                {SECTORS.map((sector) => {
                  const Icon = sector.icon;
                  const isPositive = sector.trend.startsWith('+');
                  return (
                    <button
                      key={sector.id}
                      onClick={() => handleSectorClick(sector)}
                      className="group relative glass-premium p-6 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 text-left flex flex-col overflow-hidden"
                    >
                      {/* Hover Gradient Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#ffffff0a] border border-[#ffffff1a] flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all duration-300">
                          <Icon size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className={`text-sm font-semibold font-mono px-2 py-1 rounded border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {sector.trend}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-200 mb-2 group-hover:text-white transition-colors">{sector.name}</h3>
                      <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{sector.desc}</p>

                      <div className="mt-auto flex items-center gap-2 text-xs font-mono text-gray-400">
                        <span className="uppercase py-1 px-2 bg-black/40 rounded border border-gray-800">Ticker: {sector.ticker}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : viewMode === 'industry' && selectedSector ? (
          /* INDUSTRY DRILL-DOWN VIEW */
          <div className="flex flex-col h-full w-full bg-[#0a0e17] overflow-y-auto">
            <header className="h-20 shrink-0 border-b border-[#ffffff0a] flex items-center px-8 bg-[#0a0e17]/80 backdrop-blur-2xl z-20 sticky top-0 shadow-2xl">
              <button
                onClick={() => setViewMode('sectors')}
                className="px-4 py-2 bg-[#ffffff0a] hover:bg-[#ffffff15] border border-gray-800 rounded-xl text-sm text-gray-300 transition-all flex items-center gap-2 group shadow-lg"
              >
                <ArrowLeft size={16} className="text-gray-500 group-hover:text-white transition" />
                Sectors
              </button>
              <div className="h-8 w-px bg-gray-800 mx-6"></div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <selectedSector.icon size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl text-white tracking-tight">{selectedSector.name} Industry</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{selectedSector.ticker} SECTOR ETF</span>
                    <span className={`text-xs font-bold font-mono ${selectedSector.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{selectedSector.trend} Today</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex-1 max-w-[1600px] mx-auto w-full p-8 flex gap-10">
              {/* Left Column: Top 10 Stocks */}
              <div className="flex-1 flex flex-col gap-8 min-w-0">
                <div className="flex items-end justify-between border-b border-gray-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">Top Constituents</h2>
                    <p className="text-sm text-gray-500">Leading entities in the {selectedSector.name} segment by index weight.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500/50"></div> ADVANCING</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/50"></div> DECLINING</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {getIndustryMockData(selectedSector.id).stocks.map((stock: any, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setTicker(stock.ticker);
                        setViewMode('stock');
                      }}
                      role="button"
                      tabIndex={0}
                      className="glass-premium p-5 flex items-center justify-between hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all group relative overflow-hidden active:scale-[0.99] duration-300 cursor-pointer"
                    >
                      {/* Subtle Background Glow on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                      <div className="flex items-center gap-6 relative z-10 w-1/3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#111827] to-[#0a0e17] border border-gray-800 flex items-center justify-center font-black text-lg text-gray-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all shadow-inner">
                          {stock.ticker.charAt(0)}
                        </div>
                        <div className="text-left min-w-0">
                          <div className="text-base font-black text-gray-100 group-hover:text-white transition-colors truncate">{stock.ticker}</div>
                          <div className="text-xs text-gray-500 truncate font-medium group-hover:text-gray-400 transition-colors">{stock.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-1 gap-8 px-8 relative z-10">
                        <div className="text-center w-24">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 opacity-60">Price</div>
                          <div className="text-sm font-mono text-gray-100 font-bold">{stock.price}</div>
                        </div>
                        <div className="text-center w-24">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 opacity-60">Mkt Cap</div>
                          <div className="text-sm font-mono text-gray-100 font-bold">{stock.marketCap}</div>
                        </div>
                        <div className="text-center w-16">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 opacity-60">P/E</div>
                          <div className="text-sm font-mono text-gray-100 font-bold">{stock.peRatio}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 relative z-10 w-1/4 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPortfolio(stock.ticker, stock.name, parseFloat(stock.price.replace(/[^0-9.-]+/g, "")));
                          }}
                          className={`p-2 rounded-lg border transition-all ${portfolioHoldings.some(h => h.ticker === stock.ticker)
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10'
                            }`}
                        >
                          <Briefcase size={16} />
                        </button>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 opacity-60">Weight</div>
                          <div className="text-sm font-mono text-blue-400/80 font-black">{stock.weight}</div>
                        </div>
                        <div className="text-right w-20">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 opacity-60">Session</div>
                          <div className={`text-base font-mono font-black ${stock.change.startsWith('+') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]'}`}>
                            {stock.change}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Macro Catalysts */}
              <div className="w-[450px] shrink-0 flex flex-col gap-6">
                <div className="glass-premium p-8 flex flex-col h-full rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
                  {/* Background Ambient Glow */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full"></div>

                  <div className="flex flex-col gap-3 mb-8 pb-8 border-b border-[#ffffff0a] relative z-10">
                    <div className="flex items-center gap-2">
                      <Activity size={18} className="text-blue-500" />
                      <h2 className="text-xl font-black text-white tracking-tight uppercase">Macro Catalysts</h2>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                      AI-aggregated events expected to drive {selectedSector.name} volatility over the next 3-6 months.
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                    {getIndustryMockData(selectedSector.id).news.map((item: any, i: number) => (
                      <div key={i} className="flex gap-5 group/news">
                        <div className="relative pt-1.5 shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500/40 group-hover/news:scale-125 group-hover/news:bg-blue-500 transition-all duration-300"></div>
                          {i < getIndustryMockData(selectedSector.id).news.length - 1 && (
                            <div className="absolute top-5 left-1 w-[1px] h-[calc(100%+8px)] bg-gradient-to-b from-blue-500/20 via-blue-500/5 to-transparent"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.source}</span>
                            <span className="text-[10px] text-gray-600 font-mono font-bold">{item.time}</span>
                          </div>
                          <div className="text-[15px] text-gray-200 font-bold leading-snug mb-3 py-1 px-2 -ml-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 group-hover/news:text-white transition-all cursor-pointer">
                            {item.title}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.categories.map((cat: string, idx: number) => (
                              <span key={idx} className="text-[9px] font-bold bg-[#ffffff08] text-gray-500 px-2 py-0.5 rounded-md border border-gray-800 uppercase tracking-tighter hover:text-blue-400 hover:border-blue-500/30 transition-colors">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] relative z-10">
                    Full AI Sector Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'markets' ? (
          /* MARKETS VIEW */
          <div className="flex flex-col h-screen p-8 overflow-y-auto ambient-glow-bg">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <Activity size={32} className="text-blue-500" />
                    Market Risk Intelligence
                  </h1>
                  <p className="text-gray-400 mt-2 font-medium">Macro risk indicators, correlation analysis, and VaR stress testing.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Robust</span>
                  </div>
                </div>
              </div>

              {/* 6 Key Indicators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RISK_INDICATORS.map((indicator, i) => (
                  <div key={i} className="glass-premium p-6 rounded-[2rem] border-white/5 relative group hover:border-blue-500/30 transition-all flex flex-col justify-between overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 blur-[40px] group-hover:bg-blue-500/10 transition-all"></div>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{indicator.description}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${indicator.status === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                          indicator.status === 'Bearish' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>{indicator.status}</span>
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">{indicator.name}</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-mono font-black text-white">{indicator.value}</span>
                        <span className={`text-sm font-bold ${indicator.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{indicator.change}</span>
                      </div>

                      {/* Trend Sparkline */}
                      <div className="mb-4 bg-white/5 rounded-xl p-2 border border-white/5">
                        <RiskSparkline data={indicator.trendData} color={indicator.status === 'Bullish' ? '#10b981' : indicator.status === 'Bearish' ? '#ef4444' : '#3b82f6'} />
                      </div>
                    </div>
                    <div className="mt-2 pt-4 border-t border-white/5">
                      <div className="flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                        <Cpu size={14} className="text-blue-500 mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-gray-400 italic">"{indicator.insight}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LIVE MARKET NEWS SECTION */}
              <div className="glass-premium p-8 rounded-[2.5rem] border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                      <Activity size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Geopolitical Analysis</h2>
                  </div>
                  <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">3 Relevant Articles per Section</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-4">Global Risk Factor</h4>
                    {MARKET_RISK_NEWS.map((news, i) => (
                      <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group shadow-lg">
                        <div className="text-sm font-bold text-gray-200 group-hover:text-blue-400 line-clamp-3 mb-3 leading-relaxed">{news.title}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{news.source}</div>
                          <div className="text-[10px] text-blue-500/70 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Read Analysis →</div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-4">Correlation Analysis</h4>
                    {CORRELATION_NEWS.map((news, i) => (
                      <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group shadow-lg">
                        <div className="text-sm font-bold text-gray-200 group-hover:text-purple-400 line-clamp-3 mb-3 leading-relaxed">{news.title}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{news.source}</div>
                          <div className="text-[10px] text-purple-500/70 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Read Analysis →</div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-4">Tail-Risk Research</h4>
                    {VAR_NEWS.map((news, i) => (
                      <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all group shadow-lg">
                        <div className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 line-clamp-3 mb-3 leading-relaxed">{news.title}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{news.source}</div>
                          <div className="text-[10px] text-emerald-500/70 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Read Analysis →</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Research Sections: Correlation & VaR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Correlation Matrix */}
                <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 blur-[60px]"></div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <TrendingUp size={20} />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Correlation Matrix Analysis</h2>
                  </div>

                  <div className="mb-8 p-4 bg-black/40 border border-white/5 rounded-[2rem]">
                    <CorrelationHeatmap data={CORRELATION_DATA} />
                  </div>

                  <div className="p-5 bg-purple-500/5 rounded-2xl border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1 bg-purple-500/20 rounded text-purple-400"><Activity size={12} /></span>
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">StockLens Risk Intelligence</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Extreme positive correlation (94%) detected between Nasdaq and S&P 500, indicating high systemic concentration in Tech. Portfolio diversification benefit is currently low.
                    </p>
                  </div>
                </div>

                {/* VaR Analysis */}
                <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 blur-[60px]"></div>
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <ShieldAlert size={20} />
                      </div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight">VaR Research & Stress Test</h2>
                    </div>

                    <div className="bg-black/40 border border-white/10 p-6 rounded-3xl mb-6 relative overflow-hidden">
                      <VaRDistribution
                        confidence={VAR_SCENARIOS[activeStressIndex].description.includes('99%') ? 99 : 95}
                        varValue={VAR_SCENARIOS[activeStressIndex].currentVaR}
                        expectedShortfall={VAR_SCENARIOS[activeStressIndex].expectedShortfall}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-1">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Stress Scenarios</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {VAR_SCENARIOS.map((scenario, index) => (
                          <button
                            key={scenario.id}
                            onClick={() => setActiveStressIndex(index)}
                            className={`px-4 py-3 rounded-xl border text-left transition-all flex justify-between items-center ${activeStressIndex === index
                              ? 'bg-red-500/10 border-red-500/30 ring-1 ring-red-500/50'
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                          >
                            <div className={`text-sm font-bold ${activeStressIndex === index ? 'text-white' : 'text-gray-400'}`}>
                              {scenario.stressScenario}
                            </div>
                            <div className={`text-sm font-black ${activeStressIndex === index ? 'text-red-500 shadow-sm' : 'text-gray-500'}`}>
                              EST. LOSS: {scenario.estimatedLoss}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="p-1 bg-emerald-500/20 rounded text-emerald-400"><Activity size={12} /></span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">VaR Intelligence Report</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed font-medium mb-4">
                        {VAR_SCENARIOS[activeStressIndex].riskSummary}
                      </p>
                      <div className="pt-4 border-t border-white/10">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Recommendation</span>
                        <p className="text-xs text-emerald-400 font-bold italic">"{VAR_SCENARIOS[activeStressIndex].recommendation}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Macro News Hub */}
              <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden mb-12">
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 blur-[80px]"></div>
                <MacroNewsHub />
              </div>
            </div>
          </div>
        ) : viewMode === 'portfolio' ? (
          /* PORTFOLIO VIEW */
          <div className="flex flex-col h-screen p-8 overflow-y-auto ambient-glow-bg">
            <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <Briefcase size={32} className="text-blue-500" />
                    Portfolio Strategy
                  </h1>
                  <p className="text-gray-400 mt-2 font-medium">Build your custom allocation and simulate risk-adjusted returns.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Watchlist & Weights */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="glass-premium rounded-[2.5rem] border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-xl text-white tracking-tight">Active Holdings ({portfolioHoldings.length})</h2>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/10">
                          Total Weight: <span className={portfolioHoldings.reduce((acc, h) => acc + h.weight, 0) === 100 ? 'text-emerald-400' : 'text-orange-400'}>{portfolioHoldings.reduce((acc, h) => acc + h.weight, 0)}%</span>
                        </div>
                      </div>

                      {/* Simulated Portfolios */}
                      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-black/20 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu size={14} className="text-blue-500" />
                          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Simulated Portfolios (模拟仓)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button onClick={() => applyModelPortfolio(AGGRESSIVE_GROWTH_PORTFOLIO)} className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left group">
                            <span className="block text-sm font-bold text-white group-hover:text-blue-400">Aggressive Growth</span>
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-1 hidden lg:block">High Beta AI & Semi</span>
                          </button>
                          <button onClick={() => applyModelPortfolio(GROWTH_PORTFOLIO)} className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left group">
                            <span className="block text-sm font-bold text-white group-hover:text-blue-400">Growth</span>
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-1 hidden lg:block">Stable Large-Cap Tech</span>
                          </button>
                          <button onClick={() => applyModelPortfolio(BALANCED_PORTFOLIO)} className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left group">
                            <span className="block text-sm font-bold text-white group-hover:text-blue-400">Balanced</span>
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-1 hidden lg:block">Diversified Blue Chip</span>
                          </button>
                        </div>
                      </div>

                    </div>
                    <div className="p-6 flex flex-col gap-4">
                      {portfolioHoldings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 italic">No holdings yet. Add stocks from the dashboard or industry lists.</div>
                      ) : (
                        portfolioHoldings.map((stock) => (
                          <div key={stock.ticker} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group overflow-hidden relative">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/10"
                                  style={{ backgroundColor: stock.color }}
                                >
                                  {stock.ticker.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors uppercase">{stock.ticker}</h3>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stock.name} • ${stock.price.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className={`text-sm font-mono font-black ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                                </div>
                                <button
                                  onClick={() => removeFromPortfolio(stock.ticker)}
                                  className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Activity size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Rebalance Weight</span>
                                <span className="text-sm font-mono text-white font-bold">
                                  {stock.weight}% <span className="text-gray-500 font-medium ml-1 text-xs">• ${(1000000 * (stock.weight / 100)).toLocaleString()}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => updateHoldingWeight(stock.ticker, Math.max(0, stock.weight - 5))}
                                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all font-bold"
                                >
                                  -
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={stock.weight}
                                  onChange={(e) => updateHoldingWeight(stock.ticker, parseInt(e.target.value))}
                                  className="w-full accent-blue-500 h-1 appearance-none bg-white/10 rounded-full outline-none focus:bg-white/20 transition-all cursor-pointer"
                                />
                                <button
                                  onClick={() => updateHoldingWeight(stock.ticker, Math.min(100, stock.weight + 5))}
                                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Portfolio Insight Report */}
                  <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 bg-blue-600/5 relative overflow-hidden">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <Cpu size={20} className="text-blue-500" />
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">AI Portfolio Intelligence</h2>
                    </div>
                    <div className="space-y-4 relative z-10">
                      <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        {aiInsightText.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
                      </p>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest block mb-2">Optimizer Recommendation</span>
                        <p className="text-xs text-gray-400 font-bold italic">
                          {aiRecommendationText.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allocation Summary & Visualization */}
                <div className="flex flex-col gap-6">
                  <div className="glass-premium p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden h-fit sticky top-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full"></div>

                    <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8">Strategy Analytics</h2>

                    <div className="flex flex-col gap-6 mb-8">
                      <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem]">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Portfolio Holdings</div>
                        <div className="text-3xl font-mono text-white font-black">
                          {portfolioHoldings.length > 0 ? `${portfolioHoldings.length} Positions` : '—'}
                        </div>
                        {(() => {
                          if (portfolioHoldings.length === 0) return null;
                          const totalWeight = portfolioHoldings.reduce((sum, h) => sum + (h.weight || 0), 0);
                          const weightedReturn = totalWeight > 0
                            ? portfolioHoldings.reduce((sum, h) => sum + ((h.change || 0) * (h.weight || 0) / totalWeight), 0)
                            : portfolioHoldings.reduce((sum, h) => sum + (h.change || 0), 0) / portfolioHoldings.length;
                          const isPositive = weightedReturn >= 0;
                          return (
                            <div className={`text-xs font-bold mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}{weightedReturn.toFixed(2)}% Weighted Daily Return
                            </div>
                          );
                        })()}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                          <span className="text-gray-400 font-black uppercase tracking-tighter text-[10px]">Active Diversification</span>
                          <span className={`${portfolioHoldings.length > 3 ? 'text-emerald-400' : 'text-orange-400'} font-mono font-bold text-xs uppercase`}>
                            {portfolioHoldings.length > 3 ? 'Optimal' : 'Concentrated'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                          <span className="text-gray-400 font-black uppercase tracking-tighter text-[10px]">Projected Risk Score</span>
                          <span className="text-orange-400 font-mono font-bold text-xs uppercase">Medium (6.4)</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                          <span className="text-gray-400 font-black uppercase tracking-tighter text-[10px]">Alpha Potential</span>
                          <span className="text-blue-400 font-mono font-bold text-xs uppercase">High</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Allocation Mix</h3>
                      <div className="flex gap-1 h-4 rounded-full overflow-hidden border border-white/5 mb-6 bg-white/5 p-1">
                        {portfolioHoldings.map((h, i) => (
                          <div key={i} className="h-full rounded-sm transition-all" style={{ width: `${h.weight}%`, backgroundColor: h.color }}></div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-3">
                        {portfolioHoldings.map((h, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }}></div>
                              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">{h.ticker}</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 font-black">
                              {h.weight}% <span className="text-gray-600 font-bold ml-1">• ${(1000000 * (h.weight / 100)).toLocaleString()}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STOCKLENS DASHBOARD VIEW */
          <div className="flex flex-col h-screen ambient-glow-bg">
            {/* Dashboard Header */}
            <header className="h-16 shrink-0 border-b border-[#ffffff0a] flex items-center px-6 justify-between bg-[#0a0e17]/60 backdrop-blur-xl z-20 sticky top-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('sectors')}
                  className="px-3 py-1.5 bg-[#ffffff0a] hover:bg-[#ffffff15] border border-gray-800 rounded-lg text-sm text-gray-300 transition flex items-center gap-2 group"
                >
                  <ArrowLeft size={16} className="text-gray-500 group-hover:text-white transition" />
                  Sectors
                </button>

                <div className="h-6 w-px bg-gray-800 mx-2"></div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg bg-blue-600 px-2 py-0.5 rounded text-white tracking-tight">StockLens</span>
                  <div className="relative ml-2">
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchStockData(ticker);
                          e.currentTarget.blur();
                        }
                      }}
                      className="bg-[#ffffff08] border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-blue-500 focus:bg-[#ffffff0d] transition w-24 font-mono font-bold uppercase text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <button
                  onClick={() => {
                    const currentPrice = stockData && stockData.length > 0 ? stockData[stockData.length - 1].close : 150.00;
                    addToPortfolio(ticker, companyProfile?.name || ticker, currentPrice);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest ${portfolioHoldings.some(h => h.ticker === ticker)
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                    }`}
                >
                  <Briefcase size={12} />
                  {portfolioHoldings.some(h => h.ticker === ticker) ? 'In Portfolio' : 'Add to Portfolio'}
                </button>
                <div className="h-4 w-px bg-white/10 mx-1"></div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE EVENTS
                </div>
              </div>
            </header>

            {/* Top Half: Chart Area */}
            <div className="h-[55%] shrink-0 flex flex-col border-b border-[#ffffff0a] relative bg-[#0f1420]">
              {loadingData ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading historical data for {ticker}...</div>
              ) : (
                <TradingChart data={stockData} events={chartEvents} onDateSelect={handleDateSelect} />
              )}
            </div>

            {/* Bottom Half: StockLens Layout Splits */}
            <div className="flex-1 flex min-h-0">
              {/* Bottom Left: Events Grid & News List */}
              <div className="flex-1 right-border border-[#ffffff0a] p-4 flex flex-col bg-transparent overflow-y-auto relative z-10">
                <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">

                  {/* Thematic Tiles */}
                  {[
                    { id: 'Market Impact', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-[#1e2333]', border: 'border-blue-500/20' },
                    { id: 'Policy', icon: Landmark, color: 'text-amber-400', bg: 'bg-[#1e2333]', border: 'border-amber-500/20' },
                    { id: 'Earnings', icon: Banknote, color: 'text-emerald-400', bg: 'bg-[#1e2333]', border: 'border-emerald-500/20' },
                    { id: 'Product & Tech', icon: Zap, color: 'text-purple-400', bg: 'bg-[#1e2333]', border: 'border-purple-500/20' },
                    { id: 'Competition', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-[#2a1a20]', border: 'border-[#4a2a30]' },
                    { id: 'Management', icon: Users, color: 'text-sky-400', bg: 'bg-[#1e2333]', border: 'border-sky-500/20' },
                  ].map((theme, i) => {
                    const isActive = activeEventCategory === theme.id;
                    const catData = dateAnalysis?.eventCategories.find(c => c.category === theme.id);
                    const count = dateAnalysis ? (catData ? catData.count : 0) : (Math.floor(Math.random() * 500) + 100);

                    return (
                      <div
                        key={i}
                        onClick={() => setActiveEventCategory(isActive ? null : theme.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:brightness-110 transition-all ${isActive ? 'bg-[#ffffff15] border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : `${theme.border} ${theme.bg}`}`}
                      >
                        <theme.icon className={`${theme.color} ${isActive ? 'brightness-125 scale-110 transition-transform' : ''}`} size={20} />
                        <div>
                          <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>{theme.id}</div>
                          <div className={`text-xs font-mono animate-in fade-in ${isActive ? 'text-gray-300 font-bold' : 'text-gray-50'}`}>{dateAnalysis ? count : `${count}+`} docs</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4 shrink-0">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-bold text-white">News</h3>
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-mono">{selectedDate || 'SELECT DATE'}</span>
                    <span className="text-xs text-gray-500">{dateAnalysis ? `${dateAnalysis.eventCategories.reduce((acc, cat) => acc + cat.count, 0)} articles` : '0 articles'}</span>
                  </div>
                  <div className="text-xs text-cyan-500 border border-cyan-500/30 px-2 py-0.5 rounded">Locked</div>
                </div>

                {/* News Feed Pipeline */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {dateAnalysis ? (
                    (() => {
                      const filteredArticles = dateAnalysis.articles.filter(a => activeEventCategory ? a.categories.includes(activeEventCategory) : true);
                      if (filteredArticles.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <Activity size={32} className="mb-2 opacity-50" />
                            <span className="text-sm">No articles found for &quot;{activeEventCategory}&quot;.</span>
                            <button onClick={() => setActiveEventCategory(null)} className="mt-2 text-xs text-blue-500 hover:underline">Clear Filter</button>
                          </div>
                        );
                      }
                      return filteredArticles.map((article) => (
                        <a key={article.id} href={article.url} className="block glass-premium p-3 flex gap-4 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all group">
                          <div className="w-1.5 rounded bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
                          <div className="flex-1 py-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{article.source}</span>
                                <span className="text-[10px] text-gray-600">{article.time}</span>
                              </div>
                              <div className="text-sm text-gray-200 font-semibold leading-snug mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {article.title}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {article.categories.map((kw, idx) => (
                                <span key={idx} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </a>
                      ));
                    })()
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600">
                      <Activity size={32} className="mb-2 opacity-50" />
                      <span className="text-sm">Select a marker on the chart to view events</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Right: AI Forecast & Quantitative Matching */}
              <div className="w-[450px] shrink-0 glass-premium border-l border-[#ffffff0a] p-5 overflow-y-auto relative z-10 !border-t-0 !border-r-0 !border-b-0 rounded-none">
                <div className="mb-6 relative z-10 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase pl-1 border-l-2 border-blue-500">Company Analysis</h3>
                  <div className="flex bg-[#00000040] border border-[#ffffff10] rounded-xl p-1 overflow-x-auto hide-scrollbar touch-pan-x w-full">
                    {['📋 Overview', 'Fundamentals', 'Business & Mgmt', 'Comparables'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`text-xs px-3 py-2.5 rounded-lg whitespace-nowrap transition-all duration-300 font-bold tracking-wide flex-1 text-center 
                          ${tab === '📋 Overview' && activeTab !== tab ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' : ''}
                          ${activeTab === tab
                            ? tab === '📋 Overview'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-white/20'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border border-white/10'
                            : 'text-gray-500 hover:text-gray-200 hover:bg-[#ffffff0a] border border-transparent'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === '📋 Overview' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!companyProfile ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-600">
                        <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                        <span className="text-sm">Loading company data...</span>
                      </div>
                    ) : (
                      <>
                        {/* Company blurb */}
                        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
                          <p className="text-sm text-gray-200 leading-relaxed">{companyProfile.businessModel}</p>
                          <div className="w-full h-px bg-white/[0.06]"></div>
                          <p className="text-xs text-gray-400 leading-relaxed">{companyProfile.profitability}</p>
                        </div>

                        {/* Key metrics grid */}
                        <div>
                          <h4 className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-3">Key Metrics</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'P/E', value: companyProfile.valuation.pe, color: 'text-white' },
                              { label: 'P/B', value: companyProfile.valuation.pb, color: 'text-white' },
                              { label: 'PEG', value: companyProfile.valuation.peg, color: 'text-white' },
                              { label: 'Gross Margin', value: companyProfile.fundamentals.grossMargin, color: 'text-emerald-400' },
                              { label: 'Net Margin', value: companyProfile.fundamentals.netMargin, color: 'text-emerald-400' },
                              { label: 'ROE', value: companyProfile.fundamentals.roe, color: 'text-blue-400' },
                              { label: 'Rev. Growth', value: companyProfile.fundamentals.revenueGrowth, color: 'text-blue-400' },
                              { label: 'Op. Margin', value: companyProfile.fundamentals.operatingMargin, color: 'text-emerald-400' },
                              { label: 'Debt/Equity', value: companyProfile.fundamentals.debtToEquity, color: 'text-orange-400' },
                            ].map((m, i) => (
                              <div key={i} className="bg-[#0d1117] border border-white/[0.06] rounded-lg p-2.5 flex flex-col gap-1">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{m.label}</span>
                                <span className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Valuation status + DCF */}
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                          <div className="flex-1">
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Valuation</div>
                            <div className={`text-sm font-black ${companyProfile.valuation.status === 'Undervalued' ? 'text-emerald-400' :
                              companyProfile.valuation.status === 'Overvalued' ? 'text-red-400' : 'text-yellow-400'
                              }`}>{companyProfile.valuation.status}</div>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div>
                          <div className="flex-1 text-right">
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">DCF Fair Value</div>
                            <div className="text-sm font-mono font-bold text-white">{companyProfile.valuation.dcfValue}</div>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div>
                          <div className="flex-1 text-right">
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Analyst Target</div>
                            <div className="text-sm font-mono font-bold text-blue-400">{companyProfile.analystTake.targetPrice}</div>
                          </div>
                        </div>

                        {/* Catalysts & Risks */}
                        <div className="space-y-3">
                          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Near-Term Catalysts
                            </div>
                            <p className="text-xs text-emerald-100/80 leading-relaxed">{companyProfile.analystTake.catalysts}</p>
                          </div>
                          <div className="bg-rose-900/20 border border-rose-500/20 rounded-xl p-4">
                            <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>Key Risks
                            </div>
                            <p className="text-xs text-rose-100/80 leading-relaxed">{companyProfile.analystTake.risks}</p>
                          </div>
                        </div>

                        {/* Analyst Rating */}
                        <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Analyst Consensus</div>
                          <div className="text-sm font-black text-blue-400 tracking-wide">{companyProfile.analystTake.rating}</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* AI Forecast Tab Removed as per user request */}

                {activeTab === 'Fundamentals' && companyProfile && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-3 uppercase">Valuation Metrics</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#111827] border border-gray-800 p-3 rounded">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">P/E Ratio</div>
                          <div className="text-lg font-mono text-white">{companyProfile.valuation.pe}</div>
                        </div>
                        <div className="bg-[#111827] border border-gray-800 p-3 rounded">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">P/B Ratio</div>
                          <div className="text-lg font-mono text-white">{companyProfile.valuation.pb}</div>
                        </div>
                        <div className="bg-[#111827] border border-gray-800 p-3 rounded">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">PEG Ratio</div>
                          <div className="text-lg font-mono text-white">{companyProfile.valuation.peg}</div>
                        </div>
                      </div>
                      <div className="mt-3 bg-[#111827] border border-gray-800 p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-400">Valuation Status</span>
                          <span className={`text-xs font-bold ${companyProfile.valuation.status === 'Undervalued' ? 'text-emerald-400' :
                            companyProfile.valuation.status === 'Overvalued' ? 'text-red-400' : 'text-blue-400'
                            }`}>{companyProfile.valuation.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Implied DCF Value</span>
                          <span className="text-sm font-mono text-white">{companyProfile.valuation.dcfValue}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-3 uppercase">Financial Health</h4>
                      <div className="space-y-2">
                        {[
                          { label: 'Gross Margin', value: companyProfile.fundamentals.grossMargin },
                          { label: 'Operating Margin', value: companyProfile.fundamentals.operatingMargin },
                          { label: 'Net Margin', value: companyProfile.fundamentals.netMargin },
                          { label: 'Return on Equity (ROE)', value: companyProfile.fundamentals.roe },
                          { label: 'Return on Assets (ROA)', value: companyProfile.fundamentals.roa },
                          { label: 'Revenue Growth', value: companyProfile.fundamentals.revenueGrowth },
                          { label: 'Debt to Equity', value: companyProfile.fundamentals.debtToEquity }
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                            <span className="text-sm text-gray-400">{item.label}</span>
                            <span className="text-sm font-mono text-gray-200">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Business & Mgmt' && companyProfile && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-2 uppercase">Business Model</h4>
                      <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-blue-500 pl-3">
                        {companyProfile.businessModel}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-2 uppercase">Profitability Drivers</h4>
                      <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-emerald-500 pl-3">
                        {companyProfile.profitability}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-3 uppercase">Analyst Consensus</h4>
                      <div className="bg-[#111827] border border-gray-800 rounded p-4">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rating</div>
                            <div className="text-lg font-bold text-blue-400">{companyProfile.analystTake.rating}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Price Target</div>
                            <div className="text-lg font-mono text-white">{companyProfile.analystTake.targetPrice}</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Catalysts</span>
                            <p className="text-xs text-gray-400">{companyProfile.analystTake.catalysts}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">Risks</span>
                            <p className="text-xs text-gray-400">{companyProfile.analystTake.risks}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Comparables' && companyProfile && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-xs font-bold text-gray-500 tracking-widest mb-2 uppercase">Peer Group ({companyProfile.sector || 'Tech'})</h4>
                    <div className="space-y-2">
                      {companyProfile.comparables.map((comp, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setTicker(comp.ticker);
                            setActiveTab('Fundamentals');
                          }}
                          className="w-full text-left bg-[#111827] hover:bg-[#1f2937] border border-gray-800 hover:border-gray-600 rounded p-3 transition flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                              {comp.ticker.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{comp.ticker}</div>
                              <div className="text-xs text-gray-500">{comp.name}</div>
                            </div>
                          </div>
                          <Activity size={16} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
