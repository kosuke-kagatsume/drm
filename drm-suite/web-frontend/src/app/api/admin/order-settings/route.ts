import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 発注管理設定型定義
interface OrderSettings {
  id: string;
  tenantId: string;
  // 発注期限設定
  orderDeadlineDays: number;
  alertBeforeDays: number;
  // 通知設定
  notifySupervisor: boolean;
  notifyDepartmentHead: boolean;
  notifyCEO: boolean;
  // 承認ルート設定
  approvalThresholds: {
    under1M: string;
    from1Mto5M: string;
    from5Mto10M: string;
    over10M: string;
  };
  // DW連携設定
  dwApiEndpoint: string;
  dwApiKey: string;
  placeCode: string;
  syncFrequency: string;
  updatedAt: string;
  updatedBy?: string;
}

// メモリ内データストア
let settings: Map<string, OrderSettings> = new Map();

// デフォルト設定
function getDefaultSettings(tenantId: string): OrderSettings {
  return {
    id: `order_${tenantId}`,
    tenantId,
    orderDeadlineDays: 7,
    alertBeforeDays: 5,
    notifySupervisor: true,
    notifyDepartmentHead: true,
    notifyCEO: false,
    approvalThresholds: {
      under1M: 'auto',
      from1Mto5M: 'manager',
      from5Mto10M: 'department_head',
      over10M: 'executive',
    },
    dwApiEndpoint: '',
    dwApiKey: '',
    placeCode: '',
    syncFrequency: 'daily',
    updatedAt: new Date().toISOString(),
  };
}

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// GET: 設定取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    let tenantSettings = settings.get(tenantId);
    if (!tenantSettings) {
      tenantSettings = getDefaultSettings(tenantId);
      settings.set(tenantId, tenantSettings);
    }

    return NextResponse.json({
      success: true,
      settings: tenantSettings,
    });
  } catch (error) {
    console.error('Error fetching order settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST: 設定保存
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    // バリデーション
    if (body.orderDeadlineDays < 1 || body.orderDeadlineDays > 30) {
      return NextResponse.json(
        { success: false, error: 'Order deadline must be between 1-30 days' },
        { status: 400 }
      );
    }

    const updatedSettings: OrderSettings = {
      id: `order_${tenantId}`,
      tenantId,
      orderDeadlineDays: body.orderDeadlineDays || 7,
      alertBeforeDays: body.alertBeforeDays || 5,
      notifySupervisor: body.notifySupervisor ?? true,
      notifyDepartmentHead: body.notifyDepartmentHead ?? true,
      notifyCEO: body.notifyCEO ?? false,
      approvalThresholds: {
        under1M: body.approvalThresholds?.under1M || 'auto',
        from1Mto5M: body.approvalThresholds?.from1Mto5M || 'manager',
        from5Mto10M: body.approvalThresholds?.from5Mto10M || 'department_head',
        over10M: body.approvalThresholds?.over10M || 'executive',
      },
      dwApiEndpoint: body.dwApiEndpoint || '',
      dwApiKey: body.dwApiKey || '',
      placeCode: body.placeCode || '',
      syncFrequency: body.syncFrequency || 'daily',
      updatedAt: new Date().toISOString(),
      updatedBy: body.updatedBy,
    };

    settings.set(tenantId, updatedSettings);

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: '発注管理設定を保存しました',
    });
  } catch (error) {
    console.error('Error saving order settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
