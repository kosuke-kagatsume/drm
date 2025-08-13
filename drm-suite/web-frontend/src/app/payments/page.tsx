'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  projectName: string;
  customer: string;
  amount: number;
  method: 'bank-transfer' | 'cash' | 'check' | 'credit-card' | 'cryptocurrency';
  receivedDate: string;
  recordedDate: string;
  status: 'pending' | 'verified' | 'reconciled' | 'disputed' | 'returned';
  bankAccount?: string;
  transactionId?: string;
  notes?: string;
  attachments: string[];
  verifiedBy?: string;
  reconciledBy?: string;
  fees?: number;
  exchangeRate?: number;
  originalCurrency?: string;
  originalAmount?: number;
}

interface PaymentStats {
  totalReceived: number;
  todayReceived: number;
  pendingAmount: number;
  averagePaymentDays: number;
  thisMonthReceived: number;
  reconciliationRate: number;
}

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  lastReconciled: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<
    'list' | 'timeline' | 'reconciliation'
  >('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'date' | 'amount' | 'customer' | 'status'
  >('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showBatchReconciliation, setShowBatchReconciliation] = useState(false);

  // サンプルデータ
  const [payments] = useState<Payment[]>([
    {
      id: 'PAY-2024-001',
      invoiceId: 'INV-2024-001',
      invoiceNumber: 'INV-2024-001',
      projectName: '田中様邸 外壁塗装工事',
      customer: '田中建設株式会社',
      amount: 2530000,
      method: 'bank-transfer',
      receivedDate: '2024-01-25',
      recordedDate: '2024-01-25',
      status: 'reconciled',
      bankAccount: 'みずほ銀行 普通 1234567',
      transactionId: 'T202401250001',
      notes: '予定通りの入金です。',
      attachments: ['入金確認書.pdf'],
      verifiedBy: '経理担当A',
      reconciledBy: '経理担当A',
      fees: 330,
    },
    {
      id: 'PAY-2024-002',
      invoiceId: 'INV-2024-002',
      invoiceNumber: 'INV-2024-002',
      projectName: '山田ビル内装リフォーム',
      customer: '山田商事株式会社',
      amount: 2860000,
      method: 'bank-transfer',
      receivedDate: '2024-01-28',
      recordedDate: '2024-01-28',
      status: 'verified',
      bankAccount: 'みずほ銀行 普通 1234567',
      transactionId: 'T202401280001',
      attachments: ['振込明細.pdf'],
      verifiedBy: '経理担当B',
      fees: 330,
    },
    {
      id: 'PAY-2024-003',
      invoiceId: 'INV-2024-003',
      invoiceNumber: 'INV-2024-003',
      projectName: '佐藤邸屋根修理',
      customer: '佐藤太郎',
      amount: 539000,
      method: 'bank-transfer',
      receivedDate: '2024-01-30',
      recordedDate: '2024-01-30',
      status: 'pending',
      bankAccount: 'みずほ銀行 普通 1234567',
      transactionId: 'T202401300001',
      notes: '部分入金（50%）',
      attachments: ['部分入金確認書.pdf'],
      fees: 330,
    },
    {
      id: 'PAY-2024-004',
      invoiceId: 'INV-2024-004',
      invoiceNumber: 'INV-2024-004',
      projectName: '鈴木工場定期点検',
      customer: '鈴木工業株式会社',
      amount: 495000,
      method: 'credit-card',
      receivedDate: '2024-01-31',
      recordedDate: '2024-01-31',
      status: 'verified',
      transactionId: 'CC202401310001',
      attachments: ['カード決済明細.pdf'],
      verifiedBy: '経理担当A',
      fees: 14850,
      notes: 'クレジットカード決済',
    },
    {
      id: 'PAY-2024-005',
      invoiceId: '',
      invoiceNumber: '',
      projectName: '前金預り金',
      customer: '高橋建設',
      amount: 1500000,
      method: 'bank-transfer',
      receivedDate: '2024-02-01',
      recordedDate: '2024-02-01',
      status: 'pending',
      bankAccount: 'みずほ銀行 普通 1234567',
      transactionId: 'T202402010001',
      attachments: ['前金受領書.pdf'],
      notes: '新築工事の前金として受領',
      fees: 330,
    },
  ]);

  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: 'BA-001',
      name: 'メイン口座',
      bankName: 'みずほ銀行',
      accountNumber: '普通 1234567',
      balance: 15780000,
      lastReconciled: '2024-01-31',
    },
    {
      id: 'BA-002',
      name: '決済用口座',
      bankName: '三菱UFJ銀行',
      accountNumber: '普通 9876543',
      balance: 3450000,
      lastReconciled: '2024-01-30',
    },
  ]);

  // 統計計算
  const stats: PaymentStats = useMemo(() => {
    const totalReceived = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const today = new Date().toISOString().split('T')[0];
    const todayReceived = payments
      .filter((p) => p.receivedDate === today)
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthReceived = payments
      .filter((p) => p.receivedDate.startsWith(thisMonth))
      .reduce((sum, p) => sum + p.amount, 0);
    const reconciledCount = payments.filter(
      (p) => p.status === 'reconciled',
    ).length;
    const reconciliationRate =
      payments.length > 0 ? (reconciledCount / payments.length) * 100 : 0;

    return {
      totalReceived,
      todayReceived,
      pendingAmount,
      averagePaymentDays: 12,
      thisMonthReceived,
      reconciliationRate,
    };
  }, [payments]);

  // フィルタリング
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterMethod !== 'all') {
      filtered = filtered.filter((p) => p.method === filterMethod);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.receivedDate).getTime();
          bVal = new Date(b.receivedDate).getTime();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'customer':
          aVal = a.customer.toLowerCase();
          bVal = b.customer.toLowerCase();
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
  }, [payments, filterStatus, filterMethod, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'reconciled':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '確認中';
      case 'verified':
        return '確認済み';
      case 'reconciled':
        return '照合済み';
      case 'disputed':
        return '異議あり';
      case 'returned':
        return '返金';
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bank-transfer':
        return '銀行振込';
      case 'cash':
        return '現金';
      case 'check':
        return '小切手';
      case 'credit-card':
        return 'クレジットカード';
      case 'cryptocurrency':
        return '暗号通貨';
      default:
        return method;
    }
  };

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;

  const handlePaymentAction = (action: string, paymentId?: string) => {
    if (paymentId) {
      alert(`入金 ${paymentId} に対して「${action}」を実行します`);
    } else {
      alert(
        `選択された${selectedPayments.length}件の入金に対して「${action}」を実行します`,
      );
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId],
    );
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
                <h1 className="text-2xl font-bold text-gray-900">入金管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  入金記録・確認・照合
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {selectedPayments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedPayments.length}件選択中
                  </span>
                  <button
                    onClick={() => setShowBatchReconciliation(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    一括照合
                  </button>
                </div>
              )}
              <button
                onClick={() => router.push('/payments/import')}
                className="px-4 py-2 bg-dandori-sky text-white rounded-lg hover:shadow-md transition-all"
              >
                📥 CSVインポート
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                手動入金記録
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総入金額</p>
                <p className="text-2xl font-bold text-dandori-blue">
                  {formatCurrency(stats.totalReceived)}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本日入金</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.todayReceived)}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">確認待ち</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">照合率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.reconciliationRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">✓</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今月入金</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(stats.thisMonthReceived)}
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
        </div>

        {/* 銀行口座残高 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="font-bold mb-3">銀行口座残高</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-gray-600">{account.bankName}</p>
                    <p className="text-sm text-gray-500">
                      {account.accountNumber}
                    </p>
                  </div>
                  <button className="text-dandori-blue hover:text-dandori-blue-dark">
                    🔗
                  </button>
                </div>
                <div className="mt-3">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    最終照合: {account.lastReconciled}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* フィルターとコントロール */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 入金検索..."
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
                <option value="pending">確認中</option>
                <option value="verified">確認済み</option>
                <option value="reconciled">照合済み</option>
                <option value="disputed">異議あり</option>
                <option value="returned">返金</option>
              </select>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
              >
                <option value="all">全支払方法</option>
                <option value="bank-transfer">銀行振込</option>
                <option value="cash">現金</option>
                <option value="check">小切手</option>
                <option value="credit-card">クレジットカード</option>
                <option value="cryptocurrency">暗号通貨</option>
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
                <option value="date-desc">入金日(新しい順)</option>
                <option value="date-asc">入金日(古い順)</option>
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
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 ${viewMode === 'timeline' ? 'bg-dandori-blue text-white' : 'text-gray-600'}`}
                >
                  📈 タイムライン
                </button>
                <button
                  onClick={() => setViewMode('reconciliation')}
                  className={`px-3 py-2 ${viewMode === 'reconciliation' ? 'bg-dandori-blue text-white' : 'text-gray-600'} rounded-r-lg`}
                >
                  ⚖️ 照合
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 入金一覧 */}
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
                          setSelectedPayments(
                            filteredPayments.map((p) => p.id),
                          );
                        } else {
                          setSelectedPayments([]);
                        }
                      }}
                      checked={
                        selectedPayments.length === filteredPayments.length &&
                        filteredPayments.length > 0
                      }
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    取引ID・請求書
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    案件名・顧客
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    入金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    支払方法
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    入金日
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handlePaymentSelect(payment.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transactionId || payment.id}
                        </div>
                        {payment.invoiceNumber && (
                          <div className="text-sm text-gray-500">
                            請求書: {payment.invoiceNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.projectName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customer}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.fees && (
                        <div className="text-xs text-red-500">
                          手数料: {formatCurrency(payment.fees)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {getMethodLabel(payment.method)}
                      </div>
                      {payment.bankAccount && (
                        <div className="text-xs text-gray-500">
                          {payment.bankAccount}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {payment.receivedDate}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentModal(true);
                          }}
                          className="p-1 text-dandori-blue hover:bg-dandori-blue hover:text-white rounded"
                          title="詳細"
                        >
                          👁️
                        </button>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() =>
                              handlePaymentAction('確認', payment.id)
                            }
                            className="p-1 text-green-600 hover:bg-green-600 hover:text-white rounded"
                            title="確認"
                          >
                            ✓
                          </button>
                        )}
                        {payment.status === 'verified' && (
                          <button
                            onClick={() =>
                              handlePaymentAction('照合', payment.id)
                            }
                            className="p-1 text-blue-600 hover:bg-blue-600 hover:text-white rounded"
                            title="照合"
                          >
                            ⚖️
                          </button>
                        )}
                        <button
                          className="p-1 text-purple-600 hover:bg-purple-600 hover:text-white rounded"
                          title="レポート"
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

        {filteredPayments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-600 mb-4">該当する入金記録がありません</p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-dandori-blue to-dandori-sky text-white rounded-lg hover:shadow-lg"
            >
              新規入金を記録
            </button>
          </div>
        )}
      </div>

      {/* 入金詳細・記録モーダル */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedPayment
                      ? `入金詳細 - ${selectedPayment.id}`
                      : '新規入金記録'}
                  </h2>
                  {selectedPayment && (
                    <p className="text-gray-600">
                      {selectedPayment.projectName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedPayment ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold mb-3">基本情報</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">顧客:</span>{' '}
                          {selectedPayment.customer}
                        </p>
                        <p>
                          <span className="text-gray-600">案件:</span>{' '}
                          {selectedPayment.projectName}
                        </p>
                        <p>
                          <span className="text-gray-600">請求書:</span>{' '}
                          {selectedPayment.invoiceNumber || 'なし'}
                        </p>
                        <p>
                          <span className="text-gray-600">入金額:</span>{' '}
                          {formatCurrency(selectedPayment.amount)}
                        </p>
                        {selectedPayment.fees && (
                          <p>
                            <span className="text-gray-600">手数料:</span>{' '}
                            {formatCurrency(selectedPayment.fees)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3">取引情報</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">支払方法:</span>{' '}
                          {getMethodLabel(selectedPayment.method)}
                        </p>
                        <p>
                          <span className="text-gray-600">取引ID:</span>{' '}
                          {selectedPayment.transactionId}
                        </p>
                        <p>
                          <span className="text-gray-600">入金日:</span>{' '}
                          {selectedPayment.receivedDate}
                        </p>
                        <p>
                          <span className="text-gray-600">記録日:</span>{' '}
                          {selectedPayment.recordedDate}
                        </p>
                        <p>
                          <span className="text-gray-600">ステータス:</span>
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedPayment.status)}`}
                          >
                            {getStatusLabel(selectedPayment.status)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.notes && (
                    <div>
                      <h3 className="font-bold mb-2">備考</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {selectedPayment.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    {selectedPayment.status === 'pending' && (
                      <button
                        onClick={() =>
                          handlePaymentAction('確認', selectedPayment.id)
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        ✓ 確認する
                      </button>
                    )}
                    {selectedPayment.status === 'verified' && (
                      <button
                        onClick={() =>
                          handlePaymentAction('照合', selectedPayment.id)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ⚖️ 照合する
                      </button>
                    )}
                    <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                      📄 レポート出力
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        顧客名
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        案件名
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        入金額 (¥)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        支払方法
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20">
                        <option value="bank-transfer">銀行振込</option>
                        <option value="cash">現金</option>
                        <option value="check">小切手</option>
                        <option value="credit-card">クレジットカード</option>
                        <option value="cryptocurrency">暗号通貨</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        入金日
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        取引ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      備考
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dandori-blue/20"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedPayment(null);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-dandori-blue text-white rounded hover:bg-dandori-blue-dark"
                    >
                      記録する
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 一括照合モーダル */}
      {showBatchReconciliation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">一括照合</h2>
                  <p className="text-gray-600">
                    {selectedPayments.length}件の入金を照合します
                  </p>
                </div>
                <button
                  onClick={() => setShowBatchReconciliation(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  選択された入金記録を銀行取引明細と照合し、ステータスを「照合済み」に更新します。
                  この操作は元に戻せません。
                </p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedPayments.map((paymentId) => {
                  const payment = payments.find((p) => p.id === paymentId);
                  if (!payment) return null;
                  return (
                    <div
                      key={paymentId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{payment.customer}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{payment.receivedDate}</p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => setShowBatchReconciliation(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    handlePaymentAction('一括照合');
                    setShowBatchReconciliation(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  照合実行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
