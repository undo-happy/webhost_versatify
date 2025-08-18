import { useMemo, useState } from 'react';
import { useApiClient } from '../lib/hooks';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: 16, color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function GadgetBlogger() {
  const apiClient = useApiClient();

  // Control Panel states
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<'전문적으로' | '친근하고 유쾌하게' | '객관적인 정보 전달' | '감성적인 스토리텔링'>('전문적으로');
  const [audience, setAudience] = useState('');
  const [mustInclude, setMustInclude] = useState('');
  const [length, setLength] = useState<'short' | 'normal' | 'long'>('normal');

  // Editor Panel states
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lengthToTarget = useMemo(() => {
    switch (length) {
      case 'short': return 500;
      case 'long': return 2000;
      default: return 1000;
    }
  }, [length]);

  const parsedKeywords = useMemo(() => keywords.split(',').map(k => k.trim()).filter(Boolean), [keywords]);

  async function onGenerate() {
    setLoading(true); setError(null);
    try {
      if (!topic.trim()) throw new Error('주제를 입력하세요');
      const api = await apiClient.getClient();

      // outline은 필수 포함 내용을 줄 단위로 전달
      const outline = mustInclude.split('\n').map(s => s.trim()).filter(Boolean);

      // 키워드는 topic에 힌트로 덧붙여 전달 (백엔드 모델 참고)
      const hintedTopic = parsedKeywords.length
        ? `${topic.trim()} (핵심키워드: ${parsedKeywords.join(', ')})`
        : topic.trim();

      const draft = await api.generateBlog({
        topic: hintedTopic,
        style: tone,
        outline,
        targetLength: lengthToTarget,
        language: 'ko'
      });

      setHtml(draft.content_html || '');
    } catch (e: any) {
      setError(e?.message || '생성 실패');
    } finally {
      setLoading(false);
    }
  }

  function onSummarize() {
    // 클라이언트 단순 요약: 문장 나눠 앞 3~4문장 추출
    const text = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = text.split(/(?<=[.!?\u3002\uFF01\uFF1F])\s+/).slice(0, 4);
    alert(parts.join(' '));
  }

  async function onCopy() {
    try { await navigator.clipboard.writeText(html); } catch {}
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#f1f5f9',
    color: '#1e293b',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    margin: 0,
    padding: 0
  };

  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; }
        .main-grid {
          display: grid;
          gap: 20px;
        }
        @media (min-width: 1200px) {
          .main-grid { grid-template-columns: 280px 1fr 1.2fr; }
        }
        @media (max-width: 1199px) and (min-width: 769px) {
          .main-grid { grid-template-columns: 240px 1fr; }
          .main-grid > div:last-child { display: none; }
        }
        @media (max-width: 768px) {
          .main-grid { grid-template-columns: 1fr; }
          .main-grid > div:first-child { display: none; }
        }
      `}</style>
      <main style={pageStyle}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 20px' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' }}>
              <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700' }}>V</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Versatify</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>AI 블로그 자동화 플랫폼</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: '20px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
              🎉 Official Release!
            </div>
          </div>
        </header>

        {/* 3-column grid */}
        <div className="main-grid">
          {/* Left: Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Quick Actions">
              <button onClick={() => { setTopic(''); setKeywords(''); setAudience(''); setMustInclude(''); setHtml(''); }}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                + 새 글 생성하기
              </button>
            </Section>
            <Section title="Templates">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => setTone('전문적으로')} style={{...btnStyle, background: tone === '전문적으로' ? '#eff6ff' : '#ffffff', border: tone === '전문적으로' ? '2px solid #3b82f6' : '1px solid #e2e8f0'}}>
                  📊 제품 리뷰(전문적)
                </button>
                <button onClick={() => setTone('친근하고 유쾌하게')} style={{...btnStyle, background: tone === '친근하고 유쾌하게' ? '#eff6ff' : '#ffffff', border: tone === '친근하고 유쾌하게' ? '2px solid #3b82f6' : '1px solid #e2e8f0'}}>
                  😊 정보 글(친근함)
                </button>
                <button onClick={() => setTone('객관적인 정보 전달')} style={{...btnStyle, background: tone === '객관적인 정보 전달' ? '#eff6ff' : '#ffffff', border: tone === '객관적인 정보 전달' ? '2px solid #3b82f6' : '1px solid #e2e8f0'}}>
                  📖 가이드(객관적)
                </button>
                <button onClick={() => setTone('감성적인 스토리텔링')} style={{...btnStyle, background: tone === '감성적인 스토리텔링' ? '#eff6ff' : '#ffffff', border: tone === '감성적인 스토리텔링' ? '2px solid #3b82f6' : '1px solid #e2e8f0'}}>
                  💭 스토리(감성적)
                </button>
              </div>
            </Section>
          </div>

          {/* Center: Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="콘텐츠 생성 설정">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>📝 블로그 주제 (필수)</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 효과적인 재택근무를 위한 5가지 팁"
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>🏷️ 핵심 키워드 (쉼표 분리)</label>
                  <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="생산성, 시간관리, 번아웃"
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>🎨 글의 톤앤매너</label>
                  <select value={tone} onChange={e => setTone(e.target.value as any)} style={inputStyle}>
                    <option>전문적으로</option>
                    <option>친근하고 유쾌하게</option>
                    <option>객관적인 정보 전달</option>
                    <option>감성적인 스토리텔링</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>👥 타겟 독자</label>
                  <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="예: 재택근무를 처음 시작한 직장인"
                    style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>📋 반드시 포함할 내용/관점</label>
                  <textarea value={mustInclude} onChange={e => setMustInclude(e.target.value)} rows={4} placeholder="예: 아침 루틴 강조, 협업툴 2~3개 언급"
                    style={{ ...inputStyle, minHeight: 100 }} />
                </div>

                <div>
                  <label style={labelStyle}>📏 글 길이</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {(['short', 'normal', 'long'] as const).map(v => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: length === v ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: 8, background: length === v ? '#eff6ff' : '#ffffff', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="radio" checked={length === v} onChange={() => setLength(v)} style={{ margin: 0 }} />
                        {v === 'short' ? '짧게(500자)' : v === 'normal' ? '보통(1000자)' : '길게(2000자+)'}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <button onClick={onGenerate} disabled={loading} style={primaryBtn}>{loading ? '⏳ 생성 중...' : '✨ 글 생성하기'}</button>
                  <button onClick={onSummarize} disabled={!html} style={ghostBtn}>📄 요약</button>
                  <button onClick={onCopy} disabled={!html} style={ghostBtn}>📋 복사</button>
                </div>
                {error && <p style={{ color: '#ef4444', marginTop: 12, padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>❌ {error}</p>}
              </div>
            </Section>
          </div>

          {/* Right: Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="생성된 콘텐츠 미리보기">
              {!html && (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center', 
                  color: '#94a3b8',
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px dashed #cbd5e1'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  <p style={{ margin: 0, fontSize: '16px' }}>생성된 콘텐츠가 여기에 표시됩니다</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>주제를 입력하고 '글 생성하기' 버튼을 클릭하세요</p>
                </div>
              )}
              {html && (
                <div style={{
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 12, 
                  padding: 20,
                  maxHeight: 600, 
                  overflowY: 'auto',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#374151'
                }} dangerouslySetInnerHTML={{ __html: html }} />
              )}
            </Section>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

const labelStyle: React.CSSProperties = { 
  display: 'block', 
  marginBottom: 8, 
  color: '#475569', 
  fontSize: '14px', 
  fontWeight: '600' 
};
const inputStyle: React.CSSProperties = {
  width: '100%', 
  padding: '12px 16px', 
  borderRadius: 12, 
  border: '2px solid #e2e8f0', 
  background: '#ffffff', 
  color: '#1e293b',
  fontSize: '14px',
  transition: 'border-color 0.2s',
  outline: 'none'
};
const btnStyle: React.CSSProperties = { 
  border: '1px solid #e2e8f0', 
  background: '#ffffff', 
  color: '#475569', 
  borderRadius: 12, 
  padding: '12px 16px', 
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '14px',
  fontWeight: '500'
};
const primaryBtn: React.CSSProperties = { 
  background: '#3b82f6', 
  color: '#ffffff', 
  padding: '12px 24px', 
  borderRadius: 12, 
  border: 'none', 
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '14px'
} as const;
const ghostBtn: React.CSSProperties = { 
  border: '2px solid #e2e8f0', 
  color: '#475569', 
  background: '#ffffff', 
  padding: '10px 20px', 
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '14px',
  fontWeight: '500'
} as const;
