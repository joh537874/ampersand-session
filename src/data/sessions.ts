// ================================================================
// 📋 이 파일은 무엇인가요?
// Ampersand 학회의 세션(강의/발표) 목록을 저장하는 파일입니다.
//
// 웹사이트에 보이는 세션 카드들의 제목, 날짜, 장소, 최대 참가 인원이
// 모두 여기에 담겨 있어요. 구글 캘린더에서 자동으로 가져오거나,
// 직접 수정해서 세션 정보를 업데이트할 수 있습니다.
//
// ⚠️ 이 파일을 수정하면 웹사이트에 반영됩니다.
//    수정 후 개발자에게 배포를 요청하거나 Vercel에 재배포해주세요.
// ================================================================

import { Session } from '@/types';

export const sessions: Session[] = [
  {
    id: 'session-01',
    title: '[PD] 서비스 브랜딩 구축',
    presenter: '',
    datetime: '2026-04-05T00:00:00+09:00',
    location: '',
    description: '',
    maxAttendees: 30,
  },
  {
    id: 'session-02',
    title: '[GA] AI 리터러시 2',
    presenter: '',
    datetime: '2026-04-05T14:00:00+09:00',
    location: '서강대학교 우정원',
    description: '',
    maxAttendees: 30,
  },
  {
    id: 'session-03',
    title: '[W3] 온보딩 3주차',
    presenter: '',
    datetime: '2026-04-09T23:00:00+09:00',
    location: '',
    description: '',
    maxAttendees: 30,
  },
];
