// ============================================================================
// MONKi Biz - 상담현황 API 라우트
// ============================================================================

import { Hono } from 'hono';
import { Env, Consultation, Customer, ApiResponse } from '../types';
import { authMiddleware, pagePermissionMiddleware, activityLogMiddleware, createNotification } from '../middleware/auth';
import { 
  generateCustomerCode, 
  getCurrentDateTime,
  getErrorMessage 
} from '../utils';
import {
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  createConsultation,
  updateConsultation,
  getConsultationsByStatus
} from '../utils/db';

const consultations = new Hono<{ Bindings: Env }>();

// 모든 라우트에 인증 필요
consultations.use('/*', authMiddleware);

/**
 * GET /api/consultations
 * 상담 목록 조회 (칸반보드용)
 */
consultations.get('/', async (c) => {
  try {
    const { DB } = c.env;
    
    // 상태별로 그룹화된 데이터 조회
    const statuses = ['waiting', 'in_progress', 'completed', 'cancelled'];
    const result: any = {};

    for (const status of statuses) {
      const consultations = await DB.prepare(`
        SELECT 
          c.*,
          cu.customer_code,
          cu.customer_name,
          cu.phone,
          cu.franchise_name,
          cu.region,
          cu.inbound_channel,
          u.name as assigned_user_name
        FROM consultations c
        LEFT JOIN customers cu ON c.customer_id = cu.id
        LEFT JOIN users u ON cu.sales_user_id = u.id
        WHERE c.consult_status = ?
        ORDER BY c.created_at DESC
        LIMIT 100
      `).bind(status).all();

      result[status] = consultations.results || [];
    }

    return c.json<ApiResponse>({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get consultations error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '상담 목록 조회 중 오류가 발생했습니다.'
    }, 500);
  }
});

/**
 * GET /api/consultations/:id
 * 상담 상세 조회
 */
consultations.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;

    const consultation = await DB.prepare(`
      SELECT 
        c.*,
        cu.customer_code,
        cu.customer_name,
        cu.phone,
        cu.email,
        cu.franchise_name,
        cu.business_number,
        cu.region_type,
        cu.region,
        cu.administrative_district,
        cu.road_address,
        cu.detail_address,
        cu.is_operating,
        cu.open_date,
        cu.business_type,
        cu.pos_program,
        cu.pos_vendor,
        cu.inbound_channel,
        cu.inbound_date,
        marketing.name as marketing_user_name,
        sales.name as sales_user_name
      FROM consultations c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN users marketing ON cu.marketing_user_id = marketing.id
      LEFT JOIN users sales ON cu.sales_user_id = sales.id
      WHERE c.id = ?
    `).bind(id).first();

    if (!consultation) {
      return c.json<ApiResponse>({
        success: false,
        error: '상담 내역을 찾을 수 없습니다.'
      }, 404);
    }

    return c.json<ApiResponse>({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Get consultation detail error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '상담 상세 조회 중 오류가 발생했습니다.'
    }, 500);
  }
});

/**
 * POST /api/consultations
 * 신규 상담 등록
 */
consultations.post('/', pagePermissionMiddleware('consultation', 'write'), async (c) => {
  try {
    const body = await c.req.json();
    const { DB } = c.env;
    const user = c.get('user');

    const {
      phone,
      customer_name,
      region,
      inbound_channel,
      consult_subject,
      content
    } = body;

    // 필수 필드 체크
    if (!phone) {
      return c.json<ApiResponse>({
        success: false,
        error: '전화번호는 필수입니다.'
      }, 400);
    }

    // 기존 고객 확인
    let customer = await getCustomerByPhone(DB, phone);
    let customerId: number;

    if (customer) {
      // 기존 고객
      customerId = customer.id;
      
      // 고객 정보 업데이트 (제공된 정보가 있으면)
      await updateCustomer(DB, customerId, {
        customer_name: customer_name || customer.customer_name,
        region: region || customer.region,
        current_stage: 'consult',
        sales_user_id: user.id
      });
    } else {
      // 신규 고객 생성
      const customerCode = generateCustomerCode();
      customerId = await createCustomer(DB, {
        customer_code: customerCode,
        phone,
        customer_name,
        region,
        inbound_channel,
        inbound_date: getCurrentDateTime(),
        current_stage: 'consult',
        current_status: 'waiting',
        marketing_user_id: user.department === '마케팅' ? user.id : undefined,
        sales_user_id: user.department === '영업' ? user.id : undefined
      });
    }

    // 상담 내역 생성
    const consultationId = await createConsultation(DB, {
      customer_id: customerId,
      consult_date: getCurrentDateTime(),
      consult_subject,
      consult_status: 'waiting',
      content
    });

    // 활동 로그
    await activityLogMiddleware(c, 'create', 'consultations', consultationId, null, { phone, customer_name });

    // 알림 생성 (영업 담당자에게)
    if (user.department === '마케팅') {
      // 마케팅이 등록한 경우, 영업팀에 알림
      const salesUsers = await DB.prepare("SELECT id FROM users WHERE department = '영업' AND is_active = 1").all();
      for (const salesUser of salesUsers.results || []) {
        await createNotification(
          DB,
          (salesUser as any).id,
          '새로운 상담 요청',
          `${customer_name || phone} 고객의 상담이 등록되었습니다.`,
          'new_consultation',
          consultationId,
          'consultations'
        );
      }
    }

    return c.json<ApiResponse>({
      success: true,
      message: '상담이 등록되었습니다.',
      data: { id: consultationId, customer_id: customerId }
    });

  } catch (error) {
    console.error('Create consultation error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '상담 등록 중 오류가 발생했습니다.'
    }, 500);
  }
});

/**
 * PUT /api/consultations/:id
 * 상담 정보 수정
 */
consultations.put('/:id', pagePermissionMiddleware('consultation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { DB } = c.env;

    // 기존 상담 조회
    const existingConsultation = await DB.prepare('SELECT * FROM consultations WHERE id = ?').bind(id).first();
    
    if (!existingConsultation) {
      return c.json<ApiResponse>({
        success: false,
        error: '상담 내역을 찾을 수 없습니다.'
      }, 404);
    }

    // 상담 정보 업데이트
    await updateConsultation(DB, id, body);

    // 고객 정보도 함께 업데이트 (제공된 경우)
    if (body.customer_updates) {
      const consultation = existingConsultation as any;
      await updateCustomer(DB, consultation.customer_id, body.customer_updates);
    }

    // 활동 로그
    await activityLogMiddleware(c, 'update', 'consultations', id, existingConsultation, body);

    return c.json<ApiResponse>({
      success: true,
      message: '상담 정보가 수정되었습니다.'
    });

  } catch (error) {
    console.error('Update consultation error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '상담 정보 수정 중 오류가 발생했습니다.'
    }, 500);
  }
});

/**
 * PUT /api/consultations/:id/status
 * 상담 상태 변경 (드래그앤드롭)
 */
consultations.put('/:id/status', pagePermissionMiddleware('consultation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    const { DB } = c.env;

    // 유효한 상태 체크
    const validStatuses = ['waiting', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return c.json<ApiResponse>({
        success: false,
        error: '유효하지 않은 상태입니다.'
      }, 400);
    }

    // 상태 업데이트
    await updateConsultation(DB, id, {
      consult_status: status,
      updated_at: getCurrentDateTime()
    });

    // 상담 완료 시 고객 상태도 업데이트
    if (status === 'completed') {
      const consultation = await DB.prepare('SELECT customer_id FROM consultations WHERE id = ?').bind(id).first();
      if (consultation) {
        await updateCustomer(DB, (consultation as any).customer_id, {
          current_status: 'consult_completed'
        });
      }
    }

    // 활동 로그
    await activityLogMiddleware(c, 'status_change', 'consultations', id, null, { status });

    return c.json<ApiResponse>({
      success: true,
      message: '상태가 변경되었습니다.'
    });

  } catch (error) {
    console.error('Update consultation status error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '상태 변경 중 오류가 발생했습니다.'
    }, 500);
  }
});

/**
 * DELETE /api/consultations/:id
 * 상담 삭제 (실제로는 상태를 cancelled로 변경)
 */
consultations.delete('/:id', pagePermissionMiddleware('consultation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;

    await updateConsultation(DB, id, {
      consult_status: 'cancelled',
      updated_at: getCurrentDateTime()
    });

    // 활동 로그
    await activityLogMiddleware(c, 'delete', 'consultations', id, null, null);

    return c.json<ApiResponse>({
      success: true,
      message: '상담이 취소되었습니다.'
    });

  } catch (error) {
    console.error('Delete consultation error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '상담 삭제 중 오류가 발생했습니다.'
    }, 500);
  }
});

/**
 * POST /api/consultations/:id/transfer-to-contract
 * 계약현황으로 이관
 */
consultations.post('/:id/transfer-to-contract', pagePermissionMiddleware('consultation', 'write'), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { DB } = c.env;

    // 상담 정보 조회
    const consultation = await DB.prepare('SELECT * FROM consultations WHERE id = ?').bind(id).first();
    
    if (!consultation) {
      return c.json<ApiResponse>({
        success: false,
        error: '상담 내역을 찾을 수 없습니다.'
      }, 404);
    }

    const customerId = (consultation as any).customer_id;

    // 고객 단계 업데이트
    await updateCustomer(DB, customerId, {
      current_stage: 'contract',
      current_status: 'contract_waiting'
    });

    // 상담 상태 완료로 변경
    await updateConsultation(DB, id, {
      consult_status: 'completed',
      contract_success: 1,
      updated_at: getCurrentDateTime()
    });

    // 운영팀에 알림
    const operationUsers = await DB.prepare("SELECT id FROM users WHERE department = '운영' AND is_active = 1").all();
    for (const opUser of operationUsers.results || []) {
      await createNotification(
        DB,
        (opUser as any).id,
        '새로운 계약 대기',
        `상담 완료된 고객이 계약 단계로 이관되었습니다.`,
        'new_contract',
        customerId,
        'customers'
      );
    }

    // 활동 로그
    await activityLogMiddleware(c, 'transfer', 'consultations', id, null, { to: 'contract' });

    return c.json<ApiResponse>({
      success: true,
      message: '계약현황으로 이관되었습니다.'
    });

  } catch (error) {
    console.error('Transfer to contract error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: '계약 이관 중 오류가 발생했습니다.'
    }, 500);
  }
});

export default consultations;
