import { useMemo } from 'react';
import { EstimateItem, CostCalculation } from '../types';
import {
  calculateAllItemsCost,
  calculateTotals,
} from '../lib/estimateCalculations';

// ==================== カスタムフック: 原価計算 ====================

/**
 * 原価計算カスタムフック
 *
 * 全項目の原価・粗利を自動計算し、合計値も算出
 */
export function useCostCalculation(items: EstimateItem[]) {
  // 各項目の原価計算
  const itemsWithCost = useMemo(() => {
    return calculateAllItemsCost(items);
  }, [items]);

  // 合計値の計算
  const totals = useMemo(() => {
    return calculateTotals(itemsWithCost);
  }, [itemsWithCost]);

  return {
    itemsWithCost,
    totals,
  };
}
