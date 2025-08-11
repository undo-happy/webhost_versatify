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

    // R2에 사용자별 큐 저장
    const s3 = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      context.res.status = 500;
      context.res.body = { error: 'R2_BUCKET_NAME not configured' };
      return;
    }

    const timestamp = Date.now();
    const taskId = `${platform}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    const queueKey = `users/${user.userId}/queue/pending/${taskId}.json`;
    
    const queueData = {
      taskId,
      userId: user.userId,
      userEmail: user.email,
      platform,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await s3.putObject({
      Bucket: bucketName,
      Key: queueKey,
      Body: JSON.stringify(queueData, null, 2),
      ContentType: 'application/json'
    }).promise();

    context.log(`Queued task ${taskId} for user ${user.userId}`);

    context.res.status = 200;
    context.res.body = { 
      ok: true, 
      taskId, 
      queuePosition: 'pending',
      message: 'Task added to publish queue' 
    };
  } catch (err) {
    context.log.error('EnqueuePublish error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};