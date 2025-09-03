'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

// MasterItem type (if not imported, define minimal type)
type MasterItem = {
  id: string;
  itemName: string;
  specification?: string;
  unit?: string;
  standardPrice: number;
  costPrice: number;
  [key: string]: any;
};

type Props = {
  open: boolean;
  categories: string[];
  onConfirm: (category: string) => void;
  onClose: () => void;
  onSelect?: (master: MasterItem, categoryName?: string) => void; // ← 追加
};

export default function GlobalMasterAddModal({
  open,
  categories,
  onConfirm,
  onClose,
  onSelect,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (selectedCategory) {
      onConfirm(selectedCategory);
      setSelectedCategory(''); // Reset for next time
    }
  };

  return (
    <div
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl min-w-[400px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">マスタから項目追加</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          まずカテゴリを選択してください
        </p>

        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">カテゴリを選択...</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            disabled={!selectedCategory}
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            次へ（商品種別選択へ）
          </button>
        </div>
      </div>
    </div>
  );
}
