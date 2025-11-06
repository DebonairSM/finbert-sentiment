import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Market Sentiment Admin</h1>
      <p>
        Track sentiment analysis for your favorite market symbols using AI-powered
        FinBERT analysis.
      </p>
      <div className="home-features">
        <div className="feature-card">
          <h3>Watchlist Management</h3>
          <p>Add and track your favorite forex, stock, and crypto symbols</p>
        </div>
        <div className="feature-card">
          <h3>News Aggregation</h3>
          <p>Automatically fetch latest news articles for your symbols</p>
        </div>
        <div className="feature-card">
          <h3>Sentiment Analysis</h3>
          <p>AI-powered sentiment analysis using FinBERT model</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

