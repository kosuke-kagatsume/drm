'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  Package,
  FileText,
  Camera,
  CheckSquare,
  Banknote,
  Calendar,
  MapPin,
  ChevronRight,
  Activity,
  BarChart3,
  Receipt,
} from 'lucide-react';
import { invoiceService } from '@/services/invoice.service';

// モックデータ
const mockSites = [
  {
    id: 1,
    name: '山田様邸新築工事',
    address: '東京都世田谷区○○1-2-3',
    startTime: '08:00',
    endTime: '17:00',
    manager: '田中 三郎',
    priority: 'high',
    status: 'in_progress',
    progress: 60,
    workers: 5,
    memo: '基礎工事完了、上棟準備中',
    customer: '山田 太郎',
    contractAmount: 35000000,
    earnedValue: 21000000,
  },
  {
    id: 2,
    name: '鈴木様邸リフォーム',
    address: '東京都渋谷区△△2-3-4',
    startTime: '09:00',
    endTime: '16:00',
    manager: '田中 三郎',
    priority: 'normal',
    status: 'in_progress',
    progress: 30,
    workers: 3,
    memo: '内装解体中',
    customer: '鈴木 一郎',
    contractAmount: 8500000,
    earnedValue: 2550000,
  },
  {
    id: 3,
    name: '佐藤様邸外壁塗装',
    address: '東京都新宿区××3-4-5',
    startTime: '10:00',
    endTime: '15:00',
    manager: '田中 三郎',
    priority: 'urgent',
    status: 'delayed',
    progress: 45,
    workers: 2,
    memo: '【緊急】クレーム対応必要',
    customer: '佐藤 次郎',
    contractAmount: 1800000,
    earnedValue: 810000,
  },
];

const mockMaterials = [
  {
    name: '断熱材',
    status: 'shortage',
    remaining: 2,
    required: 10,
    unit: '箱',
    supplier: '建材商事',
    leadTime: '3日',
  },
  {
    name: 'フローリング材',
    status: 'unordered',
    remaining: 0,
    required: 50,
    unit: '㎡',
    supplier: '木材センター',
    leadTime: '5日',
  },
];

export default function ConstructionDashboard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // 工事進捗更新と請求書生成
  const handleProgressUpdate = async (
    siteId: number,
    newProgress: number,
    milestones: string[],
  ) => {
    try {
      // 実際の実装では、契約IDを取得する
      const contractId = `contract_${siteId}`;

      // 工事進捗に基づいて請求書を自動生成
      const generatedInvoices = await invoiceService.generateProgressInvoice(
        contractId,
        newProgress,
        milestones,
      );

      if (generatedInvoices.length > 0) {
        alert(
          `工事進捗の更新により、${generatedInvoices.length}件の請求書が生成されました。`,
        );
        // 請求書管理画面への遷移を提案
        if (confirm('生成された請求書を確認しますか？')) {
          router.push('/invoices/management');
        }
      }
    } catch (error) {
      console.error('Failed to generate progress invoice:', error);
    }
  };

  // 請求書生成ボタンのハンドラー
  const handleGenerateInvoice = async (site: any) => {
    await handleProgressUpdate(site.id, site.progress, []);
  };
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('sites');

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== '施工管理') {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

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

  const totalEarnedValue = mockSites.reduce(
    (sum, site) => sum + site.earnedValue,
    0,
  );
  const totalContractAmount = mockSites.reduce(
    (sum, site) => sum + site.contractAmount,
    0,
  );
  const progressRate = Math.round(
    (totalEarnedValue / totalContractAmount) * 100,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold">施工管理ダッシュボード</h1>
                <p className="text-sm opacity-90 mt-1">
                  {new Date().toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>
              <div className="ml-8 text-right">
                <p className="text-sm opacity-90">ログイン中</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* 工事管理メニュー */}
        <div className="bg-white/10 border-t border-white/20">
          <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-3">
            <div className="flex space-x-6">
              <button
                onClick={() => router.push('/construction/ledger')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <FileText className="h-4 w-4" />
                <span>工事台帳</span>
              </button>
              <button
                onClick={() => router.push('/construction/analysis')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <BarChart3 className="h-4 w-4" />
                <span>原価分析</span>
              </button>
              <button
                onClick={() => router.push('/construction/materials')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <Package className="h-4 w-4" />
                <span>材料・労務</span>
              </button>
              <button
                onClick={() => router.push('/construction/monitoring')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <Activity className="h-4 w-4" />
                <span>収益性監視</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* メインコンテンツ（左側4カラム） */}
          <div className="lg:col-span-4">
            {/* トップ統計 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">新規現場</p>
                    <p className="text-2xl font-bold text-gray-900">2件</p>
                    <p className="text-xs text-gray-500">今月獲得</p>
                  </div>
                  <div className="text-2xl">🏗️</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">完了案件</p>
                    <p className="text-2xl font-bold text-gray-900">5件</p>
                    <p className="text-xs text-gray-500">品質完了</p>
                  </div>
                  <div className="text-2xl">✅</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">安全記録</p>
                    <p className="text-2xl font-bold text-green-600">120日</p>
                    <p className="text-xs text-gray-500">無事故継続</p>
                  </div>
                  <div className="text-2xl">🛡️</div>
                </div>
              </div>
            </div>

            {/* 施工財務分析 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                施工財務分析
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 施工指標 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center">
                    💰 収益指標
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">営業利益</span>
                      <span className="font-bold text-green-800">¥3.2M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">粗利率</span>
                      <span className="font-bold text-green-800">28.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">受注単価</span>
                      <span className="font-bold text-green-800">¥15.2M</span>
                    </div>
                  </div>
                </div>

                {/* 施工効率 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    📈 施工効率
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">工程達成率</span>
                      <span className="font-bold text-blue-800">92.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">品質スコア</span>
                      <span className="font-bold text-blue-800">96点</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">平均工期</span>
                      <span className="font-bold text-blue-800">45日</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 目標進捗 */}
              <div className="mt-6">
                <h3 className="font-bold mb-4 flex items-center">
                  🎯 目標進捗
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">月次売上目標</span>
                      <span className="text-sm font-bold">¥12.5M / ¥15M</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        style={{ width: '83%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">四半期目標</span>
                      <span className="text-sm font-bold">¥35M / ¥42M</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                        style={{ width: '83%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ステータスアイコン */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">📋</div>
                  <p className="text-sm">経費申請</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-sm">在庫確認</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <p className="text-sm">売上分析</p>
                </div>
              </div>
            </div>

            {/* 施工管理センター */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                🎯 施工管理センター
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowSiteModal(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">👷</div>
                    <h3 className="font-bold text-sm">現場管理</h3>
                    <p className="text-xs opacity-90">CRM</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowSafetyModal(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🛡️</div>
                    <h3 className="font-bold text-sm">安全管理</h3>
                    <p className="text-xs opacity-90">安全</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📷</div>
                    <h3 className="font-bold text-sm">工事写真</h3>
                    <p className="text-xs opacity-90">記録</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-4 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🛠️</div>
                    <h3 className="font-bold text-sm">品質管理</h3>
                    <p className="text-xs opacity-90">エリア</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 既存のタブコンテンツ */}

            {/* タブ */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('sites')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'sites'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Building2 className="inline h-4 w-4 mr-2" />
                    現場管理
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'progress'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="inline h-4 w-4 mr-2" />
                    進捗・出来高
                  </button>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === 'materials'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Package className="inline h-4 w-4 mr-2" />
                    資材管理
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* 現場管理タブ */}
                {activeTab === 'sites' && (
                  <div className="space-y-4">
                    {mockSites
                      .sort((a, b) => {
                        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
                        return (
                          priorityOrder[a.priority] - priorityOrder[b.priority]
                        );
                      })
                      .map((site) => (
                        <div
                          key={site.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedSite(site);
                            setShowSiteModal(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg">
                                  {site.name}
                                </h3>
                                {site.priority === 'urgent' && (
                                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                    緊急
                                  </span>
                                )}
                                {site.priority === 'high' && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                                    優先
                                  </span>
                                )}
                                {site.status === 'delayed' && (
                                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                                    遅延
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {site.address}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {site.startTime} - {site.endTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  作業員 {site.workers}名
                                </div>
                                <div className="flex items-center gap-1">
                                  <Banknote className="h-4 w-4" />¥
                                  {(site.earnedValue / 1000000).toFixed(1)}M / ¥
                                  {(site.contractAmount / 1000000).toFixed(1)}M
                                </div>
                              </div>

                              {site.memo && (
                                <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                                  📝 {site.memo}
                                </div>
                              )}
                            </div>

                            <div className="ml-4 text-center">
                              <div className="text-3xl font-bold text-orange-600">
                                {site.progress}%
                              </div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                  style={{ width: `${site.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                進捗率
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* 進捗・出来高タブ */}
                {activeTab === 'progress' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-4">現場別出来高</h3>
                        <div className="space-y-3">
                          {mockSites.map((site) => (
                            <div key={site.id}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">
                                  {site.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  ¥{(site.earnedValue / 1000000).toFixed(1)}M
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                  style={{
                                    width: `${(site.earnedValue / site.contractAmount) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-lg mb-4">月次推移</h3>
                        <div className="h-48 flex items-end justify-between px-4">
                          {[65, 72, 68, 85, 90, 78, 82].map((value, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-8 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t"
                                style={{ height: `${value * 1.5}px` }}
                              />
                              <span className="text-xs text-gray-500 mt-1">
                                {idx + 1}月
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-bold text-yellow-800 mb-2">
                        未承認請求
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>山田様邸 - 追加工事</span>
                          <span className="font-bold text-yellow-800">
                            ¥350,000
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>鈴木様邸 - 仕様変更</span>
                          <span className="font-bold text-yellow-800">
                            ¥180,000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 資材管理タブ */}
                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    {mockMaterials.map((material, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          material.status === 'shortage'
                            ? 'bg-red-50 border-red-200'
                            : material.status === 'unordered'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-orange-50 border-orange-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-lg">
                              {material.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              在庫: {material.remaining}
                              {material.unit} / 必要: {material.required}
                              {material.unit}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              仕入先: {material.supplier} | 納期:{' '}
                              {material.leadTime}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            発注する
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RAGアシスタントサイドバー（右側1カラム） */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                🤖 RAG施工アシスタント
              </h3>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="text-sm font-bold mb-2">おすすめ質問</h4>
                  <div className="space-y-2 text-xs">
                    <div className="cursor-pointer hover:bg-white/10 p-1 rounded">
                      💡 「基礎工事の品質チェックポイントは？」
                    </div>
                    <div className="cursor-pointer hover:bg-white/10 p-1 rounded">
                      💡 「安全管理で注意すべき項目は？」
                    </div>
                    <div className="cursor-pointer hover:bg-white/10 p-1 rounded">
                      💡 「工程遅延時の対応方法は？」
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    placeholder="例: 鉄筋工事の検査基準について教えて..."
                    className="w-full h-20 p-3 rounded-lg text-gray-800 text-sm resize-none"
                  />
                  <button className="w-full mt-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-all">
                    RAGに聞く
                  </button>
                </div>

                <div className="text-xs opacity-90">
                  <h4 className="font-bold mb-2">最近の検索</h4>
                  <div className="space-y-1">
                    <div>• コンクリート品質基準</div>
                    <div>• 足場安全規則</div>
                    <div>• 工程表作成方法</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 今日の現場予定 */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                📅 今日の現場予定
              </h3>
              <div className="space-y-3">
                {mockSites.slice(0, 3).map((site, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r"
                  >
                    <h4 className="font-medium text-sm text-gray-900">
                      {site.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {site.startTime} - {site.endTime}
                    </p>
                    <p className="text-xs text-orange-600">
                      進捗: {site.progress}%
                    </p>
                  </div>
                ))}
                <button className="w-full text-sm text-orange-600 hover:text-orange-700 mt-2">
                  すべての現場を見る →
                </button>
              </div>
            </div>

            {/* 安全アラート */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-red-800 mb-3 flex items-center">
                ⚠️ 安全アラート
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-white rounded p-2">
                  <p className="text-red-700 font-medium">天候注意報</p>
                  <p className="text-xs text-red-600">
                    強風予報 - 高所作業注意
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-red-700 font-medium">安全点検期限</p>
                  <p className="text-xs text-red-600">足場点検 - あと3日</p>
                </div>
              </div>
            </div>

            {/* 品質管理 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                ✅ 品質管理
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">今月合格率</span>
                  <span className="font-bold text-blue-800">96.8%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                    style={{ width: '97%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600">目標: 95% 以上</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 現場詳細モーダル */}
      {showSiteModal && selectedSite && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setSelectedSite(null);
            setShowSiteModal(false);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{selectedSite.name}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">顧客名</p>
                  <p className="font-medium">{selectedSite.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">契約金額</p>
                  <p className="font-medium">
                    ¥{selectedSite.contractAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">住所</p>
                  <p className="font-medium">{selectedSite.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">進捗状況</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1">
                      <div className="w-full h-4 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          style={{ width: `${selectedSite.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xl font-bold text-orange-600">
                      {selectedSite.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {selectedSite.memo && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm">{selectedSite.memo}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition">
                  出来高登録
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition">
                  写真アップロード
                </button>
                <button
                  onClick={() => handleGenerateInvoice(selectedSite)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-1"
                  title="進捗に基づいて請求書を生成"
                >
                  <Receipt className="w-4 h-4" />
                  請求書生成
                </button>
                <button
                  onClick={() => {
                    setSelectedSite(null);
                    setShowSiteModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 安全管理モーダル */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-orange-500" />
              安全管理
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KY活動記録 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">本日のKY活動</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="危険予知内容を入力"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <textarea
                    placeholder="対策内容"
                    className="w-full px-3 py-2 border rounded h-20"
                  />
                  <button className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
                    KY活動記録を保存
                  </button>
                </div>
              </div>

              {/* 安全パトロールチェック */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">安全パトロールチェックリスト</h3>
                <div className="space-y-2">
                  {[
                    '足場の安全確認',
                    '保護具着用確認',
                    '整理整頓',
                    '火気管理',
                    '電気設備確認',
                  ].map((item) => (
                    <label key={item} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                  <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
                    チェック結果を記録
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">ヒヤリハット報告</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="date" className="px-3 py-2 border rounded" />
                <input
                  type="text"
                  placeholder="発生場所"
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="内容"
                  className="px-3 py-2 border rounded"
                />
              </div>
              <textarea
                placeholder="詳細と対策"
                className="w-full mt-3 px-3 py-2 border rounded h-20"
              />
              <button className="mt-3 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
                ヒヤリハット報告を提出
              </button>
            </div>

            <button
              onClick={() => setShowSafetyModal(false)}
              className="mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 材料管理モーダル */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-500" />
              材料管理
            </h2>

            {/* 材料発注 */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-3">材料発注</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select className="px-3 py-2 border rounded">
                  <option>材料カテゴリ選択</option>
                  <option>木材</option>
                  <option>金物</option>
                  <option>塗料</option>
                  <option>電材</option>
                </select>
                <input
                  type="text"
                  placeholder="材料名"
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="数量"
                  className="px-3 py-2 border rounded"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  発注追加
                </button>
              </div>
            </div>

            {/* 在庫状況 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">現場在庫状況</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">材料名</th>
                      <th className="px-3 py-2 text-center">在庫数</th>
                      <th className="px-3 py-2 text-center">必要数</th>
                      <th className="px-3 py-2 text-center">状態</th>
                      <th className="px-3 py-2 text-center">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMaterials.map((material, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-3 py-2">{material.name}</td>
                        <td className="px-3 py-2 text-center">
                          {material.remaining} {material.unit}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {material.required} {material.unit}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {material.status === 'shortage' && (
                            <span className="text-red-600 font-bold">不足</span>
                          )}
                          {material.status === 'unordered' && (
                            <span className="text-orange-600 font-bold">
                              未発注
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600">
                            発注
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setShowMaterialModal(false)}
              className="mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 写真管理モーダル */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Camera className="h-6 w-6 mr-2 text-green-500" />
              工事写真管理
            </h2>

            {/* 写真アップロード */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-3">写真アップロード</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="px-3 py-2 border rounded">
                  <option>工程選択</option>
                  <option>基礎工事</option>
                  <option>躯体工事</option>
                  <option>内装工事</option>
                  <option>外装工事</option>
                </select>
                <input type="date" className="px-3 py-2 border rounded" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="px-3 py-2 border rounded"
                />
              </div>
              <textarea
                placeholder="写真の説明"
                className="w-full mt-3 px-3 py-2 border rounded h-20"
              />
              <button className="mt-3 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                写真をアップロード
              </button>
            </div>

            {/* 写真一覧 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-2">
                  <div className="aspect-square bg-gray-300 rounded mb-2 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600">基礎工事 - 配筋</p>
                  <p className="text-xs text-gray-500">2024/01/15</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPhotoModal(false)}
              className="mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 日報作成モーダル */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-purple-500" />
              工事日報作成
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <div>
                <h3 className="font-bold mb-3">基本情報</h3>
                <div className="space-y-3">
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <select className="w-full px-3 py-2 border rounded">
                    <option>現場選択</option>
                    {mockSites.map((site) => (
                      <option key={site.id}>{site.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="天候"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              {/* 作業内容 */}
              <div>
                <h3 className="font-bold mb-3">作業内容</h3>
                <textarea
                  placeholder="本日の作業内容を記入"
                  className="w-full px-3 py-2 border rounded h-32"
                />
              </div>
            </div>

            {/* 作業員 */}
            <div className="mt-6">
              <h3 className="font-bold mb-3">作業員</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="作業員名"
                  className="px-3 py-2 border rounded"
                />
                <select className="px-3 py-2 border rounded">
                  <option>職種</option>
                  <option>大工</option>
                  <option>電気工</option>
                  <option>配管工</option>
                </select>
                <input type="time" className="px-3 py-2 border rounded" />
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  追加
                </button>
              </div>
            </div>

            {/* 進捗・課題 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">進捗状況</h3>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="100" className="flex-1" />
                  <span className="font-bold">60%</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-3">課題・連絡事項</h3>
                <textarea
                  placeholder="課題や連絡事項を記入"
                  className="w-full px-3 py-2 border rounded h-20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
                日報を保存
              </button>
              <button className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600">
                日報を送信
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
