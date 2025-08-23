'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  FileDown,
  Calculator,
  Building2,
  Wrench,
  Home,
  DollarSign,
  ArrowLeft,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';

// 資金計画の項目
interface FinancialItem {
  id: string;
  category: string;
  items: {
    name: string;
    amount: number;
  }[];
}

export default function FinancialPlanPage({
  params,
}: {
  params: { id: string };
}) {
  const [financialData, setFinancialData] = useState<FinancialItem[]>([
    {
      id: '1',
      category: '建築工事費',
      items: [
        { name: '本体工事費', amount: 20000000 },
        { name: '付帯工事費', amount: 3000000 },
        { name: '外構工事費', amount: 2000000 },
      ],
    },
    {
      id: '2',
      category: '諸費用',
      items: [
        { name: '登記費用', amount: 500000 },
        { name: '火災保険料', amount: 300000 },
        { name: '引越し費用', amount: 200000 },
        { name: '家具・家電', amount: 1000000 },
      ],
    },
    {
      id: '3',
      category: '土地関連費用',
      items: [
        { name: '土地購入費', amount: 15000000 },
        { name: '仲介手数料', amount: 500000 },
        { name: '印紙税', amount: 50000 },
      ],
    },
  ]);

  // 合計計算
  const calculateCategoryTotal = (items: { amount: number }[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateGrandTotal = () => {
    return financialData.reduce((total, category) => {
      return total + calculateCategoryTotal(category.items);
    }, 0);
  };

  // 項目の値を更新
  const updateItemAmount = (
    categoryId: string,
    itemIndex: number,
    amount: string,
  ) => {
    const newData = financialData.map((category) => {
      if (category.id === categoryId) {
        const newItems = [...category.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          amount: parseInt(amount) || 0,
        };
        return { ...category, items: newItems };
      }
      return category;
    });
    setFinancialData(newData);
  };

  // 項目追加
  const addItem = (categoryId: string) => {
    const newData = financialData.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: [...category.items, { name: '新規項目', amount: 0 }],
        };
      }
      return category;
    });
    setFinancialData(newData);
  };

  // 項目削除
  const deleteItem = (categoryId: string, itemIndex: number) => {
    const newData = financialData.map((category) => {
      if (category.id === categoryId) {
        const newItems = category.items.filter(
          (_, index) => index !== itemIndex,
        );
        return { ...category, items: newItems };
      }
      return category;
    });
    setFinancialData(newData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">資金計画書</h1>
                <p className="text-sm text-gray-600">見積番号: {params.id}</p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                詳細見積へ変換
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

      <div className="p-4 sm:p-6 lg:p-8">
        {/* メインコンテンツ */}
        <div className="max-w-6xl mx-auto">
          {/* 概要カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥{(calculateGrandTotal() / 10000).toLocaleString()}万円
                </span>
              </div>
              <p className="text-sm text-gray-600">総予算</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥
                  {(financialData[0]
                    ? calculateCategoryTotal(financialData[0].items) / 10000
                    : 0
                  ).toLocaleString()}
                  万円
                </span>
              </div>
              <p className="text-sm text-gray-600">建築工事費</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    financialData[0]
                      ? (calculateCategoryTotal(financialData[0].items) /
                          calculateGrandTotal()) *
                          100
                      : 0,
                  )}
                  %
                </span>
              </div>
              <p className="text-sm text-gray-600">建築費比率</p>
            </motion.div>
          </div>

          {/* カテゴリ別入力 */}
          <div className="space-y-6">
            {financialData.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {category.category === '建築工事費' && (
                      <Building2 className="w-5 h-5" />
                    )}
                    {category.category === '諸費用' && (
                      <Wrench className="w-5 h-5" />
                    )}
                    {category.category === '土地関連費用' && (
                      <Home className="w-5 h-5" />
                    )}
                    {category.category}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-4">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newData = [...financialData];
                            newData[categoryIndex].items[itemIndex].name =
                              e.target.value;
                            setFinancialData(newData);
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="項目名"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">¥</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) =>
                              updateItemAmount(
                                category.id,
                                itemIndex,
                                e.target.value,
                              )
                            }
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                            placeholder="0"
                          />
                        </div>
                        <button
                          onClick={() => deleteItem(category.id, itemIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => addItem(category.id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      項目追加
                    </button>
                    <div className="text-lg font-bold text-gray-900">
                      小計: ¥
                      {calculateCategoryTotal(category.items).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 合計表示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">総合計</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ¥{calculateGrandTotal().toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">坪単価（40坪想定）</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{Math.round(calculateGrandTotal() / 40).toLocaleString()}/坪
                </p>
              </div>
            </div>
          </motion.div>

          {/* ヒント */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 ヒント:
              この資金計画書は後から詳細見積に変換できます。各項目をクリックして金額を編集してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
