import { NextRequest, NextResponse } from 'next/server';

// 工事項目マスタのデータ型
export interface ConstructionItem {
  id: string;
  tenantId: string;
  code: string; // 工事項目コード (例: "CI-001")
  name: string; // 工事項目名 (例: "大工工事")
  category: string; // 業種・カテゴリ (例: "躯体工事", "仕上工事")
  unitType: 'tsubo' | 'sqm' | 'meter' | 'unit' | 'fixed'; // 単位種別
  unitPrice: number; // 単価
  accountSubjectId?: string; // デフォルト勘定科目ID
  accountSubjectCode?: string; // デフォルト勘定科目コード
  accountSubjectName?: string; // デフォルト勘定科目名
  description?: string; // 説明
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 単位種別のラベル
export const unitTypeLabels = {
  tsubo: '坪',
  sqm: '平米',
  meter: 'メーター',
  unit: '箇所',
  fixed: '定額',
};

// メモリ内データストア
const constructionItemsStore = new Map<string, Map<string, ConstructionItem>>();

// テナントごとの工事項目マップを取得
function getTenantConstructionItems(tenantId: string): Map<string, ConstructionItem> {
  if (!constructionItemsStore.has(tenantId)) {
    constructionItemsStore.set(tenantId, new Map());
  }
  return constructionItemsStore.get(tenantId)!;
}

// サンプルデータの初期化
function initializeSampleData(tenantId: string) {
  const items = getTenantConstructionItems(tenantId);

  if (items.size === 0) {
    const now = new Date().toISOString();

    const sampleItems: ConstructionItem[] = [
      // 躯体工事
      {
        id: 'CI-001',
        tenantId,
        code: 'CI-001',
        name: '基礎工事',
        category: '躯体工事',
        unitType: 'tsubo',
        unitPrice: 120000,
        accountSubjectId: 'AS-OUT-011',
        accountSubjectCode: '413-01-001',
        accountSubjectName: '基礎工事',
        description: 'ベタ基礎・布基礎等',
        isActive: true,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-002',
        tenantId,
        code: 'CI-002',
        name: '大工工事',
        category: '躯体工事',
        unitType: 'tsubo',
        unitPrice: 250000,
        accountSubjectId: 'AS-OUT-011',
        accountSubjectCode: '413-02-001',
        accountSubjectName: '大工工事',
        description: '木造軸組・枠組壁工法',
        isActive: true,
        displayOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-003',
        tenantId,
        code: 'CI-003',
        name: '屋根工事',
        category: '躯体工事',
        unitType: 'sqm',
        unitPrice: 8500,
        accountSubjectId: 'AS-OUT-021',
        accountSubjectCode: '413-03-001',
        accountSubjectName: '屋根工事',
        description: '屋根葺き・板金工事',
        isActive: true,
        displayOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-004',
        tenantId,
        code: 'CI-004',
        name: '外壁工事',
        category: '躯体工事',
        unitType: 'sqm',
        unitPrice: 12000,
        accountSubjectId: 'AS-OUT-021',
        accountSubjectCode: '413-04-001',
        accountSubjectName: '外装工事',
        description: 'サイディング・塗装等',
        isActive: true,
        displayOrder: 4,
        createdAt: now,
        updatedAt: now,
      },

      // 設備工事
      {
        id: 'CI-005',
        tenantId,
        code: 'CI-005',
        name: '電気工事',
        category: '設備工事',
        unitType: 'tsubo',
        unitPrice: 35000,
        accountSubjectId: 'AS-OUT-051',
        accountSubjectCode: '413-05-001',
        accountSubjectName: '電気工事',
        description: '屋内配線・照明器具取付',
        isActive: true,
        displayOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-006',
        tenantId,
        code: 'CI-006',
        name: '給排水設備工事',
        category: '設備工事',
        unitType: 'tsubo',
        unitPrice: 45000,
        accountSubjectId: 'AS-OUT-051',
        accountSubjectCode: '413-05-002',
        accountSubjectName: '給排水設備工事',
        description: '屋内配管・器具取付',
        isActive: true,
        displayOrder: 6,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-007',
        tenantId,
        code: 'CI-007',
        name: '空調設備工事',
        category: '設備工事',
        unitType: 'unit',
        unitPrice: 250000,
        accountSubjectId: 'AS-OUT-051',
        accountSubjectCode: '413-05-003',
        accountSubjectName: '空調設備工事',
        description: 'エアコン取付（1台あたり）',
        isActive: true,
        displayOrder: 7,
        createdAt: now,
        updatedAt: now,
      },

      // 仕上工事
      {
        id: 'CI-008',
        tenantId,
        code: 'CI-008',
        name: '内装仕上工事',
        category: '仕上工事',
        unitType: 'sqm',
        unitPrice: 6500,
        accountSubjectId: 'AS-OUT-021',
        accountSubjectCode: '413-06-001',
        accountSubjectName: '内装工事',
        description: 'クロス・フローリング等',
        isActive: true,
        displayOrder: 8,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-009',
        tenantId,
        code: 'CI-009',
        name: '建具工事',
        category: '仕上工事',
        unitType: 'unit',
        unitPrice: 85000,
        accountSubjectId: 'AS-OUT-021',
        accountSubjectCode: '413-06-002',
        accountSubjectName: '建具工事',
        description: 'サッシ・建具取付（1箇所あたり）',
        isActive: true,
        displayOrder: 9,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-010',
        tenantId,
        code: 'CI-010',
        name: '塗装工事',
        category: '仕上工事',
        unitType: 'sqm',
        unitPrice: 2500,
        accountSubjectId: 'AS-OUT-021',
        accountSubjectCode: '413-06-003',
        accountSubjectName: '塗装工事',
        description: '内外装塗装',
        isActive: true,
        displayOrder: 10,
        createdAt: now,
        updatedAt: now,
      },

      // 外構工事
      {
        id: 'CI-011',
        tenantId,
        code: 'CI-011',
        name: '外構工事',
        category: '外構工事',
        unitType: 'sqm',
        unitPrice: 15000,
        accountSubjectId: 'AS-OUT-031',
        accountSubjectCode: '413-07-001',
        accountSubjectName: '外構工事',
        description: '舗装・植栽・フェンス等',
        isActive: true,
        displayOrder: 11,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-012',
        tenantId,
        code: 'CI-012',
        name: '屋外給排水工事',
        category: '外構工事',
        unitType: 'meter',
        unitPrice: 8500,
        accountSubjectId: 'AS-OUT-031',
        accountSubjectCode: '413-07-002',
        accountSubjectName: '屋外給排水工事',
        description: '敷地内配管（1mあたり）',
        isActive: true,
        displayOrder: 12,
        createdAt: now,
        updatedAt: now,
      },

      // その他
      {
        id: 'CI-013',
        tenantId,
        code: 'CI-013',
        name: '解体工事',
        category: 'その他',
        unitType: 'tsubo',
        unitPrice: 35000,
        accountSubjectId: 'AS-OUT-041',
        accountSubjectCode: '413-08-001',
        accountSubjectName: '解体工事',
        description: '既存建物解体',
        isActive: true,
        displayOrder: 13,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-014',
        tenantId,
        code: 'CI-014',
        name: '仮設工事',
        category: 'その他',
        unitType: 'fixed',
        unitPrice: 350000,
        accountSubjectId: 'AS-OUT-041',
        accountSubjectCode: '413-08-002',
        accountSubjectName: '仮設工事',
        description: '足場・養生等（一式）',
        isActive: true,
        displayOrder: 14,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'CI-015',
        tenantId,
        code: 'CI-015',
        name: '諸経費',
        category: 'その他',
        unitType: 'fixed',
        unitPrice: 0,
        accountSubjectId: 'AS-EXP-011',
        accountSubjectCode: '414-01-001',
        accountSubjectName: '現場経費',
        description: '現場管理費・諸雑費',
        isActive: true,
        displayOrder: 15,
        createdAt: now,
        updatedAt: now,
      },
    ];

    sampleItems.forEach((item) => {
      items.set(item.id, item);
    });
  }
}

// GET: 工事項目一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    initializeSampleData(tenantId);
    const items = getTenantConstructionItems(tenantId);

    // 単一取得
    if (id) {
      const item = items.get(id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Construction item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, item });
    }

    // 一覧取得（フィルタリング）
    let filteredItems = Array.from(items.values());

    // カテゴリでフィルタ
    if (category) {
      filteredItems = filteredItems.filter((item) => item.category === category);
    }

    // アクティブのみ
    if (activeOnly) {
      filteredItems = filteredItems.filter((item) => item.isActive);
    }

    // 表示順でソート
    filteredItems.sort((a, b) => a.displayOrder - b.displayOrder);

    // カテゴリ一覧も返す
    const categories = Array.from(new Set(filteredItems.map((item) => item.category)));

    return NextResponse.json({
      success: true,
      items: filteredItems,
      categories,
      count: filteredItems.length,
    });
  } catch (error) {
    console.error('Error fetching construction items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch construction items' },
      { status: 500 }
    );
  }
}

// POST: 工事項目作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const body = await request.json();

    // バリデーション
    if (!body.name || !body.category || !body.unitType) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    initializeSampleData(tenantId);
    const items = getTenantConstructionItems(tenantId);

    // コード重複チェック
    if (body.code) {
      const existing = Array.from(items.values()).find(
        (item) => item.code === body.code && item.tenantId === tenantId
      );
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Construction item code already exists' },
          { status: 400 }
        );
      }
    }

    // 新規ID・コード生成
    const id = `CI-${Date.now()}`;
    const code = body.code || id;
    const now = new Date().toISOString();

    // 表示順を自動設定（最後尾）
    const maxOrder = Math.max(0, ...Array.from(items.values()).map((item) => item.displayOrder));

    const newItem: ConstructionItem = {
      id,
      tenantId,
      code,
      name: body.name,
      category: body.category,
      unitType: body.unitType,
      unitPrice: body.unitPrice || 0,
      accountSubjectId: body.accountSubjectId,
      accountSubjectCode: body.accountSubjectCode,
      accountSubjectName: body.accountSubjectName,
      description: body.description,
      isActive: body.isActive !== false,
      displayOrder: body.displayOrder ?? maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    items.set(id, newItem);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating construction item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create construction item' },
      { status: 500 }
    );
  }
}

// PUT: 工事項目更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Construction item ID is required' },
        { status: 400 }
      );
    }

    initializeSampleData(tenantId);
    const items = getTenantConstructionItems(tenantId);

    const existingItem = items.get(body.id);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Construction item not found' },
        { status: 404 }
      );
    }

    // コード重複チェック（自分以外）
    if (body.code && body.code !== existingItem.code) {
      const duplicate = Array.from(items.values()).find(
        (item) => item.code === body.code && item.id !== body.id && item.tenantId === tenantId
      );
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Construction item code already exists' },
          { status: 400 }
        );
      }
    }

    const updatedItem: ConstructionItem = {
      ...existingItem,
      ...body,
      tenantId,
      updatedAt: new Date().toISOString(),
    };

    items.set(body.id, updatedItem);

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Error updating construction item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update construction item' },
      { status: 500 }
    );
  }
}

// DELETE: 工事項目削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Construction item ID is required' },
        { status: 400 }
      );
    }

    initializeSampleData(tenantId);
    const items = getTenantConstructionItems(tenantId);

    if (!items.has(id)) {
      return NextResponse.json(
        { success: false, error: 'Construction item not found' },
        { status: 404 }
      );
    }

    items.delete(id);

    return NextResponse.json({ success: true, message: 'Construction item deleted successfully' });
  } catch (error) {
    console.error('Error deleting construction item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete construction item' },
      { status: 500 }
    );
  }
}
