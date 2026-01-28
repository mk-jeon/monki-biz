// ============================================================================
// MONKi Biz - 인증 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, LoginRequest, LoginResponse, User } from '../types';
import { getUserByUserId, getUserPermissions } from '../utils/db';
import { saveSession, deleteSession, getSession } from '../middleware/auth';
import { createCookie, generateSessionId, getCurrentDateTime } from '../utils';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /api/auth/login
 * 로그인 처리
 */
auth.post('/login', async (c) => {
  try {
    const { user_id, password } = await c.req.json<LoginRequest>();

    if (!user_id || !password) {
      return c.json<LoginResponse>({ 
        success: false, 
        message: '아이디와 비밀번호를 입력해주세요.' 
      }, 400);
    }

    const { DB } = c.env;

    // 사용자 조회
    const user = await getUserByUserId(DB, user_id);

    if (!user) {
      return c.json<LoginResponse>({ 
        success: false, 
        message: '아이디 또는 비밀번호가 일치하지 않습니다.' 
      }, 401);
    }

    // 활성화 상태 체크
    if (user.is_active !== 1) {
      return c.json<LoginResponse>({ 
        success: false, 
        message: '비활성화된 계정입니다. 관리자에게 문의하세요.' 
      }, 403);
    }

    // 비밀번호 확인 (실제 프로덕션에서는 bcrypt 등 사용)
    if (user.password !== password) {
      return c.json<LoginResponse>({ 
        success: false, 
        message: '아이디 또는 비밀번호가 일치하지 않습니다.' 
      }, 401);
    }

    // 권한 조회
    const permissions = await getUserPermissions(DB, user.id);

    // 마지막 로그인 시간 업데이트
    await DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(getCurrentDateTime(), user.id)
      .run();

    // 세션 생성
    const sessionId = generateSessionId();
    const { password: _, ...userWithoutPassword } = user;

    saveSession(sessionId, {
      user: userWithoutPassword,
      permissions
    });

    // 세션 쿠키 설정
    const cookie = createCookie('session_id', sessionId, {
      maxAge: 86400, // 24시간
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });

    return c.json<LoginResponse>(
      { 
        success: true, 
        message: '로그인 성공',
        user: userWithoutPassword,
        sessionId
      },
      200,
      {
        'Set-Cookie': cookie
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return c.json<LoginResponse>({ 
      success: false, 
      message: '로그인 처리 중 오류가 발생했습니다.' 
    }, 500);
  }
});

/**
 * POST /api/auth/logout
 * 로그아웃 처리
 */
auth.post('/logout', async (c) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>) || {};

    const sessionId = cookies['session_id'];

    if (sessionId) {
      deleteSession(sessionId);
    }

    // 쿠키 삭제
    const cookie = createCookie('session_id', '', {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });

    return c.json(
      { success: true, message: '로그아웃 성공' },
      200,
      {
        'Set-Cookie': cookie
      }
    );

  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ success: false, message: '로그아웃 처리 중 오류가 발생했습니다.' }, 500);
  }
});

/**
 * GET /api/auth/session
 * 현재 세션 정보 조회
 */
auth.get('/session', async (c) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>) || {};

    const sessionId = cookies['session_id'];

    if (!sessionId) {
      return c.json({ success: false, message: '세션이 없습니다.' }, 401);
    }

    const session = getSession(sessionId);

    if (!session) {
      return c.json({ success: false, message: '세션이 만료되었습니다.' }, 401);
    }

    return c.json({ 
      success: true, 
      data: {
        user: session.user,
        permissions: session.permissions
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return c.json({ success: false, message: '세션 확인 중 오류가 발생했습니다.' }, 500);
  }
});

export default auth;
