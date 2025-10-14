/**
 * 見積書PDF生成ロジック
 * PdfTemplateEngineと統合
 */

import { PdfTemplate, CompanyBranding } from '@/types/pdf-template';
import { PdfTemplateEngine } from '@/lib/pdf-engine';
import { EstimateData, EstimateItem } from '../types';
import { ESTIMATE_PDF_TEMPLATE } from './estimatePdfTemplate';
import { loadCompanyBranding } from './defaultBranding';

/**
 * 見積データをPDF用データに変換
 */
export function convertEstimateToPdfData(
  estimate: EstimateData,
): Record<string, any> {
  // 消費税率（10%）
  const TAX_RATE = 0.1;

  // 小計を計算
  const subtotal = estimate.totalAmount;
  const tax = Math.floor(subtotal * TAX_RATE);
  const totalAmount = subtotal + tax;

  // 項目データを変換（PDF用フォーマット）
  const items = estimate.items.map((item: EstimateItem, index: number) => {
    // 大項目行かどうかを判定（数量・単価・金額が0の行）
    const isCategory =
      item.quantity === 0 && item.unitPrice === 0 && item.amount === 0;

    // 小項目行かどうかを判定（大項目でなく、minorCategoryが設定されている）
    const isMinorCategory = !isCategory && !!item.minorCategory;

    return {
      no: isCategory || isMinorCategory ? '' : String(item.no),
      category: item.category,
      minorCategory: item.minorCategory || '',
      itemName: item.itemName,
      specification: item.specification,
      quantity: item.quantity > 0 ? String(item.quantity) : '',
      unit: item.unit,
      unitPrice: item.unitPrice,
      amount: item.amount,
      // カテゴリ行フラグ
      isCategory: isCategory,
      isMinorCategory: isMinorCategory,
    };
  });

  // 現在の日付を取得
  const now = new Date();
  const createdDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 有効期限（30日後）
  const validUntilDate = new Date(now);
  validUntilDate.setDate(validUntilDate.getDate() + 30);
  const validUntil = validUntilDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    // 基本情報
    estimateId: estimate.id,
    title: estimate.title,
    customerName: estimate.customer,
    createdDate,
    validUntil,

    // 明細データ
    items,

    // 合計情報
    subtotal,
    tax,
    totalAmount,

    // 備考
    comment: estimate.comment || '',

    // その他
    companyId: 'default',
  };
}

/**
 * 見積書PDFを生成
 */
export async function generateEstimatePdf(
  estimate: EstimateData,
): Promise<void> {
  try {
    // 企業ブランディング情報を取得（localStorage または デフォルト）
    const branding = loadCompanyBranding();

    // 見積データをPDF用に変換
    const pdfData = convertEstimateToPdfData(estimate);

    // PdfTemplate型に必要なフィールドを追加
    const template: PdfTemplate = {
      ...ESTIMATE_PDF_TEMPLATE,
      id: 'estimate-v5-template',
      companyId: 'default',
      usageCount: 0,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // PDFエンジンを初期化
    const engine = new PdfTemplateEngine(template, branding, pdfData);

    // PDF生成（ブラウザの印刷ダイアログを表示）
    await engine.generatePdf();

    console.log('PDF生成を開始しました');
  } catch (error) {
    console.error('PDF生成エラー:', error);
    throw new Error('PDF生成に失敗しました');
  }
}

/**
 * PDFプレビューHTMLを生成（開発・テスト用）
 */
export function generateEstimatePdfPreview(estimate: EstimateData): string {
  try {
    // 企業ブランディング情報を取得
    const branding = loadCompanyBranding();

    // 見積データをPDF用に変換
    const pdfData = convertEstimateToPdfData(estimate);

    // PdfTemplate型に必要なフィールドを追加
    const template: PdfTemplate = {
      ...ESTIMATE_PDF_TEMPLATE,
      id: 'estimate-v5-template',
      companyId: 'default',
      usageCount: 0,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // PDFエンジンを初期化
    const engine = new PdfTemplateEngine(template, branding, pdfData);

    // HTMLコンテンツを生成（privateメソッドなので、直接アクセスできないが、generatePdf内で使われる）
    // この関数は開発用なので、実際には generatePdf() を使うべき
    return 'プレビュー機能は generatePdf() を使用してください';
  } catch (error) {
    console.error('PDFプレビュー生成エラー:', error);
    return 'プレビュー生成に失敗しました';
  }
}

/**
 * PDF生成が可能かチェック
 */
export function canGeneratePdf(estimate: EstimateData | null): {
  canGenerate: boolean;
  reason?: string;
} {
  if (!estimate) {
    return { canGenerate: false, reason: '見積データがありません' };
  }

  if (!estimate.title || estimate.title.trim() === '') {
    return { canGenerate: false, reason: 'タイトルを入力してください' };
  }

  if (!estimate.customer || estimate.customer.trim() === '') {
    return { canGenerate: false, reason: '顧客名を入力してください' };
  }

  if (!estimate.items || estimate.items.length === 0) {
    return { canGenerate: false, reason: '見積項目を追加してください' };
  }

  if (estimate.totalAmount === 0) {
    return { canGenerate: false, reason: '合計金額が0円です' };
  }

  return { canGenerate: true };
}

/**
 * ヘルパー: 金額をフォーマット
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price);
}
