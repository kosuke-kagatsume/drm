import { NextRequest, NextResponse } from 'next/server';
import {
  CompanyBranding,
  CreateCompanyBrandingRequest,
  UpdateCompanyBrandingRequest,
} from '@/types/pdf-template';

// 模拟数据存储（実際の運用ではデータベースを使用）
let brandingStore: Record<string, CompanyBranding> = {};

/**
 * デフォルトブランディングの初期化
 */
function initializeDefaultBranding() {
  const companyId = 'demo-tenant';

  if (brandingStore[companyId]) {
    return; // すでに初期化済み
  }

  const defaultBranding: CompanyBranding = {
    id: `branding_${companyId}`,
    companyId,
    companyName: '株式会社ダンドリワークス',
    companyNameEn: 'Dandori Works Inc.',
    address: '東京都渋谷区恵比寿1-2-3 ダンドリビル5F',
    postalCode: '150-0013',
    phone: '03-1234-5678',
    fax: '03-1234-5679',
    email: 'info@dandori-works.com',
    website: 'https://dandori-works.com',
    registrationNumber: '1234567890123',
    licensePlate: '東京都知事許可(般-1)第12345号',
    logoPosition: 'left',
    colorTheme: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
      text: '#1f2937',
      background: '#ffffff',
      border: '#e5e7eb',
    },
    primaryFont: 'Noto Sans JP',
    secondaryFont: 'system-ui',
    fontSize: {
      title: 24,
      header: 18,
      body: 12,
      small: 10,
    },
    bankInfo: {
      bankName: 'みずほ銀行',
      branchName: '渋谷支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'カ）ダンドリワークス',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  brandingStore[companyId] = defaultBranding;
  console.log('✅ デフォルトブランディング情報を初期化しました');
}

/**
 * GET /api/pdf/branding - 企業ブランディング情報の取得
 */
export async function GET(request: NextRequest) {
  try {
    // デフォルトブランディングの初期化
    initializeDefaultBranding();

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 },
      );
    }

    // 既存のブランディング情報を取得
    const existingBranding = brandingStore[companyId];

    if (existingBranding) {
      return NextResponse.json({
        branding: existingBranding,
        hasLogo: !!existingBranding.logoUrl,
        hasSeal: !!existingBranding.sealImageUrl,
      });
    }

    // 存在しない場合はデフォルト値を返す
    const defaultBranding: CompanyBranding = {
      id: `branding_${companyId}`,
      companyId,
      companyName: '',
      address: '',
      postalCode: '',
      phone: '',
      email: '',
      logoPosition: 'left',
      colorTheme: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb',
      },
      primaryFont: 'Noto Sans JP',
      secondaryFont: 'system-ui',
      fontSize: {
        title: 24,
        header: 18,
        body: 12,
        small: 10,
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brandingStore[companyId] = defaultBranding;

    return NextResponse.json({
      branding: defaultBranding,
      hasLogo: false,
      hasSeal: false,
    });
  } catch (error) {
    console.error('ブランディング情報取得エラー:', error);
    return NextResponse.json(
      { error: 'ブランディング情報の取得に失敗しました' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/pdf/branding - 企業ブランディング情報の作成
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCompanyBrandingRequest & { companyId: string } =
      await request.json();

    if (!body.companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 },
      );
    }

    const newBranding: CompanyBranding = {
      id: `branding_${body.companyId}_${Date.now()}`,
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brandingStore[body.companyId] = newBranding;

    return NextResponse.json(
      {
        branding: newBranding,
        hasLogo: !!newBranding.logoUrl,
        hasSeal: !!newBranding.sealImageUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('ブランディング情報作成エラー:', error);
    return NextResponse.json(
      { error: 'ブランディング情報の作成に失敗しました' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/pdf/branding - 企業ブランディング情報の更新
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateCompanyBrandingRequest & { companyId: string } =
      await request.json();

    if (!body.companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 },
      );
    }

    const existingBranding = brandingStore[body.companyId];
    if (!existingBranding) {
      return NextResponse.json(
        { error: 'ブランディング情報が見つかりません' },
        { status: 404 },
      );
    }

    const updatedBranding: CompanyBranding = {
      ...existingBranding,
      ...body,
      companyId: body.companyId,
      updatedAt: new Date().toISOString(),
    };

    brandingStore[body.companyId] = updatedBranding;

    return NextResponse.json({
      branding: updatedBranding,
      hasLogo: !!updatedBranding.logoUrl,
      hasSeal: !!updatedBranding.sealImageUrl,
    });
  } catch (error) {
    console.error('ブランディング情報更新エラー:', error);
    return NextResponse.json(
      { error: 'ブランディング情報の更新に失敗しました' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/pdf/branding - 企業ブランディング情報の削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyIdが必要です' },
        { status: 400 },
      );
    }

    if (!brandingStore[companyId]) {
      return NextResponse.json(
        { error: 'ブランディング情報が見つかりません' },
        { status: 404 },
      );
    }

    delete brandingStore[companyId];

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ブランディング情報削除エラー:', error);
    return NextResponse.json(
      { error: 'ブランディング情報の削除に失敗しました' },
      { status: 500 },
    );
  }
}
