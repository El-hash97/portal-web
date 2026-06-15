import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { apps } from './schema';
import { DEFAULT_APPS } from '../lib/constants';

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('Seeding apps table...');
  await db.insert(apps).values(
    DEFAULT_APPS.map(({ id: _id, ...rest }) => rest)
  );
  console.log(`Seeded ${DEFAULT_APPS.length} apps.`);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
