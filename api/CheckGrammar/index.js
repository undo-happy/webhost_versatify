const { checkAuth, addAuthInfo } = require('../_auth');

// 간단한 한국어 문법 체크 룰
const koreanGrammarRules = [
  {
    pattern: /([가-힣]+)을를/g,
    message: '조사 사용이 맞지 않습니다',
    suggestion: '올바른 조사를 사용하세요 (을/를)',
    severity: 'error'
  },
  {
    pattern: /([가-힣]+)이가/g,
    message: '조사 사용이 맞지 않습니다',
    suggestion: '올바른 조사를 사용하세요 (이/가)',
    severity: 'error'
  },
  {
    pattern: /([가-힣]+)에서로/g,
    message: '조사 사용이 맞지 않습니다',
    suggestion: '올바른 조사를 사용하세요 (에서/로)',
    severity: 'error'
  },
  {
    pattern: /\s{2,}/g,
    message: '불필요한 공백이 있습니다',
    suggestion: '공백을 하나로 줄이세요',
    severity: 'warning'
  },
  {
    pattern: /[.!?]\s*[가-힣]/g,
    message: '문장 끝 뒤에 공백이 필요합니다',
    suggestion: '문장 끝 뒤에 공백을 추가하세요',
    severity: 'warning'
  },
  {
    pattern: /([가-힣]+)\s*,\s*([가-힣]+)/g,
    message: '쉼표 뒤에 공백이 일관되지 않습니다',
    suggestion: '쉼표 뒤에 공백을 하나 추가하세요',
    severity: 'info'
  }
];

// 영어 문법 체크 룰
const englishGrammarRules = [
  {
    pattern: /\ba\s+[aeiouAEIOU]/g,
    message: 'Use "an" before vowel sounds',
    suggestion: 'Change "a" to "an"',
    severity: 'error'
  },
  {
    pattern: /\ban\s+[^aeiouAEIOU]/g,
    message: 'Use "a" before consonant sounds',
    suggestion: 'Change "an" to "a"',
    severity: 'error'
  },
  {
    pattern: /\s{2,}/g,
    message: 'Multiple spaces found',
    suggestion: 'Use single space',
    severity: 'warning'
  },
  {
    pattern: /[.!?][a-zA-Z]/g,
    message: 'Missing space after punctuation',
    suggestion: 'Add space after punctuation',
    severity: 'warning'
  },
  {
    pattern: /\b(dont|cant|wont|shouldnt|wouldnt)\b/gi,
    message: 'Missing apostrophe in contraction',
    suggestion: "Add apostrophe (don't, can't, won't, shouldn't, wouldn't)",
    severity: 'error'
  }
];

// AI 기반 문법 검사 (Upstage API 사용)
async function aiGrammarCheck(text, language = 'ko') {
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    throw new Error('UPSTAGE_API_KEY not configured');
  }

  const system = language === 'ko' 
    ? '당신은 한국어 문법 검사 전문가입니다. 주어진 텍스트의 문법, 맞춤법, 띄어쓰기 오류를 찾아 JSON 형태로 반환하세요.'
    : 'You are an English grammar checker. Find grammar, spelling, and punctuation errors in the given text and return in JSON format.';
    
  const user = `다음 텍스트를 검사하고 오류를 JSON 배열로 반환하세요:
  
텍스트: ${text}

반환 형식:
{
  "errors": [
    {
      "position": 10,
      "length": 5,
      "original": "틀린 부분",
      "suggestion": "올바른 수정",
      "message": "오류 설명",
      "severity": "error|warning|info"
    }
  ],
  "score": 85,
  "summary": "문법 검사 요약"
}`;

  const body = {
    model: 'solar-pro2',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.3,
    max_tokens: 2000
  };

  try {
    const resp = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      throw new Error(`AI grammar check failed: ${resp.status}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch {
      // AI가 JSON이 아닌 형태로 응답한 경우 기본값 반환
      return {
        errors: [],
        score: 80,
        summary: 'AI 문법 검사를 완료했지만 구체적인 오류를 파싱할 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('AI grammar check error:', error);
    return {
      errors: [],
      score: 70,
      summary: 'AI 문법 검사 중 오류가 발생했습니다.'
    };
  }
}

// 기본 문법 검사 (규칙 기반)
function basicGrammarCheck(text, language = 'ko') {
  const rules = language === 'ko' ? koreanGrammarRules : englishGrammarRules;
  const errors = [];
  
  rules.forEach(rule => {
    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      errors.push({
        position: match.index,
        length: match[0].length,
        original: match[0],
        suggestion: rule.suggestion,
        message: rule.message,
        severity: rule.severity
      });
    }
  });

  // 점수 계산 (오류가 적을수록 높은 점수)
  const errorCount = errors.length;
  const textLength = text.length;
  const errorRate = textLength > 0 ? (errorCount / (textLength / 100)) : 0;
  const score = Math.max(0, Math.min(100, 100 - (errorRate * 5)));

  return {
    errors,
    score: Math.round(score),
    summary: `${errorCount}개의 문법 오류를 발견했습니다.`
  };
}

// 가독성 분석
function analyzeReadability(text, language = 'ko') {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgCharsPerWord = words.length > 0 ? 
    words.reduce((sum, word) => sum + word.replace(/<[^>]*>/g, '').length, 0) / words.length : 0;

  let readabilityScore = 100;
  
  if (language === 'ko') {
    // 한국어 가독성 기준
    if (avgWordsPerSentence > 25) readabilityScore -= 20;
    else if (avgWordsPerSentence > 20) readabilityScore -= 10;
    
    if (avgCharsPerWord > 4) readabilityScore -= 15;
  } else {
    // 영어 가독성 기준 (Flesch Reading Ease 간단 버전)
    if (avgWordsPerSentence > 20) readabilityScore -= 20;
    else if (avgWordsPerSentence > 15) readabilityScore -= 10;
    
    if (avgCharsPerWord > 6) readabilityScore -= 15;
  }

  return {
    score: Math.max(0, readabilityScore),
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
    totalSentences: sentences.length,
    totalWords: words.length
  };
}

module.exports = async function (context, req) {
  context.log('CheckGrammar function invoked');

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
    // 인증 체크 (선택적, Rate limiting 적용)
    const rateLimitOptions = { requests: 10, windowMs: 300000 }; // 5분간 10회
    const auth = await checkAuth(req, 'optional', rateLimitOptions);
    context.log('Grammar check request, auth level:', auth.authLevel);

    if (auth.rateLimit && !auth.rateLimit.allowed) {
      context.res.status = 429;
      context.res.body = { 
        error: 'Rate limit exceeded', 
        retryAfter: auth.rateLimit.retryAfter,
        message: 'Too many grammar check requests. Please wait or sign up for unlimited access.'
      };
      return;
    }

    const { text, language = 'ko', useAI = false } = req.body || {};
    
    if (!text) {
      context.res.status = 400;
      context.res.body = addAuthInfo({ error: 'text is required' }, auth);
      return;
    }

    // HTML 태그 제거
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanText.length === 0) {
      context.res.status = 400;
      context.res.body = addAuthInfo({ error: 'text content is empty after cleaning' }, auth);
      return;
    }

    // 기본 문법 검사
    const basicCheck = basicGrammarCheck(cleanText, language);
    
    // 가독성 분석
    const readability = analyzeReadability(cleanText, language);

    let result = {
      grammar: basicCheck,
      readability,
      analysis: {
        textLength: cleanText.length,
        wordCount: cleanText.split(/\s+/).filter(w => w.length > 0).length,
        sentenceCount: readability.totalSentences,
        language
      }
    };

    // AI 문법 검사 (인증된 사용자 또는 요청시)
    if ((auth.isAuthenticated || useAI) && cleanText.length < 5000) {
      try {
        const aiCheck = await aiGrammarCheck(cleanText, language);
        result.aiGrammar = aiCheck;
      } catch (error) {
        context.log.warn('AI grammar check failed:', error.message);
        result.aiGrammar = { 
          error: 'AI 문법 검사를 사용할 수 없습니다',
          fallback: true 
        };
      }
    }

    context.res.status = 200;
    context.res.body = addAuthInfo(result, auth);
  } catch (err) {
    context.log.error('CheckGrammar error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};