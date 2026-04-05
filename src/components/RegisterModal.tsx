'use client';

import { useState, useRef, useEffect } from 'react';
import { Session } from '@/types';

interface Props {
  session: Session;
  onClose: () => void;
  onSuccess: (name: string, registrationId: string) => void;
}

export default function RegisterModal({ session, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !password) {
      setError('이름과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '오류가 발생했습니다.'); return; }
      onSuccess(name.trim(), data.id);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(108,44,78,0.18)] p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[2rem] border border-pink-200/80 bg-[rgba(255,250,253,0.97)] p-6 shadow-[0_24px_90px_rgba(241,143,188,0.20)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">Register</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-rose-950">세션 신청</h2>
        <p className="mt-1 text-sm text-rose-600">{session.title}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-rose-700">이름</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-2xl border border-pink-200/80 bg-white/90 px-4 py-3 text-rose-950 placeholder:text-rose-300 focus:border-[color:var(--brand)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-rose-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="나중에 취소할 때 사용해요"
              className="w-full rounded-2xl border border-pink-200/80 bg-white/90 px-4 py-3 text-rose-950 placeholder:text-rose-300 focus:border-[color:var(--brand)] focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-pink-200/80 py-3 text-sm font-medium text-rose-600 hover:bg-pink-50">
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[linear-gradient(135deg,#f8b4d5,#ee88ba)] py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(241,143,188,0.28)] hover:brightness-95 disabled:opacity-50"
            >
              {loading ? '신청 중...' : '신청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
