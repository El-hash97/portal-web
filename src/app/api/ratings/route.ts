import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get('device_id') ?? '';
  try {
    const rows = await neonSql`
      SELECT
        app_id,
        ROUND(AVG(rating)::numeric, 1)::float8            AS avg_rating,
        COUNT(*)::int                                      AS count,
        MAX(rating) FILTER (WHERE device_id = ${deviceId}) AS my_rating
      FROM app_ratings
      GROUP BY app_id
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/ratings]', err);
    return NextResponse.json([], { status: 500 });
  }
}
