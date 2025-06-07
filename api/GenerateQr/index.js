const QRCode = require('qrcode');

// 간단한 동시성 카운터
let currentProcessing = 0;
const MAX_CONCURRENT = 15; // QR 생성은 가벼운 작업

module.exports = async function (context, req) {
    context.log('GenerateQr function processed a request.');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With, Accept',
        'Access-Control-Max-Age': '86400'
    };
    context.res = { headers: corsHeaders };

    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = 'OK';
        return;
    }

    if (req.method === 'GET') {
        context.res.status = 200;
        context.res.body = {
            message: 'QR Code Generation API',
            serverStatus: {
                currentProcessing,
                maxConcurrent: MAX_CONCURRENT
            }
        };
        return;
    }

    // 동시 처리 제한 확인
    if (currentProcessing >= MAX_CONCURRENT) {
        context.res.status = 503;
        context.res.body = { 
            error: 'QR generation service busy. Please try again in a moment.',
            currentLoad: currentProcessing,
            maxCapacity: MAX_CONCURRENT,
            retryAfter: '1-3 seconds'
        };
        return;
    }

    if (req.method !== 'POST') {
        context.res.status = 405;
        context.res.body = { error: 'Method not allowed' };
        return;
    }

    currentProcessing++;
    context.log(`QR generation started. Current load: ${currentProcessing}/${MAX_CONCURRENT}`);

    const text = req.query.text || (req.body && req.body.text);
    const format = (req.query.format || (req.body && req.body.format) || 'png').toLowerCase();

    if (!text) {
        context.res = {
            status: 400,
            body: { error: 'text parameter is required' }
        };
        return;
    }

    try {
        const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png';
        const qrDataUrl = await QRCode.toDataURL(text, { type: mimeType });
        const base64Data = qrDataUrl.split(',')[1];

        context.res = {
            status: 200,
            headers: { 'Content-Type': mimeType },
            isRaw: true,
            body: Buffer.from(base64Data, 'base64')
        };
    } catch (err) {
        context.log.error('QR generation failed:', err);
        context.res = {
            status: 500,
            body: { error: 'Failed to generate QR code' }
        };
    } finally {
        currentProcessing--;
        context.log(`QR generation completed. Current load: ${currentProcessing}/${MAX_CONCURRENT}`);
    }
};
