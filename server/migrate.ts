import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from './db.js';

async function main() {
  console.log('Running migrations...');
  
  try {
    // Get all migration files and sort them
    const migrationsDir = join(process.cwd(), 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Run each migration in order
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await db.execute(sql);
      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 