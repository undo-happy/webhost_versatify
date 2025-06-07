const cleanupTask = require('../cleanupTask');

module.exports = async function (context, req) {
    context.log('CleanupStorage HTTP 함수가 실행됨');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    };

    context.res = {
        headers: corsHeaders
    };

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

    const timeStamp = new Date().toISOString();
    context.log('CleanupStorage POST 요청 처리:', timeStamp);

    try {
        const { message } = await cleanupTask(context);
        context.log(message);
        context.res.status = 200;
        context.res.body = { success: true, message };
    } catch (error) {
        context.log.error('스토리지 정리 중 오류 발생:', error);
        context.res.status = 500;
        context.res.body = { success: false, error: 'Cleanup failed' };
    }
};
