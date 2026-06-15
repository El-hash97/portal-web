import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS apps (
      id        SERIAL PRIMARY KEY,
      nama      TEXT    NOT NULL,
      kategori  TEXT    NOT NULL,
      deskripsi TEXT    NOT NULL,
      link      TEXT    NOT NULL,
      icon      TEXT    NOT NULL,
      logo      TEXT,
      aktif     BOOLEAN NOT NULL DEFAULT true
    )
  `;

  console.log('Table "apps" ready.');
  await sql.end();
}

main().catch(err => { console.error(err); process.exit(1); });
