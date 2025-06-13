import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from './db.js';

async function main() {
  console.log('Running migrations...');
  
  try {
    const sql = readFileSync(join(process.cwd(), 'migrations', '0000_initial.sql'), 'utf-8');
    await db.execute(sql);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 