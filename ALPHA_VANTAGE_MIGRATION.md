# Alpha Vantage Integration Complete

Alpha Vantage has been successfully integrated as the default news provider. The system now supports switching between Alpha Vantage (real-time) and NewsAPI (24h delayed).

## What Changed

### Backend
1. Created `alphaVantageNewsService.ts` - New service for Alpha Vantage News & Sentiment API
2. Updated `newsService.ts` - Now acts as a factory that selects the right provider
3. Updated `config/index.ts` - Added `NEWS_PROVIDER` and `ALPHA_VANTAGE_API_KEY` support
4. NewsAPI code is still intact, just disabled by default

### Documentation
- Updated `README.md` with Alpha Vantage setup instructions
- Updated `SETUP_GUIDE.md` with provider switching details
- Updated `QUICKSTART.md` with new prerequisites

## What You Need To Do

### 1. Get Alpha Vantage API Key
Visit: https://www.alphavantage.co/support/#api-key
- Enter your email
- Claim your free API key
- Free tier: 25 API calls/day (real-time news)

### 2. Update Your `.env` File

Add these two lines to your `.env` file in the root directory:

```env
NEWS_PROVIDER=alphavantage
ALPHA_VANTAGE_API_KEY=your_actual_key_here
```

Your existing `NEWS_API_KEY` can stay in the file (for future use if you want to switch back).

### 3. Restart Backend

```bash
cd backend
npm run dev
```

That's it! The app now uses Alpha Vantage for real-time financial news.

## Switching Back to NewsAPI

If you ever want to switch back to NewsAPI, simply change in `.env`:

```env
NEWS_PROVIDER=newsapi
```

Then restart the backend. No code changes needed.

## Rate Limit Comparison

| Provider | Free Tier | Real-time? | Delay | History |
|----------|-----------|------------|-------|---------|
| **Alpha Vantage** | 25/day | ✅ Yes | None | N/A |
| **NewsAPI** | 100/day | ❌ No | 24 hours | 30 days |

## API Usage with 14 Symbols (Quick Add Majors)

- **Alpha Vantage**: 14 calls per refresh (1 per symbol)
- **Max refreshes/day**: 25 ÷ 14 = 1-2 refreshes max
- **Hugging Face**: 280 calls per refresh (14 × 20 articles)

**Important**: With 14 symbols, you can only do 1-2 full refreshes per day on free tiers. Consider:
- Reducing watchlist size
- Reducing articles per symbol (currently 20)
- Selective symbol refreshes
- Upgrading to paid tiers if needed

## Testing

Test the Alpha Vantage integration:

```bash
cd backend
npm run dev
```

Then in the frontend:
1. Add a symbol (e.g., AAPL, BTC)
2. Click "Refresh Sentiment"
3. You should see real-time news articles

Check the backend logs for any API errors.

