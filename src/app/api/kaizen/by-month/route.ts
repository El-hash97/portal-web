import { NextResponse } from 'next/server';
import { kaizenSupabase } from '@/db/kaizen';

export const dynamic = 'force-dynamic';

const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const STATUSES = ['On Progress', 'Tunggu Material', 'Fabrikasi', 'Others', 'Finish'] as const;

interface KaizenRow {
  date: string;
  status: string;
}

export async function GET() {
  try {
    const { data, error } = await kaizenSupabase
      .from('kaizen_entries')
      .select('date, status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as KaizenRow[];
    const currentYear = String(new Date().getFullYear());

    // monthIndex (0-11) -> { status -> count }. Only months that appear in
    // the data get an entry here — this route does not zero-pad months.
    const buckets = new Map<number, Record<string, number>>();

    for (const row of rows) {
      // Slice the plain YYYY-MM-DD string rather than parsing a Date: the
      // column has no time component, and slicing avoids any timezone
      // reinterpretation entirely.
      if (typeof row.date !== 'string' || row.date.slice(0, 4) !== currentYear) continue;

      const monthIndex = Number(row.date.slice(5, 7)) - 1;
      if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;

      const bucket = buckets.get(monthIndex) ?? {};
      bucket[row.status] = (bucket[row.status] ?? 0) + 1;
      buckets.set(monthIndex, bucket);
    }

    const monthly = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([monthIndex, bucket]) => {
        const entry: Record<string, string | number> = { month: MONTHS_ID[monthIndex] };
        let total = 0;
        for (const status of STATUSES) {
          const count = bucket[status] ?? 0;
          entry[status] = count;
          total += count;
        }
        entry.total = total;
        return entry;
      });

    return NextResponse.json(
      { statuses: STATUSES, data: monthly },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/kaizen/by-month]', err);
    return NextResponse.json({ statuses: STATUSES, data: [] }, { status: 500 });
  }
}
