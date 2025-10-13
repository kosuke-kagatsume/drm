'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  History,
  GitCompare,
  Copy,
  Eye,
  Check,
} from 'lucide-react';
import type { FinancialPlanVersion } from '@/types/financial-plan';

// 資金計画の項目
interface FinancialItem {
  id: string;
  category: string;
  subtotalLabel?: string; // 小計①、小計②など
  color?: string; // カテゴリカラー
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
  // バージョン管理用のstate
  const [versions, setVersions] = useState<FinancialPlanVersion[]>([]);
  const [currentVersion, setCurrentVersion] =
    useState<FinancialPlanVersion | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // 坪単価計算用のstate
  const [buildingArea, setBuildingArea] = useState(40); // 施工面積（坪）
  const [unitPrice, setUnitPrice] = useState(500000); // 坪単価（円/坪）

  const [financialData, setFinancialData] = useState<FinancialItem[]>([
    {
      id: '1',
      category: '建物本体工事',
      subtotalLabel: '小計①',
      color: 'from-orange-500 to-amber-500',
      items: [
        {
          name: '本体工事費',
          amount: 20000000,
          note: '施工面積 40坪 × 坪単価 ¥500,000',
        },
        { name: '平屋構造', amount: 718200 },
        { name: 'その他本体工事', amount: 0 },
      ],
    },
    {
      id: '2',
      category: '建築申請・その他業務諸費用',
      subtotalLabel: '小計②',
      color: 'from-blue-500 to-cyan-500',
      items: [
        { name: '確認申請費用・設計費込', amount: 500000, note: '一式' },
        { name: '地盤調査費', amount: 100000, note: '一式' },
        { name: '残土撤去処分費', amount: 270000, note: '一式' },
        { name: '第三者検査機構（JIO）', amount: 250000, note: '一式' },
        { name: '耐震等級３検査証明費', amount: 0 },
        { name: '長期優良住宅', amount: 0 },
        { name: '省エネ検査証明書費用', amount: 200000, note: '一式' },
        { name: 'その他申請費用', amount: 0, note: '一式' },
      ],
    },
    {
      id: '3',
      category: '付帯工事費',
      subtotalLabel: '小計③',
      color: 'from-green-500 to-emerald-500',
      items: [
        { name: '仮設工事費', amount: 200000, note: '一式' },
        { name: '屋外給水設備工事', amount: 370000, note: '一式' },
        { name: '屋外排水設備工事', amount: 450000, note: '一式' },
        { name: '屋外雨水設備工事', amount: 450000, note: '一式' },
        { name: '屋外電気工事', amount: 370000, note: '一式' },
        { name: '工事管理費', amount: 200000, note: '一式' },
        {
          name: '材料搬入費及び残材産業廃棄物処理費',
          amount: 560000,
          note: '一式',
        },
        { name: '原材料価格調整費', amount: 80100, note: '一式' },
      ],
    },
    {
      id: '4',
      category: '標準仕様外工事費・その他工事費',
      subtotalLabel: '',
      color: 'from-purple-500 to-pink-500',
      items: [
        { name: '解体工事費', amount: 0, note: '概算・一式' },
        { name: '深（高）基礎工事費', amount: 0, note: '概算・一式' },
        { name: '外構アプローチ費', amount: 0, note: '概算・一式' },
        { name: '地盤改良費', amount: 700000, note: '概算・一式' },
        { name: '狭小地外壁内張り工事費', amount: 0, note: '概算・一式' },
        { name: '水道接続工事費', amount: 220000, note: '概算・一式' },
        { name: '制震ダンパー設置工事費', amount: 500000, note: '一式' },
        { name: 'オール電化仕様', amount: 450000, note: '概算・一式' },
        { name: '地鎮祭費用', amount: 0, note: '一式' },
        { name: '浄化槽設置工事費', amount: 0, note: '概算・一式' },
        { name: '上（下）水道引込工事費', amount: 0, note: '概算・一式' },
        { name: '上下水道加入金・受益者負担金', amount: 0, note: '一式' },
        { name: '雨水管引込工事費', amount: 0, note: '概算・一式' },
        { name: '外構工事費', amount: 700000, note: '概算・一式' },
        { name: 'その他オプション費', amount: 0, note: '一式' },
        {
          name: '図面オプション費（請負契約時）',
          amount: 500000,
          note: '一式',
        },
        { name: '予備費（オプション・その他）', amount: 0 },
      ],
    },
    {
      id: '5',
      category: '土地購入費',
      subtotalLabel: '',
      color: 'from-yellow-500 to-orange-500',
      items: [
        { name: '土地代金', amount: 0, note: '税込' },
        { name: '仲介手数料', amount: 0, note: '税込' },
      ],
    },
    {
      id: '6',
      category: '諸費用',
      subtotalLabel: '小計④',
      color: 'from-indigo-500 to-purple-500',
      items: [
        {
          name: '印紙税（工事請負契約書・土地売買契約書）',
          amount: 20000,
          note: '概算',
        },
        { name: '建物登記費用', amount: 250000, note: '概算' },
        { name: '土地登記費用', amount: 350000, note: '概算' },
        { name: '分筆及び農地転用・地目変更費用', amount: 0 },
        { name: '火災保険料（5年）', amount: 180000, note: '概算' },
        { name: '地震保険（5年）', amount: 90000, note: '概算' },
        { name: '仮測量・滅失・表示登記費用', amount: 250000, note: '概算' },
        { name: '固定資産税', amount: 100000, note: '概算' },
        { name: '印紙税（住宅ローン契約書用）', amount: 40000 },
        { name: '融資事務手数料', amount: 165000 },
        { name: 'ローン保証料', amount: 850000 },
        { name: '繋ぎ手数料', amount: 0 },
        { name: '団信生命保険特約料（フラット35の場合）', amount: 0 },
        { name: '適合証明検査料（フラット35の場合）', amount: 0 },
        { name: '銀行手数料', amount: 0 },
        { name: '車のローン', amount: 0 },
        { name: '43条但し書き申請費用', amount: 0, note: '概算' },
      ],
    },
    {
      id: '7',
      category: '預り金清算・特別値引き',
      subtotalLabel: '小計⑤',
      color: 'from-red-500 to-pink-500',
      items: [{ name: '申込金', amount: 0, note: '入金日：' }],
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

  // バージョン一覧を取得
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch('/api/financial-plans?customerId=cust-1');
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
          // 現在のバージョンを設定（params.idに基づいて）
          const current = data.find(
            (v: FinancialPlanVersion) => v.id === `fp-${params.id}`,
          );
          if (current) {
            setCurrentVersion(current);
            // データをロード
            setBuildingArea(current.buildingArea);
            setUnitPrice(current.unitPrice);
            setLoanInfo(current.loanInfo);
            if (current.financialData.length > 0) {
              setFinancialData(current.financialData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      }
    };

    fetchVersions();
  }, [params.id]);

  // 坪単価計算：施工面積 × 坪単価 → 本体工事費を自動更新
  useEffect(() => {
    const calculatedAmount = buildingArea * unitPrice;

    setFinancialData((prevData) =>
      prevData.map((category) => {
        if (category.id === '1' && category.items.length > 0) {
          // 建築工事費の最初の項目（本体工事費）を更新
          const updatedItems = [...category.items];
          updatedItems[0] = {
            ...updatedItems[0],
            amount: calculatedAmount,
            note: `施工面積 ${buildingArea}坪 × 坪単価 ¥${unitPrice.toLocaleString()}`,
          };
          return { ...category, items: updatedItems };
        }
        return category;
      }),
    );
  }, [buildingArea, unitPrice]);

  // 合計計算
  const calculateCategoryTotal = (items: { amount: number }[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateGrandTotal = () => {
    return financialData.reduce((total, category) => {
      return total + calculateCategoryTotal(category.items);
    }, 0);
  };

  // 総工事費（小計①②③の合計）
  const calculateConstructionTotal = () => {
    const categories = financialData.filter((cat) =>
      ['1', '2', '3'].includes(cat.id),
    );
    return categories.reduce(
      (total, cat) => total + calculateCategoryTotal(cat.items),
      0,
    );
  };

  // 請負金額（総工事費A）
  const calculateContractAmount = () => {
    return calculateConstructionTotal();
  };

  // その他工事費B
  const calculateOtherConstructionTotal = () => {
    const otherConstruction = financialData.find((cat) => cat.id === '4');
    return otherConstruction
      ? calculateCategoryTotal(otherConstruction.items)
      : 0;
  };

  // 土地購入費C
  const calculateLandTotal = () => {
    const land = financialData.find((cat) => cat.id === '5');
    return land ? calculateCategoryTotal(land.items) : 0;
  };

  // 諸費用（小計④）
  const calculateExpensesTotal = () => {
    const expenses = financialData.find((cat) => cat.id === '6');
    return expenses ? calculateCategoryTotal(expenses.items) : 0;
  };

  // 建物総額（A + B）
  const calculateBuildingTotal = () => {
    return calculateContractAmount() + calculateOtherConstructionTotal();
  };

  // 月々の返済額を計算（簡易版）
  const calculateMonthlyPayment = () => {
    const principal = loanInfo.borrowingAmount;
    const monthlyRate = loanInfo.rate / 100 / 12;
    const months = loanInfo.years * 12;

    if (monthlyRate === 0) return Math.round(principal / months);

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
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

  // バージョンナビゲーション
  const goToPreviousVersion = () => {
    if (!currentVersion) return;
    const currentIndex = versions.findIndex((v) => v.id === currentVersion.id);
    if (currentIndex > 0) {
      const prevVersion = versions[currentIndex - 1];
      window.location.href = `/estimates/financial/${prevVersion.id.replace('fp-', '')}`;
    }
  };

  const goToNextVersion = () => {
    if (!currentVersion) return;
    const currentIndex = versions.findIndex((v) => v.id === currentVersion.id);
    if (currentIndex < versions.length - 1) {
      const nextVersion = versions[currentIndex + 1];
      window.location.href = `/estimates/financial/${nextVersion.id.replace('fp-', '')}`;
    }
  };

  const hasNextVersion = () => {
    if (!currentVersion) return false;
    const currentIndex = versions.findIndex((v) => v.id === currentVersion.id);
    return currentIndex < versions.length - 1;
  };

  const hasPreviousVersion = () => {
    if (!currentVersion) return false;
    const currentIndex = versions.findIndex((v) => v.id === currentVersion.id);
    return currentIndex > 0;
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentVersion?.customerName || ''}様邸 資金計画書
                </h1>
                <p className="text-sm text-gray-600">
                  見積番号: EST-{params.id}
                </p>
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

          {/* バージョンナビゲーション */}
          {currentVersion && versions.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3">
                {/* 前へボタン */}
                <button
                  onClick={goToPreviousVersion}
                  disabled={!hasPreviousVersion()}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    hasPreviousVersion()
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">前へ</span>
                </button>

                {/* バージョンタイムライン */}
                <div className="flex items-center gap-2">
                  {versions.map((version, index) => (
                    <button
                      key={version.id}
                      onClick={() =>
                        (window.location.href = `/estimates/financial/${version.id.replace('fp-', '')}`)
                      }
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        version.id === currentVersion.id
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {version.status === 'draft' && '📝'}
                      {version.status === 'submitted' && '✅'}
                      {version.status === 'approved' && '👁️'}
                      {version.status === 'superseded' && '📄'}{' '}
                      {version.versionLabel}
                      {version.id === currentVersion.id && (
                        <span className="ml-2 text-xs">(現在)</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* 次へボタン */}
                <button
                  onClick={goToNextVersion}
                  disabled={!hasNextVersion()}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    hasNextVersion()
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="text-sm">次へ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* バージョン管理ボタン */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <History className="w-4 h-4" />
                  履歴
                </button>
                <button
                  onClick={() => setShowCompareModal(true)}
                  disabled={versions.length < 2}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitCompare className="w-4 h-4" />
                  比較
                </button>
                <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm">
                  <Copy className="w-4 h-4" />
                  新バージョン作成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* メインコンテンツ */}
        <div className="max-w-6xl mx-auto">
          {/* 坪単価計算セクション */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-xl p-6 text-white"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              坪単価計算（新築住宅）
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  施工面積（坪）
                </label>
                <input
                  type="number"
                  value={buildingArea}
                  onChange={(e) =>
                    setBuildingArea(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 text-lg font-semibold"
                  placeholder="40"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  坪単価（円/坪）
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 text-lg font-semibold"
                  placeholder="500000"
                  step="10000"
                />
              </div>
              <div className="flex items-end">
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-lg p-3 border-2 border-white/50">
                  <p className="text-xs text-blue-100 mb-1">
                    本体工事費（自動計算）
                  </p>
                  <p className="text-2xl font-bold">
                    ¥{(buildingArea * unitPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

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
              <p className="text-sm text-gray-600">総額</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥{(calculateContractAmount() / 10000).toLocaleString()}万
                </span>
              </div>
              <p className="text-sm text-gray-600">総工事費合計（A）</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Wrench className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  ¥{(calculateBuildingTotal() / 10000).toLocaleString()}万
                </span>
              </div>
              <p className="text-sm text-gray-600">建物総額（A+B）</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <Banknote className="w-8 h-8 text-green-600" />
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
                <div className={`bg-gradient-to-r ${category.color} px-6 py-4`}>
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {category.id === '1' && <Building2 className="w-5 h-5" />}
                      {category.id === '2' && <FileText className="w-5 h-5" />}
                      {category.id === '3' && <Wrench className="w-5 h-5" />}
                      {category.id === '4' && (
                        <TrendingUp className="w-5 h-5" />
                      )}
                      {category.id === '5' && <Home className="w-5 h-5" />}
                      {category.id === '6' && (
                        <DollarSign className="w-5 h-5" />
                      )}
                      {category.id === '7' && <PiggyBank className="w-5 h-5" />}
                      {category.category}
                    </span>
                    {category.subtotalLabel && (
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        {category.subtotalLabel}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => {
                      // 本体工事費（建築工事費の最初の項目）は自動計算
                      const isAutoCalculated =
                        category.id === '1' && itemIndex === 0;

                      return (
                        <div key={itemIndex} className="">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 flex items-center gap-2">
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
                                disabled={isAutoCalculated}
                              />
                              {isAutoCalculated && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1">
                                  <Calculator className="w-3 h-3" />
                                  自動計算
                                </span>
                              )}
                            </div>
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
                                className={`w-36 px-4 py-2 border rounded-lg text-right ${
                                  isAutoCalculated
                                    ? 'border-blue-300 bg-blue-50 text-blue-900 font-semibold cursor-not-allowed'
                                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                }`}
                                placeholder="0"
                                disabled={isAutoCalculated}
                              />
                            </div>
                            <button
                              onClick={() => deleteItem(category.id, itemIndex)}
                              className={`p-2 rounded-lg transition-colors ${
                                isAutoCalculated
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              disabled={isAutoCalculated}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.note && (
                            <p className="text-xs text-gray-500 mt-1 ml-2">
                              {item.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
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

          {/* 合計表示（PDF形式） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                総額計算
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">
                    総工事費合計（税込）A
                  </span>
                  <span className="text-xl font-bold text-orange-600">
                    ¥{calculateContractAmount().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">
                    その他工事費（税込）B
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    ¥{calculateOtherConstructionTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">
                    土地購入費 C
                  </span>
                  <span className="text-xl font-bold text-yellow-600">
                    ¥{calculateLandTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700 font-medium">
                    諸費用 小計④
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    ¥{calculateExpensesTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-blue-50 -mx-6 px-6 mt-4">
                  <span className="text-lg font-bold text-gray-900">総額</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ¥{calculateGrandTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 追加の重要金額 */}
              <div className="mt-6 pt-6 border-t-2 border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                    <p className="text-sm text-orange-700 mb-1">
                      請負金額（朱色）
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      ¥{calculateContractAmount().toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-green-700 mb-1">
                      建物総額（A + B）
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{calculateBuildingTotal().toLocaleString()}
                    </p>
                  </div>
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
              <li>
                • 上記金額は概算であり、詳細設計により変動する場合があります
              </li>
              <li>• 地盤改良工事は地盤調査後に金額が確定します</li>
              <li>• 外構工事は別途お打ち合わせの上、詳細を決定いたします</li>
              <li>• 金利は変動する可能性があります</li>
            </ul>
          </div>
        </div>
      </div>

      {/* バージョン履歴サイドパネル */}
      <AnimatePresence>
        {showVersionHistory && (
          <>
            {/* オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVersionHistory(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* サイドパネル */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    バージョン履歴
                  </h2>
                  <button
                    onClick={() => setShowVersionHistory(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* バージョンリスト */}
                <div className="space-y-3">
                  {versions.map((version, index) => {
                    const isCurrent = version.id === currentVersion?.id;
                    return (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (!isCurrent) {
                            window.location.href = `/estimates/financial/${version.id.replace('fp-', '')}`;
                          }
                        }}
                      >
                        {/* ステータスバッジ */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              version.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-700'
                                : version.status === 'submitted'
                                  ? 'bg-green-100 text-green-700'
                                  : version.status === 'approved'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {version.status === 'draft' && '📝 下書き'}
                            {version.status === 'submitted' && '✅ 提出済み'}
                            {version.status === 'approved' && '👁️ 承認済み'}
                            {version.status === 'superseded' && '📄 旧版'}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                              現在
                            </span>
                          )}
                        </div>

                        {/* バージョン情報 */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {version.versionLabel}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(version.createdAt).toLocaleString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {/* 変更メモ */}
                        {version.changeNote && (
                          <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg mb-2">
                            {version.changeNote}
                          </p>
                        )}

                        {/* 総額 */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">総額</span>
                          <span className="text-lg font-bold text-gray-900">
                            ¥{version.totalAmount.toLocaleString()}
                          </span>
                        </div>

                        {/* 差分表示 */}
                        {index < versions.length - 1 && (
                          <div className="mt-2 text-xs text-gray-500">
                            前回から{' '}
                            <span
                              className={
                                version.totalAmount -
                                  versions[index + 1].totalAmount >
                                0
                                  ? 'text-red-600 font-semibold'
                                  : 'text-green-600 font-semibold'
                              }
                            >
                              {version.totalAmount -
                                versions[index + 1].totalAmount >
                              0
                                ? '+'
                                : ''}
                              ¥
                              {(
                                version.totalAmount -
                                versions[index + 1].totalAmount
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
