// ============================================================================
// MONKi Biz - 재고관리 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware, activityLogMiddleware } from '../middleware/auth';
import { generateStockRequestNumber, getCurrentDateTime } from '../utils';

const stock = new Hono<{ Bindings: Env }>();
stock.use('/*', authMiddleware);

// 재고 현황 조회
stock.get('/inventory', async (c) => {
  try {
    const { DB } = c.env;
    const result = await DB.prepare(`
      SELECT si.*, l.location_name, l.location_type, i.item_name, i.model_name, ic.category_name
      FROM stock_inventory si
      LEFT JOIN locations l ON si.location_id = l.id
      LEFT JOIN items i ON si.item_id = i.id
      LEFT JOIN item_categories ic ON i.category_id = ic.id
      WHERE l.is_active = 1
      ORDER BY l.location_name, i.item_name
    `).all();
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '재고 조회 실패' }, 500);
  }
});

// 재고 요청 목록 (칸반보드용)
stock.get('/requests', async (c) => {
  try {
    const { DB } = c.env;
    const statuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    const result: any = {};

    for (const status of statuses) {
      const items = await DB.prepare(`
        SELECT sr.*, u.name as requester_name, l.location_name, i.item_name
        FROM stock_requests sr
        LEFT JOIN users u ON sr.requester_id = u.id
        LEFT JOIN locations l ON sr.target_location_id = l.id
        LEFT JOIN items i ON sr.item_id = i.id
        WHERE sr.request_status = ?
        ORDER BY sr.created_at DESC LIMIT 100
      `).bind(status).all();
      result[status] = items.results || [];
    }

    return c.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '재고 요청 조회 실패' }, 500);
  }
});

// 재고 요청 생성
stock.post('/requests', pagePermissionMiddleware('stock', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    const user = c.get('user');
    const { request_type, item_id, quantity, target_location_id, request_reason, memo } = body;

    const requestNumber = generateStockRequestNumber();
    const result = await DB.prepare(`
      INSERT INTO stock_requests (
        request_number, request_type, request_reason, request_status,
        requester_id, target_location_id, item_id, quantity, memo, created_at
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `).bind(
      requestNumber, request_type, request_reason,
      user.id, target_location_id, item_id, quantity, memo,
      getCurrentDateTime()
    ).run();

    await activityLogMiddleware(c, 'create', 'stock_requests', result.meta.last_row_id || 0, null, body);
    return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '재고 요청 생성 실패' }, 500);
  }
});

// 재고 요청 상태 변경
stock.put('/requests/:id/status', pagePermissionMiddleware('stock', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    const { DB } = c.env;
    const user = c.get('user');

    const updates: any = {
      request_status: status,
      updated_at: getCurrentDateTime()
    };

    if (status === 'approved') {
      updates.approver_id = user.id;
      updates.approved_at = getCurrentDateTime();
    } else if (status === 'completed') {
      updates.completed_at = getCurrentDateTime();
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`);
    const values = Object.values(updates);
    values.push(id);

    await DB.prepare(`UPDATE stock_requests SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    await activityLogMiddleware(c, 'status_change', 'stock_requests', id, null, { status });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '상태 변경 실패' }, 500);
  }
});

// 대여 현황 조회
stock.get('/rentals', async (c) => {
  try {
    const { DB } = c.env;
    const result = await DB.prepare(`
      SELECT sr.*, u.name as requester_name, l.location_name, i.item_name
      FROM stock_requests sr
      LEFT JOIN users u ON sr.requester_id = u.id
      LEFT JOIN locations l ON sr.target_location_id = l.id
      LEFT JOIN items i ON sr.item_id = i.id
      WHERE sr.request_reason IN ('일반대여', '데모장비', '시연', 'TEST')
        AND sr.request_status = 'completed'
        AND sr.is_returned = 0
      ORDER BY sr.created_at DESC
    `).all();
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '대여 현황 조회 실패' }, 500);
  }
});

// 반납 처리
stock.put('/rentals/:id/return', pagePermissionMiddleware('stock', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;

    await DB.prepare('UPDATE stock_requests SET is_returned = 1, updated_at = ? WHERE id = ?')
      .bind(getCurrentDateTime(), id).run();

    await activityLogMiddleware(c, 'return', 'stock_requests', id, null, null);
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '반납 처리 실패' }, 500);
  }
});

export default stock;
