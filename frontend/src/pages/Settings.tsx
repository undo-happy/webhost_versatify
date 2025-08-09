import { useSettings } from '../state/SettingsContext';

export default function Settings() {
  const { apiBaseUrl, setApiBaseUrl, authToken, setAuthToken } = useSettings();
  return (
    <section className="card">
      <h2>설정</h2>
      <div className="grid2">
        <label>
          <span>API Base URL</span>
          <input value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="예: /api 또는 http://localhost:7071/api" />
        </label>
        <label>
          <span>Clerk JWT (선택)</span>
          <input type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)} placeholder="Generate & Publish 용" />
        </label>
      </div>
    </section>
  );
}