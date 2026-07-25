import { NextResponse } from 'next/server';
import { henkatenSql } from '@/db/henkaten';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await henkatenSql`
      SELECT
        COUNT(*)::int                                          AS total,
        COUNT(*) FILTER (WHERE risk_level = 'High')::int        AS high,
        COUNT(*) FILTER (WHERE risk_level = 'Medium')::int      AS medium,
        COUNT(*) FILTER (WHERE risk_level = 'Low')::int         AS low
      FROM henkaten_records
    `;
    const r = rows[0] ?? { total: 0, high: 0, medium: 0, low: 0 };
    return NextResponse.json(
      { total: r.total, high: r.high, medium: r.medium, low: r.low },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/henkaten-kpi]', err);
    return NextResponse.json({ total: 0, high: 0, medium: 0, low: 0 }, { status: 500 });
  }
}
