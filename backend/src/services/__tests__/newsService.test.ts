import { describe, it, expect, beforeAll } from 'vitest';
import { newsService } from '../newsService.js';
import { config } from '../../config/index.js';

describe('NewsService Integration Tests', () => {
  beforeAll(() => {
    if (!config.newsApiKey) {
      throw new Error('NEWS_API_KEY must be set to run integration tests. Set it in .env file.');
    }
  });

  it('should fetch news articles for a valid symbol', async () => {
    const symbol = 'AAPL';
    const limit = 5;

    const articles = await newsService.fetchNews(symbol, limit);

    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    expect(articles.length).toBeLessThanOrEqual(limit);

    const article = articles[0];
    expect(article).toHaveProperty('symbol', symbol);
    expect(article).toHaveProperty('headline');
    expect(article).toHaveProperty('description');
    expect(article).toHaveProperty('source');
    expect(article).toHaveProperty('url');
    expect(article).toHaveProperty('publishedAt');

    expect(typeof article.headline).toBe('string');
    expect(article.headline.length).toBeGreaterThan(0);
  }, 10000); // 10 second timeout for API call

  it('should handle large symbols gracefully', async () => {
    const symbol = 'MSFT';
    const limit = 20;

    const articles = await newsService.fetchNews(symbol, limit);

    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    articles.forEach(article => {
      expect(article.symbol).toBe(symbol);
    });
  }, 10000);

  it('should return empty array or handle gracefully for invalid symbols', async () => {
    const symbol = 'INVALIDXYZ123';

    const articles = await newsService.fetchNews(symbol, 5);

    expect(Array.isArray(articles)).toBe(true);
    // NewsAPI might return articles or empty array for invalid symbols
  }, 10000);

  it('should respect the limit parameter', async () => {
    const symbol = 'GOOGL';
    const limit = 3;

    const articles = await newsService.fetchNews(symbol, limit);

    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeLessThanOrEqual(limit);
  }, 10000);

  it('should return articles with valid date formats', async () => {
    const symbol = 'TSLA';

    const articles = await newsService.fetchNews(symbol, 5);

    expect(articles.length).toBeGreaterThan(0);
    
    articles.forEach(article => {
      if (article.publishedAt) {
        const date = new Date(article.publishedAt);
        expect(date.toString()).not.toBe('Invalid Date');
        expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      }
    });
  }, 10000);
});

