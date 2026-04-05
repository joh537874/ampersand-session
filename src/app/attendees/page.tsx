import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sessions } from '@/data/sessions';
import AttendeesTable from '@/components/AttendeesTable';
import { Registration } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AttendeesPage() {
  let registrationsBySession: Record<string, Registration[]> = {};
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('registrations')
      .select('id, session_id, name, created_at')
      .order('created_at', { ascending: true });

    for (const row of data ?? []) {
      if (!registrationsBySession[row.session_id]) registrationsBySession[row.session_id] = [];
      registrationsBySession[row.session_id].push(row as Registration);
    }
  } catch {
    registrationsBySession = {};
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-indigo-400">&amp;</span>
            <span className="text-lg font-semibold text-gray-200">Ampersand</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← 세션 목록
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white">신청자 현황</h1>
        <p className="mt-2 text-gray-400">세션별 신청자 명단입니다.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <AttendeesTable sessions={sessions} registrationsBySession={registrationsBySession} />
      </section>
    </main>
  );
}
