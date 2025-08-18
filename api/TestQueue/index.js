const { QueueStorage } = require('../_queue');

module.exports = async function (context, req) {
  context.log('TestQueue function invoked');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
  context.res = { headers: corsHeaders };

  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = 'OK';
    return;
  }

  try {
    const queueStorage = new QueueStorage();
    const storageInfo = queueStorage.getStorageInfo();
    
    context.log('Queue storage info:', storageInfo);

    if (req.method === 'POST') {
      // 테스트 큐 추가
      const { platform = 'test', payload = { title: 'Test post' } } = req.body || {};
      const testUserId = 'test-user-12345';
      const testUserEmail = 'test@example.com';

      const result = await queueStorage.enqueueTask(
        testUserId,
        testUserEmail,
        platform,
        payload
      );

      context.log(`Test task ${result.taskId} queued (storage: ${result.storage})`);

      context.res.status = 200;
      context.res.body = {
        ok: true,
        taskId: result.taskId,
        storage: result.storage,
        storageInfo,
        message: `Test task queued using ${result.storage} storage`
      };
    } else if (req.method === 'GET') {
      // 테스트 큐 상태 조회
      const testUserId = 'test-user-12345';
      const results = await queueStorage.getQueueStatus(testUserId);
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
        testMode: true,
        userId: testUserId,
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
    }
  } catch (err) {
    context.log.error('TestQueue error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};