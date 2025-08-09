const { DefaultAzureCredential } = require('@azure/identity');

async function publishWordpress(payload) {
  const baseUrl = process.env.WORDPRESS_BASE_URL;
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
  if (!resp.ok) throw new Error(`WordPress failed: ${resp.status} ${await resp.text()}`);
  return await resp.json();
}

async function publishTistory(payload) {
  const accessToken = process.env.TISTORY_ACCESS_TOKEN;
  const blogName = process.env.TISTORY_BLOG_NAME;
  const params = new URLSearchParams({
    access_token: accessToken,
    output: 'json',
    blogName,
    title: payload.title,
    content: payload.content,
    visibility: String(payload.visibility ?? 3),
  });
  if (payload.category != null) params.append('category', String(payload.category));
  if (payload.tag) params.append('tag', String(payload.tag));
  const resp = await fetch('https://www.tistory.com/apis/post/write', { method: 'POST', body: params });
  if (!resp.ok) throw new Error(`Tistory failed: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  if (data?.tistory?.status !== '200') throw new Error(`Tistory API error: ${JSON.stringify(data)}`);
  return data;
}

module.exports = async function (context, myQueueItem) {
  context.log('DequeuePublish triggered', myQueueItem);
  try {
    const { platform, payload } = typeof myQueueItem === 'string' ? JSON.parse(myQueueItem) : myQueueItem;
    if (platform === 'wordpress') {
      await publishWordpress(payload);
    } else if (platform === 'tistory') {
      await publishTistory(payload);
    } else {
      context.log('Unknown platform, skipping:', platform);
    }
  } catch (err) {
    context.log.error('DequeuePublish error:', err);
    throw err; // Let Functions retry policy handle
  }
};