'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Plus,
  Star,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface Partner {
  id: string;
  code: string;
  name: string;
  nameKana?: string;
  category: string;
  specialties: string[];
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating: number;
  totalTransactions: number;
  totalAmount: number;
  lastTransactionDate?: string;
  performance: {
    onTimeDeliveryRate: number;
    qualityScore: number;
    costEfficiency: number;
    communicationScore: number;
    safetyRecord: number;
  };
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  dwSyncStatus: 'not_synced' | 'synced' | 'error';
  notes?: string;
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/partners');
      if (!response.ok) throw new Error('Failed to fetch partners');
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      alert('協力会社データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: '取引中', icon: CheckCircle },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: '休止中', icon: AlertCircle },
      suspended: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '停止中', icon: AlertCircle },
      blacklisted: { bg: 'bg-red-100', text: 'text-red-800', label: 'ブラックリスト', icon: XCircle },
    };
    const cfg = config[status as keyof typeof config] || config.active;
    const Icon = cfg.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      searchTerm === '' ||
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partner.nameKana?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || partner.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
    const matchesRating = partner.rating >= minRating;

    return matchesSearch && matchesCategory && matchesStatus && matchesRating;
  });

  const categories = Array.from(new Set(partners.map((p) => p.category)));

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === 'active').length,
    avgRating: partners.length > 0
      ? (partners.reduce((sum, p) => sum + p.rating, 0) / partners.length).toFixed(1)
      : '0',
    totalAmount: partners.reduce((sum, p) => sum + p.totalAmount, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-7 w-7 text-blue-500" />
                協力会社マスタ管理
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                発注先の協力会社情報を管理
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/partners/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              新規登録
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">登録協力会社</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">取引中</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均評価</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.avgRating}</p>
              </div>
              <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">累計取引額</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ¥{(stats.totalAmount / 100000000).toFixed(1)}億
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="会社名・コードで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての業種</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="active">取引中</option>
              <option value="inactive">休止中</option>
              <option value="suspended">停止中</option>
              <option value="blacklisted">ブラックリスト</option>
            </select>

            <select
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">すべての評価</option>
              <option value="4">★4以上</option>
              <option value="5">★5のみ</option>
            </select>
          </div>
        </div>

        {/* 協力会社一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    会社情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    業種・専門分野
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    評価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    取引実績
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                        <div className="text-xs text-gray-500">{partner.code}</div>
                        {partner.contactPerson && (
                          <div className="text-xs text-gray-500 mt-1">担当: {partner.contactPerson}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{partner.category}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {partner.specialties.slice(0, 2).map((specialty, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                            >
                              {specialty}
                            </span>
                          ))}
                          {partner.specialties.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded">
                              +{partner.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRatingStars(partner.rating)}
                      <div className="text-xs text-gray-500 mt-1">
                        納期遵守率: {partner.performance.onTimeDeliveryRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.totalTransactions}件</div>
                      <div className="text-sm text-gray-500">
                        ¥{partner.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(partner.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/partners/${partner.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPartners.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">該当する協力会社が見つかりません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
