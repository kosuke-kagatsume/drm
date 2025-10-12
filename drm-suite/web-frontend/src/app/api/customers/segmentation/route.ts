import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 顧客セグメント情報の型定義
interface CustomerSegmentation {
  customerId: string;
  customerName: string;
  segment: 'A' | 'B' | 'C' | 'D';
  score: number;
  factors: {
    revenueScore: number; // 売上スコア (0-100)
    frequencyScore: number; // 取引頻度スコア (0-100)
    profitabilityScore: number; // 粗利率スコア (0-100)
    recencyScore: number; // 最終取引からの経過日数スコア (0-100)
    growthScore: number; // 成長率スコア (0-100)
  };
  metrics: {
    totalRevenue: number;
    orderCount: number;
    averageProfitRate: number;
    lastOrderDate: string;
    growthRate: number;
  };
  strategy: string; // 推奨営業戦略
  risk: 'low' | 'medium' | 'high'; // リスクレベル
}

// サンプル顧客データ
const sampleCustomers = [
  {
    customerId: 'CUST-001',
    customerName: '山田太郎',
    totalRevenue: 45000000,
    orderCount: 8,
    averageProfitRate: 28.5,
    lastOrderDate: '2024-09-20',
    growthRate: 15.5,
  },
  {
    customerId: 'CUST-002',
    customerName: '佐藤建設',
    totalRevenue: 120000000,
    orderCount: 15,
    averageProfitRate: 25.0,
    lastOrderDate: '2024-10-10',
    growthRate: 8.2,
  },
  {
    customerId: 'CUST-003',
    customerName: '田中商事',
    totalRevenue: 28000000,
    orderCount: 5,
    averageProfitRate: 22.0,
    lastOrderDate: '2024-08-15',
    growthRate: -3.5,
  },
  {
    customerId: 'CUST-004',
    customerName: '鈴木ハウジング',
    totalRevenue: 180000000,
    orderCount: 22,
    averageProfitRate: 30.0,
    lastOrderDate: '2024-10-08',
    growthRate: 12.0,
  },
  {
    customerId: 'CUST-005',
    customerName: '高橋工務店',
    totalRevenue: 5000000,
    orderCount: 2,
    averageProfitRate: 18.0,
    lastOrderDate: '2024-07-01',
    growthRate: 0,
  },
  {
    customerId: 'CUST-006',
    customerName: '伊藤マンション',
    totalRevenue: 65000000,
    orderCount: 10,
    averageProfitRate: 24.0,
    lastOrderDate: '2024-09-25',
    growthRate: 5.5,
  },
  {
    customerId: 'CUST-007',
    customerName: '渡辺住宅',
    totalRevenue: 32000000,
    orderCount: 6,
    averageProfitRate: 26.5,
    lastOrderDate: '2024-10-05',
    growthRate: 10.0,
  },
  {
    customerId: 'CUST-008',
    customerName: '小林建築',
    totalRevenue: 15000000,
    orderCount: 3,
    averageProfitRate: 20.0,
    lastOrderDate: '2024-06-15',
    growthRate: -5.0,
  },
];

/**
 * 顧客セグメンテーションの計算
 */
function calculateSegmentation(
  customer: (typeof sampleCustomers)[0],
): CustomerSegmentation {
  // 1. 売上スコア (0-100)
  let revenueScore = 0;
  if (customer.totalRevenue >= 100000000) {
    revenueScore = 100;
  } else if (customer.totalRevenue >= 50000000) {
    revenueScore = 80;
  } else if (customer.totalRevenue >= 20000000) {
    revenueScore = 60;
  } else if (customer.totalRevenue >= 10000000) {
    revenueScore = 40;
  } else {
    revenueScore = 20;
  }

  // 2. 取引頻度スコア (0-100)
  let frequencyScore = 0;
  if (customer.orderCount >= 20) {
    frequencyScore = 100;
  } else if (customer.orderCount >= 10) {
    frequencyScore = 80;
  } else if (customer.orderCount >= 5) {
    frequencyScore = 60;
  } else if (customer.orderCount >= 3) {
    frequencyScore = 40;
  } else {
    frequencyScore = 20;
  }

  // 3. 粗利率スコア (0-100)
  let profitabilityScore = 0;
  if (customer.averageProfitRate >= 28) {
    profitabilityScore = 100;
  } else if (customer.averageProfitRate >= 25) {
    profitabilityScore = 80;
  } else if (customer.averageProfitRate >= 22) {
    profitabilityScore = 60;
  } else if (customer.averageProfitRate >= 20) {
    profitabilityScore = 40;
  } else {
    profitabilityScore = 20;
  }

  // 4. 最終取引からの経過日数スコア (0-100)
  const lastOrderDate = new Date(customer.lastOrderDate);
  const today = new Date();
  const daysSinceLastOrder = Math.floor(
    (today.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  let recencyScore = 0;
  if (daysSinceLastOrder <= 30) {
    recencyScore = 100;
  } else if (daysSinceLastOrder <= 60) {
    recencyScore = 80;
  } else if (daysSinceLastOrder <= 90) {
    recencyScore = 60;
  } else if (daysSinceLastOrder <= 120) {
    recencyScore = 40;
  } else {
    recencyScore = 20;
  }

  // 5. 成長率スコア (0-100)
  let growthScore = 0;
  if (customer.growthRate >= 10) {
    growthScore = 100;
  } else if (customer.growthRate >= 5) {
    growthScore = 80;
  } else if (customer.growthRate >= 0) {
    growthScore = 60;
  } else if (customer.growthRate >= -5) {
    growthScore = 40;
  } else {
    growthScore = 20;
  }

  // 総合スコアの計算（重み付け平均）
  const totalScore = Math.round(
    revenueScore * 0.3 + // 30%
      frequencyScore * 0.25 + // 25%
      profitabilityScore * 0.2 + // 20%
      recencyScore * 0.15 + // 15%
      growthScore * 0.1, // 10%
  );

  // セグメント判定
  let segment: 'A' | 'B' | 'C' | 'D';
  if (totalScore >= 80) {
    segment = 'A';
  } else if (totalScore >= 60) {
    segment = 'B';
  } else if (totalScore >= 40) {
    segment = 'C';
  } else {
    segment = 'D';
  }

  // リスク評価
  let risk: 'low' | 'medium' | 'high';
  if (recencyScore <= 40 || growthScore <= 40) {
    risk = 'high';
  } else if (recencyScore <= 60 || growthScore <= 60) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  // 推奨営業戦略の生成
  let strategy = '';
  if (segment === 'A') {
    strategy =
      '最重要顧客。定期的な訪問と特別なサービス提供で関係を強化。新規案件の優先的な提案を実施。';
  } else if (segment === 'B') {
    strategy =
      '優良顧客。定期フォローとクロスセル施策で売上拡大を目指す。Aランクへの引き上げを検討。';
  } else if (segment === 'C') {
    strategy =
      '標準顧客。効率的なフォローと適切なタイミングでの提案。取引頻度の向上を目指す。';
  } else {
    strategy =
      '要注意顧客。休眠化のリスクあり。早急なコンタクトと課題のヒアリングが必要。';
  }

  // リスク別の追加アドバイス
  if (risk === 'high') {
    strategy +=
      ' ⚠️ 高リスク：最終取引から時間が経過しているか、成長率が低下しています。早急なフォローが必要です。';
  }

  return {
    customerId: customer.customerId,
    customerName: customer.customerName,
    segment,
    score: totalScore,
    factors: {
      revenueScore,
      frequencyScore,
      profitabilityScore,
      recencyScore,
      growthScore,
    },
    metrics: {
      totalRevenue: customer.totalRevenue,
      orderCount: customer.orderCount,
      averageProfitRate: customer.averageProfitRate,
      lastOrderDate: customer.lastOrderDate,
      growthRate: customer.growthRate,
    },
    strategy,
    risk,
  };
}

// Next.jsにこのルートを動的にレンダリングさせる
export const dynamic = 'force-dynamic';

/**
 * 顧客セグメンテーション分析API
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';

    // 全顧客のセグメンテーションを計算
    const segmentations = sampleCustomers.map(calculateSegmentation);

    // セグメント別の統計
    const stats = {
      total: segmentations.length,
      segmentA: segmentations.filter((s) => s.segment === 'A').length,
      segmentB: segmentations.filter((s) => s.segment === 'B').length,
      segmentC: segmentations.filter((s) => s.segment === 'C').length,
      segmentD: segmentations.filter((s) => s.segment === 'D').length,
      highRisk: segmentations.filter((s) => s.risk === 'high').length,
      averageScore:
        segmentations.reduce((sum, s) => sum + s.score, 0) /
        segmentations.length,
      totalRevenue: segmentations.reduce(
        (sum, s) => sum + s.metrics.totalRevenue,
        0,
      ),
    };

    // セグメント別の売上貢献度
    const segmentRevenue = {
      A: segmentations
        .filter((s) => s.segment === 'A')
        .reduce((sum, s) => sum + s.metrics.totalRevenue, 0),
      B: segmentations
        .filter((s) => s.segment === 'B')
        .reduce((sum, s) => sum + s.metrics.totalRevenue, 0),
      C: segmentations
        .filter((s) => s.segment === 'C')
        .reduce((sum, s) => sum + s.metrics.totalRevenue, 0),
      D: segmentations
        .filter((s) => s.segment === 'D')
        .reduce((sum, s) => sum + s.metrics.totalRevenue, 0),
    };

    return NextResponse.json({
      success: true,
      segmentations,
      stats,
      segmentRevenue,
      message: `${segmentations.length}件の顧客をセグメント分析しました`,
    });
  } catch (error) {
    console.error('Error calculating customer segmentation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate customer segmentation' },
      { status: 500 },
    );
  }
}
