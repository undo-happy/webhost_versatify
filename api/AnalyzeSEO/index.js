const { checkAuth, addAuthInfo } = require('../_auth');

// 키워드 밀도 계산
function calculateKeywordDensity(text, keyword) {
  const cleanText = text.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^\w\s가-힣]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  if (totalWords === 0) return 0;
  
  const keywordCount = cleanText.split(keyword.toLowerCase()).length - 1;
  return ((keywordCount / totalWords) * 100).toFixed(2);
}

// SEO 점수 계산
function calculateSEOScore(content, title, metaDescription, keywords) {
  let score = 0;
  const issues = [];
  const suggestions = [];

  // 제목 검사 (20점)
  if (title && title.length >= 30 && title.length <= 60) {
    score += 20;
  } else if (title) {
    if (title.length < 30) {
      issues.push('제목이 너무 짧습니다 (권장: 30-60자)');
      suggestions.push('제목을 더 구체적이고 설명적으로 작성하세요');
      score += 10;
    } else if (title.length > 60) {
      issues.push('제목이 너무 깁니다 (권장: 30-60자)');
      suggestions.push('제목을 간결하게 줄이세요');
      score += 10;
    }
  } else {
    issues.push('제목이 없습니다');
  }

  // 메타 설명 검사 (15점)
  if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 155) {
    score += 15;
  } else if (metaDescription) {
    if (metaDescription.length < 120) {
      issues.push('메타 설명이 너무 짧습니다 (권장: 120-155자)');
      suggestions.push('메타 설명을 더 상세하게 작성하세요');
      score += 8;
    } else if (metaDescription.length > 155) {
      issues.push('메타 설명이 너무 깁니다 (권장: 120-155자)');
      suggestions.push('메타 설명을 간결하게 줄이세요');
      score += 8;
    }
  } else {
    issues.push('메타 설명이 없습니다');
  }

  // 콘텐츠 길이 검사 (15점)
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 300) {
    score += 15;
  } else {
    issues.push(`콘텐츠가 너무 짧습니다 (현재: ${wordCount}단어, 권장: 300단어 이상)`);
    suggestions.push('더 상세하고 유용한 내용을 추가하세요');
    score += Math.floor((wordCount / 300) * 15);
  }

  // 헤딩 구조 검사 (10점)
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  
  if (h1Count === 1 && h2Count >= 1) {
    score += 10;
  } else {
    if (h1Count === 0) {
      issues.push('H1 태그가 없습니다');
      suggestions.push('주요 제목에 H1 태그를 사용하세요');
    } else if (h1Count > 1) {
      issues.push('H1 태그가 여러 개입니다');
      suggestions.push('H1 태그는 페이지당 하나만 사용하세요');
    }
    if (h2Count === 0) {
      issues.push('H2 태그가 없습니다');
      suggestions.push('섹션 구분을 위해 H2 태그를 사용하세요');
    }
    score += 5;
  }

  // 이미지 Alt 태그 검사 (10점)
  const images = content.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = images.filter(img => /alt\s*=\s*["'][^"']*["']/i.test(img));
  
  if (images.length === 0) {
    score += 10; // 이미지가 없으면 만점
  } else if (imagesWithAlt.length === images.length) {
    score += 10;
  } else {
    issues.push(`${images.length - imagesWithAlt.length}개의 이미지에 Alt 텍스트가 없습니다`);
    suggestions.push('모든 이미지에 의미있는 Alt 텍스트를 추가하세요');
    score += Math.floor((imagesWithAlt.length / images.length) * 10);
  }

  // 키워드 밀도 검사 (20점)
  if (keywords && keywords.length > 0) {
    const mainKeyword = keywords[0];
    const density = parseFloat(calculateKeywordDensity(content, mainKeyword));
    
    if (density >= 1 && density <= 3) {
      score += 20;
    } else if (density > 0) {
      if (density < 1) {
        issues.push(`주요 키워드 "${mainKeyword}"의 밀도가 낮습니다 (${density}%, 권장: 1-3%)`);
        suggestions.push('주요 키워드를 적절히 더 사용하세요');
      } else {
        issues.push(`주요 키워드 "${mainKeyword}"의 밀도가 높습니다 (${density}%, 권장: 1-3%)`);
        suggestions.push('키워드 사용을 줄이고 자연스럽게 작성하세요');
      }
      score += 10;
    } else {
      issues.push(`주요 키워드 "${mainKeyword}"가 콘텐츠에 없습니다`);
      suggestions.push('주요 키워드를 콘텐츠에 자연스럽게 포함시키세요');
    }
  } else {
    issues.push('키워드가 설정되지 않았습니다');
    suggestions.push('타겟 키워드를 설정하세요');
  }

  // 내부 링크 검사 (10점)
  const internalLinks = (content.match(/<a[^>]*href\s*=\s*["'][^"']*["'][^>]*>/gi) || [])
    .filter(link => !link.includes('http'));
  
  if (internalLinks.length >= 2) {
    score += 10;
  } else {
    issues.push('내부 링크가 부족합니다');
    suggestions.push('관련된 다른 페이지로의 내부 링크를 2개 이상 추가하세요');
    score += internalLinks.length * 5;
  }

  return {
    score: Math.min(score, 100),
    issues,
    suggestions,
    details: {
      titleLength: title?.length || 0,
      metaDescriptionLength: metaDescription?.length || 0,
      wordCount,
      headingStructure: { h1: h1Count, h2: h2Count },
      imageCount: images.length,
      imagesWithAlt: imagesWithAlt.length,
      internalLinks: internalLinks.length,
      keywordDensity: keywords?.length > 0 ? calculateKeywordDensity(content, keywords[0]) : 0
    }
  };
}

// 키워드 추천 함수
function recommendKeywords(content, title) {
  const text = `${title} ${content}`.toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\w\s가-힣]/g, ' ');
  
  const words = text.split(/\s+/)
    .filter(w => w.length >= 2 && w.length <= 15)
    .filter(w => !/^\d+$/.test(w)); // 숫자만인 단어 제외

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // 빈도순으로 정렬하여 상위 키워드 추천
  const recommended = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      keyword: word,
      frequency: count,
      density: ((count / words.length) * 100).toFixed(2)
    }));

  return recommended;
}

// 가독성 분석
function analyzeReadability(content, language = 'ko') {
  const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgCharsPerWord = words.length > 0 ? 
    words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;

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
  context.log('AnalyzeSEO function invoked');

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
    // 인증 체크 (선택적)
    const auth = await checkAuth(req, 'optional');
    context.log('SEO analysis request, auth level:', auth.authLevel);

    const { content, title, metaDescription, keywords } = req.body || {};
    
    if (!content) {
      context.res.status = 400;
      context.res.body = addAuthInfo({ error: 'content is required' }, auth);
      return;
    }

    // SEO 분석 수행
    const seoAnalysis = calculateSEOScore(content, title, metaDescription, keywords);
    
    // 키워드 추천
    const recommendedKeywords = recommendKeywords(content, title || '');
    
    // 가독성 분석
    const readability = analyzeReadability(content);

    const responseData = {
      seo: seoAnalysis,
      recommendedKeywords,
      readability,
      analysis: {
        contentLength: content.length,
        readingTime: Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200), // 분 단위
        sentiment: 'positive' // TODO: 감정 분석 API 연동
      }
    };

    context.res.status = 200;
    context.res.body = addAuthInfo(responseData, auth);
  } catch (err) {
    context.log.error('AnalyzeSEO error:', err);
    context.res.status = 500;
    context.res.body = { error: 'Internal server error', message: err.message };
  }
};