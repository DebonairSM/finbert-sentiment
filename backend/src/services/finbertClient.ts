import { config, validateConfig } from '../config.js';
import type { FinBertResult, SentimentLabel } from '../types.js';

export class FinBertClient {
  private readonly apiToken: string;
  private readonly model: string;
  private readonly baseUrl = 'https://router.huggingface.co/hf-inference/models';

  constructor() {
    validateConfig(['hfApiToken', 'hfModel']);
    this.apiToken = config.hfApiToken!;
    this.model = config.hfModel!;
  }

  async analyzeSentiment(text: string, retries: number = 3): Promise<FinBertResult> {
    const url = `${this.baseUrl}/${this.model}`;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Model loading - retry after delay
          if (response.status === 503 && errorText.includes('loading')) {
            const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
            console.log(`Model loading, waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }

          throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        // Handle array response format
        if (Array.isArray(data) && data.length > 0) {
          // Get the label with highest score
          const topResult = Array.isArray(data[0]) ? data[0][0] : data[0];
          
          return {
            label: this.normalizeLabel(topResult.label),
            score: topResult.score,
          };
        }

        throw new Error('Unexpected response format from Hugging Face API');
      } catch (error) {
        if (attempt === retries - 1) throw error;
        
        // Wait before retry on network errors
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Failed to analyze sentiment after retries');
  }

  private normalizeLabel(label: string): SentimentLabel {
    const normalized = label.toLowerCase();
    if (normalized.includes('positive')) return 'positive';
    if (normalized.includes('negative')) return 'negative';
    return 'neutral';
  }
}

export const finbertClient = new FinBertClient();
