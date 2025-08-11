import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-container">
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              AI 블로그 자동화<br />
              생성부터 발행까지 한 번에
            </h1>
            <p className="hero-subtitle">
              주제 입력만으로 SEO 최적화 초안 생성, 라이브 미리보기·편집, WordPress/티스토리 즉시 발행 또는 발행 큐 등록까지. 
              이제 콘텐츠 운영을 자동화하세요.
            </p>
            <div className="hero-actions">
              <Link to="/app/generate" className="btn btn-primary">
                🚀 지금 시작하기
              </Link>
              <Link to="/app" className="btn btn-secondary">
                📊 대시보드 보기
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
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

        {/* How It Works Section */}
        <section className="content-section">
          <h2 className="section-title">작동 방식</h2>
          <div className="step-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">주제 입력</h3>
              <p className="step-description">
                주제를 입력하고 스타일·길이·언어와 아웃라인을 선택합니다. AI가 최적의 콘텐츠 구조를 제안합니다.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">내용 확인</h3>
              <p className="step-description">
                생성된 초안을 제목/본문으로 다듬고 실시간 미리보기로 확인합니다. 원하는 대로 수정 및 편집이 가능합니다.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">발행 설정</h3>
              <p className="step-description">
                WordPress/티스토리 발행 옵션을 설정합니다. 상태, 카테고리/태그, 공개범위 등을 세밀하게 조정할 수 있습니다.
              </p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">자동 발행</h3>
              <p className="step-description">
                즉시 발행하거나 큐에 등록해 예약/배치로 운영합니다. 완전 자동화된 콘텐츠 발행 시스템을 경험하세요.
              </p>
            </div>
          </div>
        </section>

        {/* What's New Section */}
        <section className="content-section">
          <h2 className="section-title">새로운 기능</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">생성+발행 일괄 처리</h3>
              <p className="feature-description">
                한 번의 요청으로 생성과 발행까지 처리. 더욱 빠르고 효율적인 콘텐츠 제작 워크플로우를 제공합니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">발행 큐 시스템</h3>
              <p className="feature-description">
                즉시 발행 없이 큐 적재로 운영 유연성 향상. 콘텐츠 스케줄링과 배치 처리로 체계적인 블로그 관리가 가능합니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">강화된 보안</h3>
              <p className="feature-description">
                Clerk JWT로 퍼블리시 엔드포인트 보호. 인증과 권한 관리를 통해 안전한 콘텐츠 발행 환경을 구축했습니다.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">확장된 플랫폼 옵션</h3>
              <p className="feature-description">
                WP 카테고리/태그, 티스토리 공개범위/카테고리/태그 옵션이 확장되어 더 세밀한 콘텐츠 관리가 가능합니다.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="hero-actions">
              <Link to="/app/generate" className="btn btn-primary">
                ✨ 새로운 기능 체험하기
              </Link>
              <Link to="/app/settings" className="btn btn-secondary">
                ⚙️ 설정 먼저 하기
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} AI 블로그 자동화. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
}