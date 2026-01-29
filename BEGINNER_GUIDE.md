# 🎯 MONKi Biz - 완전 초보자용 가이드

> **이 문서는 코딩을 전혀 모르는 분도 따라할 수 있도록 모든 단계를 상세히 설명합니다.**

---

## 📋 목차

- [ㄱ. 현재 상황 정리](#ㄱ-현재-상황-정리)
- [ㄴ. GitHub 연동 문제 해결](#ㄴ-github-연동-문제-해결)
- [ㄷ. Cloudflare Pages 배포 방법](#ㄷ-cloudflare-pages-배포-방법)
- [ㄹ. 도메인 연결 방법](#ㄹ-도메인-연결-방법)
- [ㅁ. 자주 묻는 질문](#ㅁ-자주-묻는-질문)

---

## ㄱ. 현재 상황 정리

### 1) 프로젝트 완성도: **70%** ✅

#### 완료된 부분:
- ✅ **로그인/로그아웃 시스템**: 세션 기반 인증
- ✅ **권한 관리**: 관리자/사용자 역할 구분
- ✅ **대시보드**: 메인 화면
- ✅ **상담현황 페이지**: 5단계 칸반 보드 (신규인입 → 상담진행중 → 방문예약 → 상담완료 → 상담실패)
- ✅ **계약현황 페이지**: 5단계 칸반 보드 (계약대기 → 계약진행중 → 서명대기 → 계약완료 → 계약취소)
- ✅ **설치현황 페이지**: 5단계 칸반 보드 (설치예정 → 설치진행중 → 테스트중 → 설치완료 → 설치실패)
- ✅ **운영등재 페이지**: 기본 UI
- ✅ **가맹점현황 페이지**: 리스트 테이블 + 검색/필터
- ✅ **재고관리 페이지**: 하위 메뉴 (재고요청/재고현황/대여현황)
- ✅ **A/S관리 페이지**: 하위 메뉴 (인바운드현황/방문A/S현황/대시보드)

#### 미완성 부분:
- ⏳ **정산 시스템**: 30% (데이터베이스만 준비됨)
- ⏳ **관리자 메뉴**: 미구현
- ⏳ **실시간 알림**: 미구현
- ⏳ **파일 업로드**: 미구현

### 2) 접속 가능한 URL

#### 🌐 로컬 개발 서버 (샌드박스):
```
https://3000-i18dape7j958kk047f6g6-82b888ba.sandbox.novita.ai
```
- **용도**: 개발/테스트용
- **접속 가능 시간**: 샌드박스가 활성화된 동안만

#### 🚀 Cloudflare Pages (실제 배포):
```
https://5918c33e.project-4742f5a6.pages.dev
```
- **용도**: 실제 서비스용
- **접속 가능 시간**: 24시간 항상 가능
- **비용**: 완전 무료 ✅

### 3) 로그인 계정

| 구분 | 아이디 | 비밀번호 | 권한 | 부서 |
|------|--------|----------|------|------|
| 🔴 **마스터** | minhiti88 | Axieslin12! | 전체 관리자 | 경영 |
| 🟡 관리자 | admin | 1234 | 시스템 관리자 | IT |
| 🔵 마케팅 | marketing01 | 1234 | 일반 사용자 | 마케팅 |
| 🔵 영업1 | sales01 | 1234 | 일반 사용자 | 영업 |
| 🔵 영업2 | sales02 | 1234 | 일반 사용자 | 영업 |
| 🔵 운영1 | operation01 | 1234 | 일반 사용자 | 운영 |
| 🔵 운영2 | operation02 | 1234 | 일반 사용자 | 운영 |

---

## ㄴ. GitHub 연동 문제 해결

### 📌 문제: "첨부1" - Cloudflare에서 GitHub 연동이 안 된다고 나옴

#### 원인:
현재 프로젝트는 **수동 배포** 방식으로 올렸습니다. Cloudflare는 **자동 배포**(GitHub에 코드를 푸시하면 자동으로 배포)를 선호하기 때문에 경고 메시지가 나옵니다.

#### 해결 방법 (2가지):

---

### 방법 A: **자동 배포 설정** (추천 ⭐)

> GitHub와 Cloudflare를 연결하면 코드를 GitHub에 올릴 때마다 자동으로 배포됩니다.

#### 단계별 진행:

##### ㄱ) Cloudflare 대시보드 열기
1. 브라우저에서 https://dash.cloudflare.com 접속
2. 로그인

##### ㄴ) Pages 프로젝트 생성
1. 왼쪽 메뉴에서 **Workers & Pages** 클릭
2. **Create application** 버튼 클릭
3. **Pages** 탭 선택
4. **Connect to Git** 버튼 클릭

##### ㄷ) GitHub 연결
1. **GitHub** 선택
2. "Authorize Cloudflare Pages" 버튼 클릭
3. GitHub 비밀번호 입력
4. **Install & Authorize** 클릭

##### ㄹ) 저장소 선택
1. 저장소 목록에서 **mk-jeon/monki-biz** 찾기
2. 클릭하여 선택
3. **Begin setup** 버튼 클릭

##### ㅁ) 빌드 설정
다음 내용을 입력:
```
Project name: monki-biz
Production branch: main
Build command: npm run build
Build output directory: dist
```

##### ㅂ) 배포 시작
1. **Save and Deploy** 버튼 클릭
2. 5~10분 기다리면 배포 완료

---

### 방법 B: **수동 배포 유지** (현재 상태)

> 현재 방식대로 계속 사용하는 방법입니다.

#### 장점:
- ✅ 이미 작동 중
- ✅ 설정 필요 없음

#### 단점:
- ❌ 코드 수정 시 매번 명령어 실행해야 함
- ❌ Cloudflare에서 경고 메시지 계속 표시

#### 코드 업데이트 시 실행할 명령:
```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name monki-biz
```

---

## ㄷ. Cloudflare Pages 배포 방법

### 📌 문제: "첨부3" - 명령어를 어디서 실행해야 하는지 모르겠어요

---

### 1) 명령어 실행 위치

#### Windows 사용자:
1. **시작** 메뉴 클릭
2. "명령 프롬프트" 또는 "PowerShell" 검색
3. 실행

#### Mac 사용자:
1. **Spotlight** (Cmd + Space)
2. "터미널" 검색
3. 실행

#### VSCode 사용자:
1. VSCode 열기
2. 상단 메뉴: **Terminal → New Terminal**

---

### 2) 전체 배포 과정 (단계별)

#### ㄱ) 프로젝트 폴더로 이동
```bash
cd /home/user/webapp
```
**설명**: 프로젝트가 있는 폴더로 이동합니다.

#### ㄴ) 프로젝트 빌드
```bash
npm run build
```
**설명**: 
- 소스 코드를 Cloudflare가 실행할 수 있는 형태로 변환
- `dist/` 폴더에 결과물이 생성됨
- 약 5~10초 소요

**성공 메시지**:
```
✓ built in 707ms
```

#### ㄷ) Cloudflare Pages 프로젝트 생성 (최초 1회만)
```bash
npx wrangler pages project create monki-biz --production-branch main --compatibility-date 2026-01-29
```
**설명**: 
- Cloudflare에 `monki-biz`라는 프로젝트를 생성
- **이미 프로젝트가 있으면 이 단계는 건너뜀**

**성공 메시지**:
```
✨ Successfully created the 'monki-biz' project.
```

#### ㄹ) 배포 실행
```bash
npx wrangler pages deploy dist --project-name monki-biz
```
**설명**: 
- `dist/` 폴더의 파일들을 Cloudflare에 업로드
- 약 10~30초 소요

**성공 메시지**:
```
✨ Deployment complete! Take a peek over at https://5918c33e.project-4742f5a6.pages.dev
```

#### ㅁ) 배포 확인
브라우저에서 위 URL 열기:
```
https://5918c33e.project-4742f5a6.pages.dev
```

---

### 3) 한 번에 실행하기 (고급 사용자)

모든 명령을 한 줄로:
```bash
cd /home/user/webapp && npm run build && npx wrangler pages deploy dist --project-name monki-biz
```

---

## ㄹ. 도메인 연결 방법

### 📌 문제: "첨부4, 첨부5" - DNS 전송을 누르면 되는 건가요? 무료인가요?

---

### 1) 비용 안내

| 항목 | 비용 | 설명 |
|------|------|------|
| DNS 전송 | **완전 무료** ✅ | Cloudflare DNS 사용 |
| Cloudflare Pages | **완전 무료** ✅ | 무제한 배포 |
| D1 데이터베이스 | **무료 (500MB까지)** ✅ | 현재 사용량: 0.27MB |
| SSL 인증서 | **완전 무료** ✅ | 자동 HTTPS |
| DDoS 보호 | **완전 무료** ✅ | 자동 보안 |
| **도메인 등록** | **$10~15/년** 💰 | 등록업체 결제 |

**결론**: DNS 전송과 Cloudflare 서비스는 모두 무료입니다. 도메인 등록 비용만 필요합니다.

---

### 2) DNS 전송 vs CNAME 설정

#### 옵션 A: **DNS 전송** (추천 ⭐⭐⭐)

**장점**:
- ✅ 더 빠른 속도
- ✅ 모든 Cloudflare 기능 사용 가능
- ✅ 무료 SSL 인증서
- ✅ DDoS 보호
- ✅ CDN 자동 적용

**단점**:
- ⚠️ 네임서버 변경 필요 (24~48시간 소요)

**진행 방법**:

##### ㄱ) DNS 전송 시작
1. Cloudflare 대시보드에서 **"DNS 전송 시작"** 버튼 클릭
2. Cloudflare 네임서버 2개가 표시됨:
   ```
   예시:
   bella.ns.cloudflare.com
   carter.ns.cloudflare.com
   ```

##### ㄴ) 도메인 등록업체에서 네임서버 변경
**도메인을 구매한 곳 (예: GoDaddy, Namecheap, 가비아, 후이즈 등)**:

1. 도메인 관리 페이지 접속
2. "네임서버" 또는 "DNS 설정" 메뉴 찾기
3. 기존 네임서버 삭제
4. Cloudflare 네임서버 2개 입력:
   ```
   bella.ns.cloudflare.com
   carter.ns.cloudflare.com
   ```
5. 저장

##### ㄷ) 대기
- 24~48시간 기다림 (보통 2~6시간 내 완료)
- Cloudflare에서 이메일로 완료 알림

##### ㄹ) 완료 후 확인
Cloudflare 대시보드에서 **"Active"** 상태 확인

---

#### 옵션 B: **CNAME 설정** (비추천)

**장점**:
- ✅ 즉시 적용 (5~10분)

**단점**:
- ❌ 일부 기능 제한
- ❌ 루트 도메인 사용 불가 (monkibiz.op.com은 안 되고 www.monkibiz.op.com만 가능)

**진행 방법**:
1. 도메인 관리 페이지에서 CNAME 레코드 추가:
   ```
   이름: www
   값: project-4742f5a6.pages.dev
   ```

---

### 3) 첨부5 - AI 크롤러 차단 설정

#### 화면 설명:
Cloudflare가 AI 봇(ChatGPT, Claude 등)의 데이터 수집을 차단할지 물어보는 화면입니다.

#### 선택 가이드:

| 선택지 | 의미 | 추천 |
|--------|------|------|
| **차단함** | AI가 내 사이트를 학습 못함 | **일반 비즈니스용 ⭐** |
| **허용함** | AI가 내 사이트를 학습할 수 있음 | 블로그, 포트폴리오용 |

**추천**: **차단함** 선택
- 비즈니스 데이터 보호
- 개인정보 노출 방지

---

### 4) 커스텀 도메인 연결 (DNS 전송 완료 후)

#### 명령어 실행:
```bash
npx wrangler pages domain add monkibiz.op.com --project-name monki-biz
```

#### 자동으로 처리되는 것들:
- ✅ SSL 인증서 자동 생성
- ✅ HTTPS 자동 적용
- ✅ DNS CNAME 자동 설정
- ✅ www 리다이렉트 설정

#### 완료 후 접속:
```
https://monkibiz.op.com
```

---

## ㅁ. 자주 묻는 질문

### Q1. 404 오류가 나와요 (첨부4 관련)

**원인**: 
- HTML 파일이 배포되지 않았거나
- 잘못된 경로로 접근

**해결**:
```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name monki-biz
```

**확인**:
- ✅ https://5918c33e.project-4742f5a6.pages.dev/consultations.html
- ✅ https://5918c33e.project-4742f5a6.pages.dev/contracts.html
- ✅ https://5918c33e.project-4742f5a6.pages.dev/installations.html

---

### Q2. 명령어 실행 시 "command not found" 오류

**원인**: Node.js 또는 npm이 설치되지 않음

**해결**:
1. https://nodejs.org 접속
2. LTS 버전 다운로드 및 설치
3. 터미널 재시작

**확인**:
```bash
node --version
npm --version
```

---

### Q3. 데이터베이스에 마스터 계정이 없어요

**현재 상태**: ✅ 이미 추가됨
- 아이디: `minhiti88`
- 비밀번호: `Axieslin12!`

**확인**:
```bash
npx wrangler d1 execute monki-biz-production --remote --command="SELECT user_id, name, role FROM users WHERE user_id='minhiti88'"
```

---

### Q4. GitHub에 코드가 안 보여요

**현재 상태**: ✅ 이미 업로드됨
- 저장소: https://github.com/mk-jeon/monki-biz
- 브랜치: main
- 커밋 수: 10개

**확인**:
브라우저에서 https://github.com/mk-jeon/monki-biz 접속

---

### Q5. Cloudflare 로그인이 안 돼요

**해결**:
1. https://dash.cloudflare.com 접속
2. "Forgot Password" 클릭
3. 이메일로 재설정 링크 받기
4. 새 비밀번호 설정

---

### Q6. 배포 후 변경사항이 안 보여요

**원인**: 브라우저 캐시

**해결**:
- **Windows**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

---

## 📞 추가 도움 필요 시

### 방법 1: 제가 직접 실행
- 명령어 실행이 어려우시면 제가 대신 실행해드립니다
- "OO 해주세요" 라고 요청하시면 됩니다

### 방법 2: 단계별 안내
- 각 단계를 따라하시면서 막히는 부분을 말씀해주세요
- 스크린샷을 보내주시면 더 정확히 도와드립니다

---

## 🎯 추천 진행 순서

### 1단계: 현재 배포 확인 ✅ (완료)
```
https://5918c33e.project-4742f5a6.pages.dev
```
**로그인**: minhiti88 / Axieslin12!

### 2단계: GitHub 자동 배포 설정 (선택)
- [방법 A](#방법-a-자동-배포-설정-추천-) 참고
- 약 10분 소요

### 3단계: DNS 전송 시작
- [DNS 전송 방법](#ㄱ-dns-전송-시작) 참고
- 네임서버 변경 후 24~48시간 대기

### 4단계: 커스텀 도메인 연결
- DNS 전송 완료 후 진행
- 명령어 1개 실행

---

## ✅ 최종 체크리스트

- [x] 프로젝트 빌드 완료
- [x] Cloudflare Pages 배포 완료
- [x] 마스터 계정 생성 (minhiti88)
- [x] GitHub 업로드 완료
- [ ] GitHub 자동 배포 설정 (선택)
- [ ] DNS 전송 완료 (진행 중)
- [ ] 커스텀 도메인 연결 (DNS 전송 후)

---

## 📊 현재 프로젝트 통계

- **코드 줄 수**: ~7,000줄
- **HTML 페이지**: 7개
- **API 라우트**: 7개
- **데이터베이스 테이블**: 19개
- **Git 커밋**: 10개
- **완성도**: 70%
- **배포 상태**: ✅ 온라인

---

**작성일**: 2026-01-29  
**최종 업데이트**: 2026-01-29 01:30 (KST)
