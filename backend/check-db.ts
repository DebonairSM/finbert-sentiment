import { db } from './src/db/index.js';
import { watchlistSymbols, newsArticles, sentimentScores } from './src/db/schema.js';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  console.log('\n=== Database Status ===\n');
  
  // Check watchlist
  const symbols = await db.select().from(watchlistSymbols);
  console.log('Watchlist symbols:', symbols.map(s => s.symbol).join(', ') || 'None');
  
  // Check articles per symbol
  const articleCounts = await db.select({
    symbol: newsArticles.symbol,
    count: sql<number>`count(*)`.as('count')
  })
  .from(newsArticles)
  .groupBy(newsArticles.symbol);
  
  console.log('\nArticles in database:');
  if (articleCounts.length === 0) {
    console.log('  No articles found');
  } else {
    articleCounts.forEach(row => {
      console.log(`  ${row.symbol}: ${row.count} articles`);
    });
  }
  
  // Check sentiment scores
  const sentimentCount = await db.select({
    count: sql<number>`count(*)`.as('count')
  }).from(sentimentScores);
  
  console.log(`\nTotal sentiment scores: ${sentimentCount[0]?.count || 0}`);
  console.log('\n');
}

checkDatabase().catch(console.error);

