import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

let db: Database | null = null;

export async function initializeDatabase(dbPath: string = ':memory:'): Promise<void> {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('SQLite database initialized');
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('SQLite database connection closed');
  }
}

export async function handleQueryAction(client: Client, query: string): Promise<any> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    if (query.trim().toLowerCase().startsWith('select')) {
      const results = await db.all(query);
      console.log('Query results:', results);
      return results;
    } else {
      const result = await db.run(query);
      console.log('Query executed:', result);
      return result;
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function handleCreateTableAction(client: Client, tableName: string, columns: string): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
  try {
    await db.exec(createTableQuery);
    console.log(`Table ${tableName} created successfully`);
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

export async function handleInsertAction(client: Client, tableName: string, data: Record<string, any>): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map(() => '?').join(', ');
  
  const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
  
  try {
    await db.run(insertQuery, values);
    console.log(`Data inserted into ${tableName} successfully`);
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}

export async function handleListTablesAction(client: Client): Promise<string[]> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    return tables.map(t => t.name);
  } catch (error) {
    console.error('Error listing tables:', error);
    throw error;
  }
} 