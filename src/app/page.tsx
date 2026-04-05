import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sessions } from '@/data/sessions';
import SessionList from '@/components/SessionList';

export const dynamic = 'force-dynamic';

async function getInitialCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from('registrations').select('session_id, id');
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.session_id] = (counts[row.session_id] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const initialCounts = await getInitialCounts();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* 헤더 */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-indigo-400">&amp;</span>
            <span className="text-lg font-semibold text-gray-200">Ampersand</span>
          </div>
          <Link href="/attendees" className="text-sm text-gray-400 hover:text-white transition-colors">
            신청자 현황 →
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">세션 신청</h1>
        <p className="mt-2 text-gray-400">원하는 세션을 선택하고 이름과 비밀번호를 입력해 신청하세요.</p>
      </section>

      {/* 세션 목록 */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p>현재 열린 세션이 없습니다.</p>
          </div>
        ) : (
          <SessionList sessions={sessions} initialCounts={initialCounts} />
        )}
      </section>
    </main>
  );
}
