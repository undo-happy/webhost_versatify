import { NavLink } from 'react-router-dom';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 999
          }}
        />
      )}

      {/* Drawer */}
      <aside
        role="navigation"
        aria-label="사이드 메뉴"
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: 280,
          background: '#ffffff', borderRight: '1px solid #e2e8f0',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 220ms ease',
          zIndex: 1000, padding: 16, boxShadow: open ? '0 10px 30px rgba(0,0,0,0.12)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <strong>메뉴</strong>
          <button onClick={onClose} aria-label="닫기" className="secondary">닫기</button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavLink to="/app" end onClick={onClose}>대시보드</NavLink>
          <NavLink to="/app/generate" onClick={onClose}>생성</NavLink>
          <NavLink to="/app/history" onClick={onClose}>내역</NavLink>
          <NavLink to="/app/queue" onClick={onClose}>큐</NavLink>
          <NavLink to="/app/settings" onClick={onClose}>설정</NavLink>
        </nav>
      </aside>
    </>
  );
}














