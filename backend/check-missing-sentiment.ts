import { db } from './src/db/index.js';
import { newsArticles, sentimentScores } from './src/db/schema.js';
import { sql } from 'drizzle-orm';

async function checkMissingSentiment() {
  const missingBySymbol = await db.select({
    symbol: newsArticles.symbol,
    count: sql<number>`count(*)`.as('count')
  })
  .from(newsArticles)
  .leftJoin(sentimentScores, sql`${sentimentScores.articleId} = ${newsArticles.id}`)
  .where(sql`${sentimentScores.id} IS NULL`)
  .groupBy(newsArticles.symbol);
  
  console.log('\nArticles WITHOUT sentiment analysis:');
  missingBySymbol.forEach(row => {
    console.log(`  ${row.symbol}: ${row.count} articles`);
  });
  
  const totalMissing = missingBySymbol.reduce((sum, row) => sum + Number(row.count), 0);
  console.log(`\nTotal: ${totalMissing} articles missing sentiment scores\n`);
}

checkMissingSentiment().catch(console.error);

