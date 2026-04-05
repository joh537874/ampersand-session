import { Session, Registration } from '@/types';

interface Props {
  sessions: Session[];
  registrationsBySession: Record<string, Registration[]>;
}

function formatDatetime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AttendeesTable({ sessions, registrationsBySession }: Props) {
  return (
    <div className="space-y-8">
      {sessions.map((session) => {
        const regs = registrationsBySession[session.id] ?? [];
        const ratio = session.maxAttendees ? Math.min(100, Math.round((regs.length / session.maxAttendees) * 100)) : 0;

        return (
          <div
            key={session.id}
            className="overflow-hidden rounded-[2rem] border border-pink-200/70 bg-[rgba(255,251,254,0.82)] p-6 shadow-[0_20px_70px_rgba(241,143,188,0.14)] backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400">Session</p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-rose-950">{session.title}</h2>
                {session.presenter && <p className="mt-2 text-sm font-medium text-[color:var(--brand-deep)]">{session.presenter}</p>}
                <p className="mt-2 text-sm text-rose-700/75">
                  {formatDatetime(session.datetime)}
                  {session.location ? ` · ${session.location}` : ''}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-pink-200/80 bg-white/80 px-3 py-1 text-sm font-semibold text-rose-600 shadow-[0_10px_24px_rgba(241,143,188,0.10)]">
                {regs.length}{session.maxAttendees ? ` / ${session.maxAttendees}` : ''}명
              </span>
            </div>

            {session.maxAttendees && (
              <div className="mt-5 rounded-[1.4rem] border border-pink-200/70 bg-white/78 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-rose-800">신청률</span>
                  <span className="text-xs font-medium text-rose-300">{ratio}% reserved</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-pink-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#f7b3d4,#ef8cbe)]"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>
            )}

            {regs.length === 0 ? (
              <p className="mt-5 rounded-[1.4rem] border border-dashed border-pink-200/70 bg-white/65 px-4 py-5 text-sm text-rose-400">
                아직 신청자가 없습니다.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-pink-200/70 bg-white/72">
                {regs.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between border-b border-pink-100 px-4 py-3 text-sm last:border-b-0">
                    <span className="text-rose-800">
                      <span className="mr-2 text-rose-300">{i + 1}.</span>
                      {r.name}
                    </span>
                    <span className="text-xs text-rose-400">
                      {new Date(r.created_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
