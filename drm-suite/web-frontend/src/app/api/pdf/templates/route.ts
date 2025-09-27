import { NextRequest, NextResponse } from 'next/server';
import { PdfTemplate, CreatePdfTemplateRequest, UpdatePdfTemplateRequest, DocumentType, PdfTemplateListResponse } from '@/types/pdf-template';

// 模拟数据存储（実際の運用ではデータベースを使用）
let templateStore: Record<string, PdfTemplate> = {};

/**
 * GET /api/pdf/templates - PDFテンプレート一覧の取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const documentType = searchParams.get('documentType') as DocumentType;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 }
      );
    }

    // フィルタリング
    let templates = Object.values(templateStore).filter(template =>
      template.companyId === companyId
    );

    if (documentType) {
      templates = templates.filter(template => template.documentType === documentType);
    }

    if (status) {
      templates = templates.filter(template => template.status === status);
    }

    // ソート（デフォルト使用、更新日順）
    templates.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    // ページネーション
    const total = templates.length;
    const startIndex = (page - 1) * limit;
    const paginatedTemplates = templates.slice(startIndex, startIndex + limit);

    const response: PdfTemplateListResponse = {
      templates: paginatedTemplates,
      total,
      page,
      limit
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('テンプレート一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'テンプレート一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pdf/templates - PDFテンプレートの作成
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePdfTemplateRequest & { companyId: string } = await request.json();

    if (!body.companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 }
      );
    }

    // 必須フィールドの検証
    if (!body.name || !body.documentType) {
      return NextResponse.json(
        { error: 'テンプレート名と文書タイプは必須です' },
        { status: 400 }
      );
    }

    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newTemplate: PdfTemplate = {
      id: templateId,
      ...body,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // デフォルトレイアウトの設定
    if (!newTemplate.layout) {
      newTemplate.layout = {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        header: { enabled: true, height: 80, content: '' },
        footer: { enabled: true, height: 60, content: '' },
        showPageNumbers: true,
        pageNumberPosition: 'footer',
        showWatermark: false
      };
    }

    // デフォルトセクションの設定
    if (!newTemplate.sections || newTemplate.sections.length === 0) {
      newTemplate.sections = getDefaultSections(body.documentType);
    }

    templateStore[templateId] = newTemplate;

    return NextResponse.json(newTemplate, { status: 201 });

  } catch (error) {
    console.error('テンプレート作成エラー:', error);
    return NextResponse.json(
      { error: 'テンプレートの作成に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * デフォルトセクションを取得
 */
function getDefaultSections(documentType: DocumentType) {
  const baseSections = [
    {
      id: 'company_header',
      name: '企業ヘッダー',
      type: 'company_header' as const,
      order: 1,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%' as const,
        alignment: 'left' as const,
        padding: 0,
        marginTop: 0,
        marginBottom: 20
      },
      content: {
        template: '<div class="company-header">{{companyName}}</div>',
        variables: ['companyName', 'logoUrl', 'address', 'phone']
      }
    },
    {
      id: 'title',
      name: 'タイトル',
      type: 'title' as const,
      order: 2,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%' as const,
        alignment: 'center' as const,
        padding: 0,
        marginTop: 20,
        marginBottom: 20
      },
      content: {
        template: '<h1 class="document-title">{{title}}</h1>',
        variables: ['title', 'documentNumber']
      }
    },
    {
      id: 'document_info',
      name: '文書情報',
      type: 'document_info' as const,
      order: 3,
      isRequired: true,
      isVisible: true,
      layout: {
        width: '100%' as const,
        alignment: 'right' as const,
        padding: 0,
        marginTop: 0,
        marginBottom: 20
      },
      content: {
        template: '<div class="document-info">作成日: {{date}}<br>有効期限: {{validUntil}}</div>',
        variables: ['date', 'validUntil', 'documentNumber']
      }
    }
  ];

  // 文書タイプ別の追加セクション
  if (documentType === 'estimate') {
    baseSections.push(
      {
        id: 'customer_info',
        name: '顧客情報',
        type: 'customer_info' as const,
        order: 4,
        isRequired: true,
        isVisible: true,
        layout: {
          width: '50%' as const,
          alignment: 'left' as const,
          padding: 10,
          marginTop: 0,
          marginBottom: 20
        },
        content: {
          template: '<div class="customer-info"><strong>{{customerName}}</strong><br>{{customerAddress}}</div>',
          variables: ['customerName', 'customerAddress', 'customerPhone']
        }
      },
      {
        id: 'items_table',
        name: '明細テーブル',
        type: 'items_table' as const,
        order: 5,
        isRequired: true,
        isVisible: true,
        layout: {
          width: '100%' as const,
          alignment: 'left' as const,
          padding: 0,
          marginTop: 20,
          marginBottom: 20
        },
        content: {
          template: '<table class="items-table">{{itemsTable}}</table>',
          variables: ['items', 'itemsTable']
        }
      },
      {
        id: 'totals',
        name: '合計',
        type: 'totals' as const,
        order: 6,
        isRequired: true,
        isVisible: true,
        layout: {
          width: '50%' as const,
          alignment: 'right' as const,
          padding: 10,
          marginTop: 0,
          marginBottom: 20
        },
        content: {
          template: '<div class="totals">小計: {{subtotal}}<br>税額: {{tax}}<br><strong>合計: {{total}}</strong></div>',
          variables: ['subtotal', 'tax', 'total']
        }
      }
    );
  }

  return baseSections;
}