import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// コミュニケーションタイプの定義
export type CommunicationType =
  | 'call' // 電話
  | 'email' // メール
  | 'meeting' // 対面ミーティング
  | 'visit' // 訪問
  | 'line' // LINE
  | 'chat' // チャット（Chatwork/Slack等）
  | 'sms' // SMS
  | 'note'; // 社内メモ

// コミュニケーション記録の型定義
interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  type: CommunicationType;
  direction: 'inbound' | 'outbound'; // 着信/発信
  subject: string; // 件名
  content: string; // 内容
  attachments: string[]; // 添付ファイル
  createdBy: string; // 記録者
  createdAt: string; // 記録日時
  duration?: number; // 通話時間（分）
  participants?: string[]; // 参加者（ミーティングの場合）
  tags: string[]; // タグ
  relatedDealId?: string; // 関連案件ID
  sentiment?: 'positive' | 'neutral' | 'negative'; // 感情分析
  nextAction?: string; // 次のアクション
}

// サンプルコミュニケーションデータ
const sampleCommunications: Communication[] = [
  // 最近のコミュニケーション
  {
    id: 'COM-001',
    customerId: 'CUST-001',
    customerName: '山田太郎',
    type: 'call',
    direction: 'outbound',
    subject: '見積内容の確認',
    content:
      '外壁塗装の見積内容について説明。予算調整の相談あり。A案とB案を提示し、次回訪問で詳細説明することで合意。',
    attachments: [],
    createdBy: '山田花子',
    createdAt: '2024-10-12T14:30:00Z',
    duration: 15,
    tags: ['見積', '予算調整'],
    relatedDealId: 'DEAL-001',
    sentiment: 'positive',
    nextAction: '来週火曜日に訪問予定',
  },
  {
    id: 'COM-002',
    customerId: 'CUST-002',
    customerName: '佐藤建設',
    type: 'meeting',
    direction: 'outbound',
    subject: '大規模改修工事の提案プレゼン',
    content:
      '改修工事の提案書を持参し、プレゼンテーション実施。施工実績の紹介と工期について詳細説明。先方から好意的な反応あり。',
    attachments: ['提案書_佐藤建設_v2.pdf', '施工実績写真.zip'],
    createdBy: '山田花子',
    createdAt: '2024-10-11T10:00:00Z',
    duration: 90,
    participants: ['佐藤社長', '工事部長', '山田花子'],
    tags: ['提案', 'プレゼン', '大型案件'],
    relatedDealId: 'DEAL-003',
    sentiment: 'positive',
    nextAction: '見積書作成・提出（2週間以内）',
  },
  {
    id: 'COM-003',
    customerId: 'CUST-003',
    customerName: '田中商事',
    type: 'email',
    direction: 'inbound',
    subject: '倉庫屋根の雨漏り相談',
    content:
      '先日の大雨で倉庫の屋根から雨漏りが発生したとのこと。早急な対応を希望。現地調査の日程調整を依頼された。',
    attachments: ['雨漏り箇所写真.jpg'],
    createdBy: '山田花子',
    createdAt: '2024-10-10T08:45:00Z',
    tags: ['緊急', '雨漏り', '現地調査'],
    relatedDealId: 'DEAL-005',
    sentiment: 'negative',
    nextAction: '明日午前中に現地調査',
  },
  {
    id: 'COM-004',
    customerId: 'CUST-004',
    customerName: '鈴木ハウジング',
    type: 'line',
    direction: 'inbound',
    subject: '工事進捗の確認',
    content:
      '新築物件の外装工事の進捗について確認。写真を送って欲しいとのリクエスト。',
    attachments: [],
    createdBy: '鈴木一郎',
    createdAt: '2024-10-09T16:20:00Z',
    tags: ['進捗確認', '写真送付'],
    relatedDealId: 'DEAL-006',
    sentiment: 'neutral',
    nextAction: '工事現場の写真を撮影して送付',
  },
  {
    id: 'COM-005',
    customerId: 'CUST-005',
    customerName: '高橋工務店',
    type: 'visit',
    direction: 'outbound',
    subject: '外壁塗装の現地調査',
    content:
      '築20年の建物の現地調査実施。外壁の劣化状況を確認し、写真撮影。塗装面積の実測も完了。防水工事の必要性も説明。',
    attachments: ['現地調査報告書.pdf', '外壁写真.zip'],
    createdBy: '山田花子',
    createdAt: '2024-10-08T13:00:00Z',
    duration: 60,
    tags: ['現地調査', '写真撮影', '実測'],
    relatedDealId: 'DEAL-007',
    sentiment: 'positive',
    nextAction: '見積書作成（3日以内）',
  },
  {
    id: 'COM-006',
    customerId: 'CUST-006',
    customerName: '伊藤マンション',
    type: 'chat',
    direction: 'inbound',
    subject: '理事会の日程確認',
    content:
      'Chatworkで理事会の日程について連絡あり。大規模修繕の見積について、理事会で説明してほしいとのこと。',
    attachments: [],
    createdBy: '山田花子',
    createdAt: '2024-10-07T11:15:00Z',
    tags: ['理事会', '日程調整'],
    relatedDealId: 'DEAL-009',
    sentiment: 'neutral',
    nextAction: '理事会資料の準備',
  },
  {
    id: 'COM-007',
    customerId: 'CUST-007',
    customerName: '渡辺住宅',
    type: 'call',
    direction: 'inbound',
    subject: '契約書の内容確認',
    content:
      '外壁塗装の契約書について質問あり。保証内容と支払い条件について詳細説明。特に問題なく、来週契約予定。',
    attachments: [],
    createdBy: '鈴木一郎',
    createdAt: '2024-10-06T15:30:00Z',
    duration: 20,
    tags: ['契約', '保証内容'],
    relatedDealId: 'DEAL-010',
    sentiment: 'positive',
    nextAction: '契約書最終版を郵送',
  },
  {
    id: 'COM-008',
    customerId: 'CUST-008',
    customerName: '小林建築',
    type: 'email',
    direction: 'outbound',
    subject: '工事完了のご報告',
    content:
      '屋根葺き替え工事が無事完了したことを報告。完成写真と保証書を添付。今後のメンテナンスについても案内。',
    attachments: ['完成写真.pdf', '保証書.pdf', 'メンテナンスガイド.pdf'],
    createdBy: '山田花子',
    createdAt: '2024-10-05T17:00:00Z',
    tags: ['工事完了', '保証書', 'アフターフォロー'],
    relatedDealId: 'DEAL-011',
    sentiment: 'positive',
    nextAction: '1ヶ月後点検の日程調整',
  },
  {
    id: 'COM-009',
    customerId: 'CUST-001',
    customerName: '山田太郎',
    type: 'meeting',
    direction: 'outbound',
    subject: '初回訪問・ヒアリング',
    content:
      '外壁塗装の相談で初回訪問。築年数、前回塗装時期、予算感などをヒアリング。近隣施工実績を紹介し、信頼関係構築。',
    attachments: ['会社案内.pdf'],
    createdBy: '山田花子',
    createdAt: '2024-10-04T10:30:00Z',
    duration: 45,
    tags: ['初回訪問', 'ヒアリング'],
    sentiment: 'positive',
    nextAction: '現地調査の日程調整',
  },
  {
    id: 'COM-010',
    customerId: 'CUST-002',
    customerName: '佐藤建設',
    type: 'call',
    direction: 'inbound',
    subject: '追加工事の相談',
    content:
      '大規模改修に加えて、防水工事も検討したいとの連絡。追加見積の依頼あり。現場を再確認して見積を作成することで合意。',
    attachments: [],
    createdBy: '山田花子',
    createdAt: '2024-10-03T14:00:00Z',
    duration: 10,
    tags: ['追加工事', '防水工事'],
    relatedDealId: 'DEAL-003',
    sentiment: 'positive',
    nextAction: '追加見積作成',
  },
];

// 統計計算
function calculateCommunicationStats(communications: Communication[]) {
  const total = communications.length;

  // タイプ別集計
  const byType = communications.reduce(
    (acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + 1;
      return acc;
    },
    {} as Record<CommunicationType, number>,
  );

  // 方向別集計
  const byDirection = {
    inbound: communications.filter((c) => c.direction === 'inbound').length,
    outbound: communications.filter((c) => c.direction === 'outbound').length,
  };

  // 感情分析集計
  const bySentiment = {
    positive: communications.filter((c) => c.sentiment === 'positive').length,
    neutral: communications.filter((c) => c.sentiment === 'neutral').length,
    negative: communications.filter((c) => c.sentiment === 'negative').length,
  };

  // 担当者別集計
  const byCreator = communications.reduce(
    (acc, comm) => {
      acc[comm.createdBy] = (acc[comm.createdBy] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // 最近7日間の活動
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentActivity = communications.filter(
    (c) => new Date(c.createdAt) >= sevenDaysAgo,
  ).length;

  return {
    total,
    byType,
    byDirection,
    bySentiment,
    byCreator,
    recentActivity,
  };
}

/**
 * コミュニケーション履歴取得API
 * GET /api/customers/communications
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');
    const createdBy = searchParams.get('createdBy');

    // フィルタリング
    let filteredComms = [...sampleCommunications];

    if (customerId && customerId !== 'all') {
      filteredComms = filteredComms.filter((c) => c.customerId === customerId);
    }

    if (type && type !== 'all') {
      filteredComms = filteredComms.filter((c) => c.type === type);
    }

    if (createdBy && createdBy !== 'all') {
      filteredComms = filteredComms.filter((c) => c.createdBy === createdBy);
    }

    // 日付降順でソート
    filteredComms.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // 統計計算
    const stats = calculateCommunicationStats(sampleCommunications);

    return NextResponse.json({
      success: true,
      communications: filteredComms,
      stats,
      message: `${filteredComms.length}件のコミュニケーション記録を取得しました`,
    });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communications' },
      { status: 500 },
    );
  }
}

/**
 * コミュニケーション記録作成API
 * POST /api/customers/communications
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const body = await request.json();

    // 新規コミュニケーション記録の作成（シミュレーション）
    const newCommunication: Communication = {
      id: `COM-${Date.now()}`,
      customerId: body.customerId,
      customerName: body.customerName,
      type: body.type,
      direction: body.direction,
      subject: body.subject,
      content: body.content,
      attachments: body.attachments || [],
      createdBy: body.createdBy,
      createdAt: new Date().toISOString(),
      duration: body.duration,
      participants: body.participants,
      tags: body.tags || [],
      relatedDealId: body.relatedDealId,
      sentiment: body.sentiment,
      nextAction: body.nextAction,
    };

    sampleCommunications.unshift(newCommunication);

    return NextResponse.json({
      success: true,
      communication: newCommunication,
      message: 'コミュニケーション記録を作成しました',
    });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create communication' },
      { status: 500 },
    );
  }
}
