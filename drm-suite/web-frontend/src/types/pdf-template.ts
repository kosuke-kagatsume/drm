/**
 * PDF テンプレート関連の型定義
 * 多テナント対応の企業ブランディング・カスタマイズ機能
 */

// ========================================
// 基本型定義
// ========================================

export type DocumentType =
  | 'estimate'      // 見積書
  | 'invoice'       // 請求書
  | 'contract'      // 契約書
  | 'proposal'      // 提案書
  | 'quotation'     // 見積依頼書
  | 'receipt'       // 領収書
  | 'delivery'      // 納品書
  | 'specification' // 仕様書
  | 'report'        // 報告書
  | 'certificate';  // 証明書

export type TemplateStatus = 'draft' | 'active' | 'archived';

export type ColorTheme = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  border: string;
};

// ========================================
// 企業ブランディング情報
// ========================================

export interface CompanyBranding {
  id: string;
  companyId: string;

  // 基本企業情報
  companyName: string;
  companyNameEn?: string;
  address: string;
  postalCode: string;
  phone: string;
  fax?: string;
  email: string;
  website?: string;

  // 法的情報
  registrationNumber?: string;      // 法人番号
  licensePlate?: string;           // 許可証番号
  taxNumber?: string;              // 税務署番号

  // ロゴ・ビジュアル
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoPosition: 'left' | 'center' | 'right';

  // カラーテーマ
  colorTheme: ColorTheme;

  // フォント設定
  primaryFont: string;
  secondaryFont: string;
  fontSize: {
    title: number;
    header: number;
    body: number;
    small: number;
  };

  // 印鑑・署名
  sealImageUrl?: string;
  signatureImageUrl?: string;

  // 追加情報
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// PDFテンプレート設定
// ========================================

export interface PdfTemplate {
  id: string;
  companyId: string;

  // テンプレート基本情報
  name: string;
  description?: string;
  documentType: DocumentType;
  status: TemplateStatus;
  version: string;

  // レイアウト設定
  layout: {
    pageSize: 'A4' | 'A3' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };

    // ヘッダー・フッター
    header: {
      enabled: boolean;
      height: number;
      content: string; // HTML template
    };
    footer: {
      enabled: boolean;
      height: number;
      content: string; // HTML template
    };

    // ページ設定
    showPageNumbers: boolean;
    pageNumberPosition: 'header' | 'footer';
    showWatermark: boolean;
    watermarkText?: string;
    watermarkOpacity?: number;
  };

  // セクション設定
  sections: PdfSection[];

  // スタイル設定
  styles: {
    globalCss: string;
    customCss?: string;
    useCompanyBranding: boolean;
  };

  // 権限設定
  permissions: {
    allowEdit: UserRole[];
    allowView: UserRole[];
    allowPrint: UserRole[];
    allowDownload: UserRole[];
  };

  // メタデータ
  isDefault: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// PDFセクション設定
// ========================================

export interface PdfSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  isRequired: boolean;
  isVisible: boolean;

  // レイアウト設定
  layout: {
    width: '100%' | '50%' | '33%' | '25%';
    alignment: 'left' | 'center' | 'right';
    padding: number;
    marginTop: number;
    marginBottom: number;
  };

  // コンテンツ設定
  content: {
    template: string;      // HTML template with variables
    variables: string[];   // Available variables for this section
    staticText?: string;   // Static text content
  };

  // 条件表示
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
}

export type SectionType =
  | 'company_header'    // 企業ヘッダー
  | 'title'            // タイトル
  | 'document_info'    // 文書情報
  | 'customer_info'    // 顧客情報
  | 'items_table'      // 明細テーブル
  | 'totals'           // 合計
  | 'terms'            // 条件・備考
  | 'signatures'       // 署名欄
  | 'custom_text'      // カスタムテキスト
  | 'page_break'       // 改ページ
  | 'spacer';          // スペーサー

// ========================================
// PDF生成関連
// ========================================

export interface PdfGenerationRequest {
  templateId: string;
  documentType: DocumentType;
  data: Record<string, any>; // Document-specific data
  options?: {
    filename?: string;
    downloadImmediately?: boolean;
    watermark?: string;
    password?: string;
  };
}

export interface PdfGenerationResponse {
  success: boolean;
  pdfUrl?: string;
  filename?: string;
  fileSize?: number;
  error?: string;
}

// ========================================
// テンプレート管理
// ========================================

export interface TemplateImportData {
  template: Omit<PdfTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
  branding?: Partial<CompanyBranding>;
}

export interface TemplateExportData {
  template: PdfTemplate;
  branding: CompanyBranding;
  exportedAt: string;
  version: string;
}

// ========================================
// 設定・管理画面用
// ========================================

export interface PdfTemplateSettings {
  companyId: string;

  // 既定設定
  defaultTemplates: Record<DocumentType, string>; // templateId

  // 生成設定
  generation: {
    defaultFormat: 'pdf' | 'html';
    compression: 'none' | 'low' | 'medium' | 'high';
    maxFileSize: number; // MB
    watermarkEnabled: boolean;
    passwordProtection: boolean;
  };

  // 権限設定
  adminUsers: string[]; // User IDs who can manage templates

  updatedAt: string;
}

// ========================================
// レスポンス型
// ========================================

export interface PdfTemplateListResponse {
  templates: PdfTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface CompanyBrandingResponse {
  branding: CompanyBranding;
  hasLogo: boolean;
  hasSeal: boolean;
}

// ========================================
// フォーム用型
// ========================================

export type CreatePdfTemplateRequest = Omit<PdfTemplate, 'id' | 'companyId' | 'usageCount' | 'createdAt' | 'updatedAt'>;
export type UpdatePdfTemplateRequest = Partial<CreatePdfTemplateRequest>;
export type CreateCompanyBrandingRequest = Omit<CompanyBranding, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
export type UpdateCompanyBrandingRequest = Partial<CreateCompanyBrandingRequest>;

// ========================================
// ユーザーロール（user.tsからインポート）
// ========================================

export type {UserRole} from './user';

// PdfTemplateService は lib/pdf-engine.ts から export