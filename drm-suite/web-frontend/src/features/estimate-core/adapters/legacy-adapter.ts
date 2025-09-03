/**
 * レガシーアダプタ
 * 既存の様々なキー名を正規キーに変換
 */

import { LineRow, CategoryRow } from '../domain/types';
import { normalizeNumber } from '../domain/calculations';

/**
 * レガシー形式から正規キーのLineRowへ変換
 */
export const legacyToCore = (row: any): LineRow => ({
  id: row.id,
  parentId: row.parentId ?? row.categoryId ?? '',
  kind: 'item',
  order: row.order ?? row.no ?? 0,

  // 基本情報（別名を吸収）
  name: row.itemName ?? row.name ?? '',
  spec: row.specification ?? row.spec ?? '',
  unit: row.unit ?? '式',
  qty: normalizeNumber(row.quantity ?? row.qty ?? 0),

  // 金額情報（別名を吸収）
  sellUnitPrice: normalizeNumber(
    row.unitPrice ?? row.sellUnitPrice ?? row.price ?? 0,
  ),
  costUnitPrice: normalizeNumber(
    row.costPrice ?? row.costUnitPrice ?? row.cost ?? 0,
  ),

  // 計算結果（あれば）
  sellAmount: row.amount ?? row.sellAmount,
  costAmount: row.costAmount,
  grossProfit: row.grossProfit,
  grossProfitRate: row.grossProfitRate,

  // メタ情報
  remarks: row.remarks ?? '',
  masterItemId: row.masterItemId,
  visible: row.visible !== false,
});

/**
 * カテゴリ行の変換
 */
export const legacyCategoryToCore = (row: any): CategoryRow => ({
  id: row.id,
  kind: 'category',
  name: row.itemName ?? row.name ?? row.category ?? '',
  order: row.order ?? row.no ?? 0,
});

/**
 * レガシー形式の判定
 */
export const isLegacyCategory = (row: any): boolean => {
  return row.isCategory === true || row.kind === 'category';
};

export const isLegacyItem = (row: any): boolean => {
  return !row.isCategory && !row.isSubtotal && row.kind !== 'subtotal';
};

export const isLegacySubtotal = (row: any): boolean => {
  return row.isSubtotal === true || row.kind === 'subtotal';
};
