'use client';

import { useState, useRef, useEffect } from 'react';
import { Session, Registration } from '@/types';

interface Props {
  session: Session;
  registration: Registration;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelModal({ session, registration, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => { pwRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError('비밀번호를 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/registrations/${registration.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registration.name, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '오류가 발생했습니다.'); return; }
      onSuccess();
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-600">Cancel</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-rose-950">신청 취소</h2>
        <p className="mt-1 text-sm text-rose-600">{session.title}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-rose-700">이름</label>
            <input
              type="text"
              value={registration.name}
              readOnly
              className="w-full cursor-not-allowed rounded-2xl border border-pink-200/80 bg-pink-50 px-4 py-3 text-rose-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-rose-700">비밀번호</label>
            <input
              ref={pwRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="신청 시 입력한 비밀번호"
              className="w-full rounded-2xl border border-pink-200/80 bg-white/90 px-4 py-3 text-rose-950 placeholder:text-rose-300 focus:border-red-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-pink-200/80 py-3 text-sm font-medium text-rose-600 hover:bg-pink-50">
              닫기
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-red-600 py-3 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(220,38,38,0.12)] hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? '취소 중...' : '신청 취소'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
