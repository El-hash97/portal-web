import { NextResponse } from 'next/server';
import { db } from '@/db';
import { apps } from '@/db/schema';
import { asc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Apps without an explicit `urutan` sort to the end (by id) so newly
    // added apps keep appearing last, matching prior id-order behavior.
    const result = await db.select().from(apps)
      .orderBy(sql`${apps.urutan} IS NULL`, asc(apps.urutan), asc(apps.id));
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[GET /api/apps]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newApp] = await db
      .insert(apps)
      .values({
        nama:      body.nama,
        kategori:  body.kategori,
        deskripsi: body.deskripsi,
        link:      body.link,
        icon:      body.icon,
        logo:        body.logo ?? null,
        aktif:       body.aktif       ?? true,
        maintenance: body.maintenance ?? false,
      })
      .returning();
    return NextResponse.json(newApp, { status: 201 });
  } catch (err) {
    console.error('[POST /api/apps]', err);
    return NextResponse.json({ error: 'Gagal menyimpan aplikasi' }, { status: 500 });
  }
}
