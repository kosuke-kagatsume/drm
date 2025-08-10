'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  invoiceNumber: string;
  contractId: string;
  projectName: string;
  customer: string;
  invoiceAmount: number;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: 'bank' | 'cash' | 'check' | 'credit';
  status: 'pending' | 'confirmed' | 'cancelled';
  bankAccount?: string;
  reference?: string;
  notes?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('thisMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  useEffect(() => {
    // Check localStorage for login information
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    if (!role || !email) {
      router.push('/login');
    }
  }, [router]);

  const payments: Payment[] = [
    {
      id: 'PAY001',
      invoiceNumber: '2024-0701',
      contractId: 'CON001',
      projectName: '田中様邸新築工事',
      customer: '田中太郎',
      invoiceAmount: 5500000,
      paymentAmount: 5500000,
      paymentDate: '2024-07-25',
      paymentMethod: 'bank',
      status: 'confirmed',
      bankAccount: '三菱UFJ銀行 新宿支店',
      reference: 'REF-20240725-001',
    },
    {
      id: 'PAY002',
      invoiceNumber: '2024-0704',
      contractId: 'CON003',
      projectName: '佐藤様邸リフォーム',
      customer: '佐藤花子',
      invoiceAmount: 8800000,
      paymentAmount: 8800000,
      paymentDate: '2024-07-15',
      paymentMethod: 'bank',
      status: 'confirmed',
      bankAccount: 'みずほ銀行 渋谷支店',
      reference: 'REF-20240715-002',
    },
    {
      id: 'PAY003',
      invoiceNumber: '2024-0702',
      contractId: 'CON001',
      projectName: '田中様邸新築工事',
      customer: '田中太郎',
      invoiceAmount: 4400000,
      paymentAmount: 2000000,
      paymentDate: '2024-08-05',
      paymentMethod: 'bank',
      status: 'pending',
      bankAccount: '三菱UFJ銀行 新宿支店',
      notes: '一部入金',
    },
    {
      id: 'PAY004',
      invoiceNumber: '2024-0703',
      contractId: 'CON002',
      projectName: '山田ビル改修工事',
      customer: '山田商事株式会社',
      invoiceAmount: 8800000,
      paymentAmount: 0,
      paymentDate: '2024-08-15',
      paymentMethod: 'bank',
      status: 'pending',
      notes: '支払い待ち',
    },
    {
      id: 'PAY005',
      invoiceNumber: '2024-0706',
      contractId: 'CON004',
      projectName: '鈴木マンション外壁塗装',
      customer: '鈴木不動産',
      invoiceAmount: 3200000,
      paymentAmount: 3200000,
      paymentDate: '2024-08-01',
      paymentMethod: 'check',
      status: 'confirmed',
      reference: 'CHK-20240801-001',
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod =
      selectedMethod === 'all' || payment.paymentMethod === selectedMethod;

    let matchesPeriod = true;
    if (selectedPeriod === 'thisMonth') {
      const thisMonth = new Date().toISOString().slice(0, 7);
      matchesPeriod = payment.paymentDate.startsWith(thisMonth);
    } else if (selectedPeriod === 'lastMonth') {
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString()
        .slice(0, 7);
      matchesPeriod = payment.paymentDate.startsWith(lastMonth);
    }

    return matchesSearch && matchesMethod && matchesPeriod;
  });

  const getStatusBadge = (status: Payment['status']) => {
    const styles = {
      pending: 'bg-dandori-orange/10 text-dandori-orange',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: '確認待ち',
      confirmed: '確認済',
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

  const getMethodIcon = (method: Payment['paymentMethod']) => {
    const icons = {
      bank: '🏦',
      cash: '💵',
      check: '📄',
      credit: '💳',
    };
    return icons[method] || '💰';
  };

  const getMethodLabel = (method: Payment['paymentMethod']) => {
    const labels = {
      bank: '銀行振込',
      cash: '現金',
      check: '小切手',
      credit: 'クレジット',
    };
    return labels[method] || method;
  };

  const totalReceived = filteredPayments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.paymentAmount, 0);
  const totalPending = filteredPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.invoiceAmount - p.paymentAmount, 0);
  const totalInvoiced = filteredPayments.reduce(
    (sum, p) => sum + p.invoiceAmount,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">入金管理</h1>
          <p className="mt-2 text-gray-600">入金状況の確認と消込処理</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">請求総額</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ¥{totalInvoiced.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">入金済額</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ¥{totalReceived.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">未入金額</p>
            <p className="text-2xl font-bold text-dandori-orange mt-1">
              ¥{totalPending.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">入金率</p>
            <p className="text-2xl font-bold text-dandori-blue mt-1">
              {totalInvoiced > 0
                ? Math.round((totalReceived / totalInvoiced) * 100)
                : 0}
              %
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
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">全期間</option>
              <option value="thisMonth">今月</option>
              <option value="lastMonth">先月</option>
              <option value="thisQuarter">今四半期</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="all">すべての支払方法</option>
              <option value="bank">銀行振込</option>
              <option value="cash">現金</option>
              <option value="check">小切手</option>
              <option value="credit">クレジット</option>
            </select>
            <button
              onClick={() => router.push('/payments/reconciliation')}
              className="px-4 py-2 bg-gradient-dandori text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              消込処理
            </button>
          </div>
        </div>

        {/* 入金一覧 */}
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
                  請求額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入金日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払方法
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ¥{payment.invoiceAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={
                        payment.paymentAmount < payment.invoiceAmount
                          ? 'text-dandori-orange'
                          : 'text-green-600'
                      }
                    >
                      ¥{payment.paymentAmount.toLocaleString()}
                    </span>
                    {payment.paymentAmount < payment.invoiceAmount &&
                      payment.paymentAmount > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          (残: ¥
                          {(
                            payment.invoiceAmount - payment.paymentAmount
                          ).toLocaleString()}
                          )
                        </span>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="flex items-center gap-1">
                      <span>{getMethodIcon(payment.paymentMethod)}</span>
                      <span className="text-gray-600">
                        {getMethodLabel(payment.paymentMethod)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/payments/${payment.id}`)}
                        className="text-dandori-blue hover:text-dandori-blue-dark"
                      >
                        詳細
                      </button>
                      {payment.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-700">
                          確認
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800">
                        領収書
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 入金予定カレンダー */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">📅 今後の入金予定</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">
                  8月15日
                </span>
                <span className="px-2 py-1 bg-dandori-orange/10 text-dandori-orange rounded-full text-xs">
                  期限
                </span>
              </div>
              <p className="font-medium text-gray-900">山田ビル改修工事</p>
              <p className="text-sm text-gray-600 mt-1">山田商事株式会社</p>
              <p className="text-lg font-bold text-dandori-blue mt-2">
                ¥8,800,000
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">
                  8月31日
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  予定
                </span>
              </div>
              <p className="font-medium text-gray-900">田中様邸新築工事</p>
              <p className="text-sm text-gray-600 mt-1">田中太郎</p>
              <p className="text-lg font-bold text-dandori-blue mt-2">
                ¥2,400,000
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">
                  8月31日
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  予定
                </span>
              </div>
              <p className="font-medium text-gray-900">高橋様邸増築工事</p>
              <p className="text-sm text-gray-600 mt-1">高橋一郎</p>
              <p className="text-lg font-bold text-dandori-blue mt-2">
                ¥3,960,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
