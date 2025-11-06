import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbInstance: SqlJsDatabase | null = null;
let SQL: any = null;

export async function initDatabase(dbPath: string): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  SQL = await initSqlJs();

  // Check if database file exists
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(buffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Save database periodically
  const saveInterval = setInterval(() => {
    if (dbInstance && dbPath) {
      saveDatabase(dbInstance as SqlJsDatabase, dbPath);
    }
  }, 5000);

  if (!dbInstance) {
    throw new Error('Failed to initialize database');
  }

  return dbInstance;
}

export function saveDatabase(db: SqlJsDatabase, dbPath: string) {
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(dbPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, buffer);
}

export function getDatabase(): SqlJsDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance as SqlJsDatabase;
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (dbInstance) {
    const dbPath = path.join(process.cwd(), 'data', 'sentiment.db');
    saveDatabase(dbInstance as SqlJsDatabase, dbPath);
    dbInstance.close();
  }
  process.exit(0);
});

