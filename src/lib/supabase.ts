// ================================================================
// 📋 이 파일은 무엇인가요?
// Supabase(데이터베이스) 연결을 설정하는 파일입니다.
// 신청자 정보를 저장하고 실시간으로 업데이트하는 데 사용됩니다.
// ================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// 브라우저(클라이언트)용 - 실시간 구독에 사용
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버용 (API Route에서 사용) - 더 높은 권한
export function createServerSupabaseClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  );
}
