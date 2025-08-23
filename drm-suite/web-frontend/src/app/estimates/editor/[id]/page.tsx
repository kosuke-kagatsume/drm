'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
}

// セルの選択状態
interface CellSelection {
  row: number;
  col: string;
}

export default function EstimateEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const [items, setItems] = useState<EstimateItem[]>([
    {
      id: '1',
      no: 1,
      category: '仮設工事',
      itemName: '養生費',
      specification: '床・壁面養生',
      quantity: 1,
      unit: '式',
      unitPrice: 50000,
      amount: 50000,
      remarks: '',
    },
    {
      id: '2',
      no: 2,
      category: '解体工事',
      itemName: 'キッチン解体',
      specification: '既存キッチン撤去・処分',
      quantity: 1,
      unit: '式',
      unitPrice: 80000,
      amount: 80000,
      remarks: '廃材処分費込み',
    },
    {
      id: '3',
      no: 3,
      category: 'キッチン工事',
      itemName: 'システムキッチン',
      specification: 'LIXIL リシェルSI I型2550',
      quantity: 1,
      unit: '台',
      unitPrice: 650000,
      amount: 650000,
      remarks: '食洗機付き',
    },
  ]);

  const [selectedCell, setSelectedCell] = useState<CellSelection>({
    row: 0,
    col: 'category',
  });
  const [editingCell, setEditingCell] = useState<CellSelection | null>(null);
  const [copiedRows, setCopiedRows] = useState<EstimateItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    row: number;
  } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // カラム定義
  const columns = [
    { key: 'no', label: 'No.', width: '60px', type: 'number' },
    { key: 'category', label: 'カテゴリ', width: '120px', type: 'text' },
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

  // キーボードナビゲーション
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!editingCell) {
        const currentColIndex = columns.findIndex(
          (col) => col.key === selectedCell.col,
        );

        switch (e.key) {
          case 'Tab':
            e.preventDefault();
            if (e.shiftKey) {
              // Shift+Tab: 前のセルへ
              if (currentColIndex > 0) {
                setSelectedCell({
                  ...selectedCell,
                  col: columns[currentColIndex - 1].key,
                });
              } else if (selectedCell.row > 0) {
                setSelectedCell({
                  row: selectedCell.row - 1,
                  col: columns[columns.length - 1].key,
                });
              }
            } else {
              // Tab: 次のセルへ
              if (currentColIndex < columns.length - 1) {
                setSelectedCell({
                  ...selectedCell,
                  col: columns[currentColIndex + 1].key,
                });
              } else if (selectedCell.row < items.length - 1) {
                setSelectedCell({
                  row: selectedCell.row + 1,
                  col: columns[0].key,
                });
              }
            }
            break;

          case 'Enter':
            e.preventDefault();
            if (e.shiftKey) {
              // Shift+Enter: 上の行へ
              if (selectedCell.row > 0) {
                setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 });
              }
            } else {
              // Enter: 編集モードに入る or 下の行へ
              if (!columns.find((c) => c.key === selectedCell.col)?.readonly) {
                setEditingCell(selectedCell);
              } else if (selectedCell.row < items.length - 1) {
                setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 });
              }
            }
            break;

          case 'ArrowUp':
            e.preventDefault();
            if (selectedCell.row > 0) {
              setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 });
            }
            break;

          case 'ArrowDown':
            e.preventDefault();
            if (selectedCell.row < items.length - 1) {
              setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 });
            }
            break;

          case 'ArrowLeft':
            e.preventDefault();
            if (currentColIndex > 0) {
              setSelectedCell({
                ...selectedCell,
                col: columns[currentColIndex - 1].key,
              });
            }
            break;

          case 'ArrowRight':
            e.preventDefault();
            if (currentColIndex < columns.length - 1) {
              setSelectedCell({
                ...selectedCell,
                col: columns[currentColIndex + 1].key,
              });
            }
            break;

          case 'Delete':
            e.preventDefault();
            // 選択セルの値をクリア
            handleCellChange(selectedCell.row, selectedCell.col, '');
            break;

          case 'c':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              // コピー
              setCopiedRows([items[selectedCell.row]]);
            }
            break;

          case 'v':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              // ペースト
              if (copiedRows.length > 0) {
                const newItems = [...items];
                copiedRows.forEach((copiedItem, index) => {
                  if (selectedCell.row + index < newItems.length) {
                    newItems[selectedCell.row + index] = {
                      ...copiedItem,
                      id: String(Date.now() + index),
                      no: selectedCell.row + index + 1,
                    };
                  }
                });
                setItems(newItems);
              }
            }
            break;
        }
      }
    },
    [selectedCell, editingCell, items, copiedRows, columns],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // セルの値を更新
  const handleCellChange = (rowIndex: number, colKey: string, value: any) => {
    const newItems = [...items];
    const item = newItems[rowIndex];

    if (colKey === 'quantity' || colKey === 'unitPrice') {
      const numValue = parseFloat(value) || 0;
      (item as any)[colKey] = numValue;
      // 金額を自動計算
      item.amount = item.quantity * item.unitPrice;
    } else {
      (item as any)[colKey] = value;
    }

    setItems(newItems);
  };

  // 行追加
  const addRow = (index?: number) => {
    const newRow: EstimateItem = {
      id: String(Date.now()),
      no: index !== undefined ? index + 1 : items.length + 1,
      category: '',
      itemName: '',
      specification: '',
      quantity: 1,
      unit: '式',
      unitPrice: 0,
      amount: 0,
      remarks: '',
    };

    if (index !== undefined) {
      const newItems = [...items];
      newItems.splice(index, 0, newRow);
      // 番号を振り直し
      newItems.forEach((item, i) => (item.no = i + 1));
      setItems(newItems);
    } else {
      setItems([...items, newRow]);
    }
  };

  // 行削除
  const deleteRow = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // 番号を振り直し
    newItems.forEach((item, i) => (item.no = i + 1));
    setItems(newItems);
  };

  // 右クリックメニュー
  const handleContextMenu = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, row: rowIndex });
  };

  // 合計計算
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* ヘッダー */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  詳細見積編集
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  見積番号: {params.id}
                </p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <History className="w-4 h-4" />
                履歴
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
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
        {/* スプレッドシート */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => addRow()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  行追加
                </button>
                <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm">
                  <Copy className="w-4 h-4" />
                  コピー
                </button>
                <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4" />
                  検索
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Grid3x3 className="w-4 h-4" />
                <span>{items.length} 行</span>
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div ref={tableRef} className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-10"></th>
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
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, rowIndex) => (
                  <tr
                    key={item.id}
                    onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-2 py-2 text-center">
                      <button
                        onClick={() =>
                          setContextMenu({ x: 0, y: 0, row: rowIndex })
                        }
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ width: col.width, minWidth: col.width }}
                        className={`px-3 py-2 text-sm ${
                          selectedCell.row === rowIndex &&
                          selectedCell.col === col.key
                            ? 'ring-2 ring-blue-500 ring-inset'
                            : ''
                        } ${col.key === 'amount' ? 'text-right font-medium' : ''}`}
                        onClick={() => {
                          setSelectedCell({ row: rowIndex, col: col.key });
                          if (!col.readonly) {
                            setEditingCell({ row: rowIndex, col: col.key });
                          }
                        }}
                      >
                        {editingCell?.row === rowIndex &&
                        editingCell?.col === col.key ? (
                          <input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={(item as any)[col.key]}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                col.key,
                                e.target.value,
                              )
                            }
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Tab') {
                                e.preventDefault();
                                setEditingCell(null);
                              }
                            }}
                            className="w-full px-1 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={
                              col.key === 'amount' || col.key === 'unitPrice'
                                ? 'font-mono'
                                : ''
                            }
                          >
                            {col.key === 'amount' || col.key === 'unitPrice'
                              ? `¥${((item as any)[col.key] || 0).toLocaleString()}`
                              : (item as any)[col.key]}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 合計欄 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end items-center gap-8">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span>小計:</span>
                <span className="ml-4 font-mono font-medium">
                  ¥{calculateTotal().toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span>消費税 (10%):</span>
                <span className="ml-4 font-mono font-medium">
                  ¥{Math.floor(calculateTotal() * 0.1).toLocaleString()}
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                <span>合計:</span>
                <span className="ml-4 font-mono">
                  ¥{Math.floor(calculateTotal() * 1.1).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* キーボードショートカットヘルプ */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            キーボードショートカット
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700 dark:text-blue-300">
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                Tab
              </kbd>{' '}
              次のセル
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                Enter
              </kbd>{' '}
              編集/下へ
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                Ctrl+C
              </kbd>{' '}
              コピー
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                Ctrl+V
              </kbd>{' '}
              ペースト
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                Delete
              </kbd>{' '}
              クリア
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                矢印キー
              </kbd>{' '}
              移動
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                右クリック
              </kbd>{' '}
              メニュー
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded">
                Shift+Enter
              </kbd>{' '}
              上へ
            </div>
          </div>
        </div>
      </div>

      {/* 右クリックメニュー */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                onClick={() => {
                  addRow(contextMenu.row);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                行を上に挿入
              </button>
              <button
                onClick={() => {
                  addRow(contextMenu.row + 1);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                行を下に挿入
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={() => {
                  setCopiedRows([items[contextMenu.row]]);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                行をコピー
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={() => {
                  deleteRow(contextMenu.row);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                行を削除
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* テンプレートパネル */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  テンプレート選択
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    キッチンリフォーム標準
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    標準的なキッチンリフォーム工事一式
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    15項目 • ¥1,200,000
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    浴室リフォーム標準
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ユニットバス交換工事一式
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    12項目 • ¥800,000
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    トイレリフォーム
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    便器交換・内装工事
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    8項目 • ¥350,000
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
