import { useState, useEffect } from 'react';
import './Settings.css';

interface ProviderInfo {
  enabled: boolean;
  name: string;
  description: string;
  rateLimit: string;
  delay: string;
}

interface ConfigData {
  newsProvider: string;
  providers: {
    alphavantage: ProviderInfo;
    newsapi: ProviderInfo;
  };
  huggingFace: {
    enabled: boolean;
    model: string;
  };
}

function Settings() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/config');
      if (!response.ok) throw new Error('Failed to fetch configuration');
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="settings-page"><div className="loading">Loading settings...</div></div>;
  }

  if (error || !config) {
    return (
      <div className="settings-page">
        <div className="error-banner">
          {error || 'Failed to load configuration'}
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>News Provider</h2>
        <p className="section-description">
          Configure which news provider to use for fetching market news articles.
        </p>

        <div className="provider-cards">
          {Object.entries(config.providers).map(([key, provider]) => {
            const isActive = config.newsProvider === key;
            const isNewsAPI = key === 'newsapi';
            
            return (
              <div 
                key={key}
                className={`provider-card ${isActive ? 'active' : ''} ${!provider.enabled ? 'disabled' : ''}`}
              >
                <div className="provider-header">
                  <h3>{provider.name}</h3>
                  {isActive && <span className="badge badge-active">ACTIVE</span>}
                  {!provider.enabled && <span className="badge badge-disabled">NO API KEY</span>}
                </div>

                <p className="provider-description">{provider.description}</p>

                <div className="provider-details">
                  <div className="detail-item">
                    <span className="detail-label">Rate Limit:</span>
                    <span className="detail-value">{provider.rateLimit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delay:</span>
                    <span className="detail-value">{provider.delay}</span>
                  </div>
                </div>

                {!isNewsAPI && provider.enabled && (
                  <div className="warning-box">
                    <strong>⚠️ Alpha Vantage Rate Limits:</strong> Only 25 API calls per day on free tier. 
                    With multiple symbols, you'll hit this limit quickly. Consider using NewsAPI (100 calls/day) or upgrading.
                  </div>
                )}
                
                {isNewsAPI && provider.enabled && (
                  <div className="info-box">
                    <strong>📰 NewsAPI:</strong> Free tier has 100 calls/day but includes 24-hour delay. 
                    Better for testing with multiple symbols.
                  </div>
                )}

                {!provider.enabled && (
                  <div className="info-box">
                    <strong>Setup required:</strong> Add {key === 'alphavantage' ? 'ALPHA_VANTAGE_API_KEY' : 'NEWS_API_KEY'} to your .env file.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="settings-instructions">
          <h3>How to Change Provider</h3>
          <ol>
            <li>Open the <code>.env</code> file in the root directory</li>
            <li>Update <code>NEWS_PROVIDER</code> to either:
              <ul>
                <li><code>alphavantage</code> - Real-time financial news (recommended)</li>
                <li><code>newsapi</code> - 24h delayed general news</li>
              </ul>
            </li>
            <li>Restart the backend server</li>
          </ol>
        </div>
      </section>

      <section className="settings-section">
        <h2>Sentiment Analysis</h2>
        <p className="section-description">
          AI-powered sentiment analysis using Hugging Face FinBERT model.
        </p>

        <div className="info-card">
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className={`info-value ${config.huggingFace.enabled ? 'status-enabled' : 'status-disabled'}`}>
              {config.huggingFace.enabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Model:</span>
            <span className="info-value">{config.huggingFace.model}</span>
          </div>
          {!config.huggingFace.enabled && (
            <div className="warning-box">
              <strong>⚠️ Required:</strong> Add HF_API_TOKEN to your .env file to enable sentiment analysis.
            </div>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h2>Rate Limits & Troubleshooting</h2>
        <div className="warning-box" style={{ marginBottom: '1rem' }}>
          <strong>🚨 Rate Limit Exceeded?</strong>
          <p>If you see "Rate limit exceeded" errors:</p>
          <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
            <li><strong>Alpha Vantage:</strong> Wait until tomorrow (resets at midnight UTC) or switch to NewsAPI</li>
            <li><strong>NewsAPI:</strong> Wait 1 minute between refreshes</li>
            <li>Reduce the number of symbols in your watchlist</li>
            <li>Upgrade to paid tier for higher limits</li>
          </ul>
        </div>
        
        <div className="info-box">
          <p><strong>Alpha Vantage:</strong> 25 API calls/day (1 per symbol refresh)</p>
          <p><strong>NewsAPI:</strong> 100 API calls/day (1 per symbol refresh)</p>
          <p><strong>Hugging Face:</strong> ~1,000 calls/day (~20 per symbol with news)</p>
          <p className="note">Each "Refresh Sentiment" uses 1 API call per symbol in your watchlist.</p>
        </div>
      </section>
    </div>
  );
}

export default Settings;

