// ============================================================================
// MONKi Biz - A/S 관리 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware, activityLogMiddleware } from '../middleware/auth';
import { getCurrentDateTime } from '../utils';

const as_service = new Hono<{ Bindings: Env }>();
as_service.use('/*', authMiddleware);

// 인바운드 현황 조회
as_service.get('/inbound', async (c) => {
  try {
    const { DB } = c.env;
    const result = await DB.prepare(`
      SELECT * FROM inbound_requests
      ORDER BY created_at DESC
      LIMIT 500
    `).all();
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '인바운드 조회 실패' }, 500);
  }
});

// 인바운드 생성
as_service.post('/inbound', pagePermissionMiddleware('as', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    
    const {
      inbound_date, inbound_time, inquiry_type, progress_stage,
      franchise_name, contact, inquiry_content, inquiry_category,
      inbound_channel, program, receiver, memo
    } = body;

    const result = await DB.prepare(`
      INSERT INTO inbound_requests (
        inbound_date, inbound_time, inquiry_type, progress_stage,
        franchise_name, contact, inquiry_content, inquiry_category,
        inbound_channel, program, receiver, memo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      inbound_date, inbound_time, inquiry_type, progress_stage,
      franchise_name, contact, inquiry_content, inquiry_category,
      inbound_channel, program, receiver, memo, getCurrentDateTime()
    ).run();

    await activityLogMiddleware(c, 'create', 'inbound_requests', result.meta.last_row_id || 0, null, body);
    return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '인바운드 생성 실패' }, 500);
  }
});

// 인바운드 수정
as_service.put('/inbound/:id', pagePermissionMiddleware('as', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { DB } = c.env;

    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(getCurrentDateTime());
      values.push(id);
      await DB.prepare(`UPDATE inbound_requests SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }

    await activityLogMiddleware(c, 'update', 'inbound_requests', id, null, body);
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '인바운드 수정 실패' }, 500);
  }
});

// 방문 A/S 현황 조회 (칸반보드용)
as_service.get('/requests', async (c) => {
  try {
    const { DB } = c.env;
    const statuses = ['registered', 'visit_scheduled', 'in_progress', 'replaced', 'qa_checking', 
                      'manufacturer_sent', 'manufacturer_repair', 'manufacturer_shipping', 'completed'];
    const result: any = {};

    for (const status of statuses) {
      const items = await DB.prepare(`
        SELECT ar.*, u.name as assigned_user_name
        FROM as_requests ar
        LEFT JOIN users u ON ar.assigned_user_id = u.id
        WHERE ar.status = ?
        ORDER BY ar.created_at DESC LIMIT 100
      `).bind(status).all();
      result[status] = items.results || [];
    }

    return c.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: 'A/S 요청 조회 실패' }, 500);
  }
});

// 방문 A/S 생성
as_service.post('/requests', pagePermissionMiddleware('as', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    const user = c.get('user');
    
    const {
      inbound_id, franchise_name, contact, request_date,
      equipment_type, equipment_model, serial_number,
      issue_description, memo
    } = body;

    const result = await DB.prepare(`
      INSERT INTO as_requests (
        inbound_id, franchise_name, contact, request_date,
        equipment_type, equipment_model, serial_number,
        issue_description, status, assigned_user_id, memo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'registered', ?, ?, ?)
    `).bind(
      inbound_id, franchise_name, contact, request_date,
      equipment_type, equipment_model, serial_number,
      issue_description, user.id, memo, getCurrentDateTime()
    ).run();

    // 인바운드에서 이관된 경우 needs_visit 업데이트
    if (inbound_id) {
      await DB.prepare('UPDATE inbound_requests SET needs_visit = 1 WHERE id = ?').bind(inbound_id).run();
    }

    await activityLogMiddleware(c, 'create', 'as_requests', result.meta.last_row_id || 0, null, body);
    return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: 'A/S 요청 생성 실패' }, 500);
  }
});

// A/S 상태 변경
as_service.put('/requests/:id/status', pagePermissionMiddleware('as', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status, detailed_status } = await c.req.json();
    const { DB } = c.env;

    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (detailed_status) {
      updates.push('detailed_status = ?');
      values.push(detailed_status);
    }

    updates.push('updated_at = ?');
    values.push(getCurrentDateTime());
    values.push(id);

    await DB.prepare(`UPDATE as_requests SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
    await activityLogMiddleware(c, 'status_change', 'as_requests', id, null, { status, detailed_status });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '상태 변경 실패' }, 500);
  }
});

// A/S 대시보드 통계
as_service.get('/dashboard', async (c) => {
  try {
    const { DB } = c.env;

    // 전체 통계
    const totalStats = await DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('registered', 'visit_scheduled') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('in_progress', 'replaced', 'qa_checking') THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status IN ('manufacturer_sent', 'manufacturer_repair', 'manufacturer_shipping') THEN 1 ELSE 0 END) as at_manufacturer,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN detailed_status IN ('보류', '지연', '취소') THEN 1 ELSE 0 END) as issues
      FROM as_requests
      WHERE created_at >= datetime('now', '-30 days')
    `).first();

    // 최근 A/S 건
    const recentRequests = await DB.prepare(`
      SELECT ar.*, u.name as assigned_user_name
      FROM as_requests ar
      LEFT JOIN users u ON ar.assigned_user_id = u.id
      ORDER BY ar.created_at DESC
      LIMIT 10
    `).all();

    return c.json<ApiResponse>({
      success: true,
      data: {
        stats: totalStats,
        recent: recentRequests.results
      }
    });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '대시보드 조회 실패' }, 500);
  }
});

export default as_service;
