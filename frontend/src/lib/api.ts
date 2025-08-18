import type { Draft, ApiResult, Platform } from './types';

export function isDemoBaseUrl(baseUrl: string) {
  const envDemo = (import.meta as any).env?.VITE_DEMO_MODE === 'true';
  return envDemo || !baseUrl || baseUrl === 'demo';
}

export function createApi(baseUrl: string, token?: string) {
  const root = (baseUrl || '').replace(/\/$/, '');

  // Demo mode: return mocked API without network
  if (isDemoBaseUrl(baseUrl)) {
    function mockDraft(input: {
      topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
    }): Draft {
      const title = input.topic.length < 80 ? input.topic : input.topic.slice(0, 77) + '...';
      const body = [
        `<h1>${title}</h1>`,
        `<p>이 페이지는 데모 모드입니다. 실제 API 호출 없이 생성된 예시 콘텐츠입니다.</p>`,
        input.outline && input.outline.length
          ? `<h2>아웃라인</h2><ul>${input.outline.map(o => `<li>${o}</li>`).join('')}</ul>`
          : '',
        `<h2>본문</h2>`,
        `<p>스타일: ${input.style || 'informative'} / 길이: ~${input.targetLength || 1200} / 언어: ${input.language || 'ko'}</p>`
      ].join('\n');
      const summary = `데모 모드: ${title}`.slice(0, 155);
      return {
        title,
        content_html: body,
        summary,
        keywords: ['demo', 'mock', 'preview'],
        meta_title: title.slice(0, 60),
        meta_description: summary
      };
    }

    return {
      async generateBlog(payload: {
        topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
      }): Promise<Draft> {
        return Promise.resolve(mockDraft(payload));
      },

      async generateAndPublish(payload: {
        topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
        publish: true; platform: Platform; wpOptions?: any; tistoryOptions?: any;
      }): Promise<{ draft: Draft; publishResult: unknown }> {
        const draft = mockDraft(payload);
        return Promise.resolve({ draft, publishResult: { ok: true, demo: true, platform: payload.platform } });
      },

      async publishWordpress(_payload: { title: string; content: string; status?: 'draft'|'publish'; categories?: number[]; tags?: number[]; }): Promise<ApiResult> {
        return Promise.resolve({ ok: true, result: { demo: true, platform: 'wordpress' } });
      },

      async publishTistory(_payload: { title: string; content: string; visibility?: number; category?: number; tag?: string; }): Promise<ApiResult> {
        return Promise.resolve({ ok: true, result: { demo: true, platform: 'tistory' } });
      },

      async enqueuePublish(_payload: { platform: Platform; payload: any }): Promise<ApiResult> {
        return Promise.resolve({ ok: true, result: { demo: true } });
      },

      async getQueueStatus(): Promise<any> {
        return Promise.resolve({ 
          summary: { pending: 2, processing: 0, completed: 5, failed: 1 },
          queues: {
            pending: [
              { taskId: 1, platform: 'wordpress', createdAt: new Date().toISOString() },
              { taskId: 2, platform: 'tistory', createdAt: new Date().toISOString() }
            ],
            completed: [
              { taskId: 3, platform: 'wordpress', createdAt: new Date().toISOString() }
            ]
          },
          totalTasks: 7
        });
      }
    };
  }

  async function callPost<T>(path: string, payload: unknown): Promise<T> {
    const url = root + '/api/' + path.replace(/^\//, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload ?? {}) });
    const contentType = resp.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
    if (!resp.ok) {
      throw new Error(typeof body === 'string' ? body : (body?.error || 'Request failed'));
    }
    return body as T;
  }

  async function callGet<T>(path: string): Promise<T> {
    const url = root + '/api/' + path.replace(/^\//, '');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(url, { method: 'GET', headers });
    const contentType = resp.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
    if (!resp.ok) {
      throw new Error(typeof body === 'string' ? body : (body?.error || 'Request failed'));
    }
    return body as T;
  }

  return {
    generateBlog(payload: {
      topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
    }): Promise<Draft> {
      return callPost<Draft>('GenerateBlog', payload);
    },

    generateAndPublish(payload: {
      topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
      publish: true; platform: Platform; wpOptions?: any; tistoryOptions?: any;
    }): Promise<{ draft: Draft; publishResult: unknown }> {
      return callPost('GenerateAndPublish', payload);
    },

    publishWordpress(payload: { title: string; content: string; status?: 'draft'|'publish'; categories?: number[]; tags?: number[]; }): Promise<ApiResult> {
      return callPost('PublishWordPress', payload);
    },

    publishTistory(payload: { title: string; content: string; visibility?: number; category?: number; tag?: string; }): Promise<ApiResult> {
      return callPost('PublishTistory', payload);
    },

    enqueuePublish(payload: { platform: Platform; payload: any }): Promise<ApiResult> {
      return callPost('EnqueuePublish', payload);
    },

    async getQueueStatus(): Promise<any> {
      return callGet('GetQueueStatus');
    },

    analyzeSEO(payload: { content: string; title?: string; metaDescription?: string; keywords?: string[]; }): Promise<any> {
      return callPost('AnalyzeSEO', payload);
    },

    checkGrammar(payload: { text: string; language?: string; useAI?: boolean; }): Promise<any> {
      return callPost('CheckGrammar', payload);
    },

    addToQueue(payload: { title: string; content: string; platforms: Platform[]; }): Promise<ApiResult> {
      return callPost('EnqueuePublish', { 
        tasks: payload.platforms.map(platform => ({
          platform,
          payload: { title: payload.title, content: payload.content }
        }))
      });
    }
  };
}