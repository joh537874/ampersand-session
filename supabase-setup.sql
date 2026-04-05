-- ================================================================
-- Ampersand 세션 신청 사이트 - Supabase 테이블 설정 SQL
-- Supabase 대시보드 > SQL Editor에서 이 코드를 실행하세요.
-- ================================================================

-- 신청 정보 테이블 생성
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- 동일 세션에 같은 이름 중복 신청 방지
create unique index if not exists registrations_session_name_unique
  on registrations (session_id, name);

-- Realtime 활성화 (신청 인원 실시간 반영용)
alter publication supabase_realtime add table registrations;
