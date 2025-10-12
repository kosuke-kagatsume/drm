import { NextRequest, NextResponse } from 'next/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// サンプルデータ（実際はDBから取得）
interface EstimateRecord {
  id: string;
  tenantId: string;
  estimateNo: string;
  date: string;
  customerName: string;
  customerCompany: string;
  amount: number;
  status: 'draft' | 'submitted' | 'negotiating' | 'won' | 'lost';
  lostReason?: 'price' | 'spec' | 'schedule' | 'competitor' | 'other';
  lostReasonDetail?: string;
  assignee: string;
  assigneeName: string;
  createdAt: string;
  updatedAt: string;
}

// メモリストア
const estimatesStore = new Map<string, EstimateRecord[]>();

// デモデータ初期化
function initializeDemoData() {
  const demoEstimates: EstimateRecord[] = [
    // 2024年1月
    {
      id: 'EST-2024-001',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-001',
      date: '2024-01-10',
      customerName: '山田 太郎',
      customerCompany: '株式会社サンプル建設',
      amount: 25000000,
      status: 'won',
      assignee: 'sales1@example.com',
      assigneeName: '佐藤 健一',
      createdAt: '2024-01-08T09:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
    },
    {
      id: 'EST-2024-002',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-002',
      date: '2024-01-15',
      customerName: '鈴木 花子',
      customerCompany: 'ABC工務店',
      amount: 15000000,
      status: 'lost',
      lostReason: 'price',
      lostReasonDetail: '予算オーバー',
      assignee: 'sales1@example.com',
      assigneeName: '佐藤 健一',
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-25T11:00:00Z',
    },
    // 2024年2月
    {
      id: 'EST-2024-003',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-003',
      date: '2024-02-05',
      customerName: '田中 一郎',
      customerCompany: 'XYZ建設',
      amount: 30000000,
      status: 'won',
      assignee: 'sales2@example.com',
      assigneeName: '田中 美咲',
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-15T16:00:00Z',
    },
    {
      id: 'EST-2024-004',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-004',
      date: '2024-02-12',
      customerName: '佐々木 健',
      customerCompany: 'DEF住宅',
      amount: 20000000,
      status: 'won',
      assignee: 'sales2@example.com',
      assigneeName: '田中 美咲',
      createdAt: '2024-02-08T10:00:00Z',
      updatedAt: '2024-02-22T14:00:00Z',
    },
    {
      id: 'EST-2024-005',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-005',
      date: '2024-02-20',
      customerName: '高橋 雄一',
      customerCompany: 'GHI不動産',
      amount: 18000000,
      status: 'lost',
      lostReason: 'competitor',
      lostReasonDetail: '競合他社に敗北',
      assignee: 'sales3@example.com',
      assigneeName: '山本 太郎',
      createdAt: '2024-02-15T11:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
    },
    // 2024年3月
    {
      id: 'EST-2024-006',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-006',
      date: '2024-03-05',
      customerName: '伊藤 光',
      customerCompany: 'JKL建設',
      amount: 35000000,
      status: 'won',
      assignee: 'sales1@example.com',
      assigneeName: '佐藤 健一',
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2024-03-18T15:00:00Z',
    },
    {
      id: 'EST-2024-007',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-007',
      date: '2024-03-12',
      customerName: '渡辺 明',
      customerCompany: 'MNO工務店',
      amount: 22000000,
      status: 'won',
      assignee: 'sales2@example.com',
      assigneeName: '田中 美咲',
      createdAt: '2024-03-08T10:00:00Z',
      updatedAt: '2024-03-25T16:00:00Z',
    },
    {
      id: 'EST-2024-008',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-008',
      date: '2024-03-20',
      customerName: '中村 健二',
      customerCompany: 'PQR建設',
      amount: 28000000,
      status: 'lost',
      lostReason: 'schedule',
      lostReasonDetail: '工期が合わない',
      assignee: 'sales3@example.com',
      assigneeName: '山本 太郎',
      createdAt: '2024-03-15T11:00:00Z',
      updatedAt: '2024-03-28T10:00:00Z',
    },
    // 2024年4月以降（継続中）
    {
      id: 'EST-2024-009',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-009',
      date: '2024-04-05',
      customerName: '小林 修',
      customerCompany: 'STU不動産',
      amount: 32000000,
      status: 'negotiating',
      assignee: 'sales1@example.com',
      assigneeName: '佐藤 健一',
      createdAt: '2024-04-01T09:00:00Z',
      updatedAt: '2024-04-10T14:00:00Z',
    },
    {
      id: 'EST-2024-010',
      tenantId: 'demo-tenant',
      estimateNo: 'EST-2024-010',
      date: '2024-04-12',
      customerName: '加藤 直樹',
      customerCompany: 'VWX建設',
      amount: 26000000,
      status: 'submitted',
      assignee: 'sales2@example.com',
      assigneeName: '田中 美咲',
      createdAt: '2024-04-08T10:00:00Z',
      updatedAt: '2024-04-15T11:00:00Z',
    },
  ];

  estimatesStore.set('demo-tenant', demoEstimates);
}

// 初期化
initializeDemoData();

/**
 * GET /api/analytics/orders
 * 受注率分析データを取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.cookies.get('tenantId')?.value || 'demo-tenant';
    const period = searchParams.get('period') || 'monthly'; // monthly, quarterly, yearly
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log(
      `[受注率分析API] テナント: ${tenantId}, 期間: ${period}, 開始: ${startDate}, 終了: ${endDate}`,
    );

    // データ取得
    const estimates = estimatesStore.get(tenantId) || [];

    // フィルタリング（日付範囲）
    let filteredEstimates = estimates;
    if (startDate || endDate) {
      filteredEstimates = estimates.filter((est) => {
        const estDate = new Date(est.date);
        if (startDate && estDate < new Date(startDate)) return false;
        if (endDate && estDate > new Date(endDate)) return false;
        return true;
      });
    }

    // 全体統計
    const totalEstimates = filteredEstimates.length;
    const wonEstimates = filteredEstimates.filter(
      (est) => est.status === 'won',
    ).length;
    const lostEstimates = filteredEstimates.filter(
      (est) => est.status === 'lost',
    ).length;
    const negotiatingEstimates = filteredEstimates.filter(
      (est) => est.status === 'negotiating' || est.status === 'submitted',
    ).length;
    const decidedEstimates = wonEstimates + lostEstimates;
    const winRate =
      decidedEstimates > 0 ? (wonEstimates / decidedEstimates) * 100 : 0;

    const totalAmount = filteredEstimates.reduce(
      (sum, est) => sum + est.amount,
      0,
    );
    const wonAmount = filteredEstimates
      .filter((est) => est.status === 'won')
      .reduce((sum, est) => sum + est.amount, 0);

    // 月次推移データ
    const monthlyData = calculateMonthlyTrend(filteredEstimates);

    // 営業担当別実績
    const salesPerformance = calculateSalesPerformance(filteredEstimates);

    // 失注理由別集計
    const lostReasons = calculateLostReasons(filteredEstimates);

    // レスポンス
    const response = {
      success: true,
      data: {
        summary: {
          totalEstimates,
          wonEstimates,
          lostEstimates,
          negotiatingEstimates,
          decidedEstimates,
          winRate: Math.round(winRate * 10) / 10,
          totalAmount,
          wonAmount,
          avgDealSize: wonEstimates > 0 ? wonAmount / wonEstimates : 0,
        },
        monthlyTrend: monthlyData,
        salesPerformance,
        lostReasons,
      },
    };

    console.log(`[受注率分析API] 成功 - 受注率: ${winRate.toFixed(1)}%`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[受注率分析API エラー]', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '受注率分析データ取得中にエラーが発生しました',
      },
      { status: 500 },
    );
  }
}

/**
 * 月次推移データ計算
 */
function calculateMonthlyTrend(estimates: EstimateRecord[]) {
  const monthlyMap = new Map<
    string,
    {
      total: number;
      won: number;
      lost: number;
      amount: number;
      wonAmount: number;
    }
  >();

  estimates.forEach((est) => {
    const month = est.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        total: 0,
        won: 0,
        lost: 0,
        amount: 0,
        wonAmount: 0,
      });
    }

    const data = monthlyMap.get(month)!;
    data.total++;
    data.amount += est.amount;

    if (est.status === 'won') {
      data.won++;
      data.wonAmount += est.amount;
    } else if (est.status === 'lost') {
      data.lost++;
    }
  });

  // ソートして配列に変換
  const sortedMonths = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const decided = data.won + data.lost;
      const winRate = decided > 0 ? (data.won / decided) * 100 : 0;

      return {
        month,
        total: data.total,
        won: data.won,
        lost: data.lost,
        negotiating: data.total - decided,
        winRate: Math.round(winRate * 10) / 10,
        amount: data.amount,
        wonAmount: data.wonAmount,
      };
    });

  return sortedMonths;
}

/**
 * 営業担当別実績計算
 */
function calculateSalesPerformance(estimates: EstimateRecord[]) {
  const salesMap = new Map<
    string,
    {
      name: string;
      total: number;
      won: number;
      lost: number;
      amount: number;
      wonAmount: number;
    }
  >();

  estimates.forEach((est) => {
    if (!salesMap.has(est.assignee)) {
      salesMap.set(est.assignee, {
        name: est.assigneeName,
        total: 0,
        won: 0,
        lost: 0,
        amount: 0,
        wonAmount: 0,
      });
    }

    const data = salesMap.get(est.assignee)!;
    data.total++;
    data.amount += est.amount;

    if (est.status === 'won') {
      data.won++;
      data.wonAmount += est.amount;
    } else if (est.status === 'lost') {
      data.lost++;
    }
  });

  // 配列に変換してソート（受注件数順）
  const performance = Array.from(salesMap.entries())
    .map(([email, data]) => {
      const decided = data.won + data.lost;
      const winRate = decided > 0 ? (data.won / decided) * 100 : 0;

      return {
        email,
        name: data.name,
        total: data.total,
        won: data.won,
        lost: data.lost,
        negotiating: data.total - decided,
        winRate: Math.round(winRate * 10) / 10,
        amount: data.amount,
        wonAmount: data.wonAmount,
        avgDealSize: data.won > 0 ? data.wonAmount / data.won : 0,
      };
    })
    .sort((a, b) => b.won - a.won);

  return performance;
}

/**
 * 失注理由別集計
 */
function calculateLostReasons(estimates: EstimateRecord[]) {
  const lostEstimates = estimates.filter((est) => est.status === 'lost');
  const reasonMap = new Map<
    string,
    { label: string; count: number; amount: number }
  >();

  const reasonLabels: Record<string, string> = {
    price: '価格',
    spec: '仕様',
    schedule: '納期・工期',
    competitor: '競合他社',
    other: 'その他',
  };

  lostEstimates.forEach((est) => {
    const reason = est.lostReason || 'other';
    if (!reasonMap.has(reason)) {
      reasonMap.set(reason, {
        label: reasonLabels[reason] || '不明',
        count: 0,
        amount: 0,
      });
    }

    const data = reasonMap.get(reason)!;
    data.count++;
    data.amount += est.amount;
  });

  // 配列に変換してソート（件数順）
  const reasons = Array.from(reasonMap.entries())
    .map(([key, data]) => ({
      reason: key,
      label: data.label,
      count: data.count,
      amount: data.amount,
      percentage:
        lostEstimates.length > 0
          ? Math.round((data.count / lostEstimates.length) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return reasons;
}
