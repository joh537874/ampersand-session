'use client';

import { Session, Registration } from '@/types';

interface Props {
  session: Session;
  count: number;
  myRegistration: Registration | null;
  onRegister: () => void;
  onCancel: () => void;
}

function formatDatetime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SessionCard({ session, count, myRegistration, onRegister, onCancel }: Props) {
  const isFull = session.maxAttendees !== undefined && count >= session.maxAttendees;
  const isRegistered = !!myRegistration;
  const ratio = session.maxAttendees ? Math.min(100, Math.round((count / session.maxAttendees) * 100)) : 0;

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-6 shadow-[0_20px_70px_rgba(241,143,188,0.16)] transition-all duration-200 ${
      isRegistered
        ? 'border-pink-300/80 bg-[linear-gradient(180deg,rgba(255,250,253,0.98),rgba(255,234,245,0.92))]'
        : 'border-pink-200/70 bg-[rgba(255,251,254,0.78)] hover:-translate-y-1 hover:border-pink-300/80 hover:bg-[rgba(255,246,250,0.96)]'
    }`}>
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[rgba(248,184,217,0.28)] blur-2xl transition-transform duration-200 group-hover:scale-110" />
      <div className="absolute left-6 top-5 text-base opacity-60">🌸</div>

      {isRegistered && (
        <span className="absolute right-4 top-4 rounded-full bg-[linear-gradient(135deg,#f7a9ce,#ef7fb5)] px-3 py-1 text-xs font-semibold text-white shadow-[0_12px_26px_rgba(241,143,188,0.28)]">
          신청 완료
        </span>
      )}

      <div className="relative flex items-start justify-between gap-3 pr-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400">Session</p>
          <h2 className="mt-2 pr-2 text-xl font-black tracking-[-0.03em] text-rose-950">{session.title}</h2>
        </div>
      </div>

      {session.presenter && (
        <p className="mt-2 text-sm font-medium text-[color:var(--brand-deep)]">{session.presenter}</p>
      )}

      <div className="mt-5 grid gap-3 text-sm text-rose-700/80">
        <div className="rounded-2xl border border-pink-200/70 bg-white/82 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-300">Date & Time</p>
          <p className="mt-1 font-medium text-rose-900">{formatDatetime(session.datetime)}</p>
        </div>
        {session.location && (
          <div className="rounded-2xl border border-pink-200/70 bg-white/82 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-300">Location</p>
            <p className="mt-1 font-medium text-rose-900">{session.location}</p>
          </div>
        )}
      </div>

      {session.description && (
        <p className="mt-4 text-sm leading-6 text-rose-700/80 line-clamp-3">{session.description}</p>
      )}

      <div className="mt-auto pt-6">
        <div className="rounded-[1.4rem] border border-pink-200/70 bg-[rgba(255,255,255,0.8)] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className={`text-sm font-semibold ${isFull ? 'text-red-600' : 'text-rose-800'}`}>
              {isFull ? '모집 마감' : `신청 ${count}${session.maxAttendees ? ` / ${session.maxAttendees}명` : '명'}`}
            </span>
            {session.maxAttendees && (
              <span className="text-xs font-medium text-rose-300">{ratio}% reserved</span>
            )}
          </div>

          {session.maxAttendees && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-pink-100">
              <div
                className={`h-full rounded-full ${isFull ? 'bg-red-400' : 'bg-[linear-gradient(90deg,#f7b3d4,#ef8cbe)]'}`}
                style={{ width: `${ratio}%` }}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-rose-300">
            {isRegistered ? 'Reserved by you' : 'Ready to register'}
          </span>

          {isRegistered ? (
            <button
              onClick={onCancel}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 shadow-[0_10px_18px_rgba(241,143,188,0.10)] hover:bg-rose-50"
            >
              신청 취소
            </button>
          ) : (
            <button
              onClick={onRegister}
              disabled={isFull}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white ${
                isFull
                  ? 'cursor-not-allowed bg-pink-100 text-rose-300'
                  : 'bg-[linear-gradient(135deg,#f8b4d5,#ee88ba)] shadow-[0_12px_22px_rgba(241,143,188,0.18)] hover:brightness-95'
              }`}
            >
              신청하기
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
