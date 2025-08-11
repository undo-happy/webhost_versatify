const { requireClerkAuth } = require('../_auth');

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const jwt = process.env.WORDPRESS_JWT_TOKEN;
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  return headers;
}

function buildBasicAuth() {
  const user = process.env.WORDPRESS_USERNAME;
  const pass = process.env.WORDPRESS_PASSWORD;
  if (user && pass) {
    const token = Buffer.from(`${user}:${pass}`).toString('base64');
    return `Basic ${token}`;
  }
  return null;
}

module.exports = async function (context, req) {
  context.log('PublishWordPress function invoked');

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
    // 발행 기능은 인증 필수
    const user = await requireClerkAuth(req);
    context.log('WordPress publish request from user:', user.userId);

    const baseUrl = process.env.WORDPRESS_BASE_URL;
    if (!baseUrl) {
      context.res.status = 500;
      context.res.body = { error: 'WORDPRESS_BASE_URL not configured' };
      return;
    }

    const { title, content, status = 'draft', categories, tags } = req.body || {};
    if (!title || !content) {
      context.res.status = 400;
      context.res.body = { error: 'title and content are required' };
      return;
    }

    const url = baseUrl.replace(/\/$/, '') + '/wp-json/wp/v2/posts';

    const headers = buildHeaders();
    const basic = buildBasicAuth();
    if (basic && !headers['Authorization']) {
      headers['Authorization'] = basic;
    }

    const payload = { title, content, status };
    if (Array.isArray(categories)) payload.categories = categories;
    if (Array.isArray(tags)) payload.tags = tags;

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      context.res.status = resp.status;
      context.res.body = { error: 'WordPress publish failed', detail: text };
      return;
    }

    const data = await resp.json();
    context.res.status = 200;
    context.res.body = { ok: true, result: data };
  } catch (err) {
    context.log.error('PublishWordPress error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};