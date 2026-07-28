import { NextResponse } from 'next/server';
import { problemProduksi } from '@/db/problemProduksi';

export const dynamic = 'force-dynamic';

const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const UNKNOWN_LINE = 'Tidak diketahui';

interface ProblemRow {
  date: string;
  line: string;
  status: string;
}

export async function GET() {
  try {
    const { data, error } = await problemProduksi.database
      .from('problems')
      .select('date, line, status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as ProblemRow[];
    const currentYear = String(new Date().getFullYear());

    // Line totals drive the legend order; buckets hold the month x line counts.
    const lineTotals = new Map<string, number>();
    const buckets = new Map<string, { op: number; fin: number }>();

    for (const row of rows) {
      // Slice the ISO string rather than parsing a Date: parsing would apply
      // the server's local offset and could move a record into another month.
      if (typeof row.date !== 'string' || row.date.slice(0, 4) !== currentYear) continue;

      const monthIndex = Number(row.date.slice(5, 7)) - 1;
      if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;

      const line = row.line || UNKNOWN_LINE;
      lineTotals.set(line, (lineTotals.get(line) ?? 0) + 1);

      const key = `${monthIndex}|${line}`;
      const bucket = buckets.get(key) ?? { op: 0, fin: 0 };
      if (row.status === 'On progress') bucket.op++;
      else bucket.fin++;
      buckets.set(key, bucket);
    }

    const lines = [...lineTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([line]) => line);

    const monthly = MONTHS_ID.map((month, monthIndex) => {
      const entry: Record<string, string | number> = { month };
      let opTotal = 0;
      let finTotal = 0;

      for (const line of lines) {
        const bucket = buckets.get(`${monthIndex}|${line}`) ?? { op: 0, fin: 0 };
        entry[`op:${line}`] = bucket.op;
        entry[`fin:${line}`] = bucket.fin;
        opTotal += bucket.op;
        finTotal += bucket.fin;
      }

      entry.opTotal = opTotal;
      entry.finTotal = finTotal;
      return entry;
    });

    return NextResponse.json(
      { lines, data: monthly },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/problem-produksi/by-month]', err);
    return NextResponse.json({ lines: [], data: [] }, { status: 500 });
  }
}
