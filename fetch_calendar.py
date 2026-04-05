# ================================================================
# 📋 이 파일은 무엇인가요?
# 구글 캘린더에서 'Ampersand' 일정을 자동으로 가져오는 스크립트입니다.
#
# 이 파일을 실행하면 구글 캘린더의 앞으로의 일정을 읽어서
# 웹사이트용 세션 데이터 파일(src/data/sessions.ts)을 자동으로 만들어줍니다.
# 캘린더에 새 일정을 추가하거나 수정한 뒤 이 파일을 실행하면
# 웹사이트 세션 정보가 최신으로 업데이트됩니다.
#
# ▶️ 사용 방법: 터미널에서 `python3 fetch_calendar.py` 실행
# ================================================================

import json
import os
from datetime import datetime, timezone
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDS_FILE = os.path.join(BASE_DIR, 'credentials.json')
TOKEN_FILE = os.path.join(BASE_DIR, 'token.json')

def get_service():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
    return build('calendar', 'v3', credentials=creds)

def main():
    service = get_service()

    # 1. 캘린더 목록 조회
    print("=== 캘린더 목록 ===")
    calendars = service.calendarList().list().execute().get('items', [])
    ampersand_calendars = []
    for cal in calendars:
        print(f"  - {cal['summary']} | {cal['id']}")
        if 'ampersand' in cal['summary'].lower() or 'ampersand' in cal['id'].lower():
            ampersand_calendars.append(cal)

    if not ampersand_calendars:
        print("\n'Ampersand' 포함 캘린더를 찾지 못했습니다.")
        return

    print(f"\n=== Ampersand 캘린더 ({len(ampersand_calendars)}개) ===")
    for cal in ampersand_calendars:
        print(f"  ID: {cal['id']}")
        print(f"  이름: {cal['summary']}")

    # 2. 앞으로의 모든 일정 조회
    now = datetime.now(timezone.utc).isoformat()
    all_events = []

    for cal in ampersand_calendars:
        print(f"\n=== [{cal['summary']}] 앞으로의 일정 ===")
        events_result = service.events().list(
            calendarId=cal['id'],
            timeMin=now,
            maxResults=100,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])

        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date', ''))
            end = event['end'].get('dateTime', event['end'].get('date', ''))
            title = event.get('summary', '(제목 없음)')
            description = event.get('description', '')
            location = event.get('location', '')
            print(f"  [{start}] {title}")
            all_events.append({
                'title': title,
                'start': start,
                'end': end,
                'description': description,
                'location': location,
            })

    # 3. sessions.ts 형식으로 저장
    print("\n=== sessions.ts 생성 중 ===")
    lines = []
    lines.append("export interface Session {")
    lines.append("  id: string;")
    lines.append("  title: string;")
    lines.append("  description: string;")
    lines.append("  startTime: string;")
    lines.append("  endTime: string;")
    lines.append("  location: string;")
    lines.append("  maxCapacity: number;")
    lines.append("}")
    lines.append("")
    lines.append("export const sessions: Session[] = [")

    for i, ev in enumerate(all_events):
        lines.append("  {")
        lines.append(f"    id: 'session-{i+1:02d}',")
        lines.append(f"    title: {json.dumps(ev['title'], ensure_ascii=False)},")
        lines.append(f"    description: {json.dumps(ev['description'], ensure_ascii=False)},")
        lines.append(f"    startTime: {json.dumps(ev['start'], ensure_ascii=False)},")
        lines.append(f"    endTime: {json.dumps(ev['end'], ensure_ascii=False)},")
        lines.append(f"    location: {json.dumps(ev['location'], ensure_ascii=False)},")
        lines.append(f"    maxCapacity: 30,")
        lines.append("  }," if i < len(all_events)-1 else "  },")

    lines.append("];")

    out_dir = os.path.join(BASE_DIR, 'src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'sessions.ts')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f"저장 완료: {out_path}")
    print(f"총 {len(all_events)}개 세션 저장됨")

if __name__ == '__main__':
    main()
