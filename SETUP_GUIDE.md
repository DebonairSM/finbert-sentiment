# Setup Guide

## Current Issues

Based on the screenshot, the application shows:
- All sentiment scores at 0.00
- "No articles found" for AAPL
- This indicates missing API keys

## Required Setup Steps

### 1. Configure Environment Variables

A `.env` file has been created in the root directory. You need to add your API keys:

```env
# News Provider: "alphavantage" (recommended) or "newsapi"
NEWS_PROVIDER=alphavantage

# Alpha Vantage API Key (Recommended - Real-time news)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# NewsAPI Key (Alternative - 24h delayed news)
NEWS_API_KEY=your_newsapi_key_here

# Hugging Face Token (Required for sentiment analysis)
HF_API_TOKEN=your_huggingface_token_here
HF_MODEL=ProsusAI/finbert
PORT=3031
```

### 2. Get API Keys

**Alpha Vantage API Key (RECOMMENDED - Real-time news):**
1. Go to https://www.alphavantage.co/support/#api-key
2. Enter your email and claim your free API key
3. Free tier: 25 API calls/day, **real-time** news for stocks/forex/crypto
4. Copy your API key
5. Add to `.env` as `ALPHA_VANTAGE_API_KEY`

**NewsAPI Key (Alternative - 24h delayed news):**
1. Go to https://newsapi.org/
2. Click "Get API Key"
3. Sign up (free tier: 100 requests/day, **24-hour delay**, last 30 days only)
4. Copy your API key
5. Add to `.env` as `NEWS_API_KEY`
6. Set `NEWS_PROVIDER=newsapi` to use this instead

**Hugging Face Token (Required for sentiment analysis):**
1. Go to https://huggingface.co/
2. Create account and log in
3. Go to Settings → Access Tokens
4. Create new token with "read" access
5. Copy token
6. Add to `.env` as `HF_API_TOKEN`

### 2a. Switching News Providers

You can easily switch between news providers by changing `NEWS_PROVIDER` in your `.env` file:

- `NEWS_PROVIDER=alphavantage` - Real-time financial news (default, recommended)
- `NEWS_PROVIDER=newsapi` - 24h delayed news, higher rate limit

No code changes needed - just update the env var and restart the backend.

### 3. Test NewsAPI Connection

After adding your NEWS_API_KEY, test the connection:

```bash
cd backend
node test-newsapi.js
```

This will verify your API key works and show sample articles.

### 4. Restart Backend Server

After adding API keys:

```bash
cd backend
npm run dev
```

The server should start without warnings about missing keys.

### 5. Test the Application

1. Open http://localhost:3000
2. Click "Refresh Sentiment" button
3. You should see:
   - Articles appear in the articles section
   - Sentiment scores calculate (not 0.00)
   - Positive/Neutral/Negative counts update

## Integration Test

A NewsAPI integration test has been added at `backend/src/services/__tests__/newsService.test.ts`

Run it with:

```bash
cd backend
npm test newsService.test.ts
```

This will:
- Verify API key works
- Test fetching articles for multiple symbols
- Validate article data structure
- Check date formats
- Test limit parameter

## Troubleshooting

**"Missing required environment variables" error**
- Check `.env` file is in root directory (not in backend/)
- Verify API keys are set (no empty values)
- No quotes around values in .env file

**"No articles found"**
- Run `node test-newsapi.js` to verify API key
- Check you haven't exceeded free tier limit (100 requests/day)
- Try a different symbol

**Sentiment scores still 0.00**
- Articles need to be fetched first
- Check browser console for errors
- Verify HF_API_TOKEN is set for sentiment analysis

**401 Unauthorized from NewsAPI**
- API key is invalid
- Check for typos in .env file
- Generate new key at newsapi.org

**426 Upgrade Required**
- Free tier has limitations
- The `everything` endpoint requires paid plan in production
- For development, free tier should work

