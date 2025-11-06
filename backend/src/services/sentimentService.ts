import { db } from '../db/index.js';
import { watchlistSymbols, newsArticles, sentimentScores } from '../db/schema.js';
import { newsService } from './newsService.js';
import { finbertClient } from './finbertClient.js';
import type { SymbolSentimentSummary, SentimentLabel } from '../types.js';
import { eq, and, sql } from 'drizzle-orm';

export class SentimentService {
  async refreshSentiment(symbols: string[]): Promise<SymbolSentimentSummary[]> {
    const summaries: SymbolSentimentSummary[] = [];

    for (const symbol of symbols) {
      try {
        // Fetch news
        const articles = await newsService.fetchNews(symbol);

        // Insert articles and analyze sentiment
        for (const article of articles) {
          try {
            // Build raw text for analysis
            const rawText = `${article.headline}. ${article.description || ''}`.trim();

            // Insert or update article
            const [insertedArticle] = await db
              .insert(newsArticles)
              .values({
                symbol: article.symbol,
                headline: article.headline,
                summary: article.description,
                source: article.source,
                url: article.url,
                publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                rawText,
              })
              .onConflictDoNothing()
              .returning();

            // Skip if article already exists (conflict)
            if (!insertedArticle) continue;

            // Analyze sentiment
            const sentiment = await finbertClient.analyzeSentiment(rawText);

            // Store sentiment score
            await db.insert(sentimentScores).values({
              articleId: insertedArticle.id,
              label: sentiment.label,
              scorePositive: sentiment.label === 'positive' ? sentiment.score : 0,
              scoreNeutral: sentiment.label === 'neutral' ? sentiment.score : 0,
              scoreNegative: sentiment.label === 'negative' ? sentiment.score : 0,
            });
          } catch (error) {
            console.error(`Error processing article for ${symbol}:`, error);
            // Continue with other articles
          }
        }

        // Generate summary
        const summary = await this.getSummaryForSymbol(symbol);
        summaries.push(summary);
      } catch (error) {
        console.error(`Error refreshing sentiment for ${symbol}:`, error);
        // Add empty summary for failed symbol
        summaries.push({
          symbol,
          sentimentIndex: 0,
          counts: { positive: 0, neutral: 0, negative: 0 },
          lastUpdated: new Date().toISOString(),
          articles: [],
        });
      }
    }

    return summaries;
  }

  async getSummaryForSymbol(symbol: string): Promise<SymbolSentimentSummary> {
    // Get all articles with sentiment for this symbol
    const articlesWithSentiment = await db
      .select({
        id: newsArticles.id,
        symbol: newsArticles.symbol,
        headline: newsArticles.headline,
        source: newsArticles.source,
        url: newsArticles.url,
        publishedAt: newsArticles.publishedAt,
        label: sentimentScores.label,
        scorePositive: sentimentScores.scorePositive,
        scoreNeutral: sentimentScores.scoreNeutral,
        scoreNegative: sentimentScores.scoreNegative,
        createdAt: sentimentScores.createdAt,
      })
      .from(newsArticles)
      .innerJoin(sentimentScores, eq(sentimentScores.articleId, newsArticles.id))
      .where(eq(newsArticles.symbol, symbol))
      .orderBy(sql`${newsArticles.publishedAt} DESC`);

    // Calculate counts
    const counts = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const articles = articlesWithSentiment.map((row) => {
      const label = row.label as SentimentLabel;
      counts[label]++;

      const score = 
        label === 'positive' ? row.scorePositive :
        label === 'negative' ? row.scoreNegative :
        row.scoreNeutral;

      return {
        id: row.id,
        symbol: row.symbol,
        headline: row.headline,
        source: row.source || undefined,
        url: row.url || undefined,
        publishedAt: row.publishedAt?.toISOString(),
        label,
        score,
      };
    });

    // Calculate sentiment index
    const totalCount = counts.positive + counts.neutral + counts.negative;
    const sentimentIndex = totalCount > 0
      ? (counts.positive - counts.negative) / totalCount
      : 0;

    // Get last updated time
    const lastUpdated = articlesWithSentiment.length > 0
      ? articlesWithSentiment[0].createdAt.toISOString()
      : new Date().toISOString();

    return {
      symbol,
      sentimentIndex,
      counts,
      lastUpdated,
      articles,
    };
  }

  async getSummaries(symbols?: string[]): Promise<SymbolSentimentSummary[]> {
    let targetSymbols = symbols;

    if (!targetSymbols || targetSymbols.length === 0) {
      // Get all watchlist symbols
      const allSymbols = await db.select().from(watchlistSymbols);
      targetSymbols = allSymbols.map((s) => s.symbol);
    }

    const summaries = await Promise.all(
      targetSymbols.map((symbol) => this.getSummaryForSymbol(symbol))
    );

    return summaries;
  }
}

export const sentimentService = new SentimentService();
