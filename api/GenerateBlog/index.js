const { checkAuth, addAuthInfo } = require('../_auth');
const DEFAULT_MODEL = process.env.UPSTAGE_MODEL || 'solar-pro2';

// SEO 최적화된 블로그 템플릿
const blogTemplates = {
  informative: {
    structure: ['introduction', 'main_sections', 'conclusion', 'call_to_action'],
    seoFocus: 'keyword_density',
    headingStructure: 'h1->h2->h3'
  },
  tutorial: {
    structure: ['overview', 'prerequisites', 'step_by_step', 'troubleshooting', 'conclusion'],
    seoFocus: 'featured_snippets',
    headingStructure: 'h1->h2->h3'
  },
  review: {
    structure: ['introduction', 'features', 'pros_cons', 'rating', 'conclusion'],
    seoFocus: 'schema_markup',
    headingStructure: 'h1->h2->h3'
  },
  listicle: {
    structure: ['introduction', 'numbered_items', 'summary', 'conclusion'],
    seoFocus: 'readability',
    headingStructure: 'h1->h2'
  }
};

function buildSEOPrompt({ topic, style = 'informative', outline = [], targetLength = 1200, language = 'ko', keywords = [] }) {
    const template = blogTemplates[style] || blogTemplates.informative;
    const keywordText = keywords.length ? `\nTarget keywords: ${keywords.join(', ')}` : '';
    const outlineText = outline && outline.length ? `\nUse/Refine this outline:\n- ${outline.join('\n- ')}` : '';
    
    const seoRequirements = `\nSEO Requirements:
- Use ${template.headingStructure} heading hierarchy
- Include target keywords naturally (1-3% density)
- Create engaging meta title and description
- Add internal link opportunities (use <a href="#" class="internal-link">text</a>)
- Include alt text for images: <img src="placeholder.jpg" alt="descriptive alt text">
- Optimize for featured snippets with clear answers
- Use semantic HTML5 tags (article, section, aside)
- Add FAQ section if relevant`;
    
    return `Topic: ${topic}\nStyle: ${style} (${template.structure.join(' -> ')})\nTarget length: ~${targetLength} words\nLanguage: ${language}${keywordText}${outlineText}${seoRequirements}\n\nReturn ONLY well-structured, SEO-optimized HTML with semantic tags, proper heading hierarchy, and natural keyword integration.`;
}

function buildPrompt({ topic, style = 'informative', outline = [], targetLength = 1200, language = 'ko' }) {
    const outlineText = outline && outline.length ? `\nUse/Refine this outline:\n- ${outline.join('\n- ')}` : '';
    return `Topic: ${topic}\nStyle: ${style}\nTarget length: ~${targetLength} words\nLanguage: ${language}${outlineText}\nReturn ONLY well-structured HTML (h1/h2/h3, p, ul/ol, img placeholders).`;
}

// SEO 최적화된 메타데이터 추출
function extractSEOMetadata(html, topic, language = 'ko') {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // 더 나은 요약 생성 (첫 번째 문단 우선)
    const firstParagraph = html.match(/<p[^>]*>([^<]+)</i)?.[1]?.trim();
    const summary = firstParagraph && firstParagraph.length > 50 
        ? (firstParagraph.length > 155 ? firstParagraph.slice(0, 152) + '...' : firstParagraph)
        : (text.length > 155 ? text.slice(0, 152) + '...' : text);
    
    // 향상된 키워드 추출
    const words = text.toLowerCase().split(/[^a-zA-Z0-9가-힣]+/).filter(w => w.length > 2);
    const freq = {};
    const stopWords = language === 'ko' 
        ? ['있습니다', '합니다', '됩니다', '입니다', '그리고', '하지만', '그러나', '또한', '이러한', '그것', '이것', '저것']
        : ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those'];
    
    for (const w of words) {
        if (!stopWords.includes(w) && w.length > 2) {
            freq[w] = (freq[w] || 0) + 1;
        }
    }
    
    const keywords = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).slice(0,8);
    
    // SEO 제목 생성 (topic 기반, 60자 제한)
    const seoTitle = topic.length <= 60 ? topic : topic.slice(0, 57) + '...';
    
    // 구조화된 데이터 추출
    const headings = {
        h1: (html.match(/<h1[^>]*>([^<]+)</gi) || []).map(h => h.replace(/<[^>]+>/g, '')),
        h2: (html.match(/<h2[^>]*>([^<]+)</gi) || []).map(h => h.replace(/<[^>]+>/g, '')),
        h3: (html.match(/<h3[^>]*>([^<]+)</gi) || []).map(h => h.replace(/<[^>]+>/g, ''))
    };
    
    const images = (html.match(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi) || []).map(img => {
        const altMatch = img.match(/alt=["']([^"']+)["']/);
        return altMatch ? altMatch[1] : '';
    });
    
    return {
        summary,
        keywords,
        seoTitle,
        meta_description: summary,
        structure: {
            headings,
            images,
            wordCount: words.length,
            readingTime: Math.ceil(words.length / 200) // 분당 200단어 가정
        }
    };
}

module.exports = async function (context, req) {
    context.log('GenerateBlog function invoked');

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
        // 체험 모드 지원: 인증 선택적, rate limiting 적용
        const rateLimitOptions = { requests: 5, windowMs: 300000 }; // 5분간 5회
        const auth = await checkAuth(req, 'optional', rateLimitOptions);
        context.log('Auth result:', auth.authLevel, auth.isAuthenticated ? 'authenticated' : 'trial mode');
        
        if (auth.rateLimit && !auth.rateLimit.allowed) {
            context.res.status = 429;
            context.res.body = { 
                error: 'Rate limit exceeded', 
                retryAfter: auth.rateLimit.retryAfter,
                message: 'Too many requests from trial mode. Please sign up for unlimited access.'
            };
            return;
        }

        const apiKey = process.env.UPSTAGE_API_KEY;
        const isDev = process.env.NODE_ENV === 'development' || !apiKey || apiKey === 'test_key_for_development';
        
        if (!isDev && !apiKey) {
            context.res.status = 500;
            context.res.body = { error: 'UPSTAGE_API_KEY not configured' };
            return;
        }

        const { topic, style, outline, targetLength, language, keywords, seoOptimized = false } = req.body || {};
        if (!topic) {
            context.res.status = 400;
            context.res.body = addAuthInfo({ error: 'topic is required' }, auth);
            return;
        }

        // 체험 모드에서는 생성 횟수 제한 (향후 구현)
        if (!auth.isAuthenticated) {
            context.log('Trial mode: generating blog without authentication');
            // TODO: 체험 사용자 Rate Limiting 추가
        }

        let content = '';
        
        if (isDev) {
            // 개발 환경용 SEO 최적화된 mock 응답
            const mockKeywords = keywords && keywords.length ? keywords : ['주요키워드', '보조키워드'];
            content = `<article>
<header>
<h1>${topic}</h1>
<p class="meta">읽는 시간: 약 ${Math.ceil((targetLength || 1200) / 200)}분 | 업데이트: ${new Date().toLocaleDateString('ko-KR')}</p>
</header>

<section class="introduction">
<p>이 블로그 글은 "${topic}"에 대한 ${style || '정보성'} 가이드입니다. <strong>${mockKeywords[0] || '주요키워드'}</strong>에 대해 상세히 알아보고 실용적인 정보를 제공합니다.</p>
</section>

<section class="main-content">
<h2>${mockKeywords[0] || '주요키워드'}란 무엇인가?</h2>
<p>${language === 'ko' ? '한국어로 작성된' : 'English'} 블로그 콘텐츠입니다. 목표 길이는 약 ${targetLength || 1200}단어입니다. <a href="#" class="internal-link">관련 문서</a>에서 더 자세한 정보를 확인할 수 있습니다.</p>

<img src="placeholder.jpg" alt="${topic} 관련 이미지 설명" style="width:100%; height:300px; background:#f0f0f0; display:flex; align-items:center; justify-content:center;">

<h3>핵심 포인트</h3>
<ul>
<li><strong>첫 번째 주요 포인트</strong>: ${mockKeywords[0] || '키워드'}와 관련된 중요한 정보</li>
<li><strong>두 번째 주요 포인트</strong>: ${mockKeywords[1] || '보조키워드'}의 실용적 활용법</li>
<li><strong>세 번째 주요 포인트</strong>: 실제 적용 사례와 팁</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>
<div class="faq">
<h3>Q: ${topic}는 어떻게 시작하나요?</h3>
<p>A: ${mockKeywords[0] || '주요키워드'}를 이해하는 것부터 시작하시면 됩니다.</p>

<h3>Q: 주의할 점이 있나요?</h3>
<p>A: 네, ${mockKeywords[1] || '보조키워드'}를 고려하여 단계별로 접근하는 것이 중요합니다.</p>
</div>
</section>

<section class="conclusion">
<h2>결론</h2>
<p>이 글에서는 <strong>${topic}</strong>에 대한 포괄적인 정보를 다뤘습니다. ${mockKeywords[0] || '주요키워드'}와 ${mockKeywords[1] || '보조키워드'}를 이해하시면 더 나은 결과를 얻을 수 있을 것입니다.</p>

<div class="call-to-action">
<p><strong>다음 단계:</strong> 이 정보가 도움이 되셨나요? <a href="#" class="internal-link">추가 리소스</a>를 확인해보세요.</p>
</div>
</section>
</article>`;
        } else {
            // 실제 API 호출
            const system = seoOptimized 
                ? 'You are a senior SEO content writer and digital marketing expert. Create high-quality, search engine optimized content that ranks well while providing genuine value to readers. Use semantic HTML5, proper heading hierarchy, natural keyword integration, and structure for featured snippets.'
                : 'You are a senior SEO content writer. Produce factual, non-plagiarized, well-structured HTML content with semantic tags and logical flow.';
            
            const user = seoOptimized 
                ? buildSEOPrompt({ topic, style, outline, targetLength, language, keywords })
                : buildPrompt({ topic, style, outline, targetLength, language });

            const body = {
                model: DEFAULT_MODEL,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ],
                temperature: 0.7,
                reasoning_effort: 'high'
            };

            const resp = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                const text = await resp.text();
                context.log.error('Upstage API error:', resp.status, text);
                context.res.status = 502;
                context.res.body = { error: 'LLM generation failed', detail: text };
                return;
            }

            const data = await resp.json();
            content = data.choices?.[0]?.message?.content || '';
        }
        const title = topic.length < 80 ? topic : topic.slice(0,77) + '...';
        const metadata = extractSEOMetadata(content, topic, language);
        const meta_title = metadata.seoTitle;
        const meta_description = metadata.meta_description;

        const responseData = {
            title,
            content_html: content,
            summary: metadata.summary,
            keywords: metadata.keywords,
            meta_title,
            meta_description,
            seo_data: {
                structure: metadata.structure,
                reading_time: metadata.structure.readingTime,
                word_count: metadata.structure.wordCount,
                headings_count: {
                    h1: metadata.structure.headings.h1.length,
                    h2: metadata.structure.headings.h2.length,
                    h3: metadata.structure.headings.h3.length
                },
                images_with_alt: metadata.structure.images.length,
                seo_optimized: seoOptimized || false
            }
        };

        context.res.status = 200;
        context.res.body = addAuthInfo(responseData, auth);
    } catch (err) {
        context.log.error('GenerateBlog error:', err);
        context.res.status = 500;
        context.res.body = { error: 'Internal server error', message: err.message };
    }
};