import { Router } from 'express';
import { db } from '../db/index.js';
import { watchlistSymbols } from '../db/schema.js';
import { sentimentService } from '../services/sentimentService.js';
import { eq } from 'drizzle-orm';

export const sentimentRouter = Router();

// Get watchlist
sentimentRouter.get('/watchlist', async (req, res) => {
  try {
    const symbols = await db.select().from(watchlistSymbols);
    res.json(symbols);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add symbol to watchlist
sentimentRouter.post('/watchlist', async (req, res) => {
  try {
    const { symbol, assetType } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const [inserted] = await db
      .insert(watchlistSymbols)
      .values({
        symbol: symbol.toUpperCase(),
        assetType,
      })
      .onConflictDoNothing()
      .returning();

    if (!inserted) {
      return res.status(409).json({ error: 'Symbol already exists' });
    }

    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error adding symbol:', error);
    res.status(500).json({ error: 'Failed to add symbol' });
  }
});

// Bulk add symbols to watchlist
sentimentRouter.post('/watchlist/bulk', async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }

    const results = {
      added: [] as any[],
      skipped: [] as string[],
    };

    for (const item of symbols) {
      const { symbol, assetType } = item;
      
      if (!symbol) continue;

      try {
        const [inserted] = await db
          .insert(watchlistSymbols)
          .values({
            symbol: symbol.toUpperCase(),
            assetType,
          })
          .onConflictDoNothing()
          .returning();

        if (inserted) {
          results.added.push(inserted);
        } else {
          results.skipped.push(symbol.toUpperCase());
        }
      } catch (error) {
        console.error(`Error adding symbol ${symbol}:`, error);
        results.skipped.push(symbol.toUpperCase());
      }
    }

    res.status(201).json(results);
  } catch (error) {
    console.error('Error bulk adding symbols:', error);
    res.status(500).json({ error: 'Failed to bulk add symbols' });
  }
});

// Remove symbol from watchlist
sentimentRouter.delete('/watchlist/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    await db
      .delete(watchlistSymbols)
      .where(eq(watchlistSymbols.symbol, symbol.toUpperCase()));

    res.status(204).send();
  } catch (error) {
    console.error('Error removing symbol:', error);
    res.status(500).json({ error: 'Failed to remove symbol' });
  }
});

// Get sentiment summaries
sentimentRouter.get('/summary', async (req, res) => {
  try {
    const symbolsParam = req.query.symbols as string | undefined;
    const symbols = symbolsParam?.split(',').map(s => s.trim().toUpperCase());

    const summaries = await sentimentService.getSummaries(symbols);
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment summaries' });
  }
});

// Refresh sentiment data
sentimentRouter.post('/refresh', async (req, res) => {
  try {
    let { symbols } = req.body;

    if (!symbols || symbols.length === 0) {
      const allSymbols = await db.select().from(watchlistSymbols);
      symbols = allSymbols.map((s) => s.symbol);
    } else {
      symbols = symbols.map((s: string) => s.toUpperCase());
    }

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'No symbols to refresh' });
    }

    const summaries = await sentimentService.refreshSentiment(symbols);
    res.json(summaries);
  } catch (error) {
    console.error('Error refreshing sentiment:', error);
    
    // Check for missing API keys
    if (error instanceof Error && error.message.includes('Missing required')) {
      return res.status(500).json({ error: error.message });
    }
    
    // Check for rate limit errors
    if (error instanceof Error && error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: error.message,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    res.status(500).json({ error: 'Failed to refresh sentiment data' });
  }
});
