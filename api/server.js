require('dotenv').config();

// Azure Functions local.settings.json 환경변수 로드
const fs = require('fs');
const path = require('path');

try {
  const localSettings = JSON.parse(fs.readFileSync(path.join(__dirname, 'local.settings.json'), 'utf8'));
  Object.keys(localSettings.Values).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = localSettings.Values[key];
    }
  });
  console.log('✅ Loaded local.settings.json');
} catch (error) {
  console.log('⚠️ Could not load local.settings.json:', error.message);
}

const express = require('express');
const cors = require('cors');
const app = express();
const port = 7071;

// CORS 설정
app.use(cors());
app.use(express.json());

// Azure Functions 시뮬레이션
function createAzureFunctionHandler(functionHandler) {
  return async (req, res) => {
    const context = {
      log: console.log,
      res: {}
    };
    context.log.info = console.log;
    context.log.error = console.error;
    context.log.warn = console.warn;

    try {
      await functionHandler(context, req);
      
      if (context.res.status) {
        res.status(context.res.status);
      }
      
      if (context.res.headers) {
        Object.keys(context.res.headers).forEach(key => {
          res.set(key, context.res.headers[key]);
        });
      }
      
      res.json(context.res.body);
    } catch (error) {
      console.error('Function error:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  };
}

// API 라우트들 - 정확한 함수명으로 수정
app.post('/api/GenerateBlog', createAzureFunctionHandler(require('./GenerateBlog/index.js')));
app.post('/api/AnalyzeSEO', createAzureFunctionHandler(require('./AnalyzeSEO/index.js')));
app.post('/api/CheckGrammar', createAzureFunctionHandler(require('./CheckGrammar/index.js')));
app.post('/api/PublishWordPress', createAzureFunctionHandler(require('./PublishWordPress/index.js')));
app.post('/api/PublishTistory', createAzureFunctionHandler(require('./PublishTistory/index.js')));
app.post('/api/EnqueuePublish', createAzureFunctionHandler(require('./EnqueuePublish/index.js')));
app.get('/api/GetQueueStatus', createAzureFunctionHandler(require('./GetQueueStatus/index.js')));
app.post('/api/GenerateAndPublish', createAzureFunctionHandler(require('./GenerateAndPublish/index.js')));
app.post('/api/AdminAuth', createAzureFunctionHandler(require('./AdminAuth/index.js')));
app.get('/api/TestQueue', createAzureFunctionHandler(require('./TestQueue/index.js')));
app.post('/api/TestQueue', createAzureFunctionHandler(require('./TestQueue/index.js')));

// OPTIONS 핸들러 추가 - 와일드카드 대신 명시적 경로
app.options('/api/GenerateBlog', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/AnalyzeSEO', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/CheckGrammar', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/PublishWordPress', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/PublishTistory', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/EnqueuePublish', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/GetQueueStatus', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/GenerateAndPublish', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/AdminAuth', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
app.options('/api/TestQueue', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🚀 Local Azure Functions server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  POST /api/GenerateBlog');
  console.log('  POST /api/AnalyzeSEO');
  console.log('  POST /api/CheckGrammar');
  console.log('  POST /api/PublishWordPress');
  console.log('  POST /api/PublishTistory');
  console.log('  POST /api/EnqueuePublish');
  console.log('  GET /api/GetQueueStatus');
  console.log('  POST /api/GenerateAndPublish');
  console.log('  POST /api/AdminAuth');
  console.log('  GET /api/TestQueue (Testing)');
  console.log('  POST /api/TestQueue (Testing)');
});