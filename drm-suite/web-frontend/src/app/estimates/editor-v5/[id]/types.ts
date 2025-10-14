// ==================== V5 型定義 ====================

// 見積項目
export interface EstimateItem {
  id: string;
  no: number;
  category: string; // 大項目
  minorCategory?: string; // 小項目（V5で追加）
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;
  // 原価管理（V5で追加）
  costPrice?: number;
  costAmount?: number;
  grossProfit?: number;
  grossProfitRate?: number;
}

// 見積データ
export interface EstimateData {
  id: string;
  title: string;
  customer: string;
  items: EstimateItem[];
  totalAmount: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  // V5で追加
  versionId?: string;
}

// マスタアイテム
export interface MasterItem {
  id: string;
  category: string; // 大項目
  minorCategory?: string; // 小項目
  productType?: string;
  itemName: string;
  specification: string;
  unit: string;
  standardPrice: number;
  costPrice: number;
  maker?: string;
  tags?: string[];
}

// バージョン管理（V5新機能）
export interface EstimateVersion {
  id: string;
  versionNumber: string; // "1.0", "1.1", "2.0"
  versionType: 'major' | 'minor' | 'draft';
  status: 'draft' | 'active' | 'superseded';
  title: string;
  changeNote?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  totalAmount: number;
  itemCount: number;
}

// テンプレート（V5新機能）
export interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  category: string; // '新築', 'リフォーム', 'リノベーション'
  scope: 'personal' | 'branch' | 'company';
  branch?: '東京支店' | '大阪支店' | '名古屋支店';
  sections: TemplateSection[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

// テンプレートセクション
export interface TemplateSection {
  id: string;
  name: string; // セクション名（例：「木工事 - 構造材」）
  majorCategory: string; // 大項目
  minorCategory?: string; // 小項目
  items: EstimateItem[];
}

// 商品種別
export interface ProductType {
  id: string;
  category: string;
  name: string;
  icon?: string;
}

// 編集中のセル
export interface EditingCell {
  row: string;
  col: string;
}

// 原価計算結果
export interface CostCalculation {
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
}

// 保存ステータス
export type SaveStatus = 'saved' | 'saving' | 'unsaved';

// 検索ステップ（マスタ検索）
export type SearchStep = 'category' | 'productType' | 'maker' | 'product';

// 小項目定義
export interface MinorCategory {
  id: string;
  name: string;
  majorCategory: string; // 所属する大項目
}
