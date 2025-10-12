import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// アラートの型定義
export interface PaymentAlert {
  id: string;
  tenantId: string;

  // アラートの種類
  type: 'upcoming' | 'due_today' | 'overdue' | 'large_amount';
  severity: 'info' | 'warning' | 'danger' | 'critical';

  // 関連情報
  scheduleId: string;
  invoiceId: string;
  invoiceNo: string;

  // 顧客情報
  customerName?: string;
  customerCompany?: string;

  // 金額情報
  amount: number;

  // 日付情報
  scheduledDate: string;
  daysUntilDue: number; // マイナスは遅延日数

  // アラートメッセージ
  title: string;
  message: string;
  actionRequired?: string;

  // 優先度（数値が大きいほど優先）
  priority: number;

  // ステータス
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedAt?: string;
  acknowledgedBy?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
}

// アラート統計
export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: {
    info: number;
    warning: number;
    danger: number;
    critical: number;
  };
  byType: {
    upcoming: number;
    due_today: number;
    overdue: number;
    large_amount: number;
  };
  totalAmount: number; // 全アラート対象の合計金額
  overdueAmount: number; // 遅延中の合計金額
}

// メモリ内データストア
let alerts: Map<string, PaymentAlert[]> = new Map();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 入金予定からアラートを生成
async function generateAlertsFromSchedules(tenantId: string): Promise<PaymentAlert[]> {
  try {
    // 入金予定APIからデータを取得（本来は直接データストアにアクセスするか、内部API呼び出し）
    // ここでは簡易実装として、サンプルデータから生成
    const generatedAlerts: PaymentAlert[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // サンプルアラートデータ（実際は payment-schedules から動的生成）
    const sampleAlerts: PaymentAlert[] = [
      // 7日以内（警告）
      {
        id: 'ALERT-2024-001',
        tenantId,
        type: 'upcoming',
        severity: 'warning',
        scheduleId: 'SCH-2024-003',
        invoiceId: 'INV-2024-003',
        invoiceNo: 'INV-2024-003',
        customerName: '鈴木 健太',
        customerCompany: '住友建設株式会社',
        amount: 15400000,
        scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString().split('T')[0],
        daysUntilDue: 5,
        title: '入金期日が近づいています',
        message: '住友建設株式会社 様の入金予定日（INV-2024-003）まで5日です',
        actionRequired: '顧客に入金確認の連絡をおすすめします',
        priority: 60,
        status: 'active',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },

      // 当日（危険）
      {
        id: 'ALERT-2024-002',
        tenantId,
        type: 'due_today',
        severity: 'danger',
        scheduleId: 'SCH-2024-004',
        invoiceId: 'INV-2024-004',
        invoiceNo: 'INV-2024-004',
        customerName: '佐々木 誠',
        customerCompany: 'みずほ不動産開発',
        amount: 8250000,
        scheduledDate: now.toISOString().split('T')[0],
        daysUntilDue: 0,
        title: '本日が入金期日です',
        message: 'みずほ不動産開発 様の入金予定日（INV-2024-004 分割1/3）が本日です',
        actionRequired: '入金確認を行ってください。未入金の場合は速やかに連絡が必要です',
        priority: 80,
        status: 'active',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },

      // 遅延（重大）
      {
        id: 'ALERT-2024-003',
        tenantId,
        type: 'overdue',
        severity: 'critical',
        scheduleId: 'SCH-2024-005',
        invoiceId: 'INV-2024-005',
        invoiceNo: 'INV-2024-005',
        customerName: '中村 大輔',
        customerCompany: '三井ホーム',
        amount: 12100000,
        scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString().split('T')[0],
        daysUntilDue: -3,
        title: '入金が遅延しています',
        message: '三井ホーム 様の入金（INV-2024-005）が3日遅延しています',
        actionRequired: '至急、顧客に督促連絡を行ってください。経理部長への報告も必要です',
        priority: 100,
        status: 'active',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
        updatedAt: now.toISOString(),
      },

      // 高額入金予定（情報）
      {
        id: 'ALERT-2024-004',
        tenantId,
        type: 'large_amount',
        severity: 'info',
        scheduleId: 'SCH-2024-002',
        invoiceId: 'INV-2024-001',
        invoiceNo: 'INV-2024-001',
        customerName: '田中 太郎',
        customerCompany: '東京建設',
        amount: 28600000,
        scheduledDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15).toISOString().split('T')[0],
        daysUntilDue: 15,
        title: '高額入金予定があります',
        message: '東京建設 様から2,860万円の入金予定（INV-2024-001）が15日後です',
        actionRequired: '事前に入金確認を行い、資金計画に反映させてください',
        priority: 40,
        status: 'active',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },

      // 過去に確認済みのアラート（例）
      {
        id: 'ALERT-2024-005',
        tenantId,
        type: 'upcoming',
        severity: 'warning',
        scheduleId: 'SCH-2024-006',
        invoiceId: 'INV-2024-004',
        invoiceNo: 'INV-2024-004',
        customerName: '佐々木 誠',
        customerCompany: 'みずほ不動産開発',
        amount: 8250000,
        scheduledDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString().split('T')[0],
        daysUntilDue: 30,
        title: '分割払い次回予定',
        message: 'みずほ不動産開発 様の分割払い2回目（INV-2024-004）が30日後です',
        actionRequired: '前回の入金確認後、次回の予定を顧客と再確認してください',
        priority: 30,
        status: 'acknowledged',
        acknowledgedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
        acknowledgedBy: '経理担当 佐藤',
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5).toISOString(),
        updatedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
      },
    ];

    return sampleAlerts;
  } catch (error) {
    console.error('Failed to generate alerts from schedules:', error);
    return [];
  }
}

// 初期化
const initializeSampleData = async () => {
  const demoTenantId = 'demo-tenant';
  const demoAlerts = await generateAlertsFromSchedules(demoTenantId);
  alerts.set(demoTenantId, demoAlerts);
};

initializeSampleData();

// GET: アラート一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    let tenantAlerts = alerts.get(tenantId) || [];

    // データがない場合は自動生成
    if (tenantAlerts.length === 0) {
      tenantAlerts = await generateAlertsFromSchedules(tenantId);
      alerts.set(tenantId, tenantAlerts);
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoiceId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let filteredAlerts = [...tenantAlerts];

    // アラートID指定
    if (alertId) {
      const alert = filteredAlerts.find(a => a.id === alertId);
      if (!alert) {
        return NextResponse.json(
          { success: false, error: 'Alert not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        alert: alert,
      });
    }

    // 種類フィルタ
    if (type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === type);
    }

    // 重要度フィルタ
    if (severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
    }

    // ステータスフィルタ
    if (status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === status);
    }

    // アクティブのみ
    if (activeOnly) {
      filteredAlerts = filteredAlerts.filter(a => a.status === 'active');
    }

    // 請求書IDフィルタ
    if (invoiceId) {
      filteredAlerts = filteredAlerts.filter(a => a.invoiceId === invoiceId);
    }

    // 優先度の高い順にソート
    filteredAlerts.sort((a, b) => b.priority - a.priority);

    // 統計情報を計算
    const stats: AlertStats = {
      total: filteredAlerts.length,
      active: filteredAlerts.filter(a => a.status === 'active').length,
      acknowledged: filteredAlerts.filter(a => a.status === 'acknowledged').length,
      resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        info: filteredAlerts.filter(a => a.severity === 'info').length,
        warning: filteredAlerts.filter(a => a.severity === 'warning').length,
        danger: filteredAlerts.filter(a => a.severity === 'danger').length,
        critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      },
      byType: {
        upcoming: filteredAlerts.filter(a => a.type === 'upcoming').length,
        due_today: filteredAlerts.filter(a => a.type === 'due_today').length,
        overdue: filteredAlerts.filter(a => a.type === 'overdue').length,
        large_amount: filteredAlerts.filter(a => a.type === 'large_amount').length,
      },
      totalAmount: filteredAlerts.reduce((sum, a) => sum + a.amount, 0),
      overdueAmount: filteredAlerts
        .filter(a => a.type === 'overdue')
        .reduce((sum, a) => sum + a.amount, 0),
    };

    return NextResponse.json({
      success: true,
      alerts: filteredAlerts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching payment alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment alerts' },
      { status: 500 }
    );
  }
}

// POST: アラートの確認・更新
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, action, acknowledgedBy } = body;

    const tenantAlerts = alerts.get(tenantId) || [];
    const alert = tenantAlerts.find(a => a.id === id);

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // アクションに応じてステータスを更新
    switch (action) {
      case 'acknowledge':
        alert.status = 'acknowledged';
        alert.acknowledgedAt = now;
        alert.acknowledgedBy = acknowledgedBy;
        break;
      case 'resolve':
        alert.status = 'resolved';
        break;
      case 'dismiss':
        alert.status = 'dismissed';
        break;
      case 'reactivate':
        alert.status = 'active';
        alert.acknowledgedAt = undefined;
        alert.acknowledgedBy = undefined;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    alert.updatedAt = now;
    alerts.set(tenantId, tenantAlerts);

    return NextResponse.json({
      success: true,
      alert: alert,
      message: `Alert ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// PUT: アラートの一括更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { ids, action, acknowledgedBy } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alert IDs array is required' },
        { status: 400 }
      );
    }

    const tenantAlerts = alerts.get(tenantId) || [];
    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const id of ids) {
      const alert = tenantAlerts.find(a => a.id === id);
      if (alert) {
        switch (action) {
          case 'acknowledge':
            alert.status = 'acknowledged';
            alert.acknowledgedAt = now;
            alert.acknowledgedBy = acknowledgedBy;
            break;
          case 'resolve':
            alert.status = 'resolved';
            break;
          case 'dismiss':
            alert.status = 'dismissed';
            break;
        }
        alert.updatedAt = now;
        updatedCount++;
      }
    }

    alerts.set(tenantId, tenantAlerts);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} alerts ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error bulk updating alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update alerts' },
      { status: 500 }
    );
  }
}

// DELETE: アラート削除（物理削除）
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const tenantAlerts = alerts.get(tenantId) || [];
    const alertIndex = tenantAlerts.findIndex(a => a.id === alertId);

    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    // 物理削除
    tenantAlerts.splice(alertIndex, 1);
    alerts.set(tenantId, tenantAlerts);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}

// ヘルパー関数: 全アラートを再生成（定期実行用）
export async function regenerateAllAlerts(tenantId: string): Promise<number> {
  try {
    const newAlerts = await generateAlertsFromSchedules(tenantId);

    // 既存の確認済み/解決済みステータスを保持
    const existingAlerts = alerts.get(tenantId) || [];
    const acknowledgedAlerts = existingAlerts.filter(
      a => a.status === 'acknowledged' || a.status === 'resolved'
    );

    // 新しいアラートとマージ
    const mergedAlerts = [...newAlerts];
    for (const acknowledged of acknowledgedAlerts) {
      const exists = mergedAlerts.find(a => a.scheduleId === acknowledged.scheduleId);
      if (exists) {
        // 既存のステータスを保持
        exists.status = acknowledged.status;
        exists.acknowledgedAt = acknowledged.acknowledgedAt;
        exists.acknowledgedBy = acknowledged.acknowledgedBy;
      }
    }

    alerts.set(tenantId, mergedAlerts);

    console.log(`🚨 ${tenantId}: ${mergedAlerts.length}件のアラートを再生成しました`);

    return mergedAlerts.length;
  } catch (error) {
    console.error('Failed to regenerate alerts:', error);
    return 0;
  }
}
