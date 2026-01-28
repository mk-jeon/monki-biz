// ============================================================================
// MONKi Biz - 데이터베이스 헬퍼 함수
// ============================================================================

import { D1Database, D1Result } from '@cloudflare/workers-types';
import { 
  User, 
  Customer, 
  Consultation, 
  Contract, 
  Installation, 
  Franchise,
  Permission,
  Notification
} from '../types';

// ============================================================================
// 사용자 관련
// ============================================================================

/**
 * 사용자 ID로 사용자 조회
 */
export async function getUserById(db: D1Database, userId: number): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<User>();
  return result || null;
}

/**
 * 사용자 ID 문자열로 사용자 조회
 */
export async function getUserByUserId(db: D1Database, userId: string): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE user_id = ?').bind(userId).first<User>();
  return result || null;
}

/**
 * 사용자 권한 조회
 */
export async function getUserPermissions(db: D1Database, userId: number): Promise<Permission[]> {
  const result = await db.prepare('SELECT * FROM permissions WHERE user_id = ?').bind(userId).all<Permission>();
  return result.results || [];
}

/**
 * 사용자 목록 조회
 */
export async function getUsers(db: D1Database, isActive?: boolean): Promise<User[]> {
  let query = 'SELECT * FROM users';
  if (isActive !== undefined) {
    query += ' WHERE is_active = ?';
    const result = await db.prepare(query).bind(isActive ? 1 : 0).all<User>();
    return result.results || [];
  }
  const result = await db.prepare(query).all<User>();
  return result.results || [];
}

// ============================================================================
// 고객 관련
// ============================================================================

/**
 * 고객 코드로 고객 조회
 */
export async function getCustomerByCode(db: D1Database, customerCode: string): Promise<Customer | null> {
  const result = await db.prepare('SELECT * FROM customers WHERE customer_code = ?').bind(customerCode).first<Customer>();
  return result || null;
}

/**
 * 고객 ID로 고객 조회
 */
export async function getCustomerById(db: D1Database, customerId: number): Promise<Customer | null> {
  const result = await db.prepare('SELECT * FROM customers WHERE id = ?').bind(customerId).first<Customer>();
  return result || null;
}

/**
 * 전화번호로 고객 조회
 */
export async function getCustomerByPhone(db: D1Database, phone: string): Promise<Customer | null> {
  const result = await db.prepare('SELECT * FROM customers WHERE phone = ?').bind(phone).first<Customer>();
  return result || null;
}

/**
 * 단계별 고객 목록 조회
 */
export async function getCustomersByStage(db: D1Database, stage: string): Promise<Customer[]> {
  const result = await db.prepare('SELECT * FROM customers WHERE current_stage = ? ORDER BY created_at DESC')
    .bind(stage)
    .all<Customer>();
  return result.results || [];
}

/**
 * 고객 생성
 */
export async function createCustomer(db: D1Database, customer: Partial<Customer>): Promise<number> {
  const result = await db.prepare(`
    INSERT INTO customers 
    (customer_code, phone, customer_name, email, franchise_name, business_number,
     region_type, region, administrative_district, road_address, detail_address,
     is_operating, open_date, business_type, pos_program, pos_vendor,
     current_stage, current_status, marketing_user_id, sales_user_id, operation_user_id,
     inbound_channel, inbound_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    customer.customer_code,
    customer.phone,
    customer.customer_name || null,
    customer.email || null,
    customer.franchise_name || null,
    customer.business_number || null,
    customer.region_type || null,
    customer.region || null,
    customer.administrative_district || null,
    customer.road_address || null,
    customer.detail_address || null,
    customer.is_operating || 0,
    customer.open_date || null,
    customer.business_type || null,
    customer.pos_program || null,
    customer.pos_vendor || null,
    customer.current_stage || 'consult',
    customer.current_status || null,
    customer.marketing_user_id || null,
    customer.sales_user_id || null,
    customer.operation_user_id || null,
    customer.inbound_channel || null,
    customer.inbound_date || null
  ).run();

  return result.meta.last_row_id || 0;
}

/**
 * 고객 업데이트
 */
export async function updateCustomer(db: D1Database, customerId: number, updates: Partial<Customer>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'customer_code' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(customerId);

  const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
  await db.prepare(query).bind(...values).run();
}

// ============================================================================
// 상담 관련
// ============================================================================

/**
 * 고객 ID로 상담 내역 조회
 */
export async function getConsultationsByCustomerId(db: D1Database, customerId: number): Promise<Consultation[]> {
  const result = await db.prepare('SELECT * FROM consultations WHERE customer_id = ? ORDER BY created_at DESC')
    .bind(customerId)
    .all<Consultation>();
  return result.results || [];
}

/**
 * 상태별 상담 목록 조회
 */
export async function getConsultationsByStatus(db: D1Database, status: string): Promise<Consultation[]> {
  const result = await db.prepare(`
    SELECT c.*, cu.customer_name, cu.phone, cu.franchise_name
    FROM consultations c
    LEFT JOIN customers cu ON c.customer_id = cu.id
    WHERE c.consult_status = ?
    ORDER BY c.created_at DESC
  `).bind(status).all<Consultation>();
  return result.results || [];
}

/**
 * 상담 생성
 */
export async function createConsultation(db: D1Database, consultation: Partial<Consultation>): Promise<number> {
  const result = await db.prepare(`
    INSERT INTO consultations 
    (customer_id, consult_date, call_request_date, consult_subject, consult_status,
     visit_datetime, visit_status, customer_status, follow_up_date, failure_reason,
     progress_status, final_result, inquiry_franchise, inquiry_program, monthly_rental_fee,
     prepaid_count, postpaid_count, pos_count, charger_count, router_count,
     call_success, visit_success, contract_success, install_success, content, memo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    consultation.customer_id,
    consultation.consult_date || null,
    consultation.call_request_date || null,
    consultation.consult_subject || null,
    consultation.consult_status || 'waiting',
    consultation.visit_datetime || null,
    consultation.visit_status || null,
    consultation.customer_status || null,
    consultation.follow_up_date || null,
    consultation.failure_reason || null,
    consultation.progress_status || null,
    consultation.final_result || null,
    consultation.inquiry_franchise || null,
    consultation.inquiry_program || null,
    consultation.monthly_rental_fee || null,
    consultation.prepaid_count || 0,
    consultation.postpaid_count || 0,
    consultation.pos_count || 0,
    consultation.charger_count || 0,
    consultation.router_count || 0,
    consultation.call_success || 0,
    consultation.visit_success || 0,
    consultation.contract_success || 0,
    consultation.install_success || 0,
    consultation.content || null,
    consultation.memo || null
  ).run();

  return result.meta.last_row_id || 0;
}

/**
 * 상담 업데이트
 */
export async function updateConsultation(db: D1Database, consultationId: number, updates: Partial<Consultation>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'customer_id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(consultationId);

  const query = `UPDATE consultations SET ${fields.join(', ')} WHERE id = ?`;
  await db.prepare(query).bind(...values).run();
}

// ============================================================================
// 계약 관련
// ============================================================================

/**
 * 고객 ID로 계약 내역 조회
 */
export async function getContractsByCustomerId(db: D1Database, customerId: number): Promise<Contract[]> {
  const result = await db.prepare('SELECT * FROM contracts WHERE customer_id = ? ORDER BY created_at DESC')
    .bind(customerId)
    .all<Contract>();
  return result.results || [];
}

/**
 * 상태별 계약 목록 조회
 */
export async function getContractsByStatus(db: D1Database, status: string): Promise<Contract[]> {
  const result = await db.prepare(`
    SELECT c.*, cu.customer_name, cu.phone, cu.franchise_name
    FROM contracts c
    LEFT JOIN customers cu ON c.customer_id = cu.id
    WHERE c.contract_status = ?
    ORDER BY c.created_at DESC
  `).bind(status).all<Contract>();
  return result.results || [];
}

// ============================================================================
// 설치 관련
// ============================================================================

/**
 * 고객 ID로 설치 내역 조회
 */
export async function getInstallationsByCustomerId(db: D1Database, customerId: number): Promise<Installation[]> {
  const result = await db.prepare('SELECT * FROM installations WHERE customer_id = ? ORDER BY created_at DESC')
    .bind(customerId)
    .all<Installation>();
  return result.results || [];
}

/**
 * 상태별 설치 목록 조회
 */
export async function getInstallationsByStatus(db: D1Database, status: string): Promise<Installation[]> {
  const result = await db.prepare(`
    SELECT i.*, cu.customer_name, cu.phone, cu.franchise_name
    FROM installations i
    LEFT JOIN customers cu ON i.customer_id = cu.id
    WHERE i.install_status = ?
    ORDER BY i.created_at DESC
  `).bind(status).all<Installation>();
  return result.results || [];
}

// ============================================================================
// 가맹점 관련
// ============================================================================

/**
 * 운영 상태별 가맹점 목록 조회
 */
export async function getFranchisesByStatus(db: D1Database, status: string): Promise<Franchise[]> {
  const result = await db.prepare('SELECT * FROM franchises WHERE operating_status = ? ORDER BY created_at DESC')
    .bind(status)
    .all<Franchise>();
  return result.results || [];
}

/**
 * 가맹점 검색
 */
export async function searchFranchises(db: D1Database, keyword: string): Promise<Franchise[]> {
  const result = await db.prepare(`
    SELECT * FROM franchises 
    WHERE franchise_name LIKE ? 
       OR representative LIKE ? 
       OR contact LIKE ?
       OR franchise_code LIKE ?
    ORDER BY created_at DESC
  `).bind(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`).all<Franchise>();
  return result.results || [];
}

// ============================================================================
// 알림 관련
// ============================================================================

/**
 * 사용자의 안 읽은 알림 조회
 */
export async function getUnreadNotifications(db: D1Database, userId: number): Promise<Notification[]> {
  const result = await db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? AND is_read = 0 
    ORDER BY created_at DESC
  `).bind(userId).all<Notification>();
  return result.results || [];
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(db: D1Database, notificationId: number): Promise<void> {
  await db.prepare(`
    UPDATE notifications 
    SET is_read = 1, read_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind(notificationId).run();
}
