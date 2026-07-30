import { NextResponse } from 'next/server';
import { voiceMemberSql } from '@/db/voiceMember';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await voiceMemberSql`
      SELECT
        vm.member_name,
        COUNT(*)::int AS total,
        ma.profile_photo
      FROM voice_members vm
      LEFT JOIN member_accounts ma ON ma.nama = vm.member_name
      GROUP BY vm.member_name, ma.profile_photo
      ORDER BY total DESC
      LIMIT 10
    `;

    const ranked = rows.map((row, i) => ({
      rank: i + 1,
      member_name: row.member_name as string,
      total: row.total as number,
      profile_photo: (row.profile_photo as string | null) ?? null,
    }));

    return NextResponse.json(ranked, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/voice-member/top-senders]', err);
    return NextResponse.json([], { status: 500 });
  }
}
