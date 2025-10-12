/**
 * 権限ベースのフィルタリングユーティリティ
 * ユーザーの役職に応じて、分析データの表示範囲を自動的に制限します
 */

export interface UserRole {
  role: 'executive' | 'branch_manager' | 'sales' | 'accounting' | 'admin';
  branchId?: string;
  userId?: string;
  name?: string;
}

export interface FilterConfig {
  branch: string;
  assignee: string;
  canViewAllData: boolean;
}

/**
 * ユーザーの役職に基づいてフィルター設定を取得
 */
export function getAutoFilters(user: UserRole): FilterConfig {
  switch (user.role) {
    case 'executive':
    case 'admin':
      // 経営者・管理者：全社データ閲覧可
      return {
        branch: 'all',
        assignee: 'all',
        canViewAllData: true,
      };

    case 'branch_manager':
      // 支店長：自分の支店のみ
      return {
        branch: user.branchId || 'all',
        assignee: 'all',
        canViewAllData: false,
      };

    case 'sales':
      // 営業：自分の担当のみ
      return {
        branch: user.branchId || 'all',
        assignee: user.userId || 'all',
        canViewAllData: false,
      };

    case 'accounting':
      // 経理：全社データ閲覧可（金額情報のみ）
      return {
        branch: 'all',
        assignee: 'all',
        canViewAllData: true,
      };

    default:
      // デフォルト：制限あり
      return {
        branch: 'all',
        assignee: 'all',
        canViewAllData: false,
      };
  }
}

/**
 * デモ用：現在のユーザー情報を取得（実装時はAPIから取得）
 */
export function getCurrentUser(): UserRole {
  // TODO: 実際の実装では、セッションやJWTからユーザー情報を取得
  // デモでは固定値を返す
  return {
    role: 'executive', // executive, branch_manager, sales, accounting
    branchId: 'tokyo',
    userId: 'user-001',
    name: '営業太郎',
  };
}

/**
 * フィルター設定のメッセージを生成
 */
export function getFilterMessage(config: FilterConfig, user: UserRole): string {
  if (config.canViewAllData) {
    const roleName = user.role === 'executive' ? '経営者' : '管理者';
    return `全社データを表示しています（${roleName}権限）`;
  }

  if (config.branch !== 'all' && config.assignee !== 'all') {
    return `${config.branch}支店・担当者別に表示（営業権限）`;
  }

  if (config.branch !== 'all') {
    return `${config.branch}支店のデータを表示（支店長権限）`;
  }

  return 'データを表示しています';
}
