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

export type WordPressOptions = {
  status?: 'draft' | 'publish';
  categories?: number[];
  tags?: number[];
};

export type TistoryOptions = {
  visibility?: number;
  category?: number;
  tag?: string;
};

export type BlogGenerationPayload = {
  topic: string;
  style?: string;
  outline?: string[];
  targetLength?: number;
  language?: string;
};

export type GenerateAndPublishPayload = BlogGenerationPayload & {
  publish: true;
  platform: Platform;
  wpOptions?: WordPressOptions;
  tistoryOptions?: TistoryOptions;
};

export type PublishResult = {
  ok: boolean;
  result?: unknown;
  error?: string;
};