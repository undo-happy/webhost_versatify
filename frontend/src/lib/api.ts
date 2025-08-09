import type { Draft, ApiResult, Platform } from './types';

export function createApi(baseUrl: string, token?: string) {
  const root = baseUrl.replace(/\/$/, '');

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