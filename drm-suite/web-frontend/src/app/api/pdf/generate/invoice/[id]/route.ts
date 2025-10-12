import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { InvoiceTemplate } from '@/components/pdf-templates/InvoiceTemplate';
import type {
  InvoiceData,
  BrandingData,
} from '@/components/pdf-templates/InvoiceTemplate';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// メモリストア（実際の実装ではデータベースから取得）
const invoicesStore = new Map<string, any>();
const brandingStore = new Map<string, BrandingData>();

// デモデータの初期化
function initializeDemoData() {
  // デモ請求書データ
  invoicesStore.set('demo-tenant', [
    {
      id: 'INV-2024-001',
      tenantId: 'demo-tenant',
      invoiceNo: 'INV-2024-001',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      contractId: 'CNT-001',
      contractNo: 'CNT-2024-001',
      customerName: '山田 太郎',
      customerCompany: '株式会社サンプル建設',
      customerAddress: '東京都千代田区丸の内1-1-1',
      customerPhone: '03-1234-5678',
      projectName: 'オフィスビル新築工事',
      projectType: 'construction',
      items: [
        {
          id: 'ITEM-001',
          category: '基礎工事',
          description: '基礎工事一式',
          quantity: 1,
          unit: '式',
          unitPrice: 5000000,
          amount: 5000000,
        },
        {
          id: 'ITEM-002',
          category: '躯体工事',
          description: '鉄骨工事',
          quantity: 200,
          unit: 'm²',
          unitPrice: 50000,
          amount: 10000000,
        },
        {
          id: 'ITEM-003',
          category: '仕上工事',
          description: '内装仕上げ工事',
          quantity: 150,
          unit: 'm²',
          unitPrice: 30000,
          amount: 4500000,
        },
      ],
      subtotal: 19500000,
      taxRate: 10,
      taxAmount: 1950000,
      totalAmount: 21450000,
      paymentTerms: '請求書発行日より30日以内に下記口座へお振込ください。',
      paymentMethod: 'bank_transfer',
      status: 'issued',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      notes: 'お振込手数料はお客様負担でお願いいたします。',
      createdBy: 'admin',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    },
    {
      id: 'INV-2024-002',
      tenantId: 'demo-tenant',
      invoiceNo: 'INV-2024-002',
      invoiceDate: '2024-02-01',
      dueDate: '2024-03-01',
      contractId: 'CNT-002',
      contractNo: 'CNT-2024-002',
      customerName: '鈴木 花子',
      customerCompany: '株式会社テスト工務店',
      customerAddress: '大阪府大阪市北区梅田2-2-2',
      customerPhone: '06-9876-5432',
      projectName: 'マンション改修工事',
      projectType: 'renovation',
      items: [
        {
          id: 'ITEM-004',
          category: '解体工事',
          description: '既存設備解体',
          quantity: 1,
          unit: '式',
          unitPrice: 2000000,
          amount: 2000000,
        },
        {
          id: 'ITEM-005',
          category: '設備工事',
          description: '給排水設備更新',
          quantity: 80,
          unit: 'm',
          unitPrice: 35000,
          amount: 2800000,
        },
        {
          id: 'ITEM-006',
          category: '電気工事',
          description: '電気設備工事',
          quantity: 1,
          unit: '式',
          unitPrice: 3500000,
          amount: 3500000,
        },
      ],
      subtotal: 8300000,
      taxRate: 10,
      taxAmount: 830000,
      totalAmount: 9130000,
      paymentTerms: '請求書発行日より30日以内に下記口座へお振込ください。',
      paymentMethod: 'bank_transfer',
      status: 'issued',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      notes: 'お振込手数料はお客様負担でお願いいたします。',
      createdBy: 'admin',
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-01T09:00:00Z',
    },
  ]);

  // デモブランディングデータ
  brandingStore.set('demo-tenant', {
    companyName: '株式会社ダンドリワークス',
    companyNameEn: 'Dandori Works Co., Ltd.',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address: '千代田1-1-1 ダンドリビル5F',
    phone: '03-1234-5678',
    fax: '03-1234-5679',
    email: 'info@dandori-works.co.jp',
    website: 'https://dandori-works.co.jp',
    representative: '田中 一郎',
    representativeTitle: '代表取締役',
    registrationNumber: 'T1234567890123',
    bankInfo: {
      bankName: 'みずほ銀行',
      branchName: '東京支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'カ）ダンドリワークス',
    },
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
    },
  });
}

// 初期化実行
initializeDemoData();

/**
 * 請求書データを取得
 */
async function getInvoiceData(
  tenantId: string,
  invoiceId: string,
): Promise<InvoiceData | null> {
  const invoices = invoicesStore.get(tenantId) || [];
  return invoices.find((inv: any) => inv.id === invoiceId) || null;
}

/**
 * ブランディングデータを取得
 */
async function getBrandingData(tenantId: string): Promise<BrandingData> {
  return (
    brandingStore.get(tenantId) || {
      companyName: '株式会社サンプル',
      companyNameEn: 'Sample Inc.',
    }
  );
}

/**
 * GET /api/pdf/generate/invoice/[id]
 * 請求書PDFを生成
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const tenantId = request.cookies.get('tenantId')?.value || 'demo-tenant';

    console.log(`[PDF生成] 請求書ID: ${id}, テナントID: ${tenantId}`);

    // データ取得
    const invoice = await getInvoiceData(tenantId, id);
    if (!invoice) {
      console.error(`[PDF生成エラー] 請求書が見つかりません: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: '請求書データが見つかりません',
        },
        { status: 404 },
      );
    }

    const branding = await getBrandingData(tenantId);

    console.log(`[PDF生成] データ取得完了 - 請求書: ${invoice.invoiceNo}`);

    // PDFを生成
    const stream = await renderToStream(InvoiceTemplate({ invoice, branding }));

    // ストリームをBufferに変換
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    console.log(`[PDF生成] 生成完了 - サイズ: ${pdfBuffer.length} bytes`);

    // PDFを返却
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNo}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF生成エラー]', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'PDF生成中にエラーが発生しました',
      },
      { status: 500 },
    );
  }
}
