import { NextRequest, NextResponse } from 'next/server';
import { PdfTemplateService } from '@/lib/pdf-engine';

/**
 * GET /api/pdf/generate/estimate/[id]
 * 見積書のPDF生成（HTMLレンダリング）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'demo-tenant';
    const templateId = searchParams.get('templateId'); // オプション：指定テンプレート

    // 1. 見積データを取得（既存のAPIを使用）
    const estimateResponse = await fetch(
      `${request.nextUrl.origin}/api/estimates/${params.id}`,
      {
        headers: {
          'X-Tenant-Id': companyId,
        },
      },
    );

    if (!estimateResponse.ok) {
      return NextResponse.json(
        { error: '見積データが見つかりません' },
        { status: 404 },
      );
    }

    const estimateData = await estimateResponse.json();

    // 2. テンプレートを取得（指定がない場合はデフォルト）
    let template;
    if (templateId) {
      const templateResponse = await fetch(
        `${request.nextUrl.origin}/api/pdf/templates/${templateId}?companyId=${companyId}`,
      );
      if (templateResponse.ok) {
        template = await templateResponse.json();
      }
    }

    // デフォルトテンプレートを使用
    if (!template) {
      const templatesResponse = await fetch(
        `${request.nextUrl.origin}/api/pdf/templates?companyId=${companyId}&documentType=estimate&status=active`,
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
      title: '御見積書',
      documentNumber: estimateData.estimateNumber || estimateData.id,
      date: estimateData.createdAt,
      validUntil: estimateData.validUntil,
      customer: {
        name: estimateData.customerName || estimateData.customer?.name,
        address: estimateData.customerAddress || estimateData.customer?.address,
        phone: estimateData.customer?.phone,
        email: estimateData.customer?.email,
        contactPerson: estimateData.customer?.contactPerson,
      },
      items: estimateData.items || [],
      totals: {
        subtotal: estimateData.subtotal || 0,
        tax: estimateData.tax || 0,
        discount: estimateData.discount || 0,
        total: estimateData.total || estimateData.totalAmount || 0,
      },
      terms: estimateData.notes ||
        estimateData.terms || [
          '本見積書の有効期限は発行日より30日間です。',
          'お支払い条件: 納品月末締め、翌月末払い',
          '消費税は別途申し受けます。',
        ],
      companyId,
    };

    // 5. PDFエンジンでHTMLを生成
    const htmlContent = await PdfTemplateService.generatePreviewHtml(
      template,
      branding,
      pdfData,
    );

    // HTMLレスポンスを返す
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
