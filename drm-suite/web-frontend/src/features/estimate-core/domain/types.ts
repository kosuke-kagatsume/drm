/**
 * 見積機能コア型定義
 * 正規キーのみを使用し、UIとの変換はアダプタ層で行う
 */

export type Money = number; // 整数円で管理
export type RowKind = 'category' | 'item' | 'subtotal';
export type Percentage = number; // 0-100の範囲

// カテゴリ行
export interface CategoryRow {
  id: string;
  kind: 'category';
  name: string;
  order: number;
}

// 明細行（正規キーのみ）
export interface LineRow {
  id: string;
  parentId: string; // カテゴリのID
  kind: 'item';
  order: number;

  // 基本情報（正規キー）
  name: string;
  spec?: string;
  unit: string;
  qty: number;

  // 金額情報（正規キー）
  sellUnitPrice: Money;
  costUnitPrice: Money;

  // 計算結果（正規キー）
  sellAmount?: Money;
  costAmount?: Money;
  grossProfit?: Money;
  grossProfitRate?: Percentage;

  // メタ情報
  remarks?: string;
  masterItemId?: string;
  visible: boolean;
}

// 小計行
export interface SubtotalRow {
  id: string;
  parentId: string;
  kind: 'subtotal';
  name: string;
  sellAmount: Money;
  costAmount: Money;
  grossProfit: Money;
  grossProfitRate: Percentage;
}

// 合計
export interface Totals {
  sellAmount: Money;
  costAmount: Money;
  grossProfit: Money;
  grossProfitRate: Percentage;
  itemCount: number;
  taxAmount?: Money;
  totalWithTax?: Money;
}

// 見積全体
export interface Estimate {
  id: string;
  title: string;
  customerName?: string;
  rows: Array<CategoryRow | LineRow | SubtotalRow>;
  totals: Totals;
  taxRate: number; // 0.1 = 10%
  createdAt?: Date;
  updatedAt?: Date;
}

// マスタアイテム
export interface MasterItem {
  id: string;
  category: string;
  productType?: string;
  itemName: string;
  specification?: string;
  unit: string;
  standardPrice: Money;
  costPrice: Money;
  maker?: string;
  tags?: string[];
}
