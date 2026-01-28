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
- ✅ 데이터베이스 스키마 (D1)
- ✅ 초기 데이터 시딩

🚧 **개발 중인 기능**
- 🚧 상담현황 칸반보드 (마케팅 → 영업 프로세스)
- 🚧 계약현황 칸반보드 (계약 진행 프로세스)
- 🚧 설치현황 칸반보드 (설치 진행 프로세스)
- 🚧 운영등재 칸반보드 (최종 등재 프로세스)
- 🚧 가맹점현황 리스트 페이지
- 🚧 재고관리 시스템
- 🚧 A/S 관리 시스템
- 🚧 대시보드 통계 기능

📋 **예정된 기능**
- 📋 관리자 시스템 메뉴 (사용자/페이지/로케이션/아이템/회사정보 관리)
- 📋 실시간 알림 시스템
- 📋 활동 로그 추적
- 📋 데이터 내보내기/가져오기
- 📋 드래그앤드롭 칸반보드

## URLs

### 개발 환경
- **로컬**: http://localhost:3000
- **공개 URL**: https://3000-i18dape7j958kk047f6g6-82b888ba.sandbox.novita.ai

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

## 데이터 아키텍처

### 데이터 모델

#### 핵심 업무 프로세스
```
고객(customers)
  ↓
상담(consultations) → 계약(contracts) → 설치(installations) → 가맹점(franchises)
```

#### 주요 테이블
1. **users** - 사용자 계정 및 권한
2. **customers** - 고객 정보 (전체 프로세스 추적)
3. **consultations** - 상담 내역
4. **contracts** - 계약 정보
5. **installations** - 설치 내역
6. **franchises** - 가맹점 현황
7. **inbound_requests** - 인바운드 A/S 문의
8. **as_requests** - A/S 처리 현황
9. **stock_inventory** - 재고 현황
10. **stock_requests** - 재고 요청
11. **stock_transactions** - 재고 이동 내역

### 스토리지 서비스
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스 (메인 데이터)
- **로컬 스토리지**: 개발 환경에서 `.wrangler/state/v3/d1` 사용

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
- **상태**: 🟢 개발 중 (로컬)
- **프로덕션 배포**: 미정

### 기술 스택
- **Backend**: Hono (TypeScript)
- **Frontend**: HTML + Tailwind CSS + Vanilla JavaScript
- **Database**: Cloudflare D1 (SQLite)
- **Build Tool**: Vite
- **Process Manager**: PM2 (개발 환경)

### 마지막 업데이트
- **날짜**: 2026-01-28
- **버전**: v1.0.0-alpha

## 개발 가이드

### 환경 설정

```bash
# 의존성 설치
npm install

# 로컬 DB 초기화
npm run db:migrate:local
npm run db:seed

# 개발 서버 시작 (포트 정리 후)
npm run clean-port
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
npm run test             # 서버 상태 테스트
```

### 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx           # 메인 애플리케이션
│   ├── types/              # TypeScript 타입 정의
│   │   └── index.ts
│   ├── routes/             # API 라우트
│   │   └── auth.ts         # 인증 API
│   ├── middleware/         # 미들웨어
│   │   └── auth.ts         # 인증 미들웨어
│   └── utils/              # 유틸리티
│       ├── index.ts        # 공통 유틸
│       └── db.ts           # DB 헬퍼
├── migrations/             # DB 마이그레이션
│   └── 0001_initial_schema.sql
├── public/                 # 정적 파일
│   └── static/
├── .wrangler/              # Wrangler 로컬 상태
├── ecosystem.config.cjs    # PM2 설정
├── seed.sql                # 초기 데이터
├── wrangler.jsonc          # Cloudflare 설정
├── package.json            # 프로젝트 설정
└── README.md               # 이 파일
```

## 다음 단계 (권장 개발 순서)

### Phase 1: 핵심 업무 프로세스 (우선순위: 높음)
1. ✅ 인증 시스템 구현
2. 🚧 **상담현황 페이지** - 칸반보드 구현
   - 상담대기 → 상담중 → 상담완료 상태 관리
   - 드래그앤드롭으로 상태 변경
   - 신규 고객 등록 기능
3. 🚧 **계약현황 페이지** - 칸반보드 구현
   - 계약대기 → 진행중 → 서명대기 → 완료
   - 견적서 발행 요청
4. 🚧 **설치현황 페이지** - 칸반보드 구현
   - 설치대기 → 진행중 → 완료대기 → 완료
   - 설치사진/확인서 업로드
5. 🚧 **운영등재 페이지** - 칸반보드 구현
   - 등재대기 → 확인중 → 완료
   - 최종 검증 로직
6. 🚧 **가맹점현황 페이지** - 리스트/상세보기
   - 검색 기능
   - 정보 수정
   - 우클릭 방지

### Phase 2: 서브 업무 시스템 (우선순위: 중간)
7. 재고관리 시스템
8. A/S 관리 시스템
9. 정산 시스템

### Phase 3: 관리 기능 (우선순위: 낮음)
10. 관리자 시스템 메뉴
11. 대시보드 통계
12. 알림 시스템

## 개발 노트

### 성능 최적화
- ✅ 세션 기반 인증 (메모리 저장)
- ✅ 효율적인 DB 쿼리 (인덱스 활용)
- ⏳ 프론트엔드 페이지네이션
- ⏳ 실시간 데이터 갱신 (WebSocket 고려)

### 보안
- ✅ HttpOnly 쿠키 사용
- ✅ 권한 기반 접근 제어
- ⚠️ 비밀번호 암호화 필요 (bcrypt 권장)
- ⚠️ CSRF 보호 추가 필요

### UX 개선
- ✅ 로딩 상태 표시
- ✅ 에러 메시지 표시
- ✅ 애니메이션 효과
- ⏳ 드래그앤드롭 칸반보드
- ⏳ 실시간 알림

## 문의 및 지원

- 개발자: Claude (AI Assistant)
- 프로젝트 타입: Cloudflare Pages + Hono
- 라이선스: Private

---

**MONKi Biz** - 통합 업무 관리를 더 쉽게, 더 효율적으로! 🚀
