import { NextRequest, NextResponse } from 'next/server';

/**
 * キャッシュフロー予測API
 *
 * 過去の実績データと将来の予定データから、キャッシュフローを予測します。
 * 楽観的・現実的・悲観的の3つのシナリオで予測を提供します。
 */

// ============================================================================
// 型定義
// ============================================================================

/**
 * 予測シナリオ
 */
type ForecastScenario = 'optimistic' | 'realistic' | 'pessimistic';

/**
 * 月次予測データ
 */
interface MonthlyForecast {
  month: string;
  scenarios: {
    optimistic: {
      inflow: number;
      outflow: number;
      netFlow: number;
      balance: number;
    };
    realistic: {
      inflow: number;
      outflow: number;
      netFlow: number;
      balance: number;
    };
    pessimistic: {
      inflow: number;
      outflow: number;
      netFlow: number;
      balance: number;
    };
  };
  confidence: number; // 予測の信頼度 (0-100)
  factors: string[]; // 予測に影響した要因
}

/**
 * リスク評価
 */
interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialShortfall: number;
  shortfallMonth?: string;
  mitigationActions: string[];
}

/**
 * 推奨アクション
 */
interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'collection' | 'payment' | 'financing' | 'cost_reduction';
  action: string;
  expectedImpact: number;
  timeline: string;
}

/**
 * キャッシュフロー予測レスポンス
 */
interface CashFlowForecastResponse {
  success: boolean;
  data: {
    forecastPeriod: {
      startDate: string;
      endDate: string;
      months: number;
    };
    currentBalance: number;
    monthlyForecasts: MonthlyForecast[];
    summary: {
      optimistic: {
        averageMonthlyInflow: number;
        averageMonthlyOutflow: number;
        projectedEndingBalance: number;
      };
      realistic: {
        averageMonthlyInflow: number;
        averageMonthlyOutflow: number;
        projectedEndingBalance: number;
      };
      pessimistic: {
        averageMonthlyInflow: number;
        averageMonthlyOutflow: number;
        projectedEndingBalance: number;
      };
    };
    riskAssessment: RiskAssessment;
    recommendations: Recommendation[];
    assumptions: string[];
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
 * 日付をYYYY-MM形式に変換
 */
function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 過去の実績データを取得（ダミー）
 */
async function getHistoricalData(tenantId: string): Promise<{
  avgMonthlyInflow: number;
  avgMonthlyOutflow: number;
  inflowVolatility: number;
  outflowVolatility: number;
}> {
  // 実際の実装では過去6ヶ月～1年のデータを分析
  // ここではダミーデータを返す
  return {
    avgMonthlyInflow: 15000000,
    avgMonthlyOutflow: 12000000,
    inflowVolatility: 0.15, // 15%の変動
    outflowVolatility: 0.10, // 10%の変動
  };
}

/**
 * 将来の確定予定を取得（ダミー）
 */
async function getScheduledTransactions(tenantId: string): Promise<{
  scheduledInflows: Map<string, number>;
  scheduledOutflows: Map<string, number>;
}> {
  // 実際の実装では /api/payment-schedules と /api/disbursement-schedules から取得
  const scheduledInflows = new Map<string, number>();
  const scheduledOutflows = new Map<string, number>();

  // 2025年1月
  scheduledInflows.set('2025-01', 16700000); // INV-2024-001~003の合計
  scheduledOutflows.set('2025-01', 6500000); // DIS-SCH-001~003の合計

  // 2025年2月
  scheduledInflows.set('2025-02', 12000000);
  scheduledOutflows.set('2025-02', 10000000);

  return { scheduledInflows, scheduledOutflows };
}

/**
 * シナリオ別の予測値を計算
 */
function calculateScenarioValue(
  baseValue: number,
  volatility: number,
  scenario: ForecastScenario
): number {
  switch (scenario) {
    case 'optimistic':
      return Math.round(baseValue * (1 + volatility));
    case 'realistic':
      return Math.round(baseValue);
    case 'pessimistic':
      return Math.round(baseValue * (1 - volatility));
  }
}

/**
 * 月次予測を生成
 */
function generateMonthlyForecasts(
  startMonth: Date,
  months: number,
  currentBalance: number,
  historicalData: any,
  scheduledTransactions: any
): MonthlyForecast[] {
  const forecasts: MonthlyForecast[] = [];
  let optimisticBalance = currentBalance;
  let realisticBalance = currentBalance;
  let pessimisticBalance = currentBalance;

  const currentDate = new Date(startMonth);

  for (let i = 0; i < months; i++) {
    const monthStr = formatMonth(currentDate);

    // 確定予定があればそれを使用、なければ過去平均を使用
    const scheduledInflow = scheduledTransactions.scheduledInflows.get(monthStr);
    const scheduledOutflow = scheduledTransactions.scheduledOutflows.get(monthStr);

    const baseInflow = scheduledInflow || historicalData.avgMonthlyInflow;
    const baseOutflow = scheduledOutflow || historicalData.avgMonthlyOutflow;

    // シナリオ別の計算
    const optimisticInflow = calculateScenarioValue(
      baseInflow,
      historicalData.inflowVolatility,
      'optimistic'
    );
    const realisticInflow = calculateScenarioValue(
      baseInflow,
      historicalData.inflowVolatility,
      'realistic'
    );
    const pessimisticInflow = calculateScenarioValue(
      baseInflow,
      historicalData.inflowVolatility,
      'pessimistic'
    );

    const optimisticOutflow = calculateScenarioValue(
      baseOutflow,
      historicalData.outflowVolatility,
      'pessimistic' // 支出は楽観的シナリオでは少なくなる
    );
    const realisticOutflow = calculateScenarioValue(
      baseOutflow,
      historicalData.outflowVolatility,
      'realistic'
    );
    const pessimisticOutflow = calculateScenarioValue(
      baseOutflow,
      historicalData.outflowVolatility,
      'optimistic' // 支出は悲観的シナリオでは多くなる
    );

    // 純キャッシュフローと残高
    const optimisticNetFlow = optimisticInflow - optimisticOutflow;
    const realisticNetFlow = realisticInflow - realisticOutflow;
    const pessimisticNetFlow = pessimisticInflow - pessimisticOutflow;

    optimisticBalance += optimisticNetFlow;
    realisticBalance += realisticNetFlow;
    pessimisticBalance += pessimisticNetFlow;

    // 信頼度の計算（確定予定がある場合は高く、遠い将来ほど低く）
    const hasScheduled = scheduledInflow !== undefined || scheduledOutflow !== undefined;
    const baseConfidence = hasScheduled ? 85 : 60;
    const confidence = Math.max(30, baseConfidence - i * 5);

    // 予測に影響した要因
    const factors: string[] = [];
    if (hasScheduled) {
      factors.push('確定予定データあり');
    } else {
      factors.push('過去実績から推定');
    }
    if (i >= 3) {
      factors.push('長期予測のため不確実性が高い');
    }

    forecasts.push({
      month: monthStr,
      scenarios: {
        optimistic: {
          inflow: optimisticInflow,
          outflow: optimisticOutflow,
          netFlow: optimisticNetFlow,
          balance: optimisticBalance,
        },
        realistic: {
          inflow: realisticInflow,
          outflow: realisticOutflow,
          netFlow: realisticNetFlow,
          balance: realisticBalance,
        },
        pessimistic: {
          inflow: pessimisticInflow,
          outflow: pessimisticOutflow,
          netFlow: pessimisticNetFlow,
          balance: pessimisticBalance,
        },
      },
      confidence,
      factors,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return forecasts;
}

/**
 * リスク評価を生成
 */
function generateRiskAssessment(forecasts: MonthlyForecast[]): RiskAssessment {
  // 悲観的シナリオで残高がマイナスになる月を検索
  const shortfallMonth = forecasts.find((f) => f.scenarios.pessimistic.balance < 0);

  if (shortfallMonth) {
    return {
      level: 'critical',
      description: '悲観的シナリオで資金ショートの可能性があります',
      potentialShortfall: Math.abs(shortfallMonth.scenarios.pessimistic.balance),
      shortfallMonth: shortfallMonth.month,
      mitigationActions: [
        '早期入金の促進（請求書の早期発行、支払条件の見直し）',
        '支払スケジュールの調整（協力業者との支払時期の交渉）',
        '短期融資の検討',
        '不要な支出の削減',
      ],
    };
  }

  // 現実的シナリオで残高が一定額を下回る月を検索
  const lowBalanceMonth = forecasts.find((f) => f.scenarios.realistic.balance < 5000000);

  if (lowBalanceMonth) {
    return {
      level: 'high',
      description: '現実的シナリオで資金残高が低下する可能性があります',
      potentialShortfall: 5000000 - lowBalanceMonth.scenarios.realistic.balance,
      shortfallMonth: lowBalanceMonth.month,
      mitigationActions: [
        '入金予定の確認と早期入金の依頼',
        '大口支払いのタイミング調整',
        '運転資金の確保を検討',
      ],
    };
  }

  // 楽観的シナリオでも残高が減少傾向
  const firstMonth = forecasts[0];
  const lastMonth = forecasts[forecasts.length - 1];

  if (lastMonth.scenarios.optimistic.balance < firstMonth.scenarios.optimistic.balance) {
    return {
      level: 'medium',
      description: '楽観的シナリオでも残高が減少傾向にあります',
      potentialShortfall: 0,
      mitigationActions: [
        '収益性の向上策を検討',
        '新規案件の獲得',
        'コスト削減の実施',
      ],
    };
  }

  return {
    level: 'low',
    description: '全シナリオで健全なキャッシュフローが予測されます',
    potentialShortfall: 0,
    mitigationActions: ['現状の運営を継続', '余剰資金の有効活用を検討'],
  };
}

/**
 * 推奨アクションを生成
 */
function generateRecommendations(
  forecasts: MonthlyForecast[],
  riskAssessment: RiskAssessment
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // リスクレベルに応じた推奨アクション
  if (riskAssessment.level === 'critical' || riskAssessment.level === 'high') {
    recommendations.push({
      priority: 'high',
      category: 'collection',
      action: '未回収請求書の早期回収（督促の強化、支払条件の見直し）',
      expectedImpact: 5000000,
      timeline: '即時～1ヶ月以内',
    });

    recommendations.push({
      priority: 'high',
      category: 'financing',
      action: '短期運転資金の調達（銀行融資、ファクタリング等）',
      expectedImpact: riskAssessment.potentialShortfall + 5000000,
      timeline: '1～2週間以内',
    });
  }

  // 支払管理の最適化
  recommendations.push({
    priority: riskAssessment.level === 'critical' ? 'high' : 'medium',
    category: 'payment',
    action: '支払スケジュールの最適化（協力業者との支払時期の調整）',
    expectedImpact: 3000000,
    timeline: '1～2ヶ月',
  });

  // コスト削減
  if (riskAssessment.level !== 'low') {
    recommendations.push({
      priority: 'medium',
      category: 'cost_reduction',
      action: '固定費・変動費の見直しとコスト削減',
      expectedImpact: 2000000,
      timeline: '2～3ヶ月',
    });
  }

  // 余剰資金の活用（低リスクの場合）
  if (riskAssessment.level === 'low') {
    const lastMonthBalance = forecasts[forecasts.length - 1].scenarios.realistic.balance;
    if (lastMonthBalance > 20000000) {
      recommendations.push({
        priority: 'low',
        category: 'financing',
        action: '余剰資金の有効活用（投資、設備購入、債務返済等）',
        expectedImpact: lastMonthBalance - 15000000,
        timeline: '3～6ヶ月',
      });
    }
  }

  return recommendations;
}

// ============================================================================
// APIハンドラー
// ============================================================================

/**
 * GET /api/cashflow/forecast
 * キャッシュフロー予測を取得
 *
 * クエリパラメータ:
 * - months: 予測期間（月数） デフォルト: 6
 * - currentBalance: 現在残高 デフォルト: 10000000
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);

    // パラメータ取得
    const months = parseInt(searchParams.get('months') || '6', 10);
    const currentBalance = parseInt(searchParams.get('currentBalance') || '10000000', 10);

    // データ取得
    const [historicalData, scheduledTransactions] = await Promise.all([
      getHistoricalData(tenantId),
      getScheduledTransactions(tenantId),
    ]);

    // 予測開始月（来月）
    const startMonth = new Date();
    startMonth.setMonth(startMonth.getMonth() + 1);
    startMonth.setDate(1);

    // 月次予測を生成
    const monthlyForecasts = generateMonthlyForecasts(
      startMonth,
      months,
      currentBalance,
      historicalData,
      scheduledTransactions
    );

    // サマリー計算
    const summary = {
      optimistic: {
        averageMonthlyInflow:
          monthlyForecasts.reduce((sum, f) => sum + f.scenarios.optimistic.inflow, 0) / months,
        averageMonthlyOutflow:
          monthlyForecasts.reduce((sum, f) => sum + f.scenarios.optimistic.outflow, 0) / months,
        projectedEndingBalance:
          monthlyForecasts[monthlyForecasts.length - 1].scenarios.optimistic.balance,
      },
      realistic: {
        averageMonthlyInflow:
          monthlyForecasts.reduce((sum, f) => sum + f.scenarios.realistic.inflow, 0) / months,
        averageMonthlyOutflow:
          monthlyForecasts.reduce((sum, f) => sum + f.scenarios.realistic.outflow, 0) / months,
        projectedEndingBalance:
          monthlyForecasts[monthlyForecasts.length - 1].scenarios.realistic.balance,
      },
      pessimistic: {
        averageMonthlyInflow:
          monthlyForecasts.reduce((sum, f) => sum + f.scenarios.pessimistic.inflow, 0) / months,
        averageMonthlyOutflow:
          monthlyForecasts.reduce((sum, f) => sum + f.scenarios.pessimistic.outflow, 0) / months,
        projectedEndingBalance:
          monthlyForecasts[monthlyForecasts.length - 1].scenarios.pessimistic.balance,
      },
    };

    // リスク評価と推奨アクションを生成
    const riskAssessment = generateRiskAssessment(monthlyForecasts);
    const recommendations = generateRecommendations(monthlyForecasts, riskAssessment);

    // 前提条件
    const assumptions = [
      '過去6ヶ月の実績データを基に予測',
      '確定予定がない月は過去平均値を使用',
      `入金の変動率: ±${historicalData.inflowVolatility * 100}%`,
      `支出の変動率: ±${historicalData.outflowVolatility * 100}%`,
      '季節変動や特殊要因は考慮していません',
    ];

    const endMonth = new Date(startMonth);
    endMonth.setMonth(endMonth.getMonth() + months - 1);

    const response: CashFlowForecastResponse = {
      success: true,
      data: {
        forecastPeriod: {
          startDate: formatMonth(startMonth),
          endDate: formatMonth(endMonth),
          months,
        },
        currentBalance,
        monthlyForecasts,
        summary,
        riskAssessment,
        recommendations,
        assumptions,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/cashflow/forecast:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'キャッシュフロー予測の取得に失敗しました',
      },
      { status: 500 }
    );
  }
}
