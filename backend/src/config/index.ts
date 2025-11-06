import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../..', '.env') });

export const config = {
  port: process.env.PORT || 3031,
  newsApiKey: process.env.NEWS_API_KEY || '',
  hfApiToken: process.env.HF_API_TOKEN || '',
  hfModel: process.env.HF_MODEL || 'ProsusAI/finbert',
};

export function validateConfig(requiredKeys?: ('newsApiKey' | 'hfApiToken')[]) {
  const keysToCheck = requiredKeys || ['newsApiKey', 'hfApiToken'];
  const missing: string[] = [];

  if (keysToCheck.includes('newsApiKey') && !config.newsApiKey) {
    missing.push('NEWS_API_KEY');
  }
  if (keysToCheck.includes('hfApiToken') && !config.hfApiToken) {
    missing.push('HF_API_TOKEN');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

