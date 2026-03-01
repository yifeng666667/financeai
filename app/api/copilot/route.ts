import { NextRequest } from 'next/server';

// Helper to simulate a streaming response using Server-Sent Events (SSE)
// In a real app, you would use OpenAI/Gemini streaming APIs here.
export async function POST(req: NextRequest) {
    const { ticker, type, audience } = await req.json();

    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // The text to stream back
    let contentToStream = "";

    // Generate highly realistic, "human" structured Analyst Reports.
    if (type === 'analyst_report') {
        contentToStream = `[Executive Summary & Investment Thesis]

We initiate coverage on \${ticker} with a conviction BUY rating and establish a 12-month base-case price target representing an asymmetric 18.5% upside. \${ticker} occupies an impregnable competitive moat within itsTAM (Total Addressable Market), underpinned by high switching costs and mission-critical enterprise integration. We model a 300bps gross margin expansion over the next 8 quarters, largely ignored by consensus, driven by a structural shift toward higher-margin software and services revenue.

[Business Model & Structural Advantages]

\${ticker}'s economic engine represents a textbook 'flywheel' dynamic. The core infrastructure solutions serve as a loss-leader, funneling enterprise clients into a high-margin, sticky software ecosystem. Retention rates currently sit at an industry-leading 114% NRR (Net Retention Rate). Management's aggressive transition to a consumption-based pricing model aligns long-term secular growth with immediate free cash flow (FCF) generation.

[Near-Term Catalysts]

1. Product Cycle Super-cycle: The impending H2 launch is expected to drive an accelerated replacement wave among Fortune 500 constituents. We estimate this could drive a $2.4B top-line beat against street estimates in FY25.
2. Accretive M&A Integration: The recent strategic acquisition fills critical gaps in their AI infrastructure stack, effectively locking out mid-tier competitors and establishing a pricing umbrella.
3. Capital Allocation Pivot: With leverage comfortably below 1.2x Net Debt/EBITDA, we anticipate management will authorize a highly accretive $15B accelerated share repurchase (ASR) program before year-end.

[Valuation Framework]

Our price target is derived from a blended valuation methodology incorporating a 10-year DCF (WACC: 8.2%, TGR: 2.5%) and a 22x EV/NTM EBITDA multiple, which represents a 15% discount to its historical 5-year median, adjusting for normalized interest rates. On a PEG ratio basis (1.1x), \${ticker} trades at a steep discount to large-cap tech peers, providing a substantial margin of safety.

[Key Risks & Mitigants]

The primary downside risk involves acute supply-chain concentration in the APAC region, exposing the firm to geopolitical friction. However, management's recent CAPEX guidance indicates aggressive near-shoring efforts that should fully diversify assembly dependency by late 2026. A secondary risk is prolonged macro-economic softening impacting enterprise IT budgets, though \${ticker}'s mission-critical nature typically commands priority allocation during budget consolidations.`;
    } else {
        contentToStream = "Invalid request type.";
    }

    // Replace the default ticker placeholder with the actual requested ticker
    const finalContent = contentToStream.replace(/\${ticker}/g, ticker || 'AAPL');

    (async () => {
        try {
            // Split the content into chunks to simulate real LLM typing speed
            const chunks = finalContent.split(" ");
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i] + " ";
                await writer.write(encoder.encode(chunk));

                // Random delay between 20ms and 60ms to look like human typing / network variance
                const delay = Math.floor(Math.random() * 40) + 20;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        } catch (err) {
            console.error('Streaming error', err);
        } finally {
            await writer.close();
        }
    })();

    return new Response(responseStream.readable, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache, no-transform',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
