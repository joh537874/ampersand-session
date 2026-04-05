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

  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all ${
      isRegistered
        ? 'border-indigo-500 bg-indigo-950/40'
        : 'border-white/10 bg-white/5 hover:bg-white/10'
    }`}>
      {isRegistered && (
        <span className="absolute top-4 right-4 rounded-full bg-indigo-500 px-2.5 py-0.5 text-xs font-medium text-white">
          신청 완료
        </span>
      )}

      <h2 className="text-lg font-bold text-white pr-20">{session.title}</h2>

      {session.presenter && (
        <p className="mt-1 text-sm text-indigo-300">{session.presenter}</p>
      )}

      <div className="mt-3 space-y-1 text-sm text-gray-400">
        <p>🕐 {formatDatetime(session.datetime)}</p>
        {session.location && <p>📍 {session.location}</p>}
      </div>

      {session.description && (
        <p className="mt-3 text-sm text-gray-300 line-clamp-2">{session.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm font-medium ${isFull ? 'text-red-400' : 'text-gray-400'}`}>
          {isFull ? '🔴 마감' : `👥 ${count}${session.maxAttendees ? ` / ${session.maxAttendees}명` : '명'}`}
        </span>

        {isRegistered ? (
          <button
            onClick={onCancel}
            className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            취소하기
          </button>
        ) : (
          <button
            onClick={onRegister}
            disabled={isFull}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              isFull
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            신청하기
          </button>
        )}
      </div>
    </div>
  );
}
