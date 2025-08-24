'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Plus,
  Eye,
  Download,
  RefreshCw,
  ArrowLeft,
  Users,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  electronicContractService,
  ElectronicContract,
  ContractTemplate,
  CreateContractRequest,
  ElectronicContractProvider,
} from '@/services/electronic-contract.service';

export default function ElectronicContractsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [contracts, setContracts] = useState<ElectronicContract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ElectronicContractProvider>('cloudsign');
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // フォームデータ
  const [contractTitle, setContractTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [contractData, setContractData] = useState<Record<string, any>>({});
  const [signers, setSigners] = useState([
    { name: '', email: '', role: 'contractor' as const },
    { name: '', email: '', role: 'client' as const },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contractsList, templatesList] = await Promise.all([
        electronicContractService.getContracts(),
        electronicContractService.getTemplates(),
      ]);
      setContracts(contractsList);
      setTemplates(templatesList);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateContract = async () => {
    if (!contractTitle || !selectedTemplateId) return;

    setIsCreating(true);
    try {
      const request: CreateContractRequest = {
        templateId: selectedTemplateId,
        title: contractTitle,
        contractData,
        signers: signers.filter((s) => s.name && s.email),
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30日後
        message: '契約書への署名をお願いいたします。',
      };

      await electronicContractService.createAndSendContract(
        selectedProvider,
        request,
      );
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create contract:', error);
      alert('契約書の作成に失敗しました。');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setContractTitle('');
    setSelectedTemplateId('');
    setContractData({});
    setSigners([
      { name: '', email: '', role: 'contractor' },
      { name: '', email: '', role: 'client' },
    ]);
  };

  const getStatusIcon = (status: ElectronicContract['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-5 h-5 text-gray-500" />;
      case 'sent':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ElectronicContract['status']) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: '下書き' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: '送信済み' },
      in_progress: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: '署名待ち',
      },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: '完了' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: '期限切れ' },
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

  const getProviderIcon = (provider: ElectronicContractProvider) => {
    switch (provider) {
      case 'cloudsign':
        return '☁️';
      case 'gmosign':
        return '🔒';
      case 'docusign':
        return '📋';
      default:
        return '📄';
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
                onClick={() => router.push('/contracts')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  電子契約管理
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  CloudSign・GMOサイン・DocuSignとの連携
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
                同期
              </button>
              <button
                onClick={() => router.push('/contracts/electronic/templates')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                テンプレート管理
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新規契約作成
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
                <p className="text-sm text-gray-600">総契約数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">署名待ち</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contracts.filter((c) => c.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">完了済み</p>
                <p className="text-2xl font-bold text-green-600">
                  {contracts.filter((c) => c.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">完了率</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contracts.length > 0
                    ? Math.round(
                        (contracts.filter((c) => c.status === 'completed')
                          .length /
                          contracts.length) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* 契約一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">契約一覧</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    契約書
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    プロバイダー
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    署名者
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    作成日
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(contract.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {contract.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {contract.providerContractId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getProviderIcon(contract.provider)}
                        </span>
                        <span className="text-sm text-gray-700 capitalize">
                          {contract.provider}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex -space-x-2">
                        {contract.signers.slice(0, 3).map((signer, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                            title={`${signer.name} (${signer.status})`}
                          >
                            {signer.name.charAt(0)}
                          </div>
                        ))}
                        {contract.signers.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center border-2 border-white">
                            +{contract.signers.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700">
                        {new Date(contract.createdAt).toLocaleDateString(
                          'ja-JP',
                        )}
                      </p>
                      {contract.expiresAt && (
                        <p className="text-xs text-gray-500">
                          期限:{' '}
                          {new Date(contract.expiresAt).toLocaleDateString(
                            'ja-JP',
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="詳細表示"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {contract.documentUrl && (
                          <button
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition"
                            title="ダウンロード"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contracts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">まだ契約書がありません</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                最初の契約を作成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 契約作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                新規契約作成
              </h3>

              <div className="space-y-4">
                {/* プロバイダー選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子契約サービス
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) =>
                      setSelectedProvider(
                        e.target.value as ElectronicContractProvider,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cloudsign">CloudSign</option>
                    <option value="gmosign">GMOサイン</option>
                    <option value="docusign">DocuSign</option>
                  </select>
                </div>

                {/* 契約書タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    契約書タイトル
                  </label>
                  <input
                    type="text"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    placeholder="例: 田中様邸新築工事請負契約書"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* テンプレート選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    契約書テンプレート
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">テンプレートを選択</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 署名者設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    署名者
                  </label>
                  {signers.map((signer, index) => (
                    <div key={index} className="flex gap-3 mb-2">
                      <select
                        value={signer.role}
                        onChange={(e) => {
                          const newSigners = [...signers];
                          newSigners[index].role = e.target.value as any;
                          setSigners(newSigners);
                        }}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option value="contractor">請負者</option>
                        <option value="client">発注者</option>
                        <option value="witness">立会人</option>
                      </select>
                      <input
                        type="text"
                        value={signer.name}
                        onChange={(e) => {
                          const newSigners = [...signers];
                          newSigners[index].name = e.target.value;
                          setSigners(newSigners);
                        }}
                        placeholder="氏名"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="email"
                        value={signer.email}
                        onChange={(e) => {
                          const newSigners = [...signers];
                          newSigners[index].email = e.target.value;
                          setSigners(newSigners);
                        }}
                        placeholder="メールアドレス"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCreateContract}
                  disabled={isCreating || !contractTitle || !selectedTemplateId}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isCreating ? '作成中...' : '契約書を作成・送信'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
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
