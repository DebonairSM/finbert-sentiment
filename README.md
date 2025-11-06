# Market Sentiment Admin App

A full-stack application that tracks market sentiment for stocks, forex, and crypto symbols using AI-powered FinBERT analysis.

## Features

- Watchlist management for market symbols
- Automated news fetching from NewsAPI
- AI sentiment analysis using Hugging Face FinBERT model
- Real-time sentiment tracking and visualization
- Admin dashboard with React frontend

## Tech Stack

### Backend
- Node.js with TypeScript
- Express for REST API
- Drizzle ORM with SQLite
- sql.js for database (pure JavaScript, no native dependencies)

### Frontend
- React with TypeScript
- Vite for build tooling
- React Router for navigation
- CSS for styling

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Setup

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
HF_API_TOKEN=your_huggingface_token
HF_MODEL=ProsusAI/finbert
NEWS_API_KEY=your_newsapi_key
PORT=3031                    # Backend server port
VITE_BACKEND_PORT=3031       # Must match PORT for frontend proxy
VITE_FRONTEND_PORT=3000      # Frontend dev server port (optional, defaults to 3000)
```

#### Getting API Keys

**Hugging Face API Token:**
1. Sign up at https://huggingface.co
2. Go to Settings > Access Tokens
3. Create a new token with read access

**NewsAPI Key:**
1. Sign up at https://newsapi.org
2. Get your free API key from the dashboard
3. Free tier: 100 requests/day

### 3. Database Setup

```bash
cd backend
npm run db:migrate
```

This creates a SQLite database at `backend/data/sentiment.db` with three tables:
- `watchlist_symbols` - tracked symbols
- `news_articles` - fetched news articles
- `sentiment_scores` - FinBERT analysis results

Note: Migration files are already included in the `backend/drizzle` directory. Only run `npm run db:generate` if you modify the database schema.

### 4. Run the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:3031

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

## Usage

### 1. Add Symbols to Watchlist
- Navigate to Market Sentiment page
- Enter a symbol (e.g., AAPL, EURUSD, BTC)
- Optionally select asset type
- Click "Add Symbol"

### 2. Fetch Sentiment Data
- Click "Refresh Sentiment" button
- The app will:
  - Fetch latest news for each symbol
  - Analyze each article with FinBERT
  - Store results in database
  - Display sentiment summaries

### 3. View Results
- Summary cards show sentiment index (-1 to +1)
- Green = positive, Yellow = neutral, Red = negative
- Click a card to view article details
- Article table shows headlines, sources, and individual sentiment scores

## API Endpoints

### Watchlist
- `GET /api/sentiment/watchlist` - List all symbols
- `POST /api/sentiment/watchlist` - Add symbol
  ```json
  { "symbol": "AAPL", "assetType": "stock" }
  ```
- `DELETE /api/sentiment/watchlist/:symbol` - Remove symbol

### Sentiment Analysis
- `GET /api/sentiment/summary?symbols=AAPL,GOOGL` - Get summaries
- `POST /api/sentiment/refresh` - Trigger analysis
  ```json
  { "symbols": ["AAPL"] }  // optional, defaults to all
  ```

## Testing

**Backend tests:**
```bash
cd backend
npm test
```

**Frontend tests:**
```bash
cd frontend
npm test
```

## Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

The frontend build outputs to `frontend/dist` and can be served statically or integrated with the backend.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/           # Database schema and migrations
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── config.ts     # Environment config
│   │   └── index.ts      # Express app
│   └── drizzle/          # Migration files
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── main.tsx      # App entry point
└── README.md
```

## Sentiment Index Calculation

```
index = (positive_count - negative_count) / total_count
```

- Range: -1.0 to +1.0
- Positive index: more positive articles
- Negative index: more negative articles
- Zero: balanced or no data

## Troubleshooting

**"Port already in use"**
- Change `PORT` (backend), `VITE_BACKEND_PORT` (frontend proxy), and `VITE_FRONTEND_PORT` (frontend dev server) in `.env` file
- `PORT` and `VITE_BACKEND_PORT` must match (default: 3031)
- `VITE_FRONTEND_PORT` sets the frontend dev server port (default: 3000)
- Kill existing processes: `npx kill-port 3000 3031` or manually

**"Missing required environment variable"**
- Check your `.env` file is in the root directory
- Verify all required variables are set

**"Failed to fetch news"**
- Verify NEWS_API_KEY is valid
- Check you haven't exceeded rate limits (100/day free tier)

**"Model is loading" errors**
- Hugging Face models need warm-up time
- The client retries automatically
- Usually resolves after 10-30 seconds

**Database errors**
- Delete `backend/data/sentiment.db` and run `npm run db:migrate` again
- Ensure only one backend instance is running

## License

MIT

## Notes

This is a POC application. For production use, consider:
- Add user authentication
- Implement rate limiting
- Use PostgreSQL instead of SQLite
- Add caching layer
- Implement background job queue for sentiment analysis
- Add more comprehensive error handling
- Implement data retention policies
