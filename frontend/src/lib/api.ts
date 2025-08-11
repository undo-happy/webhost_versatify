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

  async function call<T>(path: string, payload: unknown, method: 'GET' | 'POST' = 'POST'): Promise<T> {
    const url = root.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const fetchOptions: RequestInit = { method, headers };
    
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(payload ?? {});
    }
    
    const resp = await fetch(url, fetchOptions);
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
    },

    getQueueStatus(): Promise<{
      userId: string;
      totalTasks: number;
      queues: {
        pending: Array<any>;
        processing: Array<any>;
        completed: Array<any>;
        failed: Array<any>;
      };
      summary: {
        pending: number;
        processing: number;
        completed: number;
        failed: number;
      };
    }> {
      return call('queue/my-status', null, 'GET');
    }
  };
}