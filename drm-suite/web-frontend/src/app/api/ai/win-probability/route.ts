import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 見積データの型定義
interface Estimate {
  id: string;
  estimateNo: string;
  customerName: string;
  customerId?: string;
  salesRepName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// 受注予測結果の型定義
interface WinProbability {
  estimateId: string;
  estimateNo: string;
  customerName: string;
  salesRepName: string;
  totalAmount: number;
  probability: number; // 0-100
  confidenceLevel: 'high' | 'medium' | 'low';
  factors: {
    salesRepHistory: number; // 営業担当者の過去受注率
    customerHistory: number; // 顧客との取引履歴スコア
    amountFactor: number; // 金額レンジスコア
    timeFactor: number; // 経過日数スコア
    statusFactor: number; // ステータススコア
  };
  recommendation: string;
  nextAction: string;
}

// 営業担当者の過去実績（サンプルデータ）
const salesRepHistory: Record<
  string,
  { totalEstimates: number; wonEstimates: number }
> = {
  '田中 一郎': { totalEstimates: 50, wonEstimates: 36 },
  '佐藤 花子': { totalEstimates: 45, wonEstimates: 33 },
  '鈴木 健太': { totalEstimates: 60, wonEstimates: 40 },
  '高橋 美咲': { totalEstimates: 38, wonEstimates: 27 },
  '伊藤 誠': { totalEstimates: 30, wonEstimates: 18 },
};

// 顧客取引履歴（サンプルデータ）
const customerHistory: Record<
  string,
  { pastOrders: number; totalRevenue: number }
> = {
  山田太郎: { pastOrders: 5, totalRevenue: 45000000 },
  佐藤建設: { pastOrders: 8, totalRevenue: 120000000 },
  田中商事: { pastOrders: 3, totalRevenue: 28000000 },
  鈴木ハウジング: { pastOrders: 12, totalRevenue: 180000000 },
  高橋工務店: { pastOrders: 0, totalRevenue: 0 },
};

// ステータス別の受注確度ベース値
const statusBaseProbability: Record<string, number> = {
  draft: 20,
  submitted: 40,
  negotiating: 60,
  final_review: 80,
  won: 100,
  lost: 0,
};

/**
 * 受注予測AI - 見積の受注確度を計算
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { estimates } = await request.json();

    if (!estimates || !Array.isArray(estimates)) {
      return NextResponse.json(
        { success: false, error: 'Estimates array is required' },
        { status: 400 },
      );
    }

    // 各見積の受注確度を計算
    const predictions: WinProbability[] = estimates.map(
      (estimate: Estimate) => {
        // 1. 営業担当者の過去実績スコア (0-100)
        const repHistory = salesRepHistory[estimate.salesRepName] || {
          totalEstimates: 10,
          wonEstimates: 5,
        };
        const salesRepScore =
          (repHistory.wonEstimates / repHistory.totalEstimates) * 100;

        // 2. 顧客取引履歴スコア (0-100)
        const custHistory = customerHistory[estimate.customerName] || {
          pastOrders: 0,
          totalRevenue: 0,
        };
        let customerScore = 50; // デフォルト（新規顧客）
        if (custHistory.pastOrders > 0) {
          // 既存顧客: 取引回数と金額でスコア計算
          customerScore = Math.min(
            50 +
              custHistory.pastOrders * 5 +
              (custHistory.totalRevenue / 10000000) * 2,
            100,
          );
        } else {
          // 新規顧客: やや低めのスコア
          customerScore = 40;
        }

        // 3. 金額レンジスコア (0-100)
        // 大きすぎる案件は受注確度が下がる傾向
        let amountScore = 70;
        if (estimate.totalAmount < 5000000) {
          amountScore = 80; // 小規模案件は受注しやすい
        } else if (estimate.totalAmount < 20000000) {
          amountScore = 70; // 中規模案件
        } else if (estimate.totalAmount < 50000000) {
          amountScore = 60; // 大規模案件
        } else {
          amountScore = 45; // 超大規模案件は慎重
        }

        // 4. 経過日数スコア (0-100)
        const createdDate = new Date(estimate.createdAt);
        const now = new Date();
        const daysPassed = Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        let timeScore = 80;
        if (daysPassed <= 7) {
          timeScore = 90; // フレッシュな見積
        } else if (daysPassed <= 30) {
          timeScore = 70; // 1ヶ月以内
        } else if (daysPassed <= 60) {
          timeScore = 50; // 2ヶ月以内
        } else {
          timeScore = 30; // 古い見積は確度低下
        }

        // 5. ステータススコア (0-100)
        const statusScore = statusBaseProbability[estimate.status] || 50;

        // 総合受注確度の計算（重み付け平均）
        const probability = Math.round(
          salesRepScore * 0.25 + // 25%
            customerScore * 0.2 + // 20%
            amountScore * 0.15 + // 15%
            timeScore * 0.1 + // 10%
            statusScore * 0.3, // 30%
        );

        // 信頼度レベルの判定
        let confidenceLevel: 'high' | 'medium' | 'low';
        if (probability >= 70) {
          confidenceLevel = 'high';
        } else if (probability >= 40) {
          confidenceLevel = 'medium';
        } else {
          confidenceLevel = 'low';
        }

        // レコメンデーションの生成
        let recommendation = '';
        let nextAction = '';

        if (probability >= 80) {
          recommendation =
            '受注確度が非常に高い案件です。積極的にクロージングを進めましょう。';
          nextAction = 'クロージング面談の設定';
        } else if (probability >= 60) {
          recommendation =
            '受注見込みのある案件です。定期的なフォローアップを継続しましょう。';
          nextAction = '週次フォローアップ';
        } else if (probability >= 40) {
          recommendation =
            '受注確度が中程度の案件です。課題のヒアリングと提案の見直しを検討しましょう。';
          nextAction = '顧客課題の再ヒアリング';
        } else {
          recommendation =
            '受注確度が低い案件です。競合状況の確認や条件の再交渉が必要かもしれません。';
          nextAction = '競合分析・条件見直し';
        }

        // 特殊ケースの判定
        if (daysPassed > 60) {
          recommendation +=
            ' ※提案から時間が経過しています。早急なフォローが必要です。';
          nextAction = '緊急フォローアップ';
        }

        if (estimate.totalAmount > 50000000) {
          recommendation +=
            ' ※高額案件のため、経営層との調整も視野に入れましょう。';
        }

        return {
          estimateId: estimate.id,
          estimateNo: estimate.estimateNo,
          customerName: estimate.customerName,
          salesRepName: estimate.salesRepName,
          totalAmount: estimate.totalAmount,
          probability,
          confidenceLevel,
          factors: {
            salesRepHistory: Math.round(salesRepScore),
            customerHistory: Math.round(customerScore),
            amountFactor: amountScore,
            timeFactor: timeScore,
            statusFactor: statusScore,
          },
          recommendation,
          nextAction,
        };
      },
    );

    // 統計情報の計算
    const stats = {
      totalEstimates: predictions.length,
      highProbability: predictions.filter((p) => p.probability >= 70).length,
      mediumProbability: predictions.filter(
        (p) => p.probability >= 40 && p.probability < 70,
      ).length,
      lowProbability: predictions.filter((p) => p.probability < 40).length,
      averageProbability:
        predictions.reduce((sum, p) => sum + p.probability, 0) /
        predictions.length,
      expectedRevenue: predictions.reduce(
        (sum, p) => sum + p.totalAmount * (p.probability / 100),
        0,
      ),
    };

    return NextResponse.json({
      success: true,
      predictions,
      stats,
      message: `${predictions.length}件の見積の受注確度を予測しました`,
    });
  } catch (error) {
    console.error('Error predicting win probability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to predict win probability' },
      { status: 500 },
    );
  }
}

/**
 * 受注予測データの取得（全見積のデフォルト予測）
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';

    // サンプル見積データ
    const sampleEstimates: Estimate[] = [
      {
        id: 'EST-001',
        estimateNo: 'EST-2024-001',
        customerName: '山田太郎',
        salesRepName: '田中 一郎',
        status: 'negotiating',
        totalAmount: 12000000,
        createdAt: '2024-10-01',
        updatedAt: '2024-10-10',
      },
      {
        id: 'EST-002',
        estimateNo: 'EST-2024-002',
        customerName: '佐藤建設',
        salesRepName: '佐藤 花子',
        status: 'final_review',
        totalAmount: 28000000,
        createdAt: '2024-09-20',
        updatedAt: '2024-10-08',
      },
      {
        id: 'EST-003',
        estimateNo: 'EST-2024-003',
        customerName: '高橋工務店',
        salesRepName: '鈴木 健太',
        status: 'submitted',
        totalAmount: 8500000,
        createdAt: '2024-08-15',
        updatedAt: '2024-08-20',
      },
      {
        id: 'EST-004',
        estimateNo: 'EST-2024-004',
        customerName: '鈴木ハウジング',
        salesRepName: '高橋 美咲',
        status: 'negotiating',
        totalAmount: 45000000,
        createdAt: '2024-09-30',
        updatedAt: '2024-10-11',
      },
      {
        id: 'EST-005',
        estimateNo: 'EST-2024-005',
        customerName: '田中商事',
        salesRepName: '伊藤 誠',
        status: 'submitted',
        totalAmount: 15000000,
        createdAt: '2024-10-05',
        updatedAt: '2024-10-05',
      },
    ];

    // POST /api/ai/win-probability を内部的に呼び出す
    const response = await POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ estimates: sampleEstimates }),
      }),
    );

    return response;
  } catch (error) {
    console.error('Error fetching win probability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch win probability' },
      { status: 500 },
    );
  }
}
