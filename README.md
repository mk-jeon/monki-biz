# MONKi Biz - 통합 업무 관리 시스템

## 프로젝트 개요

**MONKi Biz**는 먼슬리키친 사업운영본부를 위한 통합 업무 관리 시스템입니다.

### 주요 기능

✅ **완료된 기능**
- ✅ 로그인/로그아웃 인증 시스템
- ✅ 사용자 세션 관리
- ✅ 권한 기반 접근 제어
- ✅ 반응형 대시보드 UI
- ✅ 사이드바 네비게이션
- ✅ 데이터베이스 스키마 (D1) - 19개 테이블
- ✅ 초기 데이터 시딩
- ✅ 상담현황 칸반보드 페이지 (CRUD, 드래그앤드롭, 상세보기/수정/삭제)
- ✅ 계약현황 칸반보드 페이지 (API, 드래그앤드롭, 상태 변경)
- ✅ 설치현황 칸반보드 페이지
- ✅ 운영등재 페이지
- ✅ 가맹점현황 리스트 페이지
- ✅ 재고관리 페이지 (재고요청/재고현황/대여현황 하위 메뉴)
- ✅ A/S 관리 페이지 (인바운드/방문A/S/대시보드 하위 메뉴)
- ✅ 모든 API 라우트 연결 (auth, consultations, contracts, installations, franchises)

📋 **예정된 기능**
- 📋 정산 시스템 (CMS/CRM/Ai매출업 정산) - 완전 미구현
- 📋 관리자 시스템 메뉴 (사용자/페이지/로케이션/아이템 관리) - 미구현
- 📋 실시간 알림 시스템
- 📋 드래그앤드롭 칸반보드 (세부 기능 보완)
- 📋 각 페이지 상세 모달 및 CRUD 기능 보완

## URLs

### 개발 환경
- **로컬**: http://localhost:3000
- **공개 URL**: https://3000-i18dape7j958kk047f6g6-82b888ba.sandbox.novita.ai

### 프로덕션 배포
- **배포 가능**: ✅ 예 (Cloudflare Pages)
- **배포 방법**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 참고

### 기본 계정
- **아이디**: `admin`
- **비밀번호**: `1234`

### 추가 테스트 계정
| 아이디 | 비밀번호 | 부서 | 역할 |
|--------|----------|------|------|
| marketing01 | 1234 | 마케팅 | 사용자 |
| sales01 | 1234 | 영업 | 사용자 |
| sales02 | 1234 | 영업 | 사용자 |
| operation01 | 1234 | 운영 | 사용자 |
| operation02 | 1234 | 운영 | 사용자 |

## 🌐 배포 방법

### Cloudflare Pages 배포 (무료)

**비용**: **완전 무료** (월 10만 요청, 500MB DB 포함)

```bash
# 1. 계정 생성 및 로그인
npx wrangler login

# 2. 프로덕션 DB 생성
npx wrangler d1 create monki-biz-production

# 3. wrangler.jsonc에 database_id 업데이트

# 4. 마이그레이션 및 시딩
npx wrangler d1 migrations apply monki-biz-production --remote
npx wrangler d1 execute monki-biz-production --remote --file=./seed.sql

# 5. 프로젝트 생성
npx wrangler pages project create monki-biz --production-branch main

# 6. 빌드 및 배포
npm run build
npx wrangler pages deploy dist --project-name monki-biz

# 완료! 🎉
# URL: https://monki-biz.pages.dev
```

**상세 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 데이터 아키텍처

### 데이터 모델

#### 핵심 업무 프로세스
```
고객(customers)
  ↓
상담(consultations) → 계약(contracts) → 설치(installations) → 가맹점(franchises)
```

#### 주요 테이블 (19개)
1. **users** - 사용자 계정 및 권한
2. **permissions** - 권한 관리
3. **customers** - 고객 정보 (전체 프로세스 추적)
4. **consultations** - 상담 내역
5. **contracts** - 계약 정보
6. **installations** - 설치 내역
7. **franchises** - 가맹점 현황
8. **inbound_requests** - 인바운드 A/S 문의
9. **as_requests** - A/S 처리 현황
10. **stock_inventory** - 재고 현황
11. **stock_requests** - 재고 요청
12. **stock_transactions** - 재고 이동 내역
13. **locations** - 로케이션 관리
14. **items** - 아이템 관리
15. **item_categories** - 아이템 카테고리
16. **company_info** - 회사 정보
17. **notifications** - 알림
18. **activity_logs** - 활동 로그
19. **기타 지원 테이블**

### 스토리지 서비스
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스 (메인 데이터)
- **로컬 개발**: `.wrangler/state/v3/d1` 자동 생성

### 데이터 흐름
```
마케팅(신규 인입) 
  → 영업(상담) 
    → 운영(계약) 
      → 운영(설치) 
        → 운영(등재) 
          → 가맹점 현황
```

## 사용자 가이드

### 로그인
1. 메인 페이지에 접속
2. 아이디와 비밀번호 입력
3. 로그인 버튼 클릭

### 대시보드
- 좌측 사이드바에서 메뉴 선택
- 상단 헤더에서 알림 확인
- 새로고침 버튼으로 최신 정보 갱신

### 권한 관리
- 관리자(`admin` 역할): 모든 페이지 접근 가능
- 일반 사용자: 할당된 권한에 따라 페이지 접근

## 배포 정보

### 플랫폼
- **환경**: Cloudflare Pages + Workers
- **상태**: 🟢 개발 중 (로컬) / 배포 가능
- **프로덕션 배포**: Cloudflare Pages (무료)

### 기술 스택
- **Backend**: Hono (TypeScript)
- **Frontend**: HTML + Tailwind CSS + Vanilla JavaScript
- **Database**: Cloudflare D1 (SQLite)
- **Build Tool**: Vite
- **Process Manager**: PM2 (개발 환경)

### 마지막 업데이트
- **날짜**: 2026-01-29
- **버전**: v1.0.0-beta
- **진행률**: 약 70% 완료 (핵심 페이지 모두 완성)

## 개발 가이드

### 환경 설정

```bash
# 의존성 설치
npm install

# 로컬 DB 초기화
npm run db:migrate:local
npm run db:seed

# 개발 서버 시작
npm run build
pm2 start ecosystem.config.cjs

# PM2 상태 확인
pm2 list
pm2 logs monki-biz --nostream
```

### 스크립트 명령어

```bash
npm run dev              # Vite 개발 서버
npm run build            # 프로젝트 빌드
npm run dev:d1           # D1과 함께 개발 서버 실행
npm run db:migrate:local # 로컬 DB 마이그레이션
npm run db:seed          # 초기 데이터 삽입
npm run db:reset         # DB 초기화 (삭제 후 재생성)
npm run clean-port       # 3000 포트 정리
npm run deploy           # Cloudflare Pages 배포
```

### 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx           # 메인 애플리케이션
│   ├── types/              # TypeScript 타입 정의
│   │   └── index.ts
│   ├── routes/             # API 라우트
│   │   ├── auth.ts         # 인증 API
│   │   └── consultations.ts # 상담현황 API
│   ├── middleware/         # 미들웨어
│   │   └── auth.ts         # 인증 미들웨어
│   └── utils/              # 유틸리티
│       ├── index.ts        # 공통 유틸
│       └── db.ts           # DB 헬퍼
├── public/                 # 정적 파일
│   └── static/
│       ├── js/
│       │   ├── common.js   # 공통 JS 유틸리티
│       │   └── kanban.js   # 칸반보드 JS
│       └── css/
├── migrations/             # DB 마이그레이션
│   └── 0001_initial_schema.sql
├── .wrangler/              # Wrangler 로컬 상태
├── ecosystem.config.cjs    # PM2 설정
├── seed.sql                # 초기 데이터
├── wrangler.jsonc          # Cloudflare 설정
├── package.json            # 프로젝트 설정
├── README.md               # 이 파일
└── DEPLOYMENT_GUIDE.md     # 배포 가이드
```

## 다음 단계 (권장 개발 순서)

### Phase 1: 핵심 업무 프로세스 ✅ **완료**
1. ✅ **상담현황 페이지** - 칸반보드 UI 완성 (드래그앤드롭, 상세보기/수정/삭제)
2. ✅ **계약현황 페이지** - 칸반보드 + API 연결
3. ✅ **설치현황 페이지** - 칸반보드 + API 연결
4. ✅ **운영등재 페이지** - 기본 UI 완성
5. ✅ **가맹점현황 페이지** - 리스트 UI 완성

### Phase 2: 서브 업무 시스템 ✅ **완료 (기본 구조)**
6. ✅ 재고관리 시스템 (재고요청/재고현황/대여현황 하위 메뉴)
7. ✅ A/S 관리 시스템 (인바운드/방문A/S/대시보드 하위 메뉴)
8. ❌ 정산 시스템 (CMS/CRM/Ai매출업) - **미구현**

### Phase 3: 보완 및 고도화 (우선순위: 높음)
9. 📋 모든 페이지 상세 모달 및 CRUD 기능 보완
10. 📋 정산 시스템 구현 (CMS출금/CRM/Ai매출업 정산 + 대시보드)
11. 📋 관리자 시스템 메뉴 (사용자/페이지/로케이션/아이템/회사정보 관리)
12. 📋 대시보드 통계 및 차트
13. 📋 실시간 알림 시스템

## 개발 노트

### 성능 최적화
- ✅ 세션 기반 인증 (메모리 저장)
- ✅ 효율적인 DB 쿼리 (인덱스 활용)
- ⏳ 프론트엔드 페이지네이션
- ⏳ 실시간 데이터 갱신

### 보안
- ✅ HttpOnly 쿠키 사용
- ✅ 권한 기반 접근 제어
- ⚠️ 비밀번호 암호화 필요 (bcrypt 권장)
- ⚠️ CSRF 보호 추가 필요

### UX 개선
- ✅ 로딩 상태 표시
- ✅ 에러 메시지 표시
- ✅ 애니메이션 효과
- ✅ 토스트 알림
- ✅ 모달 다이얼로그
- ⏳ 드래그앤드롭 칸반보드 (완성도 향상)

## 문의 및 지원

- 개발자: Claude (AI Assistant)
- 프로젝트 타입: Cloudflare Pages + Hono
- 라이선스: Private

## 📚 추가 문서

- **배포 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **API 문서**: 개발 중
- **사용자 매뉴얼**: 개발 중

---

**MONKi Biz** - 통합 업무 관리를 더 쉽게, 더 효율적으로! 🚀

**현재 진행률**: 약 70% 완료  
**완성된 핵심 페이지**: 상담/계약/설치/운영/가맹점/재고/A/S 전체 페이지  
**배포 상태**: ✅ 배포 가능 (기본 기능 완성)  
**다음 단계**: 정산 시스템, 관리자 메뉴, 상세 기능 보완
