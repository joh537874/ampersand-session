// ================================================================
// 📋 이 파일은 무엇인가요?
// 웹사이트 전체에서 공통으로 사용하는 데이터 형태를 정의한 파일입니다.
// 세션(강의/발표), 신청 정보 등의 데이터 구조가 여기에 정의되어 있어요.
// ================================================================

export interface Session {
  id: string;
  title: string;
  presenter: string;
  datetime: string;
  location: string;
  description: string;
  maxAttendees?: number;
}

export interface Registration {
  id: string;
  session_id: string;
  name: string;
  created_at: string;
}
