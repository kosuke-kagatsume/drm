'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Send,
  Filter,
  Search
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  type: 'estimate' | 'contract' | 'order' | 'invoice';
  typeLabel: string;
  title: string;
  projectName: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  currentApprover: string;
  approvalFlowName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);

      // サンプルデータ（実際はAPIから取得）
      const sampleApprovals: ApprovalItem[] = [
        {
          id: 'APR-001',
          type: 'estimate',
          typeLabel: '見積',
          title: 'EST-2024-001',
          projectName: '田中様邸新築工事',
          amount: 100000000,
          requestedBy: '山田営業',
          requestedAt: '2024-10-07T10:00:00Z',
          status: 'pending',
          currentApprover: '鈴木部長',
          approvalFlowName: '高額案件承認フロー',
          priority: 'high',
        },
        {
          id: 'APR-002',
          type: 'contract',
          typeLabel: '契約',
          title: 'CON-2024-001',
          projectName: '山田ビル改修工事',
          amount: 35750000,
          requestedBy: '佐藤営業',
          requestedAt: '2024-10-06T14:00:00Z',
          status: 'pending',
          currentApprover: '鈴木部長',
          approvalFlowName: '通常承認フロー',
          priority: 'medium',
        },
        {
          id: 'APR-003',
          type: 'order',
          typeLabel: '発注',
          title: 'ORD-2024-003',
          projectName: '佐々木様邸リフォーム',
          amount: 15000000,
          requestedBy: '田中施工管理',
          requestedAt: '2024-10-05T09:00:00Z',
          status: 'approved',
          currentApprover: '鈴木部長',
          approvalFlowName: '発注承認フロー',
          priority: 'medium',
        },
        {
          id: 'APR-004',
          type: 'invoice',
          typeLabel: '請求',
          title: 'INV-2024-003',
          projectName: '高橋様邸新築工事',
          amount: 50000000,
          requestedBy: '伊藤経理',
          requestedAt: '2024-10-04T16:00:00Z',
          status: 'approved',
          currentApprover: '鈴木部長',
          approvalFlowName: '請求承認フロー',
          priority: 'high',
        },
      ];

      setApprovals(sampleApprovals);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    if (!confirm('この申請を承認しますか？')) return;

    try {
      // 実際はAPIを呼び出す
      // await fetch(`/api/approvals/${approvalId}/approve`, { method: 'POST' });

      setApprovals(prev =>
        prev.map(item =>
          item.id === approvalId ? { ...item, status: 'approved' as const } : item
        )
      );

      alert('承認しました');
    } catch (error) {
      console.error('Error approving:', error);
      alert('承認に失敗しました');
    }
  };

  const handleReject = async (approvalId: string) => {
    const reason = prompt('却下理由を入力してください:');
    if (!reason) return;

    try {
      // 実際はAPIを呼び出す
      // await fetch(`/api/approvals/${approvalId}/reject`, {
      //   method: 'POST',
      //   body: JSON.stringify({ reason }),
      // });

      setApprovals(prev =>
        prev.map(item =>
          item.id === approvalId ? { ...item, status: 'rejected' as const } : item
        )
      );

      alert('却下しました');
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('却下に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: '承認待ち', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: '承認済み', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: '却下', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { label: '低', color: 'bg-gray-100 text-gray-800' },
      medium: { label: '中', color: 'bg-blue-100 text-blue-800' },
      high: { label: '高', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: '緊急', color: 'bg-red-100 text-red-800 font-bold' },
    };
    return badges[priority as keyof typeof badges] || badges.medium;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      estimate: FileText,
      contract: FileText,
      order: Send,
      invoice: DollarSign,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesStatus = filter === 'all' || approval.status === filter;
    const matchesType = typeFilter === 'all' || approval.type === typeFilter;
    const matchesSearch =
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    total: approvals.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              承認管理
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              見積・契約・発注・請求の承認を管理します
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">承認済み</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">却下</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総件数</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="番号、プロジェクト名、申請者で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全てのステータス</option>
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全ての種別</option>
                <option value="estimate">見積</option>
                <option value="contract">契約</option>
                <option value="order">発注</option>
                <option value="invoice">請求</option>
              </select>
            </div>
          </div>
        </div>

        {/* 承認一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロジェクト名
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申請者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    優先度
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
                {filteredApprovals.map((approval) => {
                  const statusBadge = getStatusBadge(approval.status);
                  const priorityBadge = getPriorityBadge(approval.priority);
                  const TypeIcon = getTypeIcon(approval.type);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={approval.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {approval.typeLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {approval.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {approval.projectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        ¥{approval.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {approval.requestedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadge.color}`}
                        >
                          {priorityBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {approval.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(approval.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              承認
                            </button>
                            <button
                              onClick={() => handleReject(approval.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              却下
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredApprovals.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">承認案件が見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
