import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ContractTemplate } from '@/components/pdf-templates/ContractTemplate';
import type {
  ContractData,
  BrandingData,
} from '@/components/pdf-templates/ContractTemplate';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// メモリストア（実際の実装ではデータベースから取得）
const contractsStore = new Map<string, any>();
const brandingStore = new Map<string, BrandingData>();

// デモデータの初期化
function initializeDemoData() {
  // デモ契約書データ
  contractsStore.set('demo-tenant', [
    {
      id: 'CNT-2024-001',
      tenantId: 'demo-tenant',
      contractNo: 'CNT-2024-001',
      contractDate: '2024-01-05',
      startDate: '2024-02-01',
      endDate: '2024-05-31',
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
      paymentSchedule: [
        {
          date: '2024-02-01',
          description: '着手金（30%）',
          amount: 6435000,
        },
        {
          date: '2024-03-31',
          description: '中間金（40%）',
          amount: 8580000,
        },
        {
          date: '2024-05-31',
          description: '完成金（30%）',
          amount: 6435000,
        },
      ],
      warrantyPeriod: '引渡しより2年間',
      terms: [
        '発注者と受注者は、本契約書記載の条項により工事請負契約を締結する。',
        '受注者は、設計図書に基づき、善良な管理者の注意をもって工事を完成する。',
        '工期は、本契約に定める期間とし、やむを得ない事由がある場合は協議により変更できる。',
        '天災地変その他の不可抗力により工事の続行が不可能となった場合は、協議により対処する。',
        '本契約に定めのない事項については、関係法令および建設業の慣行によるものとする。',
      ],
      notes:
        '本契約の締結を証するため、本書2通を作成し、発注者および受注者が記名捺印の上、各自1通を保有する。',
      status: 'active',
      createdBy: 'admin',
      createdAt: '2024-01-05T09:00:00Z',
      updatedAt: '2024-01-05T09:00:00Z',
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
 * 契約書データを取得
 */
async function getContractData(
  tenantId: string,
  contractId: string,
): Promise<ContractData | null> {
  const contracts = contractsStore.get(tenantId) || [];
  return contracts.find((cnt: any) => cnt.id === contractId) || null;
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
 * GET /api/pdf/generate/contract/[id]
 * 契約書PDFを生成
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
      `[PDF生成] 契約書ID: ${id}, プレビュー: ${preview}, テナントID: ${tenantId}`,
    );

    // データ取得
    const contract = await getContractData(tenantId, id);
    if (!contract) {
      console.error(`[PDF生成エラー] 契約書が見つかりません: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: '契約書データが見つかりません',
        },
        { status: 404 },
      );
    }

    const branding = await getBrandingData(tenantId);

    console.log(`[PDF生成] データ取得完了 - 契約書: ${contract.contractNo}`);

    // PDFを生成
    const stream = await renderToStream(
      ContractTemplate({ contract, branding }),
    );

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
          ? `inline; filename="contract-${contract.contractNo}.pdf"`
          : `attachment; filename="contract-${contract.contractNo}.pdf"`,
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
