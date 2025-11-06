import { migrate } from 'drizzle-orm/sql-js/migrator';
import { drizzle } from 'drizzle-orm/sql-js';
import { initDatabase, saveDatabase, getDatabase } from './sql-js-adapter.js';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'sentiment.db');

// Initialize database
await initDatabase(dbPath);

const db = drizzle(getDatabase());

// Run migrations
migrate(db, { migrationsFolder: './drizzle' });

// Save the database
saveDatabase(getDatabase(), dbPath);

console.log('Migrations completed!');
process.exit(0);
