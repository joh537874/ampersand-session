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
  const totalCapacity = sessions.reduce((sum, session) => sum + (session.maxAttendees ?? 0), 0);
  const filledSeats = sessions.reduce(
    (sum, session) => sum + Math.min(initialCounts[session.id] ?? 0, session.maxAttendees ?? initialCounts[session.id] ?? 0),
    0
  );
  const nextSession = [...sessions].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  )[0];
  const nextSessionDate = nextSession
    ? new Date(nextSession.datetime).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : '일정 없음';

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
            href="/attendees"
            className="rounded-full border border-pink-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-rose-700 shadow-[0_10px_30px_rgba(241,143,188,0.12)] hover:-translate-y-0.5 hover:bg-white"
          >
            신청자 현황 보기
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),transparent_58%)]" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-[rgba(255,250,253,0.82)] px-4 py-2 text-sm font-medium text-rose-700 shadow-[0_12px_40px_rgba(241,143,188,0.10)]">
              <span className="h-2 w-2 rounded-full bg-[color:var(--brand)]" />
              벚꽃놀이 가고 싶은 마음을 담아...
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-rose-800 sm:text-5xl lg:text-6xl">
                벚꽃 하츄핑 봄날의 세션 신청~!
                <br />
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-rose-700/80 sm:text-lg">
               화이팅이에요 Ampersand~!!
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_60px_rgba(241,143,188,0.14)] backdrop-blur-sm">
                <p className="text-sm text-rose-400">Open Sessions</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-rose-950">{sessions.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_60px_rgba(241,143,188,0.14)] backdrop-blur-sm">
                <p className="text-sm text-rose-400">Reserved Seats</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-rose-950">
                  {filledSeats}
                  {totalCapacity > 0 && <span className="ml-1 text-lg font-semibold text-rose-400">/ {totalCapacity}</span>}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,255,255,0.72)] p-5 shadow-[0_18px_60px_rgba(241,143,188,0.14)] backdrop-blur-sm">
                <p className="text-sm text-rose-400">Next Session</p>
                <p className="mt-2 text-xl font-black tracking-[-0.04em] text-rose-950">{nextSessionDate}</p>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-pink-200/70 bg-[linear-gradient(180deg,rgba(255,248,252,0.96),rgba(255,236,246,0.92))] px-6 py-7 text-rose-950 shadow-[0_24px_90px_rgba(241,143,188,0.20)]">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(255,194,225,0.56)] blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[rgba(255,255,255,0.66)] blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-400">How It Works</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">3-step quick registration</h2>

              <div className="mt-6 space-y-4">
                {[
                  ['01', '세션 선택', '관심 있는 주제와 시간대를 비교해서 원하는 세션을 골라보세요.'],
                  ['02', '이름과 비밀번호 입력', '비밀번호는 나중에 신청 취소할 때 확인용으로 사용됩니다.'],
                  ['03', '내 신청 상태 확인', '등록 후에는 같은 브라우저에서 신청 완료 상태가 바로 표시됩니다.'],
                ].map(([step, title, description]) => (
                  <div key={step} className="rounded-[1.5rem] border border-pink-200/70 bg-white/65 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fbd5e8,#f6a9cd)] text-sm font-bold text-white shadow-[0_10px_24px_rgba(241,143,188,0.18)]">
                        {step}
                      </span>
                      <div>
                        <p className="font-semibold text-rose-900">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-rose-700/80">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-deep)]">Session Lineup</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-rose-950">이번 주 오픈된 세션</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-rose-700/80">
          </p>
        </div>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-pink-200/80 bg-white/65 py-24 text-rose-400">
            <div className="mb-4 text-4xl">📭</div>
            <p>현재 열린 세션이 없습니다.</p>
          </div>
        ) : (
          <SessionList sessions={sessions} initialCounts={initialCounts} />
        )}
      </section>
    </main>
  );
}
