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