const { requireClerkAuth } = require('../_auth');
const DEFAULT_MODEL = process.env.UPSTAGE_MODEL || 'solar-pro2';

function buildPrompt({ topic, style = 'informative', outline = [], targetLength = 1200, language = 'ko' }) {
  const outlineText = outline && outline.length ? `\nUse/Refine this outline:\n- ${outline.join('\n- ')}` : '';
  const system = 'You are a senior SEO content writer. Produce factual, non-plagiarized, well-structured HTML with semantic tags.';
  const user = `Topic: ${topic}\nStyle: ${style}\nTarget length: ~${targetLength} words\nLanguage: ${language}${outlineText}\nReturn ONLY HTML (h1/h2/h3, p, ul/ol, img placeholders).`;
  return { system, user };
}

function extractSummaryAndKeywords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const summary = text.length > 183 ? text.slice(0, 180) + '...' : text;
  const words = text.toLowerCase().split(/[^a-zA-Z0-9가-힣]+/).filter(w => w.length > 2);
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const keywords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 8);
  return { summary, keywords };
}

async function callUpstage({ apiKey, system, user, temperature = 0.7, max_tokens = 2048 }) {
  const body = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature,
    max_tokens,
    reasoning_effort: 'high'
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
    throw new Error(`Upstage error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

async function publishWordpress(payload) {
  const baseUrl = process.env.WORDPRESS_BASE_URL;
  if (!baseUrl) throw new Error('WORDPRESS_BASE_URL not configured');
  const headers = { 'Content-Type': 'application/json' };
  const jwt = process.env.WORDPRESS_JWT_TOKEN;
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  const user = process.env.WORDPRESS_USERNAME;
  const pass = process.env.WORDPRESS_PASSWORD;
  if (!headers['Authorization'] && user && pass) {
    const token = Buffer.from(`${user}:${pass}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }
  const url = baseUrl.replace(/\/$/, '') + '/wp-json/wp/v2/posts';
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!resp.ok) throw new Error(`WordPress failed ${resp.status}: ${await resp.text()}`);
  return await resp.json();
}

async function publishTistory(payload) {
  const accessToken = process.env.TISTORY_ACCESS_TOKEN;
  const blogName = process.env.TISTORY_BLOG_NAME;
  if (!accessToken || !blogName) throw new Error('Tistory credentials not configured');
  const params = new URLSearchParams({
    access_token: accessToken,
    output: 'json',
    blogName,
    title: payload.title,
    content: payload.content,
    visibility: String(payload.visibility ?? 3)
  });
  if (payload.category != null) params.append('category', String(payload.category));
  if (payload.tag) params.append('tag', String(payload.tag));
  const resp = await fetch('https://www.tistory.com/apis/post/write', { method: 'POST', body: params });
  if (!resp.ok) throw new Error(`Tistory failed ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  if (data?.tistory?.status !== '200') throw new Error(`Tistory API error: ${JSON.stringify(data)}`);
  return data;
}

module.exports = async function (context, req) {
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
    // Clerk 인증
    await requireClerkAuth(req);

    const apiKey = process.env.UPSTAGE_API_KEY;
    if (!apiKey) {
      context.res.status = 500;
      context.res.body = { error: 'UPSTAGE_API_KEY not configured' };
      return;
    }

    const { topic, style, outline, targetLength, language, publish = false, platform, wpOptions = {}, tistoryOptions = {} } = req.body || {};
    if (!topic) {
      context.res.status = 400;
      context.res.body = { error: 'topic is required' };
      return;
    }

    const { system, user } = buildPrompt({ topic, style, outline, targetLength, language });
    const content = await callUpstage({ apiKey, system, user });

    const title = topic.length < 80 ? topic : topic.slice(0, 77) + '...';
    const { summary, keywords } = extractSummaryAndKeywords(content);
    const meta_title = title.slice(0, 60);
    const meta_description = summary.slice(0, 155);

    const draft = { title, content_html: content, summary, keywords, meta_title, meta_description };

    let publishResult = null;
    if (publish) {
      if (platform === 'wordpress') {
        publishResult = await publishWordpress({
          title,
          content,
          status: wpOptions.status || 'draft',
          categories: wpOptions.categories,
          tags: wpOptions.tags
        });
      } else if (platform === 'tistory') {
        publishResult = await publishTistory({
          title,
          content,
          visibility: tistoryOptions.visibility ?? 3,
          category: tistoryOptions.category,
          tag: tistoryOptions.tag
        });
      } else {
        throw new Error('Unsupported platform for publish');
      }
    }

    context.res.status = 200;
    context.res.body = { draft, publishResult };
  } catch (err) {
    context.log('GenerateAndPublish error:', err);
    context.res.status = err.status || 500;
    context.res.body = { error: err.message || 'Internal server error' };
  }
};