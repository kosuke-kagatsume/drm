/**
 * ユーザー関連の型定義
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'admin'
  | 'manager'
  | 'sales'
  | 'marketing'
  | 'construction'
  | 'accounting'
  | 'executive'
  | 'aftercare'
  | 'office';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Approver extends UserSummary {
  approvalLevel?: number;
  department?: string;
}