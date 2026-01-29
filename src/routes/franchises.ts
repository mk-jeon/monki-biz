// ============================================================================
// MONKi Biz - 가맹점현황 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, Franchise, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware, activityLogMiddleware } from '../middleware/auth';
import { generateFranchiseCode, getCurrentDateTime } from '../utils';

const franchises = new Hono<{ Bindings: Env }>();
franchises.use('/*', authMiddleware);

franchises.get('/', async (c) => {
  try {
    const { DB } = c.env;
    const { search, status } = c.req.query();
    
    let query = 'SELECT * FROM franchises WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (franchise_name LIKE ? OR representative LIKE ? OR contact LIKE ? OR franchise_code LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status) {
      query += ' AND operating_status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 500';

    const result = await DB.prepare(query).bind(...params).all();
    return c.json<ApiResponse>({ success: true, data: result.results });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '가맹점 목록 조회 실패' }, 500);
  }
});

franchises.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;
    
    const franchise = await DB.prepare('SELECT * FROM franchises WHERE id = ?').bind(id).first();
    if (!franchise) return c.json<ApiResponse>({ success: false, error: '가맹점을 찾을 수 없습니다' }, 404);
    
    return c.json<ApiResponse>({ success: true, data: franchise });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '가맹점 조회 실패' }, 500);
  }
});

franchises.post('/', pagePermissionMiddleware('franchise', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    const { customer_id, contract_id, installation_id } = body;

    const franchiseCode = generateFranchiseCode();
    
    // 고객, 계약, 설치 정보 가져오기
    const customer = await DB.prepare('SELECT * FROM customers WHERE id = ?').bind(customer_id).first();
    const contract = contract_id ? await DB.prepare('SELECT * FROM contracts WHERE id = ?').bind(contract_id).first() : null;
    const installation = installation_id ? await DB.prepare('SELECT * FROM installations WHERE id = ?').bind(installation_id).first() : null;

    if (!customer) return c.json<ApiResponse>({ success: false, error: '고객을 찾을 수 없습니다' }, 404);

    const cust = customer as any;
    const cont = contract as any;
    const inst = installation as any;

    const result = await DB.prepare(`
      INSERT INTO franchises (
        customer_id, contract_id, installation_id, franchise_code,
        franchise_name, business_number, representative, contact, email,
        region_type, region, administrative_district, road_address, detail_address,
        contract_number, contract_date, install_date,
        operating_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).bind(
      customer_id, contract_id, installation_id, franchiseCode,
      cust?.franchise_name, cust?.business_number, cust?.customer_name, cust?.phone, cust?.email,
      cust?.region_type, cust?.region, cust?.administrative_district, cust?.road_address, cust?.detail_address,
      cont?.contract_number, cont?.contract_date, inst?.install_date,
      getCurrentDateTime()
    ).run();

    await DB.prepare('UPDATE customers SET current_stage = ?, current_status = ? WHERE id = ?')
      .bind('operating', 'active', customer_id).run();

    await activityLogMiddleware(c, 'create', 'franchises', result.meta.last_row_id || 0, null, body);
    return c.json<ApiResponse>({ success: true, data: { id: result.meta.last_row_id } });
  } catch (error) {
    console.error('Create franchise error:', error);
    return c.json<ApiResponse>({ success: false, error: '가맹점 등재 실패' }, 500);
  }
});

franchises.put('/:id', pagePermissionMiddleware('franchise', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { DB } = c.env;

    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'franchise_code' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      values.push(getCurrentDateTime());
      values.push(id);
      await DB.prepare(`UPDATE franchises SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }

    await activityLogMiddleware(c, 'update', 'franchises', id, null, body);
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '가맹점 수정 실패' }, 500);
  }
});

franchises.put('/:id/status', pagePermissionMiddleware('franchise', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    const { DB } = c.env;

    await DB.prepare('UPDATE franchises SET operating_status = ?, updated_at = ? WHERE id = ?')
      .bind(status, getCurrentDateTime(), id).run();

    await activityLogMiddleware(c, 'status_change', 'franchises', id, null, { status });
    return c.json<ApiResponse>({ success: true });
  } catch (error) {
    return c.json<ApiResponse>({ success: false, error: '상태 변경 실패' }, 500);
  }
});

export default franchises;
