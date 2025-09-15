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
  Banknote,
  FileText,
  PiggyBank,
  CreditCard,
} from 'lucide-react';

// 資金計画の項目
interface FinancialItem {
  id: string;
  category: string;
  items: {
    name: string;
    amount: number;
    note?: string;
  }[];
}

// ローン情報
interface LoanInfo {
  borrowingAmount: number;
  selfFund: number;
  monthlyPayment: number;
  bonus: number;
  years: number;
  rate: number;
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
        { name: '本体工事費', amount: 20000000, note: '建物本体の工事費用' },
        { name: '設計料', amount: 1000000, note: '設計・監理費用' },
        { name: '屋外給排水工事', amount: 1500000 },
        { name: '仮設工事', amount: 500000 },
        { name: '解体工事', amount: 0 },
        { name: '地盤改良工事', amount: 0 },
        { name: '外構工事', amount: 2000000 },
        { name: 'カーテン・照明', amount: 500000 },
        { name: '空調工事', amount: 1000000 },
        { name: '太陽光発電システム', amount: 0 },
      ],
    },
    {
      id: '2',
      category: '諸費用',
      items: [
        { name: '印紙税', amount: 20000, note: '請負契約書' },
        { name: '登録免許税', amount: 150000, note: '建物表示・保存登記' },
        { name: '不動産取得税', amount: 0 },
        { name: '司法書士報酬', amount: 100000 },
        { name: '融資手数料', amount: 50000 },
        { name: '保証料', amount: 600000 },
        { name: '火災保険料', amount: 300000, note: '10年一括' },
        { name: '地震保険料', amount: 150000, note: '5年一括' },
        { name: '引越し費用', amount: 200000 },
        { name: '家具・家電', amount: 1000000 },
        { name: '地鎮祭・上棟式', amount: 150000 },
        { name: 'その他', amount: 200000 },
      ],
    },
    {
      id: '3',
      category: '土地費用',
      items: [
        { name: '土地購入費', amount: 15000000 },
        { name: '仲介手数料', amount: 500000, note: '土地価格の3%+6万円' },
        { name: '印紙税', amount: 10000, note: '売買契約書' },
        { name: '登録免許税', amount: 300000, note: '所有権移転登記' },
        { name: '不動産取得税', amount: 200000 },
        { name: '司法書士報酬', amount: 80000 },
        { name: '固定資産税清算金', amount: 50000 },
      ],
    },
  ]);

  const [loanInfo, setLoanInfo] = useState<LoanInfo>({
    borrowingAmount: 35000000,
    selfFund: 10000000,
    monthlyPayment: 95000,
    bonus: 0,
    years: 35,
    rate: 0.5,
  });

  // 合計計算
  const calculateCategoryTotal = (items: { amount: number }[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateGrandTotal = () => {
    return financialData.reduce((total, category) => {
      return total + calculateCategoryTotal(category.items);
    }, 0);
  };

  // 建築工事費のみの合計
  const calculateConstructionTotal = () => {
    const construction = financialData.find(cat => cat.category === '建築工事費');
    return construction ? calculateCategoryTotal(construction.items) : 0;
  };

  // 月々の返済額を計算（簡易版）
  const calculateMonthlyPayment = () => {
    const principal = loanInfo.borrowingAmount;
    const monthlyRate = loanInfo.rate / 100 / 12;
    const months = loanInfo.years * 12;
    
    if (monthlyRate === 0) return Math.round(principal / months);
    
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
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

  // 項目名を更新
  const updateItemName = (
    categoryId: string,
    itemIndex: number,
    name: string,
  ) => {
    const newData = financialData.map((category) => {
      if (category.id === categoryId) {
        const newItems = [...category.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          name: name,
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
          items: [...category.items, { name: '新規項目', amount: 0, note: '' }],
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
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">初回資金計画書</h1>
                <p className="text-sm text-gray-600">見積番号: EST-{params.id}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥{(calculateGrandTotal() / 10000).toLocaleString()}万
                </span>
              </div>
              <p className="text-sm text-gray-600">総費用</p>
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
                  ¥{(calculateConstructionTotal() / 10000).toLocaleString()}万
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
                <CreditCard className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥{(loanInfo.borrowingAmount / 10000).toLocaleString()}万
                </span>
              </div>
              <p className="text-sm text-gray-600">借入金額</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Banknote className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥{calculateMonthlyPayment().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">月々返済額（概算）</p>
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
                      <div key={itemIndex} className="">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItemName(
                                category.id,
                                itemIndex,
                                e.target.value,
                              )
                            }
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
                              className="w-36 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
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
                        {item.note && (
                          <p className="text-xs text-gray-500 mt-1 ml-2">{item.note}</p>
                        )}
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

          {/* ローン情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                資金計画
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    借入金額
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={loanInfo.borrowingAmount}
                      onChange={(e) =>
                        setLoanInfo({
                          ...loanInfo,
                          borrowingAmount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-600">円</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自己資金
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={loanInfo.selfFund}
                      onChange={(e) =>
                        setLoanInfo({
                          ...loanInfo,
                          selfFund: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-600">円</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    返済年数
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={loanInfo.years}
                      onChange={(e) =>
                        setLoanInfo({
                          ...loanInfo,
                          years: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-600">年</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    金利（年率）
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={loanInfo.rate}
                      onChange={(e) =>
                        setLoanInfo({
                          ...loanInfo,
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ボーナス返済
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={loanInfo.bonus}
                      onChange={(e) =>
                        setLoanInfo({
                          ...loanInfo,
                          bonus: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-600">円/回</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 合計表示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">総費用</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ¥{calculateGrandTotal().toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">建物本体価格</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥{(financialData[0]?.items[0]?.amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Home className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">坪単価（40坪想定）</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥{Math.round((financialData[0]?.items[0]?.amount || 0) / 40).toLocaleString()}/坪
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ヒント */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 ヒント:
              この資金計画書は初回お打ち合わせ時の概算です。詳細な見積もりは設計が進んでから作成いたします。
            </p>
          </div>

          {/* 注意事項 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">ご確認事項</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 上記金額は概算であり、詳細設計により変動する場合があります</li>
              <li>• 地盤改良工事は地盤調査後に金額が確定します</li>
              <li>• 外構工事は別途お打ち合わせの上、詳細を決定いたします</li>
              <li>• 金利は変動する可能性があります</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
