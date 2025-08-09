import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <section className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ marginTop: 0 }}>AI 기반 블로그 자동화 플랫폼</h1>
        <p>
          주제만 입력하면 SEO 최적화된 포스트를 생성하고, 편집한 뒤 워드프레스/티스토리에 원클릭 발행하세요.
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
          <Link to="/app/generate"><button>지금 시작하기</button></Link>
          <Link to="/app"><button className="secondary">대시보드 보기</button></Link>
        </div>
      </section>

      <section className="card">
        <h2>왜 우리를 선택하나요?</h2>
        <ul>
          <li>Upstage 모델 기반, 검색 노출에 강한 콘텐츠 생성</li>
          <li>라이브 미리보기와 간편한 편집</li>
          <li>티스토리·워드프레스 자동 발행 및 예약 큐 지원</li>
          <li>안전한 인증과 역할 기반 접근 제어</li>
        </ul>
      </section>
    </div>
  );
}