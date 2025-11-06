import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export const config = {
  port: process.env.VITE_BACKEND_PORT || process.env.PORT || 3031,
  hfApiToken: process.env.HF_API_TOKEN,
  hfModel: process.env.HF_MODEL || 'ProsusAI/finbert',
  newsApiKey: process.env.NEWS_API_KEY,
};

export function validateConfig(requiredKeys: (keyof typeof config)[]) {
  for (const key of requiredKeys) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key.toUpperCase()}`);
    }
  }
}

