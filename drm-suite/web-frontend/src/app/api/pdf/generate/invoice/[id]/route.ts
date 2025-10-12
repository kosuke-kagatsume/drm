import { NextRequest, NextResponse } from 'next/server';
import { PdfTemplateService } from '@/lib/pdf-engine';

/**
 * GET /api/pdf/generate/invoice/[id]
 * 請求書のPDF生成（HTMLレンダリング）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'demo-tenant';
    const templateId = searchParams.get('templateId');

    // 1. 請求データを取得
    const invoiceResponse = await fetch(
      `${request.nextUrl.origin}/api/invoices/${params.id}`,
      {
        headers: {
          'X-Tenant-Id': companyId,
        },
      },
    );

    if (!invoiceResponse.ok) {
      return NextResponse.json(
        { error: '請求データが見つかりません' },
        { status: 404 },
      );
    }

    const invoiceData = await invoiceResponse.json();

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
        `${request.nextUrl.origin}/api/pdf/templates?companyId=${companyId}&documentType=invoice&status=active`,
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
      title: '請求書',
      documentNumber: invoiceData.invoiceNumber || invoiceData.id,
      date: invoiceData.invoiceDate || invoiceData.createdAt,
      validUntil: invoiceData.paymentDueDate,
      customer: {
        name: invoiceData.customerName || invoiceData.customer?.name,
        address: invoiceData.customerAddress || invoiceData.customer?.address,
        phone: invoiceData.customer?.phone,
        email: invoiceData.customer?.email,
        contactPerson: invoiceData.customer?.contactPerson,
      },
      items: invoiceData.items || [],
      totals: {
        subtotal: invoiceData.subtotal || 0,
        tax: invoiceData.tax || 0,
        discount: invoiceData.discount || 0,
        total: invoiceData.totalAmount || 0,
      },
      terms: invoiceData.notes || [
        '下記の通りご請求申し上げます。',
        `お支払期限: ${invoiceData.paymentDueDate || '請求書記載の期日まで'}`,
        'お振込先: 銀行情報は下記の通りです',
        `${branding.bankInfo?.bankName || ''} ${branding.bankInfo?.branchName || ''}`,
        `${branding.bankInfo?.accountType || ''} ${branding.bankInfo?.accountNumber || ''}`,
        `口座名義: ${branding.bankInfo?.accountHolder || ''}`,
        '振込手数料はお客様負担でお願いいたします。',
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
