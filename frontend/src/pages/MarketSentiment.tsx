import { useState, useEffect } from 'react';
import './MarketSentiment.css';

interface WatchlistSymbol {
  id: number;
  symbol: string;
  assetType: string | null;
  createdAt: Date;
}

interface SentimentArticle {
  id: number;
  symbol: string;
  headline: string;
  source?: string;
  url?: string;
  publishedAt?: Date;
  label: 'positive' | 'neutral' | 'negative';
  score: number;
}

interface SymbolSentimentSummary {
  symbol: string;
  sentimentIndex: number;
  counts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  lastUpdated: string;
  articles: SentimentArticle[];
}

function MarketSentiment() {
  const [watchlist, setWatchlist] = useState<WatchlistSymbol[]>([]);
  const [summaries, setSummaries] = useState<SymbolSentimentSummary[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newSymbol, setNewSymbol] = useState('');
  const [newAssetType, setNewAssetType] = useState<string>('');

  useEffect(() => {
    loadWatchlist();
    loadSummaries();
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await fetch('/api/sentiment/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const data = await response.json();
      setWatchlist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist');
    }
  };

  const loadSummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sentiment/summary');
      if (!response.ok) throw new Error('Failed to fetch summaries');
      const data = await response.json();
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summaries');
    } finally {
      setLoading(false);
    }
  };

  const addSymbol = async () => {
    if (!newSymbol.trim()) return;

    try {
      const response = await fetch('/api/sentiment/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newSymbol.toUpperCase(),
          assetType: newAssetType || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add symbol');
      }

      setNewSymbol('');
      setNewAssetType('');
      await loadWatchlist();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add symbol');
    }
  };

  const removeSymbol = async (symbol: string) => {
    try {
      const response = await fetch(`/api/sentiment/watchlist/${symbol}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove symbol');
      await loadWatchlist();
      await loadSummaries();
      if (selectedSymbol === symbol) {
        setSelectedSymbol(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove symbol');
    }
  };

  const refreshSentiment = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch('/api/sentiment/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to refresh sentiment');
      const data = await response.json();
      setSummaries(data.summaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh sentiment');
    } finally {
      setRefreshing(false);
    }
  };

  const getSentimentColor = (index: number) => {
    if (index > 0.25) return '#10b981';
    if (index < -0.25) return '#ef4444';
    return '#f59e0b';
  };

  const selectedSummary = selectedSymbol
    ? summaries.find(s => s.symbol === selectedSymbol)
    : null;

  return (
    <div className="market-sentiment">
      <h1>Market Sentiment</h1>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <section className="watchlist-section">
        <h2>Watchlist Management</h2>
        <div className="watchlist-controls">
          <input
            type="text"
            placeholder="Symbol (e.g., AAPL, EURUSD)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
          />
          <select
            value={newAssetType}
            onChange={(e) => setNewAssetType(e.target.value)}
          >
            <option value="">Asset Type (optional)</option>
            <option value="stock">Stock</option>
            <option value="forex">Forex</option>
            <option value="crypto">Crypto</option>
          </select>
          <button onClick={addSymbol} className="btn-primary">
            Add Symbol
          </button>
          <button
            onClick={refreshSentiment}
            disabled={refreshing || watchlist.length === 0}
            className="btn-refresh"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Sentiment'}
          </button>
        </div>

        <div className="watchlist-list">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-item">
              <span className="symbol-name">{item.symbol}</span>
              {item.assetType && (
                <span className="asset-type">{item.assetType}</span>
              )}
              <button
                onClick={() => removeSymbol(item.symbol)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          ))}
          {watchlist.length === 0 && (
            <p className="empty-message">No symbols in watchlist</p>
          )}
        </div>
      </section>

      {loading ? (
        <div className="loading">Loading summaries...</div>
      ) : (
        <>
          <section className="summaries-section">
            <h2>Sentiment Summaries</h2>
            <div className="summary-grid">
              {summaries.map((summary) => (
                <div
                  key={summary.symbol}
                  className={`summary-card ${
                    selectedSymbol === summary.symbol ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedSymbol(summary.symbol)}
                >
                  <h3>{summary.symbol}</h3>
                  <div
                    className="sentiment-index"
                    style={{ color: getSentimentColor(summary.sentimentIndex) }}
                  >
                    {summary.sentimentIndex.toFixed(2)}
                  </div>
                  <div className="sentiment-counts">
                    <span className="count-positive">
                      ↑ {summary.counts.positive}
                    </span>
                    <span className="count-neutral">
                      → {summary.counts.neutral}
                    </span>
                    <span className="count-negative">
                      ↓ {summary.counts.negative}
                    </span>
                  </div>
                  <div className="last-updated">
                    Updated: {new Date(summary.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ))}
              {summaries.length === 0 && (
                <p className="empty-message">
                  No sentiment data available. Add symbols and refresh.
                </p>
              )}
            </div>
          </section>

          {selectedSummary && (
            <section className="articles-section">
              <h2>Articles for {selectedSummary.symbol}</h2>
              <table className="articles-table">
                <thead>
                  <tr>
                    <th>Headline</th>
                    <th>Source</th>
                    <th>Published</th>
                    <th>Sentiment</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSummary.articles.map((article) => (
                    <tr key={article.id}>
                      <td>
                        {article.url ? (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {article.headline}
                          </a>
                        ) : (
                          article.headline
                        )}
                      </td>
                      <td>{article.source || '-'}</td>
                      <td>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge badge-${article.label}`}>
                          {article.label}
                        </span>
                      </td>
                      <td>{article.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default MarketSentiment;

