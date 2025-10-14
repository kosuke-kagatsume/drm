'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Copy, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

// ==================== 型定義 ====================

interface EstimateItem {
  id: string;
  no: number;
  category: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;
  // 原価管理（Day 2で追加予定）
  costPrice?: number;
  costAmount?: number;
  grossProfit?: number;
  grossProfitRate?: number;
}

interface EstimateData {
  id: string;
  title: string;
  customer: string;
  items: EstimateItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== 定数 ====================

// 大項目のカテゴリ定義
const CATEGORIES = [
  '仮設工事',
  '解体工事',
  '基礎工事',
  '木工事',
  '屋根工事',
  '外壁工事',
  '内装工事',
  '浴室工事',
  '電気工事',
  '給排水工事',
  'キッチン工事',
  '諸経費',
];

// 単位定義
const UNITS = [
  '式',
  'm',
  'm²',
  'm³',
  '個',
  '台',
  '箇所',
  '枚',
  '本',
  'セット',
  '一式',
];

// ==================== ユーティリティ関数 ====================

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 金額を計算（数量 × 単価）
 */
function calculateAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

/**
 * 金額フォーマット（3桁カンマ区切り）
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(value);
}

// ==================== メインコンポーネント ====================

export default function EstimateEditorV4() {
  const router = useRouter();
  const params = useParams();
  const estimateId = params?.id as string;

  // State
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [title, setTitle] = useState('新規見積書');
  const [customer, setCustomer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ==================== データ読み込み ====================

  useEffect(() => {
    loadEstimate();
  }, [estimateId]);

  const loadEstimate = async () => {
    try {
      setIsLoading(true);

      // 既存データの読み込み（ローカルストレージまたはAPI）
      const savedData = localStorage.getItem(`estimate-v4-${estimateId}`);

      if (savedData) {
        const data: EstimateData = JSON.parse(savedData);
        setTitle(data.title);
        setCustomer(data.customer);
        setItems(data.items);
        logger.estimate.info('V4: 見積データ読み込み完了', { id: estimateId });
      } else {
        // 新規作成の場合、サンプル行を追加
        setItems([createNewItem(1)]);
        logger.estimate.info('V4: 新規見積作成', { id: estimateId });
      }
    } catch (error) {
      logger.estimate.error('V4: データ読み込みエラー', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== アイテム操作 ====================

  /**
   * 新しいアイテムを作成
   */
  const createNewItem = (no: number): EstimateItem => {
    return {
      id: generateId(),
      no,
      category: CATEGORIES[0],
      itemName: '',
      specification: '',
      quantity: 1,
      unit: UNITS[0],
      unitPrice: 0,
      amount: 0,
      remarks: '',
    };
  };

  /**
   * 行を追加
   */
  const handleAddRow = useCallback(() => {
    const newNo = items.length + 1;
    const newItem = createNewItem(newNo);
    setItems([...items, newItem]);
    logger.estimate.debug('V4: 行追加', { no: newNo });
  }, [items]);

  /**
   * 行を削除
   */
  const handleDeleteRow = useCallback((id: string) => {
    setItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.id !== id);
      // No を振り直し
      return filtered.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    });
    logger.estimate.debug('V4: 行削除', { id });
  }, []);

  /**
   * 行を複製
   */
  const handleCopyRow = useCallback(
    (id: string) => {
      const targetItem = items.find((item) => item.id === id);
      if (!targetItem) return;

      const newItem: EstimateItem = {
        ...targetItem,
        id: generateId(),
        no: items.length + 1,
      };

      setItems([...items, newItem]);
      logger.estimate.debug('V4: 行複製', { id, newId: newItem.id });
    },
    [items],
  );

  /**
   * セルの値を更新
   */
  const handleCellChange = useCallback(
    (id: string, field: keyof EstimateItem, value: any) => {
      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.id !== id) return item;

          const updated = { ...item, [field]: value };

          // 数量または単価が変更された場合、金額を再計算
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = calculateAmount(
              updated.quantity,
              updated.unitPrice,
            );
          }

          return updated;
        });
      });
    },
    [],
  );

  // ==================== 保存処理 ====================

  /**
   * 見積を保存
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      const estimateData: EstimateData = {
        id: estimateId,
        title,
        customer,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ローカルストレージに保存
      localStorage.setItem(
        `estimate-v4-${estimateId}`,
        JSON.stringify(estimateData),
      );

      setSaveMessage('✅ 保存しました');
      logger.estimate.info('V4: 保存完了', {
        id: estimateId,
        itemCount: items.length,
      });

      // 3秒後にメッセージを消す
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      logger.estimate.error('V4: 保存エラー', error);
      setSaveMessage('❌ 保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== 合計金額計算 ====================

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // ==================== レンダリング ====================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 左側: 戻るボタン + タイトル */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/estimates')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="見積一覧に戻る"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none px-2 py-1 transition-colors"
                    placeholder="見積書タイトル"
                  />
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    V4 (Beta)
                  </span>
                </div>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="text-sm text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-2 py-1 transition-colors"
                  placeholder="顧客名を入力"
                />
              </div>
            </div>

            {/* 右側: アクションボタン */}
            <div className="flex items-center space-x-3">
              {saveMessage && (
                <span className="text-sm font-medium text-gray-700 animate-fade-in">
                  {saveMessage}
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    isSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ツールバー */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>行を追加</span>
              </button>

              <div className="text-sm text-gray-600 ml-4">
                合計:{' '}
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500">行数: {items.length}</div>
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    カテゴリ
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    項目名
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    仕様
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    数量
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    単位
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    単価
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    金額
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    備考
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        項目がありません
                      </p>
                      <p className="text-sm">
                        「行を追加」ボタンから新しい項目を追加してください
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <EstimateRow
                      key={item.id}
                      item={item}
                      onCellChange={handleCellChange}
                      onDelete={handleDeleteRow}
                      onCopy={handleCopyRow}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 合計行 */}
        {items.length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow-sm p-6 mt-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                合計金額（税抜）
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== 行コンポーネント ====================

interface EstimateRowProps {
  item: EstimateItem;
  onCellChange: (id: string, field: keyof EstimateItem, value: any) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}

function EstimateRow({
  item,
  onCellChange,
  onDelete,
  onCopy,
}: EstimateRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* No */}
      <td className="px-3 py-2 text-sm text-gray-900 text-center">{item.no}</td>

      {/* カテゴリ */}
      <td className="px-3 py-2">
        <select
          value={item.category}
          onChange={(e) => onCellChange(item.id, 'category', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </td>

      {/* 項目名 */}
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.itemName}
          onChange={(e) => onCellChange(item.id, 'itemName', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="項目名を入力"
        />
      </td>

      {/* 仕様 */}
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.specification}
          onChange={(e) =>
            onCellChange(item.id, 'specification', e.target.value)
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="仕様を入力"
        />
      </td>

      {/* 数量 */}
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            onCellChange(item.id, 'quantity', parseFloat(e.target.value) || 0)
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </td>

      {/* 単位 */}
      <td className="px-3 py-2">
        <select
          value={item.unit}
          onChange={(e) => onCellChange(item.id, 'unit', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </td>

      {/* 単価 */}
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.unitPrice}
          onChange={(e) =>
            onCellChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="1"
        />
      </td>

      {/* 金額（自動計算） */}
      <td className="px-3 py-2">
        <div className="text-sm font-semibold text-right text-gray-900">
          {formatCurrency(item.amount)}
        </div>
      </td>

      {/* 備考 */}
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.remarks}
          onChange={(e) => onCellChange(item.id, 'remarks', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="備考"
        />
      </td>

      {/* 操作ボタン */}
      <td className="px-3 py-2">
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => onCopy(item.id)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="行を複製"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="行を削除"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}
