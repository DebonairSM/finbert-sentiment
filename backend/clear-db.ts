import { db } from './src/db/index.js';
import { newsArticles, sentimentScores, watchlistSymbols } from './src/db/schema.js';
import { sql } from 'drizzle-orm';

async function clearDatabase() {
  try {
    console.log('Clearing all test records from the database...');
    
    // Delete in order to respect foreign key constraints
    console.log('Deleting sentiment scores...');
    await db.delete(sentimentScores);
    
    console.log('Deleting news articles...');
    await db.delete(newsArticles);
    
    console.log('Deleting watchlist symbols...');
    await db.delete(watchlistSymbols);
    
    console.log('✓ All test records have been cleared successfully!');
    
    // Verify deletion
    const articleCount = await db.select({ count: sql<number>`count(*)` }).from(newsArticles);
    const sentimentCount = await db.select({ count: sql<number>`count(*)` }).from(sentimentScores);
    const symbolCount = await db.select({ count: sql<number>`count(*)` }).from(watchlistSymbols);
    
    console.log('\nCurrent record counts:');
    console.log(`  News Articles: ${articleCount[0].count}`);
    console.log(`  Sentiment Scores: ${sentimentCount[0].count}`);
    console.log(`  Watchlist Symbols: ${symbolCount[0].count}`);
    
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();

