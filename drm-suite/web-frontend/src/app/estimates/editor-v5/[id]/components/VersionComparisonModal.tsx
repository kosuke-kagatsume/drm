'use client';

import React, { memo, useState, useMemo } from 'react';
import { X, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import {
  EstimateVersion,
  EstimateItem,
  VersionComparison,
  ItemDiff,
} from '../types';
import {
  compareVersions,
  getFieldLabel,
  getDiffTypeLabel,
  getDiffTypeColor,
} from '../lib/versionComparison';
import { formatPrice } from '../lib/estimateCalculations';

// ==================== VersionComparisonModal コンポーネント ====================

interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: EstimateVersion[];
  getVersionItems: (versionId: string) => EstimateItem[];
}

const VersionComparisonModal = memo(function VersionComparisonModal({
  isOpen,
  onClose,
  versions,
  getVersionItems,
}: VersionComparisonModalProps) {
  const [oldVersionId, setOldVersionId] = useState<string>('');
  const [newVersionId, setNewVersionId] = useState<string>('');

  // バージョンを取得
  const oldVersion = versions.find((v) => v.id === oldVersionId);
  const newVersion = versions.find((v) => v.id === newVersionId);

  // 比較結果を計算
  const comparison = useMemo<VersionComparison | null>(() => {
    if (!oldVersion || !newVersion) return null;

    const oldItems = getVersionItems(oldVersion.id);
    const newItems = getVersionItems(newVersion.id);

    return compareVersions(oldVersion, oldItems, newVersion, newItems);
  }, [oldVersion, newVersion, getVersionItems]);

  // 統計情報を計算
  const stats = useMemo(() => {
    if (!comparison) return null;

    const added = comparison.itemDiffs.filter((d) => d.type === 'added').length;
    const removed = comparison.itemDiffs.filter(
      (d) => d.type === 'removed',
    ).length;
    const modified = comparison.itemDiffs.filter(
      (d) => d.type === 'modified',
    ).length;
    const unchanged = comparison.itemDiffs.filter(
      (d) => d.type === 'unchanged',
    ).length;

    return { added, removed, modified, unchanged };
  }, [comparison]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">バージョン比較</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* バージョン選択 */}
          <div className="flex items-center gap-4">
            {/* 旧バージョン */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                旧バージョン
              </label>
              <select
                value={oldVersionId}
                onChange={(e) => setOldVersionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    v{version.versionNumber} - {version.title} (
                    {formatPrice(version.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-8 h-8 text-gray-400 mt-6" />

            {/* 新バージョン */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                新バージョン
              </label>
              <select
                value={newVersionId}
                onChange={(e) => setNewVersionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    v{version.versionNumber} - {version.title} (
                    {formatPrice(version.totalAmount)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {!comparison ? (
            <div className="text-center text-gray-400 py-12">
              <p>バージョンを選択してください</p>
            </div>
          ) : (
            <>
              {/* サマリーカード */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {/* 金額差異 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-700 font-semibold mb-1">
                    金額差異
                  </div>
                  <div className="flex items-center gap-1">
                    {comparison.totalAmountDiff > 0 ? (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    ) : comparison.totalAmountDiff < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    ) : null}
                    <div
                      className={`text-lg font-bold ${
                        comparison.totalAmountDiff > 0
                          ? 'text-red-600'
                          : comparison.totalAmountDiff < 0
                            ? 'text-green-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {comparison.totalAmountDiff > 0 ? '+' : ''}
                      {formatPrice(comparison.totalAmountDiff)}
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {comparison.totalAmountDiffRate > 0 ? '+' : ''}
                    {comparison.totalAmountDiffRate.toFixed(1)}%
                  </div>
                </div>

                {/* 追加 */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-700 font-semibold mb-1">
                    追加
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.added || 0}
                  </div>
                  <div className="text-xs text-green-600">項目</div>
                </div>

                {/* 削除 */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="text-sm text-red-700 font-semibold mb-1">
                    削除
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.removed || 0}
                  </div>
                  <div className="text-xs text-red-600">項目</div>
                </div>

                {/* 変更 */}
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="text-sm text-yellow-700 font-semibold mb-1">
                    変更
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.modified || 0}
                  </div>
                  <div className="text-xs text-yellow-600">項目</div>
                </div>

                {/* 変更なし */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-sm text-gray-700 font-semibold mb-1">
                    変更なし
                  </div>
                  <div className="text-2xl font-bold text-gray-600">
                    {stats?.unchanged || 0}
                  </div>
                  <div className="text-xs text-gray-600">項目</div>
                </div>
              </div>

              {/* 差分テーブル */}
              <div className="space-y-3">
                {comparison.itemDiffs
                  .filter((diff) => diff.type !== 'unchanged')
                  .map((diff, index) => (
                    <DiffItemCard key={index} diff={diff} />
                  ))}

                {comparison.itemDiffs.filter((d) => d.type !== 'unchanged')
                  .length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p>変更はありません</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// ==================== DiffItemCard コンポーネント ====================

interface DiffItemCardProps {
  diff: ItemDiff;
}

const DiffItemCard = memo(function DiffItemCard({ diff }: DiffItemCardProps) {
  const colorClass = getDiffTypeColor(diff.type);

  return (
    <div className={`border-2 rounded-xl p-4 ${colorClass}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold">
            {getDiffTypeLabel(diff.type)}
          </span>
          {diff.newItem && (
            <span className="font-semibold">
              No.{diff.newItem.no} {diff.newItem.itemName}
            </span>
          )}
          {!diff.newItem && diff.oldItem && (
            <span className="font-semibold line-through text-gray-500">
              No.{diff.oldItem.no} {diff.oldItem.itemName}
            </span>
          )}
        </div>
      </div>

      {/* 変更詳細 */}
      {diff.type === 'modified' && diff.changes && diff.changes.length > 0 && (
        <div className="space-y-2">
          {diff.changes.map((change, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 text-sm bg-white p-2 rounded"
            >
              <span className="font-semibold text-gray-700 min-w-[80px]">
                {getFieldLabel(change.field)}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-red-600 line-through">
                  {formatValue(change.field, change.oldValue)}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-green-600 font-semibold">
                  {formatValue(change.field, change.newValue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規追加の詳細 */}
      {diff.type === 'added' && diff.newItem && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">仕様:</span>{' '}
            <span className="font-semibold">{diff.newItem.specification}</span>
          </div>
          <div>
            <span className="text-gray-600">数量:</span>{' '}
            <span className="font-semibold">
              {diff.newItem.quantity} {diff.newItem.unit}
            </span>
          </div>
          <div>
            <span className="text-gray-600">単価:</span>{' '}
            <span className="font-semibold">
              {formatPrice(diff.newItem.unitPrice)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">金額:</span>{' '}
            <span className="font-semibold text-green-600">
              {formatPrice(diff.newItem.amount)}
            </span>
          </div>
        </div>
      )}

      {/* 削除の詳細 */}
      {diff.type === 'removed' && diff.oldItem && (
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <div>
            <span className="text-gray-600">仕様:</span>{' '}
            <span className="line-through">{diff.oldItem.specification}</span>
          </div>
          <div>
            <span className="text-gray-600">数量:</span>{' '}
            <span className="line-through">
              {diff.oldItem.quantity} {diff.oldItem.unit}
            </span>
          </div>
          <div>
            <span className="text-gray-600">単価:</span>{' '}
            <span className="line-through">
              {formatPrice(diff.oldItem.unitPrice)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">金額:</span>{' '}
            <span className="text-red-600 line-through">
              {formatPrice(diff.oldItem.amount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

// ==================== ヘルパー関数 ====================

function formatValue(field: string, value: any): string {
  if (value === null || value === undefined) return '-';

  if (
    field === 'unitPrice' ||
    field === 'amount' ||
    field === 'costPrice' ||
    field === 'costAmount' ||
    field === 'grossProfit'
  ) {
    return formatPrice(value as number);
  }

  if (field === 'grossProfitRate') {
    return `${(value as number).toFixed(1)}%`;
  }

  return String(value);
}

export default VersionComparisonModal;
