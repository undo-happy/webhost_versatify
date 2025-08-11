import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <section className="card" style={{ textAlign: 'center' }}>
        <h1 style={{ marginTop: 0 }}>AI 블로그 자동화, 생성부터 발행까지 한 번에</h1>
        <p>
          주제 입력만으로 SEO 최적화 초안 생성, 라이브 미리보기·편집, WordPress/티스토리 <strong>즉시 발행</strong> 또는
          <strong> 발행 큐</strong> 등록까지. 이제 콘텐츠 운영을 자동화하세요.
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
          <Link to="/app/generate"><button>지금 생성하기</button></Link>
          <Link to="/app"><button className="secondary">대시보드</button></Link>
        </div>
      </section>

      <section className="card">
        <h2>핵심 기능</h2>
        <div className="grid3">
          <div className="card">
            <h3>원클릭 생성→발행</h3>
            <p>초안 생성 직후 WordPress 또는 티스토리에 바로 발행.</p>
          </div>
          <div className="card">
            <h3>발행 큐 지원</h3>
            <p>즉시 발행 대신 큐에 넣어 예약/배치 처리 가능.</p>
          </div>
          <div className="card">
            <h3>통합 편집·미리보기</h3>
            <p>HTML 실시간 미리보기로 발행 전 품질 확인.</p>
          </div>
          <div className="card">
            <h3>SEO 메타 자동화</h3>
            <p>요약, 키워드, 메타 타이틀/디스크립션 제공.</p>
          </div>
          <div className="card">
            <h3>플랫폼 통합</h3>
            <p>WordPress 카테고리/태그, 티스토리 공개범위/카테고리/태그 설정.</p>
          </div>
          <div className="card">
            <h3>보안 발행</h3>
            <p>Clerk JWT 기반 Generate & Publish 엔드포인트 보호.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>어떻게 작동하나요?</h2>
        <ol>
          <li>주제를 입력하고 스타일·길이·언어와 아웃라인을 선택합니다.</li>
          <li>생성된 초안을 제목/본문으로 다듬고 미리보기로 확인합니다.</li>
          <li>WordPress/티스토리 발행 옵션(상태, 카테고리/태그, 공개범위 등)을 지정합니다.</li>
          <li>즉시 발행하거나 큐에 등록해 예약/배치로 운영합니다.</li>
        </ol>
      </section>

      <section className="card">
        <h2>이번에 새로워진 점</h2>
        <ul>
          <li><strong>생성+발행 일괄 처리</strong>: 한 번의 요청으로 생성과 발행까지 처리</li>
          <li><strong>발행 큐 추가</strong>: 즉시 발행 없이 큐 적재로 운영 유연성 향상</li>
          <li><strong>보안 강화</strong>: Clerk JWT로 퍼블리시 엔드포인트 보호</li>
          <li><strong>플랫폼 옵션 확장</strong>: WP 카테고리/태그, 티스토리 공개범위/카테고리/태그</li>
        </ul>
        <div className="row" style={{ gap: 12 }}>
          <Link to="/app/generate"><button>변경 사항 사용해보기</button></Link>
          <Link to="/app/settings"><button className="secondary">설정 먼저 하기</button></Link>
        </div>
      </section>

      <footer>
        <small>© {new Date().getFullYear()} 블로그 자동화. 모든 권리 보유.</small>
      </footer>
    </div>
  );
}