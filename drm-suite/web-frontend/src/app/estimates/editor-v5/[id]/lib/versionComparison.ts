// ==================== バージョン比較ロジック ====================

import {
  EstimateItem,
  EstimateVersion,
  ItemDiff,
  VersionComparison,
  DiffType,
} from '../types';

/**
 * 2つのバージョンを比較する
 */
export function compareVersions(
  oldVersion: EstimateVersion,
  oldItems: EstimateItem[],
  newVersion: EstimateVersion,
  newItems: EstimateItem[],
): VersionComparison {
  const itemDiffs = compareItems(oldItems, newItems);
  const totalAmountDiff = newVersion.totalAmount - oldVersion.totalAmount;
  const totalAmountDiffRate =
    oldVersion.totalAmount > 0
      ? (totalAmountDiff / oldVersion.totalAmount) * 100
      : 0;

  return {
    oldVersion,
    newVersion,
    itemDiffs,
    totalAmountDiff,
    totalAmountDiffRate,
  };
}

/**
 * アイテムリストを比較する
 */
function compareItems(
  oldItems: EstimateItem[],
  newItems: EstimateItem[],
): ItemDiff[] {
  const diffs: ItemDiff[] = [];
  const oldItemsMap = new Map(oldItems.map((item) => [item.id, item]));
  const newItemsMap = new Map(newItems.map((item) => [item.id, item]));
  const processedIds = new Set<string>();

  // 新しいアイテムと変更されたアイテムを検出
  for (const newItem of newItems) {
    processedIds.add(newItem.id);
    const oldItem = oldItemsMap.get(newItem.id);

    if (!oldItem) {
      // 新規追加
      diffs.push({
        type: 'added',
        newItem,
      });
    } else {
      // 変更チェック
      const changes = detectChanges(oldItem, newItem);
      if (changes.length > 0) {
        diffs.push({
          type: 'modified',
          oldItem,
          newItem,
          changes,
        });
      } else {
        diffs.push({
          type: 'unchanged',
          oldItem,
          newItem,
        });
      }
    }
  }

  // 削除されたアイテムを検出
  for (const oldItem of oldItems) {
    if (!processedIds.has(oldItem.id)) {
      diffs.push({
        type: 'removed',
        oldItem,
      });
    }
  }

  return diffs;
}

/**
 * アイテムの変更を検出
 */
function detectChanges(
  oldItem: EstimateItem,
  newItem: EstimateItem,
): { field: keyof EstimateItem; oldValue: any; newValue: any }[] {
  const changes: {
    field: keyof EstimateItem;
    oldValue: any;
    newValue: any;
  }[] = [];

  // 比較するフィールド
  const fieldsToCompare: (keyof EstimateItem)[] = [
    'category',
    'minorCategory',
    'itemName',
    'specification',
    'quantity',
    'unit',
    'unitPrice',
    'amount',
    'costPrice',
    'remarks',
  ];

  for (const field of fieldsToCompare) {
    const oldValue = oldItem[field];
    const newValue = newItem[field];

    // 値が異なる場合
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}

/**
 * フィールド名を日本語に変換
 */
export function getFieldLabel(field: keyof EstimateItem): string {
  const labels: Record<keyof EstimateItem, string> = {
    id: 'ID',
    no: 'No',
    category: '大項目',
    minorCategory: '小項目',
    itemName: '項目名',
    specification: '仕様',
    quantity: '数量',
    unit: '単位',
    unitPrice: '単価',
    amount: '金額',
    costPrice: '原価',
    costAmount: '原価金額',
    grossProfit: '粗利',
    grossProfitRate: '粗利率',
    remarks: '備考',
  };

  return labels[field] || field;
}

/**
 * 差分タイプのラベルを取得
 */
export function getDiffTypeLabel(type: DiffType): string {
  const labels: Record<DiffType, string> = {
    added: '追加',
    removed: '削除',
    modified: '変更',
    unchanged: '変更なし',
  };

  return labels[type];
}

/**
 * 差分タイプの色を取得
 */
export function getDiffTypeColor(type: DiffType): string {
  const colors: Record<DiffType, string> = {
    added: 'bg-green-100 border-green-300',
    removed: 'bg-red-100 border-red-300',
    modified: 'bg-yellow-100 border-yellow-300',
    unchanged: 'bg-gray-50 border-gray-200',
  };

  return colors[type];
}
