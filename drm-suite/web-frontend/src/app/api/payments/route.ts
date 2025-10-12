import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 入金記録の型定義
export interface PaymentRecord {
  id: string;
  tenantId: string;

  // 請求書との紐付け
  invoiceId: string;
  invoiceNo: string;

  // 入金情報
  paymentDate: string;
  amount: number;
  paymentMethod: string; // '銀行振込', 'クレジットカード', '現金', '手形', 'その他'
  reference?: string; // 振込番号など
  notes?: string;

  // ステータス
  status: 'confirmed' | 'pending' | 'cancelled';

  // 消込情報
  appliedToInvoice: boolean; // 請求書に反映済みか
  appliedAt?: string;

  // 担当者
  createdBy: string;
  confirmedBy?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
}

// メモリ内データストア
let payments: Map<string, PaymentRecord[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  const samplePayments: PaymentRecord[] = [
    {
      id: 'PAY-2024-001',
      tenantId: demoTenantId,
      invoiceId: 'INV-2024-002',
      invoiceNo: 'INV-2024-002',
      paymentDate: '2024-10-10',
      amount: 35750000,
      paymentMethod: '銀行振込',
      reference: 'WIRE-2024-1010-001',
      notes: '工事完了後の全額入金',
      status: 'confirmed',
      appliedToInvoice: true,
      appliedAt: '2024-10-10T14:00:00Z',
      createdBy: '経理担当 佐藤',
      confirmedBy: '経理部長 田中',
      createdAt: '2024-10-10T10:00:00Z',
      updatedAt: '2024-10-10T14:00:00Z',
    },
  ];

  payments.set(demoTenantId, samplePayments);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 入金記録番号を生成
function generatePaymentId(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY-${year}${month}-${random}`;
}

// GET: 入金記録一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantPayments = payments.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');

    let filteredPayments = [...tenantPayments];

    // 入金記録ID指定
    if (paymentId) {
      const payment = filteredPayments.find(p => p.id === paymentId);
      if (!payment) {
        return NextResponse.json(
          { success: false, error: 'Payment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        payment: payment,
      });
    }

    // 請求書IDフィルタ
    if (invoiceId) {
      filteredPayments = filteredPayments.filter(p => p.invoiceId === invoiceId);
    }

    // ステータスフィルタ
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }

    // 入金日の新しい順にソート
    filteredPayments.sort((a, b) => {
      return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
    });

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
      total: filteredPayments.length,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST: 新規入金記録作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const paymentId = generatePaymentId(tenantId);

    const newPayment: PaymentRecord = {
      id: paymentId,
      tenantId,
      status: 'confirmed',
      appliedToInvoice: false,
      createdAt: now,
      updatedAt: now,
      ...body,
    };

    const tenantPayments = payments.get(tenantId) || [];
    tenantPayments.push(newPayment);
    payments.set(tenantId, tenantPayments);

    // 請求書の支払状況を自動更新
    if (newPayment.appliedToInvoice) {
      await updateInvoicePaymentStatus(tenantId, newPayment.invoiceId, newPayment.amount);
    }

    return NextResponse.json({
      success: true,
      payment: newPayment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// PUT: 入金記録更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantPayments = payments.get(tenantId) || [];
    const paymentIndex = tenantPayments.findIndex(p => p.id === id);

    if (paymentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const oldPayment = tenantPayments[paymentIndex];
    const updatedPayment = {
      ...oldPayment,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tenantPayments[paymentIndex] = updatedPayment;
    payments.set(tenantId, tenantPayments);

    // 請求書の支払状況を更新（必要な場合）
    if (updatedPayment.appliedToInvoice && !oldPayment.appliedToInvoice) {
      await updateInvoicePaymentStatus(tenantId, updatedPayment.invoiceId, updatedPayment.amount);
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE: 入金記録削除（キャンセル）
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const tenantPayments = payments.get(tenantId) || [];
    const payment = tenantPayments.find(p => p.id === paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // キャンセル処理（物理削除ではなくステータス変更）
    payment.status = 'cancelled';
    payment.updatedAt = new Date().toISOString();

    payments.set(tenantId, tenantPayments);

    // 請求書の支払状況を戻す（必要な場合）
    if (payment.appliedToInvoice) {
      await updateInvoicePaymentStatus(tenantId, payment.invoiceId, -payment.amount);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      payment: payment,
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}

// ヘルパー関数: 請求書の支払状況を更新
async function updateInvoicePaymentStatus(tenantId: string, invoiceId: string, amountChange: number) {
  try {
    // 請求書APIを呼び出して更新
    // 注: 実際の実装では、請求書データストアに直接アクセスするか、内部API呼び出しを使用
    console.log(`📝 請求書 ${invoiceId} の入金額を ${amountChange > 0 ? '+' : ''}${amountChange.toLocaleString()}円 更新`);
  } catch (error) {
    console.error('Failed to update invoice payment status:', error);
  }
}
