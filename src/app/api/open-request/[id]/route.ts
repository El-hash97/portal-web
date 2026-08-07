import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { neonSql } from '@/db';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

type Action = 'approve' | 'reject' | 'start' | 'finish';
const ACTIONS: Action[] = ['approve', 'reject', 'start', 'finish'];

const ALLOWED_FROM: Record<Action, string> = {
  approve: 'menunggu',
  reject: 'menunggu',
  start: 'disetujui',
  finish: 'dikerjakan',
};

const NEXT_STATUS: Record<Action, string> = {
  approve: 'disetujui',
  reject: 'ditolak',
  start: 'dikerjakan',
  finish: 'selesai',
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const body = await request.json();
    const action = body.action as Action;
    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
    }

    const password = typeof body.password === 'string' ? body.password : '';
    const isSectionAction = action === 'approve' || action === 'reject';
    if (isSectionAction) {
      const requiredPassword = process.env.SECTION_PASSWORD;
      if (!requiredPassword) return NextResponse.json({ error: 'Fitur approval belum dikonfigurasi' }, { status: 503 });
      if (password !== requiredPassword) return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    } else {
      const cookieStore = await cookies();
      if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
        return NextResponse.json({ error: 'Sesi admin tidak valid, silakan login ulang.' }, { status: 401 });
      }
    }

    // No individual approver identity is collected — the shared Section
    // password is the only accountability signal this workflow asks for.
    const approver = 'Section';
    const rejectReason = typeof body.reject_reason === 'string' ? body.reject_reason.trim() : '';

    if (action === 'reject' && !rejectReason) {
      return NextResponse.json({ error: 'Alasan penolakan wajib diisi' }, { status: 400 });
    }

    const requiredStatus = ALLOWED_FROM[action];
    const nextStatus = NEXT_STATUS[action];

    let rows: Record<string, unknown>[];
    if (action === 'approve') {
      rows = await neonSql`
        UPDATE feature_requests
        SET status = ${nextStatus}, approver = ${approver}, decided_at = NOW()
        WHERE id = ${id} AND status = ${requiredStatus}
        RETURNING *
      `;
    } else if (action === 'reject') {
      rows = await neonSql`
        UPDATE feature_requests
        SET status = ${nextStatus}, approver = ${approver}, reject_reason = ${rejectReason}, decided_at = NOW()
        WHERE id = ${id} AND status = ${requiredStatus}
        RETURNING *
      `;
    } else if (action === 'start') {
      rows = await neonSql`
        UPDATE feature_requests
        SET status = ${nextStatus}
        WHERE id = ${id} AND status = ${requiredStatus}
        RETURNING *
      `;
    } else {
      rows = await neonSql`
        UPDATE feature_requests
        SET status = ${nextStatus}, finished_at = NOW()
        WHERE id = ${id} AND status = ${requiredStatus}
        RETURNING *
      `;
    }

    if (!rows[0]) {
      const exists = await neonSql`SELECT id FROM feature_requests WHERE id = ${id}`;
      const status = exists[0] ? 409 : 404;
      const error = exists[0]
        ? 'Request sudah berubah status, silakan muat ulang'
        : 'Request tidak ditemukan';
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/open-request/:id]', err);
    return NextResponse.json({ error: 'Gagal mengupdate request' }, { status: 500 });
  }
}
