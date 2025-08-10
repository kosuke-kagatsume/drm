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
      staff: '山田太郎',
      waitTime: '2時間',
    },
    {
      id: '2',
      customer: '山田ビル',
      amount: 5800000,
      profit: 18,
      staff: '佐藤花子',
      waitTime: '5時間',
    },
    {
      id: '3',
      customer: '鈴木邸',
      amount: 1200000,
      profit: 15,
      staff: '鈴木一郎',
      waitTime: '1日',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 支店KPIサマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 支店パフォーマンス</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">粗利率</p>
            <p
              className={`text-3xl font-bold ${branchKPI.grossProfit >= branchKPI.targetProfit ? 'text-green-600' : 'text-red-600'}`}
            >
              {branchKPI.grossProfit}%
            </p>
            <p className="text-xs text-gray-500">
              目標: {branchKPI.targetProfit}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">契約件数</p>
            <p className="text-3xl font-bold text-blue-600">
              {branchKPI.contracts}件
            </p>
            <p className="text-xs text-gray-500">
              目標: {branchKPI.targetContracts}件
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-yellow-800 font-medium">承認待ち</p>
            <p className="text-3xl font-bold text-yellow-600">
              {branchKPI.pendingApprovals}件
            </p>
            <button className="text-xs text-yellow-700 underline">
              今すぐ確認 →
            </button>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <p className="text-sm text-red-800 font-medium">遅延案件</p>
            <p className="text-3xl font-bold text-red-600">
              {branchKPI.delayedProjects}件
            </p>
            <button className="text-xs text-red-700 underline">
              詳細を見る →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 承認待ち案件 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-yellow-50">
              <h2 className="text-lg font-semibold text-yellow-800">
                ⏳ 承認待ち案件（優先度順）
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.customer}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        担当: {item.staff} | 待機時間:{' '}
                        <span className="text-red-600">{item.waitTime}</span>
                      </p>
                      <div className="mt-2">
                        <span className="text-lg font-bold">
                          ¥{item.amount.toLocaleString()}
                        </span>
                        <span
                          className={`ml-3 px-2 py-1 rounded text-sm ${
                            item.profit >= 20
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          粗利 {item.profit}%
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        承認
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        却下
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                        詳細
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* スタッフパフォーマンス */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                👥 スタッフパフォーマンス
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        スタッフ
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        役職
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        契約数
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        粗利率
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        状態
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((staff, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-3 font-medium">{staff.name}</td>
                        <td className="px-4 py-3">{staff.role}</td>
                        <td className="px-4 py-3 text-center">
                          {staff.contracts}件
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold ${
                              staff.profit >= 20
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {staff.profit}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              staff.status === 'good'
                                ? 'bg-green-100 text-green-800'
                                : staff.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {staff.status === 'good'
                              ? '良好'
                              : staff.status === 'warning'
                                ? '要注意'
                                : '要指導'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            詳細 →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RAGアシスタント + アラート */}
        <div className="lg:col-span-1 space-y-6">
          {/* リアルタイムアラート */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">🚨 要対応</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>粗利15%以下の見積</span>
                <span className="font-bold text-red-600">2件</span>
              </div>
              <div className="flex justify-between">
                <span>3日以上未対応</span>
                <span className="font-bold text-red-600">1件</span>
              </div>
              <div className="flex justify-between">
                <span>クレーム対応中</span>
                <span className="font-bold text-orange-600">1件</span>
              </div>
            </div>
          </div>

          {/* RAGアシスタント */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="font-semibold">🤖 支店長アシスタント</h3>
            </div>
            <div className="p-4">
              <div className="bg-purple-50 p-3 rounded mb-4">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  📊 分析提案
                </p>
                <p className="text-xs text-purple-700">
                  「佐藤花子さんの粗利率が低下傾向です。過去の成功案件と比較しますか？」
                </p>
                <button className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded">
                  分析する
                </button>
              </div>

              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="例: 今月の粗利低下の原因は？"
              />
              <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm">
                AIに相談
              </button>
            </div>
          </div>

          {/* 本日の予定 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">📅 本日の予定</h3>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span>10:00 営業会議</span>
                <span className="text-gray-500">会議室A</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>14:00 田中様来店</span>
                <span className="text-gray-500">応接室</span>
              </div>
              <div className="flex justify-between py-2">
                <span>16:00 月次レビュー</span>
                <span className="text-gray-500">オンライン</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
