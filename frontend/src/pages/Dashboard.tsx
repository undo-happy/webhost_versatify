import { Link } from 'react-router-dom';
import { useAuthState } from '../lib/auth';
import AuthPrompt from '../components/AuthPrompt';

export default function Dashboard() {
  const authState = useAuthState();
  
  return (
    <>
      <section className="card">
        <h2>시작하기</h2>
        <p>
          {authState.isAuthenticated 
            ? "주제 입력 → 초안 생성 → 편집/미리보기 → 워드프레스/티스토리 발행 또는 큐에 등록"
            : "🎯 체험 모드: 블로그 생성과 미리보기를 자유롭게 체험해보세요!"
          }
        </p>
        <div className="row" style={{ gap: 12 }}>
          <Link to="/app/generate" className="btn btn-primary">✨ 블로그 생성하기</Link>
          <Link to="/app/history" className="btn btn-secondary">📝 생성 내역 보기</Link>
          <Link to="/app/settings" className="btn btn-secondary">⚙️ 환경 설정</Link>
          <Link to="/" className="btn btn-secondary">🏠 홈으로</Link>
        </div>
        
        {!authState.isAuthenticated && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <AuthPrompt 
              reason="실제 블로그 발행과 데이터 저장을 위해 로그인하세요" 
              size="sm" 
            />
          </div>
        )}
      </section>
      <section className="card">
        <h2>사용 가능한 기능</h2>
        <ul>
          <li>✅ AI 블로그 초안 생성 {!authState.isAuthenticated && <span style={{color: 'var(--color-success)'}}>- 체험 가능</span>}</li>
          <li>✅ 실시간 HTML 미리보기 및 편집 {!authState.isAuthenticated && <span style={{color: 'var(--color-success)'}}>- 체험 가능</span>}</li>
          <li>{authState.isAuthenticated ? '✅' : '🔐'} WordPress/티스토리 실제 발행 {!authState.isAuthenticated && <span style={{color: 'var(--color-primary)'}}>- 로그인 필요</span>}</li>
          <li>{authState.isAuthenticated ? '✅' : '🔐'} 생성 내역 저장 및 관리 {!authState.isAuthenticated && <span style={{color: 'var(--color-primary)'}}>- 로그인 필요</span>}</li>
          <li>{authState.isAuthenticated ? '✅' : '🔐'} 발행 큐 예약 기능 {!authState.isAuthenticated && <span style={{color: 'var(--color-primary)'}}>- 로그인 필요</span>}</li>
          <li>{authState.isAuthenticated ? '✅' : '🔐'} OAuth 기반 안전한 API 연동 {!authState.isAuthenticated && <span style={{color: 'var(--color-primary)'}}>- 로그인 필요</span>}</li>
        </ul>
      </section>
    </>
  );
}