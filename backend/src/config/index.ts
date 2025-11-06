import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../..', '.env') });

export type NewsProvider = 'newsapi' | 'alphavantage';

export const config = {
  port: process.env.VITE_BACKEND_PORT || process.env.PORT || 3031,
  newsProvider: (process.env.NEWS_PROVIDER || 'alphavantage') as NewsProvider,
  newsApiKey: process.env.NEWS_API_KEY || '',
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  hfApiToken: process.env.HF_API_TOKEN || '',
  hfModel: process.env.HF_MODEL || 'ProsusAI/finbert',
};

export function validateConfig(requiredKeys?: ('newsApiKey' | 'alphaVantageApiKey' | 'hfApiToken')[]) {
  const keysToCheck = requiredKeys || ['hfApiToken'];
  const missing: string[] = [];

  if (keysToCheck.includes('newsApiKey') && !config.newsApiKey) {
    missing.push('NEWS_API_KEY');
  }
  if (keysToCheck.includes('alphaVantageApiKey') && !config.alphaVantageApiKey) {
    missing.push('ALPHA_VANTAGE_API_KEY');
  }
  if (keysToCheck.includes('hfApiToken') && !config.hfApiToken) {
    missing.push('HF_API_TOKEN');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

