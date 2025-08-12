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
      }
    };
  }

  async function call<T>(path: string, payload: unknown): Promise<T> {
    const url = root + '/' + path.replace(/^\//, '');
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

  return {
    generateBlog(payload: {
      topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
    }): Promise<Draft> {
      return call<Draft>('generate-blog', payload);
    },

    generateAndPublish(payload: {
      topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
      publish: true; platform: Platform; wpOptions?: any; tistoryOptions?: any;
    }): Promise<{ draft: Draft; publishResult: unknown }> {
      return call('generate-and-publish', payload);
    },

    publishWordpress(payload: { title: string; content: string; status?: 'draft'|'publish'; categories?: number[]; tags?: number[]; }): Promise<ApiResult> {
      return call('publish/wordpress', payload);
    },

    publishTistory(payload: { title: string; content: string; visibility?: number; category?: number; tag?: string; }): Promise<ApiResult> {
      return call('publish/tistory', payload);
    },

    enqueuePublish(payload: { platform: Platform; payload: any }): Promise<ApiResult> {
      return call('enqueue/publish', payload);
    }
  };
}