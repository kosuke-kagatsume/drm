import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 原価管理設定型定義
interface CostSettings {
  id: string;
  tenantId: string;
  // アラート閾値
  costOverrunThreshold: number;
  profitMarginWarningThreshold: number;
  scheduleDelayThreshold: number;
  // 自動承認設定
  autoApprovalEnabled: boolean;
  autoApprovalProfitMargin: number;
  // 差分表示設定
  differenceUnit: 'yen' | 'thousand' | 'million';
  positiveColor: string;
  negativeColor: string;
  neutralRange: number;
  neutralColor: string;
  // 表示設定
  showPredictedProfit: boolean;
  showCostBreakdown: boolean;
  highlightRiskyProjects: boolean;
  updatedAt: string;
  updatedBy?: string;
}

// メモリ内データストア
let settings: Map<string, CostSettings> = new Map();

// デフォルト設定
function getDefaultSettings(tenantId: string): CostSettings {
  return {
    id: `cost_${tenantId}`,
    tenantId,
    costOverrunThreshold: 10,
    profitMarginWarningThreshold: 5,
    scheduleDelayThreshold: 7,
    autoApprovalEnabled: true,
    autoApprovalProfitMargin: 15,
    differenceUnit: 'yen',
    positiveColor: '#10b981',
    negativeColor: '#ef4444',
    neutralRange: 3,
    neutralColor: '#6b7280',
    showPredictedProfit: true,
    showCostBreakdown: true,
    highlightRiskyProjects: true,
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
    console.error('Error fetching cost settings:', error);
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
    if (body.costOverrunThreshold < 0 || body.costOverrunThreshold > 100) {
      return NextResponse.json(
        { success: false, error: 'Cost overrun threshold must be between 0-100%' },
        { status: 400 }
      );
    }

    const updatedSettings: CostSettings = {
      id: `cost_${tenantId}`,
      tenantId,
      costOverrunThreshold: body.costOverrunThreshold ?? 10,
      profitMarginWarningThreshold: body.profitMarginWarningThreshold ?? 5,
      scheduleDelayThreshold: body.scheduleDelayThreshold ?? 7,
      autoApprovalEnabled: body.autoApprovalEnabled ?? true,
      autoApprovalProfitMargin: body.autoApprovalProfitMargin ?? 15,
      differenceUnit: body.differenceUnit || 'yen',
      positiveColor: body.positiveColor || '#10b981',
      negativeColor: body.negativeColor || '#ef4444',
      neutralRange: body.neutralRange ?? 3,
      neutralColor: body.neutralColor || '#6b7280',
      showPredictedProfit: body.showPredictedProfit ?? true,
      showCostBreakdown: body.showCostBreakdown ?? true,
      highlightRiskyProjects: body.highlightRiskyProjects ?? true,
      updatedAt: new Date().toISOString(),
      updatedBy: body.updatedBy,
    };

    settings.set(tenantId, updatedSettings);

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: '原価管理設定を保存しました',
    });
  } catch (error) {
    console.error('Error saving cost settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
