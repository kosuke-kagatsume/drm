import { useAuthStore } from '@/store/auth';
import { isMockMode } from '@/lib/mock-api';
import { mockKPISummary, mockProjects } from '@/lib/mock-data';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-sm md:text-base text-gray-500">ようこそ、{user?.name}さん</p>
          {isMockMode() && (
            <p className="text-xs text-orange-600 mt-1">
              ※ デモモードで動作中（サンプルデータ表示）
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/realtime')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
        >
          <span>🚀</span>
          リアルタイムビュー
        </button>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="rounded-lg border bg-white p-4 md:p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/projects?status=PROSPECT')}
        >
          <h3 className="text-sm font-medium text-gray-600">見込み案件</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">{mockKPISummary.deals}</p>
          <p className="text-xs text-gray-500 mt-1">前月比 +15%</p>
        </div>
        <div
          className="rounded-lg border bg-white p-4 md:p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/projects?status=CONTRACTED')}
        >
          <h3 className="text-sm font-medium text-gray-600">契約件数</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">{mockKPISummary.contracts}</p>
          <p className="text-xs text-gray-500 mt-1">前月比 +25%</p>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">売上</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">
            ¥{(mockKPISummary.totalSales / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">前月比 +32%</p>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">粗利</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">
            ¥{(mockKPISummary.grossProfit / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">利益率 30%</p>
        </div>
      </div>

      {/* 追加のコンテンツ */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">最近のプロジェクト</h3>
          <div className="space-y-3">
            {mockProjects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex justify-between items-center py-2 border-b cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ¥{(project.contractAmount / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-gray-500">進捗 {project.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">エリア別売上</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">首都圏</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <span className="text-sm font-medium">¥578M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">関西</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <span className="text-sm font-medium">¥435M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">名古屋</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <span className="text-sm font-medium">¥283M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">福岡</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>
              <span className="text-sm font-medium">¥338M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">滋賀</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
              <span className="text-sm font-medium">¥245M</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
