import React from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="home">
      <h1>Versatify Blog Studio</h1>
      <p className="lead">주제만 입력하면 고품질 SEO 최적화 글을 생성하고, WordPress/Tistory로 바로 발행합니다.</p>
      <SignedOut>
        <div className="cta">
          <SignInButton>로그인하고 시작하기</SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="cta">
          <Link className="button primary" to="/studio">스튜디오 열기</Link>
        </div>
      </SignedIn>
      <section className="features">
        <div className="feature"><h3>생성</h3><p>Upstage Solar Pro 2로 사실 기반의 구조화된 HTML 본문 생성</p></div>
        <div className="feature"><h3>미리보기</h3><p>즉시 미리보기와 메타 요약/키워드 제공</p></div>
        <div className="feature"><h3>발행</h3><p>WordPress · Tistory에 원클릭 발행</p></div>
      </section>
    </div>
  )
}