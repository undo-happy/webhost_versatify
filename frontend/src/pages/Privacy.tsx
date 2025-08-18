import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="container">
      <div className="card">
        <h1>개인정보 처리방침</h1>
        <p className="muted">최종 업데이트: {new Date().toLocaleDateString()}</p>

        <h2>1. 수집 항목</h2>
        <ul>
          <li>계정 정보(이메일 등, Clerk로 관리)</li>
          <li>사용 로그(에러/요청 횟수 등 최소한)</li>
        </ul>

        <h2>2. 이용 목적</h2>
        <ul>
          <li>인증, 서비스 제공 및 안정화</li>
          <li>남용 방지(레이트 리밋), 고객 지원</li>
        </ul>

        <h2>3. 보관 기간</h2>
        <p>관련 법령 또는 목적 달성 시까지 최소한으로 보관합니다.</p>

        <h2>4. 제3자 제공</h2>
        <p>필요 시 법령 준수 범위에서만 제공합니다.</p>

        <h2>5. 이용자 권리</h2>
        <p>열람/정정/삭제/처리정지 요청은 지원채널로 문의하세요.</p>

        <p style={{ marginTop: 24 }}>
          <Link to="/terms" className="ghost">이용약관</Link>
        </p>
      </div>
    </main>
  );
}














