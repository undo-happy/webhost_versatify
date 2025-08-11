import { useSettings } from '../state/SettingsContext';
import { useAuth } from '@clerk/clerk-react';

export default function Settings() {
  const { apiBaseUrl, setApiBaseUrl, authToken, setAuthToken } = useSettings();
  const { getToken } = useAuth();
  
  return (
    <div>
      <div className="card">
        <h2>⚙️ API 설정</h2>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-8)' }}>
          백엔드 API 서버와 인증 설정을 구성하세요.
        </p>
        
        <div className="form">
          <label>
            <span>API Base URL</span>
            <input 
              value={apiBaseUrl} 
              onChange={(e) => setApiBaseUrl(e.target.value)} 
              placeholder="/api 또는 https://your-api.com/api" 
            />
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
              백엔드 API 서버 주소 (기본값: /api)
            </div>
          </label>
          
          <label>
            <span>수동 인증 토큰 (선택)</span>
            <input 
              type="password" 
              value={authToken} 
              onChange={(e) => setAuthToken(e.target.value)} 
              placeholder="API 키 또는 커스텀 토큰" 
            />
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
              로그인 대신 수동 토큰을 사용하려면 입력하세요. 로그인되어 있으면 Clerk JWT가 자동으로 사용됩니다.
            </div>
          </label>
          
          <button 
            className="btn btn-secondary"
            onClick={async () => {
              const token = await getToken();
              if (token) {
                alert(`현재 Clerk JWT: ${token.slice(0, 50)}...`);
              } else {
                alert('로그인되지 않았습니다.');
              }
            }}
          >
            🔑 현재 JWT 토큰 확인
          </button>
        </div>
      </div>

      <div className="card">
        <h3>🎯 설정 가이드</h3>
        <div className="feature-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="step-card">
            <div className="step-number">1</div>
            <h4 className="step-title">로그인하기</h4>
            <p className="step-description">
              사이드바에서 로그인하면 Clerk JWT가 자동으로 API 호출에 사용됩니다.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <h4 className="step-title">API 서버 설정</h4>
            <p className="step-description">
              백엔드 서버 주소를 설정하세요. Azure Functions나 Express 서버 주소를 입력하면 됩니다.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <h4 className="step-title">블로그 생성 시작</h4>
            <p className="step-description">
              모든 설정이 완료되면 실제 AI 모델을 사용해 블로그를 생성하고 WordPress/티스토리에 발행할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}