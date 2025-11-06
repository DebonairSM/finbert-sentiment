import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const watchlistSymbols = sqliteTable('watchlist_symbols', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull().unique(),
  assetType: text('asset_type'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const newsArticles = sqliteTable(
  'news_articles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    symbol: text('symbol').notNull(),
    headline: text('headline').notNull(),
    summary: text('summary'),
    source: text('source'),
    url: text('url'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    rawText: text('raw_text').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    symbolUrlIdx: uniqueIndex('symbol_url_idx').on(table.symbol, table.url),
  })
);

export const sentimentScores = sqliteTable('sentiment_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id')
    .notNull()
    .references(() => newsArticles.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  scorePositive: real('score_positive').notNull().default(0),
  scoreNeutral: real('score_neutral').notNull().default(0),
  scoreNegative: real('score_negative').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
