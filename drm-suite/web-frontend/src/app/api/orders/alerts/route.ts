import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// アラート型定義
export interface OrderAlert {
  id: string;
  orderId: string;
  contractId: string;
  contractNo: string;
  projectName: string;
  contractSignedDate: string;
  orderDeadline: string;
  daysUntilDeadline: number;
  isOverdue: boolean;
  severity: 'critical' | 'warning' | 'info'; // 0日以下: critical, 1-3日: warning, 4-7日: info
  status: 'draft' | 'pending' | 'approved' | 'sent_to_dw';
  manager: string;
  createdAt: string;
}

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 期限までの残日数を計算
function calculateDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 重要度を判定
function getSeverity(daysUntilDeadline: number): 'critical' | 'warning' | 'info' {
  if (daysUntilDeadline <= 0) return 'critical';
  if (daysUntilDeadline <= 3) return 'warning';
  return 'info';
}

// GET: 発注期限アラート取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity'); // critical, warning, info

    // 発注APIからデータを取得
    const ordersResponse = await fetch(`${request.nextUrl.origin}/api/orders`, {
      headers: {
        Cookie: `tenantId=${tenantId}`,
      },
    });

    if (!ordersResponse.ok) {
      throw new Error('Failed to fetch orders');
    }

    const { orders } = await ordersResponse.json();

    // 未発注・承認待ち・承認済みの契約からアラートを生成
    const alerts: OrderAlert[] = orders
      .filter((order: any) =>
        ['draft', 'pending', 'approved'].includes(order.status)
      )
      .map((order: any) => {
        const daysUntilDeadline = calculateDaysUntilDeadline(order.orderDeadline);
        const alertSeverity = getSeverity(daysUntilDeadline);

        return {
          id: `ALERT-${order.id}`,
          orderId: order.id,
          contractId: order.contractId,
          contractNo: order.contractNo,
          projectName: order.projectName,
          contractSignedDate: order.contractSignedDate,
          orderDeadline: order.orderDeadline,
          daysUntilDeadline,
          isOverdue: daysUntilDeadline < 0,
          severity: alertSeverity,
          status: order.status,
          manager: order.manager,
          createdAt: order.createdAt,
        };
      });

    // 重要度フィルタ
    let filteredAlerts = alerts;
    if (severity) {
      filteredAlerts = alerts.filter(alert => alert.severity === severity);
    }

    // 重要度順、期限順にソート
    const sortedAlerts = filteredAlerts.sort((a, b) => {
      // 重要度でソート
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // 期限でソート（昇順）
      return a.daysUntilDeadline - b.daysUntilDeadline;
    });

    // 統計情報
    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      overdue: alerts.filter(a => a.isOverdue).length,
    };

    return NextResponse.json({
      success: true,
      alerts: sortedAlerts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching order alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order alerts' },
      { status: 500 }
    );
  }
}
