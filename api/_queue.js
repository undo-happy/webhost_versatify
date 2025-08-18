const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// 큐 스토리지 추상화 클래스
class QueueStorage {
  constructor() {
    this.r2Available = this.checkR2Config();
    this.localQueueDir = path.join(process.cwd(), '.queue');
    this.initLocalStorage();
  }

  checkR2Config() {
    return !!(
      process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_ENDPOINT !== "" &&
      process.env.R2_ACCESS_KEY_ID !== "" &&
      process.env.R2_SECRET_ACCESS_KEY !== "" &&
      process.env.R2_BUCKET_NAME !== ""
    );
  }

  async initLocalStorage() {
    try {
      await fs.access(this.localQueueDir);
    } catch {
      await fs.mkdir(this.localQueueDir, { recursive: true });
      await fs.mkdir(path.join(this.localQueueDir, 'users'), { recursive: true });
    }
  }

  getR2Client() {
    if (!this.r2Available) {
      throw new Error('R2 storage not configured');
    }
    return new AWS.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      region: 'auto',
      signatureVersion: 'v4'
    });
  }

  // 로컬 파일시스템에 큐 데이터 저장
  async saveToLocal(userId, status, taskId, data) {
    const userDir = path.join(this.localQueueDir, 'users', this.hashUserId(userId), 'queue', status);
    await fs.mkdir(userDir, { recursive: true });
    
    const filePath = path.join(userDir, `${taskId}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
  }

  // 로컬 파일시스템에서 큐 데이터 읽기
  async loadFromLocal(userId, status) {
    const userDir = path.join(this.localQueueDir, 'users', this.hashUserId(userId), 'queue', status);
    
    try {
      const files = await fs.readdir(userDir);
      const tasks = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(userDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            const taskData = JSON.parse(content);
            tasks.push(taskData);
          } catch (err) {
            console.warn(`Failed to read local queue file ${file}:`, err.message);
          }
        }
      }
      
      return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  // 로컬 파일시스템에서 큐 데이터 이동 (상태 변경)
  async moveLocalTask(userId, taskId, fromStatus, toStatus, updatedData) {
    const fromDir = path.join(this.localQueueDir, 'users', this.hashUserId(userId), 'queue', fromStatus);
    const toDir = path.join(this.localQueueDir, 'users', this.hashUserId(userId), 'queue', toStatus);
    
    const fromPath = path.join(fromDir, `${taskId}.json`);
    const toPath = path.join(toDir, `${taskId}.json`);
    
    await fs.mkdir(toDir, { recursive: true });
    
    if (updatedData) {
      await fs.writeFile(toPath, JSON.stringify(updatedData, null, 2), 'utf8');
    } else {
      await fs.rename(fromPath, toPath);
    }
    
    // 원본 파일 삭제 (rename이 안 된 경우)
    try {
      await fs.unlink(fromPath);
    } catch (err) {
      // 이미 이동됐거나 없는 경우 무시
    }
  }

  // 사용자 ID 해시 (개인정보 보호)
  hashUserId(userId) {
    return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16);
  }

  // 큐에 작업 추가
  async enqueueTask(userId, userEmail, platform, payload) {
    const timestamp = Date.now();
    const taskId = `${platform}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    const queueData = {
      taskId,
      userId,
      userEmail,
      platform,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      storage: this.r2Available ? 'r2' : 'local'
    };

    try {
      if (this.r2Available) {
        // R2에 저장 시도
        const s3 = this.getR2Client();
        const bucketName = process.env.R2_BUCKET_NAME;
        const queueKey = `users/${userId}/queue/pending/${taskId}.json`;
        
        await s3.putObject({
          Bucket: bucketName,
          Key: queueKey,
          Body: JSON.stringify(queueData, null, 2),
          ContentType: 'application/json'
        }).promise();
        
        console.log(`Task ${taskId} saved to R2 storage`);
      } else {
        // 로컬 파일시스템에 저장
        await this.saveToLocal(userId, 'pending', taskId, queueData);
        console.log(`Task ${taskId} saved to local storage`);
      }
      
      return { taskId, storage: queueData.storage };
    } catch (err) {
      if (this.r2Available) {
        // R2 실패시 로컬 백업
        console.warn('R2 storage failed, falling back to local:', err.message);
        await this.saveToLocal(userId, 'pending', taskId, { ...queueData, storage: 'local_backup' });
        return { taskId, storage: 'local_backup' };
      }
      throw err;
    }
  }

  // 큐 상태 조회
  async getQueueStatus(userId) {
    const queueStatuses = ['pending', 'processing', 'completed', 'failed'];
    const results = {};

    try {
      if (this.r2Available) {
        // R2에서 조회
        const s3 = this.getR2Client();
        const bucketName = process.env.R2_BUCKET_NAME;
        
        for (const status of queueStatuses) {
          const prefix = `users/${userId}/queue/${status}/`;
          
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
                  storage: 'r2',
                  ...(taskData.error && { error: taskData.error }),
                  ...(taskData.result && { result: taskData.result })
                });
              } catch (parseErr) {
                console.warn('Failed to parse R2 task:', obj.Key, parseErr.message);
              }
            }
            
            results[status] = tasks;
          } catch (listErr) {
            console.warn(`Failed to list ${status} tasks from R2:`, listErr.message);
            results[status] = [];
          }
        }
      } else {
        // 로컬에서 조회
        for (const status of queueStatuses) {
          const tasks = await this.loadFromLocal(userId, status);
          results[status] = tasks.map(task => ({
            taskId: task.taskId,
            platform: task.platform,
            createdAt: task.createdAt,
            status: task.status,
            storage: task.storage || 'local',
            ...(task.error && { error: task.error }),
            ...(task.result && { result: task.result })
          }));
        }
      }

      // 로컬 백업 파일도 함께 조회 (R2 사용 중이더라도)
      if (this.r2Available) {
        for (const status of queueStatuses) {
          try {
            const localTasks = await this.loadFromLocal(userId, status);
            const localTaskResults = localTasks
              .filter(task => task.storage === 'local_backup')
              .map(task => ({
                taskId: task.taskId,
                platform: task.platform,
                createdAt: task.createdAt,
                status: task.status,
                storage: 'local_backup',
                ...(task.error && { error: task.error }),
                ...(task.result && { result: task.result })
              }));
            
            results[status] = [...results[status], ...localTaskResults];
          } catch (err) {
            // 로컬 백업 조회 실패는 무시
          }
        }
      }

      return results;
    } catch (err) {
      console.error('Queue status retrieval failed:', err);
      throw err;
    }
  }

  // 작업 상태 업데이트
  async updateTaskStatus(userId, taskId, fromStatus, toStatus, additionalData = {}) {
    try {
      if (this.r2Available) {
        // R2에서 작업 이동
        const s3 = this.getR2Client();
        const bucketName = process.env.R2_BUCKET_NAME;
        
        const fromKey = `users/${userId}/queue/${fromStatus}/${taskId}.json`;
        const toKey = `users/${userId}/queue/${toStatus}/${taskId}.json`;
        
        // 기존 데이터 읽기
        const existingData = await s3.getObject({
          Bucket: bucketName,
          Key: fromKey
        }).promise();
        
        const taskData = JSON.parse(existingData.Body.toString());
        const updatedData = {
          ...taskData,
          status: toStatus,
          updatedAt: new Date().toISOString(),
          ...additionalData
        };
        
        // 새 위치에 저장
        await s3.putObject({
          Bucket: bucketName,
          Key: toKey,
          Body: JSON.stringify(updatedData, null, 2),
          ContentType: 'application/json'
        }).promise();
        
        // 기존 위치에서 삭제
        await s3.deleteObject({
          Bucket: bucketName,
          Key: fromKey
        }).promise();
        
        console.log(`Task ${taskId} moved from ${fromStatus} to ${toStatus} in R2`);
      } else {
        // 로컬에서 작업 이동
        const tasks = await this.loadFromLocal(userId, fromStatus);
        const task = tasks.find(t => t.taskId === taskId);
        
        if (!task) {
          throw new Error(`Task ${taskId} not found in ${fromStatus} status`);
        }
        
        const updatedData = {
          ...task,
          status: toStatus,
          updatedAt: new Date().toISOString(),
          ...additionalData
        };
        
        await this.moveLocalTask(userId, taskId, fromStatus, toStatus, updatedData);
        console.log(`Task ${taskId} moved from ${fromStatus} to ${toStatus} locally`);
      }
    } catch (err) {
      console.error(`Failed to update task ${taskId} status:`, err);
      throw err;
    }
  }

  // 스토리지 상태 정보
  getStorageInfo() {
    return {
      r2Available: this.r2Available,
      localQueueDir: this.localQueueDir,
      storage: this.r2Available ? 'r2_primary' : 'local_only',
      backup: this.r2Available ? 'local_backup_available' : 'none'
    };
  }
}

module.exports = { QueueStorage };