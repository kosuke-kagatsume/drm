import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 工事台帳インターフェース
export interface ConstructionLedger {
  id: string;
  tenantId: string;

  // 工事基本情報
  constructionNo: string; // 工事番号（自動採番）
  constructionName: string; // 工事名称
  constructionType: string; // 工事種別（新築・改築・リフォーム等）
  constructionCategory: string; // 工事分類（住宅・店舗・オフィス等）

  // 顧客情報
  customerId: string;
  customerName: string;
  customerCompany?: string;
  customerContact: string;

  // 工事場所
  constructionAddress: string;
  constructionCity: string;
  constructionPrefecture: string;
  constructionPostalCode: string;

  // 工期
  scheduledStartDate: string; // 着工予定日
  scheduledEndDate: string; // 完了予定日
  actualStartDate?: string; // 実際の着工日
  actualEndDate?: string; // 実際の完了日
  constructionDays: number; // 工期日数

  // 契約金額
  contractAmount: number; // 契約金額（税抜）
  taxAmount: number; // 消費税
  totalContractAmount: number; // 契約金額（税込）

  // 関連情報
  estimateId?: string; // 見積ID
  estimateNo?: string; // 見積番号
  contractId?: string; // 契約ID
  contractNo?: string; // 契約番号

  // 実行予算
  executionBudget?: {
    materialCost: number; // 材料費
    laborCost: number; // 労務費
    outsourcingCost: number; // 外注費
    expenseCost: number; // 経費
    totalBudget: number; // 予算合計
    expectedProfit: number; // 予定粗利
    expectedProfitRate: number; // 予定粗利率
  };

  // 実績原価（DWから取得）
  actualCost?: {
    materialCost: number;
    laborCost: number;
    outsourcingCost: number;
    expenseCost: number;
    totalCost: number;
    actualProfit: number; // 実績粗利
    actualProfitRate: number; // 実績粗利率
  };

  // 原価分析
  costAnalysis?: {
    budgetVsActual: {
      materialVariance: number;
      laborVariance: number;
      outsourcingVariance: number;
      expenseVariance: number;
      totalVariance: number;
      varianceRate: number;
    };
    profitAnalysis: {
      profitVariance: number; // 粗利差異
      profitVarianceRate: number; // 粗利差異率
    };
  };

  // 工事進捗
  progress: {
    status: 'not_started' | 'in_progress' | 'completed' | 'suspended' | 'cancelled';
    progressRate: number; // 0-100
    completedWorkValue: number; // 出来高
    billedAmount: number; // 請求済み金額
    receivedAmount: number; // 入金済み金額
  };

  // 発注情報
  orders?: Array<{
    orderId: string;
    orderNo: string;
    partnerName: string;
    orderAmount: number;
    status: string;
  }>;

  // 請求情報
  invoices?: Array<{
    invoiceId: string;
    invoiceNo: string;
    invoiceDate: string;
    amount: number;
    status: string;
  }>;

  // 担当者
  salesPerson: string; // 営業担当
  constructionManager: string; // 施工管理担当

  // メタ情報
  status: 'planning' | 'approved' | 'in_progress' | 'completed' | 'suspended' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
}

// メモリ内データストア（テナント別）
let constructionLedgers: Map<string, ConstructionLedger[]> = new Map();

// サンプルデータの初期化
const initializeSampleData = (tenantId: string) => {
  if (!constructionLedgers.has(tenantId)) {
    const sampleLedgers: ConstructionLedger[] = [
      {
        id: 'CL-001',
        tenantId,
        constructionNo: 'K2025-0001',
        constructionName: '田中様邸新築工事',
        constructionType: '新築',
        constructionCategory: '戸建住宅',
        customerId: 'CUST-001',
        customerName: '田中太郎',
        customerContact: '090-1234-5678',
        constructionAddress: '東京都世田谷区桜新町1-2-3',
        constructionCity: '世田谷区',
        constructionPrefecture: '東京都',
        constructionPostalCode: '154-0015',
        scheduledStartDate: '2025-11-01',
        scheduledEndDate: '2026-03-31',
        actualStartDate: '2025-11-05',
        constructionDays: 150,
        contractAmount: 35000000,
        taxAmount: 3500000,
        totalContractAmount: 38500000,
        estimateId: 'EST-001',
        estimateNo: 'EST-2025-0001',
        contractId: 'CONT-001',
        contractNo: 'CONT-2025-0001',
        executionBudget: {
          materialCost: 12000000,
          laborCost: 8000000,
          outsourcingCost: 10000000,
          expenseCost: 1500000,
          totalBudget: 31500000,
          expectedProfit: 3500000,
          expectedProfitRate: 10.0,
        },
        actualCost: {
          materialCost: 11800000,
          laborCost: 8200000,
          outsourcingCost: 9900000,
          expenseCost: 1600000,
          totalCost: 31500000,
          actualProfit: 3500000,
          actualProfitRate: 10.0,
        },
        costAnalysis: {
          budgetVsActual: {
            materialVariance: 200000,
            laborVariance: -200000,
            outsourcingVariance: 100000,
            expenseVariance: -100000,
            totalVariance: 0,
            varianceRate: 0,
          },
          profitAnalysis: {
            profitVariance: 0,
            profitVarianceRate: 0,
          },
        },
        progress: {
          status: 'in_progress',
          progressRate: 45,
          completedWorkValue: 15750000,
          billedAmount: 15000000,
          receivedAmount: 15000000,
        },
        orders: [
          { orderId: 'ORD-001', orderNo: 'ORD-2025-0001', partnerName: '基礎工事株式会社', orderAmount: 3500000, status: 'completed' },
          { orderId: 'ORD-002', orderNo: 'ORD-2025-0002', partnerName: '大工工務店', orderAmount: 8000000, status: 'in_progress' },
        ],
        invoices: [
          { invoiceId: 'INV-001', invoiceNo: 'INV-2025-0001', invoiceDate: '2025-11-30', amount: 15000000, status: 'paid' },
        ],
        salesPerson: '山田花子',
        constructionManager: '佐藤一郎',
        status: 'in_progress',
        createdAt: '2025-10-01T09:00:00Z',
        updatedAt: '2025-10-08T14:30:00Z',
        createdBy: 'yamada@example.com',
        notes: '順調に進行中。次回検査は11月中旬予定。',
      },
      {
        id: 'CL-002',
        tenantId,
        constructionNo: 'K2025-0002',
        constructionName: '佐藤商店リフォーム工事',
        constructionType: 'リフォーム',
        constructionCategory: '店舗',
        customerId: 'CUST-002',
        customerName: '佐藤次郎',
        customerCompany: '佐藤商店',
        customerContact: '03-1234-5678',
        constructionAddress: '東京都渋谷区神南1-5-10',
        constructionCity: '渋谷区',
        constructionPrefecture: '東京都',
        constructionPostalCode: '150-0041',
        scheduledStartDate: '2025-10-15',
        scheduledEndDate: '2025-12-20',
        constructionDays: 65,
        contractAmount: 8500000,
        taxAmount: 850000,
        totalContractAmount: 9350000,
        estimateId: 'EST-002',
        estimateNo: 'EST-2025-0002',
        contractId: 'CONT-002',
        contractNo: 'CONT-2025-0002',
        executionBudget: {
          materialCost: 3000000,
          laborCost: 2500000,
          outsourcingCost: 2000000,
          expenseCost: 500000,
          totalBudget: 8000000,
          expectedProfit: 500000,
          expectedProfitRate: 5.88,
        },
        progress: {
          status: 'not_started',
          progressRate: 0,
          completedWorkValue: 0,
          billedAmount: 0,
          receivedAmount: 0,
        },
        salesPerson: '鈴木三郎',
        constructionManager: '高橋四郎',
        status: 'approved',
        createdAt: '2025-09-20T10:00:00Z',
        updatedAt: '2025-10-05T16:00:00Z',
        createdBy: 'suzuki@example.com',
        notes: '着工待ち。材料発注済み。',
      },
      {
        id: 'CL-003',
        tenantId,
        constructionNo: 'K2025-0003',
        constructionName: '鈴木ビル改修工事',
        constructionType: '改修',
        constructionCategory: 'オフィスビル',
        customerId: 'CUST-003',
        customerName: '鈴木建設株式会社',
        customerCompany: '鈴木建設株式会社',
        customerContact: '03-9876-5432',
        constructionAddress: '東京都千代田区丸の内2-3-4',
        constructionCity: '千代田区',
        constructionPrefecture: '東京都',
        constructionPostalCode: '100-0005',
        scheduledStartDate: '2025-08-01',
        scheduledEndDate: '2025-10-31',
        actualStartDate: '2025-08-01',
        actualEndDate: '2025-10-25',
        constructionDays: 90,
        contractAmount: 45000000,
        taxAmount: 4500000,
        totalContractAmount: 49500000,
        estimateId: 'EST-003',
        estimateNo: 'EST-2025-0003',
        contractId: 'CONT-003',
        contractNo: 'CONT-2025-0003',
        executionBudget: {
          materialCost: 15000000,
          laborCost: 12000000,
          outsourcingCost: 13000000,
          expenseCost: 2000000,
          totalBudget: 42000000,
          expectedProfit: 3000000,
          expectedProfitRate: 6.67,
        },
        actualCost: {
          materialCost: 15500000,
          laborCost: 12500000,
          outsourcingCost: 13200000,
          expenseCost: 2100000,
          totalCost: 43300000,
          actualProfit: 1700000,
          actualProfitRate: 3.78,
        },
        costAnalysis: {
          budgetVsActual: {
            materialVariance: -500000,
            laborVariance: -500000,
            outsourcingVariance: -200000,
            expenseVariance: -100000,
            totalVariance: -1300000,
            varianceRate: -3.10,
          },
          profitAnalysis: {
            profitVariance: -1300000,
            profitVarianceRate: -43.33,
          },
        },
        progress: {
          status: 'completed',
          progressRate: 100,
          completedWorkValue: 45000000,
          billedAmount: 45000000,
          receivedAmount: 40000000,
        },
        orders: [
          { orderId: 'ORD-010', orderNo: 'ORD-2025-0010', partnerName: '電気工事株式会社', orderAmount: 8000000, status: 'completed' },
          { orderId: 'ORD-011', orderNo: 'ORD-2025-0011', partnerName: '設備工事株式会社', orderAmount: 7000000, status: 'completed' },
        ],
        invoices: [
          { invoiceId: 'INV-010', invoiceNo: 'INV-2025-0010', invoiceDate: '2025-09-30', amount: 22500000, status: 'paid' },
          { invoiceId: 'INV-011', invoiceNo: 'INV-2025-0011', invoiceDate: '2025-10-31', amount: 22500000, status: 'partially_paid' },
        ],
        salesPerson: '伊藤五郎',
        constructionManager: '渡辺六郎',
        status: 'completed',
        createdAt: '2025-07-10T09:00:00Z',
        updatedAt: '2025-10-25T17:00:00Z',
        createdBy: 'itou@example.com',
        notes: '完工。最終請求の入金待ち。原価が予算超過。',
      },
    ];
    constructionLedgers.set(tenantId, sampleLedgers);
  }
};

// GET: 工事台帳一覧取得・検索
export async function GET(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeSampleData(tenantId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const constructionNo = searchParams.get('constructionNo');
    const status = searchParams.get('status');
    const constructionType = searchParams.get('constructionType');
    const salesPerson = searchParams.get('salesPerson');
    const search = searchParams.get('search');

    let ledgers = constructionLedgers.get(tenantId) || [];

    // フィルタリング
    if (id) {
      const ledger = ledgers.find((l) => l.id === id);
      return NextResponse.json({ success: true, ledger });
    }

    if (constructionNo) {
      const ledger = ledgers.find((l) => l.constructionNo === constructionNo);
      return NextResponse.json({ success: true, ledger });
    }

    if (status) {
      ledgers = ledgers.filter((l) => l.status === status);
    }

    if (constructionType) {
      ledgers = ledgers.filter((l) => l.constructionType === constructionType);
    }

    if (salesPerson) {
      ledgers = ledgers.filter((l) => l.salesPerson === salesPerson);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      ledgers = ledgers.filter(
        (l) =>
          l.constructionName.toLowerCase().includes(searchLower) ||
          l.constructionNo.toLowerCase().includes(searchLower) ||
          l.customerName.toLowerCase().includes(searchLower) ||
          (l.customerCompany && l.customerCompany.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      ledgers,
      total: ledgers.length,
    });
  } catch (error) {
    console.error('Error fetching construction ledgers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch construction ledgers' },
      { status: 500 }
    );
  }
}

// POST: 工事台帳作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeSampleData(tenantId);

    const data = await request.json();
    const ledgers = constructionLedgers.get(tenantId) || [];

    // 工事番号の自動採番
    const year = new Date().getFullYear();
    const existingNumbers = ledgers
      .map((l) => l.constructionNo)
      .filter((no) => no.startsWith(`K${year}-`))
      .map((no) => parseInt(no.split('-')[1]))
      .filter((n) => !isNaN(n));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const constructionNo = `K${year}-${String(nextNumber).padStart(4, '0')}`;

    const newLedger: ConstructionLedger = {
      id: `CL-${Date.now()}`,
      tenantId,
      constructionNo,
      ...data,
      progress: data.progress || {
        status: 'not_started',
        progressRate: 0,
        completedWorkValue: 0,
        billedAmount: 0,
        receivedAmount: 0,
      },
      status: data.status || 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: cookies().get('userId')?.value || 'demo-user',
    };

    ledgers.push(newLedger);
    constructionLedgers.set(tenantId, ledgers);

    return NextResponse.json({
      success: true,
      ledger: newLedger,
      message: 'Construction ledger created successfully',
    });
  } catch (error) {
    console.error('Error creating construction ledger:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create construction ledger' },
      { status: 500 }
    );
  }
}

// PUT: 工事台帳更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeSampleData(tenantId);

    const data = await request.json();
    const { id } = data;

    const ledgers = constructionLedgers.get(tenantId) || [];
    const index = ledgers.findIndex((l) => l.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Construction ledger not found' },
        { status: 404 }
      );
    }

    ledgers[index] = {
      ...ledgers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    constructionLedgers.set(tenantId, ledgers);

    return NextResponse.json({
      success: true,
      ledger: ledgers[index],
      message: 'Construction ledger updated successfully',
    });
  } catch (error) {
    console.error('Error updating construction ledger:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update construction ledger' },
      { status: 500 }
    );
  }
}

// DELETE: 工事台帳削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    initializeSampleData(tenantId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const ledgers = constructionLedgers.get(tenantId) || [];
    const filteredLedgers = ledgers.filter((l) => l.id !== id);

    if (ledgers.length === filteredLedgers.length) {
      return NextResponse.json(
        { success: false, error: 'Construction ledger not found' },
        { status: 404 }
      );
    }

    constructionLedgers.set(tenantId, filteredLedgers);

    return NextResponse.json({
      success: true,
      message: 'Construction ledger deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting construction ledger:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete construction ledger' },
      { status: 500 }
    );
  }
}
