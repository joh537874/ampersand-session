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
  const [name, setName] = useState(registration.name);
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
        body: JSON.stringify({ name, password }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white">신청 취소</h2>
        <p className="mt-1 text-sm text-gray-400">{session.title}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">이름</label>
            <input
              type="text"
              value={name}
              readOnly
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">비밀번호</label>
            <input
              ref={pwRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="신청 시 입력한 비밀번호"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
              닫기
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
              {loading ? '취소 중...' : '신청 취소'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
