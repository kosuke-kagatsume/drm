import { NextRequest, NextResponse } from 'next/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// 工事台帳インターフェース（簡略版）
interface ConstructionLedger {
  id: string;
  tenantId: string;
  constructionNo: string;
  constructionName: string;
  constructionType: string;
  constructionCategory: string;
  customerId: string;
  customerName: string;
  customerCompany?: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  contractAmount: number;
  totalContractAmount: number;
  executionBudget?: {
    materialCost: number;
    laborCost: number;
    outsourcingCost: number;
    expenseCost: number;
    totalBudget: number;
    expectedProfit: number;
    expectedProfitRate: number;
  };
  actualCost?: {
    materialCost: number;
    laborCost: number;
    outsourcingCost: number;
    expenseCost: number;
    totalCost: number;
    actualProfit: number;
    actualProfitRate: number;
  };
  costAnalysis?: {
    budgetVsActual: {
      totalVariance: number;
      varianceRate: number;
    };
    profitAnalysis: {
      profitVariance: number;
      profitVarianceRate: number;
    };
  };
  progress: {
    status:
      | 'not_started'
      | 'in_progress'
      | 'completed'
      | 'suspended'
      | 'cancelled';
    progressRate: number;
    completedWorkValue: number;
  };
  alerts?: Array<{
    type: 'cost_overrun' | 'profit_decline' | 'loss_making';
    severity: 'warning' | 'critical';
    message: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// メモリストア
const ledgersStore = new Map<string, ConstructionLedger[]>();

// デモデータ初期化
function initializeDemoData() {
  const demoLedgers: ConstructionLedger[] = [
    // 2024年1月 - 高収益案件
    {
      id: 'CL-2024-001',
      tenantId: 'demo-tenant',
      constructionNo: 'CL-2024-001',
      constructionName: '〇〇マンション新築工事',
      constructionType: '新築',
      constructionCategory: 'マンション',
      customerId: 'CUST-001',
      customerName: '山田 太郎',
      customerCompany: '株式会社サンプル建設',
      scheduledStartDate: '2024-01-10',
      scheduledEndDate: '2024-06-30',
      actualStartDate: '2024-01-12',
      actualEndDate: '2024-06-28',
      contractAmount: 50000000,
      totalContractAmount: 55000000,
      executionBudget: {
        materialCost: 20000000,
        laborCost: 12000000,
        outsourcingCost: 8000000,
        expenseCost: 2000000,
        totalBudget: 42000000,
        expectedProfit: 8000000,
        expectedProfitRate: 16.0,
      },
      actualCost: {
        materialCost: 19000000,
        laborCost: 11500000,
        outsourcingCost: 7500000,
        expenseCost: 1800000,
        totalCost: 39800000,
        actualProfit: 10200000,
        actualProfitRate: 20.4,
      },
      costAnalysis: {
        budgetVsActual: {
          totalVariance: -2200000,
          varianceRate: -5.2,
        },
        profitAnalysis: {
          profitVariance: 2200000,
          profitVarianceRate: 27.5,
        },
      },
      progress: {
        status: 'completed',
        progressRate: 100,
        completedWorkValue: 50000000,
      },
      createdAt: '2024-01-08T09:00:00Z',
      updatedAt: '2024-07-01T15:30:00Z',
    },
    // 2024年2月 - 標準的な案件
    {
      id: 'CL-2024-002',
      tenantId: 'demo-tenant',
      constructionNo: 'CL-2024-002',
      constructionName: '△△店舗改装工事',
      constructionType: '改築',
      constructionCategory: '店舗',
      customerId: 'CUST-002',
      customerName: '鈴木 花子',
      customerCompany: 'ABC商事株式会社',
      scheduledStartDate: '2024-02-01',
      scheduledEndDate: '2024-03-31',
      actualStartDate: '2024-02-03',
      actualEndDate: '2024-04-05',
      contractAmount: 15000000,
      totalContractAmount: 16500000,
      executionBudget: {
        materialCost: 6000000,
        laborCost: 4000000,
        outsourcingCost: 3000000,
        expenseCost: 500000,
        totalBudget: 13500000,
        expectedProfit: 1500000,
        expectedProfitRate: 10.0,
      },
      actualCost: {
        materialCost: 6200000,
        laborCost: 4100000,
        outsourcingCost: 3200000,
        expenseCost: 600000,
        totalCost: 14100000,
        actualProfit: 900000,
        actualProfitRate: 6.0,
      },
      costAnalysis: {
        budgetVsActual: {
          totalVariance: 600000,
          varianceRate: 4.4,
        },
        profitAnalysis: {
          profitVariance: -600000,
          profitVarianceRate: -40.0,
        },
      },
      progress: {
        status: 'completed',
        progressRate: 100,
        completedWorkValue: 15000000,
      },
      alerts: [
        {
          type: 'profit_decline',
          severity: 'warning',
          message: '粗利率が予定より4.0ポイント低下しています',
        },
      ],
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-04-10T16:00:00Z',
    },
    // 2024年3月 - 赤字案件
    {
      id: 'CL-2024-003',
      tenantId: 'demo-tenant',
      constructionNo: 'CL-2024-003',
      constructionName: '××住宅リフォーム工事',
      constructionType: 'リフォーム',
      constructionCategory: '住宅',
      customerId: 'CUST-003',
      customerName: '田中 一郎',
      customerCompany: '',
      scheduledStartDate: '2024-03-01',
      scheduledEndDate: '2024-04-30',
      actualStartDate: '2024-03-05',
      actualEndDate: '2024-05-15',
      contractAmount: 8000000,
      totalContractAmount: 8800000,
      executionBudget: {
        materialCost: 3000000,
        laborCost: 2500000,
        outsourcingCost: 1500000,
        expenseCost: 400000,
        totalBudget: 7400000,
        expectedProfit: 600000,
        expectedProfitRate: 7.5,
      },
      actualCost: {
        materialCost: 3500000,
        laborCost: 3200000,
        outsourcingCost: 2000000,
        expenseCost: 600000,
        totalCost: 9300000,
        actualProfit: -1300000,
        actualProfitRate: -16.25,
      },
      costAnalysis: {
        budgetVsActual: {
          totalVariance: 1900000,
          varianceRate: 25.7,
        },
        profitAnalysis: {
          profitVariance: -1900000,
          profitVarianceRate: -316.7,
        },
      },
      progress: {
        status: 'completed',
        progressRate: 100,
        completedWorkValue: 8000000,
      },
      alerts: [
        {
          type: 'loss_making',
          severity: 'critical',
          message: '赤字案件です。実績粗利: -¥1,300,000',
        },
        {
          type: 'cost_overrun',
          severity: 'critical',
          message: '実績原価が予算を25.7%超過しています',
        },
      ],
      createdAt: '2024-02-20T11:00:00Z',
      updatedAt: '2024-05-20T10:00:00Z',
    },
    // 2024年4月 - 進行中・好調
    {
      id: 'CL-2024-004',
      tenantId: 'demo-tenant',
      constructionNo: 'CL-2024-004',
      constructionName: '□□ビル新築工事',
      constructionType: '新築',
      constructionCategory: 'オフィスビル',
      customerId: 'CUST-004',
      customerName: '佐々木 健',
      customerCompany: 'DEF不動産株式会社',
      scheduledStartDate: '2024-04-01',
      scheduledEndDate: '2024-10-31',
      actualStartDate: '2024-04-03',
      contractAmount: 80000000,
      totalContractAmount: 88000000,
      executionBudget: {
        materialCost: 35000000,
        laborCost: 20000000,
        outsourcingCost: 15000000,
        expenseCost: 3000000,
        totalBudget: 73000000,
        expectedProfit: 7000000,
        expectedProfitRate: 8.75,
      },
      actualCost: {
        materialCost: 17000000,
        laborCost: 9500000,
        outsourcingCost: 7000000,
        expenseCost: 1400000,
        totalCost: 34900000,
        actualProfit: 5100000,
        actualProfitRate: 12.75,
      },
      costAnalysis: {
        budgetVsActual: {
          totalVariance: 1600000,
          varianceRate: 4.4,
        },
        profitAnalysis: {
          profitVariance: 1600000,
          profitVarianceRate: 45.7,
        },
      },
      progress: {
        status: 'in_progress',
        progressRate: 50,
        completedWorkValue: 40000000,
      },
      createdAt: '2024-03-15T09:00:00Z',
      updatedAt: '2024-10-12T14:00:00Z',
    },
    // 2024年5月 - 進行中・標準
    {
      id: 'CL-2024-005',
      tenantId: 'demo-tenant',
      constructionNo: 'CL-2024-005',
      constructionName: '◇◇マンションリノベーション工事',
      constructionType: 'リフォーム',
      constructionCategory: 'マンション',
      customerId: 'CUST-005',
      customerName: '高橋 雄一',
      customerCompany: 'GHI管理組合',
      scheduledStartDate: '2024-05-01',
      scheduledEndDate: '2024-08-31',
      actualStartDate: '2024-05-05',
      contractAmount: 30000000,
      totalContractAmount: 33000000,
      executionBudget: {
        materialCost: 12000000,
        laborCost: 8000000,
        outsourcingCost: 6000000,
        expenseCost: 1000000,
        totalBudget: 27000000,
        expectedProfit: 3000000,
        expectedProfitRate: 10.0,
      },
      actualCost: {
        materialCost: 8000000,
        laborCost: 5200000,
        outsourcingCost: 3800000,
        expenseCost: 700000,
        totalCost: 17700000,
        actualProfit: 2300000,
        actualProfitRate: 11.5,
      },
      costAnalysis: {
        budgetVsActual: {
          totalVariance: 300000,
          varianceRate: 1.7,
        },
        profitAnalysis: {
          profitVariance: 300000,
          profitVarianceRate: 13.0,
        },
      },
      progress: {
        status: 'in_progress',
        progressRate: 67,
        completedWorkValue: 20000000,
      },
      createdAt: '2024-04-10T10:00:00Z',
      updatedAt: '2024-10-12T14:00:00Z',
    },
    // 2024年6月 - 進行中・警告
    {
      id: 'CL-2024-006',
      tenantId: 'demo-tenant',
      constructionNo: 'CL-2024-006',
      constructionName: '☆☆店舗新築工事',
      constructionType: '新築',
      constructionCategory: '店舗',
      customerId: 'CUST-006',
      customerName: '伊藤 光',
      customerCompany: 'JKL株式会社',
      scheduledStartDate: '2024-06-01',
      scheduledEndDate: '2024-09-30',
      actualStartDate: '2024-06-03',
      contractAmount: 25000000,
      totalContractAmount: 27500000,
      executionBudget: {
        materialCost: 10000000,
        laborCost: 7000000,
        outsourcingCost: 5000000,
        expenseCost: 800000,
        totalBudget: 22800000,
        expectedProfit: 2200000,
        expectedProfitRate: 8.8,
      },
      actualCost: {
        materialCost: 5500000,
        laborCost: 4000000,
        outsourcingCost: 3000000,
        expenseCost: 500000,
        totalCost: 13000000,
        actualProfit: 500000,
        actualProfitRate: 3.7,
      },
      costAnalysis: {
        budgetVsActual: {
          totalVariance: 1400000,
          varianceRate: 12.3,
        },
        profitAnalysis: {
          profitVariance: -1400000,
          profitVarianceRate: -127.3,
        },
      },
      progress: {
        status: 'in_progress',
        progressRate: 52,
        completedWorkValue: 13000000,
      },
      alerts: [
        {
          type: 'profit_decline',
          severity: 'warning',
          message: '粗利率が予定より5.1ポイント低下しています',
        },
      ],
      createdAt: '2024-05-15T11:00:00Z',
      updatedAt: '2024-10-12T14:00:00Z',
    },
  ];

  ledgersStore.set('demo-tenant', demoLedgers);
}

// 初期化
initializeDemoData();

/**
 * GET /api/analytics/project-profitability
 * 工事収益分析データを取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = request.cookies.get('tenantId')?.value || 'demo-tenant';
    const period = searchParams.get('period') || 'all'; // all, monthly, quarterly
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status'); // completed, in_progress, all

    console.log(
      `[工事収益分析API] テナント: ${tenantId}, 期間: ${period}, 開始: ${startDate}, 終了: ${endDate}, ステータス: ${status}`,
    );

    // データ取得
    const ledgers = ledgersStore.get(tenantId) || [];

    // フィルタリング
    let filteredLedgers = ledgers;

    // 日付範囲フィルタ
    if (startDate || endDate) {
      filteredLedgers = filteredLedgers.filter((ledger) => {
        const ledgerDate = new Date(ledger.scheduledStartDate);
        if (startDate && ledgerDate < new Date(startDate)) return false;
        if (endDate && ledgerDate > new Date(endDate)) return false;
        return true;
      });
    }

    // ステータスフィルタ
    if (status && status !== 'all') {
      filteredLedgers = filteredLedgers.filter(
        (ledger) => ledger.progress.status === status,
      );
    }

    // 全体統計
    const summary = calculateSummary(filteredLedgers);

    // 工事別収益性ランキング
    const profitabilityRanking = calculateProfitabilityRanking(filteredLedgers);

    // 期間別収益推移
    const monthlyTrend = calculateMonthlyTrend(filteredLedgers);

    // 工事種別別収益
    const typeAnalysis = calculateTypeAnalysis(filteredLedgers);

    // 赤字・警告案件
    const alertProjects = calculateAlertProjects(filteredLedgers);

    // レスポンス
    const response = {
      success: true,
      data: {
        summary,
        profitabilityRanking,
        monthlyTrend,
        typeAnalysis,
        alertProjects,
      },
    };

    console.log(
      `[工事収益分析API] 成功 - 総工事数: ${summary.totalProjects}, 平均粗利率: ${summary.avgProfitRate.toFixed(1)}%`,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('[工事収益分析API エラー]', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '工事収益分析データ取得中にエラーが発生しました',
      },
      { status: 500 },
    );
  }
}

/**
 * 全体統計計算
 */
function calculateSummary(ledgers: ConstructionLedger[]) {
  const totalProjects = ledgers.length;
  const completedProjects = ledgers.filter(
    (l) => l.progress.status === 'completed',
  ).length;
  const inProgressProjects = ledgers.filter(
    (l) => l.progress.status === 'in_progress',
  ).length;

  const totalContractAmount = ledgers.reduce(
    (sum, l) => sum + l.contractAmount,
    0,
  );
  const totalBudget = ledgers.reduce(
    (sum, l) => sum + (l.executionBudget?.totalBudget || 0),
    0,
  );
  const totalActualCost = ledgers.reduce(
    (sum, l) => sum + (l.actualCost?.totalCost || 0),
    0,
  );
  const totalExpectedProfit = ledgers.reduce(
    (sum, l) => sum + (l.executionBudget?.expectedProfit || 0),
    0,
  );
  const totalActualProfit = ledgers.reduce(
    (sum, l) => sum + (l.actualCost?.actualProfit || 0),
    0,
  );

  const avgProfitRate =
    completedProjects > 0
      ? ledgers
          .filter((l) => l.progress.status === 'completed')
          .reduce((sum, l) => sum + (l.actualCost?.actualProfitRate || 0), 0) /
        completedProjects
      : 0;

  const lossProjects = ledgers.filter(
    (l) => l.actualCost && l.actualCost.actualProfit < 0,
  ).length;

  return {
    totalProjects,
    completedProjects,
    inProgressProjects,
    totalContractAmount,
    totalBudget,
    totalActualCost,
    totalExpectedProfit,
    totalActualProfit,
    avgProfitRate: Math.round(avgProfitRate * 10) / 10,
    profitVariance: totalActualProfit - totalExpectedProfit,
    lossProjects,
  };
}

/**
 * 工事別収益性ランキング
 */
function calculateProfitabilityRanking(ledgers: ConstructionLedger[]) {
  // 完了案件のみを対象
  const completedLedgers = ledgers.filter(
    (l) => l.progress.status === 'completed' && l.actualCost,
  );

  const rankedByProfitRate = [...completedLedgers]
    .sort(
      (a, b) =>
        (b.actualCost?.actualProfitRate || 0) -
        (a.actualCost?.actualProfitRate || 0),
    )
    .slice(0, 5)
    .map((l) => ({
      constructionNo: l.constructionNo,
      constructionName: l.constructionName,
      constructionType: l.constructionType,
      customerName: l.customerName,
      contractAmount: l.contractAmount,
      actualProfit: l.actualCost?.actualProfit || 0,
      actualProfitRate: l.actualCost?.actualProfitRate || 0,
      actualCost: l.actualCost?.totalCost || 0,
    }));

  const rankedByProfitAmount = [...completedLedgers]
    .sort(
      (a, b) =>
        (b.actualCost?.actualProfit || 0) - (a.actualCost?.actualProfit || 0),
    )
    .slice(0, 5)
    .map((l) => ({
      constructionNo: l.constructionNo,
      constructionName: l.constructionName,
      constructionType: l.constructionType,
      customerName: l.customerName,
      contractAmount: l.contractAmount,
      actualProfit: l.actualCost?.actualProfit || 0,
      actualProfitRate: l.actualCost?.actualProfitRate || 0,
      actualCost: l.actualCost?.totalCost || 0,
    }));

  const worstProjects = [...completedLedgers]
    .sort(
      (a, b) =>
        (a.actualCost?.actualProfitRate || 0) -
        (b.actualCost?.actualProfitRate || 0),
    )
    .slice(0, 3)
    .map((l) => ({
      constructionNo: l.constructionNo,
      constructionName: l.constructionName,
      constructionType: l.constructionType,
      customerName: l.customerName,
      contractAmount: l.contractAmount,
      actualProfit: l.actualCost?.actualProfit || 0,
      actualProfitRate: l.actualCost?.actualProfitRate || 0,
      actualCost: l.actualCost?.totalCost || 0,
      alerts: l.alerts || [],
    }));

  return {
    topByProfitRate: rankedByProfitRate,
    topByProfitAmount: rankedByProfitAmount,
    worstProjects,
  };
}

/**
 * 期間別収益推移
 */
function calculateMonthlyTrend(ledgers: ConstructionLedger[]) {
  const monthlyMap = new Map<
    string,
    {
      totalProjects: number;
      completedProjects: number;
      contractAmount: number;
      actualCost: number;
      actualProfit: number;
      expectedProfit: number;
    }
  >();

  ledgers.forEach((ledger) => {
    const month = ledger.scheduledStartDate.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        totalProjects: 0,
        completedProjects: 0,
        contractAmount: 0,
        actualCost: 0,
        actualProfit: 0,
        expectedProfit: 0,
      });
    }

    const data = monthlyMap.get(month)!;
    data.totalProjects++;
    data.contractAmount += ledger.contractAmount;
    data.expectedProfit += ledger.executionBudget?.expectedProfit || 0;

    if (ledger.progress.status === 'completed' && ledger.actualCost) {
      data.completedProjects++;
      data.actualCost += ledger.actualCost.totalCost;
      data.actualProfit += ledger.actualCost.actualProfit;
    }
  });

  // ソートして配列に変換
  const sortedMonths = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      totalProjects: data.totalProjects,
      completedProjects: data.completedProjects,
      contractAmount: data.contractAmount,
      actualCost: data.actualCost,
      actualProfit: data.actualProfit,
      expectedProfit: data.expectedProfit,
      actualProfitRate:
        data.actualCost > 0
          ? Math.round((data.actualProfit / data.contractAmount) * 1000) / 10
          : 0,
    }));

  return sortedMonths;
}

/**
 * 工事種別別収益分析
 */
function calculateTypeAnalysis(ledgers: ConstructionLedger[]) {
  const typeMap = new Map<
    string,
    {
      count: number;
      completedCount: number;
      contractAmount: number;
      actualProfit: number;
      expectedProfit: number;
    }
  >();

  ledgers.forEach((ledger) => {
    const type = ledger.constructionType;
    if (!typeMap.has(type)) {
      typeMap.set(type, {
        count: 0,
        completedCount: 0,
        contractAmount: 0,
        actualProfit: 0,
        expectedProfit: 0,
      });
    }

    const data = typeMap.get(type)!;
    data.count++;
    data.contractAmount += ledger.contractAmount;
    data.expectedProfit += ledger.executionBudget?.expectedProfit || 0;

    if (ledger.progress.status === 'completed' && ledger.actualCost) {
      data.completedCount++;
      data.actualProfit += ledger.actualCost.actualProfit;
    }
  });

  const typeAnalysis = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      completedCount: data.completedCount,
      contractAmount: data.contractAmount,
      actualProfit: data.actualProfit,
      expectedProfit: data.expectedProfit,
      avgProfitRate:
        data.completedCount > 0 && data.contractAmount > 0
          ? Math.round((data.actualProfit / data.contractAmount) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.contractAmount - a.contractAmount);

  return typeAnalysis;
}

/**
 * 赤字・警告案件の抽出
 */
function calculateAlertProjects(ledgers: ConstructionLedger[]) {
  const alertLedgers = ledgers.filter((l) => l.alerts && l.alerts.length > 0);

  const criticalProjects = alertLedgers
    .filter((l) => l.alerts?.some((a) => a.severity === 'critical'))
    .map((l) => ({
      constructionNo: l.constructionNo,
      constructionName: l.constructionName,
      customerName: l.customerName,
      status: l.progress.status,
      progressRate: l.progress.progressRate,
      contractAmount: l.contractAmount,
      actualProfit: l.actualCost?.actualProfit || 0,
      actualProfitRate: l.actualCost?.actualProfitRate || 0,
      alerts: l.alerts || [],
    }));

  const warningProjects = alertLedgers
    .filter(
      (l) =>
        l.alerts?.some((a) => a.severity === 'warning') &&
        !l.alerts?.some((a) => a.severity === 'critical'),
    )
    .map((l) => ({
      constructionNo: l.constructionNo,
      constructionName: l.constructionName,
      customerName: l.customerName,
      status: l.progress.status,
      progressRate: l.progress.progressRate,
      contractAmount: l.contractAmount,
      actualProfit: l.actualCost?.actualProfit || 0,
      actualProfitRate: l.actualCost?.actualProfitRate || 0,
      alerts: l.alerts || [],
    }));

  return {
    critical: criticalProjects,
    warning: warningProjects,
    totalAlerts: alertLedgers.length,
  };
}
