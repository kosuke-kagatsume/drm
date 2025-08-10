'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Contract {
  id: string;
  projectName: string;
  customer: string;
  contractDate: string;
  amount: number;
  status: 'draft' | 'signed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentProgress: number;
  dueDate: string;
}

export default function ContractsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const contracts: Contract[] = [
    {
      id: 'CON001',
      projectName: '田中様邸新築工事',
      customer: '田中太郎',
      contractDate: '2024-07-01',
      amount: 15000000,
      status: 'signed',
      paymentStatus: 'partial',
      paymentProgress: 60,
      dueDate: '2024-09-30',
    },
    {
      id: 'CON002',
      projectName: '山田ビル改修工事',
      customer: '山田商事株式会社',
      contractDate: '2024-07-15',
      amount: 25000000,
      status: 'signed',
      paymentStatus: 'pending',
      paymentProgress: 0,
      dueDate: '2024-10-15',
    },
    {
      id: 'CON003',
      projectName: '佐藤様邸リフォーム',
      customer: '佐藤花子',
      contractDate: '2024-06-20',
      amount: 8000000,
      status: 'completed',
      paymentStatus: 'paid',
      paymentProgress: 100,
      dueDate: '2024-08-20',
    },
    {
      id: 'CON004',
      projectName: '鈴木マンション外壁塗装',
      customer: '鈴木不動産',
      contractDate: '2024-08-01',
      amount: 5500000,
      status: 'draft',
      paymentStatus: 'pending',
      paymentProgress: 0,
      dueDate: '2024-11-01',
    },
    {
      id: 'CON005',
      projectName: '高橋様邸増築工事',
      customer: '高橋一郎',
      contractDate: '2024-07-25',
      amount: 12000000,
      status: 'signed',
      paymentStatus: 'partial',
      paymentProgress: 30,
      dueDate: '2024-10-25',
    },
  ];

  const filteredContracts = contracts.filter((contract) => {
    const matchesStatus =
      selectedStatus === 'all' || contract.status === selectedStatus;
    const matchesSearch =
      contract.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Contract['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      signed: 'bg-dandori-blue/10 text-dandori-blue',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      draft: '下書き',
      signed: '契約済',
      completed: '完了',
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

  const getPaymentBadge = (status: Contract['paymentStatus']) => {
    const styles = {
      pending: 'bg-dandori-orange/10 text-dandori-orange',
      partial: 'bg-dandori-yellow/20 text-dandori-orange',
      paid: 'bg-green-100 text-green-700',
    };
    const labels = {
      pending: '未払い',
      partial: '一部入金',
      paid: '完済',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const totalAmount = filteredContracts.reduce(
    (sum, contract) => sum + contract.amount,
    0,
  );
  const receivedAmount = filteredContracts.reduce(
    (sum, contract) => sum + (contract.amount * contract.paymentProgress) / 100,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">契約管理</h1>
          <p className="mt-2 text-gray-600">
            契約書の管理と請求・入金状況の確認
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">契約総額</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ¥{totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">入金済額</p>
            <p className="text-2xl font-bold text-dandori-blue mt-1">
              ¥{receivedAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">未収金額</p>
            <p className="text-2xl font-bold text-dandori-orange mt-1">
              ¥{(totalAmount - receivedAmount).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">回収率</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {totalAmount > 0
                ? Math.round((receivedAmount / totalAmount) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="プロジェクト名・顧客名で検索..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">すべての契約</option>
                <option value="draft">下書き</option>
                <option value="signed">契約済</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <button
                onClick={() => router.push('/contracts/create')}
                className="px-4 py-2 bg-gradient-dandori text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                新規契約作成
              </button>
            </div>
          </div>
        </div>

        {/* 契約一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  契約番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロジェクト名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  契約金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  契約状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入金進捗
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contract.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {contract.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ¥{contract.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contract.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentBadge(contract.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            contract.paymentProgress === 100
                              ? 'bg-green-500'
                              : contract.paymentProgress > 0
                                ? 'bg-dandori-yellow'
                                : 'bg-gray-300'
                          }`}
                          style={{ width: `${contract.paymentProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {contract.paymentProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/contracts/${contract.id}`)}
                        className="text-dandori-blue hover:text-dandori-blue-dark"
                      >
                        詳細
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/invoices/create?contractId=${contract.id}`,
                          )
                        }
                        className="text-dandori-orange hover:text-dandori-orange/80"
                      >
                        請求書
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
