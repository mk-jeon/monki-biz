# MONKi Biz - 개발 및 배포 가이드

## 📌 1. 웹 배포 방법 (초보자 가이드)

### 🌐 Option 1: Cloudflare Pages 배포 (추천, 무료)

#### 💰 비용
- **완전 무료**: 월 10만 요청, 500MB D1 데이터베이스
- 무료 `.pages.dev` 도메인 및 SSL 인증서 포함
- 대규모 트래픽 시: $20/월 (Pro 플랜)

#### 📝 배포 단계

**1단계: Cloudflare 계정 생성**
```
https://dash.cloudflare.com/sign-up
→ 이메일로 가입 (무료, 신용카드 불필요)
```

**2단계: API 토큰 설정**
```bash
# 방법 1: 브라우저 인증 (추천)
npx wrangler login

# 방법 2: API 토큰 수동 설정
# Cloudflare Dashboard → My Profile → API Tokens → Create Token
# "Edit Cloudflare Workers" 템플릿 사용
```

**3단계: 프로덕션 데이터베이스 생성**
```bash
cd /home/user/webapp

# D1 데이터베이스 생성
npx wrangler d1 create monki-biz-production

# 출력된 database_id를 wrangler.jsonc에 복사
# 예: database_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**4단계: wrangler.jsonc 업데이트**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "monki-biz",
  "compatibility_date": "2026-01-28",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "monki-biz-production",
      "database_id": "여기에-실제-database-id-입력"
    }
  ]
}
```

**5단계: 프로덕션 데이터베이스 마이그레이션**
```bash
# 마이그레이션 실행 (--remote 플래그로 프로덕션 DB에 적용)
npx wrangler d1 migrations apply monki-biz-production --remote

# 초기 데이터 삽입
npx wrangler d1 execute monki-biz-production --remote --file=./seed.sql
```

**6단계: Cloudflare Pages 프로젝트 생성**
```bash
# 프로젝트 생성 (main 브랜치를 프로덕션으로 설정)
npx wrangler pages project create monki-biz \
  --production-branch main \
  --compatibility-date 2026-01-28
```

**7단계: 빌드 및 배포**
```bash
# 빌드
npm run build

# 배포
npx wrangler pages deploy dist --project-name monki-biz
```

**8단계: 배포 완료! 🎉**
```
✅ 프로덕션 URL: https://monki-biz.pages.dev
✅ 브랜치 URL: https://main.monki-biz.pages.dev
```

#### 🔐 환경 변수 설정 (필요시)
```bash
# Secrets 추가
npx wrangler pages secret put API_KEY --project-name monki-biz

# Secrets 목록 확인
npx wrangler pages secret list --project-name monki-biz
```

#### 🌍 커스텀 도메인 연결 (선택사항)
```bash
# 도메인 추가
npx wrangler pages domain add yourdomain.com --project-name monki-biz

# DNS 설정
# - Cloudflare Dashboard → DNS → Add Record
# - Type: CNAME
# - Name: @ (또는 원하는 서브도메인)
# - Content: monki-biz.pages.dev
```

---

### 💰 비용 정리

#### 무료 사용 (개인/소규모 비즈니스)
| 항목 | 무료 제공 | 비용 |
|------|-----------|------|
| Cloudflare Pages 호스팅 | 무제한 | **무료** |
| D1 데이터베이스 | 500MB, 월 10만 읽기 | **무료** |
| SSL 인증서 | 무제한 | **무료** |
| `.pages.dev` 도메인 | 1개 | **무료** |
| **월 총 비용** | - | **0원** |

#### 유료 사용 (대규모 트래픽)
| 항목 | 제한 | 비용 |
|------|------|------|
| Cloudflare Pages Pro | 무제한 | **$20/월** |
| D1 추가 용량 | 1GB당 | **$0.75/GB** |
| D1 추가 읽기 | 100만 읽기 | **$0.001** |
| 커스텀 도메인 | `.com` 등 | **$8-15/년** |
| **월 예상 비용** | - | **$20-30** |

---

### 🔄 지속적인 업데이트

```bash
# 1. 코드 수정 후
git add .
git commit -m "feat: 새 기능 추가"

# 2. 빌드
npm run build

# 3. 배포
npx wrangler pages deploy dist --project-name monki-biz

# 자동으로 새 버전 배포 완료!
```

---

### 🌐 Option 2: GitHub + Cloudflare Pages 자동 배포

더 편한 방법으로, GitHub에 push하면 자동으로 배포되게 설정할 수 있습니다.

**1단계: GitHub 저장소에 코드 푸시**
```bash
git remote add origin https://github.com/username/monki-biz.git
git push -u origin main
```

**2단계: Cloudflare Dashboard 설정**
```
1. Cloudflare Dashboard → Workers & Pages
2. "Create application" → "Pages" → "Connect to Git"
3. GitHub 저장소 선택 (monki-biz)
4. 빌드 설정:
   - Build command: npm run build
   - Build output directory: dist
5. "Save and Deploy" 클릭
```

**3단계: 자동 배포 완료!**
```
이제 GitHub에 push할 때마다 자동으로 배포됩니다.
```

---

## 📋 2. 나머지 페이지 개발 가이드

현재 구현된 기능:
- ✅ 인증 시스템
- ✅ 대시보드 레이아웃
- ✅ 상담현황 API (CRUD)
- ✅ 프론트엔드 유틸리티 (kanban.js, common.js)

### 개발 우선순위

#### Phase 1: 메인 업무 프로세스 (1-2주)
1. **상담현황 페이지** (진행중 50%)
   - 칸반보드 UI 완성
   - 신규 등록 폼
   - 상세보기 모달
   - 드래그앤드롭 상태 변경

2. **계약현황 페이지** (템플릿 복제)
   - 상담현황과 동일한 구조
   - API 엔드포인트: `/api/contracts`
   - 상태: waiting → in_progress → signature_waiting → completed

3. **설치현황 페이지** (템플릿 복제)
   - API 엔드포인트: `/api/installations`
   - 상태: waiting → in_progress → completion_waiting → completed
   - 설치사진/확인서 업로드 기능

4. **운영등재 페이지** (템플릿 복제)
   - API 엔드포인트: `/api/franchises`
   - 최종 검증 및 등재 프로세스

5. **가맹점현황 페이지** (리스트 형식)
   - 검색 기능
   - 상세보기 모달
   - 정보 수정 (액세스 권한)

#### Phase 2: 서브 업무 시스템 (1-2주)
6. **재고관리**
   - 재고현황 (테이블)
   - 재고요청 (칸반보드)
   - 대여현황 (테이블)

7. **A/S 관리**
   - 인바운드현황 (테이블)
   - 방문 A/S 현황 (칸반보드)
   - A/S 대시보드

8. **정산 시스템**
   - CMS 출금 정산
   - CRM 정산
   - Ai매출업 정산
   - 정산 대시보드

#### Phase 3: 관리 기능 (1주)
9. **관리자 시스템**
   - 사용자 관리
   - 페이지 관리
   - 로케이션 관리
   - 아이템 관리
   - 회사정보 관리

---

## 🛠️ 개발 템플릿

### API 라우트 템플릿 (src/routes/example.ts)
```typescript
import { Hono } from 'hono';
import { Env, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware } from '../middleware/auth';

const example = new Hono<{ Bindings: Env }>();
example.use('/*', authMiddleware);

// 목록 조회
example.get('/', async (c) => {
  const { DB } = c.env;
  const result = await DB.prepare('SELECT * FROM table_name').all();
  return c.json<ApiResponse>({ success: true, data: result.results });
});

// 상세 조회
example.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const { DB } = c.env;
  const item = await DB.prepare('SELECT * FROM table_name WHERE id = ?').bind(id).first();
  return c.json<ApiResponse>({ success: true, data: item });
});

// 생성
example.post('/', pagePermissionMiddleware('page_name', 'write'), async (c) => {
  const body = await c.req.json();
  const { DB } = c.env;
  const result = await DB.prepare('INSERT INTO table_name (...) VALUES (...)').bind(...).run();
  return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
});

// 수정
example.put('/:id', pagePermissionMiddleware('page_name', 'write'), async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { DB } = c.env;
  await DB.prepare('UPDATE table_name SET ... WHERE id = ?').bind(..., id).run();
  return c.json<ApiResponse>({ success: true });
});

// 삭제
example.delete('/:id', pagePermissionMiddleware('page_name', 'write'), async (c) => {
  const id = parseInt(c.req.param('id'));
  const { DB } = c.env;
  await DB.prepare('DELETE FROM table_name WHERE id = ?').bind(id).run();
  return c.json<ApiResponse>({ success: true });
});

export default example;
```

### 칸반보드 페이지 템플릿 (HTML)
```html
<div id="pageContent" class="p-6">
  <!-- 헤더 -->
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-2xl font-bold text-gray-800">페이지 제목</h3>
    <button onclick="openCreateModal()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
      <i class="fas fa-plus mr-2"></i>신규 등록
    </button>
  </div>

  <!-- 칸반보드 -->
  <div id="kanbanBoard"></div>
</div>

<script src="/static/js/common.js"></script>
<script src="/static/js/kanban.js"></script>
<script>
  // 칸반보드 초기화
  const kanban = new KanbanBoard({
    apiEndpoint: '/api/endpoint',
    containerId: 'kanbanBoard',
    columns: [
      { id: 1, title: '대기', status: 'waiting', color: 'bg-yellow-200' },
      { id: 2, title: '진행중', status: 'in_progress', color: 'bg-blue-200' },
      { id: 3, title: '완료', status: 'completed', color: 'bg-green-200' },
    ],
    renderCard: (item) => {
      return `
        <h4 class="font-semibold">${item.name}</h4>
        <p class="text-sm text-gray-600">${item.description}</p>
      `;
    },
    onItemClick: async (itemId) => {
      await showDetailModal(itemId);
    }
  });

  // 데이터 로드
  kanban.render();
  kanban.loadData();

  // 신규 등록 모달
  function openCreateModal() {
    // 구현
  }

  // 상세보기 모달
  async function showDetailModal(itemId) {
    // 구현
  }
</script>
```

---

## 📊 현재 진행 상황

### 완료된 작업 ✅
1. ✅ 프로젝트 초기 설정
2. ✅ 데이터베이스 스키마 (19개 테이블)
3. ✅ 인증 시스템 (로그인/로그아웃/세션)
4. ✅ 대시보드 레이아웃
5. ✅ 상담현황 API (완료)
6. ✅ 프론트엔드 유틸리티 (common.js, kanban.js)

### 진행 중인 작업 🚧
- 🚧 상담현황 페이지 (50% 완료)

### 남은 작업 📋
- 📋 계약현황 페이지
- 📋 설치현황 페이지
- 📋 운영등재 페이지
- 📋 가맹점현황 페이지
- 📋 재고관리 시스템
- 📋 A/S 관리 시스템
- 📋 정산 시스템
- 📋 관리자 시스템

---

## 🚀 다음 단계

### 즉시 실행 가능한 작업:

1. **로컬에서 테스트**
   ```bash
   npm run build
   pm2 restart monki-biz
   ```
   → http://localhost:3000 접속

2. **Cloudflare 배포 준비**
   ```bash
   npx wrangler login
   npx wrangler d1 create monki-biz-production
   ```

3. **나머지 페이지 개발**
   - 위 템플릿을 복사하여 빠르게 구현
   - API 라우트 → 프론트엔드 순서로 개발

---

## 💡 개발 팁

1. **빠른 개발을 위한 순서**
   - API 라우트 먼저 완성
   - Postman/curl로 테스트
   - 프론트엔드 연결

2. **재사용 가능한 컴포넌트 활용**
   - kanban.js: 모든 칸반보드에서 재사용
   - common.js: 모든 페이지에서 공통 사용

3. **Git 자주 커밋**
   ```bash
   git add .
   git commit -m "feat: 기능 추가"
   ```

---

**프로젝트 진행률**: 약 30% 완료  
**예상 완성 시간**: 2-3주 (풀타임 개발 기준)  
**현재 상태**: 배포 가능 (기본 기능)
