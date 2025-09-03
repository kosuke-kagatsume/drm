// 見積承認ワークフローの型定義

export interface ApprovalWorkflow {
  id: string;
  estimateId: string;
  estimateNumber: string;
  estimateTitle: string;
  totalAmount: number;

  // ワークフロー状態
  status:
    | 'draft'
    | 'pending'
    | 'in_review'
    | 'approved'
    | 'rejected'
    | 'cancelled';
  currentStep: number;
  totalSteps: number;

  // 承認ステップ
  steps: ApprovalStep[];

  // 申請情報
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  requestNote?: string;

  // 完了情報
  completedAt?: Date;
  finalStatus?: 'approved' | 'rejected' | 'cancelled';

  // 関連情報
  customerId: string;
  customerName: string;
  projectName: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  deadline?: Date;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  name: string;
  type: 'single' | 'parallel' | 'any'; // single: 1人承認, parallel: 全員承認, any: 誰か1人

  // 承認者
  approvers: Approver[];

  // 条件
  condition?: {
    type: 'amount' | 'category' | 'custom';
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in';
    value: any;
  };

  // ステータス
  status: 'waiting' | 'in_progress' | 'approved' | 'rejected' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;

  // 自動処理
  autoApprove?: boolean;
  autoApproveDelay?: number; // 自動承認までの時間（時間単位）
  escalation?: {
    enabled: boolean;
    delayHours: number;
    escalateTo: string; // userId
  };
}

export interface Approver {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string; // e.g., "課長", "部長", "役員"
  department?: string;

  // 承認アクション
  action?: 'approved' | 'rejected' | 'delegated';
  actionAt?: Date;
  comment?: string;
  attachments?: string[];

  // 代理承認
  delegatedTo?: string;
  delegatedToName?: string;
  delegationReason?: string;

  // 通知設定
  notificationSent: boolean;
  notificationSentAt?: Date;
  reminderCount: number;
  lastReminderAt?: Date;
}

// 承認ルール
export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;

  // 適用条件
  conditions: RuleCondition[];

  // 承認フロー
  workflowTemplate: WorkflowTemplate;
}

export interface RuleCondition {
  field: string; // e.g., "totalAmount", "category", "customer.type"
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'in' | 'contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  steps: WorkflowStepTemplate[];
}

export interface WorkflowStepTemplate {
  name: string;
  type: 'single' | 'parallel' | 'any';
  approverRoles?: string[];
  approverIds?: string[];
  autoApprove?: boolean;
  autoApproveDelay?: number;
}

// 承認アクション
export interface ApprovalAction {
  workflowId: string;
  stepId: string;
  approverId: string;
  action: 'approve' | 'reject' | 'delegate' | 'request_info';
  comment?: string;
  attachments?: File[];
  delegateTo?: string;
  conditions?: string[]; // 条件付き承認
}

// 承認履歴
export interface ApprovalHistory {
  id: string;
  workflowId: string;
  estimateId: string;
  action: string;
  actor: string;
  actorName: string;
  timestamp: Date;
  details: {
    stepName?: string;
    previousStatus?: string;
    newStatus?: string;
    comment?: string;
    attachments?: string[];
  };
}

// 通知設定
export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  slack?: boolean;
  reminderInterval: number; // hours
  escalationThreshold: number; // hours
  notifyOnActions: {
    submitted: boolean;
    approved: boolean;
    rejected: boolean;
    delegated: boolean;
    completed: boolean;
  };
}
