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

// WordPress 발행 함수
async function publishToWordPress(payload, context) {
  // WordPress API 호출 로직
  const { site, username, password, title, content, tags, categories } = payload;
  
  if (!site || !username || !password) {
    throw new Error('WordPress credentials are required');
  }
  
  // 실제 WordPress API 호출 구현 필요
  context.log('Publishing to WordPress:', site);
  
  // 시뮬레이션 - 실제 구현 시 WordPress REST API 사용
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    postId: 'wp_' + Date.now(),
    url: `${site}/post-url-here`
  };
}

// Tistory 발행 함수
async function publishToTistory(payload, context) {
  // Tistory API 호출 로직
  const { blogName, accessToken, title, content, tags, category } = payload;
  
  if (!blogName || !accessToken) {
    throw new Error('Tistory credentials are required');
  }
  
  context.log('Publishing to Tistory:', blogName);
  
  // 시뮬레이션 - 실제 구현 시 Tistory API 사용
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    postId: 'tistory_' + Date.now(),
    url: `https://${blogName}.tistory.com/post-url-here`
  };
}

// 큐 작업 처리
async function processQueueTask(taskData, context) {
  const { platform, payload } = taskData;
  
  context.log(`Processing ${platform} task for user ${taskData.userId}`);
  
  switch (platform) {
    case 'wordpress':
      return await publishToWordPress(payload, context);
    case 'tistory':
      return await publishToTistory(payload, context);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// 작업 상태 업데이트 (큐 이동)
async function moveTask(s3, bucketName, taskData, fromStatus, toStatus, result = null, error = null) {
  const { taskId, userId } = taskData;
  
  const fromKey = `users/${userId}/queue/${fromStatus}/${taskId}.json`;
  const toKey = `users/${userId}/queue/${toStatus}/${taskId}.json`;
  
  // 새로운 상태로 작업 데이터 업데이트
  const updatedTaskData = {
    ...taskData,
    status: toStatus,
    updatedAt: new Date().toISOString(),
    ...(result && { result }),
    ...(error && { error: error.toString() })
  };
  
  // 새 위치에 저장
  await s3.putObject({
    Bucket: bucketName,
    Key: toKey,
    Body: JSON.stringify(updatedTaskData, null, 2),
    ContentType: 'application/json'
  }).promise();
  
  // 이전 위치에서 삭제
  try {
    await s3.deleteObject({
      Bucket: bucketName,
      Key: fromKey
    }).promise();
  } catch (deleteErr) {
    // 삭제 실패는 로그만 남기고 계속 진행
    console.log('Failed to delete old task file:', deleteErr);
  }
}

module.exports = async function (context) {
  context.log('ProcessQueue timer triggered');
  
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;
  
  if (!bucketName) {
    context.log.error('R2_BUCKET_NAME not configured');
    return;
  }
  
  try {
    // 모든 사용자의 대기 중인 작업 조회
    const pendingObjects = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: 'users/',
      MaxKeys: 50 // 한 번에 처리할 최대 작업 수
    }).promise();
    
    const pendingTasks = [];
    
    // 대기 중인 작업들만 필터링
    for (const obj of pendingObjects.Contents || []) {
      if (obj.Key.includes('/queue/pending/')) {
        try {
          const data = await s3.getObject({
            Bucket: bucketName,
            Key: obj.Key
          }).promise();
          
          const taskData = JSON.parse(data.Body.toString());
          pendingTasks.push(taskData);
        } catch (parseErr) {
          context.log.warn('Failed to parse pending task:', obj.Key, parseErr);
        }
      }
    }
    
    context.log(`Found ${pendingTasks.length} pending tasks`);
    
    // 각 작업을 순차적으로 처리 (동시 처리 방지)
    for (const taskData of pendingTasks.slice(0, 10)) { // 한 번에 최대 10개 처리
      try {
        context.log(`Processing task ${taskData.taskId} for user ${taskData.userId}`);
        
        // processing 상태로 이동
        await moveTask(s3, bucketName, taskData, 'pending', 'processing');
        
        // 실제 발행 작업 수행
        const result = await processQueueTask(taskData, context);
        
        // 성공 시 completed로 이동
        await moveTask(s3, bucketName, taskData, 'processing', 'completed', result);
        
        context.log(`Task ${taskData.taskId} completed successfully`);
        
      } catch (error) {
        context.log.error(`Task ${taskData.taskId} failed:`, error);
        
        try {
          // 실패 시 failed로 이동
          await moveTask(s3, bucketName, taskData, 'processing', 'failed', null, error);
        } catch (moveErr) {
          context.log.error(`Failed to move task to failed state:`, moveErr);
        }
      }
    }
    
  } catch (err) {
    context.log.error('ProcessQueue error:', err);
  }
  
  context.log('ProcessQueue timer finished');
};