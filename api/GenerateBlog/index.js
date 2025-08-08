const DEFAULT_MODEL = process.env.UPSTAGE_MODEL || 'solar-pro2';

function buildPrompt({ topic, style = 'informative', outline = [], targetLength = 1200, language = 'ko' }) {
    const outlineText = outline && outline.length ? `\nUse/Refine this outline:\n- ${outline.join('\n- ')}` : '';
    return `Topic: ${topic}\nStyle: ${style}\nTarget length: ~${targetLength} words\nLanguage: ${language}${outlineText}\nReturn ONLY well-structured HTML (h1/h2/h3, p, ul/ol, img placeholders).`;
}

function extractSummaryAndKeywords(html) {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const summary = text.length > 183 ? text.slice(0, 180) + '...' : text;
    const words = text.toLowerCase().split(/[^a-zA-Z0-9가-힣]+/).filter(w => w.length > 2);
    const freq = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    const keywords = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0,8);
    return { summary, keywords };
}

module.exports = async function (context, req) {
    context.log('GenerateBlog function invoked');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
    context.res = { headers: corsHeaders };

    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = 'OK';
        return;
    }

    if (req.method !== 'POST') {
        context.res.status = 405;
        context.res.body = { error: 'Method not allowed' };
        return;
    }

    try {
        const apiKey = process.env.UPSTAGE_API_KEY;
        if (!apiKey) {
            context.res.status = 500;
            context.res.body = { error: 'UPSTAGE_API_KEY not configured' };
            return;
        }

        const { topic, style, outline, targetLength, language } = req.body || {};
        if (!topic) {
            context.res.status = 400;
            context.res.body = { error: 'topic is required' };
            return;
        }

        const system = 'You are a senior SEO content writer. Produce factual, non-plagiarized, well-structured HTML content with semantic tags and logical flow.';
        const user = buildPrompt({ topic, style, outline, targetLength, language });

        const body = {
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ],
            temperature: 0.7,
            // Apply reasoning effect: high (if supported by API; ignored otherwise)
            reasoning: { effort: 'high' }
        };

        const resp = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            const text = await resp.text();
            context.log.error('Upstage API error:', resp.status, text);
            context.res.status = 502;
            context.res.body = { error: 'LLM generation failed', detail: text };
            return;
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content || '';
        const title = topic.length < 80 ? topic : topic.slice(0,77) + '...';
        const { summary, keywords } = extractSummaryAndKeywords(content);
        const meta_title = title.slice(0, 60);
        const meta_description = summary.slice(0, 155);

        context.res.status = 200;
        context.res.body = {
            title,
            content_html: content,
            summary,
            keywords,
            meta_title,
            meta_description
        };
    } catch (err) {
        context.log.error('GenerateBlog error:', err);
        context.res.status = 500;
        context.res.body = { error: 'Internal server error', message: err.message };
    }
};