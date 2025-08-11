import { useSettings } from '../state/SettingsContext';
import { isDemoBaseUrl } from '../lib/api';

export default function Settings() {
  const { apiBaseUrl, setApiBaseUrl, authToken, setAuthToken } = useSettings();
  const demo = isDemoBaseUrl(apiBaseUrl);
  
  return (
    <div>
      <div className="card">
        <h2>⚙️ API 키 설정</h2>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-8)' }}>
          모든 기능을 사용하려면 API 키를 설정하세요. 설정하지 않으면 데모 모드로 작동합니다.
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
              백엔드 API 서버 주소를 입력하세요. 비어있으면 데모 모드로 작동합니다.
            </div>
          </label>
          
          <label>
            <span>인증 토큰 (선택)</span>
            <input 
              type="password" 
              value={authToken} 
              onChange={(e) => setAuthToken(e.target.value)} 
              placeholder="JWT 토큰 또는 API 키" 
            />
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
              Clerk JWT 또는 API 인증을 위한 토큰입니다.
            </div>
          </label>
        </div>
      </div>

      <div className="card">
        <h3>🎯 빠른 설정 가이드</h3>
        <div className="feature-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="step-card">
            <div className="step-number">1</div>
            <h4 className="step-title">데모 모드로 시작</h4>
            <p className="step-description">
              API 키 없이도 모든 UI와 기능을 체험할 수 있습니다. 위 설정을 비워두면 자동으로 데모 모드가 활성화됩니다.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <h4 className="step-title">실제 API 연동</h4>
            <p className="step-description">
              백엔드 서버 주소를 입력하면 실제 AI 생성과 WordPress/티스토리 발행 기능을 사용할 수 있습니다.
            </p>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <h4 className="step-title">보안 인증 (선택)</h4>
            <p className="step-description">
              추가 보안이 필요한 경우 JWT 토큰을 입력하세요. Clerk 인증 또는 사용자 정의 API 키를 지원합니다.
            </p>
          </div>
        </div>
      </div>

      {demo && (
        <div className="card" style={{ background: 'var(--gradient-subtle)', border: '1px solid var(--color-primary-light)' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--color-primary)', margin: '0 0 var(--space-4)' }}>🎭 현재 데모 모드</h3>
            <p style={{ color: 'var(--color-gray-700)' }}>
              실제 API 키 없이 모든 기능을 체험하고 있습니다. 위 설정을 통해 실제 모드로 전환할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}