---
name: release
description: alcoholic 앱의 버전을 정하고 올리는 방법과 "Release X.Y.Z" PR · 서명 태그 · GitHub Release 발행 절차. 버전 번호를 정하거나 마일스톤을 마무리하고 릴리스할 때 사용.
---

# 버전 · 릴리스

- **메이저**: 기존 사용자가 무언가 해야 할 때(다시 로그인 · 데이터 이전 등). **마이너**: 새 기능이나 보이는 변경. **패치**: 수정만.
- 버전은 `app.config.js`의 `version`(Android는 `versionCode`도 올림) · `package.json` · `package-lock.json`(`npm version X --no-git-tag-version`)에 있음.
- 마일스톤의 이슈가 끝나면 "Release X.Y.Z" PR(버전 올리기 + 본문에 릴리스 노트 초안)을 만듦. 머지 후 머지 커밋에 서명 태그 `git tag -s vX.Y.Z`를 붙이고, 사용자에게 확인받고 GitHub Release를 발행함. 그다음 마일스톤을 닫음.
- 스토어(Google Play)에 빌드를 올리는 건 사용자가 함.
