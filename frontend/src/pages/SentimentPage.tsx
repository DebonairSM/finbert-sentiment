import { useState, useEffect } from 'react';
import './SentimentPage.css';

interface WatchlistSymbol {
  id: number;
  symbol: string;
  assetType?: string;
  createdAt: string;
}

interface SentimentArticle {
  id: number;
  symbol: string;
  headline: string;
  source?: string;
  url?: string;
  publishedAt?: string;
  label: 'positive' | 'neutral' | 'negative';
  score: number;
}

interface SymbolSummary {
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

function SentimentPage() {
  const [watchlist, setWatchlist] = useState<WatchlistSymbol[]>([]);
  const [summaries, setSummaries] = useState<SymbolSummary[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState('');
  const [assetType, setAssetType] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWatchlist();
    loadSummaries();
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await fetch('/api/sentiment/watchlist');
      if (!response.ok) throw new Error('Failed to load watchlist');
      const data = await response.json();
      setWatchlist(data);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Failed to load watchlist');
    }
  };

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sentiment/summary');
      if (!response.ok) throw new Error('Failed to load summaries');
      const data = await response.json();
      setSummaries(data);
    } catch (err) {
      console.error('Error loading summaries:', err);
      setError('Failed to load summaries');
    } finally {
      setLoading(false);
    }
  };

  const addSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    try {
      const response = await fetch('/api/sentiment/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newSymbol.toUpperCase(),
          assetType: assetType || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add symbol');
      }

      setNewSymbol('');
      setAssetType('');
      await loadWatchlist();
    } catch (err) {
      console.error('Error adding symbol:', err);
      setError(err instanceof Error ? err.message : 'Failed to add symbol');
    }
  };

  const quickAddMajors = async () => {
    const majorSymbols = [
      // Major Forex Pairs
      { symbol: 'EURUSD', assetType: 'forex' },
      { symbol: 'GBPUSD', assetType: 'forex' },
      { symbol: 'USDJPY', assetType: 'forex' },
      { symbol: 'USDCHF', assetType: 'forex' },
      { symbol: 'AUDUSD', assetType: 'forex' },
      { symbol: 'USDCAD', assetType: 'forex' },
      { symbol: 'NZDUSD', assetType: 'forex' },
      // Major Cryptocurrencies
      { symbol: 'BTC', assetType: 'crypto' },
      { symbol: 'ETH', assetType: 'crypto' },
      { symbol: 'BNB', assetType: 'crypto' },
      { symbol: 'XRP', assetType: 'crypto' },
      { symbol: 'ADA', assetType: 'crypto' },
      { symbol: 'SOL', assetType: 'crypto' },
      { symbol: 'DOGE', assetType: 'crypto' },
    ];

    try {
      setLoading(true);
      const response = await fetch('/api/sentiment/watchlist/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: majorSymbols }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add symbols');
      }

      const result = await response.json();
      await loadWatchlist();
      
      if (result.added.length > 0) {
        setError(`Added ${result.added.length} symbols. ${result.skipped.length > 0 ? `Skipped ${result.skipped.length} (already exists).` : ''}`);
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error adding major symbols:', err);
      setError(err instanceof Error ? err.message : 'Failed to add major symbols');
    } finally {
      setLoading(false);
    }
  };

  const removeSymbol = async (symbol: string) => {
    try {
      const response = await fetch(`/api/sentiment/watchlist/${symbol}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove symbol');
      await loadWatchlist();
      
      // Clear selection if removed symbol was selected
      if (selectedSymbol === symbol) {
        setSelectedSymbol(null);
      }
    } catch (err) {
      console.error('Error removing symbol:', err);
      setError('Failed to remove symbol');
    }
  };

  const refreshSentiment = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch('/api/sentiment/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refresh sentiment');
      }

      const data = await response.json();
      setSummaries(data);
    } catch (err) {
      console.error('Error refreshing sentiment:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh sentiment');
    } finally {
      setRefreshing(false);
    }
  };

  const getSentimentColor = (index: number) => {
    if (index > 0.25) return '#22c55e';
    if (index < -0.25) return '#ef4444';
    return '#eab308';
  };

  const getLabelColor = (label: string) => {
    if (label === 'positive') return '#22c55e';
    if (label === 'negative') return '#ef4444';
    return '#94a3b8';
  };

  const selectedSummary = summaries.find((s) => s.symbol === selectedSymbol);

  return (
    <div className="sentiment-page">
      <div className="page-header">
        <h1>Market Sentiment Analysis</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="close-error">
            ×
          </button>
        </div>
      )}

      <section className="watchlist-section">
        <h2>Watchlist Management</h2>
        <form onSubmit={addSymbol} className="add-symbol-form">
          <input
            type="text"
            placeholder="Enter symbol (e.g., AAPL, EURUSD)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            className="symbol-input"
          />
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="asset-type-select"
          >
            <option value="">Select type (optional)</option>
            <option value="forex">Forex</option>
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Add Symbol
          </button>
          <button
            type="button"
            onClick={quickAddMajors}
            disabled={loading}
            className="btn btn-success"
            title="Add major forex pairs and cryptocurrencies"
          >
            {loading ? 'Adding...' : 'Quick Add Majors'}
          </button>
          <button
            type="button"
            onClick={refreshSentiment}
            disabled={refreshing || watchlist.length === 0}
            className="btn btn-secondary"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Sentiment'}
          </button>
        </form>

        <div className="watchlist-items">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-item">
              <div className="watchlist-item-info">
                <span className="watchlist-symbol">{item.symbol}</span>
                {item.assetType && (
                  <span className="watchlist-type">{item.assetType}</span>
                )}
              </div>
              <button
                onClick={() => removeSymbol(item.symbol)}
                className="btn-remove"
                title="Remove symbol"
              >
                ×
              </button>
            </div>
          ))}
          {watchlist.length === 0 && (
            <p className="empty-message">No symbols in watchlist. Add one above.</p>
          )}
        </div>
      </section>

      <section className="summaries-section">
        <h2>Sentiment Summaries</h2>
        {loading ? (
          <div className="loading">Loading summaries...</div>
        ) : summaries.length === 0 ? (
          <p className="empty-message">
            No sentiment data available. Add symbols and click "Refresh Sentiment".
          </p>
        ) : (
          <div className="summary-cards">
            {summaries.map((summary) => (
              <div
                key={summary.symbol}
                className={`summary-card ${
                  selectedSymbol === summary.symbol ? 'selected' : ''
                }`}
                onClick={() => setSelectedSymbol(summary.symbol)}
              >
                <div className="summary-header">
                  <h3>{summary.symbol}</h3>
                  <div
                    className="sentiment-index"
                    style={{ color: getSentimentColor(summary.sentimentIndex) }}
                  >
                    {summary.sentimentIndex.toFixed(2)}
                  </div>
                </div>
                <div className="sentiment-counts">
                  <div className="count-item">
                    <span className="count-label" style={{ color: '#22c55e' }}>
                      Positive
                    </span>
                    <span className="count-value">{summary.counts.positive}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label" style={{ color: '#94a3b8' }}>
                      Neutral
                    </span>
                    <span className="count-value">{summary.counts.neutral}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label" style={{ color: '#ef4444' }}>
                      Negative
                    </span>
                    <span className="count-value">{summary.counts.negative}</span>
                  </div>
                </div>
                <div className="summary-footer">
                  <span className="last-updated">
                    Updated: {new Date(summary.lastUpdated).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedSummary && (
        <section className="articles-section">
          <h2>Articles for {selectedSummary.symbol}</h2>
          {selectedSummary.articles.length === 0 ? (
            <p className="empty-message">No articles found.</p>
          ) : (
            <div className="articles-table">
              <table>
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
                            className="article-link"
                          >
                            {article.headline}
                          </a>
                        ) : (
                          article.headline
                        )}
                      </td>
                      <td>{article.source || '—'}</td>
                      <td>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        <span
                          className="sentiment-badge"
                          style={{
                            backgroundColor: getLabelColor(article.label),
                          }}
                        >
                          {article.label}
                        </span>
                      </td>
                      <td>{article.score.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default SentimentPage;

