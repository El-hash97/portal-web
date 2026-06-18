import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await neonSql`
      SELECT
        app_id,
        COUNT(*)::int                                                         AS clicks_total,
        COUNT(*) FILTER (WHERE clicked_at >= CURRENT_DATE)::int              AS clicks_today,
        COUNT(*) FILTER (WHERE clicked_at >= NOW() - INTERVAL '7 days')::int AS clicks_week
      FROM app_clicks
      GROUP BY app_id
      ORDER BY clicks_total DESC
    `;
    return NextResponse.json(rows, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[GET /api/analytics]', err);
    return NextResponse.json([], { status: 500 });
  }
}
