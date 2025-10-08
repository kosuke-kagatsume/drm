'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  Download,
  Send,
} from 'lucide-react';

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const contractId = params.id as string;

  useEffect(() => {
    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contracts?id=${contractId}`);

      if (!response.ok) {
        throw new Error('契約データの読み込みに失敗しました');
      }

      const data = await response.json();
      setContract(data.contract);
    } catch (error) {
      console.error('Error loading contract:', error);
      alert('契約データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: '下書き', icon: '📋' },
      pending_approval: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '承認待ち', icon: '⏳' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: '承認済み', icon: '✅' },
      signed: { bg: 'bg-green-100', text: 'text-green-800', label: '契約締結', icon: '📝' },
      in_progress: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: '進行中', icon: '🚧' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: '完了', icon: '🎉' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'キャンセル', icon: '❌' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} flex items-center gap-1 inline-flex`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">契約データが見つかりません</p>
          <button
            onClick={() => router.push('/estimates')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            見積一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/estimates')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  契約書詳細
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {contract.contractNo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/contracts/${contractId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4" />
                編集
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <Download className="h-4 w-4" />
                PDF出力
              </button>
              {contract.status === 'approved' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Send className="h-4 w-4" />
                  顧客へ送信
                </button>
              )}
              {(contract.status === 'signed' || contract.status === 'approved' || contract.status === 'in_progress') && (
                <button
                  onClick={() => router.push(`/orders/create?contractId=${contractId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  発注先決定
                </button>
              )}
              {(contract.status === 'signed' || contract.status === 'in_progress') && (
                <button
                  onClick={() => router.push(`/invoices/create?contractId=${contractId}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  請求書発行
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ステータス・基本情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getStatusBadge(contract.status)}
              <div className="text-sm text-gray-600">
                作成日: {contract.contractDate}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">見積番号</p>
              <p className="text-lg font-bold text-gray-900">{contract.estimateNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">プロジェクト名</p>
              <p className="text-lg font-bold text-gray-900">{contract.projectName}</p>
              <p className="text-sm text-gray-600 mt-1">{contract.projectType}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">契約金額</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{contract.totalAmount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                (税抜: ¥{contract.contractAmount?.toLocaleString()})
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">工期</p>
              <p className="text-lg font-bold text-gray-900">{contract.duration}日間</p>
              <p className="text-sm text-gray-600 mt-1">
                {contract.startDate} ～ {contract.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* 顧客情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            顧客情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">顧客名</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {contract.customerName}
              </p>
            </div>
            {contract.customerCompany && (
              <div>
                <p className="text-sm text-gray-600">会社名</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {contract.customerCompany}
                </p>
              </div>
            )}
            {contract.customerAddress && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">住所</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {contract.customerAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 契約条項 */}
        {contract.clauses && contract.clauses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">契約条項</h2>
            <div className="space-y-4">
              {contract.clauses.map((clause: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">{clause.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{clause.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 支払条件 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            支払条件
          </h2>
          <p className="text-gray-900 whitespace-pre-wrap">
            {contract.paymentTerms || '未設定'}
          </p>
        </div>

        {/* メタ情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">管理情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">作成者</p>
              <p className="text-gray-900 mt-1">{contract.createdBy}</p>
            </div>
            <div>
              <p className="text-gray-600">担当者</p>
              <p className="text-gray-900 mt-1">{contract.manager}</p>
            </div>
            <div>
              <p className="text-gray-600">作成日時</p>
              <p className="text-gray-900 mt-1">{contract.createdAt}</p>
            </div>
            <div>
              <p className="text-gray-600">更新日時</p>
              <p className="text-gray-900 mt-1">{contract.updatedAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
