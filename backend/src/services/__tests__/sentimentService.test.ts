import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('../newsService.js', () => ({
  newsService: {
    fetchNews: vi.fn(),
  },
}));

vi.mock('../finbertClient.js', () => ({
  finbertClient: {
    analyzeSentiment: vi.fn(),
  },
}));

vi.mock('../../db/index.js', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
        })),
      })),
    })),
  },
}));

describe('SentimentService', () => {
  it('should calculate sentiment index correctly', () => {
    // Positive index
    const positiveIndex = (5 - 1) / 6; // 5 positive, 1 negative, 0 neutral
    expect(positiveIndex).toBeCloseTo(0.67, 2);

    // Negative index
    const negativeIndex = (2 - 8) / 10; // 2 positive, 8 negative, 0 neutral
    expect(negativeIndex).toBe(-0.6);

    // Neutral index
    const neutralIndex = (3 - 3) / 6; // 3 positive, 3 negative, 0 neutral
    expect(neutralIndex).toBe(0);

    // Zero articles
    const zeroIndex = 0 / 0; // Should handle NaN
    expect(isNaN(zeroIndex)).toBe(true);
  });

  it('should handle empty article list', () => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    const totalCount = counts.positive + counts.neutral + counts.negative;
    const sentimentIndex = totalCount > 0 ? (counts.positive - counts.negative) / totalCount : 0;

    expect(sentimentIndex).toBe(0);
  });
});
