'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: string;
  invoiceNumber: string;
  contractId: string;
  projectName: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'overdue' | 'paid' | 'cancelled';
  paymentDate?: string;
  notes?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for login information
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      const email = localStorage.getItem('userEmail');

      if (!role || !email) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  const invoices: Invoice[] = [
    {
      id: 'INV001',
      invoiceNumber: '2024-0701',
      contractId: 'CON001',
      projectName: '田中様邸新築工事',
      customer: '田中太郎',
      issueDate: '2024-07-01',
      dueDate: '2024-07-31',
      amount: 5000000,
      tax: 500000,
      totalAmount: 5500000,
      status: 'paid',
      paymentDate: '2024-07-25',
    },
    {
      id: 'INV002',
      invoiceNumber: '2024-0702',
      contractId: 'CON001',
      projectName: '田中様邸新築工事',
      customer: '田中太郎',
      issueDate: '2024-08-01',
      dueDate: '2024-08-31',
      amount: 4000000,
      tax: 400000,
      totalAmount: 4400000,
      status: 'sent',
    },
    {
      id: 'INV003',
      invoiceNumber: '2024-0703',
      contractId: 'CON002',
      projectName: '山田ビル改修工事',
      customer: '山田商事株式会社',
      issueDate: '2024-07-15',
      dueDate: '2024-08-15',
      amount: 8000000,
      tax: 800000,
      totalAmount: 8800000,
      status: 'overdue',
      notes: '支払い遅延中',
    },
    {
      id: 'INV004',
      invoiceNumber: '2024-0704',
      contractId: 'CON003',
      projectName: '佐藤様邸リフォーム',
      customer: '佐藤花子',
      issueDate: '2024-06-20',
      dueDate: '2024-07-20',
      amount: 8000000,
      tax: 800000,
      totalAmount: 8800000,
      status: 'paid',
      paymentDate: '2024-07-15',
    },
    {
      id: 'INV005',
      invoiceNumber: '2024-0705',
      contractId: 'CON005',
      projectName: '高橋様邸増築工事',
      customer: '高橋一郎',
      issueDate: '2024-08-01',
      dueDate: '2024-08-31',
      amount: 3600000,
      tax: 360000,
      totalAmount: 3960000,
      status: 'draft',
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      selectedStatus === 'all' || invoice.status === selectedStatus;
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      matchesDate =
        invoice.issueDate >= dateRange.start &&
        invoice.issueDate <= dateRange.end;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-dandori-blue/10 text-dandori-blue',
      overdue: 'bg-dandori-pink/10 text-dandori-pink',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      draft: '下書き',
      sent: '送付済',
      overdue: '期限超過',
      paid: '入金済',
      cancelled: 'キャンセル',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const totalBilled = filteredInvoices.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0,
  );
  const totalPaid = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOverdue = filteredInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">請求書管理</h1>
          <p className="mt-2 text-gray-600">請求書の発行と入金状況の管理</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">請求総額</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ¥{totalBilled.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">入金済額</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ¥{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">未収金額</p>
            <p className="text-2xl font-bold text-dandori-orange mt-1">
              ¥{(totalBilled - totalPaid).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">期限超過</p>
            <p className="text-2xl font-bold text-dandori-pink mt-1">
              ¥{totalOverdue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="請求書番号・プロジェクト名で検索..."
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">すべての請求書</option>
              <option value="draft">下書き</option>
              <option value="sent">送付済</option>
              <option value="overdue">期限超過</option>
              <option value="paid">入金済</option>
              <option value="cancelled">キャンセル</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              placeholder="開始日"
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              placeholder="終了日"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => router.push('/invoices/create')}
              className="px-4 py-2 bg-gradient-dandori text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              新規請求書作成
            </button>
          </div>
        </div>

        {/* 請求書一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  請求書番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロジェクト
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発行日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  請求額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(invoice.issueDate).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(invoice.dueDate).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ¥{invoice.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        className="text-dandori-blue hover:text-dandori-blue-dark"
                      >
                        詳細
                      </button>
                      {invoice.status === 'draft' && (
                        <button className="text-dandori-orange hover:text-dandori-orange/80">
                          送付
                        </button>
                      )}
                      {invoice.status === 'sent' && (
                        <button className="text-green-600 hover:text-green-700">
                          入金登録
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800">
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
