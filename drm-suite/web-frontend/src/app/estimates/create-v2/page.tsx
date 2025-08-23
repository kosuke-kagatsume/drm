'use client';

import { useState } from 'react';
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

// 見積タイプの定義
const ESTIMATE_TYPES = [
  {
    id: 'detailed',
    title: '詳細見積',
    subtitle: 'Excel型で細かく積み上げ',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-500',
    description:
      '工事明細を詳細に作成。Tab/Enterキー操作、テンプレート呼び出し可能',
  },
  {
    id: 'financial',
    title: '資金計画書',
    subtitle: '新築住宅向けざっくり見積',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    description: '大項目での簡易見積。後から詳細化も可能',
  },
  {
    id: 'master',
    title: 'マスター連携',
    subtitle: 'メーカー品番から自動計算',
    icon: Package,
    color: 'from-green-500 to-emerald-500',
    description: '住設機器・水回りの一括登録。CSVインポート対応',
  },
];

export default function CreateEstimateV2Page() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customerMode, setCustomerMode] = useState<'existing' | 'quick' | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* ヘッダー */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                新規見積作成
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                用途に合わせて最適な見積タイプを選択してください
              </p>
            </div>

            {/* AI アシスタント表示 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full"
            >
              <Sparkles className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
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
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
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
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    既存顧客から選択
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    クイック作成
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm">
                  2
                </span>
                見積タイプ選択
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-90`}
                      />

                      {/* ガラスモーフィズム効果 */}
                      <div className="relative p-6 bg-white/10 backdrop-blur-sm">
                        <div className="flex flex-col items-center text-white">
                          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md mb-4">
                            <Icon className="w-10 h-10" />
                          </div>
                          <h3 className="text-xl font-bold mb-1">
                            {type.title}
                          </h3>
                          <p className="text-sm opacity-90 mb-3">
                            {type.subtitle}
                          </p>
                          <p className="text-xs opacity-75 text-center">
                            {type.description}
                          </p>
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
        className="fixed bottom-8 right-8"
      >
        <button className="p-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
          <Sparkles className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
}
