'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  FileText,
  Package,
  ChevronRight,
  Sparkles,
  Clock,
  Users,
  Building,
} from 'lucide-react';

// 見積タイプの定義（マスター連携は詳細見積に統合）
const ESTIMATE_TYPES = [
  {
    id: 'detailed',
    title: '詳細見積',
    subtitle: 'Excel型で細かく積み上げ',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-500',
    description:
      '工事明細を詳細に作成。Tab/Enterキー操作、テンプレート呼び出し可能',
    features: [
      'マスター連携',
      'メーカー品番から自動計算',
      '住設機器・水回りの一括登録',
      'CSVインポート対応',
    ],
  },
  {
    id: 'financial',
    title: '資金計画書',
    subtitle: '新築住宅向けざっくり見積',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    description: '大項目での簡易見積。後から詳細化も可能',
  },
];

export default function CreateEstimateV2Page() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customerMode, setCustomerMode] = useState<'existing' | 'quick' | null>(
    null,
  );
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                新規見積作成
              </h1>
              <p className="mt-2 text-gray-600">
                用途に合わせて最適な見積タイプを選択してください
              </p>
            </div>

            {/* AI アシスタント表示 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                AIアシスタント待機中
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: 顧客選択 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm">
              1
            </span>
            顧客選択
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 既存顧客選択 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCustomerMode('existing')}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                customerMode === 'existing'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">
                    既存顧客から選択
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    登録済みの顧客情報を使用
                  </p>
                </div>
                {customerMode === 'existing' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>

            {/* クイック作成 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCustomerMode('quick')}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                customerMode === 'quick'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">クイック作成</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    後で顧客登録（リマインダー付き）
                  </p>
                </div>
                {customerMode === 'quick' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Step 2: 見積タイプ選択 */}
        <AnimatePresence>
          {customerMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm">
                  2
                </span>
                見積タイプ選択
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ESTIMATE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`relative overflow-hidden rounded-2xl transition-all ${
                        selectedType === type.id
                          ? 'ring-4 ring-offset-2 ring-blue-500'
                          : ''
                      }`}
                    >
                      {/* グラデーション背景 */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${type.color}`}
                      />

                      {/* ガラスモーフィズム効果 */}
                      <div className="relative p-6 bg-black/10 backdrop-blur-sm">
                        <div className="flex flex-col items-center text-white">
                          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md mb-4">
                            <Icon className="w-10 h-10" />
                          </div>
                          <h3 className="text-xl font-bold mb-1">
                            {type.title}
                          </h3>
                          <p className="text-sm text-white/90 mb-3">
                            {type.subtitle}
                          </p>
                          <p className="text-xs text-white/90 text-center">
                            {type.description}
                          </p>
                          {type.features && (
                            <div className="mt-3 pt-3 border-t border-white/20">
                              <p className="text-xs font-semibold mb-2 text-white">
                                含まれる機能:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {type.features.map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 bg-white/40 rounded-full text-white font-semibold"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedType === type.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4"
                          >
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 次へボタン */}
        <AnimatePresence>
          {customerMode && selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // 見積タイプに応じて適切なページへ遷移
                  const estimateId = `EST-${Date.now()}`;
                  if (selectedType === 'detailed') {
                    router.push(`/estimates/editor/${estimateId}`);
                  } else if (selectedType === 'financial') {
                    // 資金計画書用のエディタへ（今後実装）
                    router.push(`/estimates/financial/${estimateId}`);
                  }
                }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
              >
                見積作成を開始
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* フローティングヘルプ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <button className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
          <Sparkles className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
}
