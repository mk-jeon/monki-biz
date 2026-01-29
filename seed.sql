-- ============================================================================
-- MONKi Biz - 초기 데이터 삽입
-- ============================================================================

-- 마스터 계정 생성 (최고 권한)
INSERT OR IGNORE INTO users (user_id, password, name, email, department, role, is_active) VALUES 
  ('minhiti88', 'Axieslin12!', '마스터 관리자', 'minhiti88@monkibiz.com', '경영', 'admin', 1);

-- 기본 관리자 및 사용자 계정 생성
INSERT OR IGNORE INTO users (user_id, password, name, email, department, role, is_active) VALUES 
  ('marketing01', '1234', '마케팅담당A', 'marketing@monkibiz.com', '마케팅', 'user', 1),
  ('sales01', '1234', '영업담당B', 'sales01@monkibiz.com', '영업', 'user', 1),
  ('sales02', '1234', '영업담당C', 'sales02@monkibiz.com', '영업', 'user', 1),
  ('operation01', '1234', '운영담당D', 'operation01@monkibiz.com', '운영', 'user', 1),
  ('operation02', '1234', '운영담당E', 'operation02@monkibiz.com', '운영', 'user', 1);

-- 회사 정보 초기 데이터
INSERT OR IGNORE INTO company_info (id, company_name, representative, business_number, address, phone) VALUES 
  (1, 'MONKi Biz', '대표이사', '000-00-00000', '서울특별시', '02-0000-0000');

-- 기본 로케이션 생성
INSERT OR IGNORE INTO locations (location_code, location_name, location_type, is_stock_enabled, is_active) VALUES 
  ('HQ', '본사', '본사', 1, 1),
  ('WAREHOUSE_01', '중앙창고', '창고', 1, 1),
  ('BRANCH_SEOUL', '서울지점', '지점', 1, 1),
  ('BRANCH_BUSAN', '부산지점', '지점', 1, 1);

-- 아이템 카테고리 생성
INSERT OR IGNORE INTO item_categories (category_name, description, is_active) VALUES 
  ('Table Order', '테이블 오더 기기', 1),
  ('Battery', '배터리', 1),
  ('Charge Station', '충전기', 1),
  ('Accessories', '액세서리', 1),
  ('Network', '네트워크 장비', 1);

-- 아이템 생성
INSERT OR IGNORE INTO items (item_code, item_name, category_id, model_name, is_active) VALUES 
  ('itm_0001', 'Table Order', 1, 'MKT01_KR5', 1),
  ('itm_0002', 'Table Order Acc', 1, 'Battery', 1),
  ('itm_0003', 'Etc', 4, 'Charge_Station', 1),
  ('itm_0004', 'Etc', 4, 'Adapter (65W)', 1);

-- 기본 재고 데이터 초기화
INSERT OR IGNORE INTO stock_inventory (location_id, item_id, current_quantity, accumulated_in, accumulated_out) 
SELECT l.id, i.id, 0, 0, 0
FROM locations l
CROSS JOIN items i
WHERE l.is_stock_enabled = 1;
