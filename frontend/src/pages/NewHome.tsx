export default function NewHome() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
      color: '#e5e7eb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"'
    }}>
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '64px 20px 24px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #60a5fa, #34d399)' }} />
            <strong>Versatify Blog</strong>
          </div>
          <nav style={{ display: 'flex', gap: 16, opacity: .9 }}>
            <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none' }}>기능</a>
            <a href="#how" style={{ color: '#cbd5e1', textDecoration: 'none' }}>사용법</a>
            <a href="#start" style={{ color: '#cbd5e1', textDecoration: 'none' }}>시작하기</a>
          </nav>
        </header>

        <div style={{ textAlign: 'center', marginTop: 72 }}>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0, letterSpacing: -0.5 }}>AI 블로그 자동화</h1>
          <p style={{ color: '#9ca3af', marginTop: 16, fontSize: 18 }}>
            주제 입력 → 초안 생성 → 편집 → WordPress/티스토리 발행까지 한 번에
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
            <a href="#start" style={{ background: '#22c55e', color: '#0b1220', padding: '12px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>지금 시작하기</a>
            <a href="#features" style={{ border: '1px solid #334155', color: '#e5e7eb', padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>기능 살펴보기</a>
          </div>
        </div>
      </section>

      <section id="features" style={{ maxWidth: 1040, margin: '48px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { title: '원클릭 생성→발행', desc: '초안 생성 직후 WordPress/티스토리 발행' },
            { title: '발행 큐', desc: '즉시 발행 대신 큐 적재로 예약/배치 처리' },
            { title: '실시간 미리보기', desc: 'HTML 미리보기로 품질 확인' },
            { title: 'SEO 메타 자동화', desc: '요약/키워드/타이틀/디스크립션' }
          ].map((f, i) => (
            <div key={i} style={{ background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>{f.title}</h3>
              <p style={{ color: '#9ca3af', marginBottom: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" style={{ maxWidth: 1040, margin: '36px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>어떻게 작동하나요?</h2>
          <ol style={{ color: '#9ca3af' }}>
            <li>주제와 옵션을 입력합니다.</li>
            <li>초안 생성 후 편집/미리보기로 확인합니다.</li>
            <li>WordPress/티스토리 옵션을 지정합니다.</li>
            <li>즉시 발행 또는 큐에 등록합니다.</li>
          </ol>
        </div>
      </section>

      <footer style={{ maxWidth: 1040, margin: '36px auto', padding: '0 20px', opacity: .7, fontSize: 12 }}>
        © {new Date().getFullYear()} Versatify. All rights reserved.
      </footer>
    </main>
  );
}
