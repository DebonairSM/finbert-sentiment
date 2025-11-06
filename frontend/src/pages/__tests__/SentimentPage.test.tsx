import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SentimentPage from '../SentimentPage';

// Mock fetch globally
globalThis.fetch = vi.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve([]),
} as Response));

describe('SentimentPage', () => {
  it('should render the page title', () => {
    render(
      <BrowserRouter>
        <SentimentPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Market Sentiment Analysis')).toBeDefined();
  });

  it('should render watchlist management section', () => {
    render(
      <BrowserRouter>
        <SentimentPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Watchlist Management')).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter symbol/i)).toBeDefined();
  });

  it('should render sentiment summaries section', () => {
    render(
      <BrowserRouter>
        <SentimentPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Sentiment Summaries')).toBeDefined();
  });
});

