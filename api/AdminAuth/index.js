const crypto = require('crypto');

module.exports = async function (context, req) {
    context.log('Admin authentication request received');

    // CORS 헤더 설정
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };

    context.res = {
        headers: corsHeaders
    };

    // OPTIONS 요청 처리
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
        const { password } = req.body;
        
        if (!password) {
            context.res.status = 400;
            context.res.body = { error: 'Password is required' };
            return;
        }        // 환경 변수에서 관리자 비밀번호 해시 가져오기
        // Azure Portal Application Settings에서 반드시 설정해야 함
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        const salt = process.env.ADMIN_SALT;
        
        // 환경 변수가 설정되지 않은 경우 즉시 오류 반환
        if (!adminPasswordHash || !salt) {
            context.log('ERROR: Admin credentials not configured in environment variables');
            context.res.status = 500;
            context.res.body = { error: 'Server configuration error' };
            return;
        }
        
        // 입력된 비밀번호 해시 생성
        const hash = crypto.createHash('sha256');
        hash.update(password + salt);
        const inputHash = hash.digest('hex');
        
        // 해시 비교 (시간 기반 공격 방지를 위한 안전한 비교)
        const isValid = crypto.timingSafeEqual(
            Buffer.from(inputHash.substring(0, 32), 'hex'),
            Buffer.from(adminPasswordHash, 'hex')
        );
        
        if (isValid) {
            // JWT 토큰 생성 (간단한 버전)
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = Date.now() + (4 * 60 * 60 * 1000); // 4시간
            
            context.log('Admin authentication successful');
            
            context.res.status = 200;
            context.res.body = {
                success: true,
                token: sessionToken,
                expiresAt: expiresAt,
                message: '인증 성공'
            };
        } else {
            context.log('Admin authentication failed - invalid password');
            
            // 실패 시 의도적으로 지연 (브루트 포스 방지)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            context.res.status = 401;
            context.res.body = {
                success: false,
                error: '비밀번호가 올바르지 않습니다'
            };
        }

    } catch (error) {
        context.log.error('Admin authentication error:', error);
        
        context.res.status = 500;
        context.res.body = {
            success: false,
            error: '인증 서버 오류'
        };
    }
};
