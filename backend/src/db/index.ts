import { drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema.js';
import { initDatabase, getDatabase } from './sql-js-adapter.js';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'sentiment.db');

// Initialize the database
await initDatabase(dbPath);

export const db = drizzle(getDatabase(), { schema });
