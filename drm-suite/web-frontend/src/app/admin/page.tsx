'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス拒否
          </h1>
          <p className="text-gray-600 mb-6">
            このページにアクセスする権限がありません。
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: '概要', icon: '📊' },
    { id: 'users', name: 'ユーザー管理', icon: '👥' },
    { id: 'masters', name: 'マスタ管理', icon: '⚙️' },
    { id: 'permissions', name: '権限管理', icon: '🔐' },
    { id: 'organization', name: '組織管理', icon: '🏢' },
    { id: 'approval-flows', name: '承認フロー設定', icon: '✅' },
  ];

  const stats = [
    {
      label: 'アクティブユーザー',
      value: '12',
      icon: '👤',
      color: 'bg-blue-500',
    },
    { label: '今月の見積', value: '47', icon: '📝', color: 'bg-green-500' },
    { label: '承認待ち', value: '3', icon: '⏳', color: 'bg-orange-500' },
    { label: 'システムアラート', value: '0', icon: '🚨', color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-white/80 hover:text-white"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <span className="text-3xl mr-3">⚡</span>
                  スーパー管理コンソール
                </h1>
                <p className="text-red-100 text-sm mt-1">
                  システム全体の管理・設定
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">ログイン中</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* コンテンツエリア */}
        {activeTab === 'overview' && (
          <div>
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 ${stat.color} rounded-md p-3`}
                    >
                      <span className="text-white text-2xl">{stat.icon}</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.label}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* システム状態 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    システム状態
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        データベース
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        正常
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        API サーバー
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        正常
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        ファイルストレージ
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        正常
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        バックアップ
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        実行中
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    最近のアクティビティ
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">
                          新規ユーザーが追加されました
                        </p>
                        <p className="text-xs text-gray-500">2分前</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">
                          見積が承認されました
                        </p>
                        <p className="text-xs text-gray-500">15分前</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">
                          システム設定が更新されました
                        </p>
                        <p className="text-xs text-gray-500">1時間前</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* その他のタブは今後実装 */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">準備中</h3>
            <p className="text-gray-600">この機能は現在開発中です。</p>
            <button
              onClick={() => {
                if (activeTab === 'users') router.push('/admin/users');
                else if (activeTab === 'masters') router.push('/admin/masters');
                else if (activeTab === 'permissions')
                  router.push('/admin/permissions');
                else if (activeTab === 'organization')
                  router.push('/admin/organization');
                else if (activeTab === 'approval-flows')
                  router.push('/admin/approval-flows');
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              詳細ページへ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
