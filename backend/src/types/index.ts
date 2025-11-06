export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface NormalizedArticle {
  symbol: string;
  headline: string;
  description?: string;
  source?: string;
  url?: string;
  publishedAt?: string;
}

export interface FinBertResult {
  label: SentimentLabel;
  score: number;
}

export interface SentimentArticle {
  id: number;
  symbol: string;
  headline: string;
  source?: string;
  url?: string;
  publishedAt?: Date;
  label: SentimentLabel;
  score: number;
}

export interface SymbolSentimentSummary {
  symbol: string;
  sentimentIndex: number;
  counts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  lastUpdated: string;
  articles: SentimentArticle[];
}

