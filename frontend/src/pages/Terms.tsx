import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="container">
      <div className="card">
        <h1>이용약관</h1>
        <p className="muted">최종 업데이트: {new Date().toLocaleDateString()}</p>

        <h2>1. 서비스 개요</h2>
        <p>
          본 서비스는 AI를 활용해 블로그 초안 생성, 편집 미리보기, WordPress/티스토리 발행 및 큐 기능을 제공합니다.
        </p>

        <h2>2. 계정 및 보안</h2>
        <ul>
          <li>Clerk 기반 인증을 사용하며, 로그인 이후 발행/큐 기능 사용이 가능합니다.</li>
          <li>계정 보안은 사용자 책임이며, 인증 토큰 공유를 금지합니다.</li>
        </ul>

        <h2>3. 사용 제한</h2>
        <ul>
          <li>불법/유해/권리침해 목적의 사용을 금지합니다.</li>
          <li>과도한 요청은 제한될 수 있습니다(체험 모드 레이트 리밋 적용).</li>
        </ul>

        <h2>4. 콘텐츠와 저작권</h2>
        <p>
          생성된 콘텐츠의 사실성/적법성/표절 여부는 사용자가 검토해야 합니다. 서비스는 콘텐츠의 법적 책임을 지지 않습니다.
        </p>

        <h2>5. 서비스 변경 및 종료</h2>
        <p>
          서비스는 사전 고지 후 기능 변경 또는 종료될 수 있습니다. 유료 플랜은 약관 및 환불정책을 따릅니다.
        </p>

        <p style={{ marginTop: 24 }}>
          <Link to="/privacy" className="ghost">개인정보 처리방침</Link>
        </p>
      </div>
    </main>
  );
}














