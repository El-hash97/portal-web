import postgres from 'postgres';

// Separate Supabase Postgres instance owned by the Voice Member app —
// read-only access for surfacing its top-senders ranking on the portal.
export const voiceMemberSql = postgres(process.env.VOICE_MEMBER_SUPABASE ?? '', { ssl: 'require' });
