import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// タグカテゴリの定義
export type TagCategory =
  | 'work_type' // 工事種別
  | 'customer_type' // 顧客属性
  | 'priority' // 優先度
  | 'status' // ステータス
  | 'source' // 獲得経路
  | 'custom'; // カスタム

// タグの型定義
interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string; // Tailwind color class
  icon?: string; // emoji icon
  description: string;
  usageCount: number; // 使用回数
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// サンプルタグデータ
const sampleTags: Tag[] = [
  // 工事種別
  {
    id: 'TAG-001',
    name: '外壁塗装',
    category: 'work_type',
    color: 'bg-blue-500',
    icon: '🏠',
    description: '建物の外壁塗装工事',
    usageCount: 45,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-002',
    name: '屋根工事',
    category: 'work_type',
    color: 'bg-orange-500',
    icon: '🏘️',
    description: '屋根の修理・葺き替え工事',
    usageCount: 32,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-003',
    name: '防水工事',
    category: 'work_type',
    color: 'bg-cyan-500',
    icon: '💧',
    description: 'ベランダ・屋上などの防水工事',
    usageCount: 28,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-004',
    name: '改修工事',
    category: 'work_type',
    color: 'bg-purple-500',
    icon: '🔧',
    description: '大規模改修・リフォーム工事',
    usageCount: 18,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-005',
    name: '外装工事',
    category: 'work_type',
    color: 'bg-indigo-500',
    icon: '🏗️',
    description: '建物外装全般の工事',
    usageCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },

  // 顧客属性
  {
    id: 'TAG-006',
    name: '法人',
    category: 'customer_type',
    color: 'bg-green-600',
    icon: '🏢',
    description: '法人顧客',
    usageCount: 52,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-007',
    name: '個人',
    category: 'customer_type',
    color: 'bg-green-400',
    icon: '👤',
    description: '個人顧客',
    usageCount: 38,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-008',
    name: 'リピーター',
    category: 'customer_type',
    color: 'bg-emerald-500',
    icon: '🔄',
    description: '過去に取引実績がある顧客',
    usageCount: 42,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-009',
    name: '新規',
    category: 'customer_type',
    color: 'bg-teal-500',
    icon: '✨',
    description: '新規顧客',
    usageCount: 25,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-010',
    name: 'マンション',
    category: 'customer_type',
    color: 'bg-lime-500',
    icon: '🏬',
    description: 'マンション管理組合',
    usageCount: 20,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-011',
    name: '戸建て',
    category: 'customer_type',
    color: 'bg-green-500',
    icon: '🏡',
    description: '戸建て住宅',
    usageCount: 35,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },

  // 優先度
  {
    id: 'TAG-012',
    name: '重要',
    category: 'priority',
    color: 'bg-red-600',
    icon: '⭐',
    description: '重要度が高い案件',
    usageCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-013',
    name: '緊急',
    category: 'priority',
    color: 'bg-red-500',
    icon: '🚨',
    description: '緊急対応が必要',
    usageCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-014',
    name: '大型案件',
    category: 'priority',
    color: 'bg-amber-600',
    icon: '💰',
    description: '高額・大規模な案件',
    usageCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },

  // ステータス
  {
    id: 'TAG-015',
    name: '要フォロー',
    category: 'status',
    color: 'bg-yellow-500',
    icon: '📞',
    description: 'フォローアップが必要',
    usageCount: 22,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-016',
    name: '検討中',
    category: 'status',
    color: 'bg-yellow-400',
    icon: '🤔',
    description: '顧客が検討中',
    usageCount: 18,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-017',
    name: '休眠',
    category: 'status',
    color: 'bg-gray-500',
    icon: '💤',
    description: '長期間連絡なし',
    usageCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },

  // 獲得経路
  {
    id: 'TAG-018',
    name: 'Web問い合わせ',
    category: 'source',
    color: 'bg-blue-400',
    icon: '🌐',
    description: 'Webサイトからの問い合わせ',
    usageCount: 30,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-019',
    name: '紹介',
    category: 'source',
    color: 'bg-pink-500',
    icon: '🤝',
    description: '既存顧客からの紹介',
    usageCount: 25,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
  {
    id: 'TAG-020',
    name: '電話',
    category: 'source',
    color: 'bg-violet-500',
    icon: '☎️',
    description: '電話での問い合わせ',
    usageCount: 20,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-12T00:00:00Z',
    createdBy: 'system',
  },
];

// カテゴリの定義
const categoryConfig: Record<
  TagCategory,
  { label: string; description: string; icon: string }
> = {
  work_type: {
    label: '工事種別',
    description: '工事の種類を分類するタグ',
    icon: '🏗️',
  },
  customer_type: {
    label: '顧客属性',
    description: '顧客の属性を分類するタグ',
    icon: '👥',
  },
  priority: {
    label: '優先度',
    description: '案件の優先度を示すタグ',
    icon: '⚡',
  },
  status: {
    label: 'ステータス',
    description: '顧客の状態を示すタグ',
    icon: '📊',
  },
  source: {
    label: '獲得経路',
    description: '顧客の獲得経路を示すタグ',
    icon: '🎯',
  },
  custom: {
    label: 'カスタム',
    description: 'その他のカスタムタグ',
    icon: '🏷️',
  },
};

// 統計計算
function calculateTagStats(tags: Tag[]) {
  const totalTags = tags.length;
  const totalUsage = tags.reduce((sum, tag) => sum + tag.usageCount, 0);

  // カテゴリ別集計
  const byCategory = tags.reduce(
    (acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = { count: 0, usage: 0 };
      }
      acc[tag.category].count++;
      acc[tag.category].usage += tag.usageCount;
      return acc;
    },
    {} as Record<TagCategory, { count: number; usage: number }>,
  );

  // 使用頻度TOP 10
  const topTags = [...tags]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);

  // 未使用タグ
  const unusedTags = tags.filter((tag) => tag.usageCount === 0);

  return {
    totalTags,
    totalUsage,
    averageUsage: totalUsage / totalTags,
    byCategory,
    topTags,
    unusedTags,
  };
}

/**
 * タグ一覧取得API
 * GET /api/customers/tags
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // フィルタリング
    let filteredTags = [...sampleTags];

    if (category && category !== 'all') {
      filteredTags = filteredTags.filter((t) => t.category === category);
    }

    // 統計計算
    const stats = calculateTagStats(sampleTags);

    return NextResponse.json({
      success: true,
      tags: filteredTags,
      categories: categoryConfig,
      stats,
      message: `${filteredTags.length}件のタグを取得しました`,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 },
    );
  }
}

/**
 * タグ作成API
 * POST /api/customers/tags
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const body = await request.json();

    // 新規タグの作成（シミュレーション）
    const newTag: Tag = {
      id: `TAG-${Date.now()}`,
      name: body.name,
      category: body.category,
      color: body.color || 'bg-gray-500',
      icon: body.icon,
      description: body.description || '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || 'user',
    };

    sampleTags.push(newTag);

    return NextResponse.json({
      success: true,
      tag: newTag,
      message: `タグ「${newTag.name}」を作成しました`,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 },
    );
  }
}

/**
 * タグ更新API
 * PATCH /api/customers/tags
 */
export async function PATCH(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const body = await request.json();
    const { tagId, ...updates } = body;

    // タグの更新（シミュレーション）
    const tag = sampleTags.find((t) => t.id === tagId);
    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 },
      );
    }

    Object.assign(tag, updates, { updatedAt: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      tag,
      message: `タグ「${tag.name}」を更新しました`,
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 },
    );
  }
}

/**
 * タグ削除API
 * DELETE /api/customers/tags
 */
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json(
        { success: false, error: 'Tag ID is required' },
        { status: 400 },
      );
    }

    // タグの削除（シミュレーション）
    const index = sampleTags.findIndex((t) => t.id === tagId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 },
      );
    }

    const deletedTag = sampleTags.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: `タグ「${deletedTag.name}」を削除しました`,
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 },
    );
  }
}
