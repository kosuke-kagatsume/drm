import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 月次売上データの型定義
interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

// 予測結果の型定義
interface RevenueForecast {
  month: string;
  year: number;
  optimistic: number; // 楽観的予測
  realistic: number; // 現実的予測
  pessimistic: number; // 悲観的予測
  confidence: number; // 信頼度 (0-100)
}

/**
 * 線形回帰による売上トレンド予測
 */
function linearRegression(data: number[]): {
  slope: number;
  intercept: number;
} {
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * 標準偏差の計算
 */
function standardDeviation(data: number[]): number {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance =
    data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * 季節性を考慮した補正係数
 */
function getSeasonalFactor(month: number): number {
  // 建設業の季節性パターン（日本の一般的な傾向）
  const seasonalFactors: Record<number, number> = {
    1: 0.9, // 1月: 年始で少し低め
    2: 0.85, // 2月: 最も低い
    3: 1.2, // 3月: 年度末で高い
    4: 1.05, // 4月: やや高め
    5: 1.0, // 5月: 通常
    6: 1.0, // 6月: 通常
    7: 0.95, // 7月: やや低め
    8: 0.9, // 8月: 夏季休暇で低め
    9: 1.05, // 9月: やや高め
    10: 1.1, // 10月: 高め
    11: 1.1, // 11月: 高め
    12: 1.15, // 12月: 年末で高い
  };

  return seasonalFactors[month] || 1.0;
}

/**
 * 売上トレンド予測AI
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { historicalData, forecastMonths = 6 } = await request.json();

    if (!historicalData || !Array.isArray(historicalData)) {
      return NextResponse.json(
        { success: false, error: 'Historical data array is required' },
        { status: 400 },
      );
    }

    // 過去データから売上額のリストを作成
    const revenues = historicalData.map((d: MonthlyRevenue) => d.revenue);

    // 線形回帰によるトレンド計算
    const { slope, intercept } = linearRegression(revenues);

    // 標準偏差（予測の不確実性）
    const stdDev = standardDeviation(revenues);

    // 平均成長率の計算
    const avgRevenue =
      revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
    const growthRate = (slope / avgRevenue) * 100;

    // 予測を生成
    const forecasts: RevenueForecast[] = [];
    const lastData = historicalData[historicalData.length - 1];
    let currentMonth = new Date(lastData.year, lastData.month - 1); // month is 1-based

    for (let i = 1; i <= forecastMonths; i++) {
      currentMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
      );
      const monthNum = currentMonth.getMonth() + 1;
      const yearNum = currentMonth.getFullYear();

      // ベース予測（線形回帰）
      const baseForecast = slope * (revenues.length + i - 1) + intercept;

      // 季節性補正
      const seasonalFactor = getSeasonalFactor(monthNum);
      const seasonallyAdjusted = baseForecast * seasonalFactor;

      // 3シナリオ予測
      const optimistic = Math.round(seasonallyAdjusted + stdDev * 1.5); // +1.5σ
      const realistic = Math.round(seasonallyAdjusted); // トレンド通り
      const pessimistic = Math.round(seasonallyAdjusted - stdDev * 1.5); // -1.5σ

      // 信頼度（予測期間が長いほど低下）
      const confidence = Math.max(95 - i * 10, 50);

      forecasts.push({
        month: `${yearNum}/${monthNum.toString().padStart(2, '0')}`,
        year: yearNum,
        optimistic: Math.max(optimistic, 0),
        realistic: Math.max(realistic, 0),
        pessimistic: Math.max(pessimistic, 0),
        confidence,
      });
    }

    // 統計情報の計算
    const totalRealisticForecast = forecasts.reduce(
      (sum, f) => sum + f.realistic,
      0,
    );
    const totalOptimisticForecast = forecasts.reduce(
      (sum, f) => sum + f.optimistic,
      0,
    );
    const totalPessimisticForecast = forecasts.reduce(
      (sum, f) => sum + f.pessimistic,
      0,
    );

    const stats = {
      trendSlope: slope,
      growthRate: growthRate.toFixed(2),
      averageRevenue: Math.round(avgRevenue),
      standardDeviation: Math.round(stdDev),
      forecastPeriod: forecastMonths,
      totalRealisticForecast: Math.round(totalRealisticForecast),
      totalOptimisticForecast: Math.round(totalOptimisticForecast),
      totalPessimisticForecast: Math.round(totalPessimisticForecast),
      averageConfidence:
        forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length,
    };

    return NextResponse.json({
      success: true,
      forecasts,
      stats,
      historicalData,
      message: `${forecastMonths}ヶ月間の売上トレンド予測を生成しました`,
    });
  } catch (error) {
    console.error('Error forecasting revenue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to forecast revenue' },
      { status: 500 },
    );
  }
}

/**
 * デフォルト予測データの取得
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';

    // サンプル過去データ（12ヶ月）
    const historicalData: MonthlyRevenue[] = [
      {
        month: '2024/01',
        year: 2024,
        revenue: 85000000,
        orders: 18,
        averageOrderValue: 4722222,
      },
      {
        month: '2024/02',
        year: 2024,
        revenue: 78000000,
        orders: 16,
        averageOrderValue: 4875000,
      },
      {
        month: '2024/03',
        year: 2024,
        revenue: 125000000,
        orders: 25,
        averageOrderValue: 5000000,
      },
      {
        month: '2024/04',
        year: 2024,
        revenue: 95000000,
        orders: 20,
        averageOrderValue: 4750000,
      },
      {
        month: '2024/05',
        year: 2024,
        revenue: 98000000,
        orders: 22,
        averageOrderValue: 4454545,
      },
      {
        month: '2024/06',
        year: 2024,
        revenue: 102000000,
        orders: 23,
        averageOrderValue: 4434783,
      },
      {
        month: '2024/07',
        year: 2024,
        revenue: 92000000,
        orders: 19,
        averageOrderValue: 4842105,
      },
      {
        month: '2024/08',
        year: 2024,
        revenue: 88000000,
        orders: 17,
        averageOrderValue: 5176471,
      },
      {
        month: '2024/09',
        year: 2024,
        revenue: 108000000,
        orders: 24,
        averageOrderValue: 4500000,
      },
      {
        month: '2024/10',
        year: 2024,
        revenue: 115000000,
        orders: 26,
        averageOrderValue: 4423077,
      },
      {
        month: '2024/11',
        year: 2024,
        revenue: 118000000,
        orders: 27,
        averageOrderValue: 4370370,
      },
      {
        month: '2024/12',
        year: 2024,
        revenue: 128000000,
        orders: 28,
        averageOrderValue: 4571429,
      },
    ];

    // POST /api/ai/revenue-forecast を内部的に呼び出す
    const response = await POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ historicalData, forecastMonths: 6 }),
      }),
    );

    return response;
  } catch (error) {
    console.error('Error fetching revenue forecast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue forecast' },
      { status: 500 },
    );
  }
}
