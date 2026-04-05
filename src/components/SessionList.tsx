'use client';

import { useEffect, useState, useCallback } from 'react';
import { Session, Registration } from '@/types';
import { supabase } from '@/lib/supabase';
import SessionCard from './SessionCard';
import RegisterModal from './RegisterModal';
import CancelModal from './CancelModal';
import Toast from './Toast';
import BlossomBurst from './BlossomBurst';

interface Props {
  sessions: Session[];
  initialCounts: Record<string, number>;
}

const STORAGE_KEY = 'ampersand_my_regs';

function loadMyRegs(): Record<string, Registration> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveMyRegs(regs: Record<string, Registration>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
}

export default function SessionList({ sessions, initialCounts }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [myRegs, setMyRegs] = useState<Record<string, Registration>>({});
  const [modal, setModal] = useState<{ type: 'register' | 'cancel'; sessionId: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [blossomBurstKey, setBlossomBurstKey] = useState(0);

  // localStorage에서 신청 정보 복원
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMyRegs(loadMyRegs());
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Supabase Realtime 구독
  const refreshCounts = useCallback(async () => {
    const res = await fetch('/api/registrations');
    if (res.ok) {
      const data = await res.json();
      setCounts(data);
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('registrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        refreshCounts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refreshCounts]);

  // datetime 기준 오름차순 정렬
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  const activeSession = modal ? sessions.find((s) => s.id === modal.sessionId) : null;
  const registeredCount = sortedSessions.filter((session) => myRegs[session.id]).length;

  return (
    <>
      {!loaded && (
        <div className="mb-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((_, i) => (
            <div key={i} className="animate-pulse rounded-[2rem] border border-pink-200/70 bg-white/70 p-6 shadow-[0_18px_60px_rgba(241,143,188,0.10)]">
              <div className="mb-3 h-3 w-20 rounded bg-pink-100" />
              <div className="mb-4 h-6 w-3/4 rounded bg-pink-100" />
              <div className="mb-3 h-16 rounded-2xl bg-pink-50" />
              <div className="h-14 rounded-2xl bg-pink-50" />
              <div className="mt-6 flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-pink-100" />
                <div className="h-10 w-24 rounded-full bg-pink-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-pink-200/70 bg-[rgba(255,252,255,0.82)] px-5 py-4 shadow-[0_16px_50px_rgba(241,143,188,0.12)] sm:flex-row sm:items-center sm:justify-between ${!loaded ? 'hidden' : ''}`}>
        <div>
          <p className="text-sm font-semibold text-rose-900">
            내 신청 현황 <span className="text-[color:var(--brand)]">{registeredCount}개</span>
          </p>
          <p className="mt-1 text-sm text-rose-500">같은 브라우저에서는 신청한 세션이 자동으로 표시됩니다.</p>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-300">Realtime registration status</p>
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${!loaded ? 'hidden' : ''}`}>
        {sortedSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            count={counts[session.id] ?? 0}
            myRegistration={myRegs[session.id] ?? null}
            onRegister={() => setModal({ type: 'register', sessionId: session.id })}
            onCancel={() => setModal({ type: 'cancel', sessionId: session.id })}
          />
        ))}
      </div>

      {modal?.type === 'register' && activeSession && (
        <RegisterModal
          session={activeSession}
          onClose={() => setModal(null)}
          onSuccess={(name, registrationId) => {
            const newReg: Registration = {
              id: registrationId,
              session_id: activeSession.id,
              name,
              created_at: new Date().toISOString(),
            };
            setMyRegs((prev) => {
              const next = { ...prev, [activeSession.id]: newReg };
              saveMyRegs(next);
              return next;
            });
            setCounts((prev) => ({ ...prev, [activeSession.id]: (prev[activeSession.id] ?? 0) + 1 }));
            setBlossomBurstKey((prev) => prev + 1);
            showToast(`🌸 "${activeSession.title}" 신청 완료!`);
          }}
        />
      )}

      {modal?.type === 'cancel' && activeSession && myRegs[activeSession.id] && (
        <CancelModal
          session={activeSession}
          registration={myRegs[activeSession.id]}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setMyRegs((prev) => {
              const next = { ...prev };
              delete next[activeSession.id];
              saveMyRegs(next);
              return next;
            });
            setCounts((prev) => ({ ...prev, [activeSession.id]: Math.max(0, (prev[activeSession.id] ?? 0) - 1) }));
            showToast(`🗑️ "${activeSession.title}" 신청 취소됨`);
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <BlossomBurst burstKey={blossomBurstKey} />
    </>
  );
}
