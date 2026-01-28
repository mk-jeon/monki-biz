-- ============================================================================
-- MONKi Biz 통합 업무 관리 시스템 - 초기 스키마
-- ============================================================================

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT, -- 영업, 운영, 마케팅, 기획
  role TEXT NOT NULL DEFAULT 'user', -- admin, user
  phone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- 권한 관리 테이블
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  page_name TEXT NOT NULL, -- 페이지 식별자
  can_read INTEGER DEFAULT 0, -- 읽기 권한
  can_write INTEGER DEFAULT 0, -- 쓰기 권한
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 로케이션 관리 테이블 (지점/지사/창고/협력사/파트너사/벤더 등)
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_code TEXT UNIQUE NOT NULL,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL, -- 지점, 지사, 창고, 협력사, 파트너사, 벤더
  address TEXT,
  contact TEXT,
  is_stock_enabled INTEGER DEFAULT 0, -- 재고 관리 여부
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 아이템(재고) 카테고리 테이블
CREATE TABLE IF NOT EXISTS item_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 아이템(재고) 모델 테이블
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  category_id INTEGER,
  model_name TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES item_categories(id)
);

-- 회사 정보 테이블
CREATE TABLE IF NOT EXISTS company_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT,
  representative TEXT,
  business_number TEXT,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 메인 업무 프로세스 테이블
-- ============================================================================

-- 통합 고객 정보 테이블 (상담 -> 계약 -> 설치 -> 운영등재 전 과정 추적)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_code TEXT UNIQUE NOT NULL, -- 고객 코드 (자동 생성)
  
  -- 기본 정보
  customer_name TEXT, -- 고객명/대표자
  phone TEXT NOT NULL, -- 연락처 (필수, 최초 인입 시 전화번호만 있음)
  email TEXT,
  
  -- 가맹점 정보
  franchise_name TEXT, -- 가맹점명/상호
  business_number TEXT, -- 사업자번호
  
  -- 주소 정보
  region_type TEXT, -- 지역타입
  region TEXT, -- 지역구분
  administrative_district TEXT, -- 행정구역
  road_address TEXT, -- 도로명주소
  detail_address TEXT, -- 상세주소
  
  -- 영업 정보
  is_operating INTEGER DEFAULT 0, -- 매장 운영 여부
  open_date TEXT, -- 오픈일자
  business_type TEXT, -- 업종
  
  -- POS 정보
  pos_program TEXT, -- 포스프로그램
  pos_vendor TEXT, -- 포스프로그램 관리처
  
  -- 현재 상태 추적
  current_stage TEXT DEFAULT 'consult', -- consult(상담), contract(계약), install(설치), operating(운영등재)
  current_status TEXT, -- 각 단계별 세부 상태
  
  -- 담당자
  marketing_user_id INTEGER, -- 마케팅 담당자
  sales_user_id INTEGER, -- 영업 담당자
  operation_user_id INTEGER, -- 운영 담당자
  
  -- 인입 정보
  inbound_channel TEXT, -- 인입 채널 (광고리드, 광고외채널 등)
  inbound_date DATETIME, -- 인입일
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (marketing_user_id) REFERENCES users(id),
  FOREIGN KEY (sales_user_id) REFERENCES users(id),
  FOREIGN KEY (operation_user_id) REFERENCES users(id)
);

-- 상담 현황 테이블
CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  
  -- 상담 정보
  consult_date DATETIME, -- 상담일자
  call_request_date TEXT, -- 통화요청 날짜
  consult_subject TEXT, -- 상담주체 (담당자)
  consult_status TEXT DEFAULT 'waiting', -- 상담대기, 상담중, 상담완료, 취소, 보류
  
  -- 방문 상담
  visit_datetime TEXT, -- 방문(예약) 일시
  visit_status TEXT, -- 방문 상담 상태
  
  -- 고객 상태
  customer_status TEXT, -- 고객 상태
  follow_up_date TEXT, -- 후속 연락 날짜
  failure_reason TEXT, -- 실패 사유
  progress_status TEXT, -- 진행 상황
  final_result TEXT, -- 최종 결과
  
  -- 문의 내용
  inquiry_franchise TEXT, -- 상호 문의
  inquiry_program TEXT, -- 프로그램 문의
  monthly_rental_fee TEXT, -- 월 렌탈료
  
  -- 장비 수량
  prepaid_count INTEGER DEFAULT 0, -- 선불형
  postpaid_count INTEGER DEFAULT 0, -- 후불형
  pos_count INTEGER DEFAULT 0, -- 포스
  charger_count INTEGER DEFAULT 0, -- 충전기
  router_count INTEGER DEFAULT 0, -- 공유기
  
  -- 성공 지표
  call_success INTEGER DEFAULT 0,
  visit_success INTEGER DEFAULT 0,
  contract_success INTEGER DEFAULT 0,
  install_success INTEGER DEFAULT 0,
  
  -- 메모
  content TEXT, -- 내용
  memo TEXT, -- 비고
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 계약 현황 테이블
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  contract_number TEXT UNIQUE, -- 계약번호
  
  -- 계약 정보
  contract_date TEXT, -- 계약일
  contract_status TEXT DEFAULT 'waiting', -- 계약대기, 진행중, 서명대기, 완료, 보류, 취소
  contract_type TEXT, -- 설치구분
  contract_category TEXT, -- 약정구분
  
  -- 금융 정보
  bank_name TEXT, -- 은행명
  account_number TEXT, -- 계좌번호
  account_holder TEXT, -- 예금주
  withdrawal_day TEXT, -- 출금일
  unit_price TEXT, -- 단가
  rental_fee_total TEXT, -- 렌탈료 계
  
  -- 서비스 구분
  crm_type TEXT, -- CRM 구분
  ai_sales_type TEXT, -- Ai매출업
  rental_company TEXT, -- 렌탈사
  action_type TEXT, -- 동작구분
  
  -- 설치 정보
  install_manager TEXT, -- 설치담당처
  agency TEXT, -- 관리대리점
  
  -- 계약 문서
  contract_file_url TEXT, -- 계약서 파일 URL
  estimate_file_url TEXT, -- 견적서 파일 URL
  
  -- 메모
  memo TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 설치 현황 테이블
CREATE TABLE IF NOT EXISTS installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  contract_id INTEGER,
  
  -- 설치 정보
  install_date TEXT, -- 설치일
  install_status TEXT DEFAULT 'waiting', -- 설치대기, 진행중, 완료대기, 완료, 취소
  install_type TEXT, -- 계약완료, 선설치후계약, 보류
  
  -- 장비 정보
  model_name TEXT, -- 모델명
  pos_program TEXT, -- POS
  total_count INTEGER DEFAULT 0, -- T/O 계
  quantity INTEGER DEFAULT 0, -- 수량
  
  -- 장비 세부 수량
  master_count INTEGER DEFAULT 0, -- 마스터
  qr_count INTEGER DEFAULT 0, -- QR
  stand_total INTEGER DEFAULT 0, -- 거치대 계
  standard_count INTEGER DEFAULT 0, -- 표준
  flat_count INTEGER DEFAULT 0, -- 평판
  extension_count INTEGER DEFAULT 0, -- 확장
  charger_set_count INTEGER DEFAULT 0, -- 충전기set
  router_count INTEGER DEFAULT 0, -- 공유기
  battery_count INTEGER DEFAULT 0, -- 배터리
  
  -- 시리얼 정보
  serial_numbers TEXT, -- 시리얼넘버 (JSON 형태)
  
  -- VAN 및 ASP 정보
  van TEXT, -- VAN
  asp_id TEXT, -- ASP ID
  asp_password TEXT, -- ASP PW
  asp_url TEXT, -- ASP URL
  
  -- 설치 확인
  install_photo_url TEXT, -- 설치사진 URL
  install_confirmation_url TEXT, -- 설치확인서 URL
  has_install_photo INTEGER DEFAULT 0,
  has_confirmation INTEGER DEFAULT 0,
  
  -- 메모
  memo TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- 운영 등재 테이블 (가맹점 현황)
CREATE TABLE IF NOT EXISTS franchises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  contract_id INTEGER,
  installation_id INTEGER,
  
  -- 기본 정보
  franchise_code TEXT UNIQUE NOT NULL, -- 가맹점 코드
  franchise_name TEXT NOT NULL, -- 가맹점명
  business_number TEXT, -- 사업자번호
  representative TEXT, -- 대표자
  contact TEXT, -- 연락처
  email TEXT,
  
  -- 계약 정보
  contract_number TEXT,
  contract_date TEXT, -- 계약일
  contract_year INTEGER,
  contract_month INTEGER,
  contract_quarter INTEGER,
  install_date TEXT, -- 설치일
  termination_date TEXT, -- 해지일
  contract_end_date TEXT, -- 계약종료일
  
  -- 주소 정보
  region_type TEXT,
  region TEXT,
  administrative_district TEXT,
  road_address TEXT,
  detail_address TEXT,
  
  -- 금융 정보
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  unit_price TEXT,
  contract_category TEXT,
  withdrawal_day TEXT,
  rental_fee_total TEXT,
  
  -- 서비스 정보
  crm_type TEXT,
  ai_sales_type TEXT,
  rental_company TEXT,
  action_type TEXT,
  install_manager TEXT,
  agency TEXT,
  
  -- 장비 정보
  model_name TEXT,
  pos_program TEXT,
  total_count INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  master_count INTEGER DEFAULT 0,
  qr_count INTEGER DEFAULT 0,
  stand_total INTEGER DEFAULT 0,
  standard_count INTEGER DEFAULT 0,
  flat_count INTEGER DEFAULT 0,
  extension_count INTEGER DEFAULT 0,
  charger_set_count INTEGER DEFAULT 0,
  router_count INTEGER DEFAULT 0,
  battery_count INTEGER DEFAULT 0,
  
  -- VAN 및 ASP 정보
  van TEXT,
  asp_id TEXT,
  asp_password TEXT,
  asp_url TEXT,
  
  -- 운영 상태
  operating_status TEXT DEFAULT 'active', -- active(운영중), terminated(해지), name_changed(명의변경)
  install_type TEXT, -- 설치구분
  
  -- 문서 URL
  contract_file_url TEXT,
  estimate_file_url TEXT,
  install_photo_url TEXT,
  install_confirmation_url TEXT,
  folder_url TEXT, -- 드라이브 폴더 URL
  
  -- 메모
  memo TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (contract_id) REFERENCES contracts(id),
  FOREIGN KEY (installation_id) REFERENCES installations(id)
);

-- ============================================================================
-- 서브 업무 테이블
-- ============================================================================

-- 인바운드 현황 테이블 (A/S 문의)
CREATE TABLE IF NOT EXISTS inbound_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 인입 정보
  inbound_date TEXT, -- 인입일
  inbound_time TEXT, -- 시간
  completion_date TEXT, -- 완료일
  
  -- 문의 정보
  inquiry_type TEXT, -- 문의속성
  progress_stage TEXT, -- 진행단계
  detailed_status TEXT, -- 세부처리상태
  
  -- 가맹점 정보
  franchise_name TEXT, -- 가맹점명
  contact TEXT, -- 연락처
  
  -- 문의 내용
  jira TEXT, -- JIRA
  inquiry_content TEXT, -- 문의내용
  resolution_content TEXT, -- 처리내용
  ticket_number TEXT, -- 티켓번호
  
  -- 분류
  inquiry_category TEXT, -- 문의유형
  detailed_category TEXT, -- 상세유형
  inbound_channel TEXT, -- 인입채널
  program TEXT, -- 프로그램
  
  -- 처리 정보
  franchise_tendency TEXT, -- 가맹점 성향
  processing_department TEXT, -- 처리부서
  receiver TEXT, -- 접수자
  last_outbound_date TEXT, -- 마지막 O/B 일자
  
  -- 메모
  memo TEXT,
  
  -- 방문 필요 여부
  needs_visit INTEGER DEFAULT 0, -- A/S 처리현황으로 이관 필요 여부
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- A/S 처리 현황 테이블
CREATE TABLE IF NOT EXISTS as_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inbound_id INTEGER, -- 인바운드에서 이관된 경우
  
  -- 기본 정보
  franchise_name TEXT,
  contact TEXT,
  request_date TEXT,
  
  -- 처리 상태
  status TEXT DEFAULT 'registered', -- 인입, 방문예정, 처리중, 교체완료, QA검수중, 제조사이관중, 제조사수리중, 제조사국내발송중, 완료
  detailed_status TEXT, -- 보류, 지연, 취소
  
  -- 장비 정보
  equipment_type TEXT,
  equipment_model TEXT,
  serial_number TEXT,
  
  -- 문제 내용
  issue_description TEXT,
  resolution_description TEXT,
  
  -- 방문 정보
  visit_date TEXT,
  visit_status TEXT,
  
  -- 재고 연동
  replaced_item_id INTEGER, -- 교체한 장비 (재고에서 출고)
  collected_serial TEXT, -- 수거한 불량품 시리얼 (재고로 입고)
  
  -- 제조사 정보
  manufacturer TEXT,
  manufacturer_status TEXT,
  sent_to_manufacturer_date TEXT,
  received_from_manufacturer_date TEXT,
  
  -- 담당자
  assigned_user_id INTEGER,
  
  -- 메모
  memo TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (inbound_id) REFERENCES inbound_requests(id),
  FOREIGN KEY (replaced_item_id) REFERENCES items(id),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

-- 재고 현황 테이블
CREATE TABLE IF NOT EXISTS stock_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  
  -- 재고 수량
  current_quantity INTEGER DEFAULT 0, -- 현재고
  accumulated_in INTEGER DEFAULT 0, -- 누적입고
  accumulated_out INTEGER DEFAULT 0, -- 누적출고
  
  -- 시리얼 넘버 관리 (JSON 배열)
  serial_numbers TEXT, -- [{serial: "SN001", status: "available"}]
  
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  UNIQUE(location_id, item_id)
);

-- 재고 요청 테이블
CREATE TABLE IF NOT EXISTS stock_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 요청 정보
  request_number TEXT UNIQUE NOT NULL,
  request_type TEXT NOT NULL, -- 입고, 출고, 반납, 대여
  request_reason TEXT, -- 일반대여, 데모장비, 시연, TEST, A/S교체 등
  request_status TEXT DEFAULT 'pending', -- pending(대기), approved(승인), rejected(반려), completed(완료), cancelled(취소)
  
  -- 요청자 정보
  requester_id INTEGER NOT NULL,
  requester_location_id INTEGER,
  
  -- 대상 정보
  target_location_id INTEGER NOT NULL, -- 입고/출고 대상 로케이션
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  
  -- 시리얼 넘버 (출고 시)
  serial_numbers TEXT, -- JSON 배열
  
  -- 승인 정보
  approver_id INTEGER,
  approved_at DATETIME,
  
  -- 완료 정보
  completed_at DATETIME,
  
  -- 대여 정보
  rental_return_date TEXT, -- 대여 반납 예정일
  is_returned INTEGER DEFAULT 0, -- 반납 여부
  
  -- 메모
  memo TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (requester_location_id) REFERENCES locations(id),
  FOREIGN KEY (target_location_id) REFERENCES locations(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- 재고 이동 내역 테이블
CREATE TABLE IF NOT EXISTS stock_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 이동 정보
  transaction_type TEXT NOT NULL, -- in(입고), out(출고), return(반납), transfer(이동)
  transaction_reason TEXT, -- 신규입고, 설치, A/S교체, 대여, 반납 등
  
  -- 로케이션 정보
  from_location_id INTEGER,
  to_location_id INTEGER,
  
  -- 아이템 정보
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  serial_numbers TEXT, -- JSON 배열
  
  -- 관련 문서
  stock_request_id INTEGER, -- 재고요청 ID
  as_request_id INTEGER, -- A/S요청 ID
  installation_id INTEGER, -- 설치 ID
  
  -- 담당자
  user_id INTEGER NOT NULL,
  
  -- 메모
  memo TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (from_location_id) REFERENCES locations(id),
  FOREIGN KEY (to_location_id) REFERENCES locations(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (stock_request_id) REFERENCES stock_requests(id),
  FOREIGN KEY (as_request_id) REFERENCES as_requests(id),
  FOREIGN KEY (installation_id) REFERENCES installations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================================
-- 알림 및 활동 로그
-- ============================================================================

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- 알림 내용
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- new_customer, status_change, approval_request 등
  
  -- 관련 정보
  related_id INTEGER, -- 관련 레코드 ID
  related_type TEXT, -- customers, contracts, installations 등
  
  -- 읽음 여부
  is_read INTEGER DEFAULT 0,
  read_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- 활동 정보
  action TEXT NOT NULL, -- create, update, delete, status_change 등
  target_type TEXT NOT NULL, -- customers, contracts, installations 등
  target_id INTEGER NOT NULL,
  
  -- 변경 내용
  old_value TEXT, -- JSON 형태
  new_value TEXT, -- JSON 형태
  
  -- IP 및 메타데이터
  ip_address TEXT,
  user_agent TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================================
-- 인덱스 생성
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_stage ON customers(current_stage);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(current_status);

-- Consultations
CREATE INDEX IF NOT EXISTS idx_consultations_customer ON consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(consult_status);

-- Contracts
CREATE INDEX IF NOT EXISTS idx_contracts_customer ON contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_number ON contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(contract_status);

-- Installations
CREATE INDEX IF NOT EXISTS idx_installations_customer ON installations(customer_id);
CREATE INDEX IF NOT EXISTS idx_installations_contract ON installations(contract_id);
CREATE INDEX IF NOT EXISTS idx_installations_status ON installations(install_status);

-- Franchises
CREATE INDEX IF NOT EXISTS idx_franchises_customer ON franchises(customer_id);
CREATE INDEX IF NOT EXISTS idx_franchises_code ON franchises(franchise_code);
CREATE INDEX IF NOT EXISTS idx_franchises_status ON franchises(operating_status);

-- Inbound Requests
CREATE INDEX IF NOT EXISTS idx_inbound_date ON inbound_requests(inbound_date);
CREATE INDEX IF NOT EXISTS idx_inbound_stage ON inbound_requests(progress_stage);

-- AS Requests
CREATE INDEX IF NOT EXISTS idx_as_status ON as_requests(status);
CREATE INDEX IF NOT EXISTS idx_as_detailed_status ON as_requests(detailed_status);

-- Stock
CREATE INDEX IF NOT EXISTS idx_stock_location ON stock_inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_item ON stock_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_requests_status ON stock_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_target ON activity_logs(target_type, target_id);
