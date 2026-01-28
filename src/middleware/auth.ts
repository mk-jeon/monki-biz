// ============================================================================
// MONKi Biz - 인증 미들웨어
// ============================================================================

import { Context, Next } from 'hono';
import { Env, Session, User, Permission } from '../types';
import { parseCookies } from '../utils';

// 세션 저장소 (메모리 기반 - 프로덕션에서는 KV 사용 권장)
const sessions = new Map<string, Session>();

/**
 * 세션 저장
 */
export function saveSession(sessionId: string, session: Session): void {
  sessions.set(sessionId, session);
}

/**
 * 세션 가져오기
 */
export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

/**
 * 세션 삭제
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * 인증 미들웨어 - 로그인 필요
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const cookieHeader = c.req.header('Cookie');
  const cookies = parseCookies(cookieHeader || '');
  const sessionId = cookies['session_id'];

  if (!sessionId) {
    return c.json({ success: false, error: '로그인이 필요합니다.' }, 401);
  }

  const session = getSession(sessionId);
  if (!session) {
    return c.json({ success: false, error: '세션이 만료되었습니다. 다시 로그인해주세요.' }, 401);
  }

  // 세션 정보를 context에 저장
  c.set('session', session);
  c.set('user', session.user);

  await next();
}

/**
 * 관리자 권한 체크 미들웨어
 */
export async function adminMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user') as User | undefined;

  if (!user || user.role !== 'admin') {
    return c.json({ success: false, error: '관리자 권한이 필요합니다.' }, 403);
  }

  await next();
}

/**
 * 페이지 권한 체크 미들웨어
 */
export function pagePermissionMiddleware(pageName: string, type: 'read' | 'write') {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const session = c.get('session') as Session | undefined;
    const user = c.get('user') as User | undefined;

    if (!session || !user) {
      return c.json({ success: false, error: '로그인이 필요합니다.' }, 401);
    }

    // 관리자는 모든 권한 허용
    if (user.role === 'admin') {
      await next();
      return;
    }

    // 권한 체크
    const permission = session.permissions.find((p) => p.page_name === pageName);
    if (!permission) {
      return c.json({ success: false, error: '접근 권한이 없습니다.' }, 403);
    }

    const hasAccess =
      type === 'read' ? permission.can_read === 1 : permission.can_write === 1;

    if (!hasAccess) {
      return c.json(
        { success: false, error: `${type === 'read' ? '읽기' : '쓰기'} 권한이 없습니다.` },
        403
      );
    }

    await next();
  };
}

/**
 * 활동 로그 기록 미들웨어
 */
export async function activityLogMiddleware(
  c: Context<{ Bindings: Env }>,
  action: string,
  targetType: string,
  targetId: number,
  oldValue?: any,
  newValue?: any
) {
  const user = c.get('user') as User | undefined;
  if (!user) return;

  const { DB } = c.env;

  try {
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || '';
    const userAgent = c.req.header('User-Agent') || '';

    await DB.prepare(`
      INSERT INTO activity_logs 
      (user_id, action, target_type, target_id, old_value, new_value, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      action,
      targetType,
      targetId,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ipAddress,
      userAgent
    ).run();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * 알림 생성 헬퍼
 */
export async function createNotification(
  db: D1Database,
  userId: number,
  title: string,
  message: string,
  notificationType: string,
  relatedId?: number,
  relatedType?: string
) {
  try {
    await db.prepare(`
      INSERT INTO notifications 
      (user_id, title, message, notification_type, related_id, related_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, title, message, notificationType, relatedId || null, relatedType || null).run();
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
