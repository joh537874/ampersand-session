'use client';

import { useEffect, useState, useCallback } from 'react';
import { Session, Registration } from '@/types';
import { supabase } from '@/lib/supabase';
import SessionCard from './SessionCard';
import RegisterModal from './RegisterModal';
import CancelModal from './CancelModal';
import Toast from './Toast';

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

  // localStorage에서 신청 정보 복원
  useEffect(() => {
    setMyRegs(loadMyRegs());
    setLoaded(true);
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

  return (
    <>
      {!loaded && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {sessions.map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
              <div className="mt-6 flex justify-between items-center">
                <div className="h-3 bg-white/10 rounded w-16" />
                <div className="h-8 bg-white/10 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${!loaded ? 'hidden' : ''}`}>
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
            showToast(`✅ "${activeSession.title}" 신청 완료!`);
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
    </>
  );
}
