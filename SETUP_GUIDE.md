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
# Get your Hugging Face token from: https://huggingface.co/settings/tokens
HF_API_TOKEN=your_token_here

# Get your NewsAPI key from: https://newsapi.org/
NEWS_API_KEY=your_key_here

HF_MODEL=ProsusAI/finbert
PORT=3031
```

### 2. Get API Keys

**NewsAPI Key (Required for articles):**
1. Go to https://newsapi.org/
2. Click "Get API Key"
3. Sign up (free tier: 100 requests/day)
4. Copy your API key
5. Add to `.env` file

**Hugging Face Token (Required for sentiment analysis):**
1. Go to https://huggingface.co/
2. Create account and log in
3. Go to Settings → Access Tokens
4. Create new token with "read" access
5. Copy token
6. Add to `.env` file

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

