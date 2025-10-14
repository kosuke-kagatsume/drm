import { EstimateItem, CostCalculation } from '../types';

// ==================== 純粋関数: 見積計算ロジック ====================

/**
 * 1項目の原価計算
 */
export function calculateItemCost(item: EstimateItem): EstimateItem {
  const costAmount = (item.costPrice || 0) * item.quantity;
  const grossProfit = item.amount - costAmount;
  const grossProfitRate =
    item.amount > 0 ? (grossProfit / item.amount) * 100 : 0;

  return {
    ...item,
    costAmount,
    grossProfit,
    grossProfitRate,
  };
}

/**
 * 全項目の原価計算
 */
export function calculateAllItemsCost(items: EstimateItem[]): EstimateItem[] {
  return items.map(calculateItemCost);
}

/**
 * 合計金額の計算
 */
export function calculateTotals(items: EstimateItem[]): CostCalculation {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalCost = items.reduce(
    (sum, item) => sum + (item.costAmount || 0),
    0,
  );
  const totalProfit = totalAmount - totalCost;
  const totalProfitRate =
    totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;

  return {
    totalAmount,
    totalCost,
    totalProfit,
    totalProfitRate,
  };
}

/**
 * 行番号の振り直し
 */
export function renumberItems(items: EstimateItem[]): EstimateItem[] {
  return items.map((item, index) => ({
    ...item,
    no: index + 1,
  }));
}

/**
 * 金額の計算（数量 × 単価）
 */
export function calculateAmount(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * 通貨フォーマット
 */
export function formatPrice(price: number): string {
  return `¥${Number(price || 0).toLocaleString('ja-JP')}`;
}

/**
 * バージョン番号の生成
 */
export function generateVersionNumber(
  currentVersion: string,
  type: 'major' | 'minor' | 'draft',
): string {
  if (!currentVersion || currentVersion === '0.0') {
    return '1.0';
  }

  const parts = currentVersion.split('-')[0].split('.');
  const major = parseInt(parts[0] || '1', 10);
  const minor = parseInt(parts[1] || '0', 10);

  if (type === 'major') {
    return `${major + 1}.0`;
  } else if (type === 'minor') {
    return `${major}.${minor + 1}`;
  } else {
    // draft
    return `${major}.${minor}-draft`;
  }
}

/**
 * 一意なIDの生成（nanoid代替）
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== エイリアス（EditorClientとの互換性） ====================

/**
 * calculateItemAmount: calculateAmountのエイリアス
 */
export const calculateItemAmount = calculateAmount;

/**
 * recalculateItemNumbers: renumberItemsのエイリアス
 */
export const recalculateItemNumbers = renumberItems;
