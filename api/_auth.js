const { verifyToken } = require('@clerk/backend');

// 간단한 인메모리 rate limiting (실제 운영환경에서는 Redis 등 사용)
const rateLimitStore = new Map();

/**
 * Rate limiting 체크
 * @param {string} identifier - IP 주소 또는 사용자 ID
 * @param {Object} limits - { requests: number, windowMs: number }
 * @returns {Object} - { allowed: boolean, remaining?: number, resetTime?: number }
 */
function checkRateLimit(identifier, limits = { requests: 10, windowMs: 60000 }) {
  const now = Date.now();
  const windowStart = now - limits.windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const requests = rateLimitStore.get(identifier);
  
  // 기간이 지난 요청들 제거
  const validRequests = requests.filter(time => time > windowStart);
  rateLimitStore.set(identifier, validRequests);
  
  if (validRequests.length >= limits.requests) {
    const oldestRequest = Math.min(...validRequests);
    const resetTime = oldestRequest + limits.windowMs;
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000)
    };
  }
  
  // 현재 요청 시간 기록
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return { 
    allowed: true, 
    remaining: limits.requests - validRequests.length 
  };
}

/**
 * 유연한 인증 레벨 체크
 * @param {Object} req - HTTP 요청 객체
 * @param {string} level - 인증 레벨: 'none', 'optional', 'required', 'strict'
 * @param {Object} rateLimitOptions - Rate limit 설정
 * @returns {Object} - { user, authLevel, isAuthenticated, limitations, rateLimit }
 */
async function checkAuth(req, level = 'optional', rateLimitOptions = null) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  const hasToken = header && header.toLowerCase().startsWith('bearer ');
  
  // 인증 불필요
  if (level === 'none') {
    return { 
      user: null, 
      authLevel: 'none', 
      isAuthenticated: false, 
      limitations: [] 
    };
  }
  
  // 토큰이 없는 경우 (체험 모드)
  if (!hasToken) {
    if (level === 'optional') {
      // 체험 모드용 rate limiting
      const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
      const rateLimit = rateLimitOptions ? checkRateLimit(`trial:${clientIp}`, rateLimitOptions) : { allowed: true };
      
      if (!rateLimit.allowed) {
        const err = new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`);
        err.status = 429;
        err.code = 'RATE_LIMIT_EXCEEDED';
        err.retryAfter = rateLimit.retryAfter;
        throw err;
      }
      
      return {
        user: null,
        authLevel: 'anonymous', 
        isAuthenticated: false,
        limitations: ['publish', 'save', 'queue'],
        rateLimit
      };
    }
    
    if (level === 'required' || level === 'strict') {
      const err = new Error('Authentication required');
      err.status = 401;
      err.code = 'AUTH_REQUIRED';
      throw err;
    }
  }
  
  // 토큰 검증
  try {
    const token = header.slice(7).trim();
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    if (!secretKey) {
      const err = new Error('Server auth configuration missing');
      err.status = 500;
      throw err;
    }
    
    const { sub, sid, email, claims } = await verifyToken(token, { secretKey });
    
    // 인증된 사용자도 rate limit (더 관대한 제한)
    const authenticatedRateLimit = rateLimitOptions ? checkRateLimit(`auth:${sub}`, {
      requests: rateLimitOptions.requests * 5, // 인증 사용자는 5배 더 많은 요청 허용
      windowMs: rateLimitOptions.windowMs
    }) : { allowed: true };
    
    return {
      user: { 
        userId: sub, 
        sessionId: sid, 
        email, 
        claims 
      },
      authLevel: 'authenticated',
      isAuthenticated: true,
      limitations: [],
      rateLimit: authenticatedRateLimit
    };
    
  } catch (tokenError) {
    // 토큰이 유효하지 않은 경우
    if (level === 'optional') {
      return {
        user: null,
        authLevel: 'invalid_token',
        isAuthenticated: false, 
        limitations: ['publish', 'save', 'queue'],
        error: 'Invalid authentication token'
      };
    }
    
    const err = new Error('Invalid authentication token');
    err.status = 401;
    err.code = 'INVALID_TOKEN';
    err.originalError = tokenError.message;
    throw err;
  }
}

/**
 * 기존 호환성을 위한 강제 인증 함수
 */
async function requireClerkAuth(req) {
  const auth = await checkAuth(req, 'required');
  return auth.user;
}

/**
 * 응답에 인증 상태 정보 추가
 */
function addAuthInfo(responseData, authResult) {
  return {
    ...responseData,
    _auth: {
      authenticated: authResult.isAuthenticated,
      level: authResult.authLevel,
      limitations: authResult.limitations,
      ...(authResult.error && { authError: authResult.error })
    }
  };
}

/**
 * 기능별 권한 체크
 */
function checkFeatureAccess(authResult, feature) {
  if (authResult.isAuthenticated) {
    return { allowed: true };
  }
  
  // 체험 모드에서 허용되는 기능들
  const trialAllowed = ['generate', 'preview', 'edit'];
  
  if (trialAllowed.includes(feature)) {
    return { allowed: true };
  }
  
  return { 
    allowed: false, 
    reason: `Feature '${feature}' requires authentication`,
    authRequired: true 
  };
}

module.exports = { 
  checkAuth, 
  requireClerkAuth, 
  addAuthInfo, 
  checkFeatureAccess,
  checkRateLimit
};