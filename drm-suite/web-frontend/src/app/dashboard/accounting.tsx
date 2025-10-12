'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RAGAssistant from '@/components/rag-assistant';

interface AccountingDashboardProps {
  userEmail: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category:
    | 'materials'
    | 'labor'
    | 'equipment'
    | 'office'
    | 'marketing'
    | 'utilities';
  date: string;
  receipt: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
}

interface FinancialReport {
  id: string;
  name: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'trial-balance';
  period: string;
  generatedDate: string;
  status: 'ready' | 'generating' | 'scheduled';
}

interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface AccountsReceivableAging {
  customer: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  total: number;
}

interface CashFlowForecast {
  date: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeBalance: number;
}

interface Invoice {
  id: string;
  projectName: string;
  customer: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'overdue' | 'paid';
  paymentProgress: number;
}

interface Payment {
  id: string;
  customer: string;
  amount: number;
  receivedDate: string;
  method: string;
  invoice: string;
  status: 'pending' | 'confirmed' | 'reconciled';
}

interface CashFlow {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export default function AccountingDashboard({
  userEmail,
}: AccountingDashboardProps) {
  const router = useRouter();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const invoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      projectName: '田中様邸 外壁塗装',
      customer: '田中建設',
      amount: 2500000,
      issuedDate: '2024-01-05',
      dueDate: '2024-02-05',
      status: 'overdue',
      paymentProgress: 50,
    },
    {
      id: 'INV-2024-002',
      projectName: '山田ビル リフォーム',
      customer: '山田商事',
      amount: 5800000,
      issuedDate: '2024-01-10',
      dueDate: '2024-02-10',
      status: 'sent',
      paymentProgress: 0,
    },
    {
      id: 'INV-2024-003',
      projectName: '佐藤邸 屋根修理',
      customer: '佐藤様',
      amount: 1200000,
      issuedDate: '2024-01-08',
      dueDate: '2024-02-08',
      status: 'paid',
      paymentProgress: 100,
    },
  ];

  const recentPayments: Payment[] = [
    {
      id: 'PAY-001',
      customer: '田中建設',
      amount: 1250000,
      receivedDate: '本日 10:30',
      method: '銀行振込',
      invoice: 'INV-2024-001',
      status: 'pending',
    },
    {
      id: 'PAY-002',
      customer: '鈴木工業',
      amount: 800000,
      receivedDate: '昨日 15:45',
      method: '銀行振込',
      invoice: 'INV-2023-125',
      status: 'confirmed',
    },
    {
      id: 'PAY-003',
      customer: '高橋建築',
      amount: 2100000,
      receivedDate: '3日前',
      method: '小切手',
      invoice: 'INV-2023-124',
      status: 'reconciled',
    },
  ];

  const cashFlow: CashFlow[] = [
    { month: '11月', income: 12500000, expense: 8900000, balance: 3600000 },
    { month: '12月', income: 15200000, expense: 10500000, balance: 4700000 },
    { month: '1月', income: 9500000, expense: 7800000, balance: 1700000 },
  ];

  const expenses: Expense[] = [
    {
      id: 'EXP-001',
      description: '塗料・材料費',
      amount: 450000,
      category: 'materials',
      date: '2024-01-15',
      receipt: true,
      status: 'approved',
      submittedBy: '佐藤太郎',
    },
    {
      id: 'EXP-002',
      description: '作業員交通費',
      amount: 25000,
      category: 'labor',
      date: '2024-01-14',
      receipt: false,
      status: 'pending',
      submittedBy: '田中花子',
    },
    {
      id: 'EXP-003',
      description: '事務用品購入',
      amount: 15800,
      category: 'office',
      date: '2024-01-13',
      receipt: true,
      status: 'approved',
      submittedBy: '山田次郎',
    },
  ];

  const financialReports: FinancialReport[] = [
    {
      id: 'RPT-001',
      name: '1月度 損益計算書',
      type: 'profit-loss',
      period: '2024年1月',
      generatedDate: '2024-02-01',
      status: 'ready',
    },
    {
      id: 'RPT-002',
      name: '1月度 キャッシュフロー計算書',
      type: 'cash-flow',
      period: '2024年1月',
      generatedDate: '2024-02-01',
      status: 'ready',
    },
    {
      id: 'RPT-003',
      name: '2月度 損益計算書',
      type: 'profit-loss',
      period: '2024年2月',
      generatedDate: '-',
      status: 'scheduled',
    },
  ];

  const budgetComparison: BudgetComparison[] = [
    {
      category: '売上',
      budgeted: 12000000,
      actual: 9500000,
      variance: -2500000,
      variancePercent: -20.8,
    },
    {
      category: '材料費',
      budgeted: 3000000,
      actual: 2800000,
      variance: -200000,
      variancePercent: -6.7,
    },
    {
      category: '人件費',
      budgeted: 4000000,
      actual: 4200000,
      variance: 200000,
      variancePercent: 5.0,
    },
    {
      category: '営業費',
      budgeted: 800000,
      actual: 650000,
      variance: -150000,
      variancePercent: -18.8,
    },
    {
      category: '管理費',
      budgeted: 1200000,
      actual: 1100000,
      variance: -100000,
      variancePercent: -8.3,
    },
  ];

  const arAging: AccountsReceivableAging[] = [
    {
      customer: '田中建設',
      current: 0,
      days30: 1250000,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 1250000,
    },
    {
      customer: '山田商事',
      current: 5800000,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 5800000,
    },
    {
      customer: '鈴木工業',
      current: 0,
      days30: 0,
      days60: 800000,
      days90: 0,
      over90: 0,
      total: 800000,
    },
  ];

  const cashFlowForecast: CashFlowForecast[] = [
    {
      date: '2024-02-15',
      inflow: 3200000,
      outflow: 1800000,
      netFlow: 1400000,
      cumulativeBalance: 8200000,
    },
    {
      date: '2024-02-28',
      inflow: 5800000,
      outflow: 3200000,
      netFlow: 2600000,
      cumulativeBalance: 10800000,
    },
    {
      date: '2024-03-15',
      inflow: 2100000,
      outflow: 2500000,
      netFlow: -400000,
      cumulativeBalance: 10400000,
    },
    {
      date: '2024-03-31',
      inflow: 4500000,
      outflow: 2800000,
      netFlow: 1700000,
      cumulativeBalance: 12100000,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'reconciled':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'sent':
        return '送付済み';
      case 'overdue':
        return '期限超過';
      case 'paid':
        return '入金済み';
      case 'pending':
        return '確認中';
      case 'confirmed':
        return '確認済み';
      case 'reconciled':
        return '照合済み';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const handleInvoiceCreate = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleInvoiceEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleExpenseCreate = () => {
    setShowExpenseForm(true);
  };

  const handleExport = (type: string) => {
    if (type === 'financial-summary') {
      // 財務サマリーレポートの生成
      const summaryData = {
        reportType: 'financial-summary',
        generatedAt: new Date().toISOString(),
        period: '2024年1月〜12月',
        revenue: 128500000,
        expenses: 95300000,
        netProfit: 33200000,
        profitMargin: 25.8,
        cashFlow: cashFlowData,
        budgetComparison: budgetData,
        topCustomers: [
          { name: '山田建設', revenue: 25800000, percentage: 20.1 },
          { name: '田中不動産', revenue: 18900000, percentage: 14.7 },
          { name: '佐藤工務店', revenue: 15600000, percentage: 12.1 },
        ],
      };

      const jsonStr = JSON.stringify(summaryData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `financial-summary-${new Date().toISOString().split('T')[0]}.json`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('財務サマリーレポートをダウンロードしました！');
    } else if (type === 'monthly-report') {
      // 月次レポートの生成
      const monthlyData = {
        reportType: 'monthly-report',
        month: new Date().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
        }),
        revenue: 12850000,
        expenses: 9530000,
        netProfit: 3320000,
        invoices: invoices.filter((inv) => inv.status === 'paid'),
        expenses: expenses,
        cashPosition: 45600000,
      };

      const jsonStr = JSON.stringify(monthlyData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `monthly-report-${new Date().toISOString().split('T')[0]}.json`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('月次レポートをダウンロードしました！');
    } else if (
      type === '損益計算書' ||
      type === '貸借対照表' ||
      type === 'キャッシュフロー計算書'
    ) {
      // 各種財務諸表のダウンロード
      const reportData = {
        reportType: type,
        period: '2024年度',
        generatedAt: new Date().toISOString(),
        data: '財務諸表の詳細データ（実装準備中）',
      };

      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `${type}-${new Date().toISOString().split('T')[0]}.json`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`${type}をダウンロードしました！`);
    } else {
      alert(`${type}レポートをエクスポート機能を準備中です...`);
    }
  };

  const handleMetricClick = (metric: string) => {
    setActiveModal(metric);
  };

  const handlePaymentRecord = (paymentId: string) => {
    alert(`入金 ${paymentId} を記録しました`);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || invoice.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'materials':
        return 'bg-blue-100 text-blue-800';
      case 'labor':
        return 'bg-green-100 text-green-800';
      case 'equipment':
        return 'bg-purple-100 text-purple-800';
      case 'office':
        return 'bg-gray-100 text-gray-800';
      case 'marketing':
        return 'bg-pink-100 text-pink-800';
      case 'utilities':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'materials':
        return '材料費';
      case 'labor':
        return '人件費';
      case 'equipment':
        return '設備費';
      case 'office':
        return '事務用品';
      case 'marketing':
        return '営業費';
      case 'utilities':
        return '光熱費';
      default:
        return category;
    }
  };

  return (
    <div className="flex gap-8">
      {/* メインコンテンツエリア - 請求書管理と最近の入金 */}
      <div className="flex-1 space-y-8">
      {/* Header with Search and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">💰 経理ダッシュボード</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/construction-ledgers')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>🏗️</span>
              <span>工事台帳</span>
            </button>
            <button
              onClick={() => router.push('/admin/account-subjects')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <span>📊</span>
              <span>勘定科目</span>
            </button>
            <button
              onClick={handleInvoiceCreate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <span>➕</span>
              <span>新規請求書</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="請求書・顧客検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全てのステータス</option>
              <option value="draft">下書き</option>
              <option value="sent">送付済み</option>
              <option value="overdue">期限超過</option>
              <option value="paid">入金済み</option>
            </select>
          </div>
        </div>
      </div>

      {/* 緊急アラート */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💴</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                支払期限超過の請求書があります
              </h3>
              <p className="text-sm text-red-700 mt-1">
                田中建設への請求書(¥2,500,000)が5日超過しています
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedInvoice('INV-2024-001')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            督促状送付
          </button>
        </div>
      </div>

      {/* KPIサマリー - Now Clickable */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">💰 財務サマリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('revenue')}
          >
            <p className="text-sm text-gray-600">今月売上</p>
            <p className="text-3xl font-bold text-green-600">¥9.5M</p>
            <p className="text-xs text-gray-500">前月比 -38%</p>
          </div>
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('receivables')}
          >
            <p className="text-sm text-gray-600">未収金</p>
            <p className="text-3xl font-bold text-orange-600">¥8.3M</p>
            <p className="text-xs text-gray-500">3件の請求書</p>
          </div>
          <div
            className="cursor-pointer hover:bg-gray-50 p-3 rounded transition"
            onClick={() => handleMetricClick('expected-payments')}
          >
            <p className="text-sm text-gray-600">入金予定</p>
            <p className="text-3xl font-bold text-blue-600">¥4.2M</p>
            <p className="text-xs text-gray-500">今週中</p>
          </div>
          <div
            className="bg-yellow-50 p-3 rounded cursor-pointer hover:bg-yellow-100 transition"
            onClick={() => handleMetricClick('pending-items')}
          >
            <p className="text-sm text-yellow-800 font-medium">要確認</p>
            <p className="text-3xl font-bold text-yellow-600">2件</p>
            <button className="text-xs text-yellow-700 underline">
              確認する →
            </button>
          </div>
        </div>
      </div>

      {/* 請求書管理 - Full Width */}
      <div className="mb-6">
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-800">
                📄 請求書管理
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition ${
                    invoice.status === 'overdue'
                      ? 'border-red-300 bg-red-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {invoice.projectName}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        顧客: {invoice.customer} | 請求書番号: {invoice.id}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold">
                            {formatCurrency(invoice.amount)}
                          </span>
                          <span className="ml-3 text-sm text-gray-500">
                            支払期限: {invoice.dueDate}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {invoice.paymentProgress > 0 && (
                            <div className="w-24">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>入金</span>
                                <span>{invoice.paymentProgress}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${invoice.paymentProgress}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex space-x-2">
                            {invoice.status === 'draft' && (
                              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                送付
                              </button>
                            )}
                            {invoice.status === 'overdue' && (
                              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                                督促
                              </button>
                            )}
                            <button
                              onClick={() => handleInvoiceEdit(invoice)}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                            >
                              編集
                            </button>
                            <button
                              onClick={() =>
                                handleMetricClick(`invoice-${invoice.id}`)
                              }
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                            >
                              詳細
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 入金確認 */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b bg-green-50">
              <h2 className="text-lg font-semibold text-green-800">
                💳 最近の入金
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        顧客
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        金額
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        入金日
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        方法
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        状態
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="px-4 py-3 font-medium">
                          {payment.customer}
                        </td>
                        <td className="px-4 py-3 font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {payment.receivedDate}
                        </td>
                        <td className="px-4 py-3 text-sm">{payment.method}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}
                          >
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handlePaymentRecord(payment.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              確認
                            </button>
                          )}
                          {payment.status === 'confirmed' && (
                            <button
                              onClick={() => handlePaymentRecord(payment.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              照合
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Phase 9: 入金・支払管理ウィジェット */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 入金予定アラート */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">💰 入金予定アラート</h3>
            <button
              onClick={() => router.push('/invoices')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              詳細 →
            </button>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 border-red-500 pl-3 py-2 bg-red-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">INV-2024-001</p>
                  <p className="text-xs text-gray-600">田中建設 - 5日遅延</p>
                </div>
                <p className="text-sm font-bold text-red-600">¥2.5M</p>
              </div>
            </div>
            <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">INV-2024-002</p>
                  <p className="text-xs text-gray-600">山田商事 - 3日後期限</p>
                </div>
                <p className="text-sm font-bold text-yellow-600">¥5.8M</p>
              </div>
            </div>
            <div className="border-l-4 border-green-500 pl-3 py-2 bg-green-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">INV-2024-004</p>
                  <p className="text-xs text-gray-600">鈴木工業 - 今週中</p>
                </div>
                <p className="text-sm font-bold text-green-600">¥3.2M</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">今月入金予定</span>
              <span className="font-bold text-gray-800">¥11.5M</span>
            </div>
          </div>
        </div>

        {/* 支払予定アラート */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">💸 支払予定アラート</h3>
            <button
              onClick={() => router.push('/disbursements')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              詳細 →
            </button>
          </div>
          <div className="space-y-3">
            <div className="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">DIS-SCH-001</p>
                  <p className="text-xs text-gray-600">承認待ち（500万円以上）</p>
                </div>
                <p className="text-sm font-bold text-orange-600">¥6.0M</p>
              </div>
            </div>
            <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">DIS-SCH-002</p>
                  <p className="text-xs text-gray-600">明日支払期限</p>
                </div>
                <p className="text-sm font-bold text-yellow-600">¥1.5M</p>
              </div>
            </div>
            <div className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">DIS-SCH-003</p>
                  <p className="text-xs text-gray-600">来週支払予定</p>
                </div>
                <p className="text-sm font-bold text-blue-600">¥3.0M</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">今月支払予定</span>
              <span className="font-bold text-gray-800">¥10.5M</span>
            </div>
          </div>
        </div>

        {/* キャッシュフロー予測サマリー */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📊 キャッシュフロー予測</h3>
            <button
              onClick={() => router.push('/cashflow')}
              className="text-sm text-white/80 hover:text-white"
            >
              詳細 →
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/80 mb-1">今月予測残高（現実的）</p>
              <p className="text-3xl font-bold">¥15.8M</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded p-3">
                <p className="text-xs text-white/80 mb-1">楽観的</p>
                <p className="text-lg font-bold">¥18.2M</p>
              </div>
              <div className="bg-white/10 rounded p-3">
                <p className="text-xs text-white/80 mb-1">悲観的</p>
                <p className="text-lg font-bold">¥13.4M</p>
              </div>
            </div>
            <div className="bg-white/10 rounded p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">リスク評価</span>
                <span className="px-2 py-1 bg-green-500 rounded text-xs font-bold">
                  低リスク
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Financial Analytics Dashboard */}

      {/* Executive Financial Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              📊 統合財務分析ダッシュボード
            </h2>
            <p className="text-purple-100 mt-1">AI駆動の財務インテリジェンス</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveModal('financial-ai-insights')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition"
            >
              🤖 AIインサイト
            </button>
            <button
              onClick={() => setActiveModal('executive-summary')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition"
            >
              📈 役員レポート
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <div className="bg-green-500 p-2 rounded-full mr-3">
                <span className="text-white text-sm font-bold">ROI</span>
              </div>
              <div>
                <p className="text-sm opacity-90">投資収益率</p>
                <p className="text-2xl font-bold">18.5%</p>
              </div>
            </div>
            <div className="text-xs opacity-75">前四半期比 +2.3%</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <span className="text-white text-sm font-bold">CFO</span>
              </div>
              <div>
                <p className="text-sm opacity-90">営業CF</p>
                <p className="text-2xl font-bold">¥12.8M</p>
              </div>
            </div>
            <div className="text-xs opacity-75">健全なキャッシュフロー</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <div className="bg-orange-500 p-2 rounded-full mr-3">
                <span className="text-white text-sm font-bold">DSO</span>
              </div>
              <div>
                <p className="text-sm opacity-90">売掛金回収日数</p>
                <p className="text-2xl font-bold">34日</p>
              </div>
            </div>
            <div className="text-xs opacity-75">業界平均: 42日</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <div className="bg-red-500 p-2 rounded-full mr-3">
                <span className="text-white text-sm font-bold">Risk</span>
              </div>
              <div>
                <p className="text-sm opacity-90">財務リスク</p>
                <p className="text-2xl font-bold">低</p>
              </div>
            </div>
            <div className="text-xs opacity-75">AIリスクスコア: 2.1/10</div>
          </div>
        </div>
      </div>

      {/* Real-time Financial Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              📊 リアルタイム収益分析
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                LIVE
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm text-gray-600">今日の売上</p>
                  <p className="text-xl font-bold text-green-600">¥2,340,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">対目標</p>
                  <p className="text-sm font-bold text-green-600">+12%</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm text-gray-600">週間売上</p>
                  <p className="text-xl font-bold text-blue-600">¥15,680,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">前週比</p>
                  <p className="text-sm font-bold text-green-600">+8.5%</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm text-gray-600">月間売上</p>
                  <p className="text-xl font-bold text-purple-600">
                    ¥45,200,000
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">予算達成率</p>
                  <p className="text-sm font-bold text-blue-600">94.2%</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('revenue-deep-dive')}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              詳細分析 →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              💰 キャッシュポジション分析
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                実時間
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">現在の現金残高</p>
                <p className="text-3xl font-bold text-blue-600">¥28,450,000</p>
                <div className="flex justify-center space-x-4 mt-2 text-xs">
                  <span className="text-green-600">安全水準</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-blue-600">運転資金: 充分</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded">
                  <p className="text-xs text-gray-600">流動比率</p>
                  <p className="text-lg font-bold text-green-600">2.4</p>
                </div>
                <div className="p-3 border rounded">
                  <p className="text-xs text-gray-600">当座比率</p>
                  <p className="text-lg font-bold text-blue-600">1.8</p>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <p className="text-xs font-medium text-yellow-800">
                  AI予測アラート
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  来月の支払いピーク時（2/25）に一時的な資金不足の可能性
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('cash-flow-deep-analysis')}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              キャッシュフロー予測 →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
              🎯 業績指標ダッシュボード
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                KPI
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div
                className="p-3 border rounded hover:shadow-md transition cursor-pointer"
                onClick={() => handleMetricClick('gross-margin-analysis')}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">粗利益率</p>
                  <span className="text-green-600 text-xs font-bold">
                    ↗ +1.2%
                  </span>
                </div>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-purple-600">42.8%</p>
                  <div className="ml-3 bg-gray-200 rounded-full h-2 flex-1">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: '85.6%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div
                className="p-3 border rounded hover:shadow-md transition cursor-pointer"
                onClick={() => handleMetricClick('operating-efficiency')}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">営業効率性</p>
                  <span className="text-red-600 text-xs font-bold">
                    ↘ -0.8%
                  </span>
                </div>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-orange-600">78.2%</p>
                  <div className="ml-3 bg-gray-200 rounded-full h-2 flex-1">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: '78.2%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div
                className="p-3 border rounded hover:shadow-md transition cursor-pointer"
                onClick={() => handleMetricClick('customer-satisfaction')}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">顧客満足度スコア</p>
                  <span className="text-green-600 text-xs font-bold">
                    ↗ +0.3
                  </span>
                </div>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-green-600">4.7</p>
                  <div className="ml-3 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${star <= 4.7 ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('comprehensive-kpi-dashboard')}
              className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              全KPI表示 →
            </button>
          </div>
        </div>
      </div>

      {/* AI-Powered Budget vs Actual Analysis */}
      <div className="bg-white rounded-lg shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-green-800 flex items-center">
                🤖 AI予算対実績分析
                <span className="ml-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  スマート分析
                </span>
              </h2>
              <p className="text-sm text-green-600 mt-1">
                機械学習による予算差異分析と予測
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveModal('ai-budget-insights')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition"
              >
                🧠 AIインサイト
              </button>
              <button
                onClick={() => setActiveModal('budget-forecasting')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition"
              >
                📊 予算予測
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-800 mb-2">
                  AIアナリストの洞察
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  •
                  売上は季節要因により予算を20.8%下回っていますが、過去3年の同期と比較すると標準的なパフォーマンスです。
                  <br />•
                  人件費の超過（+5%）は新規プロジェクトの増加によるもので、ROI分析では正当化されます。
                  <br />•
                  営業費の削減（-18.8%）により、来四半期の売上に影響する可能性があります。
                </p>
                <div className="flex space-x-4 text-xs">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    予算効率度: B+
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    リスクレベル: 中
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    改善余地: 有
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    項目
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    予算
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    実績
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    差異
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    差異率
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    トレンド
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    AI評価
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgetComparison.map((item, idx) => {
                  const aiRating =
                    Math.abs(item.variancePercent) <= 5
                      ? 'A'
                      : Math.abs(item.variancePercent) <= 15
                        ? 'B'
                        : Math.abs(item.variancePercent) <= 25
                          ? 'C'
                          : 'D';
                  const ratingColor =
                    aiRating === 'A'
                      ? 'bg-green-100 text-green-800'
                      : aiRating === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : aiRating === 'C'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800';

                  return (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => handleMetricClick(`budget-detail-${idx}`)}
                    >
                      <td className="px-4 py-4 font-medium flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            Math.abs(item.variancePercent) <= 10
                              ? 'bg-green-400'
                              : Math.abs(item.variancePercent) <= 20
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                          }`}
                        ></div>
                        {item.category}
                      </td>
                      <td className="px-4 py-4 text-right font-mono">
                        {formatCurrency(item.budgeted)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold font-mono">
                        {formatCurrency(item.actual)}
                      </td>
                      <td
                        className={`px-4 py-4 text-right font-bold font-mono ${
                          item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.variance >= 0 ? '+' : ''}
                        {formatCurrency(item.variance)}
                      </td>
                      <td
                        className={`px-4 py-4 text-right font-bold ${
                          item.variancePercent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {item.variancePercent >= 0 ? '+' : ''}
                        {item.variancePercent.toFixed(1)}%
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mx-auto relative">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              Math.abs(item.variancePercent) <= 10
                                ? 'bg-green-500'
                                : Math.abs(item.variancePercent) <= 20
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(10, (item.actual / item.budgeted) * 100))}%`,
                            }}
                          />
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                            {((item.actual / item.budgeted) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${ratingColor}`}
                        >
                          {aiRating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td className="px-4 py-3 font-bold">合計</td>
                  <td className="px-4 py-3 text-right font-bold font-mono">
                    {formatCurrency(
                      budgetComparison.reduce(
                        (sum, item) => sum + item.budgeted,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold font-mono">
                    {formatCurrency(
                      budgetComparison.reduce(
                        (sum, item) => sum + item.actual,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold font-mono text-red-600">
                    {formatCurrency(
                      budgetComparison.reduce(
                        (sum, item) => sum + item.variance,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    {(
                      (budgetComparison.reduce(
                        (sum, item) => sum + item.variance,
                        0,
                      ) /
                        budgetComparison.reduce(
                          (sum, item) => sum + item.budgeted,
                          0,
                        )) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                      総合
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                      B
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Advanced Financial Forecasting & Risk Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI-Enhanced Cash Flow Forecasting */}
        <div className="bg-white rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                  🚀 AIキャッシュフロー予測
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    予測分析
                  </span>
                </h2>
                <p className="text-sm text-blue-600 mt-1">
                  機械学習による高精度な資金繰り予測
                </p>
              </div>
              <button
                onClick={() => setActiveModal('advanced-cash-flow-forecast')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition"
              >
                🔍 詳細分析
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-400">
              <div className="flex items-center">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <span className="text-white text-xs font-bold">🎯</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-800">
                    AI予測の信頼度: 94.2%
                  </h4>
                  <p className="text-sm text-green-700">
                    過去24ヶ月のデータに基づく高精度予測
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {cashFlowForecast.map((forecast, idx) => {
                const riskLevel =
                  forecast.cumulativeBalance < 5000000
                    ? 'high'
                    : forecast.cumulativeBalance < 10000000
                      ? 'medium'
                      : 'low';
                const riskColor =
                  riskLevel === 'high'
                    ? 'bg-red-100 border-red-300'
                    : riskLevel === 'medium'
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'bg-green-100 border-green-300';
                const riskText =
                  riskLevel === 'high'
                    ? 'text-red-700'
                    : riskLevel === 'medium'
                      ? 'text-yellow-700'
                      : 'text-green-700';

                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-4 hover:shadow-md cursor-pointer transition ${riskColor}`}
                    onClick={() =>
                      handleMetricClick(`advanced-forecast-${idx}`)
                    }
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <h4 className="font-medium">{forecast.date}</h4>
                        {riskLevel === 'high' && (
                          <span className="ml-2 text-red-600 text-sm">
                            ⚠️ 要注意
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-bold ${
                          forecast.netFlow >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        純増減: {formatCurrency(forecast.netFlow)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="p-2 bg-white rounded">
                        <p className="text-gray-600 mb-1 text-xs">
                          💰 収入予測
                        </p>
                        <p className="font-bold text-green-600">
                          {formatCurrency(forecast.inflow)}
                        </p>
                        <p className="text-xs text-gray-500">信頼度: 92%</p>
                      </div>
                      <div className="p-2 bg-white rounded">
                        <p className="text-gray-600 mb-1 text-xs">
                          💸 支出予測
                        </p>
                        <p className="font-bold text-red-600">
                          {formatCurrency(forecast.outflow)}
                        </p>
                        <p className="text-xs text-gray-500">信頼度: 96%</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">予測残高:</span>
                        <div className="text-right">
                          <span className={`font-bold text-lg ${riskText}`}>
                            {formatCurrency(forecast.cumulativeBalance)}
                          </span>
                          <p className="text-xs text-gray-500">
                            {riskLevel === 'high'
                              ? '💥 資金不足リスク'
                              : riskLevel === 'medium'
                                ? '⚠️ 注意レベル'
                                : '✅ 安全レベル'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">次回見直し推奨:</span>
                <span className="font-medium text-blue-600">2024年2月20日</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Accounts Receivable Management */}
        <div className="bg-white rounded-lg shadow-xl">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  📊 売掛金リスク分析
                  <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    リアルタイム
                  </span>
                </h2>
                <p className="text-sm text-orange-600 mt-1">
                  顧客別回収リスクと年齢分析
                </p>
              </div>
              <button
                onClick={() => setActiveModal('ar-comprehensive-analysis')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm transition"
              >
                📈 詳細分析
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 p-3 rounded text-center">
                  <p className="text-xs text-green-600 mb-1">健全な売掛金</p>
                  <p className="text-lg font-bold text-green-700">¥5.8M</p>
                  <p className="text-xs text-gray-500">70.1%</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded text-center">
                  <p className="text-xs text-yellow-600 mb-1">要注意</p>
                  <p className="text-lg font-bold text-yellow-700">¥2.05M</p>
                  <p className="text-xs text-gray-500">24.8%</p>
                </div>
                <div className="bg-red-50 p-3 rounded text-center">
                  <p className="text-xs text-red-600 mb-1">高リスク</p>
                  <p className="text-lg font-bold text-red-700">¥0.42M</p>
                  <p className="text-xs text-gray-500">5.1%</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-700">
                      顧客
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-gray-700">
                      現在
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-gray-700">
                      30日
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-gray-700">
                      60日
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-gray-700">
                      90日+
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-gray-700">
                      合計
                    </th>
                    <th className="px-2 py-2 text-center font-medium text-gray-700">
                      リスク
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {arAging.map((customer, idx) => {
                    const riskScore =
                      (customer.days30 * 0.2 +
                        customer.days60 * 0.5 +
                        customer.over90 * 1.0) /
                      customer.total;
                    const riskLevel =
                      riskScore > 0.3
                        ? 'high'
                        : riskScore > 0.1
                          ? 'medium'
                          : 'low';
                    const riskColor =
                      riskLevel === 'high'
                        ? 'bg-red-100 text-red-800'
                        : riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800';
                    const riskText =
                      riskLevel === 'high'
                        ? '高'
                        : riskLevel === 'medium'
                          ? '中'
                          : '低';

                    return (
                      <tr
                        key={idx}
                        className={`border-b hover:bg-gray-50 cursor-pointer transition ${
                          riskLevel === 'high'
                            ? 'bg-red-25'
                            : riskLevel === 'medium'
                              ? 'bg-yellow-25'
                              : ''
                        }`}
                        onClick={() => handleMetricClick(`ar-detail-${idx}`)}
                      >
                        <td className="px-2 py-3 font-medium flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              riskLevel === 'high'
                                ? 'bg-red-500'
                                : riskLevel === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                          ></div>
                          {customer.customer}
                        </td>
                        <td className="px-2 py-3 text-center text-xs font-mono">
                          {customer.current > 0
                            ? formatCurrency(customer.current)
                            : '-'}
                        </td>
                        <td
                          className={`px-2 py-3 text-center text-xs font-mono ${
                            customer.days30 > 0
                              ? 'text-yellow-600 font-bold bg-yellow-50'
                              : ''
                          }`}
                        >
                          {customer.days30 > 0
                            ? formatCurrency(customer.days30)
                            : '-'}
                        </td>
                        <td
                          className={`px-2 py-3 text-center text-xs font-mono ${
                            customer.days60 > 0
                              ? 'text-orange-600 font-bold bg-orange-50'
                              : ''
                          }`}
                        >
                          {customer.days60 > 0
                            ? formatCurrency(customer.days60)
                            : '-'}
                        </td>
                        <td
                          className={`px-2 py-3 text-center text-xs font-mono ${
                            customer.over90 > 0
                              ? 'text-red-600 font-bold bg-red-50'
                              : ''
                          }`}
                        >
                          {customer.over90 > 0
                            ? formatCurrency(customer.over90)
                            : '-'}
                        </td>
                        <td className="px-2 py-3 text-center font-bold font-mono">
                          {formatCurrency(customer.total)}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${riskColor}`}
                          >
                            {riskText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr className="font-bold">
                    <td className="px-2 py-3">合計</td>
                    <td className="px-2 py-3 text-center font-mono">
                      {formatCurrency(
                        arAging.reduce((sum, c) => sum + c.current, 0),
                      )}
                    </td>
                    <td className="px-2 py-3 text-center font-mono text-yellow-700">
                      {formatCurrency(
                        arAging.reduce((sum, c) => sum + c.days30, 0),
                      )}
                    </td>
                    <td className="px-2 py-3 text-center font-mono text-orange-700">
                      {formatCurrency(
                        arAging.reduce((sum, c) => sum + c.days60, 0),
                      )}
                    </td>
                    <td className="px-2 py-3 text-center font-mono text-red-700">
                      {formatCurrency(
                        arAging.reduce((sum, c) => sum + c.over90, 0),
                      )}
                    </td>
                    <td className="px-2 py-3 text-center font-mono">
                      {formatCurrency(
                        arAging.reduce((sum, c) => sum + c.total, 0),
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        統計
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-800 font-medium">
                  💡 AI推奨アクション:
                </span>
                <span className="text-blue-700">
                  田中建設への督促強化、鈴木工業の信用調査
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Financial Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profitability Analysis */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-green-50">
            <h3 className="text-lg font-semibold text-emerald-800 flex items-center">
              💎 収益性分析
              <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                分析
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                onClick={() => handleMetricClick('profitability-breakdown')}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    営業利益率
                  </span>
                  <span className="text-green-600 font-bold">23.4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '78%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">業界平均: 18.2%</p>
              </div>

              <div
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                onClick={() => handleMetricClick('project-profitability')}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    プロジェクト別収益
                  </span>
                  <span className="text-blue-600 font-bold">分析可能</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-green-700 font-medium">高収益: 3件</p>
                    <p className="text-green-600">¥8.2M</p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <p className="text-yellow-700 font-medium">改善必要: 2件</p>
                    <p className="text-yellow-600">¥1.8M</p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                onClick={() => handleMetricClick('cost-structure-analysis')}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    コスト構造
                  </span>
                  <span className="text-purple-600 font-bold">最適化中</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>材料費</span>
                    <span className="text-blue-600">45.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>人件費</span>
                    <span className="text-green-600">32.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>その他</span>
                    <span className="text-gray-600">22.0%</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                setActiveModal('comprehensive-profitability-analysis')
              }
              className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              🔍 収益性詳細分析
            </button>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
              🏥 財務健全性スコア
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                AI評価
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-green-500 transform rotate-[-90deg]"
                  style={{ clipPath: 'polygon(0 0, 85% 0, 85% 100%, 0 100%)' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">85</div>
                    <div className="text-sm text-gray-600">健全</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-sm font-medium">🟢 流動性</span>
                <span className="font-bold text-green-600">A+</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-sm font-medium">🔵 収益性</span>
                <span className="font-bold text-blue-600">A</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <span className="text-sm font-medium">🟡 効率性</span>
                <span className="font-bold text-yellow-600">B+</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-sm font-medium">🟣 安定性</span>
                <span className="font-bold text-purple-600">A-</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 mb-1">最後の評価:</p>
              <p className="text-sm font-medium">2024年2月10日</p>
            </div>

            <button
              onClick={() => setActiveModal('financial-health-detailed-report')}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              📊 詳細レポート
            </button>
          </div>
        </div>

        {/* Risk Management Dashboard */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              ⚠️ リスク管理
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                監視中
              </span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-3 border-l-4 border-red-400 bg-red-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-800">
                    信用リスク
                  </span>
                  <span className="text-red-600 font-bold">中</span>
                </div>
                <p className="text-xs text-red-700 mt-1">期限超過債権: ¥2.5M</p>
              </div>

              <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-yellow-800">
                    流動性リスク
                  </span>
                  <span className="text-yellow-600 font-bold">低</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">現金比率: 良好</p>
              </div>

              <div className="p-3 border-l-4 border-blue-400 bg-blue-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">
                    市場リスク
                  </span>
                  <span className="text-blue-600 font-bold">低</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">建設業界安定</p>
              </div>

              <div className="p-3 border-l-4 border-green-400 bg-green-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">
                    運営リスク
                  </span>
                  <span className="text-green-600 font-bold">低</span>
                </div>
                <p className="text-xs text-green-700 mt-1">プロセス効率: 高</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
              <h5 className="text-sm font-bold text-orange-800 mb-1">
                🚨 緊急対応項目
              </h5>
              <p className="text-xs text-orange-700">
                田中建設の支払遅延について督促強化が必要
              </p>
            </div>

            <button
              onClick={() => setActiveModal('comprehensive-risk-analysis')}
              className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              ⚡ リスク詳細分析
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Creation/Edit Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingInvoice ? '請求書編集' : '新規請求書作成'}
              </h3>
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  プロジェクト名
                </label>
                <input
                  type="text"
                  defaultValue={editingInvoice?.projectName || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    顧客名
                  </label>
                  <input
                    type="text"
                    defaultValue={editingInvoice?.customer || ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    金額 (¥)
                  </label>
                  <input
                    type="number"
                    defaultValue={editingInvoice?.amount || ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    発行日
                  </label>
                  <input
                    type="date"
                    defaultValue={editingInvoice?.issuedDate || ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    支払期限
                  </label>
                  <input
                    type="date"
                    defaultValue={editingInvoice?.dueDate || ''}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ステータス
                </label>
                <select
                  defaultValue={editingInvoice?.status || 'draft'}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">下書き</option>
                  <option value="sent">送付済み</option>
                  <option value="overdue">期限超過</option>
                  <option value="paid">入金済み</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingInvoice ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Entry Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">経費入力</h3>
              <button
                onClick={() => setShowExpenseForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  経費内容
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="経費の詳細を入力"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    カテゴリ
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="materials">材料費</option>
                    <option value="labor">人件費</option>
                    <option value="equipment">設備費</option>
                    <option value="office">事務用品</option>
                    <option value="marketing">営業費</option>
                    <option value="utilities">光熱費</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    金額 (¥)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日付</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">領収書あり</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  登録
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metric Detail Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeModal === 'revenue'
                  ? '売上詳細分析'
                  : activeModal === 'receivables'
                    ? '未収金詳細'
                    : activeModal === 'expected-payments'
                      ? '入金予定詳細'
                      : activeModal === 'pending-items'
                        ? '承認待ち項目'
                        : activeModal === 'expense-management'
                          ? '経費管理'
                          : activeModal === 'financial-reports'
                            ? '財務レポート生成'
                            : activeModal === 'payment-recording'
                              ? '入金記録'
                              : activeModal === 'ar-aging'
                                ? '売掛金年齢表'
                                : activeModal === 'cash-flow-forecast'
                                  ? 'キャッシュフロー予測'
                                  : activeModal === 'budget-analysis'
                                    ? '予算分析'
                                    : 'データ詳細'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8">
              {activeModal === 'financial-ai-insights' && (
                <div className="text-left max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                      🤖 AI財務アナリストレポート
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        最新
                      </span>
                    </h4>
                    <div className="space-y-4 text-sm">
                      <div className="bg-white p-4 rounded border-l-4 border-green-400">
                        <h5 className="font-bold text-green-800 mb-2">
                          ✅ 強み・ポジティブ要因
                        </h5>
                        <ul className="text-green-700 space-y-1">
                          <li>
                            • 営業利益率23.4%は業界平均18.2%を大幅に上回る
                          </li>
                          <li>• 流動比率2.4は健全な水準を維持</li>
                          <li>• 顧客満足度4.7/5.0は競合他社を上回る</li>
                          <li>• プロジェクト完成率98.5%は業界トップクラス</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded border-l-4 border-yellow-400">
                        <h5 className="font-bold text-yellow-800 mb-2">
                          ⚠️ 注意事項・改善点
                        </h5>
                        <ul className="text-yellow-700 space-y-1">
                          <li>
                            • 売掛金回収日数34日は改善余地あり（目標30日）
                          </li>
                          <li>• 2月末の一時的な資金繰り逼迫予測</li>
                          <li>• 営業効率性78.2%は前月比0.8%減少</li>
                          <li>• 材料費上昇トレンドの影響を注視</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded border-l-4 border-red-400">
                        <h5 className="font-bold text-red-800 mb-2">
                          🚨 リスク・要対応事項
                        </h5>
                        <ul className="text-red-700 space-y-1">
                          <li>• 田中建設の支払遅延（¥2.5M、5日超過）</li>
                          <li>• 信用リスクレベル「中」の顧客が1社</li>
                          <li>• 季節変動による売上減少リスク</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded border-l-4 border-blue-400">
                        <h5 className="font-bold text-blue-800 mb-2">
                          💡 AI推奨アクション
                        </h5>
                        <ul className="text-blue-700 space-y-1">
                          <li>• 督促プロセスの自動化による回収効率向上</li>
                          <li>• 資金調達オプションの事前準備（2月対応）</li>
                          <li>• 高収益プロジェクトの受注拡大戦略</li>
                          <li>• 材料費ヘッジング戦略の検討</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'comprehensive-kpi-dashboard' && (
                <div className="text-left">
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-bold text-green-800 mb-2">
                        💰 財務指標
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>総資産回転率</span>
                          <span className="font-bold">1.2倍</span>
                        </div>
                        <div className="flex justify-between">
                          <span>自己資本比率</span>
                          <span className="font-bold">68.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>投資回収期間</span>
                          <span className="font-bold">2.1年</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-bold text-blue-800 mb-2">
                        📈 成長指標
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>売上成長率</span>
                          <span className="font-bold text-green-600">
                            +12.3%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>利益成長率</span>
                          <span className="font-bold text-green-600">
                            +18.7%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>市場シェア</span>
                          <span className="font-bold">8.2%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-bold text-purple-800 mb-2">
                        ⚡ 効率指標
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>作業効率性</span>
                          <span className="font-bold">92.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>コスト効率性</span>
                          <span className="font-bold">87.1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>品質指標</span>
                          <span className="font-bold">4.8/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'expense-management' && (
                <div className="text-left max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-3">
                        📊 今月の経費状況
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">承認済み経費</span>
                          <span className="font-bold">¥1,245,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">承認待ち</span>
                          <span className="font-bold text-yellow-600">
                            ¥380,000
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">却下</span>
                          <span className="font-bold text-red-600">
                            ¥45,000
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-3">
                        💰 予算消化率
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>材料費</span>
                            <span>78%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: '78%' }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>人件費</span>
                            <span>92%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: '92%' }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>営業費</span>
                            <span>45%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: '45%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <h4 className="font-bold mb-3">最近の経費申請</h4>
                    <div className="space-y-2">
                      {expenses.slice(0, 5).map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${getCategoryColor(expense.category)}`}
                            >
                              {getCategoryName(expense.category)}
                            </span>
                            <div>
                              <p className="font-medium">
                                {expense.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {expense.submittedBy} • {expense.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatCurrency(expense.amount)}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                expense.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : expense.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {expense.status === 'approved'
                                ? '承認済み'
                                : expense.status === 'pending'
                                  ? '承認待ち'
                                  : '却下'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveModal(null);
                      router.push('/expenses');
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    経費管理システムを開く →
                  </button>
                </div>
              )}

              {activeModal === 'payment-recording' && (
                <div className="text-left max-w-4xl mx-auto">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚠️</span>
                      <div>
                        <h4 className="font-bold text-yellow-800">
                          本日の入金確認: 3件
                        </h4>
                        <p className="text-sm text-yellow-700">
                          未確認の入金があります
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h4 className="font-bold">最近の入金</h4>
                    {recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-lg">
                              {payment.customer}
                            </p>
                            <p className="text-sm text-gray-500">
                              請求書: {payment.invoice}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-sm ${getStatusColor(payment.status)}`}
                          >
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">入金額</p>
                            <p className="font-bold text-lg">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">入金日時</p>
                            <p className="font-medium">
                              {payment.receivedDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">入金方法</p>
                            <p className="font-medium">{payment.method}</p>
                          </div>
                        </div>
                        {payment.status === 'pending' && (
                          <div className="flex space-x-2 mt-3">
                            <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
                              ✓ 確認
                            </button>
                            <button className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                              詳細確認
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                    新規入金を記録 →
                  </button>
                </div>
              )}

              {activeModal === 'financial-reports' && (
                <div className="text-left max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-3">
                        📈 損益計算書
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>売上高</span>
                          <span className="font-bold">¥15,200,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>売上原価</span>
                          <span className="font-bold text-red-600">
                            -¥8,700,000
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span>売上総利益</span>
                          <span className="font-bold text-green-600">
                            ¥6,500,000
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>販管費</span>
                          <span className="font-bold text-red-600">
                            -¥3,200,000
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">営業利益</span>
                          <span className="font-bold text-green-600">
                            ¥3,300,000
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-3">
                        💰 貸借対照表サマリー
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>流動資産</span>
                          <span className="font-bold">¥28,500,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>固定資産</span>
                          <span className="font-bold">¥12,300,000</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span>資産合計</span>
                          <span className="font-bold">¥40,800,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>負債合計</span>
                          <span className="font-bold text-red-600">
                            ¥15,200,000
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">純資産</span>
                          <span className="font-bold text-green-600">
                            ¥25,600,000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <h4 className="font-bold mb-3">利用可能なレポート</h4>
                    <div className="space-y-2">
                      {financialReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {report.type === 'profit-loss'
                                ? '📊'
                                : report.type === 'balance-sheet'
                                  ? '⚖️'
                                  : report.type === 'cash-flow'
                                    ? '💵'
                                    : '📋'}
                            </span>
                            <div>
                              <p className="font-medium">{report.name}</p>
                              <p className="text-xs text-gray-500">
                                期間: {report.period}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                report.status === 'ready'
                                  ? 'bg-green-100 text-green-800'
                                  : report.status === 'generating'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {report.status === 'ready'
                                ? '準備完了'
                                : report.status === 'generating'
                                  ? '生成中'
                                  : '予定'}
                            </span>
                            {report.status === 'ready' && (
                              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                ダウンロード
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">
                      新規レポート生成 →
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium">
                      スケジュール設定 →
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'budget-analysis' && (
                <div className="text-left max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-purple-800 mb-3">
                      📊 予算執行状況サマリー
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">年間予算</p>
                        <p className="text-xl font-bold">¥120,000,000</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">執行済み</p>
                        <p className="text-xl font-bold text-blue-600">
                          ¥78,500,000
                        </p>
                        <p className="text-xs text-gray-500">65.4%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">残予算</p>
                        <p className="text-xl font-bold text-green-600">
                          ¥41,500,000
                        </p>
                        <p className="text-xs text-gray-500">34.6%</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {budgetComparison.map((item) => (
                      <div
                        key={item.category}
                        className="bg-white border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-bold">{item.category}</h5>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              item.variancePercent > 0
                                ? 'bg-red-100 text-red-800'
                                : item.variancePercent < -10
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.variancePercent > 0
                              ? '予算超過'
                              : item.variancePercent < -10
                                ? '未消化'
                                : '正常'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">予算</p>
                            <p className="font-bold">
                              {formatCurrency(item.budgeted)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">実績</p>
                            <p className="font-bold">
                              {formatCurrency(item.actual)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">差異</p>
                            <p
                              className={`font-bold ${item.variance < 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatCurrency(item.variance)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">差異率</p>
                            <p
                              className={`font-bold ${item.variancePercent < 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {item.variancePercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (item.actual / item.budgeted) * 100 > 100
                                  ? 'bg-red-500'
                                  : (item.actual / item.budgeted) * 100 > 80
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                              style={{
                                width: `${Math.min(100, (item.actual / item.budgeted) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'ar-aging' && (
                <div className="text-left max-w-4xl mx-auto">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚠️</span>
                      <div>
                        <h4 className="font-bold text-red-800">
                          売掛金回収注意
                        </h4>
                        <p className="text-sm text-red-700">
                          60日以上の未回収: ¥800,000
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">
                            顧客名
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            現在
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            30日
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            60日
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            90日
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            90日超
                          </th>
                          <th className="text-right px-4 py-3 font-medium">
                            合計
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {arAging.map((item, idx) => (
                          <tr key={idx} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">
                              {item.customer}
                            </td>
                            <td className="text-right px-4 py-3">
                              {item.current > 0
                                ? formatCurrency(item.current)
                                : '-'}
                            </td>
                            <td className="text-right px-4 py-3 text-yellow-600">
                              {item.days30 > 0
                                ? formatCurrency(item.days30)
                                : '-'}
                            </td>
                            <td className="text-right px-4 py-3 text-orange-600">
                              {item.days60 > 0
                                ? formatCurrency(item.days60)
                                : '-'}
                            </td>
                            <td className="text-right px-4 py-3 text-red-600">
                              {item.days90 > 0
                                ? formatCurrency(item.days90)
                                : '-'}
                            </td>
                            <td className="text-right px-4 py-3 text-red-800">
                              {item.over90 > 0
                                ? formatCurrency(item.over90)
                                : '-'}
                            </td>
                            <td className="text-right px-4 py-3 font-bold">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100">
                        <tr>
                          <td className="px-4 py-3 font-bold">合計</td>
                          <td className="text-right px-4 py-3 font-bold">
                            {formatCurrency(
                              arAging.reduce(
                                (sum, item) => sum + item.current,
                                0,
                              ),
                            )}
                          </td>
                          <td className="text-right px-4 py-3 font-bold text-yellow-600">
                            {formatCurrency(
                              arAging.reduce(
                                (sum, item) => sum + item.days30,
                                0,
                              ),
                            )}
                          </td>
                          <td className="text-right px-4 py-3 font-bold text-orange-600">
                            {formatCurrency(
                              arAging.reduce(
                                (sum, item) => sum + item.days60,
                                0,
                              ),
                            )}
                          </td>
                          <td className="text-right px-4 py-3 font-bold text-red-600">
                            {formatCurrency(
                              arAging.reduce(
                                (sum, item) => sum + item.days90,
                                0,
                              ),
                            )}
                          </td>
                          <td className="text-right px-4 py-3 font-bold text-red-800">
                            {formatCurrency(
                              arAging.reduce(
                                (sum, item) => sum + item.over90,
                                0,
                              ),
                            )}
                          </td>
                          <td className="text-right px-4 py-3 font-bold">
                            {formatCurrency(
                              arAging.reduce(
                                (sum, item) => sum + item.total,
                                0,
                              ),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium">
                      督促メール送信 →
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium">
                      回収計画作成 →
                    </button>
                  </div>
                </div>
              )}

              {![
                'financial-ai-insights',
                'comprehensive-kpi-dashboard',
                'expense-management',
                'payment-recording',
                'financial-reports',
                'budget-analysis',
                'ar-aging',
              ].includes(activeModal) && (
                <div className="text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg">{activeModal}の詳細分析</p>
                  <p className="text-sm mt-2">
                    高度な財務分析データ、グラフ、予測モデルがここに表示されます。
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">実装予定機能:</p>
                    <ul className="text-xs text-left mt-2 space-y-1">
                      <li>• インタラクティブなチャートとグラフ</li>
                      <li>• ドリルダウン機能付きデータ分析</li>
                      <li>• カスタマイズ可能なレポート生成</li>
                      <li>• エクスポート機能（PDF、Excel、CSV）</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
      <div className="w-96 flex-shrink-0 space-y-5">
        <RAGAssistant className="h-auto" userRole="経理担当" />
        
        {/* Cash Flow - 3 months */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-green-800 mb-3">📈 キャッシュフロー</h3>
          <div className="space-y-3">
            <div className="border-b pb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">11月</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">収入</span>
                <span className="text-sm font-bold text-green-600">¥12,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">支出</span>
                <span className="text-sm font-bold text-red-600">¥8,300,000</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-sm">収支</span>
                <span className="text-sm font-bold">¥4,200,000</span>
              </div>
            </div>
            
            <div className="border-b pb-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">12月</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">収入</span>
                <span className="text-sm font-bold text-green-600">¥15,200,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">支出</span>
                <span className="text-sm font-bold text-red-600">¥10,500,000</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-sm">収支</span>
                <span className="text-sm font-bold">¥4,700,000</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">1月</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">収入</span>
                <span className="text-sm font-bold text-green-600">¥9,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">支出</span>
                <span className="text-sm font-bold text-red-600">¥7,800,000</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-sm">収支</span>
                <span className="text-sm font-bold">¥1,700,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Management */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-red-800 mb-3">💳 経費管理</h3>
          <div className="space-y-3">
            {expenses.slice(0, 3).map((expense) => (
              <div
                key={expense.id}
                className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleMetricClick(`expense-${expense.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm">
                    {expense.description}
                  </h5>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      expense.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : expense.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {expense.status === 'approved'
                      ? '承認済み'
                      : expense.status === 'pending'
                        ? '承認待ち'
                        : '却下'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`px-2 py-1 rounded ${getCategoryColor(expense.category)}`}
                  >
                    {getCategoryName(expense.category)}
                  </span>
                  <span className="font-bold">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{expense.date}</span>
                  <span>提出者: {expense.submittedBy}</span>
                </div>
              </div>
            ))}
            <button
              onClick={() => router.push('/expenses')}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
            >
              💳 経費管理
            </button>
          </div>
        </div>

        {/* This Month's Schedule */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-blue-800 mb-3">🗓️ 今月の予定</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">請求書発送</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">12件</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">支払予定</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">8件</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">決算準備</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">2/15まで</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">税務申告</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">2/28まで</span>
            </div>
          </div>
        </div>

        {/* Financial Reports */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">📊 財務レポート</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">1月度 損益計算書</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">準備完了</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">1月度 キャッシュフロー計算書</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">準備完了</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">2月度 損益計算書</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">作成中</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-800 mb-4">⚡ クイックアクション</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/invoices')}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
            >
              📋 請求管理
            </button>
            <button
              onClick={() => router.push('/invoices')}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
            >
              💰 入金管理
            </button>
            <button
              onClick={() => router.push('/disbursements')}
              className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors shadow-sm"
            >
              💸 支払管理
            </button>
            <button
              onClick={() => router.push('/cashflow')}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
            >
              📊 資金繰り表
            </button>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors shadow-sm"
            >
              📋 経費入力
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
