'use client';

import { useRouter } from 'next/navigation';

interface TodoItem {
  id: string;
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  type: 'estimate' | 'contract' | 'visit';
  customer: string;
  amount?: number;
}

interface SalesDashboardProps {
  userEmail: string;
}

export default function SalesDashboard({ userEmail }: SalesDashboardProps) {
  const router = useRouter();

  const todayTodos: TodoItem[] = [
    {
      id: '1',
      title: '田中様邸 見積提出',
      deadline: '本日 15:00',
      priority: 'high',
      type: 'estimate',
      customer: '田中建設',
      amount: 2500000,
    },
    {
      id: '2',
      title: '山田様 来店予定',
      deadline: '本日 16:00',
      priority: 'medium',
      type: 'visit',
      customer: '山田工務店',
    },
    {
      id: '3',
      title: '契約書確認',
      deadline: '明日 10:00',
      priority: 'low',
      type: 'contract',
      customer: '佐藤リフォーム',
      amount: 1800000,
    },
  ];

  const kpiData = {
    monthlyTarget: 10,
    currentContracts: 7,
    conversionRate: 35,
    averageAmount: 2100000,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-amber-500/50 bg-amber-500/10';
      default:
        return 'border-emerald-500/50 bg-emerald-500/10';
    }
  };

  const getTypeIndicator = (type: string) => {
    switch (type) {
      case 'estimate':
        return '01';
      case 'contract':
        return '02';
      case 'visit':
        return '03';
      default:
        return '00';
    }
  };

  return (
    <div className="space-y-6">
      {/* TODAY'S ALERT */}
      <div className="bg-zinc-950 border border-red-500/30 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 border border-red-500/50 flex items-center justify-center text-red-500 font-light text-xs">
              01
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-xs font-normal text-red-500 tracking-widest">
              URGENT: TODAY 15:00 DEADLINE
            </h3>
            <div className="mt-2 text-xs text-zinc-400 tracking-wider">
              <p>TANAKA RESIDENCE ESTIMATE SUBMISSION DUE IN 4 HOURS.</p>
              <button
                onClick={() => router.push('/estimates/create-v2')}
                className="mt-3 bg-white text-black px-4 py-2 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                CREATE ESTIMATE →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODAY'S TASKS */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest flex items-center">
                TODAY'S TASKS
                <span className="ml-3 border border-zinc-700 text-zinc-400 text-xs px-3 py-1 tracking-wider">
                  {todayTodos.length} ITEMS
                </span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {todayTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`border-l-4 p-4 rounded ${getPriorityColor(todo.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-10 h-10 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm mr-4">
                          {getTypeIndicator(todo.type)}
                        </div>
                        <div>
                          <h4 className="font-light text-white tracking-wider">
                            {todo.title.toUpperCase()}
                          </h4>
                          <p className="text-xs text-zinc-500 tracking-wider mt-1">
                            CLIENT: {todo.customer.toUpperCase()}
                            {todo.amount && (
                              <span className="ml-4">
                                AMOUNT: ¥{todo.amount.toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-light text-white tracking-wider">
                        {todo.deadline.toUpperCase()}
                      </p>
                      <button className="mt-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider">
                        DETAILS →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI PROGRESS */}
          <div className="bg-zinc-950 border border-zinc-800 mt-6">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-normal text-white tracking-widest">
                THIS MONTH'S PERFORMANCE
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    CONTRACT COUNT
                  </p>
                  <p className="text-2xl font-thin text-white">
                    {kpiData.currentContracts}/{kpiData.monthlyTarget}
                  </p>
                  <div className="mt-2 bg-zinc-900 h-1">
                    <div
                      className="bg-blue-500/50 h-1 transition-all duration-500"
                      style={{
                        width: `${(kpiData.currentContracts / kpiData.monthlyTarget) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    CONVERSION RATE
                  </p>
                  <p className="text-2xl font-thin text-white">
                    {kpiData.conversionRate}%
                  </p>
                  <p className="text-xs text-emerald-500 tracking-wider mt-1">
                    +5% FROM LAST MONTH
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    AVERAGE AMOUNT
                  </p>
                  <p className="text-xl font-thin text-white">
                    ¥{kpiData.averageAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    TARGET ACHIEVEMENT
                  </p>
                  <p className="text-2xl font-thin text-emerald-500">70%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 統合財務分析ダッシュボード */}
          <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="font-semibold">📊 営業財務分析</h3>
            </div>
            <div className="p-6">
              {/* 営業成果指標 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2">💰 収益指標</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>営業利益</span>
                      <span className="font-bold">¥4.2M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>粗利率</span>
                      <span className="font-bold">28.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>受注単価</span>
                      <span className="font-bold">¥2.1M</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-bold text-blue-800 mb-2">📈 営業効率</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>成約率</span>
                      <span className="font-bold text-green-600">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>リードタイム</span>
                      <span className="font-bold">12日</span>
                    </div>
                    <div className="flex justify-between">
                      <span>顧客単価</span>
                      <span className="font-bold">¥1.8M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 目標達成状況 */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h5 className="font-bold text-yellow-800 mb-2">🎯 目標進捗</h5>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>月次売上目標</span>
                      <span>¥14.7M / ¥21M</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: '70%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>契約件数目標</span>
                      <span>7件 / 10件</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: '70%' }}
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
                  <div className="text-xs font-medium">経費申請</div>
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center"
                >
                  <div className="text-xl mb-1">📦</div>
                  <div className="text-xs font-medium">在庫確認</div>
                </button>
                <button className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center">
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-xs font-medium">売上分析</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RAGアシスタント */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow sticky top-6">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <h2 className="text-lg font-semibold">🤖 RAGアシスタント</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    💡 おすすめ質問
                  </p>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm bg-white p-2 rounded hover:bg-purple-100">
                      「田中様邸に似た過去案件は？」
                    </button>
                    <button className="w-full text-left text-sm bg-white p-2 rounded hover:bg-purple-100">
                      「外壁塗装の標準見積項目は？」
                    </button>
                    <button className="w-full text-left text-sm bg-white p-2 rounded hover:bg-purple-100">
                      「粗利20%確保の価格設定は？」
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    質問を入力
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    placeholder="例: 築20年木造の外壁塗装の相場は？"
                  />
                  <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                    RAGに聞く
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    最近の検索
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• 屋根リフォーム 見積項目</p>
                    <p>• 協力会社A 過去実績</p>
                    <p>• 原価率 改善方法</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 営業活動センター */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="text-3xl mr-3">🎯</span>
          営業活動センター
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/dark/customers')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">👥</span>
            <p className="mt-2 font-bold">顧客管理</p>
            <p className="text-xs text-white/80">CRM</p>
          </button>
          <button
            onClick={() => router.push('/estimates/editor-v3/new')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">📝</span>
            <p className="mt-2 font-bold">新規見積</p>
            <p className="text-xs text-white/80">作成</p>
          </button>
          <button
            onClick={() => router.push('/estimates')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">📊</span>
            <p className="mt-2 font-bold">見積一覧</p>
            <p className="text-xs text-white/80">管理</p>
          </button>
          <button
            onClick={() => router.push('/map')}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl hover:bg-white/30 transform hover:scale-105 transition-all duration-200 border border-white/30"
          >
            <span className="text-3xl">🗺️</span>
            <p className="mt-2 font-bold">地図分析</p>
            <p className="text-xs text-white/80">エリア</p>
          </button>
        </div>
      </div>

      {/* その他のツール */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/contracts')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">📄</span>
          <p className="mt-2 font-medium">契約管理</p>
        </button>
        <button
          onClick={() => router.push('/vendors')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">👷</span>
          <p className="mt-2 font-medium">協力会社</p>
        </button>
        <button
          onClick={() => router.push('/invoices')}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">💰</span>
          <p className="mt-2 font-medium">請求書</p>
        </button>
        <button
          onClick={() => router.push('/expenses')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">💳</span>
          <p className="mt-2 font-medium">経費精算</p>
        </button>
      </div>
    </div>
  );
}
