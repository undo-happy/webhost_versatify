import type { 
  Draft, 
  ApiResult, 
  Platform, 
  BlogGenerationPayload, 
  GenerateAndPublishPayload, 
  WordPressOptions, 
  TistoryOptions 
} from './types';

export function createApi(baseUrl: string, token?: string) {
  const root = baseUrl || '/api';
  if (!root.startsWith('/') && !root.startsWith('http')) {
    throw new Error('API Base URL must start with / or http');
  }

  async function call<T>(path: string, payload: unknown): Promise<T> {
    const url = root.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload ?? {}) });
    const contentType = resp.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
    
    if (!resp.ok) {
      const errorMsg = typeof body === 'string' ? body : (body?.error || `Request failed: ${resp.status} ${resp.statusText}`);
      throw new Error(errorMsg);
    }
    
    return body as T;
  }

  return {
    generateBlog(payload: BlogGenerationPayload): Promise<Draft> {
      return call<Draft>('generate-blog', payload);
    },

    generateAndPublish(payload: GenerateAndPublishPayload): Promise<{ draft: Draft; publishResult: unknown }> {
      return call('generate-and-publish', payload);
    },

    publishWordpress(payload: { title: string; content: string } & WordPressOptions): Promise<ApiResult> {
      return call('publish/wordpress', payload);
    },

    publishTistory(payload: { title: string; content: string } & TistoryOptions): Promise<ApiResult> {
      return call('publish/tistory', payload);
    },

    enqueuePublish(payload: { platform: Platform; payload: unknown }): Promise<ApiResult> {
      return call('enqueue/publish', payload);
    }
  };
}