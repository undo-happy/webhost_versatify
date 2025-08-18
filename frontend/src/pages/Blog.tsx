import { Link } from 'react-router-dom';

type Post = { id: string; title: string; summary: string; date: string };

const mockPosts: Post[] = [
  { id: 'welcome', title: 'Versatify 출시 소식', summary: 'AI 블로그 자동화 콘솔 소개와 로드맵', date: '2025-01-01' },
  { id: 'tips', title: 'SEO 친화적 글 구조 가이드', summary: '헤딩/문단/리스트를 활용한 구조화 팁', date: '2025-02-10' }
];

export default function Blog() {
  return (
    <main className="container">
      <div className="card">
        <h1>블로그</h1>
        <ul>
          {mockPosts.map(p => (
            <li key={p.id} style={{ marginBottom: 12 }}>
              <Link to={`/blog/${p.id}`}><strong>{p.title}</strong></Link>
              <div className="muted">{p.date}</div>
              <div>{p.summary}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}














