export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f1f5f9',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#1e293b', fontSize: '24px' }}>테스트 페이지</h1>
      <div style={{ 
        background: '#ffffff', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginTop: '20px'
      }}>
        <p style={{ color: '#475569' }}>이 텍스트가 보이면 스타일이 제대로 적용된 것입니다.</p>
        <button style={{
          background: '#3b82f6',
          color: '#ffffff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          테스트 버튼
        </button>
      </div>
    </div>
  );
}