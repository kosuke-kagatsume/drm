'use client';

import React, { memo, useMemo } from 'react';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Search,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { EstimateItem, EditingCell } from '../types';
import { CATEGORIES, UNITS, getMinorCategoriesByMajor } from '../constants';
import { formatPrice } from '../lib/estimateCalculations';

// ==================== 型定義 ====================

interface ItemGroup {
  category: string;
  items: EstimateItem[];
  subtotal: number;
  subtotalCost: number;
  subtotalProfit: number;
  subtotalProfitRate: number;
}

// ==================== ヘルパー関数 ====================

/**
 * アイテムを大項目でグループ化
 */
function groupItemsByCategory(items: EstimateItem[]): ItemGroup[] {
  const groups: Map<string, EstimateItem[]> = new Map();

  // 大項目ごとにアイテムを分類
  items.forEach((item) => {
    const category = item.category;
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(item);
  });

  // グループごとに小計を計算
  const result: ItemGroup[] = [];
  groups.forEach((groupItems, category) => {
    const subtotal = groupItems.reduce((sum, item) => sum + item.amount, 0);
    const subtotalCost = groupItems.reduce(
      (sum, item) => sum + (item.costAmount || 0),
      0,
    );
    const subtotalProfit = subtotal - subtotalCost;
    const subtotalProfitRate =
      subtotal > 0 ? (subtotalProfit / subtotal) * 100 : 0;

    result.push({
      category,
      items: groupItems,
      subtotal,
      subtotalCost,
      subtotalProfit,
      subtotalProfitRate,
    });
  });

  return result;
}

// ==================== EstimateTable コンポーネント ====================

interface EstimateTableProps {
  items: EstimateItem[];
  editingCell: EditingCell | null;
  onCellEdit: (cell: EditingCell | null) => void;
  onCellChange: (
    itemId: string,
    field: keyof EstimateItem,
    value: string,
  ) => void;
  onAddRow: (category?: string) => void;
  onDeleteRow: (itemId: string) => void;
  onDuplicateRow: (itemId: string) => void;
  onMoveRowUp: (itemId: string) => void;
  onMoveRowDown: (itemId: string) => void;
  onOpenMasterSearch: (itemId: string) => void;
  onOpenCommentPanel: (itemId: string) => void;
  commentCounts: Map<string, number>;
}

const EstimateTable = memo(function EstimateTable({
  items,
  editingCell,
  onCellEdit,
  onCellChange,
  onAddRow,
  onDeleteRow,
  onDuplicateRow,
  onMoveRowUp,
  onMoveRowDown,
  onOpenMasterSearch,
  onOpenCommentPanel,
  commentCounts,
}: EstimateTableProps) {
  // アイテムを大項目でグループ化
  const groupedItems = useMemo(() => groupItemsByCategory(items), [items]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white shadow-md">
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 w-16">
              No
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 w-32">
              小項目
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 min-w-[200px]">
              項目名
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 min-w-[200px]">
              仕様
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 w-24">
              数量
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 w-20">
              単位
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 w-32">
              単価
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 w-32">
              金額
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-orange-400 bg-gradient-to-r from-orange-500 to-orange-600 w-32">
              原価
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-emerald-400 bg-gradient-to-r from-emerald-500 to-green-600 w-32">
              粗利
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-emerald-400 bg-gradient-to-r from-emerald-500 to-green-600 w-24">
              粗利率
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-cyan-400 min-w-[150px]">
              備考
            </th>
            <th className="px-3 py-3 text-center text-sm font-semibold border border-cyan-400 w-40">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-4 py-8 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg">項目がありません</p>
                  <button
                    onClick={() => onAddRow()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    最初の大項目を追加
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            groupedItems.map((group) => (
              <React.Fragment key={group.category}>
                {/* 大項目ヘッダー行 */}
                <CategoryHeaderRow
                  category={group.category}
                  onAddItem={onAddRow}
                />

                {/* 明細行 */}
                {group.items.map((item, index) => (
                  <EstimateTableRow
                    key={item.id}
                    item={item}
                    index={index}
                    groupItems={group.items}
                    allItems={items}
                    totalItems={items.length}
                    editingCell={editingCell}
                    onCellEdit={onCellEdit}
                    onCellChange={onCellChange}
                    onDeleteRow={onDeleteRow}
                    onDuplicateRow={onDuplicateRow}
                    onMoveRowUp={onMoveRowUp}
                    onMoveRowDown={onMoveRowDown}
                    onOpenMasterSearch={onOpenMasterSearch}
                    onOpenCommentPanel={onOpenCommentPanel}
                    commentCounts={commentCounts}
                  />
                ))}

                {/* 小計行 */}
                <SubtotalRow group={group} />
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

// ==================== CategoryHeaderRow コンポーネント ====================

interface CategoryHeaderRowProps {
  category: string;
  onAddItem: (category: string) => void;
}

const CategoryHeaderRow = memo(function CategoryHeaderRow({
  category,
  onAddItem,
}: CategoryHeaderRowProps) {
  return (
    <tr className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-sm">
      <td
        colSpan={13}
        className="px-4 py-3 border border-cyan-400 text-white font-bold text-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">●</span>
            <span>{category}</span>
          </div>
          <button
            onClick={() => onAddItem(category)}
            className="px-3 py-1 bg-white text-cyan-600 font-semibold rounded-lg hover:bg-cyan-50 hover:shadow-md transition-all text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            項目を追加
          </button>
        </div>
      </td>
    </tr>
  );
});

// ==================== SubtotalRow コンポーネント ====================

interface SubtotalRowProps {
  group: ItemGroup;
}

const SubtotalRow = memo(function SubtotalRow({ group }: SubtotalRowProps) {
  // 粗利率による色分け
  const profitRateColor =
    group.subtotalProfitRate < 0
      ? 'text-red-700 bg-red-100'
      : group.subtotalProfitRate < 15
        ? 'text-orange-700 bg-orange-100'
        : 'text-green-700 bg-green-100';

  return (
    <tr className="bg-blue-50 font-semibold">
      <td colSpan={7} className="px-4 py-2 border border-gray-300 text-right">
        {group.category} 小計
      </td>
      <td className="px-3 py-2 border border-gray-300 text-right text-blue-600">
        {formatPrice(group.subtotal)}
      </td>
      <td className="px-3 py-2 border border-gray-300 text-right text-yellow-600">
        {formatPrice(group.subtotalCost)}
      </td>
      <td className="px-3 py-2 border border-gray-300 text-right text-green-600">
        {formatPrice(group.subtotalProfit)}
      </td>
      <td
        className={`px-3 py-2 border border-gray-300 text-right ${profitRateColor}`}
      >
        {group.subtotalProfitRate.toFixed(1)}%
      </td>
      <td colSpan={2} className="px-3 py-2 border border-gray-300"></td>
    </tr>
  );
});

// ==================== EstimateTableRow コンポーネント ====================

interface EstimateTableRowProps {
  item: EstimateItem;
  index: number;
  groupItems: EstimateItem[]; // 同じグループ内のアイテム一覧
  allItems: EstimateItem[]; // 全アイテム（キーボードナビゲーション用）
  totalItems: number;
  editingCell: EditingCell | null;
  onCellEdit: (cell: EditingCell | null) => void;
  onCellChange: (
    itemId: string,
    field: keyof EstimateItem,
    value: string,
  ) => void;
  onDeleteRow: (itemId: string) => void;
  onDuplicateRow: (itemId: string) => void;
  onMoveRowUp: (itemId: string) => void;
  onMoveRowDown: (itemId: string) => void;
  onOpenMasterSearch: (itemId: string) => void;
  onOpenCommentPanel: (itemId: string) => void;
  commentCounts: Map<string, number>;
}

const EstimateTableRow = memo(function EstimateTableRow({
  item,
  index,
  groupItems,
  allItems,
  totalItems,
  editingCell,
  onCellEdit,
  onCellChange,
  onDeleteRow,
  onDuplicateRow,
  onMoveRowUp,
  onMoveRowDown,
  onOpenMasterSearch,
  onOpenCommentPanel,
  commentCounts,
}: EstimateTableRowProps) {
  const isEditing = (field: string) =>
    editingCell?.row === item.id && editingCell?.col === field;

  // 選択された大項目に応じて小項目の選択肢を取得
  const minorCategoryOptions = useMemo(() => {
    const minorCats = getMinorCategoriesByMajor(item.category);
    return ['', ...minorCats.map((mc) => mc.name)]; // 空文字列を先頭に追加（未選択）
  }, [item.category]);

  // ==================== キーボードナビゲーション ====================

  // 編集可能なカラムの順序定義
  const EDITABLE_COLUMNS = [
    'minorCategory',
    'itemName',
    'specification',
    'quantity',
    'unit',
    'unitPrice',
    'costPrice',
    'remarks',
  ];

  // 次の行のセルを見つける（Enter: 下に移動）
  const findNextRowCell = (currentItemId: string, currentCol: string) => {
    const currentIndex = allItems.findIndex(
      (item) => item.id === currentItemId,
    );
    if (currentIndex === -1 || currentIndex >= allItems.length - 1) return null;

    const nextItem = allItems[currentIndex + 1];
    return { row: nextItem.id, col: currentCol };
  };

  // 前の行のセルを見つける（↑: 上に移動）
  const findPrevRowCell = (currentItemId: string, currentCol: string) => {
    const currentIndex = allItems.findIndex(
      (item) => item.id === currentItemId,
    );
    if (currentIndex <= 0) return null;

    const prevItem = allItems[currentIndex - 1];
    return { row: prevItem.id, col: currentCol };
  };

  // 次のカラムを見つける（Tab: 右に移動）
  const findNextColumnCell = (currentItemId: string, currentCol: string) => {
    const currentColIndex = EDITABLE_COLUMNS.indexOf(currentCol);
    if (currentColIndex === -1) return null;

    if (currentColIndex >= EDITABLE_COLUMNS.length - 1) {
      // 最後のカラムの場合、次の行の最初のカラムへ
      return findNextRowCell(currentItemId, EDITABLE_COLUMNS[0]);
    } else {
      // 次のカラムへ
      return { row: currentItemId, col: EDITABLE_COLUMNS[currentColIndex + 1] };
    }
  };

  // 前のカラムを見つける（Shift+Tab: 左に移動）
  const findPrevColumnCell = (currentItemId: string, currentCol: string) => {
    const currentColIndex = EDITABLE_COLUMNS.indexOf(currentCol);
    if (currentColIndex === -1) return null;

    if (currentColIndex <= 0) {
      // 最初のカラムの場合、前の行の最後のカラムへ
      return findPrevRowCell(
        currentItemId,
        EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1],
      );
    } else {
      // 前のカラムへ
      return { row: currentItemId, col: EDITABLE_COLUMNS[currentColIndex - 1] };
    }
  };

  // キーボードイベントハンドラー（編集モード用）
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemId: string,
    field: string,
  ) => {
    // Enter: 下のセルに移動（同じ列）
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextCell = findNextRowCell(itemId, field);
      if (nextCell) {
        onCellEdit(nextCell);
      } else {
        onCellEdit(null); // 最後の行の場合は編集終了
      }
    }
    // Tab: 右のセルに移動
    else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const nextCell = findNextColumnCell(itemId, field);
      if (nextCell) {
        onCellEdit(nextCell);
      }
    }
    // Shift+Tab: 左のセルに移動
    else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const prevCell = findPrevColumnCell(itemId, field);
      if (prevCell) {
        onCellEdit(prevCell);
      }
    }
    // Esc: 編集をキャンセル
    else if (e.key === 'Escape') {
      e.preventDefault();
      onCellEdit(null);
    }
  };

  // キーボードイベントハンドラー（非編集モード用）
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    itemId: string,
    field: string,
  ) => {
    // Enter: 編集モードに入る
    if (e.key === 'Enter') {
      e.preventDefault();
      onCellEdit({ row: itemId, col: field });
    }
    // ↓: 下のセルに移動
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCell = findNextRowCell(itemId, field);
      if (nextCell) {
        onCellEdit(nextCell);
      }
    }
    // ↑: 上のセルに移動
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCell = findPrevRowCell(itemId, field);
      if (prevCell) {
        onCellEdit(prevCell);
      }
    }
    // →: 右のセルに移動
    else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCell = findNextColumnCell(itemId, field);
      if (nextCell) {
        onCellEdit(nextCell);
      }
    }
    // ←: 左のセルに移動
    else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevCell = findPrevColumnCell(itemId, field);
      if (prevCell) {
        onCellEdit(prevCell);
      }
    }
  };

  const renderCell = (
    field: keyof EstimateItem,
    type: 'text' | 'number' | 'select' = 'text',
    options?: string[],
  ) => {
    const value = item[field];
    const editing = isEditing(field as string);

    if (editing) {
      if (type === 'select' && options) {
        return (
          <select
            value={String(value)}
            onChange={(e) => onCellChange(item.id, field, e.target.value)}
            onBlur={() => onCellEdit(null)}
            onKeyDown={(e) => handleKeyDown(e, item.id, field as string)}
            autoFocus
            className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          type={type}
          value={String(value)}
          onChange={(e) => onCellChange(item.id, field, e.target.value)}
          onBlur={() => onCellEdit(null)}
          onKeyDown={(e) => handleKeyDown(e, item.id, field as string)}
          autoFocus
          step={
            type === 'number'
              ? field === 'quantity'
                ? '1'
                : '0.01'
              : undefined
          }
          className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <div
        onClick={() => onCellEdit({ row: item.id, col: field as string })}
        onKeyDown={(e) => handleCellKeyDown(e, item.id, field as string)}
        tabIndex={0}
        className="min-h-[32px] px-2 py-1 rounded hover:bg-blue-50 cursor-text focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {type === 'number' && typeof value === 'number'
          ? field === 'unitPrice' || field === 'amount' || field === 'costPrice'
            ? formatPrice(value)
            : field === 'grossProfitRate'
              ? `${value.toFixed(1)}%`
              : field === 'grossProfit'
                ? formatPrice(value)
                : value
          : value || ''}
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* No */}
      <td className="px-3 py-2 border border-gray-300 text-center text-sm">
        {item.no}
      </td>

      {/* 小項目 */}
      <td className="px-3 py-2 border border-gray-300 bg-blue-50">
        {renderCell('minorCategory', 'select', minorCategoryOptions)}
      </td>

      {/* 項目名 */}
      <td className="px-3 py-2 border border-gray-300 relative group">
        {renderCell('itemName', 'text')}
        {/* マスタ検索ボタン */}
        <button
          onClick={() => onOpenMasterSearch(item.id)}
          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 hover:bg-blue-200 text-blue-700 p-1 rounded text-xs"
          title="マスタから選択"
        >
          <Search className="w-3 h-3" />
        </button>
      </td>

      {/* 仕様 */}
      <td className="px-3 py-2 border border-gray-300">
        {renderCell('specification', 'text')}
      </td>

      {/* 数量 */}
      <td className="px-3 py-2 border border-gray-300">
        {renderCell('quantity', 'number')}
      </td>

      {/* 単位 */}
      <td className="px-3 py-2 border border-gray-300">
        {renderCell('unit', 'select', UNITS)}
      </td>

      {/* 単価 */}
      <td className="px-3 py-2 border border-gray-300 text-right">
        {renderCell('unitPrice', 'number')}
      </td>

      {/* 金額 */}
      <td className="px-3 py-2 border border-gray-300 text-right bg-blue-50 font-semibold">
        {formatPrice(item.amount)}
      </td>

      {/* 原価 */}
      <td className="px-3 py-2 border border-gray-300 text-right bg-yellow-50">
        {renderCell('costPrice', 'number')}
      </td>

      {/* 粗利 */}
      <td className="px-3 py-2 border border-gray-300 text-right bg-green-50 font-semibold">
        {formatPrice(item.grossProfit || 0)}
      </td>

      {/* 粗利率 */}
      <td
        className={`px-3 py-2 border border-gray-300 text-right font-semibold ${
          (item.grossProfitRate || 0) < 0
            ? 'bg-red-100 text-red-700'
            : (item.grossProfitRate || 0) < 15
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
        }`}
      >
        {(item.grossProfitRate || 0).toFixed(1)}%
      </td>

      {/* 備考 */}
      <td className="px-3 py-2 border border-gray-300">
        {renderCell('remarks', 'text')}
      </td>

      {/* 操作 */}
      <td className="px-3 py-2 border border-gray-300">
        <div className="flex items-center justify-center gap-1">
          {/* 上に移動（グループ内のみ） */}
          <button
            onClick={() => onMoveRowUp(item.id)}
            disabled={index === 0}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="上に移動（同じ大項目内のみ）"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* 下に移動（グループ内のみ） */}
          <button
            onClick={() => onMoveRowDown(item.id)}
            disabled={index === groupItems.length - 1}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="下に移動（同じ大項目内のみ）"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* 複製 */}
          <button
            onClick={() => onDuplicateRow(item.id)}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-100 rounded"
            title="複製"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* コメント */}
          <button
            onClick={() => onOpenCommentPanel(item.id)}
            className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-100 rounded relative"
            title="コメント"
          >
            <MessageSquare className="w-4 h-4" />
            {commentCounts.get(item.id) ? (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {commentCounts.get(item.id)}
              </span>
            ) : null}
          </button>

          {/* 削除 */}
          <button
            onClick={() => onDeleteRow(item.id)}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default EstimateTable;
