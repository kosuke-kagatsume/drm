'use client';

import { useRouter } from 'next/navigation';

interface ManagerDashboardProps {
  userEmail: string;
}

export default function ManagerDashboard({ userEmail }: ManagerDashboardProps) {
  const router = useRouter();

  const branchKPI = {
    grossProfit: 23.5,
    targetProfit: 25,
    contracts: 42,
    targetContracts: 50,
    pendingApprovals: 3,
    delayedProjects: 2,
  };

  const staffPerformance = [
    {
      name: '山田太郎',
      role: '営業',
      contracts: 8,
      profit: 24,
      status: 'good',
    },
    {
      name: '佐藤花子',
      role: '営業',
      contracts: 5,
      profit: 18,
      status: 'warning',
    },
    {
      name: '鈴木一郎',
      role: '営業',
      contracts: 3,
      profit: 15,
      status: 'danger',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      customer: '田中様邸',
      amount: 2500000,
      profit: 22,
      sales: '山田太郎',
      urgent: false,
    },
    {
      id: '2',
      customer: '佐藤ビル改修',
      amount: 8000000,
      profit: 18,
      sales: '佐藤花子',
      urgent: true,
    },
    {
      id: '3',
      customer: '鈴木マンション',
      amount: 5500000,
      profit: 20,
      sales: '鈴木一郎',
      urgent: false,
    },
  ];

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
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
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
                          担当: {item.sales}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-dandori-blue">
                          ¥{(item.amount / 1000000).toFixed(1)}M
                        </p>
                        <p
                          className={`text-sm ${
                            item.profit >= 20
                              ? 'text-dandori-blue'
                              : 'text-dandori-orange'
                          }`}
                        >
                          粗利: {item.profit}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 bg-gradient-dandori text-white rounded-lg text-sm hover:shadow-md transform hover:scale-105 transition-all duration-200">
                        承認
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200">
                        詳細確認
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* チームパフォーマンス */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">👥 チームパフォーマンス</h2>
            </div>
            <div className="p-6">
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
                                staff.profit >= 20
                                  ? 'text-dandori-blue'
                                  : 'text-dandori-orange'
                              }`}
                            >
                              {staff.profit}%
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
                  onClick={() => router.push('/contracts')}
                  className="text-center bg-gradient-to-r from-dandori-blue/5 to-dandori-sky/5 p-3 rounded-lg hover:from-dandori-blue/10 hover:to-dandori-sky/10 transition-all duration-200"
                >
                  <p className="text-2xl mb-1">📄</p>
                  <p className="text-xs font-medium text-gray-900">契約</p>
                  <p className="text-xs text-gray-600">5件</p>
                </button>
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
                  onClick={() => router.push('/estimates/create')}
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
                <button className="mt-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                  AIに相談
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
