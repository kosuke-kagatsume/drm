import { NextRequest, NextResponse } from 'next/server';

/**
 * キャッシュフロー予定表API
 *
 * 入金予定と支払予定を統合して、キャッシュフロー予定表を生成します。
 * 日次・週次・月次でのキャッシュフロー予測を提供します。
 */

// ============================================================================
// 型定義
// ============================================================================

/**
 * キャッシュフロー項目
 */
interface CashFlowItem {
  id: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: 'payment' | 'disbursement';
  amount: number;
  description: string;
  status: string;
  alertLevel?: 'none' | 'warning' | 'danger' | 'critical';
  relatedId: string;
  relatedNo?: string;
}

/**
 * 日次キャッシュフロー
 */
interface DailyCashFlow {
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  balance: number;
  items: CashFlowItem[];
}

/**
 * 週次キャッシュフロー
 */
interface WeeklyCashFlow {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  inflow: number;
  outflow: number;
  netFlow: number;
  balance: number;
  dailyFlows: DailyCashFlow[];
}

/**
 * 月次キャッシュフロー
 */
interface MonthlyCashFlow {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  balance: number;
  weeklyFlows?: WeeklyCashFlow[];
  dailyFlows?: DailyCashFlow[];
}

/**
 * キャッシュフロー予定表レスポンス
 */
interface CashFlowScheduleResponse {
  success: boolean;
  data: {
    period: {
      startDate: string;
      endDate: string;
      periodType: 'daily' | 'weekly' | 'monthly';
    };
    summary: {
      totalInflow: number;
      totalOutflow: number;
      netCashFlow: number;
      openingBalance: number;
      closingBalance: number;
      minimumBalance: number;
      minimumBalanceDate: string;
    };
    monthlyFlows?: MonthlyCashFlow[];
    weeklyFlows?: WeeklyCashFlow[];
    dailyFlows?: DailyCashFlow[];
  };
  error?: string;
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * テナントIDを取得
 */
function getTenantIdFromRequest(request: NextRequest): string {
  const cookies = request.cookies;
  const tenantId = cookies.get('tenantId')?.value || 'tenant-001';
  return tenantId;
}

/**
 * 日付をYYYY-MM-DD形式に変換
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 週の開始日（月曜日）を取得
 */
function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

/**
 * 週番号を取得
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * 月の開始日を取得
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 月の終了日を取得
 */
function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * 入金予定データを取得（ダミーデータ）
 */
async function getPaymentSchedules(tenantId: string, startDate: string, endDate: string): Promise<any[]> {
  // 実際の実装では /api/payment-schedules を呼び出す
  // ここではダミーデータを返す
  return [
    {
      id: 'PAY-SCH-001',
      invoiceNo: 'INV-2024-001',
      scheduledDate: '2025-01-15',
      amount: 5000000,
      status: 'scheduled',
      alertLevel: 'none',
    },
    {
      id: 'PAY-SCH-002',
      invoiceNo: 'INV-2024-002',
      scheduledDate: '2025-01-20',
      amount: 3500000,
      status: 'scheduled',
      alertLevel: 'warning',
    },
    {
      id: 'PAY-SCH-003',
      invoiceNo: 'INV-2024-003',
      scheduledDate: '2025-01-25',
      amount: 8200000,
      status: 'scheduled',
      alertLevel: 'none',
    },
  ];
}

/**
 * 支払予定データを取得（ダミーデータ）
 */
async function getDisbursementSchedules(tenantId: string, startDate: string, endDate: string): Promise<any[]> {
  // 実際の実装では /api/disbursement-schedules を呼び出す
  // ここではダミーデータを返す
  return [
    {
      id: 'DIS-SCH-001',
      orderNo: 'ORD-2024-001',
      scheduledDate: '2025-01-12',
      amount: 2000000,
      status: 'approved',
      alertLevel: 'none',
    },
    {
      id: 'DIS-SCH-002',
      orderNo: 'ORD-2024-002',
      scheduledDate: '2025-01-18',
      amount: 1500000,
      status: 'scheduled',
      alertLevel: 'warning',
    },
    {
      id: 'DIS-SCH-003',
      orderNo: 'ORD-2024-003',
      scheduledDate: '2025-01-28',
      amount: 3000000,
      status: 'approved',
      alertLevel: 'none',
    },
  ];
}

/**
 * キャッシュフロー項目を生成
 */
function createCashFlowItems(
  paymentSchedules: any[],
  disbursementSchedules: any[]
): CashFlowItem[] {
  const items: CashFlowItem[] = [];

  // 入金予定をキャッシュフロー項目に変換
  paymentSchedules.forEach((schedule) => {
    items.push({
      id: schedule.id,
      date: schedule.scheduledDate,
      type: 'inflow',
      category: 'payment',
      amount: schedule.amount,
      description: `入金予定: ${schedule.invoiceNo || '請求書'}`,
      status: schedule.status,
      alertLevel: schedule.alertLevel,
      relatedId: schedule.id,
      relatedNo: schedule.invoiceNo,
    });
  });

  // 支払予定をキャッシュフロー項目に変換
  disbursementSchedules.forEach((schedule) => {
    items.push({
      id: schedule.id,
      date: schedule.scheduledDate,
      type: 'outflow',
      category: 'disbursement',
      amount: schedule.amount,
      description: `支払予定: ${schedule.orderNo || '発注'}`,
      status: schedule.status,
      alertLevel: schedule.alertLevel,
      relatedId: schedule.id,
      relatedNo: schedule.orderNo,
    });
  });

  // 日付順にソート
  items.sort((a, b) => a.date.localeCompare(b.date));

  return items;
}

/**
 * 日次キャッシュフローを計算
 */
function calculateDailyCashFlows(
  items: CashFlowItem[],
  startDate: Date,
  endDate: Date,
  openingBalance: number
): DailyCashFlow[] {
  const dailyFlows: Map<string, DailyCashFlow> = new Map();
  let currentBalance = openingBalance;

  // 期間内の全日付を初期化
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    dailyFlows.set(dateStr, {
      date: dateStr,
      inflow: 0,
      outflow: 0,
      netFlow: 0,
      balance: currentBalance,
      items: [],
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // キャッシュフロー項目を日次に集計
  items.forEach((item) => {
    const flow = dailyFlows.get(item.date);
    if (flow) {
      flow.items.push(item);
      if (item.type === 'inflow') {
        flow.inflow += item.amount;
      } else {
        flow.outflow += item.amount;
      }
    }
  });

  // 各日の残高を計算
  const sortedDates = Array.from(dailyFlows.keys()).sort();
  sortedDates.forEach((date) => {
    const flow = dailyFlows.get(date)!;
    flow.netFlow = flow.inflow - flow.outflow;
    currentBalance += flow.netFlow;
    flow.balance = currentBalance;
  });

  return Array.from(dailyFlows.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 週次キャッシュフローを計算
 */
function calculateWeeklyCashFlows(dailyFlows: DailyCashFlow[]): WeeklyCashFlow[] {
  const weeklyFlows: Map<string, WeeklyCashFlow> = new Map();

  dailyFlows.forEach((daily) => {
    const date = new Date(daily.date);
    const weekStart = getWeekStart(date);
    const weekStartStr = formatDate(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = formatDate(weekEnd);
    const weekNumber = getWeekNumber(date);

    if (!weeklyFlows.has(weekStartStr)) {
      weeklyFlows.set(weekStartStr, {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        weekNumber,
        inflow: 0,
        outflow: 0,
        netFlow: 0,
        balance: 0,
        dailyFlows: [],
      });
    }

    const weekly = weeklyFlows.get(weekStartStr)!;
    weekly.inflow += daily.inflow;
    weekly.outflow += daily.outflow;
    weekly.netFlow += daily.netFlow;
    weekly.balance = daily.balance; // 週の最終残高
    weekly.dailyFlows.push(daily);
  });

  return Array.from(weeklyFlows.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * 月次キャッシュフローを計算
 */
function calculateMonthlyCashFlows(dailyFlows: DailyCashFlow[]): MonthlyCashFlow[] {
  const monthlyFlows: Map<string, MonthlyCashFlow> = new Map();

  dailyFlows.forEach((daily) => {
    const date = new Date(daily.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyFlows.has(month)) {
      monthlyFlows.set(month, {
        month,
        inflow: 0,
        outflow: 0,
        netFlow: 0,
        balance: 0,
        dailyFlows: [],
      });
    }

    const monthly = monthlyFlows.get(month)!;
    monthly.inflow += daily.inflow;
    monthly.outflow += daily.outflow;
    monthly.netFlow += daily.netFlow;
    monthly.balance = daily.balance; // 月の最終残高
    monthly.dailyFlows!.push(daily);
  });

  return Array.from(monthlyFlows.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// ============================================================================
// APIハンドラー
// ============================================================================

/**
 * GET /api/cashflow/schedule
 * キャッシュフロー予定表を取得
 *
 * クエリパラメータ:
 * - startDate: 開始日 (YYYY-MM-DD) デフォルト: 今日
 * - endDate: 終了日 (YYYY-MM-DD) デフォルト: 3ヶ月後
 * - periodType: 集計期間 (daily|weekly|monthly) デフォルト: monthly
 * - openingBalance: 期首残高 デフォルト: 10000000
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);

    // パラメータ取得
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const startDate = searchParams.get('startDate') || formatDate(today);
    const endDate = searchParams.get('endDate') || formatDate(threeMonthsLater);
    const periodType = (searchParams.get('periodType') || 'monthly') as 'daily' | 'weekly' | 'monthly';
    const openingBalance = parseInt(searchParams.get('openingBalance') || '10000000', 10);

    // データ取得
    const [paymentSchedules, disbursementSchedules] = await Promise.all([
      getPaymentSchedules(tenantId, startDate, endDate),
      getDisbursementSchedules(tenantId, startDate, endDate),
    ]);

    // キャッシュフロー項目を生成
    const items = createCashFlowItems(paymentSchedules, disbursementSchedules);

    // 日次キャッシュフローを計算
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dailyFlows = calculateDailyCashFlows(items, startDateObj, endDateObj, openingBalance);

    // サマリー計算
    const totalInflow = dailyFlows.reduce((sum, flow) => sum + flow.inflow, 0);
    const totalOutflow = dailyFlows.reduce((sum, flow) => sum + flow.outflow, 0);
    const netCashFlow = totalInflow - totalOutflow;
    const closingBalance = dailyFlows.length > 0 ? dailyFlows[dailyFlows.length - 1].balance : openingBalance;

    let minimumBalance = openingBalance;
    let minimumBalanceDate = startDate;
    dailyFlows.forEach((flow) => {
      if (flow.balance < minimumBalance) {
        minimumBalance = flow.balance;
        minimumBalanceDate = flow.date;
      }
    });

    // 期間タイプに応じてデータを集計
    let responseData: any = {
      period: {
        startDate,
        endDate,
        periodType,
      },
      summary: {
        totalInflow,
        totalOutflow,
        netCashFlow,
        openingBalance,
        closingBalance,
        minimumBalance,
        minimumBalanceDate,
      },
    };

    if (periodType === 'daily') {
      responseData.dailyFlows = dailyFlows;
    } else if (periodType === 'weekly') {
      responseData.weeklyFlows = calculateWeeklyCashFlows(dailyFlows);
    } else {
      responseData.monthlyFlows = calculateMonthlyCashFlows(dailyFlows);
    }

    const response: CashFlowScheduleResponse = {
      success: true,
      data: responseData,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/cashflow/schedule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'キャッシュフロー予定表の取得に失敗しました',
      },
      { status: 500 }
    );
  }
}
