import { NextRequest, NextResponse } from 'next/server';
import { PdfTemplateService } from '@/lib/pdf-engine';

/**
 * GET /api/pdf/generate/contract/[id]
 * 契約書のPDF生成（HTMLレンダリング）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'demo-tenant';
    const templateId = searchParams.get('templateId');

    // 1. 契約データを取得
    const contractResponse = await fetch(
      `${request.nextUrl.origin}/api/contracts/${params.id}`,
      {
        headers: {
          'X-Tenant-Id': companyId,
        },
      },
    );

    if (!contractResponse.ok) {
      return NextResponse.json(
        { error: '契約データが見つかりません' },
        { status: 404 },
      );
    }

    const contractData = await contractResponse.json();

    // 2. テンプレートを取得
    let template;
    if (templateId) {
      const templateResponse = await fetch(
        `${request.nextUrl.origin}/api/pdf/templates/${templateId}?companyId=${companyId}`,
      );
      if (templateResponse.ok) {
        template = await templateResponse.json();
      }
    }

    if (!template) {
      const templatesResponse = await fetch(
        `${request.nextUrl.origin}/api/pdf/templates?companyId=${companyId}&documentType=contract&status=active`,
      );
      if (templatesResponse.ok) {
        const { templates } = await templatesResponse.json();
        template = templates.find((t: any) => t.isDefault) || templates[0];
      }
    }

    if (!template) {
      return NextResponse.json(
        { error: '有効なテンプレートが見つかりません' },
        { status: 404 },
      );
    }

    // 3. ブランディング情報を取得
    const brandingResponse = await fetch(
      `${request.nextUrl.origin}/api/pdf/branding?companyId=${companyId}`,
    );

    if (!brandingResponse.ok) {
      return NextResponse.json(
        { error: 'ブランディング情報が見つかりません' },
        { status: 404 },
      );
    }

    const { branding } = await brandingResponse.json();

    // 4. PDF用のデータを整形
    const pdfData = {
      title: '工事請負契約書',
      documentNumber: contractData.contractNumber || contractData.id,
      date: contractData.contractDate || contractData.createdAt,
      validUntil: contractData.completionDate,
      customer: {
        name: contractData.customerName || contractData.customer?.name,
        address: contractData.customerAddress || contractData.customer?.address,
        phone: contractData.customer?.phone,
        email: contractData.customer?.email,
        contactPerson: contractData.customer?.contactPerson,
      },
      items: contractData.items || [],
      totals: {
        subtotal: contractData.subtotal || 0,
        tax: contractData.tax || 0,
        discount: contractData.discount || 0,
        total: contractData.totalAmount || 0,
      },
      terms: contractData.terms || [
        '第1条（目的）本契約は、甲乙間における工事請負に関する基本的な事項を定めるものとする。',
        '第2条（工事内容）工事の詳細は別紙見積書のとおりとする。',
        '第3条（工期）工期は契約締結日より着手し、別途定める完成日までとする。',
        '第4条（契約金額）契約金額は上記記載の通りとし、消費税を含む。',
        '第5条（支払方法）支払方法は工事完了後、検収合格後30日以内に振込とする。',
        '第6条（遅延損害金）支払遅延の場合、年率14.6%の遅延損害金を請求できる。',
        '第7条（契約解除）甲または乙が本契約に違反した場合、相手方は催告の上、本契約を解除できる。',
        '第8条（免責事項）天災地変等の不可抗力による損害については、双方とも責任を負わない。',
        '第9条（協議事項）本契約に定めのない事項は、甲乙協議の上決定する。',
      ],
      companyId,
    };

    // 5. PDFエンジンでHTMLを生成
    const htmlContent = await PdfTemplateService.generatePreviewHtml(
      template,
      branding,
      pdfData,
    );

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return NextResponse.json(
      {
        error: 'PDF生成中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
