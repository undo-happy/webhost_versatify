import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import React, { useState } from 'react'

async function authedFetch(url: string, options: RequestInit = {}, getToken: () => Promise<string | null>) {
  const token = await getToken()
  const headers = new Headers(options.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  return fetch(url, { ...options, headers })
}

function Dashboard() {
  const { getToken } = useAuth()
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('informative')
  const [preview, setPreview] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await authedFetch('/api/generate-and-publish', {
        method: 'POST',
        body: JSON.stringify({ topic, style, publish: false })
      }, getToken)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setPreview(data.draft.content_html)
      setTitle(data.draft.title)
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function publish(platform: 'wordpress' | 'tistory') {
    if (!preview) return
    setLoading(true)
    setError('')
    try {
      const body: any = { topic, style, publish: true, platform }
      if (platform === 'wordpress') body.wpOptions = { status: 'draft' }
      if (platform === 'tistory') body.tistoryOptions = { visibility: 3 }
      const res = await authedFetch('/api/generate-and-publish', {
        method: 'POST',
        body: JSON.stringify(body)
      }, getToken)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      alert('Published: ' + JSON.stringify(data.publishResult))
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Blog Poster</h1>
        <UserButton />
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="주제 입력" />
        <select value={style} onChange={e => setStyle(e.target.value)}>
          <option value="informative">informative</option>
          <option value="conversational">conversational</option>
          <option value="technical">technical</option>
          <option value="marketing">marketing</option>
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={generate} disabled={loading || !topic}>초안 생성</button>
          <button onClick={() => publish('wordpress')} disabled={loading || !preview}>워드프레스 발행</button>
          <button onClick={() => publish('tistory')} disabled={loading || !preview}>티스토리 발행</button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div style={{ maxWidth: 480, margin: '48px auto', textAlign: 'center' }}>
          <h1>Blog Poster</h1>
          <p>로그인 후 사용하세요.</p>
          <SignInButton />
        </div>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  )
}