'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Users,
  UserCheck,
  AlertCircle,
  Settings,
  Save,
  X,
  DollarSign,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Workflow,
  GitBranch,
  Filter,
  Copy,
  Eye,
} from 'lucide-react';
import type {
  ApprovalFlow,
  ApprovalStep,
  ApprovalCondition,
  DocumentType,
  ApprovalFlowType,
  Approver,
} from '@/types/approval-flow';
import ApprovalFlowModal from '@/components/admin/ApprovalFlowModal';

export default function ApprovalFlowsManagement() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [selectedFlowType, setSelectedFlowType] = useState<DocumentType>('estimate');
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [flowType, setFlowType] = useState<ApprovalFlowType>('organization');

  // 新規作成フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: 'estimate' as DocumentType,
    type: 'organization' as ApprovalFlowType,
    useOrganizationHierarchy: true,
    organizationLevels: 3,
    isActive: true,
    isDefault: false,
    priority: 1,
  });

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  // 承認フロー一覧取得
  useEffect(() => {
    fetchFlows();
  }, [selectedFlowType]);

  const fetchFlows = async () => {
    try {
      const response = await fetch(`/api/admin/approval-flows?documentType=${selectedFlowType}`);
      const data = await response.json();
      if (data.success) {
        setFlows(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch flows:', error);
    }
  };

  const flowTypes = [
    {
      id: 'estimate' as DocumentType,
      name: '見積承認',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      description: '見積書の承認ルート',
    },
    {
      id: 'contract' as DocumentType,
      name: '契約承認',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      description: '契約書の承認ルート',
    },
    {
      id: 'invoice' as DocumentType,
      name: '請求書承認',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      description: '請求書の承認ルート',
    },
    {
      id: 'expense' as DocumentType,
      name: '経費承認',
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      description: '経費申請の承認ルート',
    },
    {
      id: 'purchase' as DocumentType,
      name: '発注承認',
      icon: ShoppingCart,
      color: 'from-indigo-500 to-purple-500',
      description: '発注書の承認ルート',
    },
  ];

  const filteredFlows = flows.filter(
    (flow) => flow.documentType === selectedFlowType
  );

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm('この承認フローを削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`/api/admin/approval-flows?id=${flowId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchFlows();
      }
    } catch (error) {
      console.error('Failed to delete flow:', error);
    }
  };

  const handleDuplicateFlow = async (flow: ApprovalFlow) => {
    const newFlow = {
      ...flow,
      name: `${flow.name}（コピー）`,
      isDefault: false,
    };
    delete (newFlow as any).id;
    delete (newFlow as any).createdAt;
    delete (newFlow as any).updatedAt;

    try {
      const response = await fetch('/api/admin/approval-flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow),
      });
      const data = await response.json();
      if (data.success) {
        fetchFlows();
      }
    } catch (error) {
      console.error('Failed to duplicate flow:', error);
    }
  };

  const handleSaveFlow = async (flowData: Partial<ApprovalFlow>) => {
    try {
      if (editingFlow) {
        // 更新
        const response = await fetch('/api/admin/approval-flows', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...flowData, id: editingFlow.id }),
        });
        const data = await response.json();
        if (data.success) {
          fetchFlows();
          setShowEditModal(false);
          setEditingFlow(null);
        }
      } else {
        // 新規作成
        const response = await fetch('/api/admin/approval-flows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flowData),
        });
        const data = await response.json();
        if (data.success) {
          fetchFlows();
          setShowCreateModal(false);
        }
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-gray-400" />;
  };

  const getFlowTypeIcon = (type: ApprovalFlowType) => {
    if (type === 'organization') {
      return (
        <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          <Building2 className="h-3 w-3" />
          組織連動
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
        <Workflow className="h-3 w-3" />
        カスタム
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="hover:bg-white/20 p-2 rounded transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <GitBranch className="h-7 w-7" />
                  承認フロー管理
                </h1>
                <p className="text-sm opacity-90 mt-1">
                  組織連動型・カスタム型承認ルートの設定
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Plus className="h-5 w-5" />
              新規フロー作成
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フロータイプ選択タブ */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {flowTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedFlowType(type.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    selectedFlowType === type.id
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <TypeIcon className="h-5 w-5" />
                    <span>{type.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">全フロー数</div>
            <div className="text-2xl font-bold text-gray-900">{filteredFlows.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">組織連動型</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredFlows.filter(f => f.type === 'organization').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">カスタム型</div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredFlows.filter(f => f.type === 'custom').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">有効フロー</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredFlows.filter(f => f.isActive).length}
            </div>
          </div>
        </div>

        {/* 承認フロー一覧 */}
        <div className="space-y-4">
          {filteredFlows.map((flow) => (
            <div
              key={flow.id}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                flow.isDefault ? 'border-yellow-400' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {flow.name}
                    </h3>
                    {getStatusIcon(flow.isActive)}
                    {getFlowTypeIcon(flow.type)}
                    {flow.isDefault && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        デフォルト
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      優先度: {flow.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {flow.description}
                  </p>

                  {/* 組織連動型の情報 */}
                  {flow.type === 'organization' && flow.useOrganizationHierarchy && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                      <Building2 className="h-4 w-4" />
                      <span>組織階層 {flow.organizationLevels} レベルまで自動承認</span>
                    </div>
                  )}

                  {/* 条件表示 */}
                  {flow.conditions && flow.conditions.length > 0 && (
                    <div className="flex items-start gap-2 mt-2">
                      <Filter className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-orange-600">適用条件:</span>
                        {flow.conditions.map((cond, idx) => (
                          <span key={cond.id} className="ml-1">
                            {cond.description || `${cond.field} ${cond.operator} ${cond.value}`}
                            {idx < flow.conditions!.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    最終更新: {new Date(flow.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                {/* アクションボタン */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicateFlow(flow)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="複製"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingFlow(flow);
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="編集"
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  {!flow.isDefault && (
                    <button
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* カスタム型の承認ステップ表示 */}
              {flow.type === 'custom' && flow.steps && flow.steps.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {flow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="bg-gray-50 rounded-lg p-3 min-w-[180px] border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">
                              STEP {step.stepNumber}
                            </span>
                            {step.mode === 'parallel' && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                並列
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {step.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {step.approvers.length}名の承認者
                            {step.mode === 'parallel' && step.requiredApprovals && (
                              <span> (うち{step.requiredApprovals}名必要)</span>
                            )}
                          </div>
                          {step.timeoutHours && (
                            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {step.timeoutHours}時間制限
                            </div>
                          )}
                        </div>
                        {index < flow.steps.length - 1 && (
                          <ArrowRight className="h-5 w-5 text-gray-400 mx-2 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 空の状態 */}
        {filteredFlows.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              承認フローが設定されていません
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              新規フロー作成ボタンから承認フローを追加してください
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              新規フロー作成
            </button>
          </div>
        )}
      </div>

      {/* 新規作成モーダル */}
      <ApprovalFlowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveFlow}
        initialDocumentType={selectedFlowType}
      />

      {/* 編集モーダル */}
      <ApprovalFlowModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingFlow(null);
        }}
        onSave={handleSaveFlow}
        editingFlow={editingFlow}
      />
    </div>
  );
}
