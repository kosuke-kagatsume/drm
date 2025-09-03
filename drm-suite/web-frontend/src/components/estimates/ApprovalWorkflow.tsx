'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Paperclip,
  UserCheck,
  Users,
  ArrowRight,
  RotateCcw,
  FileText,
} from 'lucide-react';
import {
  ApprovalWorkflow,
  ApprovalStep,
  Approver,
  ApprovalAction,
} from '@/features/estimate-workflow/types';

interface Props {
  workflow: ApprovalWorkflow | null;
  onSubmitForApproval: () => void;
  onApprove?: (action: ApprovalAction) => void;
  onReject?: (action: ApprovalAction) => void;
  onDelegate?: (action: ApprovalAction) => void;
  onCancel?: () => void;
  currentUserId: string;
  canSubmit?: boolean;
  canApprove?: boolean;
}

export default function ApprovalWorkflowComponent({
  workflow,
  onSubmitForApproval,
  onApprove,
  onReject,
  onDelegate,
  onCancel,
  currentUserId,
  canSubmit = true,
  canApprove = false,
}: Props) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'delegate'
  >('approve');
  const [comment, setComment] = useState('');
  const [delegateToUserId, setDelegateToUserId] = useState('');

  const getStatusColor = (status: ApprovalWorkflow['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_review':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: ApprovalWorkflow['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'pending':
      case 'in_review':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStepStatusIcon = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'waiting':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'skipped':
        return <ArrowRight className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleAction = () => {
    if (!workflow) return;

    const currentStep = workflow.steps.find((s) => s.status === 'in_progress');
    const currentApprover = currentStep?.approvers.find(
      (a) => a.userId === currentUserId,
    );

    if (!currentStep || !currentApprover) return;

    const action: ApprovalAction = {
      workflowId: workflow.id,
      stepId: currentStep.id,
      approverId: currentApprover.id,
      action:
        actionType === 'approve'
          ? 'approve'
          : actionType === 'reject'
            ? 'reject'
            : 'delegate',
      comment,
      delegateTo: actionType === 'delegate' ? delegateToUserId : undefined,
    };

    if (actionType === 'approve' && onApprove) {
      onApprove(action);
    } else if (actionType === 'reject' && onReject) {
      onReject(action);
    } else if (actionType === 'delegate' && onDelegate) {
      onDelegate(action);
    }

    setShowActionModal(false);
    setComment('');
    setDelegateToUserId('');
  };

  // 現在のユーザーがアクション可能かチェック
  const canTakeAction = () => {
    if (!workflow || !canApprove) return false;
    const currentStep = workflow.steps.find((s) => s.status === 'in_progress');
    return (
      currentStep?.approvers.some(
        (a) => a.userId === currentUserId && !a.action,
      ) || false
    );
  };

  if (!workflow) {
    // 未申請状態
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">承認申請</h3>
          <p className="text-sm text-gray-600 mb-4">
            この見積書を承認申請して、正式な見積書として発行できるようにします
          </p>
          {canSubmit && (
            <button
              onClick={onSubmitForApproval}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              承認申請する
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">
              承認ワークフロー
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(workflow.status)}`}
            >
              {getStatusIcon(workflow.status)}
              {workflow.status === 'draft' && '下書き'}
              {workflow.status === 'pending' && '承認待ち'}
              {workflow.status === 'in_review' && '審査中'}
              {workflow.status === 'approved' && '承認済み'}
              {workflow.status === 'rejected' && '却下'}
              {workflow.status === 'cancelled' && 'キャンセル'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canTakeAction() && (
              <>
                <button
                  onClick={() => {
                    setActionType('approve');
                    setShowActionModal(true);
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  承認
                </button>
                <button
                  onClick={() => {
                    setActionType('reject');
                    setShowActionModal(true);
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  却下
                </button>
              </>
            )}
            {workflow.status === 'pending' &&
              workflow.requestedBy === currentUserId &&
              onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取り下げ
                </button>
              )}
          </div>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">申請者:</span>
            <span className="ml-2 font-medium">{workflow.requestedByName}</span>
          </div>
          <div>
            <span className="text-gray-600">申請日:</span>
            <span className="ml-2 font-medium">
              {new Date(workflow.requestedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">見積金額:</span>
            <span className="ml-2 font-medium text-blue-600">
              ¥{workflow.totalAmount.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">優先度:</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                workflow.urgency === 'urgent'
                  ? 'bg-red-100 text-red-700'
                  : workflow.urgency === 'high'
                    ? 'bg-orange-100 text-orange-700'
                    : workflow.urgency === 'normal'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
              }`}
            >
              {workflow.urgency === 'urgent' && '緊急'}
              {workflow.urgency === 'high' && '高'}
              {workflow.urgency === 'normal' && '通常'}
              {workflow.urgency === 'low' && '低'}
            </span>
          </div>
        </div>
        {workflow.requestNote && (
          <div className="mt-3 p-3 bg-white rounded-lg">
            <div className="text-sm text-gray-600 mb-1">申請メモ:</div>
            <div className="text-sm">{workflow.requestNote}</div>
          </div>
        )}
      </div>

      {/* 承認ステップ */}
      <div className="p-6">
        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="relative">
              {index < workflow.steps.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              <div className="flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  {getStepStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Step {step.stepNumber}: {step.name}
                    </h4>
                    {step.type === 'parallel' && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        全員承認
                      </span>
                    )}
                    {step.type === 'any' && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        誰か1人
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {step.approvers.map((approver) => (
                      <div
                        key={approver.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          approver.action === 'approved'
                            ? 'bg-green-50 border-green-200'
                            : approver.action === 'rejected'
                              ? 'bg-red-50 border-red-200'
                              : step.status === 'in_progress'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {approver.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {approver.userName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {approver.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {approver.action === 'approved' && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              承認済み
                            </span>
                          )}
                          {approver.action === 'rejected' && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              却下
                            </span>
                          )}
                          {approver.action === 'delegated' && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              委譲 → {approver.delegatedToName}
                            </span>
                          )}
                          {!approver.action &&
                            step.status === 'in_progress' && (
                              <span className="text-xs text-gray-500">
                                承認待ち
                              </span>
                            )}
                          {approver.actionAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(approver.actionAt).toLocaleString(
                                'ja-JP',
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {step.approvers.some((a) => a.comment) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        {step.approvers
                          .filter((a) => a.comment)
                          .map((approver) => (
                            <div key={approver.id} className="text-sm">
                              <span className="font-medium text-gray-700">
                                {approver.userName}:
                              </span>
                              <span className="ml-2 text-gray-600">
                                {approver.comment}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* アクションモーダル */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {actionType === 'approve' && '承認'}
                {actionType === 'reject' && '却下'}
                {actionType === 'delegate' && '委譲'}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    コメント
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder={
                      actionType === 'approve'
                        ? '承認コメント（任意）'
                        : actionType === 'reject'
                          ? '却下理由を入力してください'
                          : '委譲理由を入力してください'
                    }
                  />
                </div>
                {actionType === 'delegate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      委譲先 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={delegateToUserId}
                      onChange={(e) => setDelegateToUserId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">選択してください</option>
                      <option value="user-002">田中 次郎（課長）</option>
                      <option value="user-003">鈴木 三郎（部長）</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAction}
                disabled={
                  (actionType === 'reject' && !comment) ||
                  (actionType === 'delegate' && (!comment || !delegateToUserId))
                }
                className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionType === 'approve' && '承認する'}
                {actionType === 'reject' && '却下する'}
                {actionType === 'delegate' && '委譲する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
