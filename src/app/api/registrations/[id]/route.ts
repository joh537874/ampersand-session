// ================================================================
// 📋 이 파일은 무엇인가요?
// 세션 신청 취소를 처리하는 서버 API 파일입니다.
// 취소 버튼을 누르고 비밀번호를 확인하면 이 파일이 실행됩니다.
// ================================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabase';
import { logToNotion } from '@/lib/notion';
import { sessions } from '@/data/sessions';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, password } = body;

  if (!name || !password) {
    return NextResponse.json({ error: '이름과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: registration, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id)
    .eq('name', name)
    .single();

  if (error || !registration) {
    return NextResponse.json({ error: '신청 정보를 찾을 수 없습니다.' }, { status: 404 });
  }

  const isValid = await bcrypt.compare(password, registration.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
  }

  const { error: deleteError } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const session = sessions.find((s) => s.id === registration.session_id);
  logToNotion({
    name,
    sessionTitle: session?.title ?? registration.session_id,
    action: '취소',
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
