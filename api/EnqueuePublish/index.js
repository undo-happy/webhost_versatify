const { QueueClient } = require('@azure/storage-queue');

function getQueueClient(queueName) {
  const conn = process.env.AzureWebJobsStorage;
  if (!conn) throw new Error('AzureWebJobsStorage not configured');
  const client = new QueueClient(conn, queueName);
  return client;
}

module.exports = async function (context, req) {
  context.log('EnqueuePublish invoked');

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
    const { platform, payload } = req.body || {};
    if (!platform || !payload) {
      context.res.status = 400;
      context.res.body = { error: 'platform and payload are required' };
      return;
    }

    const queueName = process.env.PUBLISH_QUEUE_NAME || 'publish-jobs';
    const queue = getQueueClient(queueName);
    await queue.createIfNotExists();
    const msg = Buffer.from(JSON.stringify({ platform, payload, ts: Date.now() })).toString('base64');
    await queue.sendMessage(msg);

    context.res.status = 200;
    context.res.body = { ok: true };
  } catch (err) {
    context.log.error('EnqueuePublish error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};