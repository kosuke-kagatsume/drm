import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// パイプラインステージの定義
export type PipelineStage =
  | 'lead' // リード
  | 'contact' // 初回接触
  | 'negotiation' // 商談中
  | 'proposal' // 提案
  | 'quoted' // 見積提出
  | 'won' // 受注
  | 'lost'; // 失注

// 案件情報の型定義
interface Deal {
  id: string;
  customerId: string;
  customerName: string;
  title: string; // 案件名
  stage: PipelineStage;
  value: number; // 案件金額
  probability: number; // 受注確度 (0-100%)
  expectedCloseDate: string; // 予想受注日
  assignee: string; // 担当者
  lastActivity: string; // 最終活動日
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes: string; // メモ
}

// サンプル案件データ
const sampleDeals: Deal[] = [
  // リード (新規問い合わせ)
  {
    id: 'DEAL-001',
    customerId: 'CUST-001',
    customerName: '山田太郎',
    title: '外壁塗装の問い合わせ',
    stage: 'lead',
    value: 1200000,
    probability: 10,
    expectedCloseDate: '2024-12-20',
    assignee: '山田花子',
    lastActivity: '2024-10-10',
    createdAt: '2024-10-10T09:00:00Z',
    updatedAt: '2024-10-10T09:00:00Z',
    tags: ['外壁塗装', '戸建て'],
    notes: 'Webサイトから問い合わせ。築15年の戸建て。',
  },
  {
    id: 'DEAL-002',
    customerId: 'CUST-009',
    customerName: '中村建設',
    title: '屋根修理の相談',
    stage: 'lead',
    value: 800000,
    probability: 10,
    expectedCloseDate: '2024-11-30',
    assignee: '鈴木一郎',
    lastActivity: '2024-10-11',
    createdAt: '2024-10-11T14:00:00Z',
    updatedAt: '2024-10-11T14:00:00Z',
    tags: ['屋根工事', '法人'],
    notes: '電話での問い合わせ。工場の屋根修理。',
  },

  // 初回接触 (訪問・ヒアリング済み)
  {
    id: 'DEAL-003',
    customerId: 'CUST-002',
    customerName: '佐藤建設',
    title: '大規模改修工事',
    stage: 'contact',
    value: 15000000,
    probability: 30,
    expectedCloseDate: '2025-02-15',
    assignee: '山田花子',
    lastActivity: '2024-10-09',
    createdAt: '2024-09-20T10:00:00Z',
    updatedAt: '2024-10-09T15:00:00Z',
    tags: ['大型案件', '改修工事'],
    notes: '初回訪問完了。要望ヒアリング済み。',
  },
  {
    id: 'DEAL-004',
    customerId: 'CUST-010',
    customerName: '加藤マンション',
    title: 'マンション外壁塗装',
    stage: 'contact',
    value: 8000000,
    probability: 25,
    expectedCloseDate: '2024-12-31',
    assignee: '鈴木一郎',
    lastActivity: '2024-10-08',
    createdAt: '2024-09-25T11:00:00Z',
    updatedAt: '2024-10-08T16:00:00Z',
    tags: ['外壁塗装', 'マンション'],
    notes: '管理組合との打ち合わせ済み。',
  },

  // 商談中 (ニーズ確認・提案準備)
  {
    id: 'DEAL-005',
    customerId: 'CUST-003',
    customerName: '田中商事',
    title: '倉庫屋根の防水工事',
    stage: 'negotiation',
    value: 4500000,
    probability: 50,
    expectedCloseDate: '2024-11-20',
    assignee: '山田花子',
    lastActivity: '2024-10-07',
    createdAt: '2024-09-05T09:00:00Z',
    updatedAt: '2024-10-07T14:00:00Z',
    tags: ['防水工事', '倉庫'],
    notes: '2回目訪問完了。予算感の確認済み。',
  },
  {
    id: 'DEAL-006',
    customerId: 'CUST-004',
    customerName: '鈴木ハウジング',
    title: '新築物件の外装工事',
    stage: 'negotiation',
    value: 25000000,
    probability: 60,
    expectedCloseDate: '2024-12-10',
    assignee: '鈴木一郎',
    lastActivity: '2024-10-06',
    createdAt: '2024-08-20T10:00:00Z',
    updatedAt: '2024-10-06T17:00:00Z',
    tags: ['新築', '外装工事', '大型案件'],
    notes: '定例打ち合わせ実施中。仕様決定段階。',
  },

  // 提案 (提案資料作成・プレゼン)
  {
    id: 'DEAL-007',
    customerId: 'CUST-005',
    customerName: '高橋工務店',
    title: '外壁塗装＋防水工事',
    stage: 'proposal',
    value: 3200000,
    probability: 70,
    expectedCloseDate: '2024-11-05',
    assignee: '山田花子',
    lastActivity: '2024-10-05',
    createdAt: '2024-08-10T09:00:00Z',
    updatedAt: '2024-10-05T16:00:00Z',
    tags: ['外壁塗装', '防水工事'],
    notes: '提案書作成中。来週プレゼン予定。',
  },
  {
    id: 'DEAL-008',
    customerId: 'CUST-011',
    customerName: '松本不動産',
    title: 'ビル外壁改修工事',
    stage: 'proposal',
    value: 18000000,
    probability: 65,
    expectedCloseDate: '2024-12-01',
    assignee: '鈴木一郎',
    lastActivity: '2024-10-04',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-10-04T15:00:00Z',
    tags: ['外壁改修', 'ビル', '大型案件'],
    notes: 'プレゼン完了。好感触。',
  },

  // 見積提出 (見積書提出済み・回答待ち)
  {
    id: 'DEAL-009',
    customerId: 'CUST-006',
    customerName: '伊藤マンション',
    title: 'マンション大規模修繕',
    stage: 'quoted',
    value: 12000000,
    probability: 80,
    expectedCloseDate: '2024-10-25',
    assignee: '山田花子',
    lastActivity: '2024-10-03',
    createdAt: '2024-07-15T09:00:00Z',
    updatedAt: '2024-10-03T14:00:00Z',
    tags: ['大規模修繕', 'マンション'],
    notes: '見積書提出済み。理事会承認待ち。',
  },
  {
    id: 'DEAL-010',
    customerId: 'CUST-007',
    customerName: '渡辺住宅',
    title: '外壁塗装工事',
    stage: 'quoted',
    value: 2800000,
    probability: 85,
    expectedCloseDate: '2024-10-20',
    assignee: '鈴木一郎',
    lastActivity: '2024-10-02',
    createdAt: '2024-07-20T10:00:00Z',
    updatedAt: '2024-10-02T16:00:00Z',
    tags: ['外壁塗装', '戸建て'],
    notes: '見積承認済み。契約書準備中。',
  },

  // 受注 (契約締結済み)
  {
    id: 'DEAL-011',
    customerId: 'CUST-008',
    customerName: '小林建築',
    title: '屋根葺き替え工事',
    stage: 'won',
    value: 4200000,
    probability: 100,
    expectedCloseDate: '2024-10-01',
    assignee: '山田花子',
    lastActivity: '2024-10-01',
    createdAt: '2024-06-10T09:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    tags: ['屋根工事', '葺き替え'],
    notes: '契約締結完了。工事開始予定: 10/15',
  },

  // 失注
  {
    id: 'DEAL-012',
    customerId: 'CUST-012',
    customerName: '森田ビル',
    title: 'ビル外壁塗装',
    stage: 'lost',
    value: 9000000,
    probability: 0,
    expectedCloseDate: '2024-09-30',
    assignee: '鈴木一郎',
    lastActivity: '2024-09-28',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-09-28T14:00:00Z',
    tags: ['外壁塗装', 'ビル'],
    notes: '価格で他社に敗退。次回に向けてフォロー継続。',
  },
];

// ステージ別の統計計算
function calculatePipelineStats(deals: Deal[]) {
  const stages: PipelineStage[] = [
    'lead',
    'contact',
    'negotiation',
    'proposal',
    'quoted',
    'won',
    'lost',
  ];

  const stats = stages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
      averageProbability:
        stageDeals.length > 0
          ? stageDeals.reduce((sum, d) => sum + d.probability, 0) /
            stageDeals.length
          : 0,
      weightedValue: stageDeals.reduce(
        (sum, d) => sum + d.value * (d.probability / 100),
        0,
      ),
    };
  });

  // 全体統計
  const activeDeals = deals.filter(
    (d) => d.stage !== 'won' && d.stage !== 'lost',
  );
  const wonDeals = deals.filter((d) => d.stage === 'won');
  const lostDeals = deals.filter((d) => d.stage === 'lost');

  return {
    byStage: stats,
    overall: {
      totalDeals: deals.length,
      activeDeals: activeDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      totalValue: deals.reduce((sum, d) => sum + d.value, 0),
      activeValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
      wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
      lostValue: lostDeals.reduce((sum, d) => sum + d.value, 0),
      weightedValue: activeDeals.reduce(
        (sum, d) => sum + d.value * (d.probability / 100),
        0,
      ),
      winRate:
        wonDeals.length + lostDeals.length > 0
          ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
          : 0,
    },
  };
}

/**
 * 案件パイプライン取得API
 * GET /api/customers/pipeline
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const assignee = searchParams.get('assignee');

    // フィルタリング
    let filteredDeals = [...sampleDeals];

    if (stage && stage !== 'all') {
      filteredDeals = filteredDeals.filter((d) => d.stage === stage);
    }

    if (assignee && assignee !== 'all') {
      filteredDeals = filteredDeals.filter((d) => d.assignee === assignee);
    }

    // 統計計算
    const stats = calculatePipelineStats(sampleDeals);

    return NextResponse.json({
      success: true,
      deals: filteredDeals,
      stats,
      message: `${filteredDeals.length}件の案件を取得しました`,
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline' },
      { status: 500 },
    );
  }
}

/**
 * 案件ステージ更新API
 * PATCH /api/customers/pipeline
 */
export async function PATCH(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const body = await request.json();
    const { dealId, stage, notes } = body;

    // 実際の実装ではデータベースを更新
    const deal = sampleDeals.find((d) => d.id === dealId);
    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 },
      );
    }

    // ステージ更新のシミュレーション
    deal.stage = stage;
    deal.updatedAt = new Date().toISOString();
    if (notes) {
      deal.notes = notes;
    }

    // 確度の自動調整
    const probabilityMap: Record<PipelineStage, number> = {
      lead: 10,
      contact: 25,
      negotiation: 50,
      proposal: 70,
      quoted: 85,
      won: 100,
      lost: 0,
    };
    deal.probability = probabilityMap[stage];

    return NextResponse.json({
      success: true,
      deal,
      message: `案件のステージを${stage}に更新しました`,
    });
  } catch (error) {
    console.error('Error updating pipeline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pipeline' },
      { status: 500 },
    );
  }
}
