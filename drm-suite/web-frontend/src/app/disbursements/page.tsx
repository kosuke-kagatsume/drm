'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  Building2,
  FileText,
} from 'lucide-react';

// API型定義
interface DisbursementSchedule {
  id: string;
  orderNo: string;
  partnerCompany: string;
  scheduledDate: string;
  amount: number;
  paymentMethod: string;
  status: 'scheduled' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  alertLevel?: 'none' | 'warning' | 'danger' | 'critical';
  alertMessage?: string;
  daysUntilDue?: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface DisbursementRecord {
  id: string;
  orderNo: string;
  partnerCompany: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference?: string;
  notes?: string;
}

export default function DisbursementsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [schedules, setSchedules] = useState<DisbursementSchedule[]>([]);
  const [records, setRecords] = useState<DisbursementRecord[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedules' | 'records'>('schedules');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 支払予定を取得
  const fetchSchedules = async () => {
    try {
      setIsLoadingSchedules(true);
      setError(null);
      const response = await fetch('/api/disbursement-schedules');
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // 支払実績を取得
  const fetchRecords = async () => {
    try {
      setIsLoadingRecords(true);
      const response = await fetch('/api/disbursements');
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      if (data.success) {
        setRecords(data.disbursements || []);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchRecords();
    }
  }, [user]);

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '予定';
      case 'approved':
        return '承認済み';
      case 'paid':
      case 'completed':
        return '支払済み';
      case 'overdue':
        return '遅延';
      case 'pending':
        return '保留中';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  // フィルタリング
  const filteredSchedules = schedules.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const filteredRecords = records.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  // 統計計算
  const scheduleStats = {
    total: schedules.length,
    totalAmount: schedules.reduce((sum, s) => sum + s.amount, 0),
    overdue: schedules.filter(s => s.status === 'overdue').length,
    overdueAmount: schedules.filter(s => s.status === 'overdue').reduce((sum, s) => sum + s.amount, 0),
    pending: schedules.filter(s => s.approvalStatus === 'pending').length,
  };

  const recordStats = {
    total: records.length,
    totalAmount: records.reduce((sum, r) => sum + r.amount, 0),
    completed: records.filter(r => r.status === 'completed').length,
    completedAmount: records.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
  };

  if (isAuthLoading) {
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">支払管理</h1>
              <p className="text-sm text-gray-600 mt-1">協力会社への支払予定と実績を管理</p>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="flex border-t">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'schedules'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              支払予定 ({schedules.length})
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'records'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              支払実績 ({records.length})
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {activeTab === 'schedules' ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">支払予定件数</p>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{scheduleStats.total}件</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">予定総額</p>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(scheduleStats.totalAmount)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-red-600 font-medium">遅延中</p>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900">{scheduleStats.overdue}件</p>
                <p className="text-sm text-red-600 mt-1">{formatCurrency(scheduleStats.overdueAmount)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-orange-600 font-medium">承認待ち</p>
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-900">{scheduleStats.pending}件</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">支払実績件数</p>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{recordStats.total}件</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">支払総額</p>
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(recordStats.totalAmount)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-600 font-medium">完了</p>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{recordStats.completed}件</p>
                <p className="text-sm text-green-600 mt-1">{formatCurrency(recordStats.completedAmount)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">平均支払額</p>
                  <DollarSign className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {recordStats.total > 0 ? formatCurrency(Math.round(recordStats.totalAmount / recordStats.total)) : '¥0'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* フィルタ */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">ステータス:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべて</option>
              {activeTab === 'schedules' ? (
                <>
                  <option value="scheduled">予定</option>
                  <option value="approved">承認済み</option>
                  <option value="paid">支払済み</option>
                  <option value="overdue">遅延</option>
                  <option value="cancelled">キャンセル</option>
                </>
              ) : (
                <>
                  <option value="completed">完了</option>
                  <option value="pending">保留中</option>
                  <option value="cancelled">キャンセル</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* 支払予定タブ */}
        {activeTab === 'schedules' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoadingSchedules ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">支払予定がありません</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">発注番号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">協力会社</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">予定日</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">金額</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">支払方法</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">ステータス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">アラート</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{schedule.orderNo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{schedule.partnerCompany}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {schedule.scheduledDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(schedule.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {schedule.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(schedule.status)}`}>
                            {getStatusLabel(schedule.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {schedule.alertMessage && schedule.alertLevel !== 'none' && (
                            <div className="flex items-center gap-2">
                              <AlertCircle
                                className={`h-4 w-4 ${
                                  schedule.alertLevel === 'critical'
                                    ? 'text-red-600'
                                    : schedule.alertLevel === 'danger'
                                    ? 'text-orange-600'
                                    : 'text-yellow-600'
                                }`}
                              />
                              <span className="text-xs text-gray-600">{schedule.alertMessage}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 支払実績タブ */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoadingRecords ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">支払実績がありません</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">発注番号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">協力会社</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">支払日</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">金額</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">支払方法</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">ステータス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">参照番号</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{record.orderNo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{record.partnerCompany}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.paymentDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(record.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(record.status)}`}>
                            {getStatusLabel(record.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.reference || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
