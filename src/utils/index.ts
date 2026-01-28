// ============================================================================
// MONKi Biz - 유틸리티 함수
// ============================================================================

/**
 * 고객 코드 생성 (예: CUST-20260128-0001)
 */
export function generateCustomerCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CUST-${year}${month}${day}-${random}`;
}

/**
 * 가맹점 코드 생성 (예: FRAN-20260128-0001)
 */
export function generateFranchiseCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `FRAN-${year}${month}${day}-${random}`;
}

/**
 * 계약번호 생성 (예: CNT-20260128-0001)
 */
export function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `CNT-${year}${month}${day}-${random}`;
}

/**
 * 재고요청 번호 생성 (예: STK-20260128-0001)
 */
export function generateStockRequestNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `STK-${year}${month}${day}-${random}`;
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜 시간 포맷팅 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 현재 시간 (UTC) 반환
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

/**
 * SQL LIKE 패턴 이스케이프
 */
export function escapeLikePattern(str: string): string {
  return str.replace(/[%_]/g, '\\$&');
}

/**
 * JSON 안전 파싱
 */
export function safeJsonParse<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 페이지네이션 계산
 */
export function calculatePagination(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  return { limit, offset };
}

/**
 * 전화번호 포맷팅
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

/**
 * 사업자번호 포맷팅
 */
export function formatBusinessNumber(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
  }
  return number;
}

/**
 * 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * 권한 체크 유틸리티
 */
export function hasPermission(
  permissions: Array<{ page_name: string; can_read: number; can_write: number }>,
  pageName: string,
  type: 'read' | 'write'
): boolean {
  const permission = permissions.find((p) => p.page_name === pageName);
  if (!permission) return false;
  return type === 'read' ? permission.can_read === 1 : permission.can_write === 1;
}

/**
 * 세션 ID 생성
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 쿠키 파싱
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {} as Record<string, string>);
}

/**
 * 쿠키 생성
 */
export function createCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): string {
  const {
    maxAge = 86400, // 1 day
    path = '/',
    httpOnly = true,
    secure = true,
    sameSite = 'Lax',
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}`;
  cookie += `; Max-Age=${maxAge}`;
  cookie += `; Path=${path}`;
  if (httpOnly) cookie += '; HttpOnly';
  if (secure) cookie += '; Secure';
  cookie += `; SameSite=${sameSite}`;

  return cookie;
}

/**
 * 배열을 청크로 나누기
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 객체에서 null/undefined 값 제거
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value != null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * 딥 클론
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 디바운스
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
