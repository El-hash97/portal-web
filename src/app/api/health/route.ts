import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1 AS ok`);
    return NextResponse.json({ status: 'ok', rows: result.rows });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', detail }, { status: 500 });
  }
}
