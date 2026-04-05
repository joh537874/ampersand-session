# Ampersand 세션 신청 사이트 작업 목록

## T001: 프로젝트 초기 설정

- 선행 작업: 없음
- 내용:
  - Next.js 14 프로젝트 생성 (App Router, TypeScript)
  - Tailwind CSS 설정
  - Supabase 클라이언트 라이브러리 설치 (`@supabase/supabase-js`, `@supabase/ssr`)
  - bcryptjs 설치 (`bcryptjs`, `@types/bcryptjs`)
  - `.env.local` 파일 생성 및 환경 변수 항목 정의 (값은 비워둠)
  - `src/types/index.ts` 공통 타입 정의 (Session, Registration)
- 완료 기준: `npm run dev` 실행 시 Next.js 기본 페이지가 뜨고 TypeScript 오류가 없다

## T002: Supabase 데이터베이스 설정

- 선행 작업: T001
- 내용:
  - Supabase 프로젝트 생성
  - `registrations` 테이블 생성 (id, session_id, name, password_hash, created_at)
  - (session_id, name) UNIQUE 제약 추가
  - Realtime 기능 활성화 (registrations 테이블)
  - Supabase 환경 변수 `.env.local`에 입력
  - `src/lib/supabase.ts` 클라이언트/서버용 Supabase 인스턴스 설정
- 완료 기준: Supabase 대시보드에서 테이블이 생성되고, 앱에서 Supabase 연결이 확인된다

## T003: 세션 데이터 파일 작성

- 선행 작업: T001
- 내용:
  - `src/data/sessions.ts` 파일 생성
  - Session 타입에 맞게 샘플 세션 3~5개를 하드코딩 (id, title, presenter, datetime, location, description, maxAttendees)
  - 세션 데이터를 export하는 상수 정의
- 완료 기준: sessions.ts import 시 세션 배열이 정상적으로 반환된다

## T004: Notion API 연동 설정

- 선행 작업: T001
- 내용:
  - Notion Integration 생성 및 API 키 발급
  - 기록용 Notion 데이터베이스 생성 (이름, 세션명, 구분, 처리 시각 속성)
  - Integration을 데이터베이스에 연결
  - `src/lib/notion.ts` 작성: Notion API 클라이언트 초기화 및 로그 기록 함수 구현
  - 환경 변수 `.env.local`에 NOTION_API_KEY, NOTION_DATABASE_ID 입력
- 완료 기준: notion.ts의 로그 기록 함수 호출 시 Notion 데이터베이스에 레코드가 생성된다

## T005: 세션 신청 API 구현

- 선행 작업: T002, T003, T004
- 내용:
  - `src/app/api/registrations/route.ts` 생성
  - POST 핸들러 구현:
    - 요청 Body 유효성 검사 (session_id, name, password 필수)
    - sessions.ts에서 session_id 유효성 확인
    - maxAttendees가 있는 경우 현재 신청자 수 확인 후 정원 초과 여부 판단
    - 중복 신청 여부 확인
    - 비밀번호 bcrypt 해시 처리
    - Supabase registrations 테이블에 INSERT
    - Notion 로그 기록 (비동기, 실패해도 응답 영향 없음)
    - 성공/실패 응답 반환
  - GET 핸들러 구현:
    - session_id 쿼리 파라미터로 해당 세션 신청자 목록 반환
- 완료 기준: POST 요청 시 DB에 신청 레코드가 생성되고 Notion에 기록된다. 중복 신청 시 에러 응답이 반환된다

## T006: 세션 취소 API 구현

- 선행 작업: T002, T004
- 내용:
  - `src/app/api/registrations/[id]/route.ts` 생성
  - DELETE 핸들러 구현:
    - URL 파라미터 id와 Body의 name, password 유효성 검사
    - Supabase에서 id와 name으로 registration 조회
    - 레코드가 없으면 404 응답
    - bcrypt로 비밀번호 일치 여부 확인, 불일치 시 401 응답
    - 레코드 DELETE
    - Notion 취소 로그 기록 (비동기)
    - 성공 응답 반환
- 완료 기준: DELETE 요청 시 비밀번호 일치하면 레코드가 삭제되고 Notion에 취소 기록이 남는다. 비밀번호 불일치 시 에러 응답이 반환된다

## T007: 세션 카드 컴포넌트 구현

- 선행 작업: T003
- 내용:
  - `src/components/SessionCard.tsx` 구현
  - 표시 항목: 세션명, 발표자, 일시(날짜+시간 포맷팅), 장소, 설명, 현재 신청 인원 (/ 최대 인원)
  - 신청 버튼과 취소 버튼 UI 구현
  - 본인 신청 여부에 따라 버튼 상태 변경 (신청 전: "신청하기", 신청 후: "신청 완료 / 취소")
  - 정원이 마감된 세션은 버튼 비활성화 및 "마감" 표시
  - Tailwind CSS로 카드 스타일링 (반응형 포함)
- 완료 기준: 세션 데이터를 props로 받아 카드가 올바르게 렌더링된다. 신청 상태에 따라 버튼이 다르게 표시된다

## T008: 신청/취소 모달 컴포넌트 구현

- 선행 작업: T005, T006
- 내용:
  - `src/components/RegisterModal.tsx` 구현:
    - 이름, 비밀번호 입력 필드
    - 제출 시 POST /api/registrations 호출
    - 로딩 상태, 성공/에러 메시지 표시
    - 성공 시 모달 닫기 콜백 호출
  - `src/components/CancelModal.tsx` 구현:
    - 이름, 비밀번호 입력 필드
    - 제출 시 DELETE /api/registrations/[id] 호출 (registration id는 이름으로 조회)
    - 로딩 상태, 에러 메시지 표시
    - 성공 시 모달 닫기 콜백 호출
  - 모달 오버레이 배경 클릭 시 닫힘
- 완료 기준: 모달에서 이름과 비밀번호 입력 후 신청/취소가 정상 처리된다. 에러 시 적절한 메시지가 표시된다

## T009: 메인 페이지 구현 (실시간 연동 포함)

- 선행 작업: T007, T008
- 내용:
  - `src/components/SessionList.tsx` 구현:
    - 세션 목록과 신청자 수 상태 관리
    - Supabase Realtime 구독 설정 (registrations 테이블 INSERT/DELETE 이벤트)
    - 이벤트 수신 시 세션별 신청자 수 업데이트
    - 모달 열기/닫기 상태 관리
  - `src/app/page.tsx` 구현:
    - 페이지 로드 시 Supabase에서 세션별 신청자 수 초기 데이터 fetch
    - SessionList에 데이터 전달
    - 페이지 헤더 (Ampersand 로고/타이틀 영역)
- 완료 기준: 메인 페이지에 세션 카드 목록이 표시되고, 다른 탭에서 신청 시 신청 인원이 실시간으로 반영된다

## T010: 신청자 현황 페이지 구현

- 선행 작업: T002, T003
- 내용:
  - `src/components/AttendeesTable.tsx` 구현:
    - 세션별 신청자 명단 테이블 렌더링
    - 세션명, 발표자, 신청자 목록, 신청 시각 표시
  - `src/app/attendees/page.tsx` 구현:
    - 서버 컴포넌트로 Supabase에서 전체 신청 데이터 fetch
    - sessions.ts 데이터와 registrations 데이터를 세션 ID 기준으로 병합
    - AttendeesTable에 데이터 전달
    - 메인 페이지로 돌아가는 링크 제공
- 완료 기준: /attendees 페이지에서 세션별 신청자 명단이 정확하게 표시된다

## T011: 전체 UI 스타일 정리 및 반응형 적용

- 선행 작업: T009, T010
- 내용:
  - 전체 페이지 레이아웃 정리 (헤더, 메인 영역, 푸터)
  - 세션 카드 그리드: 모바일 1열, 태블릿 2열, 데스크탑 3열
  - 색상 테마 적용 (Ampersand 학회 아이덴티티 반영)
  - 모달 반응형 처리
  - 빈 상태 처리 (신청자 없는 세션, 세션이 없는 경우)
  - 로딩 스켈레톤 또는 스피너 추가
- 완료 기준: 모바일, 태블릿, 데스크탑 화면에서 레이아웃이 올바르게 표시된다

## T012: 환경 변수 설정 및 Vercel 배포

- 선행 작업: T011
- 내용:
  - Vercel 프로젝트 생성 및 GitHub 레포지토리 연결
  - Vercel 대시보드에서 환경 변수 입력 (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NOTION_API_KEY, NOTION_DATABASE_ID)
  - Supabase CORS 설정에 Vercel 배포 도메인 추가
  - 배포 후 전체 기능 동작 확인
- 완료 기준: Vercel 배포 URL에서 세션 신청, 취소, 실시간 업데이트, Notion 기록이 모두 정상 동작한다
