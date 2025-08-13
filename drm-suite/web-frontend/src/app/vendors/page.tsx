'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  distance: number;
  qualityScore: number;
  priceLevel: 'low' | 'medium' | 'high';
  availability: 'immediate' | 'next_week' | 'busy';
  completedProjects: number;
  claimCount: number;
  averageDelay: number;
  paymentTerms: string;
  notes: string;
}

export default function VendorsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      name: '山田建設',
      category: '足場',
      contactPerson: '山田太郎',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
      address: '東京都世田谷区',
      distance: 5,
      qualityScore: 95,
      priceLevel: 'low',
      availability: 'immediate',
      completedProjects: 125,
      claimCount: 2,
      averageDelay: 0.5,
      paymentTerms: '月末締め翌月末払い',
      notes: '対応が早く、品質も安定している',
    },
    {
      id: '2',
      name: '佐藤塗装',
      category: '塗装',
      contactPerson: '佐藤次郎',
      phone: '090-2345-6789',
      email: 'sato@example.com',
      address: '東京都杉並区',
      distance: 8,
      qualityScore: 90,
      priceLevel: 'medium',
      availability: 'next_week',
      completedProjects: 89,
      claimCount: 3,
      averageDelay: 1.2,
      paymentTerms: '月末締め翌月末払い',
      notes: '技術力は高いが、繁忙期は注意',
    },
    {
      id: '3',
      name: '鈴木電気',
      category: '電気',
      contactPerson: '鈴木三郎',
      phone: '090-3456-7890',
      email: 'suzuki@example.com',
      address: '東京都練馬区',
      distance: 12,
      qualityScore: 88,
      priceLevel: 'high',
      availability: 'busy',
      completedProjects: 67,
      claimCount: 1,
      averageDelay: 0.8,
      paymentTerms: '即金',
      notes: '品質は良いが単価が高め',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getAvailabilityBadge = (availability: string) => {
    const colors = {
      immediate: 'bg-green-100 text-green-800',
      next_week: 'bg-yellow-100 text-yellow-800',
      busy: 'bg-red-100 text-red-800',
    };
    const labels = {
      immediate: '即対応可',
      next_week: '来週可',
      busy: '繁忙',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[availability as keyof typeof colors]}`}
      >
        {labels[availability as keyof typeof labels]}
      </span>
    );
  };

  const getPriceLevelBadge = (level: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-gray-100 text-gray-800',
      high: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      low: '安価',
      medium: '標準',
      high: '高価',
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[level as keyof typeof colors]}`}
      >
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesCategory =
      selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'all',
    '足場',
    '塗装',
    '電気',
    '配管',
    '大工',
    '内装',
    '外構',
  ];

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
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← ダッシュボード
            </button>
            <h1 className="text-2xl font-bold text-gray-900">協力会社管理</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              登録会社数
            </h3>
            <p className="text-3xl font-bold text-gray-900">{vendors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              即対応可能
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {vendors.filter((v) => v.availability === 'immediate').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              平均品質スコア
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {(
                vendors.reduce((sum, v) => sum + v.qualityScore, 0) /
                vendors.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              今月の発注数
            </h3>
            <p className="text-3xl font-bold text-purple-600">42</p>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="会社名・業種で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-md w-64"
              />
              <div className="flex space-x-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? '全て' : cat}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + 協力会社追加
            </button>
          </div>
        </div>

        {/* 協力会社リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                  </div>
                  {getAvailabilityBadge(vendor.availability)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">担当者:</span>
                    <span className="font-medium">{vendor.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">電話:</span>
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">距離:</span>
                    <span>{vendor.distance}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">価格帯:</span>
                    {getPriceLevelBadge(vendor.priceLevel)}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">品質スコア</span>
                    <span className="text-sm font-bold">
                      {vendor.qualityScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        vendor.qualityScore >= 90
                          ? 'bg-green-500'
                          : vendor.qualityScore >= 80
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${vendor.qualityScore}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">完了案件</p>
                    <p className="font-bold">{vendor.completedProjects}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">クレーム</p>
                    <p className="font-bold text-red-600">
                      {vendor.claimCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-600">平均遅延</p>
                    <p className="font-bold">{vendor.averageDelay}日</p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
                    発注
                  </button>
                  <button className="flex-1 border border-gray-300 py-2 rounded text-sm hover:bg-gray-50">
                    詳細
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 協力会社追加モーダル（簡略版） */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">協力会社追加</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="会社名"
                className="w-full px-3 py-2 border rounded-md"
              />
              <select className="w-full px-3 py-2 border rounded-md">
                <option>業種を選択</option>
                <option>足場</option>
                <option>塗装</option>
                <option>電気</option>
                <option>配管</option>
              </select>
              <input
                type="text"
                placeholder="担当者名"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="tel"
                placeholder="電話番号"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
