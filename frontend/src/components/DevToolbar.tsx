import React, { useState, useEffect } from 'react';

export default function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!editMode) return;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      setSelectedElement(target);
      
      // 선택된 요소 하이라이트
      document.querySelectorAll('.dev-highlight').forEach(el => {
        el.classList.remove('dev-highlight');
      });
      target.classList.add('dev-highlight');
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [editMode]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // 편집 모드 해제 시 하이라이트 제거
      document.querySelectorAll('.dev-highlight').forEach(el => {
        el.classList.remove('dev-highlight');
      });
      setSelectedElement(null);
    }
  };

  const changeStyle = (property: string, value: string) => {
    if (selectedElement) {
      (selectedElement.style as any)[property] = value;
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <style>{`
        .dev-toolbar {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1f2937;
          color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 10000;
          font-family: system-ui, sans-serif;
        }
        .dev-toolbar-toggle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .dev-toolbar-panel {
          position: absolute;
          top: 60px;
          right: 0;
          width: 300px;
          background: #1f2937;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .dev-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        .dev-button {
          background: #374151;
          border: 1px solid #4b5563;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin: 4px;
        }
        .dev-button:hover {
          background: #4b5563;
        }
        .dev-button.active {
          background: #3b82f6;
        }
        .dev-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #4b5563;
          border-radius: 6px;
          background: #374151;
          color: white;
          margin: 4px 0;
        }
      `}</style>
      
      <div className="dev-toolbar">
        <button 
          className="dev-toolbar-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          title="StageWise Dev Toolbar"
        >
          🛠️
        </button>
        
        {isOpen && (
          <div className="dev-toolbar-panel">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>🚀 Dev Toolbar</h3>
            
            <button 
              className={`dev-button ${editMode ? 'active' : ''}`}
              onClick={toggleEditMode}
            >
              {editMode ? '✅ 편집 모드 ON' : '✏️ 편집 모드 시작'}
            </button>
            
            {editMode && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' }}>
                  요소를 클릭해서 선택하세요
                </p>
              </div>
            )}
            
            {selectedElement && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #374151' }}>
                <p style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
                  선택된 요소: <code style={{ background: '#374151', padding: '2px 6px', borderRadius: '4px' }}>
                    {selectedElement.tagName.toLowerCase()}
                  </code>
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    className="dev-button"
                    onClick={() => changeStyle('backgroundColor', '#3b82f6')}
                  >
                    파란 배경
                  </button>
                  <button 
                    className="dev-button"
                    onClick={() => changeStyle('backgroundColor', '#ef4444')}
                  >
                    빨간 배경
                  </button>
                  <button 
                    className="dev-button"
                    onClick={() => changeStyle('color', '#ffffff')}
                  >
                    흰 글자
                  </button>
                  <button 
                    className="dev-button"
                    onClick={() => changeStyle('color', '#000000')}
                  >
                    검은 글자
                  </button>
                  <button 
                    className="dev-button"
                    onClick={() => changeStyle('fontSize', '24px')}
                  >
                    큰 글자
                  </button>
                  <button 
                    className="dev-button"
                    onClick={() => changeStyle('fontSize', '14px')}
                  >
                    작은 글자
                  </button>
                </div>
                
                <div style={{ marginTop: '12px' }}>
                  <input 
                    className="dev-input"
                    placeholder="Custom CSS (예: padding: 20px)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const [prop, value] = (e.target as HTMLInputElement).value.split(':');
                        if (prop && value) {
                          changeStyle(prop.trim(), value.trim());
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}