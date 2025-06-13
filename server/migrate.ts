import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';

async function main() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 