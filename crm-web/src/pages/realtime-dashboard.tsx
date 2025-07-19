import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProjects, mockKPISummary } from '@/lib/mock-data';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function RealtimeDashboardPage() {
  const navigate = useNavigate();
  const [time] = useState(new Date());
  const [kpiData] = useState(mockKPISummary);
  const [notifications] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // リアルタイム時刻更新 - 無効化
  /*
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  */

  // KPIデータのリアルタイム更新シミュレーション - 無効化
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      setKpiData(prev => ({
        deals: Math.max(0, prev.deals + (Math.random() > 0.8 ? 1 : 0)), // マイナスにならないよう修正
        contracts: prev.contracts + (Math.random() > 0.9 ? 1 : 0),
        totalSales: prev.totalSales + (Math.random() > 0.7 ? Math.floor(Math.random() * 1000000) : 0),
        grossProfit: prev.grossProfit + (Math.random() > 0.7 ? Math.floor(Math.random() * 300000) : 0),
      }));

      // ランダムな通知を追加
      if (Math.random() > 0.85) { // 通知頻度をさらに下げる
        const messages = [
          '新規見込み案件が追加されました',
          '渋谷区M様邸の工程が更新されました',
          '発注書が承認されました',
          '現場写真がアップロードされました',
          'AIが工期遅延リスクを検知しました',
        ];
        const newNotif = {
          id: Date.now(),
          message: messages[Math.floor(Math.random() * messages.length)],
          time: new Date(),
          type: Math.random() > 0.5 ? 'success' : 'warning'
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 5));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  */

  // 売上推移データ（過去12時間） - より現実的な変動に
  const salesTrendData = Array.from({ length: 12 }, (_, i) => {
    // ベースラインを設定し、小さな変動を加える
    const baseSales = 40000000;
    const baseProfit = 12000000;
    const variation = 0.1; // 10%の変動

    return {
      time: `${(new Date().getHours() - 11 + i + 24) % 24}:00`,
      売上: baseSales + Math.floor((Math.random() - 0.5) * baseSales * variation),
      利益: baseProfit + Math.floor((Math.random() - 0.5) * baseProfit * variation),
    };
  });

  // プロジェクトステータス分布
  const statusDistribution = [
    {
      name: '見込み',
      value: mockProjects.filter((p) => p.status === 'PROSPECT').length,
      color: '#94a3b8',
    },
    {
      name: '契約済',
      value: mockProjects.filter((p) => p.status === 'CONTRACTED').length,
      color: '#3b82f6',
    },
    {
      name: '施工中',
      value: mockProjects.filter((p) => p.status === 'ON_SITE').length,
      color: '#f59e0b',
    },
    {
      name: 'アフター',
      value: mockProjects.filter((p) => p.status === 'AFTER_SERVICE').length,
      color: '#10b981',
    },
  ];

  // エリア別パフォーマンス
  const areaPerformance = [
    { area: '港区', 売上: 320, 案件数: 15, 利益率: 35 },
    { area: '渋谷区', 売上: 180, 案件数: 12, 利益率: 28 },
    { area: '新宿区', 売上: 250, 案件数: 18, 利益率: 32 },
    { area: '世田谷区', 売上: 120, 案件数: 8, 利益率: 25 },
    { area: '品川区', 売上: 95, 案件数: 6, 利益率: 22 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ライブダッシュボード</h1>
          <p className="text-gray-400 text-sm mt-1">
            {time.toLocaleDateString('ja-JP', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            <span className="font-mono text-green-400">{time.toLocaleTimeString('ja-JP')}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded ${
                selectedPeriod === period ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {period === 'today' ? '今日' : period === 'week' ? '今週' : '今月'}
            </button>
          ))}
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 ml-4"
          >
            通常ビュー
          </button>
        </div>
      </div>

      {/* メインKPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '見込み案件', value: kpiData.deals, icon: '📊', change: '+15%' },
          { label: '契約件数', value: kpiData.contracts, icon: '📝', change: '+25%' },
          {
            label: '売上高',
            value: `¥${(kpiData.totalSales / 1000000).toFixed(1)}M`,
            icon: '💰',
            change: '+32%',
          },
          {
            label: '粗利益',
            value: `¥${(kpiData.grossProfit / 1000000).toFixed(1)}M`,
            icon: '📈',
            change: '+28%',
          },
        ].map((kpi, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-gray-400 text-sm">{kpi.change}</span>
            </div>
            <h3 className="text-gray-400 text-sm">{kpi.label}</h3>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                style={{ width: `${Math.random() * 20 + 70}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* 売上推移 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">売上・利益推移</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `¥${value / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="売上"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                animationDuration={0}
              />
              <Line
                type="monotone"
                dataKey="利益"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                animationDuration={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* プロジェクトステータス分布 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">プロジェクトステータス分布</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={0}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* エリア別パフォーマンスと通知 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* エリア別パフォーマンス */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">エリア別パフォーマンス</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="area" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="売上" fill="#3b82f6" animationDuration={0} />
              <Bar dataKey="案件数" fill="#10b981" animationDuration={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* リアルタイム通知 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">リアルタイム通知</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">通知はありません</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${
                    notif.type === 'success'
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-yellow-900/20 border-yellow-700'
                  }`}
                >
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notif.time.toLocaleTimeString('ja-JP')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 下部の追加情報 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-700/50">
          <h4 className="text-sm text-gray-400">本日の活動</h4>
          <p className="text-2xl font-bold mt-2">142</p>
          <p className="text-xs text-gray-500">アクション実行</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-lg p-4 border border-green-700/50">
          <h4 className="text-sm text-gray-400">効率スコア</h4>
          <p className="text-2xl font-bold mt-2">94.5%</p>
          <p className="text-xs text-gray-500">前日比 +2.3%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-700/50">
          <h4 className="text-sm text-gray-400">AIアラート</h4>
          <p className="text-2xl font-bold mt-2">3</p>
          <p className="text-xs text-gray-500">要確認事項</p>
        </div>
      </div>
    </div>
  );
}
