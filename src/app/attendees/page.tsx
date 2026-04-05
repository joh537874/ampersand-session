import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sessions } from '@/data/sessions';
import AttendeesTable from '@/components/AttendeesTable';
import { Registration, Session } from '@/types';

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

  const totalRegistrations = Object.values(registrationsBySession).reduce((sum, regs) => sum + regs.length, 0);
  const activeSessions = sessions.filter((session) => (registrationsBySession[session.id] ?? []).length > 0).length;
  const fullestSession = sessions.reduce<Session | null>((current, session) => {
    const currentCount = current ? registrationsBySession[current.id]?.length ?? 0 : -1;
    const nextCount = registrationsBySession[session.id]?.length ?? 0;
    return nextCount > currentCount ? session : current;
  }, null);

  return (
    <main className="min-h-screen text-rose-950">
      <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[rgba(255,248,252,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f8b7d7,#f18fbc)] text-xl font-black text-white shadow-[0_18px_34px_rgba(241,143,188,0.34)]">
              &amp;
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">
                GenAI 4th
              </p>
              <span className="text-lg font-semibold text-rose-950">Ampersand Spring Session</span>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-pink-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-rose-700 shadow-[0_10px_30px_rgba(241,143,188,0.12)] hover:-translate-y-0.5 hover:bg-white"
          >
            ← 세션 목록
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),transparent_58%)]" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-14">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-[rgba(255,250,253,0.82)] px-4 py-2 text-sm font-medium text-rose-700 shadow-[0_12px_40px_rgba(241,143,188,0.10)]">
              <span className="h-2 w-2 rounded-full bg-[color:var(--brand)]" />
              벚꽃 테마 신청 현황 보드
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-rose-950 sm:text-5xl">
                신청 현황도
                <br />
                같은 봄빛으로 정리했어요.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-rose-700/80 sm:text-lg">
                세션별 신청 인원과 명단을 한눈에 확인할 수 있어요. 가장 많이 찬 세션과 전체 신청 수까지 함께 볼 수 있습니다.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_60px_rgba(241,143,188,0.14)] backdrop-blur-sm">
                <p className="text-sm text-rose-400">Total Registrations</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-rose-950">{totalRegistrations}</p>
              </div>
              <div className="rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_60px_rgba(241,143,188,0.14)] backdrop-blur-sm">
                <p className="text-sm text-rose-400">Active Sessions</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-rose-950">{activeSessions}</p>
              </div>
              <div className="rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_60px_rgba(241,143,188,0.14)] backdrop-blur-sm">
                <p className="text-sm text-rose-400">Most Loved</p>
                <p className="mt-2 line-clamp-2 text-lg font-black tracking-[-0.03em] text-rose-950">
                  {fullestSession?.title ?? '아직 없음'}
                </p>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-pink-200/70 bg-[linear-gradient(180deg,rgba(255,248,252,0.96),rgba(255,236,246,0.92))] px-6 py-7 text-rose-950 shadow-[0_24px_90px_rgba(241,143,188,0.20)]">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(255,194,225,0.56)] blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[rgba(255,255,255,0.66)] blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-400">Overview</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">session attendance snapshot</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-pink-200/70 bg-white/65 p-4 backdrop-blur-sm">
                  <p className="font-semibold text-rose-900">실시간 신청 수 확인</p>
                  <p className="mt-1 text-sm leading-6 text-rose-700/80">
                    각 세션 카드에서 신청 인원과 정원을 함께 비교할 수 있어요.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-pink-200/70 bg-white/65 p-4 backdrop-blur-sm">
                  <p className="font-semibold text-rose-900">가장 인기 있는 세션 파악</p>
                  <p className="mt-1 text-sm leading-6 text-rose-700/80">
                    어떤 세션이 가장 빠르게 차고 있는지 제목 기준으로 바로 확인할 수 있습니다.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-pink-200/70 bg-white/65 p-4 backdrop-blur-sm">
                  <p className="font-semibold text-rose-900">신청 순서 기록</p>
                  <p className="mt-1 text-sm leading-6 text-rose-700/80">
                    명단은 신청 시각 기준 오름차순으로 보여서 등록 순서를 한눈에 보기 쉬워요.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <AttendeesTable sessions={sessions} registrationsBySession={registrationsBySession} />
      </section>
    </main>
  );
}
