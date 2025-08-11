const { requireClerkAuth } = require('../_auth');
const AWS = require('aws-sdk');

// R2 클라이언트 설정
function getR2Client() {
  return new AWS.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto',
    signatureVersion: 'v4'
  });
}

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

    const s3 = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      context.res.status = 500;
      context.res.body = { error: 'R2_BUCKET_NAME not configured' };
      return;
    }

    // 사용자의 큐 폴더들 조회
    const queueStatuses = ['pending', 'processing', 'completed', 'failed'];
    const results = {};
    
    for (const status of queueStatuses) {
      const prefix = `users/${user.userId}/queue/${status}/`;
      
      try {
        const objects = await s3.listObjectsV2({
          Bucket: bucketName,
          Prefix: prefix,
          MaxKeys: 100
        }).promise();
        
        const tasks = [];
        for (const obj of objects.Contents || []) {
          try {
            const data = await s3.getObject({
              Bucket: bucketName,
              Key: obj.Key
            }).promise();
            
            const taskData = JSON.parse(data.Body.toString());
            tasks.push({
              taskId: taskData.taskId,
              platform: taskData.platform,
              createdAt: taskData.createdAt,
              status: taskData.status,
              ...(taskData.error && { error: taskData.error }),
              ...(taskData.result && { result: taskData.result })
            });
          } catch (parseErr) {
            context.log.warn('Failed to parse task:', obj.Key, parseErr);
          }
        }
        
        results[status] = tasks.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      } catch (listErr) {
        context.log.warn(`Failed to list ${status} tasks:`, listErr);
        results[status] = [];
      }
    }

    const totalTasks = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    context.res.status = 200;
    context.res.body = {
      userId: user.userId,
      totalTasks,
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