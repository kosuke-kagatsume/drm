'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Save,
  FileText,
  CheckCircle,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
} from 'lucide-react';

function ContractCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [contractData, setContractData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const estimateId = searchParams.get('estimateId');

  useEffect(() => {
    if (estimateId) {
      loadContractData();
    }
  }, [estimateId]);

  const loadContractData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contracts/from-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimateId }),
      });

      if (!response.ok) {
        throw new Error('契約データの読み込みに失敗しました');
      }

      const data = await response.json();
      setContractData(data.contract);
    } catch (error) {
      console.error('Error loading contract data:', error);
      alert('契約データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contractData,
          createdBy: user?.name || 'システム',
          manager: user?.name || '未割当',
        }),
      });

      if (!response.ok) {
        throw new Error('契約書の保存に失敗しました');
      }

      const result = await response.json();
      alert('契約書を保存しました');
      router.push(`/contracts/${result.contract.id}`);
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('契約書の保存に失敗しました');
    } finally {
      setSaving(false);
    }
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

  if (!contractData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">契約データがありません</p>
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

  const contractTemplates = [
    { id: 'construction', name: '建設工事請負契約' },
    { id: 'subcontract', name: '下請負契約' },
    { id: 'maintenance', name: '保守メンテナンス契約' },
    { id: 'lease', name: '建設機械リース契約' },
    { id: 'consulting', name: 'コンサルティング契約' },
  ];

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
                  契約書作成
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  見積から自動生成された契約書データ
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '契約書を保存'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 自動マッピング情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium">自動マッピング完了</p>
              <p className="text-sm text-blue-700 mt-1">
                見積番号 {contractData.estimateNo} から契約データを自動生成しました
              </p>
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            基本情報
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約番号
              </label>
              <input
                type="text"
                value={contractData.contractNo || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, contractNo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約日
              </label>
              <input
                type="date"
                value={contractData.contractDate || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, contractDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト名
              </label>
              <input
                type="text"
                value={contractData.projectName || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, projectName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約種別
              </label>
              <select
                value={contractData.contractType || 'construction'}
                onChange={(e) =>
                  setContractData({ ...contractData, contractType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {contractTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト種別
              </label>
              <input
                type="text"
                value={contractData.projectType || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, projectType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                顧客名
              </label>
              <input
                type="text"
                value={contractData.customerName || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, customerName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名
              </label>
              <input
                type="text"
                value={contractData.customerCompany || ''}
                onChange={(e) =>
                  setContractData({
                    ...contractData,
                    customerCompany: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 契約金額・工期 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            契約金額・工期
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約金額（税抜）
              </label>
              <input
                type="number"
                value={contractData.contractAmount || 0}
                onChange={(e) =>
                  setContractData({
                    ...contractData,
                    contractAmount: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                着工日
              </label>
              <input
                type="date"
                value={contractData.startDate || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完成予定日
              </label>
              <input
                type="date"
                value={contractData.endDate || ''}
                onChange={(e) =>
                  setContractData({ ...contractData, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 契約条項（見積項目から自動生成） */}
        {contractData.clauses && contractData.clauses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">契約条項</h2>
            <div className="space-y-3">
              {contractData.clauses.map((clause: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">{clause.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{clause.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 支払条件 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">支払条件</h2>
          <textarea
            value={contractData.paymentTerms || ''}
            onChange={(e) =>
              setContractData({ ...contractData, paymentTerms: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="支払条件を入力してください"
          />
        </div>
      </div>
    </div>
  );
}

export default function ContractCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ContractCreateContent />
    </Suspense>
  );
}
