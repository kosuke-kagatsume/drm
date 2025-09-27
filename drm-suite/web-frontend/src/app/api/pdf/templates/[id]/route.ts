import { NextRequest, NextResponse } from 'next/server';
import { PdfTemplate, UpdatePdfTemplateRequest } from '@/types/pdf-template';

// 模拟数据存储（実際の運用ではデータベースを使用）
// この変数は実際にはroute.tsからインポートすべきですが、デモ用に再宣言
let templateStore: Record<string, PdfTemplate> = {};

/**
 * GET /api/pdf/templates/[id] - 特定のPDFテンプレートの取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 }
      );
    }

    const template = templateStore[templateId];

    if (!template) {
      return NextResponse.json(
        { error: 'テンプレートが見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（同一企業のテンプレートかどうか）
    if (template.companyId !== companyId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    return NextResponse.json(template);

  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    return NextResponse.json(
      { error: 'テンプレートの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pdf/templates/[id] - PDFテンプレートの更新
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body: UpdatePdfTemplateRequest & { companyId: string } = await request.json();

    if (!body.companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 }
      );
    }

    const existingTemplate = templateStore[templateId];

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'テンプレートが見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（同一企業のテンプレートかどうか）
    if (existingTemplate.companyId !== body.companyId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // バージョン管理（メジャー変更の場合はバージョンアップ）
    let newVersion = existingTemplate.version;
    if (body.layout || body.sections) {
      const [major, minor] = existingTemplate.version.split('.').map(Number);
      newVersion = `${major}.${minor + 1}`;
    }

    const updatedTemplate: PdfTemplate = {
      ...existingTemplate,
      ...body,
      id: templateId,
      companyId: body.companyId,
      version: newVersion,
      updatedAt: new Date().toISOString()
    };

    templateStore[templateId] = updatedTemplate;

    return NextResponse.json(updatedTemplate);

  } catch (error) {
    console.error('テンプレート更新エラー:', error);
    return NextResponse.json(
      { error: 'テンプレートの更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pdf/templates/[id] - PDFテンプレートの削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 }
      );
    }

    const template = templateStore[templateId];

    if (!template) {
      return NextResponse.json(
        { error: 'テンプレートが見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（同一企業のテンプレートかどうか）
    if (template.companyId !== companyId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // デフォルトテンプレートは削除不可
    if (template.isDefault) {
      return NextResponse.json(
        { error: 'デフォルトテンプレートは削除できません' },
        { status: 400 }
      );
    }

    delete templateStore[templateId];

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('テンプレート削除エラー:', error);
    return NextResponse.json(
      { error: 'テンプレートの削除に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pdf/templates/[id]/duplicate - PDFテンプレートの複製
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const { companyId, name } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 }
      );
    }

    const sourceTemplate = templateStore[templateId];

    if (!sourceTemplate) {
      return NextResponse.json(
        { error: '複製元のテンプレートが見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（同一企業のテンプレートかどうか）
    if (sourceTemplate.companyId !== companyId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    const newTemplateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const duplicatedTemplate: PdfTemplate = {
      ...sourceTemplate,
      id: newTemplateId,
      name: name || `${sourceTemplate.name} (コピー)`,
      isDefault: false,
      usageCount: 0,
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    templateStore[newTemplateId] = duplicatedTemplate;

    return NextResponse.json(duplicatedTemplate, { status: 201 });

  } catch (error) {
    console.error('テンプレート複製エラー:', error);
    return NextResponse.json(
      { error: 'テンプレートの複製に失敗しました' },
      { status: 500 }
    );
  }
}