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
            <h3 className="text-lg font-semibold mb-4">クイックアクセス</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/estimates/create"
                className="p-3 bg-blue-50 rounded hover:bg-blue-100 transition"
              >
                <p className="font-medium text-blue-900">📝 新規見積作成</p>
              </a>
              <a
                href="/vendors"
                className="p-3 bg-green-50 rounded hover:bg-green-100 transition"
              >
                <p className="font-medium text-green-900">👷 協力会社管理</p>
              </a>
              <a
                href="/projects"
                className="p-3 bg-purple-50 rounded hover:bg-purple-100 transition"
              >
                <p className="font-medium text-purple-900">🏗️ 工事進捗</p>
              </a>
              <a
                href="/invoices"
                className="p-3 bg-orange-50 rounded hover:bg-orange-100 transition"
              >
                <p className="font-medium text-orange-900">💰 請求・入金</p>
              </a>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                最近の活動
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>田中様邸 見積承認</span>
                  <span className="text-gray-500">10分前</span>
                </div>
                <div className="flex justify-between">
                  <span>山田建設に発注</span>
                  <span className="text-gray-500">1時間前</span>
                </div>
                <div className="flex justify-between">
                  <span>佐藤様邸 完工</span>
                  <span className="text-gray-500">3時間前</span>
                </div>
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
