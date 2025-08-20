'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SalesDashboard from './sales';
import ManagerDashboard from './manager';
import ExecutiveDashboard from './executive';
import MarketingDashboard from './marketing';
import AccountingDashboard from './accounting';

export default function DashboardPage() {
  const { user, isLoading, logout, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [showEstimateModal, setShowEstimateModal] = useState(false);

  const getRoleMapping = (role: string) => {
    // Map Japanese role names to dashboard types
    if (role === 'super_admin') return 'executive'; // スーパー管理者は経営者ダッシュボードを表示
    if (role === '経営者') return 'executive';
    if (role === '支店長') return 'manager';
    if (role === '営業担当') return 'sales';
    if (role === '経理担当') return 'accounting';
    if (role === 'マーケティング') return 'marketing';
    if (role === '施工管理') return 'construction';
    if (role === '事務員') return 'office';
    if (role === 'アフター担当') return 'aftercare';
    // Return original if already in English format
    return role;
  };

  useEffect(() => {
    if (user) {
      const roleMapping = getRoleMapping(user.role);
      // Redirect to specific dashboards for new roles
      if (roleMapping === 'construction') {
        router.push('/dashboard/construction');
      } else if (roleMapping === 'office') {
        router.push('/dashboard/office');
      } else if (roleMapping === 'aftercare') {
        router.push('/dashboard/aftercare');
      }
    }
  }, [user, router]);

  const getRoleTitle = (role: string) => {
    if (role === 'super_admin') return 'スーパー管理者ダッシュボード';
    const mappedRole = getRoleMapping(role);
    switch (mappedRole) {
      case 'sales':
        return '営業ダッシュボード';
      case 'manager':
        return '支店長ダッシュボード';
      case 'marketing':
        return 'マーケティングダッシュボード';
      case 'accounting':
        return '経理ダッシュボード';
      case 'executive':
        return '経営ダッシュボード';
      default:
        return 'ダッシュボード';
    }
  };

  const getRoleColor = (role: string) => {
    if (role === 'super_admin') return 'from-red-500 to-orange-500'; // スーパー管理者は赤系
    const mappedRole = getRoleMapping(role);
    switch (mappedRole) {
      case 'sales':
        return 'from-dandori-orange to-dandori-yellow';
      case 'manager':
        return 'from-dandori-blue to-dandori-sky';
      case 'marketing':
        return 'from-dandori-yellow to-green-400';
      case 'accounting':
        return 'from-purple-500 to-dandori-pink';
      case 'executive':
        return 'from-dandori-blue to-dandori-sky';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav
        className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-lg`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                {getRoleTitle(user.role)}
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {isSuperAdmin() && (
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-red-500/20 hover:bg-red-500/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap border border-white/30"
                >
                  <span className="mr-1 sm:mr-2">⚡</span>
                  <span>管理コンソール</span>
                </button>
              )}
              {(getRoleMapping(user.role) === 'sales' ||
                getRoleMapping(user.role) === 'manager' ||
                getRoleMapping(user.role) === 'executive') && (
                <button
                  onClick={() => setShowEstimateModal(true)}
                  className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap border border-white/30"
                >
                  <span className="mr-1 sm:mr-2">📝</span>
                  <span>見積作成</span>
                </button>
              )}
              <div className="text-right hidden md:block">
                <p className="text-sm opacity-90">ログイン中</p>
                <p className="font-medium text-sm">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">ログアウト</span>
                <span className="sm:hidden">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {getRoleMapping(user.role) === 'sales' && (
          <SalesDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'manager' && (
          <ManagerDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'executive' && (
          <ExecutiveDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'marketing' && (
          <MarketingDashboard userEmail={user.email} />
        )}
        {getRoleMapping(user.role) === 'accounting' && (
          <AccountingDashboard userEmail={user.email} />
        )}
      </div>

      {/* 見積作成選択モーダル */}
      {showEstimateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-dandori text-white p-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">見積作成方法を選択</h2>
                <button
                  onClick={() => setShowEstimateModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {/* マスタ連携版への直接リンク - 目立つように上部に配置 */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg mr-4">
                      🔗
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        マスタ連携版（推奨）
                      </h3>
                      <p className="text-sm text-gray-600">
                        マスタデータから商品・品目を選択して効率的に見積作成
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEstimateModal(false);
                      router.push('/estimates/create-v2');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                  >
                    今すぐ使う →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 通常版 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl group-hover:blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                  <button
                    onClick={() => {
                      setShowEstimateModal(false);
                      router.push('/estimates/create');
                    }}
                    className="relative w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-dandori-blue hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
                        📝
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        スタンダード
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      通常版
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      シンプルで使いやすい標準的な見積作成フォーム
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>基本的な項目入力</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>テンプレート機能</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>自動計算</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">✓</span>
                        <span>PDF出力</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        作成時間: 約5分
                      </span>
                      <span className="text-dandori-blue font-bold">
                        選択 →
                      </span>
                    </div>
                  </button>
                </div>

                {/* プロ版 */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl group-hover:blur-2xl opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                  <button
                    onClick={() => {
                      setShowEstimateModal(false);
                      router.push('/estimates/create/enhanced');
                    }}
                    className="relative w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
                        🚀
                      </div>
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        プロフェッショナル
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      プロ版
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      建設業界特化の高機能見積作成システム
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>3階層の詳細分類</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>原価管理・利益分析</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>AIアシスタント</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 text-purple-500">★</span>
                        <span>画像・図面添付</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        作成時間: 約10分
                      </span>
                      <span className="text-purple-600 font-bold">選択 →</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 比較表 */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-4">機能比較</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-medium text-gray-600">機能</div>
                  <div className="text-center font-medium text-blue-600">
                    通常版
                  </div>
                  <div className="text-center font-medium text-purple-600">
                    プロ版
                  </div>

                  <div className="py-2 border-t">基本情報入力</div>
                  <div className="py-2 border-t text-center">✓</div>
                  <div className="py-2 border-t text-center">✓</div>

                  <div className="py-2">テンプレート</div>
                  <div className="py-2 text-center">3種類</div>
                  <div className="py-2 text-center">10種類以上</div>

                  <div className="py-2">明細分類</div>
                  <div className="py-2 text-center">1階層</div>
                  <div className="py-2 text-center">3階層</div>

                  <div className="py-2">原価管理</div>
                  <div className="py-2 text-center">基本</div>
                  <div className="py-2 text-center">詳細</div>

                  <div className="py-2">AI支援</div>
                  <div className="py-2 text-center">-</div>
                  <div className="py-2 text-center">✓</div>

                  <div className="py-2">承認ワークフロー</div>
                  <div className="py-2 text-center">✓</div>
                  <div className="py-2 text-center">✓</div>

                  <div className="py-2">バージョン管理</div>
                  <div className="py-2 text-center">-</div>
                  <div className="py-2 text-center">✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
