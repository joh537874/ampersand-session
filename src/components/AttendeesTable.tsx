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
        return (
          <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">{session.title}</h2>
                {session.presenter && <p className="text-sm text-indigo-300">{session.presenter}</p>}
                <p className="mt-1 text-sm text-gray-400">{formatDatetime(session.datetime)}{session.location ? ` · ${session.location}` : ''}</p>
              </div>
              <span className="shrink-0 rounded-full bg-indigo-600/20 px-3 py-1 text-sm font-medium text-indigo-300">
                {regs.length}{session.maxAttendees ? ` / ${session.maxAttendees}` : ''}명
              </span>
            </div>

            {regs.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">아직 신청자가 없습니다.</p>
            ) : (
              <div className="mt-4 divide-y divide-white/5">
                {regs.map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-300">
                      <span className="mr-2 text-gray-500">{i + 1}.</span>
                      {r.name}
                    </span>
                    <span className="text-gray-500 text-xs">
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
