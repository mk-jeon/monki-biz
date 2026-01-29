// ============================================================================
// MONKi Biz - 계약현황 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, Contract, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware, activityLogMiddleware, createNotification } from '../middleware/auth';
import { generateContractNumber, getCurrentDateTime } from '../utils';

const contracts = new Hono<{ Bindings: Env }>();
contracts.use('/*', authMiddleware);

// 계약 목록 조회 (칸반보드용)
contracts.get('/', async (c) => {
  try {
    const { DB } = c.env;
    const statuses = ['waiting', 'in_progress', 'signature_waiting', 'completed', 'cancelled'];
    const result: any = {};

    for (const status of statuses) {
      const items = await DB.prepare(`
        SELECT c.*, cu.customer_name, cu.phone, cu.franchise_name, cu.region
        FROM contracts c
        LEFT JOIN customers cu ON c.customer_id = cu.id
        WHERE c.contract_status = ?
        ORDER BY c.created_at DESC LIMIT 100
      `).bind(status).all();
      result[status] = items.results || [];
    }

    return c.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '계약 목록 조회 실패' }, 500);
  }
});

// 계약 상세 조회
contracts.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;
    const item = await DB.prepare(`
      SELECT c.*, cu.* FROM contracts c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE c.id = ?
    `).bind(id).first();
    
    if (!item) return c.json<ApiResponse>({ success: false, error: '계약을 찾을 수 없습니다' }, 404);
    return c.json<ApiResponse>({ success: true, data: item });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '계약 조회 실패' }, 500);
  }
});

// 계약 생성
contracts.post('/', pagePermissionMiddleware('contract', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    const { customer_id } = body;

    const contractNumber = generateContractNumber();
    const result = await DB.prepare(`
      INSERT INTO contracts (customer_id, contract_number, contract_status, created_at)
      VALUES (?, ?, 'waiting', ?)
    `).bind(customer_id, contractNumber, getCurrentDateTime()).run();

    await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
      .bind('contract', 'contract_waiting', customer_id).run();

    await activityLogMiddleware(c, 'create', 'contracts', result.meta.last_row_id || 0, null, body);
    return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '계약 생성 실패' }, 500);
  }
});

// 계약 수정
contracts.put('/:id', pagePermissionMiddleware('contract', 'write'), async (c) => {
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
      await DB.prepare(`UPDATE contracts SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }

    await activityLogMiddleware(c, 'update', 'contracts', id, null, body);
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '계약 수정 실패' }, 500);
  }
});

// 계약 상태 변경
contracts.put('/:id/status', pagePermissionMiddleware('contract', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    const { DB } = c.env;

    await DB.prepare('UPDATE contracts SET contract_status = ?, updated_at = ? WHERE id = ?')
      .bind(status, getCurrentDateTime(), id).run();

    if (status === 'completed') {
      const contract = await DB.prepare('SELECT customer_id FROM contracts WHERE id = ?').bind(id).first();
      if (contract) {
        await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
          .bind('install', 'install_waiting', (contract as any).customer_id).run();
      }
    }

    await activityLogMiddleware(c, 'status_change', 'contracts', id, null, { status });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '상태 변경 실패' }, 500);
  }
});

// 설치현황으로 이관
contracts.post('/:id/transfer-to-installation', pagePermissionMiddleware('contract', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;

    const contract = await DB.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first();
    if (!contract) return c.json<ApiResponse>({ success: false, error: '계약을 찾을 수 없습니다' }, 404);

    const customerId = (contract as any).customer_id;
    await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
      .bind('install', 'install_waiting', customerId).run();
    
    await DB.prepare('UPDATE contracts SET contract_status = ? WHERE id = ?')
      .bind('completed', id).run();

    await activityLogMiddleware(c, 'transfer', 'contracts', id, null, { to: 'installation' });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '이관 실패' }, 500);
  }
});

export default contracts;
