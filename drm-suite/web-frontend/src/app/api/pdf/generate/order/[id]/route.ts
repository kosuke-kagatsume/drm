import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { OrderTemplate } from '@/components/pdf-templates/OrderTemplate';
import type {
  OrderData,
  BrandingData,
} from '@/components/pdf-templates/OrderTemplate';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// メモリストア（実際の実装ではデータベースから取得）
const ordersStore = new Map<string, any>();
const brandingStore = new Map<string, BrandingData>();

// デモデータの初期化
function initializeDemoData() {
  // デモ発注書データ
  ordersStore.set('demo-tenant', [
    {
      id: 'ORD-2024-001',
      tenantId: 'demo-tenant',
      orderNo: 'ORD-2024-001',
      orderDate: '2024-01-08',
      deliveryDate: '2024-01-25',
      deliveryAddress: '東京都千代田区丸の内1-1-1 オフィスビル建設現場',
      supplierName: '佐藤 次郎',
      supplierCompany: '株式会社協力工務店',
      supplierAddress: '東京都江東区豊洲3-3-3',
      supplierPhone: '03-5555-6666',
      projectName: 'オフィスビル新築工事（基礎工事）',
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
      ],
      subtotal: 5000000,
      taxRate: 10,
      taxAmount: 500000,
      totalAmount: 5500000,
      deliveryTerms:
        '納品場所: 東京都千代田区丸の内1-1-1 オフィスビル建設現場\n納品方法: 現場直送\n検収: 納品後7日以内に検収',
      paymentTerms: '工事完了後、請求書発行日より30日以内に銀行振込',
      notes: '工事は発注者の指示に従い、安全管理を徹底して実施すること。',
      status: 'ordered',
      createdBy: 'admin',
      createdAt: '2024-01-08T09:00:00Z',
      updatedAt: '2024-01-08T09:00:00Z',
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
 * 発注書データを取得
 */
async function getOrderData(
  tenantId: string,
  orderId: string,
): Promise<OrderData | null> {
  const orders = ordersStore.get(tenantId) || [];
  return orders.find((ord: any) => ord.id === orderId) || null;
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
 * GET /api/pdf/generate/order/[id]
 * 発注書PDFを生成
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    const tenantId = request.cookies.get('tenantId')?.value || 'demo-tenant';

    console.log(
      `[PDF生成] 発注書ID: ${id}, プレビュー: ${preview}, テナントID: ${tenantId}`,
    );

    // データ取得
    const order = await getOrderData(tenantId, id);
    if (!order) {
      console.error(`[PDF生成エラー] 発注書が見つかりません: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: '発注書データが見つかりません',
        },
        { status: 404 },
      );
    }

    const branding = await getBrandingData(tenantId);

    console.log(`[PDF生成] データ取得完了 - 発注書: ${order.orderNo}`);

    // PDFを生成
    const stream = await renderToStream(OrderTemplate({ order, branding }));

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
        'Content-Disposition': preview
          ? `inline; filename="order-${order.orderNo}.pdf"`
          : `attachment; filename="order-${order.orderNo}.pdf"`,
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
