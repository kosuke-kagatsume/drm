/**
 * 見積計算ロジック（純関数）
 * 副作用なし、テスト可能
 */

import { LineRow, SubtotalRow, Totals, Money, Percentage } from './types';

/**
 * 端数処理
 */
export const round = (
  v: number,
  mode: 'round' | 'floor' | 'ceil' = 'round',
): Money =>
  mode === 'floor'
    ? Math.floor(v)
    : mode === 'ceil'
      ? Math.ceil(v)
      : Math.round(v);

/**
 * 明細行の計算
 * 行単位で四捨五入
 */
export const calcRow = (line: LineRow): LineRow => {
  const sellAmount = round(line.sellUnitPrice * line.qty, 'round');
  const costAmount = round(line.costUnitPrice * line.qty, 'round');
  const grossProfit = sellAmount - costAmount;
  const grossProfitRate: Percentage =
    sellAmount > 0 ? round((grossProfit / sellAmount) * 100, 'round') : 0;

  return {
    ...line,
    sellAmount,
    costAmount,
    grossProfit,
    grossProfitRate,
  };
};

/**
 * カテゴリ別小計の計算
 */
export const calcSubtotal = (
  categoryId: string,
  rows: LineRow[],
): SubtotalRow => {
  const items = rows.filter((r) => r.parentId === categoryId && r.visible);
  const sellAmount = items.reduce(
    (sum, item) => sum + (item.sellAmount || 0),
    0,
  );
  const costAmount = items.reduce(
    (sum, item) => sum + (item.costAmount || 0),
    0,
  );
  const grossProfit = sellAmount - costAmount;
  const grossProfitRate: Percentage =
    sellAmount > 0 ? round((grossProfit / sellAmount) * 100, 'round') : 0;

  return {
    id: `subtotal-${categoryId}`,
    parentId: categoryId,
    kind: 'subtotal',
    name: '小計',
    sellAmount,
    costAmount,
    grossProfit,
    grossProfitRate,
  };
};

/**
 * 総合計の計算
 * 税額は合計に対して計算し切り捨て
 */
export const calcTotals = (rows: LineRow[], taxRate: number = 0): Totals => {
  const visibleItems = rows.filter((r) => r.kind === 'item' && r.visible);

  // 各行の計算済み金額を合計
  const sellAmount = visibleItems.reduce(
    (sum, item) => sum + (item.sellAmount || 0),
    0,
  );
  const costAmount = visibleItems.reduce(
    (sum, item) => sum + (item.costAmount || 0),
    0,
  );
  const grossProfit = sellAmount - costAmount;
  const grossProfitRate: Percentage =
    sellAmount > 0 ? round((grossProfit / sellAmount) * 100, 'round') : 0;

  // 税額は合計に対して計算し切り捨て
  const taxAmount = round(sellAmount * taxRate, 'floor');
  const totalWithTax = sellAmount + taxAmount;

  return {
    sellAmount,
    costAmount,
    grossProfit,
    grossProfitRate,
    itemCount: visibleItems.length,
    taxAmount,
    totalWithTax,
  };
};

/**
 * 全行を再計算（カテゴリごとの小計も含む）
 */
export const recalcAllRows = (rows: LineRow[]): LineRow[] => {
  return rows.map((row) => (row.kind === 'item' ? calcRow(row) : row));
};

/**
 * 数値の正規化（カンマ・円記号除去）
 */
export const normalizeNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const str = String(value).replace(/[¥,]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};
