import { NavLink, Outlet, Link } from 'react-router-dom';
import '../App.css';
import { isDemoBaseUrl } from '../lib/api';
import { useSettings } from '../state/SettingsContext';

export default function Layout() {
  const { apiBaseUrl } = useSettings();
  const demo = isDemoBaseUrl(apiBaseUrl);
  return (
    <div className="container">
      {demo && (
        <div className="row" style={{ background: '#fff3cd', color: '#8a6d3b', padding: 8, border: '1px solid #ffeeba', borderRadius: 6, marginBottom: 12 }}>
          데모 모드: 실제 API 없이 작동 중입니다.
        </div>
      )}
      <header className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>블로그 자동화</Link>
        </h1>
        <nav className="row" style={{ gap: 12 }}>
          <NavLink to="/app" end>대시보드</NavLink>
          <NavLink to="/app/generate">생성</NavLink>
          <NavLink to="/app/history">내역</NavLink>
          <NavLink to="/app/settings">설정</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}