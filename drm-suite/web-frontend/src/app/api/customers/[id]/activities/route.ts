import { NextRequest, NextResponse } from 'next/server';
import type { Activity } from '@/types/customer';

// モックデータ
const mockActivities: Record<string, Activity[]> = {
  '1': [
    {
      id: 'act-1',
      customerId: '1',
      propertyId: 'prop-1',
      type: 'visit',
      title: '初回ヒアリング訪問',
      content: 'ご自宅を訪問し、新築のご要望をヒアリング。南向きの明るい家をご希望。予算は3500万円程度。',
      nextAction: '敷地調査の日程調整',
      nextActionDate: '2025-09-05',
      createdBy: 'user-1',
      createdByName: '営業部 田中',
      createdAt: '2025-09-01T14:30:00Z',
      isAutomatic: false,
      duration: 90,
      outcome: '良好。契約見込み高い。',
    },
    {
      id: 'act-2',
      customerId: '1',
      propertyId: 'prop-1',
      type: 'meeting',
      title: '設計打ち合わせ（第1回）',
      content: 'IC担当と設計担当同席で初回打ち合わせ。間取りの希望を詳細にヒアリング。LDK20畳以上、主寝室は8畳以上、子供部屋2室。',
      nextAction: 'プラン図面作成',
      nextActionDate: '2025-09-15',
      createdBy: 'user-2',
      createdByName: 'IC 佐藤',
      createdAt: '2025-09-08T10:00:00Z',
      isAutomatic: false,
      duration: 120,
      outcome: 'プラン方向性決定',
    },
    {
      id: 'act-3',
      customerId: '1',
      propertyId: 'prop-1',
      type: 'estimate',
      title: '見積書提出（A案）',
      content: '木造2階建て、延床120㎡の見積書を提出。総額3,280万円。',
      createdBy: 'user-1',
      createdByName: '営業部 田中',
      createdAt: '2025-09-18T16:00:00Z',
      isAutomatic: true,
      outcome: '好反応',
    },
    {
      id: 'act-4',
      customerId: '1',
      type: 'call',
      title: '電話フォロー',
      content: '見積書に関する質問対応。キッチンのグレードアップを検討中とのこと。',
      nextAction: 'キッチンショールーム案内',
      nextActionDate: '2025-09-25',
      createdBy: 'user-1',
      createdByName: '営業部 田中',
      createdAt: '2025-09-20T11:30:00Z',
      isAutomatic: false,
      duration: 15,
    },
    {
      id: 'act-5',
      customerId: '1',
      propertyId: 'prop-1',
      type: 'contract',
      title: '契約締結',
      content: '工事請負契約を締結。契約金額3,350万円（キッチングレードアップ後）。',
      createdBy: 'user-1',
      createdByName: '営業部 田中',
      createdAt: '2025-09-28T15:00:00Z',
      isAutomatic: true,
      outcome: '契約成立',
    },
    {
      id: 'act-6',
      customerId: '1',
      propertyId: 'prop-2',
      type: 'visit',
      title: '実家リフォームの下見',
      content: 'お客様のご実家を訪問。築28年木造2階建て。水回り全面改修と耐震補強のご要望。',
      nextAction: '現地調査・診断',
      nextActionDate: '2025-10-08',
      createdBy: 'user-3',
      createdByName: 'リフォーム部 鈴木',
      createdAt: '2025-09-28T10:30:00Z',
      isAutomatic: false,
      duration: 60,
      outcome: '詳細調査が必要',
    },
    {
      id: 'act-7',
      customerId: '1',
      type: 'ma_action',
      title: 'メールマガジン開封',
      content: '【施工事例】世田谷区の新築実例をご紹介 - メールを開封しました',
      createdBy: 'system',
      createdByName: 'MA自動記録',
      createdAt: '2025-09-27T09:15:00Z',
      isAutomatic: true,
    },
    {
      id: 'act-8',
      customerId: '1',
      type: 'note',
      title: '社内メモ',
      content: 'お客様は予算感がしっかりしており、意思決定も早い。追加案件（リフォーム）の可能性も高い。VIP対応継続。',
      createdBy: 'user-1',
      createdByName: '営業部 田中',
      createdAt: '2025-09-28T17:00:00Z',
      isAutomatic: false,
    },
  ],
};

/**
 * GET /api/customers/[id]/activities - 顧客の活動履歴取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const propertyId = searchParams.get('propertyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let activities = mockActivities[params.id] || [];

    // フィルター
    if (type) {
      activities = activities.filter(a => a.type === type);
    }
    if (propertyId) {
      activities = activities.filter(a => a.propertyId === propertyId);
    }

    // 最新順にソート
    activities.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // ページネーション
    const total = activities.length;
    const paginated = activities.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers/[id]/activities - 活動記録の新規作成
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 必須フィールドのバリデーション
    if (!body.type || !body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Type, title, and content are required' },
        { status: 400 }
      );
    }

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      customerId: params.id,
      propertyId: body.propertyId,
      type: body.type,
      title: body.title,
      content: body.content,
      nextAction: body.nextAction,
      nextActionDate: body.nextActionDate,
      createdBy: 'current-user-id', // TODO: 実際のユーザーID
      createdByName: body.createdByName || '現在のユーザー',
      createdAt: new Date().toISOString(),
      isAutomatic: false,
      duration: body.duration,
      outcome: body.outcome,
      attachments: body.attachments,
    };

    // TODO: DBに保存
    if (!mockActivities[params.id]) {
      mockActivities[params.id] = [];
    }
    mockActivities[params.id].unshift(newActivity);

    return NextResponse.json({
      success: true,
      data: newActivity,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
