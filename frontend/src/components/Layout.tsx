import { NavLink, Outlet } from 'react-router-dom';
import '../App.css';

export default function Layout() {
  return (
    <div className="container">
      <header className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>블로그 자동화</h1>
        <nav className="row" style={{ gap: 12 }}>
          <NavLink to="/" end>대시보드</NavLink>
          <NavLink to="/generate">생성</NavLink>
          <NavLink to="/history">내역</NavLink>
          <NavLink to="/settings">설정</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}