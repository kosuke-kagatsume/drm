'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  Download,
  Plus,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  CreditCard,
  Building2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  invoiceService,
  Invoice,
  BillingSchedule,
  InvoiceType,
  InvoiceStatus,
} from '@/services/invoice.service';

export default function InvoiceManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingSchedules, setBillingSchedules] = useState<BillingSchedule[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'dueDate'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesList] = await Promise.all([invoiceService.getInvoices()]);
      setInvoices(invoicesList);

      // デモデータも追加
      if (invoicesList.length === 0) {
        await createDemoData();
        const newInvoices = await invoiceService.getInvoices();
        setInvoices(newInvoices);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  };

  const createDemoData = async () => {
    // デモ用の請求書を作成
    const demoInvoices: Invoice[] = [
      {
        id: 'invoice_demo_1',
        invoiceNo: 'UP-202408-0001',
        contractId: 'contract_demo_1',
        projectName: '田中様邸新築工事',
        customer: '田中太郎',
        customerCompany: '田中建設株式会社',
        type: 'upfront',
        amount: 4650000,
        taxAmount: 465000,
        totalAmount: 5115000,
        issuedDate: '2024-08-01',
        dueDate: '2024-08-31',
        status: 'paid',
        paidAmount: 5115000,
        paidDate: '2024-08-15',
        paymentMethod: 'bank_transfer',
        workProgress: 10,
        completedMilestones: ['契約締結'],
        items: [
          {
            id: 'item_1',
            description: '着手金（契約締結時）',
            quantity: 1,
            unit: '式',
            unitPrice: 4650000,
            amount: 4650000,
            taxRate: 10,
            category: 'upfront',
          },
        ],
        attachments: [],
        emailLog: [
          {
            id: 'email_1',
            sentAt: '2024-08-01T09:00:00Z',
            recipientEmail: 'tanaka@example.com',
            subject: '【請求書】田中様邸新築工事 - UP-202408-0001',
            status: 'opened',
            openedAt: '2024-08-01T10:30:00Z',
          },
        ],
        createdBy: '佐藤次郎',
        createdAt: '2024-08-01T09:00:00Z',
        updatedAt: '2024-08-15T15:30:00Z',
      },
      {
        id: 'invoice_demo_2',
        invoiceNo: 'PR-202408-0002',
        contractId: 'contract_demo_1',
        projectName: '田中様邸新築工事',
        customer: '田中太郎',
        customerCompany: '田中建設株式会社',
        type: 'progress',
        amount: 6200000,
        taxAmount: 620000,
        totalAmount: 6820000,
        issuedDate: '2024-08-20',
        dueDate: '2024-09-20',
        status: 'sent',
        paidAmount: 0,
        workProgress: 65,
        completedMilestones: ['基礎工事', '上棟'],
        nextMilestone: '屋根工事',
        items: [
          {
            id: 'item_2',
            description: '中間金（上棟完了時）',
            quantity: 1,
            unit: '式',
            unitPrice: 6200000,
            amount: 6200000,
            taxRate: 10,
            category: 'progress',
          },
        ],
        attachments: [],
        emailLog: [
          {
            id: 'email_2',
            sentAt: '2024-08-20T10:00:00Z',
            recipientEmail: 'tanaka@example.com',
            subject: '【請求書】田中様邸新築工事 - PR-202408-0002',
            status: 'delivered',
          },
        ],
        createdBy: '佐藤次郎',
        createdAt: '2024-08-20T10:00:00Z',
        updatedAt: '2024-08-20T10:00:00Z',
      },
      {
        id: 'invoice_demo_3',
        invoiceNo: 'UP-202408-0003',
        projectName: '山田ビル外壁改修',
        customer: '山田花子',
        customerCompany: '山田商事株式会社',
        type: 'upfront',
        amount: 960000,
        taxAmount: 96000,
        totalAmount: 1056000,
        issuedDate: '2024-08-10',
        dueDate: '2024-09-10',
        status: 'overdue',
        paidAmount: 0,
        workProgress: 0,
        completedMilestones: [],
        items: [
          {
            id: 'item_3',
            description: '着手金（契約締結時）',
            quantity: 1,
            unit: '式',
            unitPrice: 960000,
            amount: 960000,
            taxRate: 10,
            category: 'upfront',
          },
        ],
        attachments: [],
        emailLog: [],
        createdBy: '鈴木一郎',
        createdAt: '2024-08-10T14:00:00Z',
        updatedAt: '2024-08-10T14:00:00Z',
      },
    ];

    // LocalStorageに保存
    localStorage.setItem('invoices', JSON.stringify(demoInvoices));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        searchTerm === '' ||
        invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || invoice.status === filterStatus;
      const matchesType = filterType === 'all' || invoice.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'date':
        default:
          return (
            new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
          );
      }
    });

  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    pendingAmount: invoices
      .filter((inv) => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
    overdueCount: invoices.filter((inv) => inv.status === 'overdue').length,
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: '下書き' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: '送信済み' },
      viewed: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: '閲覧済み',
      },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: '支払済み' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: '期限切れ' },
      cancelled: {
        bg: 'bg-gray-200',
        text: 'text-gray-700',
        label: 'キャンセル',
      },
    };
    const config = statusConfig[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: InvoiceType) => {
    const typeConfig = {
      upfront: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: '着手金',
      },
      progress: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: '中間金',
      },
      final: { bg: 'bg-green-100', text: 'text-green-800', label: '精算金' },
      change_order: { bg: 'bg-blue-100', text: 'text-blue-800', label: '変更' },
    };
    const config = typeConfig[type];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const handlePayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;

    try {
      await invoiceService.recordPayment(
        selectedInvoice.id,
        parseInt(paymentAmount),
        paymentMethod as any,
        new Date().toISOString().split('T')[0],
        '入金処理',
      );

      await loadData();
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
    } catch (error) {
      console.error('Payment recording failed:', error);
      alert('入金処理に失敗しました。');
    }
  };

  if (isLoading || !user) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/invoices')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">請求書管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  分割請求・進捗連動請求システム
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                更新
              </button>
              <button
                onClick={() => router.push('/invoices/management/create')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                請求書作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総請求額</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">入金済み</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{stats.paidAmount.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未収金額</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ¥{stats.pendingAmount.toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">期限切れ</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdueCount}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="請求書番号、プロジェクト名、顧客名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全てのステータス</option>
                <option value="draft">下書き</option>
                <option value="sent">送信済み</option>
                <option value="viewed">閲覧済み</option>
                <option value="paid">支払済み</option>
                <option value="overdue">期限切れ</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全ての種類</option>
                <option value="upfront">着手金</option>
                <option value="progress">中間金</option>
                <option value="final">精算金</option>
                <option value="change_order">変更工事</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">発行日順</option>
                <option value="dueDate">支払期限順</option>
                <option value="amount">金額順</option>
              </select>
            </div>
          </div>
        </div>

        {/* 請求書一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    請求書情報
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    顧客・プロジェクト
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    支払期限
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">
                            {invoice.invoiceNo}
                          </p>
                          {getTypeBadge(invoice.type)}
                        </div>
                        <p className="text-xs text-gray-500">
                          発行日:{' '}
                          {new Date(invoice.issuedDate).toLocaleDateString(
                            'ja-JP',
                          )}
                        </p>
                        {invoice.workProgress && (
                          <p className="text-xs text-blue-600">
                            工事進捗: {invoice.workProgress}%
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.customer}
                        </p>
                        {invoice.customerCompany && (
                          <p className="text-xs text-gray-600">
                            {invoice.customerCompany}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {invoice.projectName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          ¥{invoice.totalAmount.toLocaleString()}
                        </p>
                        {invoice.paidAmount > 0 && (
                          <p className="text-xs text-green-600">
                            入金済み: ¥{invoice.paidAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(invoice.dueDate).toLocaleDateString(
                            'ja-JP',
                          )}
                        </p>
                        {invoice.status === 'overdue' && (
                          <p className="text-xs text-red-600">期限切れ</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="詳細表示"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition"
                          title="PDF出力"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setPaymentAmount(
                                (
                                  invoice.totalAmount - invoice.paidAmount
                                ).toString(),
                              );
                              setShowPaymentModal(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                            title="入金処理"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        {invoice.status === 'draft' && (
                          <button
                            className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition"
                            title="送信"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">該当する請求書がありません</p>
            </div>
          )}
        </div>
      </div>

      {/* 入金処理モーダル */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">入金処理</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  請求書: {selectedInvoice.invoiceNo}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  請求金額: ¥{selectedInvoice.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  未収金額: ¥
                  {(
                    selectedInvoice.totalAmount - selectedInvoice.paidAmount
                  ).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    入金額
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支払方法
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank_transfer">銀行振込</option>
                    <option value="check">小切手</option>
                    <option value="cash">現金</option>
                    <option value="card">クレジットカード</option>
                    <option value="electronic">電子決済</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handlePayment}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  入金処理
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPaymentAmount('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
