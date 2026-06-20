import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw  = parseInt(searchParams.get('days') ?? '14', 10);
  const days = Math.min(Math.max(isNaN(raw) ? 14 : raw, 1), 30);
  const interval = `${days - 1} days`;

  try {
    const rows = await neonSql`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - ${interval}::interval,
          CURRENT_DATE,
          '1 day'
        )::date AS date
      )
      SELECT
        d.date::text AS date,
        COALESCE(COUNT(ac.id), 0)::int AS clicks
      FROM dates d
      LEFT JOIN app_clicks ac ON DATE(ac.clicked_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    return NextResponse.json(rows, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[GET /api/analytics/timeseries]', err);
    return NextResponse.json([], { status: 500 });
  }
}
