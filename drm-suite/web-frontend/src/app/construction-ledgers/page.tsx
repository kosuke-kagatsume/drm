'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
} from 'lucide-react';

interface ConstructionLedger {
  id: string;
  constructionNo: string;
  constructionName: string;
  constructionType: string;
  constructionCategory: string;
  customerName: string;
  customerCompany?: string;
  constructionAddress: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  totalContractAmount: number;
  executionBudget?: {
    totalBudget: number;
    expectedProfit: number;
    expectedProfitRate: number;
  };
  actualCost?: {
    totalCost: number;
    actualProfit: number;
    actualProfitRate: number;
  };
  costAnalysis?: {
    budgetVsActual: {
      totalVariance: number;
      varianceRate: number;
    };
  };
  progress: {
    status: 'not_started' | 'in_progress' | 'completed' | 'suspended' | 'cancelled';
    progressRate: number;
    completedWorkValue: number;
    billedAmount: number;
    receivedAmount: number;
  };
  salesPerson: string;
  constructionManager: string;
  status: 'planning' | 'approved' | 'in_progress' | 'completed' | 'suspended' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function ConstructionLedgersPage() {
  const router = useRouter();
  const [ledgers, setLedgers] = useState<ConstructionLedger[]>([]);
  const [filteredLedgers, setFilteredLedgers] = useState<ConstructionLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [salesPersonFilter, setSalesPersonFilter] = useState<string>('all');

  useEffect(() => {
    fetchLedgers();
  }, []);

  useEffect(() => {
    filterLedgers();
  }, [ledgers, searchTerm, statusFilter, typeFilter, salesPersonFilter]);

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/construction-ledgers');
      const data = await response.json();

      if (data.success) {
        setLedgers(data.ledgers);
      }
    } catch (error) {
      console.error('Error fetching construction ledgers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLedgers = () => {
    let filtered = [...ledgers];

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    // 工事種別フィルター
    if (typeFilter !== 'all') {
      filtered = filtered.filter((l) => l.constructionType === typeFilter);
    }

    // 営業担当フィルター
    if (salesPersonFilter !== 'all') {
      filtered = filtered.filter((l) => l.salesPerson === salesPersonFilter);
    }

    // 検索フィルター
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.constructionName.toLowerCase().includes(searchLower) ||
          l.constructionNo.toLowerCase().includes(searchLower) ||
          l.customerName.toLowerCase().includes(searchLower) ||
          (l.customerCompany && l.customerCompany.toLowerCase().includes(searchLower))
      );
    }

    setFilteredLedgers(filtered);
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      planning: '計画中',
      approved: '承認済み',
      in_progress: '施工中',
      completed: '完了',
      suspended: '中断',
      cancelled: 'キャンセル',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      planning: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      suspended: 'bg-orange-100 text-orange-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getProgressStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      not_started: '未着工',
      in_progress: '施工中',
      completed: '完了',
      suspended: '中断',
      cancelled: 'キャンセル',
    };
    return labels[status] || status;
  };

  // 統計情報の計算
  const stats = {
    total: filteredLedgers.length,
    totalContractAmount: filteredLedgers.reduce((sum, l) => sum + l.totalContractAmount, 0),
    inProgress: filteredLedgers.filter((l) => l.status === 'in_progress').length,
    averageProgress:
      filteredLedgers.length > 0
        ? filteredLedgers.reduce((sum, l) => sum + l.progress.progressRate, 0) /
          filteredLedgers.length
        : 0,
  };

  // ユニーク値の取得
  const uniqueTypes = Array.from(new Set(ledgers.map((l) => l.constructionType)));
  const uniqueSalesPersons = Array.from(new Set(ledgers.map((l) => l.salesPerson)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  工事台帳
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  工事の進捗・原価・収支を一元管理
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/construction-ledgers/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              新規工事登録
            </button>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総工事件数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}件</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総契約金額</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ¥{stats.totalContractAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">施工中</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}件</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均進捗率</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.averageProgress.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="工事名・工事番号・顧客名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべてのステータス</option>
              <option value="planning">計画中</option>
              <option value="approved">承認済み</option>
              <option value="in_progress">施工中</option>
              <option value="completed">完了</option>
              <option value="suspended">中断</option>
              <option value="cancelled">キャンセル</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべての工事種別</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={salesPersonFilter}
              onChange={(e) => setSalesPersonFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべての営業担当</option>
              {uniqueSalesPersons.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 工事台帳一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredLedgers.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">工事台帳が見つかりません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工事番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工事名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      契約金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      進捗
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      粗利率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLedgers.map((ledger) => (
                    <tr key={ledger.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ledger.constructionNo}
                        </div>
                        <div className="text-xs text-gray-500">{ledger.constructionType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ledger.constructionName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {ledger.constructionAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ledger.customerName}</div>
                        {ledger.customerCompany && (
                          <div className="text-xs text-gray-500">{ledger.customerCompany}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {ledger.scheduledStartDate}
                        </div>
                        <div className="text-sm text-gray-500">～ {ledger.scheduledEndDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ¥{ledger.totalContractAmount.toLocaleString()}
                        </div>
                        {ledger.executionBudget && (
                          <div className="text-xs text-gray-500">
                            予算: ¥{ledger.executionBudget.totalBudget.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${ledger.progress.progressRate}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {ledger.progress.progressRate}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getProgressStatusLabel(ledger.progress.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ledger.actualCost ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ledger.actualCost.actualProfitRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              実績粗利: ¥{ledger.actualCost.actualProfit.toLocaleString()}
                            </div>
                          </div>
                        ) : ledger.executionBudget ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ledger.executionBudget.expectedProfitRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              予定粗利: ¥{ledger.executionBudget.expectedProfit.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            ledger.status
                          )}`}
                        >
                          {getStatusLabel(ledger.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/construction-ledgers/${ledger.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
