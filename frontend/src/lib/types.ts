export type Draft = {
  title: string;
  content_html: string;
  summary: string;
  keywords: string[];
  meta_title: string;
  meta_description: string;
  createdAt?: number;
};

export type ApiResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  detail?: unknown;
} & Partial<T>;

export type Platform = 'wordpress' | 'tistory';

export type ApiClient = {
  generateBlog(payload: {
    topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
  }): Promise<Draft>;
  generateAndPublish(payload: {
    topic: string; style?: string; outline?: string[]; targetLength?: number; language?: string;
    publish: true; platform: Platform; wpOptions?: any; tistoryOptions?: any;
  }): Promise<{ draft: Draft; publishResult: unknown }>;
  publishWordpress(payload: { title: string; content: string; status?: 'draft'|'publish'; categories?: number[]; tags?: number[]; }): Promise<ApiResult>;
  publishTistory(payload: { title: string; content: string; visibility?: number; category?: number; tag?: string; }): Promise<ApiResult>;
  enqueuePublish(payload: { platform: Platform; payload: any }): Promise<ApiResult>;
  getQueueStatus(): Promise<any>;
};