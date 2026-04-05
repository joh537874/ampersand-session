변경된 파일들을 분석해서 적절한 커밋 메시지를 작성하고, GitHub에 push까지 완료해줘.

## 절차

1. `git status`로 변경된 파일 확인
2. `git diff`로 변경 내용 파악
3. 변경 내용을 분석해서 한국어로 커밋 메시지 작성
   - 형식: `[타입] 요약 (상세 내용이 있으면 body에)`
   - 타입: feat(기능), fix(버그), style(UI), refactor(리팩터), chore(설정)
4. `git add -A`로 전체 스테이징
5. `git commit`으로 커밋
6. `git push origin main`으로 푸시
   - remote가 없으면 먼저 `git remote add origin https://github.com/joh537874/ampersand-session.git` 실행

push 완료 후 커밋 메시지와 GitHub URL을 출력해줘.
