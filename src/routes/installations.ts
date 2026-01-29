// ============================================================================
// MONKi Biz - 설치현황 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, Installation, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware, activityLogMiddleware } from '../middleware/auth';
import { getCurrentDateTime } from '../utils';

const installations = new Hono<{ Bindings: Env }>();
installations.use('/*', authMiddleware);

installations.get('/', async (c) => {
  try {
    const { DB } = c.env;
    const statuses = ['waiting', 'in_progress', 'completion_waiting', 'completed', 'cancelled'];
    const result: any = {};

    for (const status of statuses) {
      const items = await DB.prepare(`
        SELECT i.*, cu.customer_name, cu.phone, cu.franchise_name, cu.region,
               c.contract_number
        FROM installations i
        LEFT JOIN customers cu ON i.customer_id = cu.id
        LEFT JOIN contracts c ON i.contract_id = c.id
        WHERE i.install_status = ?
        ORDER BY i.created_at DESC LIMIT 100
      `).bind(status).all();
      result[status] = items.results || [];
    }

    return c.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '설치 목록 조회 실패' }, 500);
  }
});

installations.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;
    const item = await DB.prepare(`
      SELECT i.*, cu.*, c.contract_number FROM installations i
      LEFT JOIN customers cu ON i.customer_id = cu.id
      LEFT JOIN contracts c ON i.contract_id = c.id
      WHERE i.id = ?
    `).bind(id).first();
    
    if (!item) return c.json<ApiResponse>({ success: false, error: '설치를 찾을 수 없습니다' }, 404);
    return c.json<ApiResponse>({ success: true, data: item });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '설치 조회 실패' }, 500);
  }
});

installations.post('/', pagePermissionMiddleware('installation', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    const { customer_id, contract_id } = body;

    const result = await DB.prepare(`
      INSERT INTO installations (customer_id, contract_id, install_status, created_at)
      VALUES (?, ?, 'waiting', ?)
    `).bind(customer_id, contract_id, getCurrentDateTime()).run();

    await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
      .bind('install', 'install_waiting', customer_id).run();

    await activityLogMiddleware(c, 'create', 'installations', result.meta.last_row_id || 0, null, body);
    return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '설치 생성 실패' }, 500);
  }
});

installations.put('/:id', pagePermissionMiddleware('installation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { DB } = c.env;

    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'customer_id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(getCurrentDateTime());
      values.push(id);
      await DB.prepare(`UPDATE installations SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }

    await activityLogMiddleware(c, 'update', 'installations', id, null, body);
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '설치 수정 실패' }, 500);
  }
});

installations.put('/:id/status', pagePermissionMiddleware('installation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    const { DB } = c.env;

    await DB.prepare('UPDATE installations SET install_status = ?, updated_at = ? WHERE id = ?')
      .bind(status, getCurrentDateTime(), id).run();

    if (status === 'completed') {
      const installation = await DB.prepare('SELECT customer_id FROM installations WHERE id = ?').bind(id).first();
      if (installation) {
        await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
          .bind('operating', 'operating_waiting', (installation as any).customer_id).run();
      }
    }

    await activityLogMiddleware(c, 'status_change', 'installations', id, null, { status });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '상태 변경 실패' }, 500);
  }
});

installations.post('/:id/transfer-to-franchise', pagePermissionMiddleware('installation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;

    const installation = await DB.prepare('SELECT * FROM installations WHERE id = ?').bind(id).first();
    if (!installation) return c.json<ApiResponse>({ success: false, error: '설치를 찾을 수 없습니다' }, 404);

    const customerId = (installation as any).customer_id;
    await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
      .bind('operating', 'operating_waiting', customerId).run();
    
    await DB.prepare('UPDATE installations SET install_status = ? WHERE id = ?')
      .bind('completed', id).run();

    await activityLogMiddleware(c, 'transfer', 'installations', id, null, { to: 'franchise' });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '이관 실패' }, 500);
  }
});

export default installations;
