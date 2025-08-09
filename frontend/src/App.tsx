import { useEffect, useMemo, useState } from 'react';

type Draft = {
  title: string;
  content_html: string;
  summary: string;
  keywords: string[];
  meta_title: string;
  meta_description: string;
};

type ApiResult<T> = {
  ok?: boolean;
  error?: string;
  detail?: unknown;
} & Partial<T>;

function useLocalStorage(key: string, initialValue: string) {
  const [value, setValue] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

function pretty(obj: unknown) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useLocalStorage(
    'apiBaseUrl',
    (import.meta as any).env?.VITE_API_BASE_URL || '/api'
  );
  const [authToken, setAuthToken] = useLocalStorage('authToken', '');

  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('informative');
  const [outline, setOutline] = useState('');
  const [targetLength, setTargetLength] = useState<number>(1200);
  const [language, setLanguage] = useState('ko');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');

  const [publishWpStatus, setPublishWpStatus] = useState<'draft' | 'publish'>('draft');
  const [publishWpCategories, setPublishWpCategories] = useState(''); // comma-separated ids
  const [publishWpTags, setPublishWpTags] = useState(''); // comma-separated ids

  const [tistoryVisibility, setTistoryVisibility] = useState(3);
  const [tistoryCategory, setTistoryCategory] = useState<string>('');
  const [tistoryTag, setTistoryTag] = useState('');

  const [resultLog, setResultLog] = useState<string>('');

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContentHtml(draft.content_html);
    }
  }, [draft]);

  const parsedOutline = useMemo(() => {
    const lines = outline
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => (l.startsWith('-') ? l.replace(/^[-•]\s*/, '') : l));
    return lines;
  }, [outline]);

  async function callApi<T>(path: string, payload: unknown, token?: string): Promise<T> {
    const url = apiBaseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload ?? {}),
    });
    const contentType = resp.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
    if (!resp.ok) {
      throw new Error(typeof body === 'string' ? body : body?.error || 'Request failed');
    }
    return body as T;
  }

  async function onGenerateDraft(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResultLog('');
    try {
      const payload = {
        topic: topic.trim(),
        style: style.trim() || undefined,
        outline: parsedOutline.length ? parsedOutline : undefined,
        targetLength: Number.isFinite(targetLength) ? targetLength : undefined,
        language: language.trim() || undefined,
      };
      if (!payload.topic) throw new Error('주제(topic)를 입력하세요.');
      const data = await callApi<Draft>('generate-blog', payload);
      setDraft(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function onGenerateAndPublish(platform: 'wordpress' | 'tistory') {
    setIsLoading(true);
    setError(null);
    setResultLog('');
    try {
      if (!authToken) throw new Error('인증 토큰이 필요합니다 (Clerk JWT). 설정에서 입력하세요.');
      if (!topic.trim()) throw new Error('주제(topic)를 입력하세요.');
      const payload: any = {
        topic: topic.trim(),
        style: style.trim() || undefined,
        outline: parsedOutline.length ? parsedOutline : undefined,
        targetLength: Number.isFinite(targetLength) ? targetLength : undefined,
        language: language.trim() || undefined,
        publish: true,
        platform,
      };
      if (platform === 'wordpress') {
        payload.wpOptions = {
          status: publishWpStatus,
          categories: toNumberArray(publishWpCategories),
          tags: toNumberArray(publishWpTags),
        };
      } else if (platform === 'tistory') {
        payload.tistoryOptions = {
          visibility: tistoryVisibility,
          category: tistoryCategory ? Number(tistoryCategory) : undefined,
          tag: tistoryTag || undefined,
        };
      }
      const res = await callApi<{ draft: Draft; publishResult: unknown }>('generate-and-publish', payload, authToken);
      setDraft(res.draft);
      setResultLog(pretty(res.publishResult));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  function toNumberArray(csv: string): number[] | undefined {
    const arr = csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    return arr.length ? arr : undefined;
  }

  async function onPublishWordpress() {
    setIsLoading(true);
    setError(null);
    setResultLog('');
    try {
      if (!title.trim() || !contentHtml.trim()) throw new Error('제목과 콘텐츠가 필요합니다.');
      const payload = {
        title: title.trim(),
        content: contentHtml,
        status: publishWpStatus,
        categories: toNumberArray(publishWpCategories),
        tags: toNumberArray(publishWpTags),
      };
      const res = await callApi<ApiResult<unknown>>('publish/wordpress', payload);
      setResultLog(pretty(res));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function onPublishTistory() {
    setIsLoading(true);
    setError(null);
    setResultLog('');
    try {
      if (!title.trim() || !contentHtml.trim()) throw new Error('제목과 콘텐츠가 필요합니다.');
      const payload = {
        title: title.trim(),
        content: contentHtml,
        visibility: tistoryVisibility,
        category: tistoryCategory ? Number(tistoryCategory) : undefined,
        tag: tistoryTag || undefined,
      };
      const res = await callApi<ApiResult<unknown>>('publish/tistory', payload);
      setResultLog(pretty(res));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function onQueue(platform: 'wordpress' | 'tistory') {
    setIsLoading(true);
    setError(null);
    setResultLog('');
    try {
      if (!title.trim() || !contentHtml.trim()) throw new Error('제목과 콘텐츠가 필요합니다.');
      const payload: any = { title: title.trim(), content: contentHtml };
      if (platform === 'wordpress') {
        payload.status = publishWpStatus;
        payload.categories = toNumberArray(publishWpCategories);
        payload.tags = toNumberArray(publishWpTags);
      } else if (platform === 'tistory') {
        payload.visibility = tistoryVisibility;
        payload.category = tistoryCategory ? Number(tistoryCategory) : undefined;
        payload.tag = tistoryTag || undefined;
      }
      const res = await callApi<ApiResult<unknown>>('enqueue/publish', { platform, payload });
      setResultLog(pretty(res));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>블로그 생성기</h1>

      <section className="card">
        <h2>설정</h2>
        <div className="grid2">
          <label>
            <span>API Base URL</span>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="예: /api 또는 http://localhost:7071/api"
            />
          </label>
          <label>
            <span>인증 토큰 (Clerk JWT, 선택)</span>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Generate & Publish 에만 필요"
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>초안 생성</h2>
        <form onSubmit={onGenerateDraft} className="form">
          <label>
            <span>주제 (Topic)</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: TypeScript 제너릭 가이드" />
          </label>
          <div className="grid3">
            <label>
              <span>스타일</span>
              <input value={style} onChange={(e) => setStyle(e.target.value)} />
            </label>
            <label>
              <span>목표 길이</span>
              <input type="number" value={targetLength} onChange={(e) => setTargetLength(Number(e.target.value))} />
            </label>
            <label>
              <span>언어</span>
              <input value={language} onChange={(e) => setLanguage(e.target.value)} />
            </label>
          </div>
          <label>
            <span>아웃라인 (한 줄에 한 항목, '-' 생략 가능)</span>
            <textarea value={outline} onChange={(e) => setOutline(e.target.value)} rows={5} placeholder={"- 서론\n- 핵심 개념\n- 예제 코드\n- 결론"} />
          </label>
          <div className="row">
            <button type="submit" disabled={isLoading}>초안 생성</button>
            <button type="button" onClick={() => onGenerateAndPublish('wordpress')} disabled={isLoading}>생성 후 WP 발행</button>
            <button type="button" onClick={() => onGenerateAndPublish('tistory')} disabled={isLoading}>생성 후 티스토리 발행</button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>초안 편집 & 미리보기</h2>
        <div className="grid2">
          <label>
            <span>제목</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <div />
        </div>
        <div className="grid2">
          <label>
            <span>HTML 콘텐츠</span>
            <textarea value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={18} />
          </label>
          <div>
            <span className="label">미리보기</span>
            <div className="preview" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        </div>
        {draft && (
          <details className="meta">
            <summary>메타 정보</summary>
            <pre>{pretty({
              summary: draft.summary,
              keywords: draft.keywords,
              meta_title: draft.meta_title,
              meta_description: draft.meta_description,
            })}</pre>
          </details>
        )}
      </section>

      <section className="card">
        <h2>발행</h2>
        <div className="grid2">
          <div>
            <h3>WordPress</h3>
            <div className="grid2">
              <label>
                <span>상태</span>
                <select value={publishWpStatus} onChange={(e) => setPublishWpStatus(e.target.value as any)}>
                  <option value="draft">draft</option>
                  <option value="publish">publish</option>
                </select>
              </label>
              <label>
                <span>카테고리 ID들 (쉼표)</span>
                <input value={publishWpCategories} onChange={(e) => setPublishWpCategories(e.target.value)} placeholder="예: 2,5" />
              </label>
            </div>
            <label>
              <span>태그 ID들 (쉼표)</span>
              <input value={publishWpTags} onChange={(e) => setPublishWpTags(e.target.value)} placeholder="예: 7,9" />
            </label>
            <div className="row">
              <button onClick={onPublishWordpress} disabled={isLoading}>WP 바로 발행</button>
              <button onClick={() => onQueue('wordpress')} disabled={isLoading}>WP 큐에 넣기</button>
            </div>
          </div>
          <div>
            <h3>티스토리</h3>
            <div className="grid3">
              <label>
                <span>공개 범위</span>
                <select value={tistoryVisibility} onChange={(e) => setTistoryVisibility(Number(e.target.value))}>
                  <option value={0}>비공개(0)</option>
                  <option value={1}>보호(1)</option>
                  <option value={3}>공개(3)</option>
                </select>
              </label>
              <label>
                <span>카테고리 ID</span>
                <input value={tistoryCategory} onChange={(e) => setTistoryCategory(e.target.value)} />
              </label>
              <label>
                <span>태그 (쉼표)</span>
                <input value={tistoryTag} onChange={(e) => setTistoryTag(e.target.value)} />
              </label>
            </div>
            <div className="row">
              <button onClick={onPublishTistory} disabled={isLoading}>티스토리 바로 발행</button>
              <button onClick={() => onQueue('tistory')} disabled={isLoading}>티스토리 큐에 넣기</button>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>결과</h2>
        {isLoading && <p>요청 중...</p>}
        {resultLog && <pre>{resultLog}</pre>}
      </section>

      <footer>
        <small>API 엔드포인트는 Azure Functions 기준으로 구성됨. CORS 허용 필요.</small>
      </footer>
    </div>
  );
}
