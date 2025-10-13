// 資金計画書のバージョン管理型定義

// 資金計画の項目
export interface FinancialItem {
  id: string;
  category: string;
  subtotalLabel?: string;
  color?: string;
  items: {
    name: string;
    amount: number;
    note?: string;
  }[];
}

// ローン情報
export interface LoanInfo {
  borrowingAmount: number;
  selfFund: number;
  monthlyPayment: number;
  bonus: number;
  years: number;
  rate: number;
}

// バージョンステータス
export type VersionStatus = 'draft' | 'submitted' | 'approved' | 'superseded';

// 資金計画書バージョン
export interface FinancialPlanVersion {
  id: string;
  customerId: string;
  customerName: string;
  versionNumber: number; // 1, 2, 3...
  versionLabel: string; // "初回", "2回目", "3回目"
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: VersionStatus;

  // 実際のデータ
  buildingArea: number;
  unitPrice: number;
  financialData: FinancialItem[];
  loanInfo: LoanInfo;

  // 変更履歴
  changeNote?: string; // "地盤改良費を追加"など
  previousVersionId?: string; // 前のバージョンへの参照
  totalAmount: number; // 総額（検索・比較用）
}

// バージョン比較結果
export interface VersionDiff {
  versionA: FinancialPlanVersion;
  versionB: FinancialPlanVersion;
  differences: {
    category: string;
    itemName: string;
    oldAmount: number;
    newAmount: number;
    change: number;
    changePercent: number;
  }[];
  totalChange: number;
}
