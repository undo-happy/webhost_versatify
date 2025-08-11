import { NavLink, Outlet, Link } from 'react-router-dom';
import '../App.css';
import { isDemoBaseUrl } from '../lib/api';
import { useSettings } from '../state/SettingsContext';

export default function Layout() {
  const { apiBaseUrl } = useSettings();
  const demo = isDemoBaseUrl(apiBaseUrl);
  
  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              AI 블로그 자동화
            </Link>
          </h1>
          {demo && (
            <div className="status-badge demo">
              🎭 데모 모드
            </div>
          )}
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            <li className="sidebar-nav-item">
              <NavLink to="/app" end className="sidebar-nav-link">
                <span>📊</span>
                대시보드
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/app/generate" className="sidebar-nav-link">
                <span>✨</span>
                블로그 생성
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/app/history" className="sidebar-nav-link">
                <span>📝</span>
                생성 내역
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink to="/app/settings" className="sidebar-nav-link">
                <span>⚙️</span>
                설정
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}