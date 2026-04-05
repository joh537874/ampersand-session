# Ampersand 세션 신청 사이트 설계 문서

## 기술 스택

- Frontend: Next.js 14 (App Router)
- Backend: Next.js API Routes (서버리스)
- Database: Supabase (PostgreSQL + Realtime)
- 외부 연동: Notion API
- 스타일링: Tailwind CSS
- 배포: Vercel
- 언어: TypeScript

## 폴더 구조

```
src/
├── app/
│   ├── page.tsx                  # 메인 페이지 (세션 목록)
│   ├── attendees/
│   │   └── page.tsx              # 신청자 현황 페이지
│   ├── api/
│   │   ├── registrations/
│   │   │   └── route.ts          # GET(조회), POST(신청)
│   │   └── registrations/[id]/
│   │       └── route.ts          # DELETE(취소)
│   └── layout.tsx
├── components/
│   ├── SessionCard.tsx           # 세션 카드 컴포넌트
│   ├── SessionList.tsx           # 세션 목록 컨테이너
│   ├── RegisterModal.tsx         # 신청 모달
│   ├── CancelModal.tsx           # 취소 모달
│   └── AttendeesTable.tsx        # 신청자 현황 테이블
├── data/
│   └── sessions.ts               # 세션 하드코딩 데이터
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트
│   └── notion.ts                 # Notion API 클라이언트
└── types/
    └── index.ts                  # 공통 타입 정의
```

## 데이터 모델

### sessions (하드코딩 데이터 파일: src/data/sessions.ts)

세션 목록은 DB가 아닌 코드 파일에서 관리한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 세션 고유 식별자 (예: "session-01") |
| title | string | 세션명 |
| presenter | string | 발표자 이름 |
| datetime | string | 일시 (ISO 8601 형식) |
| location | string | 장소 |
| description | string | 세션 설명 |
| maxAttendees | number (선택) | 최대 수용 인원, 없으면 무제한 |

### registrations (Supabase 테이블)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid | 기본키, auto-generated |
| session_id | text | 세션 ID (sessions.ts의 id와 매핑) |
| name | text | 신청자 이름 |
| password_hash | text | 비밀번호 (bcrypt 해시) |
| created_at | timestamptz | 신청 시각, 기본값 now() |

인덱스:
- (session_id, name) UNIQUE - 동일 세션 중복 신청 방지

### notion_log (Notion 데이터베이스 속성)

Supabase 테이블이 아닌 Notion 데이터베이스에 기록되는 항목이다.

| 속성명 | 타입 | 설명 |
|--------|------|------|
| 이름 | title | 신청자 이름 |
| 세션명 | text | 세션 제목 |
| 구분 | select | "신청" 또는 "취소" |
| 처리 시각 | date | 신청/취소가 발생한 시각 |

## 화면별 컴포넌트

### 메인 페이지 (/)

- 컴포넌트: SessionList > SessionCard, RegisterModal, CancelModal
- 상태:
  - 세션별 신청자 수 (Supabase Realtime 구독으로 자동 갱신)
  - 현재 사용자가 신청한 세션 ID 목록 (로컬 스토리지에 이름 기준으로 임시 저장)
  - 열려 있는 모달 상태 (신청/취소, 대상 세션 ID)
- 데이터 흐름:
  - 페이지 로드 시 Supabase에서 세션별 신청자 수를 조회한다
  - Supabase Realtime으로 registrations 테이블 변경 사항을 구독한다
  - 신청/취소 후 로컬 상태를 즉시 업데이트한다 (낙관적 업데이트)

### 신청 모달 (RegisterModal)

- 입력: 이름, 비밀번호
- 제출 시: POST /api/registrations 호출
- 성공: 모달 닫기, 신청자 수 갱신
- 실패: 에러 메시지 표시 (중복 신청, 정원 초과 등)

### 취소 모달 (CancelModal)

- 입력: 이름, 비밀번호
- 제출 시: DELETE /api/registrations/[id] 호출 (이름으로 등록 ID 조회 후 삭제)
- 성공: 모달 닫기, 신청자 수 갱신
- 실패: 에러 메시지 표시 (비밀번호 불일치 등)

### 신청자 현황 페이지 (/attendees)

- 컴포넌트: AttendeesTable
- 상태: 세션별 신청자 명단 (서버 컴포넌트로 렌더링)
- 세션 목록과 registrations 테이블을 join하여 세션별 신청자를 그룹핑하여 표시한다

## API 라우트

| 메서드 | 경로 | 설명 | 요청 Body | 응답 |
|--------|------|------|-----------|------|
| GET | /api/registrations?session_id= | 특정 세션의 신청 목록 조회 | - | 신청자 목록 |
| POST | /api/registrations | 세션 신청 | { session_id, name, password } | 생성된 registration |
| DELETE | /api/registrations/[id] | 세션 취소 | { name, password } | 성공/실패 |

### POST /api/registrations 처리 흐름

1. session_id, name, password 유효성 검사
2. sessions.ts에서 해당 session_id 존재 여부 확인
3. 최대 인원 제한이 있는 경우 현재 신청자 수 확인
4. 중복 신청 여부 확인 (session_id + name 유니크 제약)
5. 비밀번호 bcrypt 해시 후 Supabase에 저장
6. Notion API로 신청 내역 기록 (비동기, 실패해도 응답에 영향 없음)
7. 성공 응답 반환

### DELETE /api/registrations/[id] 처리 흐름

1. name, password 유효성 검사
2. Supabase에서 id + name으로 해당 registration 조회
3. bcrypt로 비밀번호 일치 여부 확인
4. 일치하면 해당 레코드 삭제
5. Notion API로 취소 내역 기록 (비동기)
6. 성공 응답 반환

## 실시간 업데이트 설계

Supabase Realtime의 Postgres Changes 기능을 사용한다.

- 구독 채널: registrations 테이블의 INSERT, DELETE 이벤트
- 이벤트 수신 시 세션별 신청자 수를 재계산하여 UI 갱신
- 연결 방식: 클라이언트 컴포넌트에서 useEffect로 구독 설정

## 환경 변수

| 변수명 | 설명 |
|--------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 익명 키 (클라이언트용) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 서비스 롤 키 (서버 API용) |
| NOTION_API_KEY | Notion Integration 토큰 |
| NOTION_DATABASE_ID | 기록할 Notion 데이터베이스 ID |

## 디자인 방향

- 색상: Ampersand 학회 아이덴티티에 맞춰 다크 톤 또는 포인트 컬러 사용
- 레이아웃: 세션 카드 그리드 (모바일 1열, 태블릿 2열, 데스크탑 3열)
- 세션 카드: 세션명, 발표자, 일시/장소, 설명 요약, 신청 인원, 신청/취소 버튼
- 모달: 오버레이 방식, 이름과 비밀번호 입력 후 제출
- 신청 완료된 세션 카드: 배경 또는 버튼 색상으로 시각적 구분
- 반응형 지원 (모바일 우선)
