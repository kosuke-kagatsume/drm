'use client';

import React, { memo } from 'react';
import { Trash2, Copy, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { EstimateItem, EditingCell } from '../types';
import { CATEGORIES, UNITS } from '../constants';
import { formatPrice } from '../lib/estimateCalculations';

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
  onAddRow: () => void;
  onDeleteRow: (itemId: string) => void;
  onDuplicateRow: (itemId: string) => void;
  onMoveRowUp: (itemId: string) => void;
  onMoveRowDown: (itemId: string) => void;
  onOpenMasterSearch: (itemId: string) => void;
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
}: EstimateTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 w-16">
              No
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 w-32">
              カテゴリ
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 min-w-[200px]">
              項目名
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 min-w-[200px]">
              仕様
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 w-24">
              数量
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 w-20">
              単位
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 w-32">
              単価
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 w-32">
              金額
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-yellow-500 bg-yellow-600 w-32">
              原価
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-green-500 bg-green-600 w-32">
              粗利
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-green-500 bg-green-600 w-24">
              粗利率
            </th>
            <th className="px-3 py-3 text-left text-sm font-semibold border border-blue-500 min-w-[150px]">
              備考
            </th>
            <th className="px-3 py-3 text-center text-sm font-semibold border border-blue-500 w-40">
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
                    onClick={onAddRow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    最初の行を追加
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <EstimateTableRow
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                editingCell={editingCell}
                onCellEdit={onCellEdit}
                onCellChange={onCellChange}
                onDeleteRow={onDeleteRow}
                onDuplicateRow={onDuplicateRow}
                onMoveRowUp={onMoveRowUp}
                onMoveRowDown={onMoveRowDown}
                onOpenMasterSearch={onOpenMasterSearch}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

// ==================== EstimateTableRow コンポーネント ====================

interface EstimateTableRowProps {
  item: EstimateItem;
  index: number;
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
}

const EstimateTableRow = memo(function EstimateTableRow({
  item,
  index,
  totalItems,
  editingCell,
  onCellEdit,
  onCellChange,
  onDeleteRow,
  onDuplicateRow,
  onMoveRowUp,
  onMoveRowDown,
  onOpenMasterSearch,
}: EstimateTableRowProps) {
  const isEditing = (field: string) =>
    editingCell?.row === item.id && editingCell?.col === field;

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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              onCellEdit(null);
            }
          }}
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
        className="min-h-[32px] px-2 py-1 rounded hover:bg-blue-50 cursor-text"
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

      {/* カテゴリ */}
      <td className="px-3 py-2 border border-gray-300">
        {renderCell('category', 'select', CATEGORIES)}
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
      <td className="px-3 py-2 border border-gray-300 text-right bg-green-50 font-semibold">
        {(item.grossProfitRate || 0).toFixed(1)}%
      </td>

      {/* 備考 */}
      <td className="px-3 py-2 border border-gray-300">
        {renderCell('remarks', 'text')}
      </td>

      {/* 操作 */}
      <td className="px-3 py-2 border border-gray-300">
        <div className="flex items-center justify-center gap-1">
          {/* 上に移動 */}
          <button
            onClick={() => onMoveRowUp(item.id)}
            disabled={index === 0}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="上に移動"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* 下に移動 */}
          <button
            onClick={() => onMoveRowDown(item.id)}
            disabled={index === totalItems - 1}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="下に移動"
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
