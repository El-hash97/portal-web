import { NextResponse } from 'next/server';
import { problemProduksi } from '@/db/problemProduksi';

export const dynamic = 'force-dynamic';

const EMPTY = { total: 0, onProgress: 0, finish: 0 };

export async function GET() {
  try {
    const { data, error } = await problemProduksi.database
      .from('problems')
      .select('status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as { status: string }[];
    const onProgress = rows.filter((r) => r.status === 'On progress').length;
    const finish = rows.filter((r) => r.status === 'Finish').length;

    return NextResponse.json(
      { total: rows.length, onProgress, finish },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/problem-produksi/kpi]', err);
    return NextResponse.json(EMPTY, { status: 500 });
  }
}
