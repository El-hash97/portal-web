import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// channel_binding is a PostgreSQL wire-protocol feature.
// The neon() HTTP driver doesn't use the wire protocol,
// and some driver versions fail to parse this parameter.
function getDbUrl(): string {
  const raw = process.env.DATABASE_URL ?? '';
  try {
    const u = new URL(raw.replace(/^postgresql:/, 'postgres:'));
    u.searchParams.delete('channel_binding');
    return u.toString().replace(/^postgres:/, 'postgresql:');
  } catch {
    return raw;
  }
}

const sql = neon(getDbUrl());
export const db = drizzle(sql, { schema });
