import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { generateDraft, publishPost } from '../lib/api'

export default function Studio() {
  return (
    <>
      <SignedOut>
        <div className="center">
          <h2>로그인이 필요합니다</h2>
          <SignInButton>로그인</SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <StudioInner />
      </SignedIn>
    </>
  )
}

function StudioInner() {
  const { getToken } = useAuth()
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('informative')
  const [outline, setOutline] = useState('')
  const [targetLength, setTargetLength] = useState<number>(1200)
  const [language, setLanguage] = useState('ko')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [draft, setDraft] = useState<{ title: string; content_html: string; summary: string; keywords: string[]; meta_title: string; meta_description: string } | null>(null)

  async function onGenerate() {
    setLoading(true); setError('')
    try {
      const outlineArr = outline ? outline.split('\n').map(s => s.trim()).filter(Boolean) : []
      const data = await generateDraft(getToken, { topic, style, outline: outlineArr, targetLength, language })
      const d = (data.draft ?? data)
      setDraft({
        title: d.title,
        content_html: d.content_html,
        summary: d.summary,
        keywords: d.keywords,
        meta_title: d.meta_title,
        meta_description: d.meta_description
      })
    } catch (e: any) {
      setError(e?.message || '생성 실패')
    } finally {
      setLoading(false)
    }
  }

  async function onPublish(platform: 'wordpress'|'tistory') {
    if (!draft) return
    setLoading(true); setError('')
    try {
      await publishPost(getToken, { topic, style, outline: outline ? outline.split('\n').filter(Boolean) : undefined, targetLength, language, platform })
      alert('발행 완료')
    } catch (e: any) {
      setError(e?.message || '발행 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="studio">
      <div className="panel">
        <h2>글 생성</h2>
        <label>주제
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 2025년 AI 트렌드" />
        </label>
        <label>스타일
          <select value={style} onChange={e => setStyle(e.target.value)}>
            <option value="informative">informative</option>
            <option value="conversational">conversational</option>
            <option value="technical">technical</option>
            <option value="marketing">marketing</option>
          </select>
        </label>
        <label>아웃라인(선택)
          <textarea rows={6} value={outline} onChange={e => setOutline(e.target.value)} placeholder={"- 서론\n- 본문1\n- 본문2\n- 결론"} />
        </label>
        <div className="grid2">
          <label>목표 길이
            <input type="number" min={300} step={100} value={targetLength} onChange={e => setTargetLength(Number(e.target.value))} />
          </label>
          <label>언어
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </label>
        </div>
        <div className="actions">
          <button className="button primary" onClick={onGenerate} disabled={loading || !topic}>초안 생성</button>
          <button className="button" onClick={() => onPublish('wordpress')} disabled={loading || !draft}>워드프레스 발행</button>
          <button className="button" onClick={() => onPublish('tistory')} disabled={loading || !draft}>티스토리 발행</button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="panel">
        <h2>미리보기</h2>
        {draft ? (
          <>
            <h3>{draft.title}</h3>
            <div className="meta">
              <div>메타 제목: {draft.meta_title}</div>
              <div>메타 설명: {draft.meta_description}</div>
              <div>키워드: {draft.keywords?.join(', ')}</div>
            </div>
            <div className="preview" dangerouslySetInnerHTML={{ __html: draft.content_html }} />
          </>
        ) : (
          <p>생성된 초안이 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  )
}