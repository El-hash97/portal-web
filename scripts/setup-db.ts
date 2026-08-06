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

  // Feature request table (Open Request)
  await sql`
    CREATE TABLE IF NOT EXISTS feature_requests (
      id            SERIAL PRIMARY KEY,
      requester     TEXT NOT NULL,
      line_name     TEXT NOT NULL,
      app_id        INTEGER REFERENCES apps(id) ON DELETE SET NULL,
      request_text  TEXT NOT NULL,
      photo_data    TEXT,
      status        TEXT NOT NULL DEFAULT 'menunggu',
      approver      TEXT,
      reject_reason TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      decided_at    TIMESTAMPTZ,
      finished_at   TIMESTAMPTZ
    )
  `;
  // CREATE TABLE IF NOT EXISTS only runs its body when the table is absent —
  // it does NOT add columns to a table that already exists. ADD COLUMN IF
  // NOT EXISTS is what actually reaches an already-created feature_requests.
  await sql`ALTER TABLE feature_requests ADD COLUMN IF NOT EXISTS photo_data TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feature_requests_status     ON feature_requests(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      content      TEXT NOT NULL,
      photo_data   TEXT,
      status       TEXT NOT NULL DEFAULT 'active',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;
  // CREATE TABLE IF NOT EXISTS does not add columns to an existing table —
  // ADD COLUMN IF NOT EXISTS reaches an already-created notifications table.
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS photo_data TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)`;

  // Global key-value settings table
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
  // Seed the real-time dashboard flag so the first read defaults to ON even
  // before any admin toggles it (the GET route also falls back to ON when
  // the row is missing, so this is just for explicit visibility in the DB).
  await sql`
    INSERT INTO settings (key, value)
    VALUES ('dashboard_realtime', 'true')
    ON CONFLICT (key) DO NOTHING
  `;

  console.log('Database tables ready.');
  await sql.end();
}

main().catch(err => { console.error(err); process.exit(1); });
