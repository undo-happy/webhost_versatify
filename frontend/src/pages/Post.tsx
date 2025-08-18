import { useParams, Link } from 'react-router-dom';

const posts: Record<string, { title: string; html: string; date: string }> = {
  welcome: {
    title: 'Versatify 출시 소식',
    date: '2025-01-01',
    html: '<p>Versatify는 주제 입력만으로 초안을 만들고 발행까지 자동화하는 도구입니다.</p>'
  },
  tips: {
    title: 'SEO 친화적 글 구조 가이드',
    date: '2025-02-10',
    html: '<h2>요점</h2><ul><li>의미 있는 헤딩</li><li>짧은 문단</li><li>리스트/테이블 활용</li></ul>'
  }
};

export default function Post() {
  const { id } = useParams();
  const post = (id && posts[id]) || null;
  return (
    <main className="container">
      <div className="card">
        {!post ? (
          <>
            <h1>글을 찾을 수 없습니다</h1>
            <Link to="/blog" className="ghost">블로그로 돌아가기</Link>
          </>
        ) : (
          <>
            <h1>{post.title}</h1>
            <div className="muted" style={{ marginBottom: 16 }}>{post.date}</div>
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </>
        )}
      </div>
    </main>
  );
}














