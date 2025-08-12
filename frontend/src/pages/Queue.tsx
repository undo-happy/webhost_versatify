import { useState, useEffect } from 'react';
import { useApiClient } from '../lib/hooks';
import FeatureGuard from '../components/FeatureGuard';

export default function Queue() {
  const apiClient = useApiClient();
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await apiClient.getClient();
      const data = await api.getQueueStatus();
      setQueueData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueStatus();
  }, []);

  return (
    <FeatureGuard feature="queue">
      <div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h1>발행 큐 상태</h1>
          <button 
            onClick={fetchQueueStatus} 
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            {loading ? '⟳ 새로고침 중...' : '🔄 새로고침'}
          </button>
        </div>

        {error && (
          <div className="card" style={{ background: 'var(--color-error)', color: 'white', marginBottom: 'var(--space-6)' }}>
            <p>❌ {error}</p>
          </div>
        )}

        {queueData && (
          <>
            <div className="card">
              <h2>📊 요약</h2>
              <div className="grid3">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-warning)' }}>
                    {queueData.summary.pending}
                  </div>
                  <div>대기 중</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-primary)' }}>
                    {queueData.summary.processing}
                  </div>
                  <div>처리 중</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-success)' }}>
                    {queueData.summary.completed}
                  </div>
                  <div>완료</div>
                </div>
              </div>
              {queueData.summary.failed > 0 && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-error)' }}>
                    {queueData.summary.failed}
                  </div>
                  <div>실패</div>
                </div>
              )}
            </div>

            {/* 대기 중인 작업들 */}
            {queueData.queues.pending.length > 0 && (
              <div className="card">
                <h3>⏳ 대기 중 ({queueData.queues.pending.length})</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {queueData.queues.pending.map((task: any) => (
                    <div key={task.taskId} className="row" style={{ 
                      padding: 'var(--space-3)', 
                      border: '1px solid var(--color-gray-200)', 
                      borderRadius: 'var(--radius-base)',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <strong>{task.platform}</strong>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="status-badge" style={{ background: 'var(--color-warning)', color: 'white' }}>
                        대기
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 완료된 작업들 */}
            {queueData.queues.completed.length > 0 && (
              <div className="card">
                <h3>✅ 완료 ({queueData.queues.completed.length})</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {queueData.queues.completed.slice(0, 10).map((task: any) => (
                    <div key={task.taskId} className="row" style={{ 
                      padding: 'var(--space-3)', 
                      border: '1px solid var(--color-gray-200)', 
                      borderRadius: 'var(--radius-base)',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <strong>{task.platform}</strong>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="status-badge" style={{ background: 'var(--color-success)', color: 'white' }}>
                        완료
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {queueData.totalTasks === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>📭</div>
                <h3>큐가 비어있습니다</h3>
                <p style={{ color: 'var(--color-gray-500)' }}>
                  블로그 생성 페이지에서 "큐에 넣기" 버튼을 사용해보세요
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </FeatureGuard>
  );
}