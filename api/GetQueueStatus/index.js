const { requireClerkAuth } = require('../_auth');
const { QueueStorage } = require('../_queue');

module.exports = async function (context, req) {
  context.log('GetQueueStatus invoked');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
  context.res = { headers: corsHeaders };

  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = 'OK';
    return;
  }
  if (req.method !== 'GET') {
    context.res.status = 405;
    context.res.body = { error: 'Method not allowed' };
    return;
  }

  try {
    // 본인 큐 상태만 조회 가능 (인증 필수)
    const user = await requireClerkAuth(req);
    context.log('Queue status request from user:', user.userId);

    // 향상된 큐 시스템 사용
    const queueStorage = new QueueStorage();
    const storageInfo = queueStorage.getStorageInfo();
    
    context.log('Queue storage info:', storageInfo);

    const results = await queueStorage.getQueueStatus(user.userId);
    const totalTasks = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    // 스토리지별 태스크 카운트
    const storageStats = {
      r2: 0,
      local: 0,
      local_backup: 0
    };

    Object.values(results).forEach(tasks => {
      tasks.forEach(task => {
        if (task.storage) {
          storageStats[task.storage] = (storageStats[task.storage] || 0) + 1;
        }
      });
    });

    context.res.status = 200;
    context.res.body = {
      userId: user.userId,
      totalTasks,
      storageInfo,
      storageStats,
      queues: results,
      summary: {
        pending: results.pending.length,
        processing: results.processing.length,
        completed: results.completed.length,
        failed: results.failed.length
      }
    };

  } catch (err) {
    context.log.error('GetQueueStatus error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};