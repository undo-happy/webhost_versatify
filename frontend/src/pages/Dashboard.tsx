import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      <section className="card">
        <h2>시작하기</h2>
        <p>주제 입력 → 초안 생성 → 편집/미리보기 → 워드프레스/티스토리 발행 또는 큐에 등록</p>
        <div className="row" style={{ gap: 12 }}>
          <Link to="/app/generate" className="btn btn-primary">✨ 블로그 생성하기</Link>
          <Link to="/app/history" className="btn btn-secondary">📝 생성 내역 보기</Link>
          <Link to="/app/settings" className="btn btn-secondary">⚙️ 환경 설정</Link>
          <Link to="/" className="btn btn-secondary">🏠 홈으로</Link>
        </div>
      </section>
      <section className="card">
        <h2>기능</h2>
        <ul>
          <li>Upstage 모델로 SEO 최적화된 HTML 초안 생성</li>
          <li>미리보기/편집 후 워드프레스 또는 티스토리 발행</li>
          <li>발행 작업 큐 등록 (Azure Queue)</li>
          <li>Clerk JWT로 보호된 Generate+Publish 엔드포인트 지원</li>
        </ul>
      </section>
    </>
  );
}