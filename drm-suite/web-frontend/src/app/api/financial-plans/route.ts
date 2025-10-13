import { NextRequest, NextResponse } from 'next/server';
import type {
  FinancialPlanVersion,
  FinancialItem,
  LoanInfo,
} from '@/types/financial-plan';

// メモリベースのデータストア
let financialPlans: FinancialPlanVersion[] = [
  {
    id: 'fp-1',
    customerId: 'cust-1',
    customerName: '田中様',
    versionNumber: 1,
    versionLabel: '初回',
    createdAt: new Date('2025-10-08T09:00:00'),
    updatedAt: new Date('2025-10-08T09:00:00'),
    createdBy: '営業担当A',
    status: 'superseded',
    buildingArea: 40,
    unitPrice: 500000,
    financialData: [] as FinancialItem[], // 簡略化
    loanInfo: {
      borrowingAmount: 33000000,
      selfFund: 500000,
      monthlyPayment: 90000,
      bonus: 0,
      years: 35,
      rate: 0.5,
    },
    changeNote: '初回提出',
    totalAmount: 33500000,
  },
  {
    id: 'fp-2',
    customerId: 'cust-1',
    customerName: '田中様',
    versionNumber: 2,
    versionLabel: '2回目',
    createdAt: new Date('2025-10-10T14:20:00'),
    updatedAt: new Date('2025-10-10T14:20:00'),
    createdBy: '営業担当A',
    status: 'superseded',
    buildingArea: 40,
    unitPrice: 500000,
    financialData: [] as FinancialItem[],
    loanInfo: {
      borrowingAmount: 34000000,
      selfFund: 872110,
      monthlyPayment: 92000,
      bonus: 0,
      years: 35,
      rate: 0.5,
    },
    changeNote: 'オール電化に変更',
    previousVersionId: 'fp-1',
    totalAmount: 34872110,
  },
  {
    id: 'fp-3',
    customerId: 'cust-1',
    customerName: '田中様',
    versionNumber: 3,
    versionLabel: '3回目',
    createdAt: new Date('2025-10-13T10:30:00'),
    updatedAt: new Date('2025-10-13T10:30:00'),
    createdBy: '営業担当A',
    status: 'submitted',
    buildingArea: 40,
    unitPrice: 500000,
    financialData: [] as FinancialItem[],
    loanInfo: {
      borrowingAmount: 35000000,
      selfFund: 572110,
      monthlyPayment: 95000,
      bonus: 0,
      years: 35,
      rate: 0.5,
    },
    changeNote: '地盤改良費を追加',
    previousVersionId: 'fp-2',
    totalAmount: 35572110,
  },
];

// GET: バージョン一覧取得 or 特定バージョン取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const versionId = searchParams.get('versionId');

  // 特定バージョン取得
  if (versionId) {
    const version = financialPlans.find((v) => v.id === versionId);
    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }
    return NextResponse.json(version);
  }

  // 顧客IDでフィルタリング
  if (customerId) {
    const versions = financialPlans
      .filter((v) => v.customerId === customerId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
    return NextResponse.json(versions);
  }

  // 全バージョン取得
  return NextResponse.json(
    financialPlans.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  );
}

// POST: 新バージョン作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      buildingArea,
      unitPrice,
      financialData,
      loanInfo,
      changeNote,
      previousVersionId,
    } = body;

    // 顧客の既存バージョンを取得
    const existingVersions = financialPlans.filter(
      (v) => v.customerId === customerId,
    );

    // 新しいバージョン番号を計算
    const maxVersionNumber =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map((v) => v.versionNumber))
        : 0;
    const newVersionNumber = maxVersionNumber + 1;

    // バージョンラベルを生成
    const versionLabel =
      newVersionNumber === 1 ? '初回' : `${newVersionNumber}回目`;

    // 総額を計算
    const totalAmount = financialData.reduce(
      (total: number, category: FinancialItem) => {
        return (
          total + category.items.reduce((sum, item) => sum + item.amount, 0)
        );
      },
      0,
    );

    // 前のバージョンを旧版にする
    if (previousVersionId) {
      const prevVersion = financialPlans.find(
        (v) => v.id === previousVersionId,
      );
      if (prevVersion && prevVersion.status !== 'superseded') {
        prevVersion.status = 'superseded';
      }
    }

    // 新しいバージョンを作成
    const newVersion: FinancialPlanVersion = {
      id: `fp-${Date.now()}`,
      customerId,
      customerName,
      versionNumber: newVersionNumber,
      versionLabel,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '営業担当A', // TODO: 実際のユーザー情報から取得
      status: 'draft',
      buildingArea,
      unitPrice,
      financialData,
      loanInfo,
      changeNote,
      previousVersionId,
      totalAmount,
    };

    financialPlans.push(newVersion);

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating financial plan version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 },
    );
  }
}

// PUT: バージョン更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, buildingArea, unitPrice, financialData, loanInfo, status } =
      body;

    const versionIndex = financialPlans.findIndex((v) => v.id === id);
    if (versionIndex === -1) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // 総額を再計算
    const totalAmount = financialData.reduce(
      (total: number, category: FinancialItem) => {
        return (
          total + category.items.reduce((sum, item) => sum + item.amount, 0)
        );
      },
      0,
    );

    // 更新
    financialPlans[versionIndex] = {
      ...financialPlans[versionIndex],
      buildingArea,
      unitPrice,
      financialData,
      loanInfo,
      status,
      totalAmount,
      updatedAt: new Date(),
    };

    return NextResponse.json(financialPlans[versionIndex]);
  } catch (error) {
    console.error('Error updating financial plan version:', error);
    return NextResponse.json(
      { error: 'Failed to update version' },
      { status: 500 },
    );
  }
}

// DELETE: バージョン削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get('versionId');

  if (!versionId) {
    return NextResponse.json(
      { error: 'Version ID is required' },
      { status: 400 },
    );
  }

  const versionIndex = financialPlans.findIndex((v) => v.id === versionId);
  if (versionIndex === -1) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 });
  }

  financialPlans.splice(versionIndex, 1);

  return NextResponse.json({ success: true });
}
