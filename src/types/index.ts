// ============================================================================
// MONKi Biz - TypeScript 타입 정의
// ============================================================================

export interface Env {
  DB: D1Database;
}

// ============================================================================
// 사용자 및 권한
// ============================================================================

export interface User {
  id: number;
  user_id: string;
  password: string;
  name: string;
  email?: string;
  department?: string; // 영업, 운영, 마케팅, 기획
  role: 'admin' | 'user';
  phone?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Permission {
  id: number;
  user_id: number;
  page_name: string;
  can_read: number;
  can_write: number;
  created_at: string;
}

export interface Session {
  user: Omit<User, 'password'>;
  permissions: Permission[];
}

// ============================================================================
// 로케이션 및 아이템
// ============================================================================

export interface Location {
  id: number;
  location_code: string;
  location_name: string;
  location_type: string;
  address?: string;
  contact?: string;
  is_stock_enabled: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ItemCategory {
  id: number;
  category_name: string;
  description?: string;
  is_active: number;
  created_at: string;
}

export interface Item {
  id: number;
  item_code: string;
  item_name: string;
  category_id?: number;
  model_name?: string;
  description?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyInfo {
  id: number;
  company_name?: string;
  representative?: string;
  business_number?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  updated_at: string;
}

// ============================================================================
// 고객 및 업무 프로세스
// ============================================================================

export interface Customer {
  id: number;
  customer_code: string;
  customer_name?: string;
  phone: string;
  email?: string;
  franchise_name?: string;
  business_number?: string;
  region_type?: string;
  region?: string;
  administrative_district?: string;
  road_address?: string;
  detail_address?: string;
  is_operating: number;
  open_date?: string;
  business_type?: string;
  pos_program?: string;
  pos_vendor?: string;
  current_stage: 'consult' | 'contract' | 'install' | 'operating';
  current_status?: string;
  marketing_user_id?: number;
  sales_user_id?: number;
  operation_user_id?: number;
  inbound_channel?: string;
  inbound_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: number;
  customer_id: number;
  consult_date?: string;
  call_request_date?: string;
  consult_subject?: string;
  consult_status: string;
  visit_datetime?: string;
  visit_status?: string;
  customer_status?: string;
  follow_up_date?: string;
  failure_reason?: string;
  progress_status?: string;
  final_result?: string;
  inquiry_franchise?: string;
  inquiry_program?: string;
  monthly_rental_fee?: string;
  prepaid_count: number;
  postpaid_count: number;
  pos_count: number;
  charger_count: number;
  router_count: number;
  call_success: number;
  visit_success: number;
  contract_success: number;
  install_success: number;
  content?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  customer_id: number;
  contract_number?: string;
  contract_date?: string;
  contract_status: string;
  contract_type?: string;
  contract_category?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  withdrawal_day?: string;
  unit_price?: string;
  rental_fee_total?: string;
  crm_type?: string;
  ai_sales_type?: string;
  rental_company?: string;
  action_type?: string;
  install_manager?: string;
  agency?: string;
  contract_file_url?: string;
  estimate_file_url?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface Installation {
  id: number;
  customer_id: number;
  contract_id?: number;
  install_date?: string;
  install_status: string;
  install_type?: string;
  model_name?: string;
  pos_program?: string;
  total_count: number;
  quantity: number;
  master_count: number;
  qr_count: number;
  stand_total: number;
  standard_count: number;
  flat_count: number;
  extension_count: number;
  charger_set_count: number;
  router_count: number;
  battery_count: number;
  serial_numbers?: string;
  van?: string;
  asp_id?: string;
  asp_password?: string;
  asp_url?: string;
  install_photo_url?: string;
  install_confirmation_url?: string;
  has_install_photo: number;
  has_confirmation: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface Franchise {
  id: number;
  customer_id: number;
  contract_id?: number;
  installation_id?: number;
  franchise_code: string;
  franchise_name: string;
  business_number?: string;
  representative?: string;
  contact?: string;
  email?: string;
  contract_number?: string;
  contract_date?: string;
  contract_year?: number;
  contract_month?: number;
  contract_quarter?: number;
  install_date?: string;
  termination_date?: string;
  contract_end_date?: string;
  region_type?: string;
  region?: string;
  administrative_district?: string;
  road_address?: string;
  detail_address?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  unit_price?: string;
  contract_category?: string;
  withdrawal_day?: string;
  rental_fee_total?: string;
  crm_type?: string;
  ai_sales_type?: string;
  rental_company?: string;
  action_type?: string;
  install_manager?: string;
  agency?: string;
  model_name?: string;
  pos_program?: string;
  total_count: number;
  quantity: number;
  master_count: number;
  qr_count: number;
  stand_total: number;
  standard_count: number;
  flat_count: number;
  extension_count: number;
  charger_set_count: number;
  router_count: number;
  battery_count: number;
  van?: string;
  asp_id?: string;
  asp_password?: string;
  asp_url?: string;
  operating_status: string;
  install_type?: string;
  contract_file_url?: string;
  estimate_file_url?: string;
  install_photo_url?: string;
  install_confirmation_url?: string;
  folder_url?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// A/S 및 재고
// ============================================================================

export interface InboundRequest {
  id: number;
  inbound_date?: string;
  inbound_time?: string;
  completion_date?: string;
  inquiry_type?: string;
  progress_stage?: string;
  detailed_status?: string;
  franchise_name?: string;
  contact?: string;
  jira?: string;
  inquiry_content?: string;
  resolution_content?: string;
  ticket_number?: string;
  inquiry_category?: string;
  detailed_category?: string;
  inbound_channel?: string;
  program?: string;
  franchise_tendency?: string;
  processing_department?: string;
  receiver?: string;
  last_outbound_date?: string;
  memo?: string;
  needs_visit: number;
  created_at: string;
  updated_at: string;
}

export interface ASRequest {
  id: number;
  inbound_id?: number;
  franchise_name?: string;
  contact?: string;
  request_date?: string;
  status: string;
  detailed_status?: string;
  equipment_type?: string;
  equipment_model?: string;
  serial_number?: string;
  issue_description?: string;
  resolution_description?: string;
  visit_date?: string;
  visit_status?: string;
  replaced_item_id?: number;
  collected_serial?: string;
  manufacturer?: string;
  manufacturer_status?: string;
  sent_to_manufacturer_date?: string;
  received_from_manufacturer_date?: string;
  assigned_user_id?: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface StockInventory {
  id: number;
  location_id: number;
  item_id: number;
  current_quantity: number;
  accumulated_in: number;
  accumulated_out: number;
  serial_numbers?: string;
  updated_at: string;
}

export interface StockRequest {
  id: number;
  request_number: string;
  request_type: string;
  request_reason?: string;
  request_status: string;
  requester_id: number;
  requester_location_id?: number;
  target_location_id: number;
  item_id: number;
  quantity: number;
  serial_numbers?: string;
  approver_id?: number;
  approved_at?: string;
  completed_at?: string;
  rental_return_date?: string;
  is_returned: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: number;
  transaction_type: string;
  transaction_reason?: string;
  from_location_id?: number;
  to_location_id?: number;
  item_id: number;
  quantity: number;
  serial_numbers?: string;
  stock_request_id?: number;
  as_request_id?: number;
  installation_id?: number;
  user_id: number;
  memo?: string;
  created_at: string;
}

// ============================================================================
// 알림 및 로그
// ============================================================================

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  related_id?: number;
  related_type?: string;
  is_read: number;
  read_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  target_type: string;
  target_id: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================================================
// API 요청/응답 타입
// ============================================================================

export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: Omit<User, 'password'>;
  sessionId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// 칸반보드 관련 타입
// ============================================================================

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  items: KanbanItem[];
  count: number;
}

export interface KanbanItem {
  id: number;
  title: string;
  subtitle?: string;
  status: string;
  badge?: string;
  badgeColor?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 대시보드 통계 타입
// ============================================================================

export interface DashboardStats {
  consultations: {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  contracts: {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  installations: {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  franchises: {
    total: number;
    active: number;
    terminated: number;
  };
  asRequests: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  stockRequests: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
  };
}
