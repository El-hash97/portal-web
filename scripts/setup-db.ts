import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

function getDbUrl(): string {
  const raw = process.env.DATABASE_URL ?? '';
  // channel_binding=require breaks TCP connections through PgBouncer (Neon pooler)
  return raw.replace(/[?&]channel_binding=[^&]*/g, '')
            .replace(/\?&/, '?')
            .replace(/[?&]$/, '');
}

async function main() {
  const sql = postgres(getDbUrl());

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

  await sql`
    CREATE TABLE IF NOT EXISTS app_clicks (
      id         SERIAL PRIMARY KEY,
      app_id     INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
      clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_app_clicks_app_id     ON app_clicks(app_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_app_clicks_clicked_at ON app_clicks(clicked_at DESC)`;

  // Rating table
  await sql`
    CREATE TABLE IF NOT EXISTS app_ratings (
      id         SERIAL PRIMARY KEY,
      app_id     INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
      device_id  TEXT    NOT NULL,
      rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      rated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_app_ratings_app_device ON app_ratings(app_id, device_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_app_ratings_app_id ON app_ratings(app_id)`;

  // Feedback table
  await sql`
    CREATE TABLE IF NOT EXISTS feedback (
      id         SERIAL PRIMARY KEY,
      app_id     INTEGER REFERENCES apps(id) ON DELETE SET NULL,
      pesan      TEXT    NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'baru',
      device_id  TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_status     ON feedback(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC)`;

  console.log('Tables "apps" and "app_clicks" ready.');
  await sql.end();
}

main().catch(err => { console.error(err); process.exit(1); });
