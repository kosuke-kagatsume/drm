/**
 * 承認フロー関連の型定義
 */

import { UserRole } from './user';

/**
 * 承認フローの種類
 */
export type ApprovalFlowType =
  | 'organization' // 組織連動型（自動）
  | 'custom';      // 個別カスタム型

/**
 * 承認ステップの実行モード
 */
export type ApprovalStepMode =
  | 'serial'   // 直列承認（順番に承認）
  | 'parallel'; // 並列承認（全員が同時に承認可能）

/**
 * 承認ステータス
 */
export type ApprovalStatus =
  | 'pending'    // 承認待ち
  | 'approved'   // 承認済み
  | 'rejected'   // 却下
  | 'cancelled'  // キャンセル
  | 'expired';   // 期限切れ

/**
 * 対象ドキュメントタイプ
 */
export type DocumentType =
  | 'estimate'   // 見積
  | 'contract'   // 契約
  | 'invoice'    // 請求書
  | 'expense'    // 経費申請
  | 'purchase';  // 発注書

/**
 * 条件演算子
 */
export type ConditionOperator =
  | 'gte'  // 以上
  | 'lte'  // 以下
  | 'eq'   // 等しい
  | 'ne'   // 等しくない
  | 'gt'   // より大きい
  | 'lt';  // より小さい

/**
 * 承認者情報
 */
export interface Approver {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  order?: number; // ステップ内での順序
}

/**
 * 承認ステップ
 */
export interface ApprovalStep {
  id: string;
  stepNumber: number;
  name: string;
  description?: string;
  mode: ApprovalStepMode;
  approvers: Approver[];
  requiredApprovals?: number; // 並列承認時の必要承認数（未指定時は全員）
  timeoutHours?: number; // タイムアウト時間（時間）
  allowDelegate?: boolean; // 代理承認を許可
  allowSkip?: boolean; // スキップ可能
}

/**
 * 条件分岐ルール
 */
export interface ApprovalCondition {
  id: string;
  field: string; // 判定対象フィールド（例: amount, customerType）
  operator: ConditionOperator;
  value: string | number;
  description?: string;
}

/**
 * 承認フロー定義
 */
export interface ApprovalFlow {
  id: string;
  name: string;
  description?: string;
  type: ApprovalFlowType;
  documentType: DocumentType;

  // 組織連動型の場合
  useOrganizationHierarchy?: boolean;
  organizationLevels?: number; // 何階層上まで承認が必要か

  // カスタム型の場合
  steps?: ApprovalStep[];

  // 条件分岐
  conditions?: ApprovalCondition[];
  conditionalFlows?: {
    conditionId: string;
    flowId: string;
  }[];

  // メタ情報
  isActive: boolean;
  isDefault?: boolean; // デフォルトフロー
  priority?: number; // 優先順位（複数該当時）
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

/**
 * 承認インスタンス（実際の承認プロセス）
 */
export interface ApprovalInstance {
  id: string;
  flowId: string;
  flowName: string;
  documentType: DocumentType;
  documentId: string;
  documentTitle: string;

  currentStep: number;
  totalSteps: number;
  status: ApprovalStatus;

  requestedBy: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };

  steps: ApprovalInstanceStep[];

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  companyId: string;
}

/**
 * 承認インスタンスのステップ
 */
export interface ApprovalInstanceStep {
  stepNumber: number;
  name: string;
  mode: ApprovalStepMode;
  status: ApprovalStatus;
  approvals: ApprovalAction[];
  startedAt?: string;
  completedAt?: string;
  timeoutAt?: string;
}

/**
 * 承認アクション
 */
export interface ApprovalAction {
  id: string;
  approverId: string;
  approverName: string;
  approverEmail: string;
  action: 'approved' | 'rejected' | 'delegated';
  comment?: string;
  delegatedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  ipAddress?: string;
}

/**
 * 承認リクエスト
 */
export interface ApprovalRequest {
  documentType: DocumentType;
  documentId: string;
  documentTitle: string;
  requestedBy: string;
  amount?: number;
  customerId?: string;
  metadata?: Record<string, any>;
}

/**
 * 承認統計
 */
export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  expired: number;
  averageApprovalTime: number; // 平均承認時間（時間）
  approvalRate: number; // 承認率（%）
}

/**
 * 代理承認者設定
 */
export interface ApprovalDelegate {
  id: string;
  userId: string;
  delegateUserId: string;
  delegateUserName: string;
  startDate: string;
  endDate: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
}
