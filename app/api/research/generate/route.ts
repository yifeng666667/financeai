import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
    const context = await req.json();

    const result = streamObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
            executiveSummary: z.string().describe('A professional 2-paragraph executive summary combining qualitative business moat with quantitative financial justification.'),
            priceTargets: z.object({
                bull: z.object({ price: z.number(), rationale: z.string() }),
                base: z.object({ price: z.number(), rationale: z.string() }),
                bear: z.object({ price: z.number(), rationale: z.string() })
            }).describe('Bull, Base, and Bear scenario price targets (in USD) with a 1-sentence rationale for each case.'),
            segmentBreakdown: z.array(z.object({
                name: z.string(),
                percentage: z.number().describe('Percentage of total revenue (0-100)'),
                insight: z.string().describe('A brief, insightful 1-sentence comment on this segment\'s growth or margin profile')
            })).describe('Estimated revenue segment breakdown for the company based on latest public data or consensus estimates.'),
            investmentThesis: z.array(z.string()).describe('List of 3 distinct structural growth vectors or margin accretion points based on the provided data.'),
            valuation: z.string().describe('A descriptive paragraph explaining the current valuation relative to historical peers and implied fair value. Emphasize the PEG ratio if available.'),
            catalysts: z.array(z.string()).describe('3 near-term or medium-term catalysts that could drive the stock price up.'),
            risks: z.array(z.string()).describe('3 structural or macroeconomic risks that could impact the downside.'),
        }),
        prompt: `Generate an institutional-grade equity research report text for ${context.ticker} (${context.companyName}) in the ${context.industry} industry.
    
    Here is the raw financial context to base your deep analysis on. USE THESE METRICS TO BACK UP YOUR CLAIMS.
    DO NOT hallucinate financial figures. If data is missing or N/A, speak to the qualitative structural drivers of the sector instead.
    
    CRITICAL INSTRUCTIONS:
    - priceTargets: Provide realistic Bull, Base, and Bear price targets (in USD) for the next 12-18 months. Anchor these logically based on current price/fundamentals, and provide a strict 1-sentence trigger rationale for each.
    - segmentBreakdown: Provide the estimated breakdown of the company's revenue into exactly 3 to 5 key business segments, summing roughly to 100%. Include a very brief insight for each.
    
    Context:
    ${JSON.stringify({
            ticker: context.ticker,
            industry: context.industry,
            rating: context.rating,
            valuationStats: context.valuationStats,
            latestRatios: context.ratios
        }, null, 2)}
    
    Ensure your tone is highly professional, analytical, objective, and dense with insight. Write as if you are a senior equity research analyst at a top-tier investment bank.`,
    });

    return result.toTextStreamResponse();
}
