import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 支払実績の型定義
export interface DisbursementRecord {
  id: string;
  tenantId: string;

  // 支払予定との紐付け
  scheduleId?: string;

  // 発注との紐付け
  orderId: string;
  orderNo: string;

  // 協力会社情報
  partnerId: string;
  partnerName: string;
  partnerCompany: string;

  // 支払情報
  paymentDate: string;
  amount: number;
  paymentMethod: string; // '銀行振込', '手形', '小切手', '現金', 'その他'
  reference?: string; // 振込番号など
  notes?: string;

  // ステータス
  status: 'completed' | 'pending' | 'cancelled';

  // 発注への反映
  appliedToOrder: boolean; // 発注に反映済みか
  appliedAt?: string;

  // 承認・確認者
  approvedBy?: string;
  confirmedBy?: string;

  // 振込先情報
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };

  // 領収書
  receiptUrl?: string;
  receiptNumber?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// メモリ内データストア
let disbursements: Map<string, DisbursementRecord[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  const sampleDisbursements: DisbursementRecord[] = [
    // 過去の支払済み
    {
      id: 'DIS-2024-001',
      tenantId: demoTenantId,
      scheduleId: 'DIS-SCH-2024-001',
      orderId: 'ORD-2024-001',
      orderNo: 'ORD-2024-001',
      partnerId: 'PARTNER-001',
      partnerName: '田中 一郎',
      partnerCompany: '田中電気工事',
      paymentDate: '2024-10-05',
      amount: 2500000,
      paymentMethod: '銀行振込',
      reference: 'WIRE-2024-1005-001',
      notes: '電気設備工事費用',
      status: 'completed',
      appliedToOrder: true,
      appliedAt: '2024-10-05T14:00:00Z',
      approvedBy: '経理部長 山田',
      confirmedBy: '経理担当 佐藤',
      bankInfo: {
        bankName: 'みずほ銀行',
        branchName: '渋谷支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: 'タナカデンキコウジ',
      },
      receiptNumber: 'RCPT-2024-001',
      createdAt: '2024-10-05T10:00:00Z',
      updatedAt: '2024-10-05T14:00:00Z',
      createdBy: '経理担当 佐藤',
    },

    // 最近の支払
    {
      id: 'DIS-2024-002',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-007',
      orderNo: 'ORD-2024-007',
      partnerId: 'PARTNER-007',
      partnerName: '加藤 七郎',
      partnerCompany: '加藤金物店',
      paymentDate: '2024-10-08',
      amount: 650000,
      paymentMethod: '銀行振込',
      reference: 'WIRE-2024-1008-001',
      notes: '金物・釘類一式',
      status: 'completed',
      appliedToOrder: true,
      appliedAt: '2024-10-08T15:30:00Z',
      confirmedBy: '購買担当 中村',
      bankInfo: {
        bankName: '横浜銀行',
        branchName: '川崎支店',
        accountType: '普通',
        accountNumber: '9999999',
        accountHolder: 'カトウカナモノテン',
      },
      receiptNumber: 'RCPT-2024-002',
      createdAt: '2024-10-08T14:00:00Z',
      updatedAt: '2024-10-08T15:30:00Z',
      createdBy: '購買担当 中村',
    },

    // 保留中の支払
    {
      id: 'DIS-2024-003',
      tenantId: demoTenantId,
      orderId: 'ORD-2024-008',
      orderNo: 'ORD-2024-008',
      partnerId: 'PARTNER-008',
      partnerName: '斉藤 八郎',
      partnerCompany: '斉藤清掃',
      paymentDate: '2024-10-10',
      amount: 280000,
      paymentMethod: '銀行振込',
      reference: '',
      notes: '現場清掃費用、領収書待ち',
      status: 'pending',
      appliedToOrder: false,
      bankInfo: {
        bankName: '千葉銀行',
        branchName: '船橋支店',
        accountType: '普通',
        accountNumber: '4444444',
        accountHolder: 'サイトウセイソウ',
      },
      createdAt: '2024-10-10T09:00:00Z',
      updatedAt: '2024-10-10T09:00:00Z',
      createdBy: '発注担当 佐藤',
    },
  ];

  disbursements.set(demoTenantId, sampleDisbursements);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 支払記録番号を生成
function generateDisbursementId(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DIS-${year}${month}-${random}`;
}

// GET: 支払記録一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantDisbursements = disbursements.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const disbursementId = searchParams.get('id');
    const orderId = searchParams.get('orderId');
    const partnerId = searchParams.get('partnerId');
    const scheduleId = searchParams.get('scheduleId');
    const status = searchParams.get('status');

    let filteredDisbursements = [...tenantDisbursements];

    // 支払記録ID指定
    if (disbursementId) {
      const disbursement = filteredDisbursements.find(d => d.id === disbursementId);
      if (!disbursement) {
        return NextResponse.json(
          { success: false, error: 'Disbursement not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        disbursement: disbursement,
      });
    }

    // 発注IDフィルタ
    if (orderId) {
      filteredDisbursements = filteredDisbursements.filter(d => d.orderId === orderId);
    }

    // 協力会社IDフィルタ
    if (partnerId) {
      filteredDisbursements = filteredDisbursements.filter(d => d.partnerId === partnerId);
    }

    // 支払予定IDフィルタ
    if (scheduleId) {
      filteredDisbursements = filteredDisbursements.filter(d => d.scheduleId === scheduleId);
    }

    // ステータスフィルタ
    if (status) {
      filteredDisbursements = filteredDisbursements.filter(d => d.status === status);
    }

    // 支払日の新しい順にソート
    filteredDisbursements.sort((a, b) => {
      return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
    });

    // 統計情報を計算
    const stats = {
      total: filteredDisbursements.length,
      completed: filteredDisbursements.filter(d => d.status === 'completed').length,
      pending: filteredDisbursements.filter(d => d.status === 'pending').length,
      cancelled: filteredDisbursements.filter(d => d.status === 'cancelled').length,
      totalAmount: filteredDisbursements.reduce((sum, d) => sum + d.amount, 0),
      completedAmount: filteredDisbursements
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.amount, 0),
      pendingAmount: filteredDisbursements
        .filter(d => d.status === 'pending')
        .reduce((sum, d) => sum + d.amount, 0),
    };

    return NextResponse.json({
      success: true,
      disbursements: filteredDisbursements,
      stats,
    });
  } catch (error) {
    console.error('Error fetching disbursements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disbursements' },
      { status: 500 }
    );
  }
}

// POST: 新規支払記録作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const disbursementId = generateDisbursementId(tenantId);

    const newDisbursement: DisbursementRecord = {
      id: disbursementId,
      tenantId,
      status: 'completed',
      appliedToOrder: false,
      createdAt: now,
      updatedAt: now,
      ...body,
    };

    const tenantDisbursements = disbursements.get(tenantId) || [];
    tenantDisbursements.push(newDisbursement);
    disbursements.set(tenantId, tenantDisbursements);

    // 発注の支払状況を自動更新（必要な場合）
    if (newDisbursement.appliedToOrder) {
      await updateOrderPaymentStatus(tenantId, newDisbursement.orderId, newDisbursement.amount);
    }

    // 支払予定を更新（scheduleIdがある場合）
    if (newDisbursement.scheduleId) {
      await updateScheduleStatus(tenantId, newDisbursement.scheduleId, {
        status: 'paid',
        actualDisbursementId: disbursementId,
        actualPaymentDate: newDisbursement.paymentDate,
        actualAmount: newDisbursement.amount,
      });
    }

    return NextResponse.json({
      success: true,
      disbursement: newDisbursement,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating disbursement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create disbursement' },
      { status: 500 }
    );
  }
}

// PUT: 支払記録更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantDisbursements = disbursements.get(tenantId) || [];
    const disbursementIndex = tenantDisbursements.findIndex(d => d.id === id);

    if (disbursementIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Disbursement not found' },
        { status: 404 }
      );
    }

    const oldDisbursement = tenantDisbursements[disbursementIndex];
    const updatedDisbursement = {
      ...oldDisbursement,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tenantDisbursements[disbursementIndex] = updatedDisbursement;
    disbursements.set(tenantId, tenantDisbursements);

    // 発注の支払状況を更新（必要な場合）
    if (updatedDisbursement.appliedToOrder && !oldDisbursement.appliedToOrder) {
      await updateOrderPaymentStatus(tenantId, updatedDisbursement.orderId, updatedDisbursement.amount);
    }

    return NextResponse.json({
      success: true,
      disbursement: updatedDisbursement,
    });
  } catch (error) {
    console.error('Error updating disbursement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update disbursement' },
      { status: 500 }
    );
  }
}

// DELETE: 支払記録削除（キャンセル）
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const disbursementId = searchParams.get('id');

    if (!disbursementId) {
      return NextResponse.json(
        { success: false, error: 'Disbursement ID is required' },
        { status: 400 }
      );
    }

    const tenantDisbursements = disbursements.get(tenantId) || [];
    const disbursement = tenantDisbursements.find(d => d.id === disbursementId);

    if (!disbursement) {
      return NextResponse.json(
        { success: false, error: 'Disbursement not found' },
        { status: 404 }
      );
    }

    // キャンセル処理（物理削除ではなくステータス変更）
    disbursement.status = 'cancelled';
    disbursement.updatedAt = new Date().toISOString();

    disbursements.set(tenantId, tenantDisbursements);

    // 発注の支払状況を戻す（必要な場合）
    if (disbursement.appliedToOrder) {
      await updateOrderPaymentStatus(tenantId, disbursement.orderId, -disbursement.amount);
    }

    // 支払予定を戻す（scheduleIdがある場合）
    if (disbursement.scheduleId) {
      await updateScheduleStatus(tenantId, disbursement.scheduleId, {
        status: 'approved',
        actualDisbursementId: undefined,
        actualPaymentDate: undefined,
        actualAmount: undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Disbursement cancelled successfully',
      disbursement: disbursement,
    });
  } catch (error) {
    console.error('Error deleting disbursement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete disbursement' },
      { status: 500 }
    );
  }
}

// ヘルパー関数: 発注の支払状況を更新
async function updateOrderPaymentStatus(tenantId: string, orderId: string, amountChange: number) {
  try {
    // 発注APIを呼び出して更新
    // 注: 実際の実装では、発注データストアに直接アクセスするか、内部API呼び出しを使用
    console.log(`📝 発注 ${orderId} の支払額を ${amountChange > 0 ? '+' : ''}${amountChange.toLocaleString()}円 更新`);
  } catch (error) {
    console.error('Failed to update order payment status:', error);
  }
}

// ヘルパー関数: 支払予定のステータスを更新
async function updateScheduleStatus(
  tenantId: string,
  scheduleId: string,
  updates: {
    status?: string;
    actualDisbursementId?: string;
    actualPaymentDate?: string;
    actualAmount?: number;
  }
) {
  try {
    // 支払予定APIを呼び出して更新
    // 注: 実際の実装では、支払予定データストアに直接アクセスするか、内部API呼び出しを使用
    console.log(`📅 支払予定 ${scheduleId} を更新: ステータス=${updates.status}`);
  } catch (error) {
    console.error('Failed to update schedule status:', error);
  }
}

// ヘルパー関数: 月次支払レポート生成
export async function generateMonthlyReport(
  tenantId: string,
  year: number,
  month: number
): Promise<{
  totalDisbursements: number;
  totalAmount: number;
  byPartner: Record<string, { count: number; amount: number }>;
  byPaymentMethod: Record<string, { count: number; amount: number }>;
}> {
  try {
    const tenantDisbursements = disbursements.get(tenantId) || [];

    // 指定月の支払のみフィルタ
    const monthlyDisbursements = tenantDisbursements.filter(d => {
      const paymentDate = new Date(d.paymentDate);
      return (
        paymentDate.getFullYear() === year &&
        paymentDate.getMonth() === month - 1 &&
        d.status === 'completed'
      );
    });

    // 協力会社別集計
    const byPartner: Record<string, { count: number; amount: number }> = {};
    for (const d of monthlyDisbursements) {
      if (!byPartner[d.partnerCompany]) {
        byPartner[d.partnerCompany] = { count: 0, amount: 0 };
      }
      byPartner[d.partnerCompany].count++;
      byPartner[d.partnerCompany].amount += d.amount;
    }

    // 支払方法別集計
    const byPaymentMethod: Record<string, { count: number; amount: number }> = {};
    for (const d of monthlyDisbursements) {
      if (!byPaymentMethod[d.paymentMethod]) {
        byPaymentMethod[d.paymentMethod] = { count: 0, amount: 0 };
      }
      byPaymentMethod[d.paymentMethod].count++;
      byPaymentMethod[d.paymentMethod].amount += d.amount;
    }

    return {
      totalDisbursements: monthlyDisbursements.length,
      totalAmount: monthlyDisbursements.reduce((sum, d) => sum + d.amount, 0),
      byPartner,
      byPaymentMethod,
    };
  } catch (error) {
    console.error('Failed to generate monthly report:', error);
    return {
      totalDisbursements: 0,
      totalAmount: 0,
      byPartner: {},
      byPaymentMethod: {},
    };
  }
}
