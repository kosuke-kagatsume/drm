/**
 * UIアダプタ
 * 正規キーからUI表示用のキーへ変換
 */

import { LineRow, CategoryRow, SubtotalRow } from '../domain/types';

/**
 * 正規キーからUI表示用へ変換（v3互換）
 */
export const coreToUi = (row: LineRow) => ({
  id: row.id,
  parentId: row.parentId,
  no: row.order,
  category: row.parentId, // 後方互換

  // UI表示用キー
  itemName: row.name,
  specification: row.spec,
  quantity: row.qty,
  unit: row.unit,
  unitPrice: row.sellUnitPrice,
  costPrice: row.costUnitPrice,

  // 計算結果
  amount: row.sellAmount,
  costAmount: row.costAmount,
  grossProfit: row.grossProfit,
  grossProfitRate: row.grossProfitRate,

  // メタ情報
  remarks: row.remarks,
  masterItemId: row.masterItemId,
  visible: row.visible,

  // v3互換フラグ
  isCategory: false,
  isSubtotal: false,
});

/**
 * カテゴリ行のUI変換
 */
export const coreCategoryToUi = (row: CategoryRow) => ({
  id: row.id,
  no: row.order,
  itemName: row.name,
  category: row.name,

  // v3互換フラグ
  isCategory: true,
  isSubtotal: false,
});

/**
 * 小計行のUI変換
 */
export const coreSubtotalToUi = (row: SubtotalRow) => ({
  id: row.id,
  parentId: row.parentId,
  itemName: row.name,
  category: row.parentId,

  // 計算結果
  amount: row.sellAmount,
  costAmount: row.costAmount,
  grossProfit: row.grossProfit,
  grossProfitRate: row.grossProfitRate,

  // v3互換フラグ
  isCategory: false,
  isSubtotal: true,
});

/**
 * UIキーから正規キーへのマッピング
 * handleCellChangeで使用
 */
export const uiKeyToCoreKey: Record<string, string> = {
  itemName: 'name',
  specification: 'spec',
  quantity: 'qty',
  unit: 'unit',
  unitPrice: 'sellUnitPrice',
  costPrice: 'costUnitPrice',
  amount: 'sellAmount',
  costAmount: 'costAmount',
  grossProfit: 'grossProfit',
  grossProfitRate: 'grossProfitRate',
  remarks: 'remarks',
};

/**
 * UIキーが正規キーか判定
 */
export const getCoreKey = (uiKey: string): string => {
  return uiKeyToCoreKey[uiKey] ?? uiKey;
};
