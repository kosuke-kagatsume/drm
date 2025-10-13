'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  User,
  TrendingUp,
  Eye,
  Plus,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { getAllPlans } from '@/lib/financial-plans-storage';
import type { FinancialPlanVersion } from '@/types/financial-plan';

export default function FinancialPlansListPage() {
  const [plans, setPlans] = useState<FinancialPlanVersion[]>([]);
  const [groupedPlans, setGroupedPlans] = useState<
    Record<string, FinancialPlanVersion[]>
  >({});

  useEffect(() => {
    // localStorageから全プランを取得
    const allPlans = getAllPlans();
    setPlans(allPlans);

    // 顧客ごとにグループ化
    const grouped = allPlans.reduce(
      (acc, plan) => {
        if (!acc[plan.customerId]) {
          acc[plan.customerId] = [];
        }
        acc[plan.customerId].push(plan);
        return acc;
      },
      {} as Record<string, FinancialPlanVersion[]>,
    );

    // 各グループ内でバージョン番号順にソート
    Object.keys(grouped).forEach((customerId) => {
      grouped[customerId].sort((a, b) => b.versionNumber - a.versionNumber);
    });

    setGroupedPlans(grouped);
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: '下書き', color: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: '提出済み', color: 'bg-green-100 text-green-700' },
      approved: { label: '承認済み', color: 'bg-blue-100 text-blue-700' },
      superseded: { label: '旧版', color: 'bg-gray-100 text-gray-500' },
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getLatestVersion = (versions: FinancialPlanVersion[]) => {
    return versions.reduce((latest, current) =>
      current.versionNumber > latest.versionNumber ? current : latest,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">資金計画書</h1>
              <p className="text-sm text-gray-600">
                顧客別のバージョン管理と比較
              </p>
            </div>
            <a
              href="/estimates/financial/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規作成
            </a>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <User className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {Object.keys(groupedPlans).length}
                </span>
              </div>
              <p className="text-sm text-gray-600">顧客数</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {plans.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">総バージョン数</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">
                  ¥
                  {plans.length > 0
                    ? Math.round(
                        plans.reduce((sum, plan) => sum + plan.totalAmount, 0) /
                          plans.length /
                          10000,
                      )
                    : 0}
                  万
                </span>
              </div>
              <p className="text-sm text-gray-600">平均総額</p>
            </motion.div>
          </div>

          {/* 顧客別カード */}
          {Object.keys(groupedPlans).length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                資金計画書がありません
              </h3>
              <p className="text-gray-600 mb-6">
                新規作成ボタンから最初の資金計画書を作成しましょう
              </p>
              <a
                href="/estimates/financial/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                新規作成
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPlans).map(
                ([customerId, versions], index) => {
                  const latest = getLatestVersion(versions);
                  return (
                    <motion.div
                      key={customerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                    >
                      {/* 顧客情報ヘッダー */}
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                              <User className="w-5 h-5" />
                              {latest.customerName}
                            </h2>
                            <p className="text-sm text-blue-100 mt-1">
                              {versions.length}個のバージョン
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-blue-100">最新版総額</p>
                            <p className="text-2xl font-bold text-white">
                              ¥{latest.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* バージョン一覧 */}
                      <div className="p-6">
                        <div className="space-y-3">
                          {versions.map((version) => {
                            const badge = getStatusBadge(version.status);
                            return (
                              <a
                                key={version.id}
                                href={`/estimates/financial/${version.id.replace('fp-', '')}`}
                                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-lg font-bold text-blue-600">
                                          v{version.versionNumber}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">
                                          {version.versionLabel}
                                        </h3>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}
                                        >
                                          {badge.label}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(
                                          version.createdAt,
                                        ).toLocaleString('ja-JP', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                      {version.changeNote && (
                                        <p className="text-sm text-gray-500 mt-1">
                                          📝 {version.changeNote}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">
                                        総額
                                      </p>
                                      <p className="text-lg font-bold text-gray-900">
                                        ¥{version.totalAmount.toLocaleString()}
                                      </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>

                        {/* バージョン比較ボタン（2つ以上ある場合） */}
                        {versions.length >= 2 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <a
                              href={`/estimates/financial/${versions[0].id.replace('fp-', '')}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              最新版で比較機能を使う
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
