'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Estimate {
  id: string;
  estimateNo: string;
  companyName: string;
  projectName: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function EstimatesPage() {
  const router = useRouter();
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

  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: '1',
      estimateNo: 'EST-2024-001',
      companyName: '株式会社サンプル',
      projectName: 'Webサイトリニューアル',
      totalAmount: 1500000,
      status: 'pending',
      createdAt: '2024-08-01',
    },
    {
      id: '2',
      estimateNo: 'EST-2024-002',
      companyName: 'テスト商事',
      projectName: 'システム開発',
      totalAmount: 3200000,
      status: 'approved',
      createdAt: '2024-08-03',
    },
    {
      id: '3',
      estimateNo: 'EST-2024-003',
      companyName: 'デモ工業',
      projectName: 'アプリ開発',
      totalAmount: 2100000,
      status: 'draft',
      createdAt: '2024-08-05',
    },
  ]);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      draft: '下書き',
      pending: '承認待ち',
      approved: '承認済み',
      rejected: '却下',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← ダッシュボード
            </button>
            <h1 className="text-2xl font-bold text-gray-900">見積管理</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">見積一覧</h2>
            <button
              onClick={() => router.push('/estimates/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + 新規見積作成
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    見積番号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    会社名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    案件名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    作成日
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {estimates.map((estimate) => (
                  <tr key={estimate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {estimate.estimateNo}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {estimate.companyName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {estimate.projectName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      ¥{estimate.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {getStatusBadge(estimate.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {estimate.createdAt}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        編集
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
