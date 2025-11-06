import { config, validateConfig } from '../config/index.js';
import type { NormalizedArticle } from '../types.js';

export class NewsAPIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://newsapi.org/v2';

  constructor() {
    validateConfig(['newsApiKey']);
    this.apiKey = config.newsApiKey!;
  }

  async fetchNews(symbol: string, limit: number = 20, assetType?: string | null): Promise<NormalizedArticle[]> {
    const url = new URL(`${this.baseUrl}/everything`);
    
    // Adjust search term based on asset type for better results
    let searchQuery = symbol;
    if (assetType === 'forex') {
      const base = symbol.substring(0, 3);
      const quote = symbol.substring(3, 6);
      searchQuery = `${base} ${quote} forex`;
    } else if (assetType === 'crypto') {
      const cryptoNames: Record<string, string> = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'USDT': 'Tether',
        'BNB': 'Binance',
        'XRP': 'Ripple',
        'ADA': 'Cardano',
        'DOGE': 'Dogecoin',
        'SOL': 'Solana',
        'DOT': 'Polkadot',
        'MATIC': 'Polygon',
      };
      searchQuery = `${cryptoNames[symbol.toUpperCase()] || symbol} crypto`;
    }
    
    url.searchParams.set('q', searchQuery);
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

// Factory function to get the appropriate news service based on config
function getNewsService() {
  if (config.newsProvider === 'alphavantage') {
    // Dynamic import to avoid circular dependencies
    return import('./alphaVantageNewsService.js').then(m => m.alphaVantageNewsService);
  } else {
    return Promise.resolve(new NewsAPIService());
  }
}

// Export a wrapper that delegates to the configured service
export const newsService = {
  async fetchNews(symbol: string, limit: number = 20, assetType?: string | null): Promise<NormalizedArticle[]> {
    const service = await getNewsService();
    return service.fetchNews(symbol, limit, assetType);
  }
};
