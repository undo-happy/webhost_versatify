import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../lib/auth';

export default function Dashboard2() {
  const auth = useAuthState();
  
  // 사용자 이름 추출
  const getUserName = () => {
    if (auth.user?.email) {
      const emailName = auth.user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Blogger';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            margin: '0 0 0.5rem 0' 
          }}>
            안녕하세요, {getUserName()}님! 👋
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666', 
            margin: 0 
          }}>
            오늘도 멋진 블로그 글을 작성해보세요
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginBottom: '3rem' 
        }}>
          {/* 블로그 생성 Card */}
          <Link to="/app/generate" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '16px',
              padding: '2rem',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: '0 0 0.5rem 0' 
              }}>
                새 블로그 글 작성
              </h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.9,
                fontSize: '1rem'
              }}>
                AI가 3분만에 SEO 최적화된 블로그 글을 생성합니다
              </p>
            </div>
          </Link>

          {/* 생성 내역 Card */}
          <Link to="/app/history" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '16px',
              padding: '2rem',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: '0 0 0.5rem 0' 
              }}>
                생성 내역
              </h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.9,
                fontSize: '1rem'
              }}>
                이전에 생성한 블로그 글들을 확인하세요
              </p>
            </div>
          </Link>

          {/* 발행 큐 Card */}
          <Link to="/app/queue" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '16px',
              padding: '2rem',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                margin: '0 0 0.5rem 0' 
              }}>
                발행 큐
              </h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.9,
                fontSize: '1rem'
              }}>
                WordPress, 티스토리 자동 발행 상태를 확인하세요
              </p>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '2rem'
          }}>
            이번 달 활동
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#22c55e',
                marginBottom: '0.5rem'
              }}>12</div>
              <div style={{ color: '#666' }}>생성된 블로그 글</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#8b5cf6',
                marginBottom: '0.5rem'
              }}>8</div>
              <div style={{ color: '#666' }}>자동 발행된 글</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>4.2k</div>
              <div style={{ color: '#666' }}>총 조회수</div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: 0
            }}>
              최근 생성된 글
            </h2>
            <Link to="/app/history">
              <button style={{
                background: '#f8f9fa',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                전체 보기 →
              </button>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <PostItem 
              title="AI와 블로그 자동화의 미래"
              date="2시간 전"
              status="발행됨"
              platform="WordPress"
            />
            <PostItem 
              title="SEO 최적화를 위한 콘텐츠 작성법"
              date="1일 전"
              status="발행됨"
              platform="티스토리"
            />
            <PostItem 
              title="효율적인 블로그 운영 전략"
              date="3일 전"
              status="초안"
              platform=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PostItem({ title, date, status, platform }: { 
  title: string; 
  date: string; 
  status: string; 
  platform: string;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '발행됨': return '#22c55e';
      case '발행중': return '#f59e0b';
      case '초안': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '8px'
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 0.25rem 0'
        }}>
          {title}
        </h4>
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          {date} {platform && `• ${platform}`}
        </div>
      </div>
      <div style={{
        background: getStatusColor(status),
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        {status}
      </div>
    </div>
  );
}