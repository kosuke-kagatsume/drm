'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// API型定義からインポート（API側の型を使用）
interface Invoice {
  id: string;
  tenantId: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  contractId: string;
  contractNo: string;
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  projectName: string;
  projectType: string;
  items: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string;
  paymentMethod: string;
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  paidAmount: number;
  paidDate?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  sentDate?: string;
  sentMethod?: 'email' | 'mail' | 'hand' | 'fax';
  sentTo?: string;
  notes?: string;
  internalNotes?: string;
  createdBy: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

interface InvoiceStats {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  averageDaysToPayment: number;
  thisMonthInvoiced: number;
  thisMonthPaid: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'date' | 'amount' | 'customer' | 'status'
  >('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // APIから取得した請求書データ
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API: 請求書一覧を取得
  const fetchInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      setError(null);
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      if (data.success) {
        setInvoices(data.invoices || []);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);


  // 統計計算（API型に合わせて修正）
  const stats: InvoiceStats = useMemo(() => {
    const totalInvoiced = invoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const totalPaid = invoices
      .filter((inv) => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = invoices
      .filter((inv) => inv.paymentStatus !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    const overdueAmount = invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

    // 今月の請求書
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthInvoiced = invoices
      .filter((inv) => inv.invoiceDate.startsWith(thisMonth))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const thisMonthPaid = invoices
      .filter((inv) => inv.paidDate?.startsWith(thisMonth))
      .reduce((sum, inv) => sum + inv.paidAmount, 0);

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      overdueAmount,
      averageDaysToPayment: 15, // 仮の値
      thisMonthInvoiced,
      thisMonthPaid,
    };
  }, [invoices]);

  // フィルタリング（API型に合わせて修正）
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // ステータスフィルター
    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filterStatus);
    }

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 日付範囲フィルター
    if (filterDateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date();

      if (filterDateRange === 'this-month') {
        filterDate.setMonth(today.getMonth());
        filtered = filtered.filter(
          (inv) => new Date(inv.invoiceDate) >= filterDate,
        );
      } else if (filterDateRange === 'last-30-days') {
        filterDate.setDate(today.getDate() - 30);
        filtered = filtered.filter(
          (inv) => new Date(inv.invoiceDate) >= filterDate,
        );
      }
    }

    // ソート
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.invoiceDate).getTime();
          bVal = new Date(b.invoiceDate).getTime();
          break;
        case 'amount':
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case 'customer':
          aVal = (a.customerCompany || a.customerName).toLowerCase();
          bVal = (b.customerCompany || b.customerName).toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [invoices, filterStatus, searchTerm, filterDateRange, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'issued':
        return '発行済み';
      case 'sent':
        return '送付済み';
      case 'overdue':
        return '期限超過';
      case 'paid':
        return '支払済み';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;

  const handleBulkAction = (action: string) => {
    alert(
      `${selectedInvoices.length}件の請求書に対して「${action}」を実行します`,
    );
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    );
  };

  if (isLoading || isLoadingInvoices || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-800 font-bold mb-2">データの読み込みに失敗しました</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInvoices}
            className="px-6 py-2.5 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">請求書管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  請求書の作成・送付・管理
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {selectedInvoices.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedInvoices.length}件選択中
                  </span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    一括操作
                  </button>
                </div>
              )}
              <button
                onClick={() => router.push('/invoices/templates')}
                className="px-4 py-2 bg-dandori-sky text-white rounded-lg hover:shadow-md transition-all"
              >
                📄 テンプレート
              </button>
              <button
                onClick={() => router.push('/invoices/management')}
                className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition flex items-center gap-2"
              >
                🏗️ 分割請求管理
              </button>
              <button
                onClick={() => router.push('/invoices/create')}
                className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                新規請求書作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総請求額</p>
                <p className="text-2xl font-bold text-dandori-blue">
                  {formatCurrency(stats.totalInvoiced)}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">入金済み</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未収金</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalOutstanding)}
                </p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">期限超過</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.overdueAmount)}
                </p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>
        </div>

        {/* フィルターとコントロール */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 請求書検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
              >
                <option value="all">全ステータス</option>
                <option value="draft">下書き</option>
                <option value="issued">発行済み</option>
                <option value="sent">送付済み</option>
                <option value="overdue">期限超過</option>
                <option value="paid">支払済み</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
              >
                <option value="all">全期間</option>
                <option value="this-month">今月</option>
                <option value="last-30-days">過去30日</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
              >
                <option value="date-desc">発行日(新しい順)</option>
                <option value="date-asc">発行日(古い順)</option>
                <option value="amount-desc">金額(高い順)</option>
                <option value="amount-asc">金額(低い順)</option>
                <option value="customer-asc">顧客名(A-Z)</option>
                <option value="status-asc">ステータス順</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-l-lg`}
                >
                  📋 リスト
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-r-lg`}
                >
                  🔲 グリッド
                </button>
              </div>
            </div>
          </div>

          {/* 一括操作メニュー */}
          {showBulkActions && selectedInvoices.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('送付')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  📧 一括送付
                </button>
                <button
                  onClick={() => handleBulkAction('督促')}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  ⚠️ 督促状送付
                </button>
                <button
                  onClick={() => handleBulkAction('PDF出力')}
                  className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  📄 PDF出力
                </button>
                <button
                  onClick={() => handleBulkAction('削除')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️ 削除
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 請求書一覧 */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices(
                              filteredInvoices.map((inv) => inv.id),
                            );
                          } else {
                            setSelectedInvoices([]);
                          }
                        }}
                        checked={
                          selectedInvoices.length === filteredInvoices.length &&
                          filteredInvoices.length > 0
                        }
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      請求書番号
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      案件名・顧客
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      金額
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      発行日
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      支払期限
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      進捗
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleInvoiceSelect(invoice.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNo}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {invoice.contractNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.projectName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.customerCompany || invoice.customerName}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {invoice.projectType}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">税込</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {invoice.invoiceDate}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {invoice.dueDate}
                        </div>
                        {invoice.status === 'overdue' && (
                          <div className="text-xs text-red-600 font-medium">
                            {Math.floor(
                              (new Date().getTime() -
                                new Date(invoice.dueDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}
                            日超過
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {(() => {
                          const paymentProgress = invoice.totalAmount > 0
                            ? Math.round((invoice.paidAmount / invoice.totalAmount) * 100)
                            : 0;
                          return paymentProgress > 0 ? (
                            <div className="w-16 mx-auto">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{paymentProgress}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${paymentProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">未入金</span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                            className="p-1 text-dandori-blue hover:bg-dandori-blue hover:text-white rounded"
                            title="詳細"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/invoices/${invoice.id}/edit`)
                            }
                            className="p-1 text-orange-600 hover:bg-orange-600 hover:text-white rounded"
                            title="編集"
                          >
                            ✏️
                          </button>
                          <button
                            className="p-1 text-green-600 hover:bg-green-600 hover:text-white rounded"
                            title="送付"
                          >
                            📧
                          </button>
                          <button
                            className="p-1 text-purple-600 hover:bg-purple-600 hover:text-white rounded"
                            title="PDF"
                          >
                            📄
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{invoice.invoiceNo}</h3>
                      <p className="text-sm text-gray-600">
                        {invoice.projectName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                    >
                      {getStatusLabel(invoice.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{invoice.customerCompany || invoice.customerName}</p>
                    <p className="text-2xl font-bold text-dandori-blue">
                      {formatCurrency(invoice.totalAmount)}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p>発行: {invoice.invoiceDate}</p>
                    <p>期限: {invoice.dueDate}</p>
                  </div>

                  {(() => {
                    const paymentProgress = invoice.totalAmount > 0
                      ? Math.round((invoice.paidAmount / invoice.totalAmount) * 100)
                      : 0;
                    return paymentProgress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>入金進捗</span>
                          <span>{paymentProgress}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                      className="flex-1 py-2 bg-dandori-blue text-white rounded hover:bg-dandori-blue-dark"
                    >
                      詳細
                    </button>
                    <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                      📧
                    </button>
                    <button className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                      📄
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600 mb-4">該当する請求書がありません</p>
            <button
              onClick={() => router.push('/invoices/create')}
              className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg"
            >
              新規請求書を作成
            </button>
          </div>
        )}
      </div>

      {/* 請求書詳細モーダル */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedInvoice.invoiceNo}
                  </h2>
                  <p className="text-gray-600">{selectedInvoice.projectName}</p>
                  <p className="text-sm text-gray-500">契約番号: {selectedInvoice.contractNo}</p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold mb-3">顧客情報</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">顧客名:</span>{' '}
                      {selectedInvoice.customerName}
                    </p>
                    <p>
                      <span className="text-gray-600">会社名:</span>{' '}
                      {selectedInvoice.customerCompany}
                    </p>
                    <p>
                      <span className="text-gray-600">住所:</span>{' '}
                      {selectedInvoice.customerAddress}
                    </p>
                    {selectedInvoice.customerEmail && (
                      <p>
                        <span className="text-gray-600">メール:</span>{' '}
                        {selectedInvoice.customerEmail}
                      </p>
                    )}
                    {selectedInvoice.customerPhone && (
                      <p>
                        <span className="text-gray-600">電話:</span>{' '}
                        {selectedInvoice.customerPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3">請求情報</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">発行日:</span>{' '}
                      {selectedInvoice.invoiceDate}
                    </p>
                    <p>
                      <span className="text-gray-600">支払期限:</span>{' '}
                      {selectedInvoice.dueDate}
                    </p>
                    <p>
                      <span className="text-gray-600">支払方法:</span>{' '}
                      {selectedInvoice.paymentMethod}
                    </p>
                    <p>
                      <span className="text-gray-600">ステータス:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedInvoice.status)}`}
                      >
                        {getStatusLabel(selectedInvoice.status)}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">入金状況:</span>{' '}
                      <span className="font-medium">
                        ¥{selectedInvoice.paidAmount.toLocaleString()} / ¥{selectedInvoice.totalAmount.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3">明細</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left border">項目</th>
                        <th className="px-4 py-2 text-center border">数量</th>
                        <th className="px-4 py-2 text-center border">単位</th>
                        <th className="px-4 py-2 text-right border">単価</th>
                        <th className="px-4 py-2 text-right border">金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 border">
                            {item.description}
                          </td>
                          <td className="px-4 py-2 text-center border">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-center border">
                            {item.unit}
                          </td>
                          <td className="px-4 py-2 text-right border">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-2 text-right border">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right border font-bold"
                        >
                          小計
                        </td>
                        <td className="px-4 py-2 text-right border font-bold">
                          {formatCurrency(selectedInvoice.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right border">
                          消費税 ({selectedInvoice.taxRate}%)
                        </td>
                        <td className="px-4 py-2 text-right border">
                          {formatCurrency(selectedInvoice.taxAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right border font-bold text-lg"
                        >
                          合計
                        </td>
                        <td className="px-4 py-2 text-right border font-bold text-lg">
                          {formatCurrency(selectedInvoice.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    router.push(`/invoices/${selectedInvoice.id}/edit`)
                  }
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  編集
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  📧 送付
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  📄 PDF出力
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
