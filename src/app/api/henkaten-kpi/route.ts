import { NextResponse } from 'next/server';
import { henkatenSql } from '@/db/henkaten';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await henkatenSql`
      SELECT
        COUNT(*) FILTER (WHERE date_finish IS NULL OR date_finish = '')::int                                AS total_active,
        COUNT(*) FILTER (WHERE risk_level = 'High'   AND (date_finish IS NULL OR date_finish = ''))::int    AS high,
        COUNT(*) FILTER (WHERE risk_level = 'Medium' AND (date_finish IS NULL OR date_finish = ''))::int    AS medium,
        COUNT(*) FILTER (WHERE risk_level = 'Low'    AND (date_finish IS NULL OR date_finish = ''))::int    AS low
      FROM henkaten_records
    `;
    const r = rows[0] ?? { total_active: 0, high: 0, medium: 0, low: 0 };
    return NextResponse.json(
      { totalActive: r.total_active, high: r.high, medium: r.medium, low: r.low },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/henkaten-kpi]', err);
    return NextResponse.json({ totalActive: 0, high: 0, medium: 0, low: 0 }, { status: 500 });
  }
}
