import { useDrafts } from '../state/DraftsContext';

export default function History() {
  const { drafts, removeDraft, clearDrafts } = useDrafts();
  return (
    <section className="card">
      <h2>생성 내역</h2>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <small>{drafts.length} 개</small>
        {drafts.length > 0 && <button onClick={clearDrafts} className="btn btn-danger btn-sm">🗑️ 모두 지우기</button>}
      </div>
      {drafts.length === 0 ? (
        <p>아직 저장된 초안이 없습니다.</p>
      ) : (
        <ul>
          {drafts.map((d) => (
            <li key={d.id} style={{ marginBottom: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{d.title}</strong>
                  <div style={{ color: '#9aa4b2' }}>{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button onClick={() => navigator.clipboard.writeText(d.content_html)} className="btn btn-secondary btn-sm">📋 HTML 복사</button>
                  <button onClick={() => removeDraft(d.id)} className="btn btn-danger btn-sm">🗑️ 삭제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}