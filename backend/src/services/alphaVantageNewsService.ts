import { config, validateConfig } from '../config/index.js';
import type { NormalizedArticle } from '../types.js';

export class AlphaVantageNewsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';

  constructor() {
    validateConfig(['alphaVantageApiKey']);
    this.apiKey = config.alphaVantageApiKey!;
  }

  async fetchNews(symbol: string, limit: number = 20, assetType?: string | null): Promise<NormalizedArticle[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('function', 'NEWS_SENTIMENT');
    
    // Handle different asset types with appropriate search terms
    let searchTerm = symbol;
    let useTopicSearch = false;
    
    if (assetType === 'forex') {
      // For forex, we'll fetch topic-based news since tickers don't work
      // Then filter by currency codes
      const base = symbol.substring(0, 3);
      const quote = symbol.substring(3, 6);
      searchTerm = `${base} ${quote}`;
      url.searchParams.set('topics', 'forex');
      useTopicSearch = true;
    } else if (assetType === 'crypto') {
      // For crypto, use the cryptocurrency name as ticker
      const cryptoTickers: Record<string, string> = {
        'BTC': 'CRYPTO:BTC',
        'ETH': 'CRYPTO:ETH',
        'USDT': 'CRYPTO:USDT',
        'BNB': 'CRYPTO:BNB',
        'XRP': 'CRYPTO:XRP',
        'ADA': 'CRYPTO:ADA',
        'DOGE': 'CRYPTO:DOGE',
        'SOL': 'CRYPTO:SOL',
        'DOT': 'CRYPTO:DOT',
        'MATIC': 'CRYPTO:MATIC',
      };
      const ticker = cryptoTickers[symbol.toUpperCase()] || `CRYPTO:${symbol}`;
      url.searchParams.set('tickers', ticker);
      searchTerm = symbol;
    } else {
      // For stocks and ETFs, use ticker notation
      url.searchParams.set('tickers', symbol);
    }
    
    url.searchParams.set('limit', String(Math.min(limit, 50))); // Alpha Vantage max is 50
    
    // Add sort parameter to get most recent news first
    url.searchParams.set('sort', 'LATEST');
    
    url.searchParams.set('apikey', this.apiKey);
    
    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      console.error(`[AlphaVantage] HTTP error ${response.status}: ${error}`);
      throw new Error(`Alpha Vantage API error (${response.status}): ${error}`);
    }

    const data = await response.json() as any;

    // Check for API error messages
    if (data['Error Message']) {
      console.error(`[AlphaVantage] API Error: ${data['Error Message']}`);
      throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
    }

    if (data['Note']) {
      console.error(`[AlphaVantage] Rate limit: ${data['Note']}`);
      throw new Error(`Alpha Vantage rate limit: ${data['Note']}`);
    }
    
    if (data['Information']) {
      console.error(`[AlphaVantage] API Information message: ${data['Information']}`);
      throw new Error(`Alpha Vantage: ${data['Information']}`);
    }

    if (!data.feed || !Array.isArray(data.feed)) {
      // For forex, try again without topic filter (fallback to general news)
      if (assetType === 'forex' && useTopicSearch) {
        return this.fetchNewsWithoutTopicFilter(symbol, limit, searchTerm);
      }
      
      return [];
    }

    let articles = data.feed;
    
    // For forex, filter by relevance since we're using topic search
    if (assetType === 'forex') {
      const searchTermLower = searchTerm.toLowerCase();
      const symbolLower = symbol.toLowerCase();
      const base = symbol.substring(0, 3).toLowerCase();
      const quote = symbol.substring(3, 6).toLowerCase();
      articles = articles.filter((article: any) => {
        const title = (article.title || '').toLowerCase();
        const summary = (article.summary || '').toLowerCase();
        const text = title + ' ' + summary;
        
        // Look for currency codes or the full pair
        return text.includes(symbolLower) || 
               (text.includes(base) && text.includes(quote)) ||
               text.includes(searchTermLower);
      });
    }

    return articles.map((article: any) => ({
      symbol,
      headline: article.title || '',
      description: article.summary || '',
      source: article.source || article.authors?.join(', '),
      url: article.url,
      publishedAt: article.time_published ? this.parseAlphaVantageTime(article.time_published) : undefined,
    }));
  }

  private async fetchNewsWithoutTopicFilter(symbol: string, limit: number, searchTerm: string): Promise<NormalizedArticle[]> {
    // Fallback method: Fetch general news and filter client-side
    const url = new URL(this.baseUrl);
    url.searchParams.set('function', 'NEWS_SENTIMENT');
    url.searchParams.set('limit', String(Math.min(limit * 3, 50))); // Get more articles to filter from
    url.searchParams.set('sort', 'LATEST');
    url.searchParams.set('apikey', this.apiKey);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json() as any;
    
    if (!data.feed || !Array.isArray(data.feed)) {
      return [];
    }
    
    // Filter for forex-related articles
    const searchTermLower = searchTerm.toLowerCase();
    const symbolLower = symbol.toLowerCase();
    const base = symbol.substring(0, 3).toLowerCase();
    const quote = symbol.substring(3, 6).toLowerCase();
    
    const filtered = data.feed.filter((article: any) => {
      const title = (article.title || '').toLowerCase();
      const summary = (article.summary || '').toLowerCase();
      const text = title + ' ' + summary;
      
      // Check for forex-related keywords AND currency codes
      const hasForexKeyword = text.includes('forex') || 
                             text.includes('currency') || 
                             text.includes('exchange rate') ||
                             text.includes('fx ');
      
      const hasCurrencyCodes = text.includes(symbolLower) || 
                              (text.includes(base) && text.includes(quote));
      
      return hasCurrencyCodes || (hasForexKeyword && (text.includes(base) || text.includes(quote)));
    }).slice(0, limit);
    
    return filtered.map((article: any) => ({
      symbol,
      headline: article.title || '',
      description: article.summary || '',
      source: article.source || article.authors?.join(', '),
      url: article.url,
      publishedAt: article.time_published ? this.parseAlphaVantageTime(article.time_published) : undefined,
    }));
  }

  private parseAlphaVantageTime(timeString: string): string {
    // Alpha Vantage format: "20241106T123000" (YYYYMMDDTHHMMSS)
    const year = timeString.substring(0, 4);
    const month = timeString.substring(4, 6);
    const day = timeString.substring(6, 8);
    const hour = timeString.substring(9, 11);
    const minute = timeString.substring(11, 13);
    const second = timeString.substring(13, 15);
    
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
  }
}

export const alphaVantageNewsService = new AlphaVantageNewsService();

