import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// 勘定科目インターフェース
export interface AccountSubject {
  id: string;
  tenantId: string;
  code: string; // 勘定科目コード（例: 411-01-001）
  name: string; // 勘定科目名称
  level: 1 | 2 | 3; // 階層レベル（1=大分類, 2=中分類, 3=小分類）
  parentCode?: string; // 親コード
  accountingCode?: string; // 会計ソフト連携コード
  category: 'material' | 'labor' | 'outsourcing' | 'expense'; // カテゴリ
  description?: string; // 説明
  isActive: boolean; // 有効/無効
  displayOrder: number; // 表示順序
  createdAt: string;
  updatedAt: string;
}

// メモリ内データストア（テナント別）
let accountSubjects: Map<string, AccountSubject[]> = new Map();

// 建設業標準の勘定科目（デフォルトデータ）
const getDefaultAccountSubjects = (tenantId: string): AccountSubject[] => {
  const now = new Date().toISOString();

  return [
    // ===== 材料費 =====
    // 大分類
    { id: 'AS-MAT-000', tenantId, code: '411', name: '材料費', level: 1, category: 'material', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },

    // 中分類
    { id: 'AS-MAT-010', tenantId, code: '411-01', name: '主要材料費', level: 2, parentCode: '411', category: 'material', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-020', tenantId, code: '411-02', name: '補助材料費', level: 2, parentCode: '411', category: 'material', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-030', tenantId, code: '411-03', name: '買入部品費', level: 2, parentCode: '411', category: 'material', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },

    // 小分類 - 主要材料費
    { id: 'AS-MAT-011', tenantId, code: '411-01-001', name: '木材', level: 3, parentCode: '411-01', accountingCode: '41101001', category: 'material', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-012', tenantId, code: '411-01-002', name: '鋼材', level: 3, parentCode: '411-01', accountingCode: '41101002', category: 'material', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-013', tenantId, code: '411-01-003', name: 'コンクリート', level: 3, parentCode: '411-01', accountingCode: '41101003', category: 'material', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-014', tenantId, code: '411-01-004', name: 'セメント', level: 3, parentCode: '411-01', accountingCode: '41101004', category: 'material', isActive: true, displayOrder: 4, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-015', tenantId, code: '411-01-005', name: '骨材', level: 3, parentCode: '411-01', accountingCode: '41101005', category: 'material', isActive: true, displayOrder: 5, createdAt: now, updatedAt: now },

    // 小分類 - 補助材料費
    { id: 'AS-MAT-021', tenantId, code: '411-02-001', name: '釘・ビス類', level: 3, parentCode: '411-02', accountingCode: '41102001', category: 'material', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-022', tenantId, code: '411-02-002', name: '接着剤', level: 3, parentCode: '411-02', accountingCode: '41102002', category: 'material', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-023', tenantId, code: '411-02-003', name: '塗料', level: 3, parentCode: '411-02', accountingCode: '41102003', category: 'material', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },

    // 小分類 - 買入部品費
    { id: 'AS-MAT-031', tenantId, code: '411-03-001', name: '建具', level: 3, parentCode: '411-03', accountingCode: '41103001', category: 'material', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-032', tenantId, code: '411-03-002', name: '設備機器', level: 3, parentCode: '411-03', accountingCode: '41103002', category: 'material', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-MAT-033', tenantId, code: '411-03-003', name: '衛生器具', level: 3, parentCode: '411-03', accountingCode: '41103003', category: 'material', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },

    // ===== 労務費 =====
    // 大分類
    { id: 'AS-LAB-000', tenantId, code: '412', name: '労務費', level: 1, category: 'labor', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },

    // 中分類
    { id: 'AS-LAB-010', tenantId, code: '412-01', name: '直接労務費', level: 2, parentCode: '412', category: 'labor', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-LAB-020', tenantId, code: '412-02', name: '間接労務費', level: 2, parentCode: '412', category: 'labor', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-LAB-030', tenantId, code: '412-03', name: '福利厚生費', level: 2, parentCode: '412', category: 'labor', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },

    // 小分類 - 直接労務費
    { id: 'AS-LAB-011', tenantId, code: '412-01-001', name: '現場作業員給与', level: 3, parentCode: '412-01', accountingCode: '41201001', category: 'labor', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-LAB-012', tenantId, code: '412-01-002', name: '職人手間賃', level: 3, parentCode: '412-01', accountingCode: '41201002', category: 'labor', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },

    // 小分類 - 間接労務費
    { id: 'AS-LAB-021', tenantId, code: '412-02-001', name: '現場管理者給与', level: 3, parentCode: '412-02', accountingCode: '41202001', category: 'labor', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },

    // 小分類 - 福利厚生費
    { id: 'AS-LAB-031', tenantId, code: '412-03-001', name: '法定福利費', level: 3, parentCode: '412-03', accountingCode: '41203001', category: 'labor', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },

    // ===== 外注費 =====
    // 大分類
    { id: 'AS-OUT-000', tenantId, code: '413', name: '外注費', level: 1, category: 'outsourcing', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },

    // 中分類（工種別）
    { id: 'AS-OUT-010', tenantId, code: '413-01', name: '基礎工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-020', tenantId, code: '413-02', name: '大工工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-030', tenantId, code: '413-03', name: '左官工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-040', tenantId, code: '413-04', name: '屋根工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 4, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-050', tenantId, code: '413-05', name: '板金工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 5, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-060', tenantId, code: '413-06', name: '防水工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 6, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-070', tenantId, code: '413-07', name: '断熱工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 7, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-080', tenantId, code: '413-08', name: '外壁工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 8, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-090', tenantId, code: '413-09', name: '内装工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 9, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-100', tenantId, code: '413-10', name: '建具工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 10, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-110', tenantId, code: '413-11', name: '塗装工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 11, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-120', tenantId, code: '413-12', name: '電気工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 12, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-130', tenantId, code: '413-13', name: '給排水工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 13, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-140', tenantId, code: '413-14', name: '空調工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 14, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-150', tenantId, code: '413-15', name: 'ガス工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 15, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-160', tenantId, code: '413-16', name: '外構工事', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 16, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-170', tenantId, code: '413-17', name: '設計外注費', level: 2, parentCode: '413', category: 'outsourcing', isActive: true, displayOrder: 17, createdAt: now, updatedAt: now },

    // 小分類例（基礎工事）
    { id: 'AS-OUT-011', tenantId, code: '413-01-001', name: '掘削工事', level: 3, parentCode: '413-01', accountingCode: '41301001', category: 'outsourcing', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-OUT-012', tenantId, code: '413-01-002', name: 'べた基礎工事', level: 3, parentCode: '413-01', accountingCode: '41301002', category: 'outsourcing', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },

    // ===== 経費 =====
    // 大分類
    { id: 'AS-EXP-000', tenantId, code: '414', name: '経費', level: 1, category: 'expense', isActive: true, displayOrder: 4, createdAt: now, updatedAt: now },

    // 中分類
    { id: 'AS-EXP-010', tenantId, code: '414-01', name: '現場経費', level: 2, parentCode: '414', category: 'expense', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-EXP-020', tenantId, code: '414-02', name: '共通経費', level: 2, parentCode: '414', category: 'expense', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },

    // 小分類 - 現場経費
    { id: 'AS-EXP-011', tenantId, code: '414-01-001', name: '運搬費', level: 3, parentCode: '414-01', accountingCode: '41401001', category: 'expense', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-EXP-012', tenantId, code: '414-01-002', name: '機械経費', level: 3, parentCode: '414-01', accountingCode: '41401002', category: 'expense', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { id: 'AS-EXP-013', tenantId, code: '414-01-003', name: '水道光熱費', level: 3, parentCode: '414-01', accountingCode: '41401003', category: 'expense', isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },
    { id: 'AS-EXP-014', tenantId, code: '414-01-004', name: '仮設費', level: 3, parentCode: '414-01', accountingCode: '41401004', category: 'expense', isActive: true, displayOrder: 4, createdAt: now, updatedAt: now },
    { id: 'AS-EXP-015', tenantId, code: '414-01-005', name: '廃棄物処理費', level: 3, parentCode: '414-01', accountingCode: '41401005', category: 'expense', isActive: true, displayOrder: 5, createdAt: now, updatedAt: now },

    // 小分類 - 共通経費
    { id: 'AS-EXP-021', tenantId, code: '414-02-001', name: '現場管理費', level: 3, parentCode: '414-02', accountingCode: '41402001', category: 'expense', isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { id: 'AS-EXP-022', tenantId, code: '414-02-002', name: '一般管理費', level: 3, parentCode: '414-02', accountingCode: '41402002', category: 'expense', isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
  ];
};

// 初期化
const initializeDefaultData = (tenantId: string) => {
  if (!accountSubjects.has(tenantId)) {
    accountSubjects.set(tenantId, getDefaultAccountSubjects(tenantId));
  }
};

// GET: 勘定科目一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeDefaultData(tenantId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const parentCode = searchParams.get('parentCode');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let subjects = accountSubjects.get(tenantId) || [];

    // フィルタリング
    if (id) {
      const subject = subjects.find((s) => s.id === id);
      return NextResponse.json({ success: true, subject });
    }

    if (level) {
      subjects = subjects.filter((s) => s.level === parseInt(level));
    }

    if (category) {
      subjects = subjects.filter((s) => s.category === category);
    }

    if (parentCode) {
      subjects = subjects.filter((s) => s.parentCode === parentCode);
    }

    if (activeOnly) {
      subjects = subjects.filter((s) => s.isActive);
    }

    // 表示順序でソート
    subjects.sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json({
      success: true,
      subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error('Error fetching account subjects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account subjects' },
      { status: 500 }
    );
  }
}

// POST: 勘定科目作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeDefaultData(tenantId);

    const data = await request.json();
    const subjects = accountSubjects.get(tenantId) || [];

    // コード重複チェック
    const existingCode = subjects.find((s) => s.code === data.code);
    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'この勘定科目コードは既に使用されています' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newSubject: AccountSubject = {
      id: `AS-${Date.now()}`,
      tenantId,
      code: data.code,
      name: data.name,
      level: data.level,
      parentCode: data.parentCode,
      accountingCode: data.accountingCode,
      category: data.category,
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder || subjects.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    subjects.push(newSubject);
    accountSubjects.set(tenantId, subjects);

    return NextResponse.json({
      success: true,
      subject: newSubject,
      message: '勘定科目を作成しました',
    });
  } catch (error) {
    console.error('Error creating account subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account subject' },
      { status: 500 }
    );
  }
}

// PUT: 勘定科目更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeDefaultData(tenantId);

    const data = await request.json();
    const { id } = data;

    const subjects = accountSubjects.get(tenantId) || [];
    const index = subjects.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: '勘定科目が見つかりません' },
        { status: 404 }
      );
    }

    // コード変更時の重複チェック
    if (data.code && data.code !== subjects[index].code) {
      const existingCode = subjects.find((s) => s.code === data.code && s.id !== id);
      if (existingCode) {
        return NextResponse.json(
          { success: false, error: 'この勘定科目コードは既に使用されています' },
          { status: 400 }
        );
      }
    }

    subjects[index] = {
      ...subjects[index],
      ...data,
      id: subjects[index].id,
      tenantId: subjects[index].tenantId,
      createdAt: subjects[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    accountSubjects.set(tenantId, subjects);

    return NextResponse.json({
      success: true,
      subject: subjects[index],
      message: '勘定科目を更新しました',
    });
  } catch (error) {
    console.error('Error updating account subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update account subject' },
      { status: 500 }
    );
  }
}

// DELETE: 勘定科目削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeDefaultData(tenantId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDが必要です' },
        { status: 400 }
      );
    }

    const subjects = accountSubjects.get(tenantId) || [];
    const subject = subjects.find((s) => s.id === id);

    if (!subject) {
      return NextResponse.json(
        { success: false, error: '勘定科目が見つかりません' },
        { status: 404 }
      );
    }

    // 子要素があるかチェック
    const hasChildren = subjects.some((s) => s.parentCode === subject.code);
    if (hasChildren) {
      return NextResponse.json(
        { success: false, error: '子要素が存在するため削除できません' },
        { status: 400 }
      );
    }

    const filteredSubjects = subjects.filter((s) => s.id !== id);
    accountSubjects.set(tenantId, filteredSubjects);

    return NextResponse.json({
      success: true,
      message: '勘定科目を削除しました',
    });
  } catch (error) {
    console.error('Error deleting account subject:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account subject' },
      { status: 500 }
    );
  }
}
