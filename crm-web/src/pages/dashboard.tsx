import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-sm md:text-base text-gray-500">ようこそ、{user?.name}さん</p>
      </div>
      
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">見込み案件</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">0</p>
          <p className="text-xs text-gray-500 mt-1">前月比 +0%</p>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">契約件数</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">0</p>
          <p className="text-xs text-gray-500 mt-1">前月比 +0%</p>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">売上</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">¥0</p>
          <p className="text-xs text-gray-500 mt-1">前月比 +0%</p>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">粗利</h3>
          <p className="text-xl md:text-2xl font-bold mt-2">¥0</p>
          <p className="text-xs text-gray-500 mt-1">利益率 0%</p>
        </div>
      </div>
      
      {/* 追加のコンテンツ */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">最近のプロジェクト</h3>
          <div className="text-sm text-gray-500">
            <p className="py-2">プロジェクトがまだありません</p>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 md:p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">今月の活動</h3>
          <div className="text-sm text-gray-500">
            <p className="py-2">活動データがまだありません</p>
          </div>
        </div>
      </div>
    </div>
  );
}