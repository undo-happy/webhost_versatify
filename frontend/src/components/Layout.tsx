import { NavLink, Outlet, Link } from 'react-router-dom';
import '../App.css';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

export default function Layout() {
  
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
          <div style={{ marginTop: 'var(--space-4)' }}>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="btn btn-primary" style={{ width: '100%', fontSize: 'var(--font-size-sm)' }}>
                  🔐 로그인
                </button>
              </SignInButton>
            </SignedOut>
          </div>
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