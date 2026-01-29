# 🚀 MONKi Biz - 완전 초보자용 Cloudflare 배포 가이드

> **중요**: 이 가이드는 코딩을 전혀 모르는 분도 따라할 수 있도록 **모든 단계를 스크린샷처럼** 설명합니다.

---

## 📌 현재 상황 요약

### ✅ 완료된 것:
1. ✅ 프로젝트 코드 작성 완료
2. ✅ GitHub 업로드 완료 (https://github.com/mk-jeon/monki-biz)
3. ✅ Cloudflare Pages 프로젝트 생성 완료

### ❌ 해결해야 할 것:
1. ❌ **Cloudflare Access 끄기** (가장 중요!)
2. ❌ GitHub 자동 배포 설정
3. ❌ 도메인 연결

---

## 🔴 문제 1: 404 오류 (가장 긴급!)

### 원인:
Cloudflare Pages에 **Cloudflare Access**(접근 제한)가 켜져 있습니다.

### 증상:
- 로그인 페이지는 보임
- 상담현황, 계약현황 등 다른 페이지는 404 오류

### 해결 방법:

#### 단계 1: Cloudflare 대시보드 접속
```
1. 브라우저 열기
2. 주소창에 입력: https://dash.cloudflare.com
3. Enter 키
4. 로그인
```

#### 단계 2: Workers & Pages 메뉴 찾기
```
1. 화면 왼쪽에 세로 메뉴바가 있습니다
2. "Workers & Pages" 라는 메뉴를 찾아서 클릭
   (아이콘: 육각형 모양)
```

#### 단계 3: monki-biz 프로젝트 선택
```
1. 화면 중앙에 프로젝트 목록이 보입니다
2. "monki-biz" 라는 이름을 찾습니다
   - 2개가 보일 수 있습니다
   - "No Git connection" 또는 "No active routes" 라고 적힌 것 클릭
3. 프로젝트 상세 페이지가 열립니다
```

#### 단계 4: Settings 탭 클릭
```
1. 화면 위쪽에 탭 메뉴가 있습니다:
   Overview | Settings | Logs | ...
2. "Settings" 클릭
```

#### 단계 5: Access 설정 찾기
```
1. 화면 왼쪽에 사이드바가 있습니다:
   General | Environment variables | Builds & deployments | ...
2. 아래로 스크롤하면서 다음 중 하나를 찾습니다:
   - "Access"
   - "Security"
   - "Access Policy"
3. 클릭
```

#### 단계 6: Cloudflare Access 끄기
```
1. "Enable Cloudflare Access" 라는 토글(스위치) 찾기
2. 토글이 파란색(ON)이면 클릭해서 회색(OFF)으로 변경
3. 화면 아래 "Save" 또는 "Update" 버튼 클릭
4. 확인 팝업이 나오면 "Confirm" 클릭
```

#### 단계 7: 테스트
```
1. 5분 기다림 (Cloudflare가 설정을 적용하는 시간)
2. 새 탭 열기
3. 주소창에 입력:
   https://0abecf84.project-4742f5a6.pages.dev/consultations.html
4. Enter 키
5. 상담현황 페이지가 보이면 성공! 🎉
```

---

## 🟢 문제 2: GitHub 자동 배포 설정

### 왜 필요한가요?
- **현재**: 코드 수정 후 명령어를 직접 실행해야 배포됨
- **자동 배포**: GitHub에 코드만 올리면 자동으로 배포됨

### 장점:
- ✅ 편리함: 명령어 입력 불필요
- ✅ 안전함: Cloudflare가 자동으로 처리
- ✅ 빠름: 코드 푸시 후 5~10분이면 배포 완료

---

### 방법 A: 기존 프로젝트 삭제 후 새로 만들기 (추천 ⭐⭐⭐)

#### 단계 1: 기존 수동 배포 프로젝트 삭제
```
1. Workers & Pages 메뉴 클릭
2. "monki-biz" 프로젝트 목록에서:
   - "No Git connection" 라고 적힌 것 찾기
3. 프로젝트명 오른쪽에 "..." (점 3개) 메뉴 클릭
4. "Delete project" 선택
5. 확인 팝업에서 프로젝트 이름 입력: monki-biz
6. "Delete" 버튼 클릭
```

#### 단계 2: GitHub 연결된 새 프로젝트 만들기
```
1. Workers & Pages 페이지에서 "Create application" 버튼 클릭
2. "Pages" 탭 선택
3. "Connect to Git" 버튼 클릭
4. "GitHub" 선택
5. "Authorize Cloudflare Pages" 클릭
6. GitHub 비밀번호 입력
7. "Install & Authorize" 클릭
```

#### 단계 3: 저장소 선택
```
1. 저장소 목록에서 "mk-jeon/monki-biz" 찾기
   (검색창에 "monki" 입력하면 쉽게 찾을 수 있습니다)
2. 클릭
3. "Begin setup" 버튼 클릭
```

#### 단계 4: 빌드 설정
```
다음 내용을 정확히 입력:

Project name: monki-biz

Production branch: main

Framework preset: None

Build command: npm run build

Build output directory: dist

Root directory: /
```

#### 단계 5: 환경 변수 추가 (중요!)
```
1. "Environment variables" 섹션 찾기
2. "Add variable" 버튼 클릭
3. 입력:
   Variable name: NODE_VERSION
   Value: 18
4. "Add variable" 버튼 클릭 (한 번 더)
5. 입력:
   Variable name: NPM_VERSION
   Value: 10
```

#### 단계 6: 데이터베이스 바인딩 추가
```
1. "Bindings" 섹션 찾기
2. "Add binding" 버튼 클릭
3. Type 선택: D1 database
4. Variable name: DB
5. D1 database 선택: monki-biz-production
6. "Add binding" 버튼 클릭
```

#### 단계 7: 배포 시작
```
1. "Save and Deploy" 버튼 클릭
2. 10~15분 기다림 (커피 한 잔 ☕)
3. 빌드 로그를 보면서 진행 상황 확인
4. "Success!" 메시지가 나오면 완료!
```

#### 단계 8: 테스트
```
1. 배포 완료 후 표시되는 URL 클릭
   (예: https://abc123.monki-biz.pages.dev)
2. 로그인 페이지가 보이면 성공!
3. 로그인:
   - 아이디: minhiti88
   - 비밀번호: Axieslin12!
4. 대시보드에서 "상담현황" 클릭
5. 상담현황 페이지가 보이면 완벽! 🎉
```

---

### 방법 B: 기존 프로젝트에 GitHub 연결 (고급)

> 주의: 이 방법은 복잡하므로 방법 A를 추천합니다.

```
1. Workers & Pages → monki-biz 프로젝트 클릭
2. Settings → Builds & deployments
3. "Connect to Git" 버튼 찾기
4. 없으면 방법 A 사용 (프로젝트 재생성)
```

---

## 🌐 문제 3: 도메인 연결

### 현재 URL:
```
https://0abecf84.project-4742f5a6.pages.dev
```
- 길고 복잡함 😵
- 외우기 어려움

### 원하는 URL:
```
https://monkibiz.op.com
```
- 짧고 간단함 ✅
- 전문적으로 보임 ✅

---

### 🔵 단계 1: 도메인 구입 확인

#### 질문: monkibiz.op.com 도메인을 이미 가지고 계신가요?

**YES라면:**
- ✅ 추가 비용 없음
- ✅ DNS 전송만 하면 됨 (무료)

**NO라면:**
- 💰 도메인 구입 필요 ($10~15/년)
- 추천 등록업체:
  - GoDaddy (www.godaddy.com)
  - Namecheap (www.namecheap.com)
  - 가비아 (www.gabia.com) - 한국
  - 후이즈 (www.whois.co.kr) - 한국

---

### 🔵 단계 2: DNS 전송 (도메인이 있는 경우)

#### 무료인가요?
- ✅ **완전 무료**
- DNS 전송 = 도메인 관리를 Cloudflare로 옮기는 것
- 도메인 소유권은 그대로 유지됨

#### 왜 DNS 전송을 해야 하나요?
- ✅ 더 빠른 속도
- ✅ 무료 SSL (HTTPS)
- ✅ DDoS 보호
- ✅ CDN 자동 적용
- ✅ 쉬운 관리

---

#### DNS 전송 방법:

##### 2-1) Cloudflare에서 도메인 추가
```
1. Cloudflare 대시보드 → 왼쪽 메뉴 "Websites" 클릭
2. "Add a site" 버튼 클릭
3. 도메인 입력: monkibiz.op.com
4. "Add site" 버튼 클릭
5. 플랜 선택: "Free" 선택
6. "Continue" 버튼 클릭
```

##### 2-2) DNS 레코드 스캔
```
1. Cloudflare가 자동으로 기존 DNS 레코드를 스캔합니다
2. 약 30초~1분 소요
3. 스캔 완료 후 "Continue" 버튼 클릭
```

##### 2-3) Cloudflare 네임서버 확인
```
1. 화면에 네임서버 2개가 표시됩니다:
   
   예시:
   bella.ns.cloudflare.com
   carter.ns.cloudflare.com
   
2. 이 2개를 메모장에 복사 📝
```

##### 2-4) 도메인 등록업체에서 네임서버 변경

**GoDaddy의 경우:**
```
1. godaddy.com 로그인
2. "My Products" 클릭
3. "Domains" 섹션에서 monkibiz.op.com 찾기
4. "DNS" 또는 "Manage DNS" 클릭
5. "Nameservers" 섹션 찾기
6. "Change" 버튼 클릭
7. "I'll use my own nameservers" 선택
8. Cloudflare 네임서버 2개 입력:
   - bella.ns.cloudflare.com
   - carter.ns.cloudflare.com
9. "Save" 버튼 클릭
```

**가비아의 경우:**
```
1. gabia.com 로그인
2. "My가비아" 클릭
3. "도메인" 메뉴
4. monkibiz.op.com 선택
5. "관리" 버튼 클릭
6. "네임서버 설정" 클릭
7. "네임서버 직접 입력" 선택
8. Cloudflare 네임서버 2개 입력:
   - 1차: bella.ns.cloudflare.com
   - 2차: carter.ns.cloudflare.com
9. "확인" 버튼 클릭
```

##### 2-5) 대기 ⏰
```
1. 24~48시간 기다림 (보통 2~6시간 내 완료)
2. Cloudflare가 이메일로 완료 알림 전송
3. Cloudflare 대시보드에서 "Active" 상태 확인
```

---

### 🔵 단계 3: Cloudflare Pages에 도메인 연결

#### DNS 전송이 완료된 후:

##### 3-1) Pages 프로젝트 설정
```
1. Workers & Pages → monki-biz 클릭
2. "Custom domains" 탭 클릭
3. "Set up a custom domain" 버튼 클릭
```

##### 3-2) 도메인 입력
```
1. 입력: monkibiz.op.com
2. "Continue" 버튼 클릭
3. Cloudflare가 자동으로 DNS 레코드 추가
4. "Activate domain" 버튼 클릭
```

##### 3-3) SSL 인증서 발급 대기
```
1. 약 5~10분 소요
2. 상태가 "Active" 로 변경되면 완료
```

##### 3-4) 테스트
```
1. 브라우저 열기
2. 주소창에 입력: https://monkibiz.op.com
3. 로그인 페이지가 보이면 성공! 🎉
```

---

## 🤖 문제 4: AI 크롤러 차단 설정

### 첨부5 화면 설명:
Cloudflare가 AI 봇(ChatGPT, Claude, Google Bard 등)의 데이터 수집을 차단할지 묻는 설정입니다.

### 선택 가이드:

#### 옵션 1: 차단함 (추천 ⭐)
- ✅ 비즈니스 데이터 보호
- ✅ 고객 정보 유출 방지
- ✅ 경쟁사가 AI로 데이터 수집 못함

**추천 대상:**
- 비즈니스 관리 시스템
- 고객 데이터 시스템
- 내부 관리 도구

#### 옵션 2: 허용함
- ✅ SEO(검색 최적화) 향상
- ✅ AI 검색 결과에 노출

**추천 대상:**
- 블로그
- 포트폴리오
- 마케팅 사이트

### 설정 방법:
```
1. Cloudflare 대시보드 → Websites → monkibiz.op.com
2. "Security" 메뉴 클릭
3. "Bots" 섹션 찾기
4. "AI Crawlers" 설정
5. "Block AI crawlers" 토글:
   - ON: 차단 (추천)
   - OFF: 허용
6. "Save" 버튼 클릭
```

---

## 💰 비용 정리 (최종)

| 항목 | 월 비용 | 연 비용 | 설명 |
|------|---------|---------|------|
| **Cloudflare Pages** | **무료** | **무료** | 호스팅 |
| **D1 데이터베이스** | **무료** | **무료** | 500MB까지 |
| **SSL 인증서** | **무료** | **무료** | 자동 HTTPS |
| **DDoS 보호** | **무료** | **무료** | 자동 보안 |
| **DNS 서비스** | **무료** | **무료** | 무제한 |
| **DNS 전송** | **무료** | **무료** | 1회 설정 |
| **트래픽** | **무료** | **무료** | 무제한 |
| **도메인 등록** | | **$10~15** | 도메인 구입 시 |
| **총 운영 비용** | **$0** | **$10~15** | 도메인만 유료 |

### 요약:
- 도메인이 **있으면**: 완전 무료 ✅
- 도메인이 **없으면**: 연 $10~15 💰

---

## 🎯 체크리스트

### 필수 작업:
- [ ] Cloudflare Access 끄기 (404 오류 해결)
- [ ] GitHub 자동 배포 설정
- [ ] 로그인 테스트 (minhiti88 / Axieslin12!)
- [ ] 모든 페이지 접속 테스트

### 선택 작업:
- [ ] DNS 전송 (도메인이 있는 경우)
- [ ] 커스텀 도메인 연결
- [ ] AI 크롤러 차단 설정

---

## 📞 도움 요청

### 막히는 부분이 있으면:

1. **스크린샷 찍기**:
   - Windows: Win + Shift + S
   - Mac: Cmd + Shift + 4

2. **어디서 막혔는지 알려주기**:
   - "단계 X에서 막혔어요"
   - "이 화면이 안 보여요"
   - "이 버튼을 찾을 수 없어요"

3. **제가 직접 실행**:
   - 명령어가 어렵다면
   - 제가 대신 실행해드립니다

---

## 🚀 현재 접속 가능한 URL

### 로컬 개발 (샌드박스):
```
https://3000-i18dape7j958kk047f6g6-82b888ba.sandbox.novita.ai
```
- ✅ 정상 작동
- ✅ 모든 페이지 접속 가능

### Cloudflare Pages (실서비스):
```
https://e9219fe7.project-4742f5a6.pages.dev
```
- ⚠️ Cloudflare Access 켜짐
- ❌ HTML 페이지 404 오류
- 👉 **Access를 끄면 해결됨!**

### GitHub:
```
https://github.com/mk-jeon/monki-biz
```
- ✅ 코드 업로드 완료
- ✅ 11개 커밋

---

## 📚 관련 문서

- [BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md) - 기본 가이드
- [README.md](./README.md) - 개발자용 기술 문서
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 배포 가이드

---

**작성일**: 2026-01-29  
**최종 업데이트**: 2026-01-29 02:00 (KST)  
**작성자**: AI Assistant
