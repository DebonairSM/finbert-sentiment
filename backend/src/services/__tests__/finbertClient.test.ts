import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the config module
vi.mock('../../config.js', () => ({
  config: {
    hfApiToken: 'test-token',
    hfModel: 'ProsusAI/finbert',
  },
  validateConfig: vi.fn(),
}));

// Import after mocking
const { FinBertClient } = await import('../finbertClient.js');

describe('FinBertClient', () => {
  let client: InstanceType<typeof FinBertClient>;

  beforeEach(() => {
    client = new FinBertClient();
    vi.clearAllMocks();
  });

  it('should analyze sentiment successfully', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [[{ label: 'positive', score: 0.89 }]],
    });

    const result = await client.analyzeSentiment('Great earnings report!');

    expect(result).toEqual({
      label: 'positive',
      score: 0.89,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('ProsusAI/finbert'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should normalize label to lowercase', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [[{ label: 'POSITIVE', score: 0.75 }]],
    });

    const result = await client.analyzeSentiment('Test text');

    expect(result.label).toBe('positive');
  });

  it('should handle API errors', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(client.analyzeSentiment('Test text')).rejects.toThrow(
      'Hugging Face API error (401)'
    );
  });

  it('should retry on model loading', async () => {
    // First call: loading, second call: success
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Model is loading',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ label: 'neutral', score: 0.65 }]],
      });

    const result = await client.analyzeSentiment('Test text');

    expect(result.label).toBe('neutral');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
