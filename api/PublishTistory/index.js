function toParams(obj) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  return params;
}

module.exports = async function (context, req) {
  context.log('PublishTistory function invoked');

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
    const accessToken = process.env.TISTORY_ACCESS_TOKEN;
    const blogName = process.env.TISTORY_BLOG_NAME;
    if (!accessToken || !blogName) {
      context.res.status = 500;
      context.res.body = { error: 'TISTORY_ACCESS_TOKEN or TISTORY_BLOG_NAME not configured' };
      return;
    }

    const { title, content, visibility = 3, category, tag } = req.body || {};
    if (!title || !content) {
      context.res.status = 400;
      context.res.body = { error: 'title and content are required' };
      return;
    }

    const url = 'https://www.tistory.com/apis/post/write';
    const params = toParams({
      access_token: accessToken,
      output: 'json',
      blogName,
      title,
      content,
      visibility,
      category,
      tag
    });

    const resp = await fetch(url, { method: 'POST', body: params });
    if (!resp.ok) {
      const text = await resp.text();
      context.res.status = resp.status;
      context.res.body = { error: 'Tistory publish failed', detail: text };
      return;
    }

    const data = await resp.json();
    const status = data?.tistory?.status;
    if (status !== '200') {
      context.res.status = 502;
      context.res.body = { error: 'Tistory API error', detail: data };
      return;
    }

    context.res.status = 200;
    context.res.body = { ok: true, result: data };
  } catch (err) {
    context.log.error('PublishTistory error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};