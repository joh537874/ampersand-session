// ================================================================
// 📋 이 파일은 무엇인가요?
// 세션 신청을 처리하는 서버 API 파일입니다.
// 신청 버튼을 누르면 이 파일이 실행되어 신청 정보를 저장합니다.
// ================================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabase';
import { logToNotion } from '@/lib/notion';
import { sessions } from '@/data/sessions';

// GET: 특정 세션의 신청자 목록 조회
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  const supabase = createServerSupabaseClient();

  if (sessionId) {
    const { data, error } = await supabase
      .from('registrations')
      .select('id, session_id, name, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // 세션별 신청자 수 집계
  const { data, error } = await supabase
    .from('registrations')
    .select('session_id, id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.session_id] = (counts[row.session_id] ?? 0) + 1;
  }
  return NextResponse.json(counts);
}

// POST: 세션 신청
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, name, password } = body;

  if (!session_id || !name || !password) {
    return NextResponse.json({ error: '세션, 이름, 비밀번호를 모두 입력해주세요.' }, { status: 400 });
  }

  const session = sessions.find((s) => s.id === session_id);
  if (!session) {
    return NextResponse.json({ error: '존재하지 않는 세션입니다.' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // 정원 확인
  if (session.maxAttendees) {
    const { count } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id);

    if ((count ?? 0) >= session.maxAttendees) {
      return NextResponse.json({ error: '정원이 마감되었습니다.' }, { status: 409 });
    }
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('registrations')
    .insert({ session_id, name, password_hash })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 이 세션을 신청하셨습니다.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 노션 기록 (실패해도 신청은 완료)
  logToNotion({ name, sessionTitle: session.title, action: '신청' }).catch(() => {});

  return NextResponse.json(data, { status: 201 });
}
