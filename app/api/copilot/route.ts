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
        contentToStream = `### Executive Summary & Investment Thesis
* **Business Model**: \${ticker} operates a high-margin, sticky software ecosystem and infrastructure platform. The core offerings act as a funnel for enterprise clients, boasting a 114% Net Retention Rate (NRR).
* **Revenue Drivers**: Transitioning aggressively to a consumption-based pricing model, aligning long-term secular growth with immediate free cash flow generation.
* **Competitive Advantage**: An impregnable moat underpinned by high switching costs and mission-critical enterprise integration, driving projected 300bps gross margin expansion over the next 8 quarters.

### Near-Term Catalysts
* **Product Cycle Super-cycle**: Impending H2 launch expected to drive accelerated replacements among Fortune 500, potentially generating a $2.4B top-line beat in FY25.
* **Accretive M&A Integration**: Recent strategic acquisitions fill critical AI infrastructure gaps, locking out mid-tier competitors and establishing a pricing umbrella.
* **Capital Allocation**: With leverage below 1.2x Net Debt/EBITDA, anticipation of a highly accretive $15B accelerated share repurchase (ASR) program before year-end.

### Valuation Framework

| Metric | Value | Peer Median | Implied Premium/Discount |
| :--- | :--- | :--- | :--- |
| **EV/NTM EBITDA** | 22.0x | 25.5x | -13.7% |
| **P/E (Forward)** | 28.5x | 31.0x | -8.0% |
| **PEG Ratio** | 1.1x | 1.8x | -38.8% |
| **FCF Yield** | 4.2% | 3.1% | +35.4% |

*Target Price derived from 10-year DCF (WACC: 8.2%, TGR: 2.5%) and multiple analysis.*

### Key Risks & Mitigants
* **Internal Risk**: Execution delays in the consumption-pricing transition could temporally compress top-line growth. Management's conservative Q3 guidance attempts to de-risk this transition phase.
* **External Competition**: Aggressive pricing strategies from hyperscaler disruptors. However, \${ticker}'s mission-critical stickiness prevents rapid churn.
* **Macro Conditions**: Acute supply-chain concentration in APAC or prolonged enterprise IT budget softening. CAPEX guidance indicates aggressive near-shoring to fully diversify assembly by late 2026.`;
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
