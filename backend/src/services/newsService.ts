import { config, validateConfig } from '../config.js';
import type { NormalizedArticle } from '../types.js';

export class NewsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://newsapi.org/v2';

  constructor() {
    validateConfig(['newsApiKey']);
    this.apiKey = config.newsApiKey!;
  }

  async fetchNews(symbol: string, limit: number = 20): Promise<NormalizedArticle[]> {
    const url = new URL(`${this.baseUrl}/everything`);
    url.searchParams.set('q', symbol);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', String(limit));
    url.searchParams.set('apiKey', this.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NewsAPI error (${response.status}): ${error}`);
    }

    const data = await response.json() as any;

    if (data.status !== 'ok') {
      throw new Error(`NewsAPI returned status: ${data.status}`);
    }

    return data.articles.map((article: any) => ({
      symbol,
      headline: article.title || '',
      description: article.description || '',
      source: article.source?.name,
      url: article.url,
      publishedAt: article.publishedAt,
    }));
  }
}

export const newsService = new NewsService();
