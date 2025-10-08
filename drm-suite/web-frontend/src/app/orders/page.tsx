'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  RefreshCw,
  Eye,
  Send,
} from 'lucide-react';

interface Order {
  id: string;
  drmOrderId: string;
  dwOrderId?: string;
  contractNo: string;
  projectName: string;
  partnerName: string;
  orderNo: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  dwSyncStatus: string;
  orderDeadline: string;
  daysUntilDeadline: number;
  isOverdue: boolean;
  manager: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSyncStatus, setSelectedSyncStatus] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('発注データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToDW = async (orderId: string) => {
    try {
      const response = await fetch('/api/orders/sync-to-dw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error('Failed to sync to DW');

      alert('DWへの送信が完了しました');
      loadOrders();
    } catch (error) {
      console.error('Error syncing to DW:', error);
      alert('DWへの送信に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: '下書き', icon: Clock },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '承認待ち', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: '承認済み', icon: CheckCircle },
      sent_to_dw: { bg: 'bg-green-100', text: 'text-green-800', label: 'DW送信済み', icon: Send },
      in_progress: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: '進行中', icon: RefreshCw },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: '完了', icon: CheckCircle },
    };
    const cfg = config[status] || config.draft;
    const Icon = cfg.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
    );
  };

  const getSyncStatusBadge = (syncStatus: string) => {
    const config: any = {
      not_synced: { bg: 'bg-gray-100', text: 'text-gray-800', label: '未送信' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '送信中' },
      synced: { bg: 'bg-green-100', text: 'text-green-800', label: '同期済み' },
      error: { bg: 'bg-red-100', text: 'text-red-800', label: 'エラー' },
    };
    const cfg = config[syncStatus] || config.not_synced;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  };

  const getDeadlineBadge = (daysUntilDeadline: number, isOverdue: boolean) => {
    if (isOverdue || daysUntilDeadline <= 0) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          期限超過
        </span>
      );
    }
    if (daysUntilDeadline <= 3) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          あと{daysUntilDeadline}日
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
        あと{daysUntilDeadline}日
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.partnerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSyncStatus = selectedSyncStatus === 'all' || order.dwSyncStatus === selectedSyncStatus;

    return matchesSearch && matchesStatus && matchesSyncStatus;
  });

  const stats = {
    total: orders.length,
    notSynced: orders.filter(o => o.dwSyncStatus === 'not_synced').length,
    synced: orders.filter(o => o.dwSyncStatus === 'synced').length,
    overdue: orders.filter(o => o.isOverdue).length,
    totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
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
                <FileText className="h-7 w-7 text-blue-500" />
                発注管理
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                協力会社への発注管理とDW連携
              </p>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              更新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総発注数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未送信</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.notSynced}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DW同期済み</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.synced}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">期限超過</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総発注額</p>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  ¥{(stats.totalAmount / 100000000).toFixed(1)}億
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="プロジェクト名・発注番号で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="draft">下書き</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="sent_to_dw">DW送信済み</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
            </select>

            <select
              value={selectedSyncStatus}
              onChange={(e) => setSelectedSyncStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての同期状態</option>
              <option value="not_synced">未送信</option>
              <option value="pending">送信中</option>
              <option value="synced">同期済み</option>
              <option value="error">エラー</option>
            </select>
          </div>
        </div>

        {/* 発注一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    発注情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    協力会社
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    発注金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DW連携
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.projectName}</div>
                        <div className="text-xs text-gray-500">{order.orderNo}</div>
                        <div className="text-xs text-gray-500">契約: {order.contractNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{order.partnerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{order.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          {order.orderDeadline}
                        </div>
                        {getDeadlineBadge(order.daysUntilDeadline, order.isOverdue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {getSyncStatusBadge(order.dwSyncStatus)}
                        {order.dwOrderId && (
                          <div className="text-xs text-gray-500 mt-1">
                            DW: {order.dwOrderId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.dwSyncStatus === 'not_synced' && order.status === 'approved' && (
                          <button
                            onClick={() => handleSyncToDW(order.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">該当する発注が見つかりません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
