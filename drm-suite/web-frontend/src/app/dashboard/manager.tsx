'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTeamPerformance } from '@/hooks/useTeamPerformance';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useCustomers } from '@/hooks/useCustomers';
import { useEstimates } from '@/hooks/useEstimates';

interface ManagerDashboardProps {
  userEmail: string;
}

export default function ManagerDashboard({ userEmail }: ManagerDashboardProps) {
  const router = useRouter();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [branchKPI, setBranchKPI] = useState({
    grossProfit: 0,
    targetProfit: 25,
    contracts: 0,
    targetContracts: 50,
    pendingApprovals: 0,
    delayedProjects: 0,
  });

  // Fetch real data
  const { performance, loading: performanceLoading } = useTeamPerformance({
    autoFetch: true,
  });
  const {
    approvals,
    loading: approvalsLoading,
    approveItem,
    rejectItem,
  } = usePendingApprovals({ autoFetch: true });
  const { metrics: financialMetrics } = useFinancialMetrics({
    autoFetch: true,
  });
  const { customers } = useCustomers({ autoFetch: true });
  const { estimates } = useEstimates({ autoFetch: true });

  // Update KPIs based on real data
  useEffect(() => {
    if (performance && financialMetrics && approvals) {
      setBranchKPI({
        grossProfit: financialMetrics.profit.margin || 0,
        targetProfit: 25,
        contracts: performance.totalContracts || 0,
        targetContracts: 50,
        pendingApprovals: approvals.length || 0,
        delayedProjects:
          estimates?.filter((e: any) => {
            const validUntil = new Date(e.validUntil);
            return validUntil < new Date() && e.status !== 'approved';
          }).length || 0,
      });
    }
  }, [performance, financialMetrics, approvals, estimates]);

  // Use real performance data or fallback to defaults
  const staffPerformance = performance?.members || [];

  // Handle approval actions
  const handleApprove = async (id: string) => {
    const success = await approveItem(id);
    if (success) {
      alert('承認しました');
    } else {
      alert('承認に失敗しました');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('却下理由を入力してください');
    if (reason) {
      const success = await rejectItem(id, reason);
      if (success) {
        alert('却下しました');
      } else {
        alert('却下に失敗しました');
      }
    }
  };

  // Show loading state if data is still loading
  if (performanceLoading || approvalsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 支店KPIダッシュボード */}
      <div className="bg-gradient-dandori text-white rounded-2xl shadow-xl p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">📊 支店パフォーマンス</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white/80 text-sm">粗利率</p>
            <p
              className={`text-3xl font-bold ${
                branchKPI.grossProfit >= branchKPI.targetProfit
                  ? 'text-dandori-yellow'
                  : 'text-dandori-pink'
              }`}
            >
              {branchKPI.grossProfit}%
            </p>
            <p className="text-xs text-white/60 mt-1">
              目標: {branchKPI.targetProfit}%
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm">月間契約数</p>
            <p className="text-3xl font-bold">{branchKPI.contracts}件</p>
            <div className="mt-2 bg-white/20 rounded-full h-2">
              <div
                className="bg-dandori-yellow h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(branchKPI.contracts / branchKPI.targetContracts) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">
              目標: {branchKPI.targetContracts}件
            </p>
          </div>
          <div className="bg-dandori-orange/20 backdrop-blur-sm p-3 rounded-xl border border-dandori-orange/30">
            <p className="text-white/80 text-sm">承認待ち</p>
            <p className="text-3xl font-bold text-white">
              {branchKPI.pendingApprovals}件
            </p>
            <p className="text-xs text-white/70 mt-1">要確認</p>
          </div>
          <div className="bg-dandori-pink/20 backdrop-blur-sm p-3 rounded-xl border border-dandori-pink/30">
            <p className="text-white/80 text-sm">遅延案件</p>
            <p className="text-3xl font-bold text-white">
              {branchKPI.delayedProjects}件
            </p>
            <p className="text-xs text-white/70 mt-1">要対応</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* 承認待ち案件 */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">✅ 本日の承認待ち案件</h2>
            </div>
            <div className="p-6">
              {approvalsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">データを読み込み中...</p>
                </div>
              ) : approvals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>承認待ち案件はありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvals.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-4 hover:border-dandori-blue transition-colors duration-200 ${
                        item.urgent
                          ? 'border-dandori-pink bg-dandori-pink/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {item.customer}
                            </h4>
                            {item.urgent && (
                              <span className="px-2 py-0.5 bg-dandori-pink text-white text-xs rounded-full animate-pulse">
                                至急
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            担当: {item.salesPerson}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-dandori-blue">
                            ¥{(item.amount / 1000000).toFixed(1)}M
                          </p>
                          <p
                            className={`text-sm ${
                              item.profitMargin >= 20
                                ? 'text-dandori-blue'
                                : 'text-dandori-orange'
                            }`}
                          >
                            粗利: {item.profitMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedApproval(item);
                            setShowApprovalModal(true);
                          }}
                          className="flex-1 px-3 py-1.5 bg-gradient-dandori text-white rounded-lg text-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => {
                            alert(`見積 ${item.id} の詳細画面へ移動します`);
                            router.push(`/estimates/${item.id}`);
                          }}
                          className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200"
                        >
                          詳細確認
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* チームパフォーマンス */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">👥 チームパフォーマンス</h2>
              <button
                onClick={() => setShowTeamModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                詳細を見る
              </button>
            </div>
            <div className="p-6">
              {performanceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">データを読み込み中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {staffPerformance.map((staff) => (
                    <div
                      key={staff.name}
                      className="border border-gray-200 rounded-xl p-4 hover:border-dandori-blue transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {staff.name}
                          </h4>
                          <p className="text-sm text-gray-600">{staff.role}</p>
                          <div className="mt-2 flex gap-4">
                            <span className="text-sm">
                              契約:{' '}
                              <span className="font-bold">
                                {staff.contracts}件
                              </span>
                            </span>
                            <span className="text-sm">
                              粗利:{' '}
                              <span
                                className={`font-bold ${
                                  staff.profitMargin >= 20
                                    ? 'text-dandori-blue'
                                    : 'text-dandori-orange'
                                }`}
                              >
                                {staff.profitMargin.toFixed(1)}%
                              </span>
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            staff.status === 'good'
                              ? 'bg-dandori-blue/10 text-dandori-blue'
                              : staff.status === 'warning'
                                ? 'bg-dandori-yellow/20 text-dandori-orange'
                                : 'bg-dandori-pink/10 text-dandori-pink'
                          }`}
                        >
                          {staff.status === 'good'
                            ? '好調'
                            : staff.status === 'warning'
                              ? '要支援'
                              : '要改善'}
                        </span>
                      </div>
                      <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            staff.status === 'good'
                              ? 'bg-gradient-to-r from-dandori-blue to-dandori-sky'
                              : staff.status === 'warning'
                                ? 'bg-gradient-to-r from-dandori-yellow to-dandori-orange'
                                : 'bg-gradient-to-r from-dandori-pink to-dandori-orange'
                          }`}
                          style={{ width: `${(staff.contracts / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 顧客・営業管理 */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="font-semibold">👥 顧客・営業管理</h3>
            </div>
            <div className="p-4">
              <button
                onClick={() => router.push('/customers')}
                className="w-full mb-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">👥</span>
                    <div className="text-left">
                      <p className="font-bold">顧客管理センター</p>
                      <p className="text-xs text-white/80">
                        支店全体の顧客データベース
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {customers?.length || 0}
                    </p>
                    <p className="text-xs">顧客数</p>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push('/estimates')}
                  className="text-center bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5 p-3 rounded-lg hover:from-dandori-blue/10 hover:to-dandori-sky/10 transition-all duration-200"
                >
                  <p className="text-2xl mb-1">📝</p>
                  <p className="text-xs font-medium text-gray-900">見積</p>
                  <p className="text-xs text-gray-600">
                    {estimates?.length || 0}件
                  </p>
                </button>
                <button
                  onClick={() => router.push('/contracts')}
                  className="text-center bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                >
                  <p className="text-2xl mb-1">📄</p>
                  <p className="text-xs font-medium text-gray-900">契約</p>
                  <p className="text-xs text-gray-600">5件</p>
                </button>
              </div>
            </div>
          </div>

          {/* 財務管理 */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white">
              <h3 className="font-semibold">💰 支店財務管理</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => router.push('/invoices')}
                  className="text-center bg-gradient-to-r from-dandori-orange/5 to-dandori-yellow/5 p-3 rounded-lg hover:from-dandori-orange/10 hover:to-dandori-yellow/10 transition-all duration-200"
                >
                  <p className="text-2xl mb-1">📋</p>
                  <p className="text-xs font-medium text-gray-900">請求</p>
                  <p className="text-xs text-gray-600">8件</p>
                </button>
                <button
                  onClick={() => router.push('/payments')}
                  className="text-center bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                >
                  <p className="text-2xl mb-1">💵</p>
                  <p className="text-xs font-medium text-gray-900">入金</p>
                  <p className="text-xs text-gray-600">¥8M</p>
                </button>
                <button
                  onClick={() => router.push('/expenses')}
                  className="text-center bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-200"
                >
                  <p className="text-2xl mb-1">💳</p>
                  <p className="text-xs font-medium text-gray-900">経費</p>
                  <p className="text-xs text-gray-600">¥2M</p>
                </button>
              </div>
            </div>
          </div>

          {/* 統合財務分析ダッシュボード */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="font-semibold">📊 支店統合財務分析</h3>
            </div>
            <div className="p-6">
              {/* 主要財務指標 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2">
                    💰 収益性指標
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>営業利益率</span>
                      <span className="font-bold">23.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>粗利益率</span>
                      <span className="font-bold">35.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI</span>
                      <span className="font-bold">18.7%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2">📈 成長指標</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>売上成長率</span>
                      <span className="font-bold text-green-600">+12.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>契約数成長</span>
                      <span className="font-bold text-green-600">+8.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>市場シェア</span>
                      <span className="font-bold">15.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 予算管理 */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-yellow-800 mb-2">
                  📊 予算執行状況
                </h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>月次予算</span>
                      <span>¥45M / ¥50M</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: '90%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>経費予算</span>
                      <span>¥8.5M / ¥10M</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* クイックアクセス */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => router.push('/expenses')}
                  className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition text-center"
                >
                  <div className="text-xl mb-1">💳</div>
                  <div className="text-xs font-medium">経費管理</div>
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <div className="text-xl mb-1">📦</div>
                  <div className="text-xs font-medium">在庫管理</div>
                </button>
                <button
                  onClick={() => setShowAnalyticsModal(true)}
                  className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-xs font-medium">詳細分析</div>
                </button>
              </div>
            </div>
          </div>

          {/* 地図分析 */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">🗺️ 支店エリア分析</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-dandori-blue/10 to-dandori-sky/10 p-3 rounded-xl">
                    <p className="text-xs text-gray-600">営業中</p>
                    <p className="text-xl font-bold text-dandori-blue">15件</p>
                  </div>
                  <div className="bg-gradient-to-br from-dandori-orange/10 to-dandori-yellow/10 p-3 rounded-xl">
                    <p className="text-xs text-gray-600">工事中</p>
                    <p className="text-xl font-bold text-dandori-orange">8件</p>
                  </div>
                  <div className="bg-gradient-to-br from-dandori-pink/10 to-dandori-orange/10 p-3 rounded-xl">
                    <p className="text-xs text-gray-600">完了</p>
                    <p className="text-xl font-bold text-dandori-pink">23件</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/map')}
                  className="w-full bg-gradient-dandori text-white py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  地図で案件分布を確認 →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* マネジメントAI */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg sticky top-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-warm text-white">
              <h3 className="font-semibold">🤖 マネジメントAI</h3>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-br from-dandori-blue/5 to-dandori-sky/5 p-4 rounded-xl mb-4 border border-dandori-blue/10">
                <p className="text-sm font-medium text-dandori-blue-dark mb-2">
                  📋 本日の重要タスク
                </p>
                <ul className="space-y-2 text-xs text-dandori-blue">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-dandori-pink mt-1 mr-2 animate-pulse" />
                    佐藤ビル改修の承認（至急）
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-dandori-orange mt-1 mr-2" />
                    鈴木一郎さんの営業支援
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-dandori-blue mt-1 mr-2" />
                    月次レポート作成
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/estimates')}
                  className="w-full px-4 py-3 bg-gradient-dandori text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">見積一覧</span>
                    <span className="text-2xl">→</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/estimates/create-v2')}
                  className="w-full px-4 py-3 bg-gradient-warm text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">新規見積作成</span>
                    <span className="text-2xl">+</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/vendors')}
                  className="w-full px-4 py-3 bg-white border border-dandori-blue text-dandori-blue rounded-xl hover:bg-dandori-blue/5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">協力会社管理</span>
                    <span className="text-2xl">→</span>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/construction-ledgers')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">工事台帳</span>
                    <span className="text-2xl">🏗️</span>
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AIアシスタント
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-dandori-blue focus:ring-2 focus:ring-dandori-blue/20 transition-all duration-200"
                  rows={3}
                  placeholder="例: 今月の目標達成のための施策は？"
                />
                <button
                  onClick={() => setShowAIModal(true)}
                  className="mt-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                >
                  AIに相談
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* チーム詳細モーダル */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">👥 チーム詳細パフォーマンス</h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* 営業成績ランキング */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">🏆 営業成績ランキング</h4>
                <div className="space-y-2">
                  {[
                    {
                      rank: 1,
                      name: '田中太郎',
                      sales: '¥12M',
                      contracts: 8,
                      rate: '32%',
                    },
                    {
                      rank: 2,
                      name: '山田次郎',
                      sales: '¥10M',
                      contracts: 6,
                      rate: '28%',
                    },
                    {
                      rank: 3,
                      name: '佐藤三郎',
                      sales: '¥8M',
                      contracts: 5,
                      rate: '25%',
                    },
                  ].map((member) => (
                    <div
                      key={member.rank}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl ${member.rank === 1 ? '🥇' : member.rank === 2 ? '🥈' : '🥉'}`}
                        ></span>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">
                            成約率: {member.rate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{member.sales}</p>
                        <p className="text-sm text-gray-600">
                          {member.contracts}件
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* スキルマトリクス */}
              <div>
                <h4 className="font-medium mb-3">📊 スキルマトリクス</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">メンバー</th>
                        <th className="border p-2 text-center">営業力</th>
                        <th className="border p-2 text-center">技術力</th>
                        <th className="border p-2 text-center">顧客対応</th>
                        <th className="border p-2 text-center">チームワーク</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffPerformance.map((staff) => (
                        <tr key={staff.name}>
                          <td className="border p-2">{staff.name}</td>
                          <td className="border p-2 text-center">⭐⭐⭐⭐⭐</td>
                          <td className="border p-2 text-center">⭐⭐⭐⭐</td>
                          <td className="border p-2 text-center">⭐⭐⭐⭐⭐</td>
                          <td className="border p-2 text-center">⭐⭐⭐⭐</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  個別面談設定
                </button>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 承認詳細モーダル */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">✅ 承認詳細</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">顧客名</p>
                    <p className="font-medium">{selectedApproval.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">金額</p>
                    <p className="font-bold text-lg">
                      ¥{(selectedApproval.amount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">担当者</p>
                    <p className="font-medium">
                      {selectedApproval.salesPerson}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">粗利率</p>
                    <p
                      className={`font-bold ${selectedApproval.profitMargin >= 20 ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      {selectedApproval.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  承認条件
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">価格設定が適切である</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">リスク評価が完了している</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">特別割引の承認が必要</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  コメント
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="承認に関するコメントを入力"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleApprove(selectedApproval.id);
                    setShowApprovalModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  承認する
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedApproval.id);
                    setShowApprovalModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  却下
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  保留
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AIアシスタントモーダル */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🤖 マネジメントAI回答</h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  質問:
                </p>
                <p className="text-gray-800">今月の目標達成のための施策は？</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  AIアシスタントの提案:
                </p>
                <div className="space-y-3 text-gray-800">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold mb-2">📈 現状分析</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 現在の達成率: 72%（目標まで28%）</li>
                      <li>• 残り営業日数: 8日</li>
                      <li>• 必要日次売上: ¥3.5M/日</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold mb-2">💡 推奨施策</h4>
                    <ol className="space-y-2 text-sm">
                      <li>
                        1. <strong>高確度案件の集中フォロー</strong>
                        <p className="text-xs text-gray-600 ml-3">
                          田中様邸（¥5M）、山田ビル（¥8M）を優先
                        </p>
                      </li>
                      <li>
                        2. <strong>チーム営業の強化</strong>
                        <p className="text-xs text-gray-600 ml-3">
                          トップ営業が新人をサポート
                        </p>
                      </li>
                      <li>
                        3. <strong>期間限定キャンペーン</strong>
                        <p className="text-xs text-gray-600 ml-3">
                          月末契約で工事費5%OFF
                        </p>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold mb-2">⚠️ リスク要因</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 鈴木様案件の競合リスク</li>
                      <li>• 資材調達の遅延可能性</li>
                      <li>• スタッフの残業時間上限</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                  詳細レポート生成
                </button>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細分析モーダル */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📊 支店詳細分析</h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* 月次推移グラフ */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">売上・利益推移</h4>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 72, 68, 85, 78, 92, 88].map((value, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${value * 1.5}px` }}
                      />
                      <span className="text-xs mt-1">{idx + 1}月</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* カテゴリ別売上 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">カテゴリ別売上</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">外壁塗装</span>
                      <span className="font-bold">¥25M (35%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">屋根工事</span>
                      <span className="font-bold">¥18M (25%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">リフォーム</span>
                      <span className="font-bold">¥20M (28%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">その他</span>
                      <span className="font-bold">¥8M (12%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">顧客属性</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">新規顧客</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">既存顧客</span>
                      <span className="font-bold">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">紹介</span>
                      <span className="font-bold">20%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 予測分析 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">📈 来月予測</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">¥82M</p>
                    <p className="text-sm text-gray-600">予測売上</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">26.5%</p>
                    <p className="text-sm text-gray-600">予測粗利率</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">52件</p>
                    <p className="text-sm text-gray-600">予測契約数</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  レポート出力
                </button>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* マネージャー分析ダッシュボード */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-semibold text-gray-900">
            📊 マネージャー分析ダッシュボード
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            プロジェクトとチームを多角的に分析
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 利益率分析 */}
            <button
              onClick={() => router.push('/analytics/profitability')}
              className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 text-left transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
                  📊
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900">利益率分析</h3>
                </div>
              </div>
              <p className="text-sm text-purple-700">
                プロジェクト別の進捗・原価・利益率を管理
              </p>
            </button>

            {/* 営業パフォーマンス分析 */}
            <button
              onClick={() => router.push('/analytics/sales-performance')}
              className="p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 text-left transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-lg">
                  📈
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">
                    営業パフォーマンス分析
                  </h3>
                </div>
              </div>
              <p className="text-sm text-green-700">
                チームメンバーの受注実績・目標達成率を分析
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
