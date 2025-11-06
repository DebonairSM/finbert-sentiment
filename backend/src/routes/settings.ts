import { Router } from 'express';
import { config } from '../config/index.js';

export const settingsRouter = Router();

// Get current configuration
settingsRouter.get('/config', async (req, res) => {
  try {
    res.json({
      newsProvider: config.newsProvider,
      providers: {
        alphavantage: {
          enabled: !!config.alphaVantageApiKey,
          name: 'Alpha Vantage',
          description: 'Real-time financial news',
          rateLimit: '25 calls/day (free tier)',
          delay: 'None'
        },
        newsapi: {
          enabled: !!config.newsApiKey,
          name: 'NewsAPI',
          description: 'General news (24h delay on free tier)',
          rateLimit: '100 calls/day (free tier)',
          delay: '24 hours'
        }
      },
      huggingFace: {
        enabled: !!config.hfApiToken,
        model: config.hfModel
      }
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

