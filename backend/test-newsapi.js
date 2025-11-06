// Quick test script to verify NewsAPI integration
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  console.error('❌ NEWS_API_KEY is not set in .env file');
  console.log('\nPlease set your NewsAPI key in the .env file:');
  console.log('1. Go to https://newsapi.org/');
  console.log('2. Sign up for a free account');
  console.log('3. Copy your API key');
  console.log('4. Add it to .env file: NEWS_API_KEY=your_key_here\n');
  process.exit(1);
}

console.log('✓ NEWS_API_KEY found');
console.log('\nTesting NewsAPI connection...');

const testSymbol = 'AAPL';
const url = new URL('https://newsapi.org/v2/everything');
url.searchParams.set('q', testSymbol);
url.searchParams.set('language', 'en');
url.searchParams.set('sortBy', 'publishedAt');
url.searchParams.set('pageSize', '5');
url.searchParams.set('apiKey', NEWS_API_KEY);

try {
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ NewsAPI error (${response.status}):`, error);
    
    if (response.status === 401) {
      console.log('\n⚠️  Your API key appears to be invalid');
      console.log('Please check your NEWS_API_KEY in the .env file\n');
    } else if (response.status === 426) {
      console.log('\n⚠️  Your API key requires upgrade');
      console.log('Free tier users cannot use certain features\n');
    } else if (response.status === 429) {
      console.log('\n⚠️  Rate limit exceeded');
      console.log('Free tier: 100 requests/day\n');
    }
    process.exit(1);
  }

  const data = await response.json();

  if (data.status !== 'ok') {
    console.error('❌ NewsAPI returned status:', data.status);
    if (data.message) {
      console.error('Message:', data.message);
    }
    process.exit(1);
  }

  console.log(`✓ NewsAPI connection successful`);
  console.log(`✓ Found ${data.totalResults} total articles for ${testSymbol}`);
  console.log(`✓ Retrieved ${data.articles.length} articles\n`);

  if (data.articles.length > 0) {
    console.log('Sample article:');
    const article = data.articles[0];
    console.log(`  Title: ${article.title}`);
    console.log(`  Source: ${article.source?.name}`);
    console.log(`  Published: ${article.publishedAt}`);
    console.log(`  URL: ${article.url}\n`);
  }

  console.log('✅ NewsAPI integration is working correctly!\n');
} catch (error) {
  console.error('❌ Failed to connect to NewsAPI:', error.message);
  process.exit(1);
}

