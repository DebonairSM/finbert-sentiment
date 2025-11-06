# Quick Start Guide

## Prerequisites
- Node.js 18+
- Your `.env` file with API keys (already created)

## First Time Setup

1. **Install all dependencies:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. **Setup database:**
```bash
cd backend
npm run db:migrate
```

## Running the Application

You need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will start on http://localhost:3031

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start on http://localhost:3000

## Using the App

1. Open http://localhost:3000 in your browser
2. Navigate to "Market Sentiment" from the sidebar
3. Add symbols (e.g., AAPL, EURUSD, BTC)
4. Click "Refresh Sentiment" to fetch news and analyze
5. Click on a summary card to view article details

## Troubleshooting

**Port already in use:**
- Change `PORT` (backend), `VITE_BACKEND_PORT` (frontend proxy), and `VITE_FRONTEND_PORT` (frontend dev server) in `.env` file
- `PORT` and `VITE_BACKEND_PORT` should match the same backend port (default: 3031)
- `VITE_FRONTEND_PORT` sets the frontend dev server port (default: 3000)
- Kill existing processes on ports 3000 or 3031

**Database errors:**
- Delete `backend/data/sentiment.db` and run migrations again

**API key errors:**
- Verify your `.env` file is in the root directory
- Check that `HF_API_TOKEN` and `NEWS_API_KEY` are set correctly

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

