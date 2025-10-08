import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 請求書型定義
export interface Invoice {
  id: string;
  tenantId: string;

  // 請求書番号
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;

  // 契約との紐付け
  contractId: string;
  contractNo: string;

  // 顧客情報
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;

  // プロジェクト情報
  projectName: string;
  projectType: string;

  // 請求内容
  items: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }[];

  // 金額
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;

  // 支払条件
  paymentTerms: string;
  paymentMethod: string; // '銀行振込', 'クレジットカード', '現金', '手形'

  // 振込先情報
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string; // '普通', '当座'
    accountNumber: string;
    accountHolder: string;
  };

  // ステータス管理
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  // 支払管理
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  paidAmount: number;
  paidDate?: string;

  // 承認フロー
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;

  // 請求書送付
  sentDate?: string;
  sentMethod?: 'email' | 'mail' | 'hand' | 'fax';
  sentTo?: string;

  // 備考
  notes?: string;
  internalNotes?: string;

  // 担当者
  createdBy: string;
  managerId?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
}

// メモリ内データストア
let invoices: Map<string, Invoice[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';

  const sampleInvoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      tenantId: demoTenantId,
      invoiceNo: 'INV-2024-001',
      invoiceDate: '2024-09-01',
      dueDate: '2024-09-30',
      contractId: 'CON-2024-001',
      contractNo: 'CON-2024-001',
      customerName: '田中太郎',
      customerCompany: '田中工務店株式会社',
      customerAddress: '東京都渋谷区1-2-3',
      customerPhone: '03-1234-5678',
      customerEmail: 'tanaka@example.com',
      projectName: '田中様邸新築工事',
      projectType: '新築',
      items: [
        {
          id: 'ITEM-001',
          category: '工事費',
          description: '新築工事一式（第1回請求）',
          quantity: 1,
          unit: '式',
          unitPrice: 50000000,
          amount: 50000000,
        },
      ],
      subtotal: 50000000,
      taxRate: 10,
      taxAmount: 5000000,
      totalAmount: 55000000,
      paymentTerms: '月末締め翌月末払い',
      paymentMethod: '銀行振込',
      bankInfo: {
        bankName: 'みずほ銀行',
        branchName: '渋谷支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: '株式会社サンプル建設',
      },
      status: 'sent',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      approvalStatus: 'approved',
      approvedBy: '鈴木部長',
      approvedAt: '2024-08-31T15:00:00Z',
      sentDate: '2024-09-01',
      sentMethod: 'email',
      sentTo: 'tanaka@example.com',
      notes: '第1回目の請求（全3回）',
      createdBy: '山田次郎',
      managerId: 'USR-001',
      createdAt: '2024-08-30T10:00:00Z',
      updatedAt: '2024-09-01T09:00:00Z',
    },
    {
      id: 'INV-2024-002',
      tenantId: demoTenantId,
      invoiceNo: 'INV-2024-002',
      invoiceDate: '2024-09-15',
      dueDate: '2024-10-15',
      contractId: 'CON-2024-002',
      contractNo: 'CON-2024-002',
      customerName: '山田花子',
      customerCompany: '山田ビル株式会社',
      customerAddress: '東京都新宿区4-5-6',
      customerPhone: '03-9876-5432',
      customerEmail: 'yamada@example.com',
      projectName: '山田ビル改修工事',
      projectType: 'リフォーム',
      items: [
        {
          id: 'ITEM-002',
          category: '外装工事',
          description: '外壁塗装工事',
          quantity: 500,
          unit: '㎡',
          unitPrice: 15000,
          amount: 7500000,
        },
        {
          id: 'ITEM-003',
          category: '内装工事',
          description: '内装リフォーム工事',
          quantity: 1,
          unit: '式',
          unitPrice: 25000000,
          amount: 25000000,
        },
      ],
      subtotal: 32500000,
      taxRate: 10,
      taxAmount: 3250000,
      totalAmount: 35750000,
      paymentTerms: '工事完成後30日以内',
      paymentMethod: '銀行振込',
      bankInfo: {
        bankName: 'みずほ銀行',
        branchName: '渋谷支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: '株式会社サンプル建設',
      },
      status: 'paid',
      paymentStatus: 'paid',
      paidAmount: 35750000,
      paidDate: '2024-10-10',
      approvalStatus: 'approved',
      approvedBy: '鈴木部長',
      approvedAt: '2024-09-14T16:00:00Z',
      sentDate: '2024-09-15',
      sentMethod: 'email',
      sentTo: 'yamada@example.com',
      notes: '工事完了に伴う請求',
      createdBy: '佐藤健一',
      managerId: 'USR-002',
      createdAt: '2024-09-14T11:00:00Z',
      updatedAt: '2024-10-10T14:00:00Z',
    },
  ];

  invoices.set(demoTenantId, sampleInvoices);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 請求書番号を生成
function generateInvoiceNo(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
}

// GET: 請求書一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const tenantInvoices = invoices.get(tenantId) || [];

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');
    const contractId = searchParams.get('contractId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    let filteredInvoices = [...tenantInvoices];

    // 請求書ID指定
    if (invoiceId) {
      const invoice = filteredInvoices.find(i => i.id === invoiceId);
      if (!invoice) {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        invoice: invoice,
      });
    }

    // 契約IDフィルタ
    if (contractId) {
      filteredInvoices = filteredInvoices.filter(i => i.contractId === contractId);
    }

    // ステータスフィルタ
    if (status) {
      filteredInvoices = filteredInvoices.filter(i => i.status === status);
    }

    // 支払ステータスフィルタ
    if (paymentStatus) {
      filteredInvoices = filteredInvoices.filter(i => i.paymentStatus === paymentStatus);
    }

    return NextResponse.json({
      success: true,
      invoices: filteredInvoices,
      total: filteredInvoices.length,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST: 新規請求書作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    const now = new Date().toISOString();
    const invoiceNo = generateInvoiceNo(tenantId);

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      tenantId,
      invoiceNo,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      ...body,
    };

    const tenantInvoices = invoices.get(tenantId) || [];
    tenantInvoices.push(newInvoice);
    invoices.set(tenantId, tenantInvoices);

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// PUT: 請求書更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { id, ...updates } = body;

    const tenantInvoices = invoices.get(tenantId) || [];
    const invoiceIndex = tenantInvoices.findIndex(i => i.id === id);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const updatedInvoice = {
      ...tenantInvoices[invoiceIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tenantInvoices[invoiceIndex] = updatedInvoice;
    invoices.set(tenantId, tenantInvoices);

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE: 請求書削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const tenantInvoices = invoices.get(tenantId) || [];
    const filteredInvoices = tenantInvoices.filter(i => i.id !== invoiceId);

    if (filteredInvoices.length === tenantInvoices.length) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    invoices.set(tenantId, filteredInvoices);

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
