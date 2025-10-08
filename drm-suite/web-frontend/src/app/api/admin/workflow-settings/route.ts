import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 業務フロー設定型定義
interface WorkflowSettings {
  id: string;
  tenantId: string;
  // 見積→契約変換設定
  autoConvertEnabled: boolean;
  defaultContractTemplate: string;
  // 項目マッピング
  mapEstimateItemsToContract: boolean;
  mapAmountToContract: boolean;
  mapDurationToContract: boolean;
  mapCustomerInfoToContract: boolean;
  // 承認設定
  requireApprovalForConversion: boolean;
  approvalFlowId: string;
  updatedAt: string;
  updatedBy?: string;
}

// メモリ内データストア（本番環境ではデータベースを使用）
let settings: Map<string, WorkflowSettings> = new Map();

// デフォルト設定
function getDefaultSettings(tenantId: string): WorkflowSettings {
  return {
    id: `workflow_${tenantId}`,
    tenantId,
    autoConvertEnabled: true,
    defaultContractTemplate: 'construction',
    mapEstimateItemsToContract: true,
    mapAmountToContract: true,
    mapDurationToContract: true,
    mapCustomerInfoToContract: true,
    requireApprovalForConversion: true,
    approvalFlowId: '',
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

    // テナントの設定がなければデフォルト設定を返す
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
    console.error('Error fetching workflow settings:', error);
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

    // 必須フィールドのバリデーション
    if (typeof body.autoConvertEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    const updatedSettings: WorkflowSettings = {
      id: `workflow_${tenantId}`,
      tenantId,
      autoConvertEnabled: body.autoConvertEnabled,
      defaultContractTemplate: body.defaultContractTemplate || 'construction',
      mapEstimateItemsToContract: body.mapEstimateItemsToContract ?? true,
      mapAmountToContract: body.mapAmountToContract ?? true,
      mapDurationToContract: body.mapDurationToContract ?? true,
      mapCustomerInfoToContract: body.mapCustomerInfoToContract ?? true,
      requireApprovalForConversion: body.requireApprovalForConversion ?? true,
      approvalFlowId: body.approvalFlowId || '',
      updatedAt: new Date().toISOString(),
      updatedBy: body.updatedBy,
    };

    settings.set(tenantId, updatedSettings);

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: '業務フロー設定を保存しました',
    });
  } catch (error) {
    console.error('Error saving workflow settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
