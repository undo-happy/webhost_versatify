import { NavLink, Outlet, Link } from 'react-router-dom';
import '../App.css';

export default function Layout() {
  return (
    <div className="container">
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