const multipart = require('parse-multipart-data');

module.exports = async function (context, req) {
    context.log('HTTP trigger function processed a request.');    // CORS 헤더 설정 - 더 포괄적으로
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With, Accept, Authorization, Cache-Control',
        'Access-Control-Max-Age': '86400'
    };

    // 모든 응답에 CORS 헤더 포함
    context.res = {
        headers: corsHeaders
    };

    context.log('Request method:', req.method);
    context.log('Request headers:', req.headers);    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = 'OK';
        context.log('Handled OPTIONS request');
        return;
    }

    // GET 요청 처리 (테스트용)
    if (req.method === 'GET') {
        context.res.status = 200;
        context.res.body = { 
            message: 'ConvertHttp API is running', 
            timestamp: new Date().toISOString(),
            methods: ['POST', 'OPTIONS'],
            endpoint: '/api/convert'
        };
        context.log('Handled GET request - API status check');
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        context.log('Method not allowed:', req.method);
        context.res.status = 405;
        context.res.body = { 
            error: 'Method not allowed. Use POST for file conversion or GET for status check.',
            allowedMethods: ['GET', 'POST', 'OPTIONS']
        };
        return;
    }

    try {
        context.log('Processing POST request...');
        
        // Content-Type 확인
        const contentType = req.headers['content-type'];
        context.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('multipart/form-data')) {
            context.log('Invalid content type');
            context.res.status = 400;
            context.res.body = { error: 'Content-Type must be multipart/form-data' };
            return;
        }

        // 요청 바디 확인
        if (!req.body) {
            context.log('No request body');
            context.res.status = 400;
            context.res.body = { error: 'No request body' };
            return;
        }

        // multipart 데이터 파싱
        const boundary = contentType.split('boundary=')[1];
        context.log('Boundary:', boundary);
        
        if (!boundary) {
            context.res.status = 400;
            context.res.body = { error: 'No boundary found in Content-Type' };
            return;
        }

        const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
        const parts = multipart.parse(bodyBuffer, boundary);

        context.log('Parsed parts count:', parts ? parts.length : 0);

        if (!parts || parts.length === 0) {
            context.res.status = 400;
            context.res.body = { error: 'No multipart data found' };
            return;
        }

        // 파일 찾기
        const filePart = parts.find(part => part.name === 'file');
        const formatPart = parts.find(part => part.name === 'targetFormat');

        if (!filePart) {
            context.res.status = 400;
            context.res.body = { error: 'No file found in form data' };
            return;
        }

        const fileName = filePart.filename || 'unknown';
        const fileBuffer = filePart.data;
        const targetFormat = formatPart ? formatPart.data.toString() : 'pdf';

        context.log(`Processing file: ${fileName} -> ${targetFormat}`);
        context.log(`File size: ${fileBuffer.length} bytes`);

        // 성공 응답
        const responseData = {
            success: true,
            message: 'File received successfully',
            originalFile: fileName,
            targetFormat: targetFormat,
            fileSize: fileBuffer.length,
            timestamp: new Date().toISOString()
        };

        context.res.status = 200;
        context.res.body = responseData;

    } catch (error) {
        context.log('Error processing request:', error);
        
        context.res.status = 500;
        context.res.body = { 
            error: 'Internal server error', 
            message: error.message 
        };
    }
};
