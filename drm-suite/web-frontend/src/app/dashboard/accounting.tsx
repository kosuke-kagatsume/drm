'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AccountingDashboardProps {
  userEmail: string;
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

  return (
    <div className="space-y-6">
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

      {/* KPIサマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">💰 財務サマリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">今月売上</p>
            <p className="text-3xl font-bold text-green-600">¥9.5M</p>
            <p className="text-xs text-gray-500">前月比 -38%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">未収金</p>
            <p className="text-3xl font-bold text-orange-600">¥8.3M</p>
            <p className="text-xs text-gray-500">3件の請求書</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">入金予定</p>
            <p className="text-3xl font-bold text-blue-600">¥4.2M</p>
            <p className="text-xs text-gray-500">今週中</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-yellow-800 font-medium">要確認</p>
            <p className="text-3xl font-bold text-yellow-600">2件</p>
            <button className="text-xs text-yellow-700 underline">
              確認する →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 請求書管理 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-800">
                📄 請求書管理
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {invoices.map((invoice) => (
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
                            <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
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
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                              確認
                            </button>
                          )}
                          {payment.status === 'confirmed' && (
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
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

        {/* 右サイドバー */}
        <div className="lg:col-span-1 space-y-6">
          {/* キャッシュフロー */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">📈 キャッシュフロー</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {cashFlow.map((month, idx) => (
                  <div key={idx} className="border-b pb-3">
                    <p className="font-medium text-sm mb-2">{month.month}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">収入:</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(month.income)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">支出:</span>
                        <span className="text-red-600 font-medium">
                          {formatCurrency(month.expense)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-gray-600">収支:</span>
                        <span
                          className={`font-bold ${month.balance > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(month.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 今月の予定 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">📅 今月の予定</h3>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span>請求書発行</span>
                <span className="font-bold text-blue-600">12件</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>支払予定</span>
                <span className="font-bold text-orange-600">8件</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>決算準備</span>
                <span className="text-gray-500">2/15まで</span>
              </div>
              <div className="flex justify-between py-2">
                <span>税務申告</span>
                <span className="text-gray-500">2/28まで</span>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">⚡ クイックアクション</h3>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                新規請求書作成
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                入金確認
              </button>
              <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                経費精算
              </button>
              <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                月次レポート
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
