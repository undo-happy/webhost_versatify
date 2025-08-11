import { useMemo, useState, useEffect } from 'react';
import { createApi } from '../lib/api';
import type { Draft } from '../lib/types';
import { useSettings } from '../state/SettingsContext';
import { useDrafts } from '../state/DraftsContext';
import { useAuth } from '@clerk/clerk-react';

function pretty(obj: unknown) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}

export default function Generate() {
  const { apiBaseUrl, authToken } = useSettings();
  const { getToken } = useAuth();
  const { addDraft } = useDrafts();
  
  // Create API client with current auth
  const createApiClient = async () => {
    const clerkToken = await getToken();
    const token = clerkToken || authToken;
    return createApi(apiBaseUrl, token);
  };

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
  const [publishWpCategories, setPublishWpCategories] = useState('');
  const [publishWpTags, setPublishWpTags] = useState('');

  const [tistoryVisibility, setTistoryVisibility] = useState(3);
  const [tistoryCategory, setTistoryCategory] = useState('');
  const [tistoryTag, setTistoryTag] = useState('');

  const [resultLog, setResultLog] = useState('');

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContentHtml(draft.content_html);
    }
  }, [draft]);

  const parsedOutline = useMemo(() => outline.split('\n').map(s => s.trim()).filter(Boolean).map((l) => l.replace(/^[-•]\s*/, '')), [outline]);

  function toNumberArray(csv: string): number[] | undefined {
    const arr = csv.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
    return arr.length ? arr : undefined;
  }

  async function onGenerateDraft(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null); setResultLog('');
    try {
      if (!topic.trim()) throw new Error('주제를 입력하세요.');
      const api = await createApiClient();
      const data = await api.generateBlog({
        topic: topic.trim(),
        style: style.trim() || undefined,
        outline: parsedOutline.length ? parsedOutline : undefined,
        targetLength: Number.isFinite(targetLength) ? targetLength : undefined,
        language: language.trim() || undefined,
      });
      setDraft(data);
      addDraft(data);
    } catch (err: any) { setError(err.message || String(err)); }
    finally { setIsLoading(false); }
  }

  async function onGenerateAndPublish(platform: 'wordpress'|'tistory') {
    setIsLoading(true); setError(null); setResultLog('');
    try {
      if (!authToken) throw new Error('Clerk JWT 토큰을 설정하세요.');
      if (!topic.trim()) throw new Error('주제를 입력하세요.');
      const payload: any = {
        topic: topic.trim(), style: style.trim() || undefined,
        outline: parsedOutline.length ? parsedOutline : undefined,
        targetLength: Number.isFinite(targetLength) ? targetLength : undefined,
        language: language.trim() || undefined,
        publish: true, platform,
      };
      if (platform === 'wordpress') {
        payload.wpOptions = { status: publishWpStatus, categories: toNumberArray(publishWpCategories), tags: toNumberArray(publishWpTags) };
      } else {
        payload.tistoryOptions = { visibility: tistoryVisibility, category: tistoryCategory ? Number(tistoryCategory) : undefined, tag: tistoryTag || undefined };
      }
      const api = await createApiClient();
      const res = await api.generateAndPublish(payload);
      setDraft(res.draft);
      addDraft(res.draft);
      setResultLog(pretty(res.publishResult));
    } catch (err: any) { setError(err.message || String(err)); }
    finally { setIsLoading(false); }
  }

  async function onPublishWordpress() {
    setIsLoading(true); setError(null); setResultLog('');
    try {
      if (!title.trim() || !contentHtml.trim()) throw new Error('제목과 콘텐츠가 필요합니다.');
      const api = await createApiClient();
      const res = await api.publishWordpress({ title: title.trim(), content: contentHtml, status: publishWpStatus, categories: toNumberArray(publishWpCategories), tags: toNumberArray(publishWpTags) });
      setResultLog(pretty(res));
    } catch (err: any) { setError(err.message || String(err)); }
    finally { setIsLoading(false); }
  }

  async function onPublishTistory() {
    setIsLoading(true); setError(null); setResultLog('');
    try {
      if (!title.trim() || !contentHtml.trim()) throw new Error('제목과 콘텐츠가 필요합니다.');
      const api = await createApiClient();
      const res = await api.publishTistory({ title: title.trim(), content: contentHtml, visibility: tistoryVisibility, category: tistoryCategory ? Number(tistoryCategory) : undefined, tag: tistoryTag || undefined });
      setResultLog(pretty(res));
    } catch (err: any) { setError(err.message || String(err)); }
    finally { setIsLoading(false); }
  }

  async function onQueue(platform: 'wordpress'|'tistory') {
    setIsLoading(true); setError(null); setResultLog('');
    try {
      if (!title.trim() || !contentHtml.trim()) throw new Error('제목과 콘텐츠가 필요합니다.');
      const payload: any = { title: title.trim(), content: contentHtml };
      if (platform === 'wordpress') {
        payload.status = publishWpStatus; payload.categories = toNumberArray(publishWpCategories); payload.tags = toNumberArray(publishWpTags);
      } else {
        payload.visibility = tistoryVisibility; payload.category = tistoryCategory ? Number(tistoryCategory) : undefined; payload.tag = tistoryTag || undefined;
      }
      const api = await createApiClient();
      const res = await api.enqueuePublish({ platform, payload });
      setResultLog(pretty(res));
    } catch (err: any) { setError(err.message || String(err)); }
    finally { setIsLoading(false); }
  }

  return (
    <>
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
    </>
  );
}