import { NextResponse } from 'next/server';
import { kaizenSupabase } from '@/db/kaizen';

export const dynamic = 'force-dynamic';

const EMPTY = { total: 0, onProgress: 0, finish: 0 };

export async function GET() {
  try {
    const { data, error } = await kaizenSupabase
      .from('kaizen_entries')
      .select('status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as { status: string }[];
    const finish = rows.filter((r) => r.status === 'Finish').length;
    const onProgress = rows.length - finish;

    return NextResponse.json(
      { total: rows.length, onProgress, finish },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/kaizen/kpi]', err);
    return NextResponse.json(EMPTY, { status: 500 });
  }
}
