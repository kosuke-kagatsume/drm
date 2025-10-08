import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 分割請求パターン型定義
interface BillingPattern {
  id: string;
  name: string;
  percentages: number[];
}

// 請求設定型定義
interface BillingSettings {
  id: string;
  tenantId: string;
  // 請求タイミング
  billingTiming: 'milestone' | 'schedule' | 'progress';
  // 分割請求パターン
  splitPatterns: BillingPattern[];
  activePatternId: string;
  // 自動化設定
  autoSendInvoice: boolean;
  autoSendReminder: boolean;
  reminderDaysBefore: number;
  // その他
  includeProgressInInvoice: boolean;
  updatedAt: string;
  updatedBy?: string;
}

// メモリ内データストア
let settings: Map<string, BillingSettings> = new Map();

// デフォルト設定
function getDefaultSettings(tenantId: string): BillingSettings {
  return {
    id: `billing_${tenantId}`,
    tenantId,
    billingTiming: 'milestone',
    splitPatterns: [
      { id: 'pattern1', name: '3分割（30-40-30）', percentages: [30, 40, 30] },
      { id: 'pattern2', name: '4分割（10-30-30-30）', percentages: [10, 30, 30, 30] },
      { id: 'pattern3', name: '2分割（50-50）', percentages: [50, 50] },
    ],
    activePatternId: 'pattern1',
    autoSendInvoice: true,
    autoSendReminder: true,
    reminderDaysBefore: 3,
    includeProgressInInvoice: true,
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
    console.error('Error fetching billing settings:', error);
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

    // パターンのバリデーション
    if (body.splitPatterns) {
      for (const pattern of body.splitPatterns) {
        const total = pattern.percentages.reduce((sum: number, p: number) => sum + p, 0);
        if (total !== 100) {
          return NextResponse.json(
            { success: false, error: `Pattern "${pattern.name}" percentages must sum to 100%` },
            { status: 400 }
          );
        }
      }
    }

    const updatedSettings: BillingSettings = {
      id: `billing_${tenantId}`,
      tenantId,
      billingTiming: body.billingTiming || 'milestone',
      splitPatterns: body.splitPatterns || getDefaultSettings(tenantId).splitPatterns,
      activePatternId: body.activePatternId || 'pattern1',
      autoSendInvoice: body.autoSendInvoice ?? true,
      autoSendReminder: body.autoSendReminder ?? true,
      reminderDaysBefore: body.reminderDaysBefore || 3,
      includeProgressInInvoice: body.includeProgressInInvoice ?? true,
      updatedAt: new Date().toISOString(),
      updatedBy: body.updatedBy,
    };

    settings.set(tenantId, updatedSettings);

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: '請求設定を保存しました',
    });
  } catch (error) {
    console.error('Error saving billing settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
