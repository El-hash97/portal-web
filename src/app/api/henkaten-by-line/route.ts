import { NextResponse } from 'next/server';
import { henkatenSql } from '@/db/henkaten';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await henkatenSql`
      SELECT line_name, COUNT(*)::int AS total
      FROM henkaten_records
      WHERE line_name IS NOT NULL AND line_name <> ''
      GROUP BY line_name
      ORDER BY total DESC
    `;
    return NextResponse.json(
      rows.map(r => ({ line: r.line_name as string, total: r.total as number })),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/henkaten-by-line]', err);
    return NextResponse.json([], { status: 500 });
  }
}
