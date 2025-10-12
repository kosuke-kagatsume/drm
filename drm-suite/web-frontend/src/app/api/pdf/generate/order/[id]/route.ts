import { NextRequest, NextResponse } from 'next/server';
import { PdfTemplateService } from '@/lib/pdf-engine';

/**
 * GET /api/pdf/generate/order/[id]
 * 発注書のPDF生成（HTMLレンダリング）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'demo-tenant';
    const templateId = searchParams.get('templateId');

    // 1. 発注データを取得
    const orderResponse = await fetch(
      `${request.nextUrl.origin}/api/orders/${params.id}`,
      {
        headers: {
          'X-Tenant-Id': companyId,
        },
      },
    );

    if (!orderResponse.ok) {
      return NextResponse.json(
        { error: '発注データが見つかりません' },
        { status: 404 },
      );
    }

    const orderData = await orderResponse.json();

    // 2. テンプレートを取得（発注書用。なければ納品書タイプを使用）
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
        `${request.nextUrl.origin}/api/pdf/templates?companyId=${companyId}&documentType=delivery&status=active`,
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
      title: '発注書',
      documentNumber: orderData.orderNumber || orderData.id,
      date: orderData.orderDate || orderData.createdAt,
      validUntil: orderData.deliveryDate,
      customer: {
        name: orderData.partnerName || orderData.partner?.name,
        address: orderData.partner?.address,
        phone: orderData.partner?.phone,
        email: orderData.partner?.email,
        contactPerson: orderData.partner?.contactPerson,
      },
      items: orderData.items || [],
      totals: {
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        discount: orderData.discount || 0,
        total: orderData.totalAmount || 0,
      },
      terms: orderData.notes || [
        '下記の通り発注いたしますので、納期厳守にてご納品ください。',
        '納品時は必ず納品書を添付してください。',
        '検収合格後、翌月末払いとさせていただきます。',
        '納期遅延の場合は事前にご連絡ください。',
        'ご不明点は担当者までお問い合わせください。',
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
