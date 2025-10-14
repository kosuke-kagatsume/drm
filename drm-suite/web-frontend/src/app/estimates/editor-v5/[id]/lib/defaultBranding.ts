/**
 * デフォルト企業ブランディング設定
 * 管理コンソールのPDFシステムと統合
 */

import { CompanyBranding } from '@/types/pdf-template';

/**
 * デフォルト企業ブランディング
 * 管理コンソールで設定されていない場合に使用
 */
export const DEFAULT_COMPANY_BRANDING: Omit<
  CompanyBranding,
  'id' | 'companyId' | 'createdAt' | 'updatedAt'
> = {
  // 基本企業情報
  companyName: 'サンプル建設株式会社',
  companyNameEn: 'Sample Construction Co., Ltd.',
  address: '東京都千代田区丸の内1-1-1',
  postalCode: '100-0005',
  phone: '03-1234-5678',
  fax: '03-1234-5679',
  email: 'info@sample-construction.co.jp',
  website: 'https://www.sample-construction.co.jp',

  // 法的情報
  registrationNumber: 'T1234567890123', // 適格請求書発行事業者登録番号
  licensePlate: '東京都知事 許可（般-1）第12345号', // 建設業許可番号
  taxNumber: undefined,

  // ロゴ・ビジュアル（デフォルトはなし）
  logoUrl: undefined,
  logoWidth: 150,
  logoHeight: 50,
  logoPosition: 'left',

  // カラーテーマ（Indigoベース - editor-v5と統一）
  colorTheme: {
    primary: '#4F46E5', // Indigo 600
    secondary: '#6366F1', // Indigo 500
    accent: '#818CF8', // Indigo 400
    text: '#1F2937', // Gray 800
    background: '#FFFFFF', // White
    border: '#E5E7EB', // Gray 200
  },

  // フォント設定
  primaryFont: 'Noto Sans JP, sans-serif',
  secondaryFont: 'Noto Sans JP, sans-serif',
  fontSize: {
    title: 24,
    header: 18,
    body: 12,
    small: 10,
  },

  // 印鑑・署名（デフォルトはなし）
  sealImageUrl: undefined,
  signatureImageUrl: undefined,

  // 銀行情報（デフォルトはなし）
  bankInfo: undefined,

  isActive: true,
};

/**
 * ローカルストレージから企業ブランディングを取得
 * 存在しない場合はデフォルトを返す
 */
export function loadCompanyBranding(): CompanyBranding {
  if (typeof window === 'undefined') {
    // サーバーサイドではデフォルトを返す
    return {
      ...DEFAULT_COMPANY_BRANDING,
      id: 'default',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const key = 'company-branding';
  const data = localStorage.getItem(key);

  if (!data) {
    // ローカルストレージにない場合はデフォルトを返す
    return {
      ...DEFAULT_COMPANY_BRANDING,
      id: 'default',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    return JSON.parse(data);
  } catch {
    // パースエラーの場合はデフォルトを返す
    return {
      ...DEFAULT_COMPANY_BRANDING,
      id: 'default',
      companyId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * 企業ブランディングをローカルストレージに保存
 */
export function saveCompanyBranding(branding: CompanyBranding): void {
  if (typeof window === 'undefined') return;

  const key = 'company-branding';
  localStorage.setItem(key, JSON.stringify(branding));
}

/**
 * サンプル企業ブランディングを生成（開発・テスト用）
 */
export function generateSampleBranding(): CompanyBranding {
  return {
    ...DEFAULT_COMPANY_BRANDING,
    id: 'sample-' + Date.now(),
    companyId: 'sample-company',
    companyName: 'サンプル建設株式会社',
    address: '東京都千代田区丸の内1-1-1 丸の内ビル10F',
    postalCode: '100-0005',
    phone: '03-1234-5678',
    fax: '03-1234-5679',
    email: 'info@sample-construction.co.jp',
    website: 'https://www.sample-construction.co.jp',
    registrationNumber: 'T1234567890123',
    licensePlate: '東京都知事 許可（般-1）第12345号',
    bankInfo: {
      bankName: 'みずほ銀行',
      branchName: '丸の内支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'サンプルケンセツ(カ',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
