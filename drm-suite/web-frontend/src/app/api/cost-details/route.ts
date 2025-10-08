import { NextRequest, NextResponse } from 'next/server';

// 原価明細のデータ型
export interface CostDetail {
  id: string;
  tenantId: string;
  ledgerId: string; // 工事台帳ID
  date: string; // 発生日
  accountSubjectId: string; // 勘定科目ID
  accountSubjectCode: string; // 勘定科目コード (例: "411-01-001")
  accountSubjectName: string; // 勘定科目名 (例: "木材")
  category: 'material' | 'labor' | 'outsourcing' | 'expense';
  amount: number; // 金額（税抜）
  taxRate?: number; // 税率（%）
  taxAmount?: number; // 税額
  totalAmount?: number; // 税込金額
  supplier?: string; // 仕入先
  invoiceNo?: string; // 請求書番号
  orderId?: string; // 発注ID（紐付けられる場合）
  dwId?: string; // DW連携ID
  description?: string; // 摘要
  attachments?: string[]; // 添付ファイルURL
  paymentStatus?: 'unpaid' | 'paid' | 'partial'; // 支払状況
  paymentDate?: string; // 支払日
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// メモリ内データストア
const costDetailsStore = new Map<string, Map<string, CostDetail>>();

// テナントごとの原価明細マップを取得
function getTenantCostDetails(tenantId: string): Map<string, CostDetail> {
  if (!costDetailsStore.has(tenantId)) {
    costDetailsStore.set(tenantId, new Map());
  }
  return costDetailsStore.get(tenantId)!;
}

// サンプルデータの初期化
function initializeSampleData(tenantId: string) {
  const costDetails = getTenantCostDetails(tenantId);

  if (costDetails.size === 0) {
    const samples: CostDetail[] = [
      {
        id: 'CD-001',
        tenantId,
        ledgerId: 'CL-001',
        date: '2024-10-01',
        accountSubjectId: 'AS-MAT-011',
        accountSubjectCode: '411-01-001',
        accountSubjectName: '木材',
        category: 'material',
        amount: 150000,
        taxRate: 10,
        taxAmount: 15000,
        totalAmount: 165000,
        supplier: '○○木材株式会社',
        invoiceNo: 'INV-2024-001',
        description: '構造材（杉・桧）',
        paymentStatus: 'paid',
        paymentDate: '2024-10-15',
        createdBy: 'user@example.com',
        createdAt: '2024-10-01T09:00:00Z',
        updatedAt: '2024-10-01T09:00:00Z',
      },
      {
        id: 'CD-002',
        tenantId,
        ledgerId: 'CL-001',
        date: '2024-10-02',
        accountSubjectId: 'AS-MAT-012',
        accountSubjectCode: '411-01-002',
        accountSubjectName: '鋼材',
        category: 'material',
        amount: 80000,
        taxRate: 10,
        taxAmount: 8000,
        totalAmount: 88000,
        supplier: '△△鋼材商事',
        invoiceNo: 'INV-2024-002',
        description: 'H鋼・鉄骨材',
        paymentStatus: 'unpaid',
        createdBy: 'user@example.com',
        createdAt: '2024-10-02T10:00:00Z',
        updatedAt: '2024-10-02T10:00:00Z',
      },
      {
        id: 'CD-003',
        tenantId,
        ledgerId: 'CL-001',
        date: '2024-10-03',
        accountSubjectId: 'AS-LAB-011',
        accountSubjectCode: '412-01-001',
        accountSubjectName: '大工',
        category: 'labor',
        amount: 120000,
        description: '大工作業（3日間）',
        paymentStatus: 'paid',
        paymentDate: '2024-10-20',
        createdBy: 'user@example.com',
        createdAt: '2024-10-03T08:00:00Z',
        updatedAt: '2024-10-03T08:00:00Z',
      },
      {
        id: 'CD-004',
        tenantId,
        ledgerId: 'CL-001',
        date: '2024-10-05',
        accountSubjectId: 'AS-OUT-011',
        accountSubjectCode: '413-02-001',
        accountSubjectName: '大工工事',
        category: 'outsourcing',
        amount: 500000,
        taxRate: 10,
        taxAmount: 50000,
        totalAmount: 550000,
        supplier: '××工務店',
        invoiceNo: 'INV-2024-003',
        orderId: 'ORD-001',
        description: '大工工事一式',
        paymentStatus: 'partial',
        createdBy: 'user@example.com',
        createdAt: '2024-10-05T14:00:00Z',
        updatedAt: '2024-10-05T14:00:00Z',
      },
      {
        id: 'CD-005',
        tenantId,
        ledgerId: 'CL-001',
        date: '2024-10-08',
        accountSubjectId: 'AS-EXP-011',
        accountSubjectCode: '414-01-001',
        accountSubjectName: '現場消耗品費',
        category: 'expense',
        amount: 25000,
        taxRate: 10,
        taxAmount: 2500,
        totalAmount: 27500,
        supplier: 'ホームセンター',
        description: '工具・消耗品',
        paymentStatus: 'paid',
        paymentDate: '2024-10-08',
        createdBy: 'user@example.com',
        createdAt: '2024-10-08T16:00:00Z',
        updatedAt: '2024-10-08T16:00:00Z',
      },
    ];

    samples.forEach((detail) => {
      costDetails.set(detail.id, detail);
    });
  }
}

// GET: 原価明細一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const ledgerId = searchParams.get('ledgerId');
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    initializeSampleData(tenantId);
    const costDetails = getTenantCostDetails(tenantId);

    // 単一明細取得
    if (id) {
      const detail = costDetails.get(id);
      if (!detail) {
        return NextResponse.json(
          { success: false, error: 'Cost detail not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, detail });
    }

    // 一覧取得（フィルタリング）
    let filteredDetails = Array.from(costDetails.values());

    // 工事台帳IDでフィルタ
    if (ledgerId) {
      filteredDetails = filteredDetails.filter((d) => d.ledgerId === ledgerId);
    }

    // カテゴリでフィルタ
    if (category) {
      filteredDetails = filteredDetails.filter((d) => d.category === category);
    }

    // 日付範囲でフィルタ
    if (startDate) {
      filteredDetails = filteredDetails.filter((d) => d.date >= startDate);
    }
    if (endDate) {
      filteredDetails = filteredDetails.filter((d) => d.date <= endDate);
    }

    // 日付の降順でソート
    filteredDetails.sort((a, b) => b.date.localeCompare(a.date));

    // カテゴリ別集計
    const summary = {
      material: 0,
      labor: 0,
      outsourcing: 0,
      expense: 0,
      total: 0,
    };

    filteredDetails.forEach((detail) => {
      const amount = detail.totalAmount || detail.amount;
      summary[detail.category] += amount;
      summary.total += amount;
    });

    return NextResponse.json({
      success: true,
      details: filteredDetails,
      summary,
      count: filteredDetails.length,
    });
  } catch (error) {
    console.error('Error fetching cost details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost details' },
      { status: 500 }
    );
  }
}

// POST: 原価明細作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const body = await request.json();

    // バリデーション
    if (!body.ledgerId || !body.date || !body.accountSubjectId || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    initializeSampleData(tenantId);
    const costDetails = getTenantCostDetails(tenantId);

    // 新規ID生成
    const id = `CD-${Date.now()}`;
    const now = new Date().toISOString();

    // 税額計算
    const taxRate = body.taxRate || 0;
    const taxAmount = taxRate > 0 ? Math.floor(body.amount * (taxRate / 100)) : 0;
    const totalAmount = body.amount + taxAmount;

    const newDetail: CostDetail = {
      id,
      tenantId,
      ledgerId: body.ledgerId,
      date: body.date,
      accountSubjectId: body.accountSubjectId,
      accountSubjectCode: body.accountSubjectCode,
      accountSubjectName: body.accountSubjectName,
      category: body.category,
      amount: body.amount,
      taxRate,
      taxAmount,
      totalAmount,
      supplier: body.supplier,
      invoiceNo: body.invoiceNo,
      orderId: body.orderId,
      dwId: body.dwId,
      description: body.description,
      attachments: body.attachments || [],
      paymentStatus: body.paymentStatus || 'unpaid',
      paymentDate: body.paymentDate,
      createdBy: body.createdBy || 'user@example.com',
      createdAt: now,
      updatedAt: now,
    };

    costDetails.set(id, newDetail);

    return NextResponse.json({ success: true, detail: newDetail }, { status: 201 });
  } catch (error) {
    console.error('Error creating cost detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cost detail' },
      { status: 500 }
    );
  }
}

// PUT: 原価明細更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Cost detail ID is required' },
        { status: 400 }
      );
    }

    initializeSampleData(tenantId);
    const costDetails = getTenantCostDetails(tenantId);

    const existingDetail = costDetails.get(body.id);
    if (!existingDetail) {
      return NextResponse.json(
        { success: false, error: 'Cost detail not found' },
        { status: 404 }
      );
    }

    // 税額再計算
    const amount = body.amount !== undefined ? body.amount : existingDetail.amount;
    const taxRate = body.taxRate !== undefined ? body.taxRate : existingDetail.taxRate || 0;
    const taxAmount = taxRate > 0 ? Math.floor(amount * (taxRate / 100)) : 0;
    const totalAmount = amount + taxAmount;

    const updatedDetail: CostDetail = {
      ...existingDetail,
      ...body,
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };

    costDetails.set(body.id, updatedDetail);

    return NextResponse.json({ success: true, detail: updatedDetail });
  } catch (error) {
    console.error('Error updating cost detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cost detail' },
      { status: 500 }
    );
  }
}

// DELETE: 原価明細削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || 'demo-tenant';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Cost detail ID is required' },
        { status: 400 }
      );
    }

    initializeSampleData(tenantId);
    const costDetails = getTenantCostDetails(tenantId);

    if (!costDetails.has(id)) {
      return NextResponse.json(
        { success: false, error: 'Cost detail not found' },
        { status: 404 }
      );
    }

    costDetails.delete(id);

    return NextResponse.json({ success: true, message: 'Cost detail deleted successfully' });
  } catch (error) {
    console.error('Error deleting cost detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cost detail' },
      { status: 500 }
    );
  }
}
