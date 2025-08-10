'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // 認証チェック
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            DRM Suite Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="/estimates"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2 text-blue-600">
              見積管理
            </h2>
            <p className="text-3xl font-bold mb-2">24</p>
            <p className="text-gray-600 text-sm">進行中の見積</p>
            <p className="text-blue-500 text-sm mt-2">クリックして管理 →</p>
          </a>

          <a
            href="/inventory"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2 text-green-600">
              在庫管理
            </h2>
            <p className="text-3xl font-bold mb-2">1,234</p>
            <p className="text-gray-600 text-sm">総在庫数</p>
            <p className="text-green-500 text-sm mt-2">クリックして管理 →</p>
          </a>

          <a
            href="/bookings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2 text-purple-600">
              予約管理
            </h2>
            <p className="text-3xl font-bold mb-2">18</p>
            <p className="text-gray-600 text-sm">今日の予約</p>
            <p className="text-purple-500 text-sm mt-2">クリックして管理 →</p>
          </a>

          <a
            href="/marketing"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2 text-orange-600">
              マーケティング
            </h2>
            <p className="text-3xl font-bold mb-2">89%</p>
            <p className="text-gray-600 text-sm">目標達成率</p>
            <p className="text-orange-500 text-sm mt-2">クリックして管理 →</p>
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">最近の活動</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">新規見積 #1234 作成</span>
                <span className="text-gray-500 text-sm">10分前</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">在庫更新: 商品A (+50)</span>
                <span className="text-gray-500 text-sm">1時間前</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-700">会議室予約: 第2会議室</span>
                <span className="text-gray-500 text-sm">3時間前</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">RAG Copilot</h3>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
              <p className="font-semibold mb-2">🤖 AIアシスタント準備完了</p>
              <p className="text-sm">業務に関する質問をお待ちしています</p>
            </div>
            <input
              type="text"
              placeholder="質問を入力..."
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
