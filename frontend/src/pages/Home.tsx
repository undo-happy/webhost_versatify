import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              AI 블로그 자동화
              <br />
              생성부터 발행까지 한 번에
            </h1>
            <p className="hero-subtitle">
              주제 입력만으로 SEO 최적화 초안 생성, 실시간 편집/미리보기, WordPress/티스토리 즉시 발행 또는 발행 큐 등록까지.
              <br />
              <strong>API 키만 입력하면 모든 기능이 바로 동작합니다.</strong>
            </p>
            <div className="hero-actions">
              <Link to="/app/generate" className="btn btn-primary">
                🚀 지금 시작하기
              </Link>
              <Link to="/app" className="btn btn-secondary">
                📊 대시보드 보기
              </Link>
            </div>
            <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
              🔐 로그인 후 실제 AI 모델과 발행 기능을 사용하세요
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Quick Actions */}
        <section className="content-section">
          <h2 className="section-title">빠른 시작</h2>
          <div className="feature-grid">
            <Link to="/app/generate" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">블로그 생성하기</h3>
              <p className="feature-description">
                주제만 입력하면 AI가 SEO 최적화된 블로그 콘텐츠를 자동으로 생성합니다. 실시간 미리보기와 편집 기능도 제공됩니다.
              </p>
            </Link>
            
            <Link to="/app/settings" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-icon">⚙️</div>
              <h3 className="feature-title">API 키 설정</h3>
              <p className="feature-description">
                WordPress, 티스토리, AI 모델 API 키를 한 번만 설정하면 모든 기능이 자동으로 연동됩니다.
              </p>
            </Link>
            
            <Link to="/app/history" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">생성 내역</h3>
              <p className="feature-description">
                이전에 생성한 모든 블로그 콘텐츠를 관리하고, 언제든지 다시 편집하거나 발행할 수 있습니다.
              </p>
            </Link>
          </div>
        </section>

        {/* Core Features */}
        <section className="content-section">
          <h2 className="section-title">핵심 기능</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">원클릭 생성→발행</h3>
              <p className="feature-description">
                초안 생성 직후 WordPress 또는 티스토리에 바로 발행. 복잡한 설정 없이 한 번의 클릭으로 완료됩니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">스마트 발행 큐</h3>
              <p className="feature-description">
                즉시 발행 대신 큐에 넣어 예약/배치 처리 가능. 콘텐츠 스케줄링으로 효율적인 블로그 운영을 지원합니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👁️</div>
              <h3 className="feature-title">실시간 미리보기</h3>
              <p className="feature-description">
                HTML 실시간 미리보기로 발행 전 품질 확인. 편집과 동시에 최종 결과물을 바로 확인할 수 있습니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">SEO 메타 자동화</h3>
              <p className="feature-description">
                요약, 키워드, 메타 타이틀/디스크립션을 자동 생성. 검색엔진 최적화를 위한 모든 설정이 자동으로 처리됩니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">멀티 플랫폼 지원</h3>
              <p className="feature-description">
                WordPress 카테고리/태그, 티스토리 공개범위/카테고리/태그 설정. 다양한 블로그 플랫폼을 하나로 관리합니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">보안 발행 시스템</h3>
              <p className="feature-description">
                Clerk JWT 기반 Generate & Publish 엔드포인트 보호. 안전하고 신뢰할 수 있는 발행 프로세스를 제공합니다.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="content-section">
          <h2 className="section-title">사용 방법</h2>
          <div className="step-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">API 키 설정</h3>
              <p className="step-description">
                설정 페이지에서 WordPress, 티스토리, AI 모델 API 키를 입력합니다. 한 번만 설정하면 모든 기능이 자동으로 연동됩니다.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">주제 입력</h3>
              <p className="step-description">
                블로그 주제를 입력하고 스타일, 길이, 언어를 선택합니다. AI가 최적의 콘텐츠 구조를 자동으로 제안합니다.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">실시간 편집</h3>
              <p className="step-description">
                생성된 초안을 실시간 미리보기를 통해 확인하고 편집합니다. 제목, 본문 모두 자유롭게 수정할 수 있습니다.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">자동 발행</h3>
              <p className="step-description">
                WordPress/티스토리에 즉시 발행하거나 발행 큐에 등록합니다. 카테고리, 태그, 공개범위 등 세부 설정도 가능합니다.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="hero-actions">
              <Link to="/app/generate" className="btn btn-primary">
                ✨ 지금 시작하기
              </Link>
              <Link to="/app/settings" className="btn btn-secondary">
                ⚙️ 설정 먼저 하기
              </Link>
            </div>
          </div>
        </section>

        {/* Login Info */}
        <section className="content-section" style={{ background: 'var(--gradient-subtle)', border: '1px solid var(--color-primary-light)' }}>
          <div className="text-center">
            <h2 className="section-title" style={{ color: 'var(--color-primary)' }}>🔐 로그인 및 설정</h2>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-8)' }}>
              실제 AI 모델과 발행 기능을 사용하려면 로그인하고 API를 설정하세요
            </p>
            <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>👤</div>
                <h4 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-gray-900)' }}>Clerk 로그인</h4>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>간편한 소셜 로그인으로 JWT 인증 자동 설정</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>🔧</div>
                <h4 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-gray-900)' }}>API 서버 연결</h4>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>백엔드 서버 주소 설정으로 실제 기능 활성화</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>🚀</div>
                <h4 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-gray-900)' }}>즉시 사용</h4>
                <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)' }}>설정 완료 후 AI 블로그 생성과 자동 발행 시작</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} AI 블로그 자동화. 모든 권리 보유.</p>
          <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
            WordPress, 티스토리 블로그 자동 생성 및 발행 서비스
          </p>
        </div>
      </footer>
    </div>
  );
}