import { NextResponse } from 'next/server';
import { henkatenSql } from '@/db/henkaten';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await henkatenSql`
      SELECT line_name, COUNT(*)::int AS total
      FROM henkaten_records
      GROUP BY line_name
      ORDER BY total DESC
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/henkaten-kpi/by-line]', err);
    return NextResponse.json([], { status: 500 });
  }
}
