'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Building2,
  Workflow,
  Plus,
  Trash2,
  UserPlus,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react';
import type {
  ApprovalFlow,
  ApprovalStep,
  ApprovalCondition,
  DocumentType,
  ApprovalFlowType,
  ApprovalStepMode,
  Approver,
  ConditionOperator,
} from '@/types/approval-flow';
import ApproverSelector from './ApproverSelector';

interface ApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flow: Partial<ApprovalFlow>) => void;
  editingFlow?: ApprovalFlow | null;
  initialDocumentType?: DocumentType;
}

export default function ApprovalFlowModal({
  isOpen,
  onClose,
  onSave,
  editingFlow,
  initialDocumentType = 'estimate',
}: ApprovalFlowModalProps) {
  const [flowType, setFlowType] = useState<ApprovalFlowType>('organization');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: initialDocumentType as DocumentType,
    useOrganizationHierarchy: true,
    organizationLevels: 3,
    isActive: true,
    isDefault: false,
    priority: 1,
  });

  const [steps, setSteps] = useState<Partial<ApprovalStep>[]>([]);
  const [conditions, setConditions] = useState<Partial<ApprovalCondition>[]>([]);

  useEffect(() => {
    if (editingFlow) {
      setFlowType(editingFlow.type);
      setFormData({
        name: editingFlow.name,
        description: editingFlow.description || '',
        documentType: editingFlow.documentType,
        useOrganizationHierarchy: editingFlow.useOrganizationHierarchy || true,
        organizationLevels: editingFlow.organizationLevels || 3,
        isActive: editingFlow.isActive,
        isDefault: editingFlow.isDefault || false,
        priority: editingFlow.priority || 1,
      });
      setSteps(editingFlow.steps || []);
      setConditions(editingFlow.conditions || []);
    } else {
      // リセット
      setFlowType('organization');
      setFormData({
        name: '',
        description: '',
        documentType: initialDocumentType,
        useOrganizationHierarchy: true,
        organizationLevels: 3,
        isActive: true,
        isDefault: false,
        priority: 1,
      });
      setSteps([]);
      setConditions([]);
    }
  }, [editingFlow, initialDocumentType, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const flowData: Partial<ApprovalFlow> = {
      ...formData,
      type: flowType,
      steps: flowType === 'custom' ? steps as ApprovalStep[] : undefined,
      conditions: conditions.length > 0 ? conditions as ApprovalCondition[] : undefined,
      createdBy: 'current-user', // 実際はログインユーザー
    };

    onSave(flowData);
    onClose();
  };

  const addStep = () => {
    const newStep: Partial<ApprovalStep> = {
      id: `step_${Date.now()}`,
      stepNumber: steps.length + 1,
      name: `ステップ ${steps.length + 1}`,
      description: '',
      mode: 'serial',
      approvers: [],
      timeoutHours: 24,
      allowDelegate: true,
      allowSkip: false,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // ステップ番号を振り直し
    newSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    (newSteps[index] as any)[field] = value;
    setSteps(newSteps);
  };

  const addCondition = () => {
    const newCondition: Partial<ApprovalCondition> = {
      id: `cond_${Date.now()}`,
      field: 'amount',
      operator: 'gte',
      value: 0,
      description: '',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions];
    (newConditions[index] as any)[field] = value;
    setConditions(newConditions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {editingFlow ? '承認フロー編集' : '新規承認フロー作成'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* フロータイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フロータイプ
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFlowType('organization')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    flowType === 'organization'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-bold text-gray-900">組織連動型</div>
                  <div className="text-xs text-gray-600 mt-1">
                    組織階層に基づく自動承認
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFlowType('custom')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    flowType === 'custom'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Workflow className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="font-bold text-gray-900">カスタム型</div>
                  <div className="text-xs text-gray-600 mt-1">
                    個別に承認ステップを設定
                  </div>
                </button>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  フロー名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="例: 高額見積承認フロー"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ドキュメントタイプ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documentType: e.target.value as DocumentType,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="estimate">見積</option>
                  <option value="contract">契約</option>
                  <option value="invoice">請求書</option>
                  <option value="expense">経費</option>
                  <option value="purchase">発注</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  優先度
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                  placeholder="このフローの用途や条件を記載"
                />
              </div>
            </div>

            {/* 組織連動型の設定 */}
            {flowType === 'organization' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">
                      組織連動型設定
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      申請者の所属組織から自動的に承認ルートを決定します
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    承認階層レベル
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.organizationLevels}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationLevels: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    申請者から何階層上まで承認が必要か（例: 3 = 直属上司 → 部長
                    → 役員）
                  </p>
                </div>
              </div>
            )}

            {/* カスタム型の設定 */}
            {flowType === 'custom' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-purple-600" />
                    <div className="font-medium text-purple-900">
                      承認ステップ設定
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    ステップ追加
                  </button>
                </div>

                {steps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">承認ステップを追加してください</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={step.id || index}
                        className="bg-white border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-sm">
                            STEP {step.stepNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              ステップ名
                            </label>
                            <input
                              type="text"
                              value={step.name}
                              onChange={(e) =>
                                updateStep(index, 'name', e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                実行モード
                              </label>
                              <select
                                value={step.mode}
                                onChange={(e) =>
                                  updateStep(
                                    index,
                                    'mode',
                                    e.target.value as ApprovalStepMode
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="serial">直列承認</option>
                                <option value="parallel">並列承認</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                タイムアウト（時間）
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={step.timeoutHours}
                                onChange={(e) =>
                                  updateStep(
                                    index,
                                    'timeoutHours',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={step.allowDelegate}
                                onChange={(e) =>
                                  updateStep(
                                    index,
                                    'allowDelegate',
                                    e.target.checked
                                  )
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">
                                代理承認可
                              </span>
                            </label>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={step.allowSkip}
                                onChange={(e) =>
                                  updateStep(
                                    index,
                                    'allowSkip',
                                    e.target.checked
                                  )
                                }
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">
                                スキップ可
                              </span>
                            </label>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs text-gray-600 mb-2">
                              承認者設定
                            </label>
                            <ApproverSelector
                              selectedApprovers={step.approvers || []}
                              onApproversChange={(approvers) =>
                                updateStep(index, 'approvers', approvers)
                              }
                              mode={step.mode}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 条件設定 */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  適用条件（任意）
                </label>
                <button
                  type="button"
                  onClick={addCondition}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  条件追加
                </button>
              </div>

              {conditions.length > 0 && (
                <div className="space-y-2">
                  {conditions.map((condition, index) => (
                    <div
                      key={condition.id || index}
                      className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg"
                    >
                      <select
                        value={condition.field}
                        onChange={(e) =>
                          updateCondition(index, 'field', e.target.value)
                        }
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value="amount">金額</option>
                        <option value="customerType">顧客種別</option>
                        <option value="department">部署</option>
                      </select>

                      <select
                        value={condition.operator}
                        onChange={(e) =>
                          updateCondition(
                            index,
                            'operator',
                            e.target.value as ConditionOperator
                          )
                        }
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value="gte">以上</option>
                        <option value="lte">以下</option>
                        <option value="eq">等しい</option>
                        <option value="ne">等しくない</option>
                        <option value="gt">より大きい</option>
                        <option value="lt">より小さい</option>
                      </select>

                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(index, 'value', e.target.value)
                        }
                        className="flex-1 px-2 py-1 text-sm border rounded"
                        placeholder="値"
                      />

                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* その他の設定 */}
            <div className="flex items-center gap-4 border-t pt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  このフローを有効にする
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">デフォルトに設定</span>
              </label>
            </div>
          </div>
        </form>

        {/* フッター */}
        <div className="border-t p-4 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {editingFlow ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
}
