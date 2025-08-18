const { requireClerkAuth } = require('../_auth');
const { QueueStorage } = require('../_queue');

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
    // 큐 기능은 인증 필수
    const user = await requireClerkAuth(req);
    context.log('Enqueue publish request from user:', user.userId);

    const { platform, payload } = req.body || {};
    if (!platform || !payload) {
      context.res.status = 400;
      context.res.body = { error: 'platform and payload are required' };
      return;
    }

    // 향상된 큐 시스템 사용
    const queueStorage = new QueueStorage();
    const storageInfo = queueStorage.getStorageInfo();
    
    context.log('Queue storage info:', storageInfo);

    const result = await queueStorage.enqueueTask(
      user.userId,
      user.email,
      platform,
      payload
    );

    context.log(`Queued task ${result.taskId} for user ${user.userId} (storage: ${result.storage})`);

    context.res.status = 200;
    context.res.body = { 
      ok: true, 
      taskId: result.taskId,
      queuePosition: 'pending',
      storage: result.storage,
      storageInfo,
      message: `Task added to publish queue (${result.storage})` 
    };
  } catch (err) {
    context.log.error('EnqueuePublish error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};