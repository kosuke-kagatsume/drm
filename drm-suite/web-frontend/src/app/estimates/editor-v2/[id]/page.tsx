'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Save,
  FileDown,
  Plus,
  Trash2,
  Copy,
  Search,
  ChevronDown,
  Calculator,
  FileText,
  Sparkles,
  History,
  Package,
  Settings,
  Grid3x3,
  ArrowLeft,
  MoreVertical,
  GripVertical,
  Undo,
  Redo,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Database,
  ChevronRight,
  Filter,
  Download,
  Upload,
  Edit3,
  Percent,
  MessageSquare,
  Eye,
  Printer,
  FileSpreadsheet,
  GitBranch,
  CheckSquare,
  Square,
  Send,
  Clock,
  X,
} from 'lucide-react';

// 見積明細の型定義
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
  formula?: string; // 計算式
  isSubtotal?: boolean; // 小計行
  isCategory?: boolean; // カテゴリヘッダー行
}

// カテゴリ定義
const CATEGORIES = [
  '仮設工事',
  '解体工事',
  '基礎工事',
  '木工事',
  '屋根工事',
  '外壁工事',
  '内装工事',
  'キッチン工事',
  '浴室工事',
  '電気工事',
  '給排水工事',
  '諸経費',
];

// ドラッグ可能な行コンポーネント
function SortableRow({
  item,
  children,
  isSelected,
}: {
  item: EstimateItem;
  children: React.ReactNode;
  isSelected: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`hover:bg-blue-50/50 transition-colors ${isSelected ? 'bg-blue-100' : ''} ${isDragging ? 'shadow-lg' : ''} ${item.isCategory ? 'bg-gray-50 font-bold' : ''} ${item.isSubtotal ? 'bg-gray-50' : ''}`}
    >
      <td className="sticky left-0 z-10 bg-white px-2 py-2 text-center">
        <div className="flex items-center gap-1">
          <button
            {...listeners}
            className="cursor-move p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </td>
      {children}
    </tr>
  );
}

export default function EstimateEditorV2Page({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    row: string;
    col: string;
  } | null>(null);
  const [history, setHistory] = useState<EstimateItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved',
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [batchEditMode, setBatchEditMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // ドラッグ&ドロップの設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 初期データの生成
  useEffect(() => {
    const initialItems: EstimateItem[] = [];
    let itemNo = 1;

    CATEGORIES.forEach((category) => {
      // カテゴリヘッダー
      initialItems.push({
        id: `cat-${category}`,
        no: 0,
        category: category,
        itemName: category,
        specification: '',
        quantity: 0,
        unit: '',
        unitPrice: 0,
        amount: 0,
        remarks: '',
        isCategory: true,
      });

      // サンプルデータ
      if (category === 'キッチン工事') {
        initialItems.push({
          id: String(itemNo++),
          no: itemNo,
          category: category,
          itemName: 'システムキッチン本体',
          specification: 'LIXIL リシェルSI I型2550',
          quantity: 1,
          unit: '台',
          unitPrice: 650000,
          amount: 650000,
          remarks: '食洗機付き',
        });
        initialItems.push({
          id: String(itemNo++),
          no: itemNo,
          category: category,
          itemName: 'キッチン取付工事',
          specification: '既存撤去・新規設置',
          quantity: 1,
          unit: '式',
          unitPrice: 80000,
          amount: 80000,
          remarks: '',
        });
      }

      // カテゴリ小計
      initialItems.push({
        id: `subtotal-${category}`,
        no: 0,
        category: category,
        itemName: `${category} 小計`,
        specification: '',
        quantity: 0,
        unit: '',
        unitPrice: 0,
        amount: 0,
        remarks: '',
        isSubtotal: true,
      });
    });

    setItems(initialItems);
    addToHistory(initialItems);
  }, []);

  // 履歴管理
  const addToHistory = (newItems: EstimateItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newItems);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 元に戻す
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setItems(history[historyIndex - 1]);
    }
  };

  // やり直し
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setItems(history[historyIndex + 1]);
    }
  };

  // 自動保存
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        setSaveStatus('saving');
        // API呼び出しをシミュレート
        setTimeout(() => {
          setSaveStatus('saved');
        }, 1000);
      }, 2000);
    }
  }, [items, saveStatus]);

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // 番号を振り直し
        let itemNo = 1;
        newItems.forEach((item) => {
          if (!item.isCategory && !item.isSubtotal) {
            item.no = itemNo++;
          }
        });

        setSaveStatus('unsaved');
        addToHistory(newItems);
        return newItems;
      });
    }
  };

  // セルの値を更新
  const handleCellChange = (itemId: string, colKey: string, value: any) => {
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item };

        if (colKey === 'quantity' || colKey === 'unitPrice') {
          const numValue = parseFloat(value) || 0;
          (updatedItem as any)[colKey] = numValue;
          // 金額を自動計算
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        } else {
          (updatedItem as any)[colKey] = value;
        }

        return updatedItem;
      }
      return item;
    });

    // カテゴリ小計を更新
    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSaveStatus('unsaved');
    addToHistory(updatedItems);
  };

  // カテゴリ小計を更新
  const updateCategorySubtotals = (items: EstimateItem[]) => {
    const categoryTotals: { [key: string]: number } = {};

    items.forEach((item) => {
      if (!item.isCategory && !item.isSubtotal) {
        categoryTotals[item.category] =
          (categoryTotals[item.category] || 0) + item.amount;
      }
    });

    return items.map((item) => {
      if (item.isSubtotal) {
        const category = item.category;
        return { ...item, amount: categoryTotals[category] || 0 };
      }
      return item;
    });
  };

  // 行追加
  const addRow = (category: string) => {
    const categoryIndex = items.findIndex(
      (item) => item.isSubtotal && item.category === category,
    );
    if (categoryIndex === -1) return;

    const newRow: EstimateItem = {
      id: String(Date.now()),
      no: items.filter((i) => !i.isCategory && !i.isSubtotal).length + 1,
      category: category,
      itemName: '',
      specification: '',
      quantity: 1,
      unit: '式',
      unitPrice: 0,
      amount: 0,
      remarks: '',
    };

    const newItems = [...items];
    newItems.splice(categoryIndex, 0, newRow);

    // 番号を振り直し
    let itemNo = 1;
    newItems.forEach((item) => {
      if (!item.isCategory && !item.isSubtotal) {
        item.no = itemNo++;
      }
    });

    setItems(newItems);
    setSaveStatus('unsaved');
    addToHistory(newItems);
  };

  // 選択行を削除
  const deleteSelectedRows = () => {
    const newItems = items.filter((item) => !selectedRows.has(item.id));

    // 番号を振り直し
    let itemNo = 1;
    newItems.forEach((item) => {
      if (!item.isCategory && !item.isSubtotal) {
        item.no = itemNo++;
      }
    });

    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSelectedRows(new Set());
    setSaveStatus('unsaved');
    addToHistory(updatedItems);
  };

  // 合計計算
  const calculateTotal = () => {
    return items
      .filter((item) => item.isSubtotal)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  // カラム定義
  const columns = [
    { key: 'no', label: 'No.', width: '60px', type: 'number' },
    { key: 'itemName', label: '項目名', width: '200px', type: 'text' },
    { key: 'specification', label: '仕様・規格', width: '250px', type: 'text' },
    { key: 'quantity', label: '数量', width: '80px', type: 'number' },
    { key: 'unit', label: '単位', width: '80px', type: 'text' },
    { key: 'unitPrice', label: '単価', width: '120px', type: 'number' },
    {
      key: 'amount',
      label: '金額',
      width: '120px',
      type: 'number',
      readonly: true,
    },
    { key: 'remarks', label: '備考', width: '150px', type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  詳細見積編集 Pro
                </h1>
                <p className="text-sm text-gray-600">見積番号: {params.id}</p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-3">
              {/* 保存状態インジケーター */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">保存済み</span>
                  </>
                )}
                {saveStatus === 'saving' && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </motion.div>
                    <span className="text-sm text-yellow-600">保存中...</span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">未保存</span>
                  </>
                )}
              </div>

              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="元に戻す (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="やり直し (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>

              <div className="border-l border-gray-300 h-8" />

              <button
                onClick={() => setBatchEditMode(!batchEditMode)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  batchEditMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {batchEditMode ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                一括編集
              </button>

              <button
                onClick={() => setShowDiscount(!showDiscount)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Percent className="w-4 h-4" />
                値引き
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                インポート
              </button>

              <button
                onClick={() => setShowPrintPreview(true)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                印刷プレビュー
              </button>

              <button
                onClick={() => setShowMasterSearch(true)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                マスター検索
              </button>

              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                テンプレート
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </button>

              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                PDF出力
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* ツールバー */}
        <div className="bg-white rounded-xl shadow-md mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">全カテゴリ</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none text-sm w-40"
                />
              </div>

              <button
                onClick={deleteSelectedRows}
                disabled={selectedRows.size === 0}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                選択削除 ({selectedRows.size})
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Grid3x3 className="w-4 h-4" />
              <span>
                {items.filter((i) => !i.isCategory && !i.isSubtotal).length}{' '}
                項目
              </span>
            </div>
          </div>
        </div>

        {/* スプレッドシート */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-10"></th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width, minWidth: col.width }}
                      className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items
                      .filter(
                        (item) =>
                          !selectedCategory ||
                          item.category === selectedCategory,
                      )
                      .filter(
                        (item) =>
                          !searchTerm ||
                          item.itemName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          item.specification
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((item) => (
                        <SortableRow
                          key={item.id}
                          item={item}
                          isSelected={selectedRows.has(item.id)}
                        >
                          {item.isCategory ? (
                            <>
                              <td
                                colSpan={7}
                                className="px-3 py-2 text-sm font-bold bg-gray-50"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{item.itemName}</span>
                                  <button
                                    onClick={() => addRow(item.category)}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    項目追加
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm bg-gray-50"></td>
                            </>
                          ) : item.isSubtotal ? (
                            <>
                              <td
                                colSpan={6}
                                className="px-3 py-2 text-sm font-semibold bg-gray-50 text-right"
                              >
                                {item.itemName}
                              </td>
                              <td className="px-3 py-2 text-sm font-semibold bg-gray-50 text-right">
                                ¥{item.amount.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-sm bg-gray-50"></td>
                            </>
                          ) : (
                            columns.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  width: col.width,
                                  minWidth: col.width,
                                }}
                                className={`px-3 py-2 text-sm ${col.key === 'amount' ? 'text-right font-medium' : ''}`}
                                onClick={() => {
                                  if (!col.readonly) {
                                    setEditingCell({
                                      row: item.id,
                                      col: col.key,
                                    });
                                  }
                                }}
                              >
                                {editingCell?.row === item.id &&
                                editingCell?.col === col.key ? (
                                  <input
                                    type={
                                      col.type === 'number' ? 'number' : 'text'
                                    }
                                    value={(item as any)[col.key]}
                                    onChange={(e) =>
                                      handleCellChange(
                                        item.id,
                                        col.key,
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === 'Enter' ||
                                        e.key === 'Tab'
                                      ) {
                                        e.preventDefault();
                                        setEditingCell(null);
                                      }
                                    }}
                                    className="w-full px-1 py-0.5 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className={
                                      col.key === 'amount' ||
                                      col.key === 'unitPrice'
                                        ? 'font-mono'
                                        : ''
                                    }
                                  >
                                    {col.key === 'amount' ||
                                    col.key === 'unitPrice'
                                      ? (item as any)[col.key]
                                        ? `¥${((item as any)[col.key] || 0).toLocaleString()}`
                                        : ''
                                      : col.key === 'no' && item.no === 0
                                        ? ''
                                        : (item as any)[col.key]}
                                  </span>
                                )}
                              </td>
                            ))
                          )}
                        </SortableRow>
                      ))}
                  </SortableContext>
                </DndContext>
              </tbody>
            </table>
          </div>

          {/* 合計欄 */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              {/* 左側：メモ・コメント */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  メモ ({Object.keys(comments).length})
                </button>
                <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4" />
                  バージョン比較
                </button>
                <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm">
                  <Send className="w-4 h-4" />
                  承認依頼
                </button>
              </div>

              {/* 右側：金額 */}
              <div className="flex items-center gap-8">
                <div className="text-sm text-gray-700 font-medium">
                  <span>小計:</span>
                  <span className="ml-4 font-mono font-medium">
                    ¥{calculateTotal().toLocaleString()}
                  </span>
                </div>
                {discountRate > 0 && (
                  <div className="text-sm text-red-600 font-medium">
                    <span>値引き ({discountRate}%):</span>
                    <span className="ml-4 font-mono font-medium">
                      -¥
                      {Math.floor(
                        (calculateTotal() * discountRate) / 100,
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-700 font-medium">
                  <span>消費税 (10%):</span>
                  <span className="ml-4 font-mono font-medium">
                    ¥
                    {Math.floor(
                      calculateTotal() * (1 - discountRate / 100) * 0.1,
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  <span>合計:</span>
                  <span className="ml-4 font-mono">
                    ¥
                    {Math.floor(
                      calculateTotal() * (1 - discountRate / 100) * 1.1,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 値引き設定モーダル */}
      <AnimatePresence>
        {showDiscount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDiscount(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                値引き設定
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    値引き率 (%)
                  </label>
                  <input
                    type="number"
                    value={discountRate}
                    onChange={(e) =>
                      setDiscountRate(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>小計:</span>
                      <span className="font-mono">
                        ¥{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>値引き額:</span>
                      <span className="font-mono">
                        -¥
                        {Math.floor(
                          (calculateTotal() * discountRate) / 100,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-600 pt-2 border-t">
                      <span>値引き後:</span>
                      <span className="font-mono">
                        ¥
                        {Math.floor(
                          calculateTotal() * (1 - discountRate / 100),
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDiscount(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      setSaveStatus('unsaved');
                      setShowDiscount(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    適用
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* インポートモーダル */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  データインポート
                </h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* ドラッグ&ドロップエリア */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                  <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Excel/CSVファイルをドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-500 mb-4">または</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    ファイルを選択
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    対応形式: .xlsx, .xls, .csv
                  </p>
                </div>

                {/* テンプレートダウンロード */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    インポート用テンプレート
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-700">
                      正しい形式でインポートするためのテンプレートをダウンロード
                    </p>
                    <button className="px-3 py-1.5 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" />
                      テンプレート
                    </button>
                  </div>
                </div>

                {/* 最近のインポート履歴 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    最近のインポート
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        name: 'キッチンリフォーム見積.xlsx',
                        date: '2024/03/20',
                        items: 25,
                      },
                      {
                        name: '浴室工事明細.csv',
                        date: '2024/03/18',
                        items: 18,
                      },
                    ].map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.date} • {file.items}項目
                            </p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          再インポート
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* コメントサイドパネル */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="fixed left-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-r border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  メモ・コメント
                </h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 全体メモ */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    見積全体のメモ
                  </h3>
                  <textarea
                    placeholder="お客様への注意事項、特記事項など..."
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* 項目別コメント */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    項目別コメント
                  </h3>
                  <div className="space-y-3">
                    {items
                      .filter(
                        (item) =>
                          !item.isCategory && !item.isSubtotal && item.itemName,
                      )
                      .slice(0, 5)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.itemName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.category}
                              </p>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-700">
                              編集
                            </button>
                          </div>
                          <textarea
                            value={comments[item.id] || ''}
                            onChange={(e) =>
                              setComments({
                                ...comments,
                                [item.id]: e.target.value,
                              })
                            }
                            placeholder="メモを入力..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* 変更履歴 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">変更履歴</h3>
                  <div className="space-y-2">
                    {[
                      {
                        time: '10分前',
                        user: '田中太郎',
                        action: '金額を変更',
                        detail: 'キッチン工事: ¥650,000 → ¥680,000',
                      },
                      {
                        time: '1時間前',
                        user: '佐藤花子',
                        action: '項目を追加',
                        detail: '養生費を追加',
                      },
                      {
                        time: '3時間前',
                        user: '田中太郎',
                        action: '見積作成',
                        detail: '新規作成',
                      },
                    ].map((log, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{log.time}</span>
                            <span>•</span>
                            <span>{log.user}</span>
                          </div>
                          <p className="text-gray-900 font-medium">
                            {log.action}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {log.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* マスター検索モーダル */}
      <AnimatePresence>
        {showMasterSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMasterSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    マスターデータ検索
                  </h2>
                  <button
                    onClick={() => setShowMasterSearch(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="メーカー名、品番、商品名で検索..."
                      className="flex-1 outline-none"
                      autoFocus
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="">全メーカー</option>
                    <option value="lixil">LIXIL</option>
                    <option value="toto">TOTO</option>
                    <option value="panasonic">Panasonic</option>
                    <option value="ykk">YKK AP</option>
                  </select>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      maker: 'LIXIL',
                      name: 'リシェルSI',
                      model: 'I型2550',
                      price: 650000,
                      category: 'キッチン',
                    },
                    {
                      maker: 'TOTO',
                      name: 'サザナ',
                      model: '1616サイズ',
                      price: 850000,
                      category: '浴室',
                    },
                    {
                      maker: 'Panasonic',
                      name: 'アラウーノL150',
                      model: 'タイプ2',
                      price: 280000,
                      category: 'トイレ',
                    },
                    {
                      maker: 'YKK AP',
                      name: 'APW330',
                      model: '引違い窓 1650×1170',
                      price: 45000,
                      category: 'サッシ',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {item.maker}
                          </div>
                          <h3 className="font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.model}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {item.category}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              ¥{item.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* テンプレートパネル */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  テンプレート選択
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="テンプレート検索..."
                    className="bg-transparent outline-none text-sm flex-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    よく使うテンプレート
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        name: 'キッチンリフォーム標準',
                        items: 15,
                        price: 1200000,
                      },
                      { name: '浴室リフォーム標準', items: 12, price: 800000 },
                      { name: 'トイレリフォーム', items: 8, price: 350000 },
                      { name: '外壁塗装工事', items: 10, price: 900000 },
                    ].map((template, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {template.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-3 text-xs">
                              <span className="text-gray-600">
                                {template.items}項目
                              </span>
                              <span className="text-blue-600 font-medium">
                                ¥{(template.price / 10000).toLocaleString()}万円
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    過去の見積から選択
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'EST-20240315',
                        customer: '山田様',
                        date: '2024/03/15',
                        price: 2500000,
                      },
                      {
                        id: 'EST-20240310',
                        customer: '佐藤様',
                        date: '2024/03/10',
                        price: 1800000,
                      },
                      {
                        id: 'EST-20240305',
                        customer: '鈴木様',
                        date: '2024/03/05',
                        price: 3200000,
                      },
                    ].map((estimate, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500">
                              {estimate.id}
                            </div>
                            <h4 className="font-semibold text-gray-900">
                              {estimate.customer}
                            </h4>
                            <div className="mt-1 flex items-center gap-3 text-xs">
                              <span className="text-gray-600">
                                {estimate.date}
                              </span>
                              <span className="text-blue-600 font-medium">
                                ¥{(estimate.price / 10000).toLocaleString()}万円
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
