// 見積バージョン管理の型定義

export interface EstimateVersion {
  id: string;
  estimateId: string;
  versionNumber: string; // e.g., "1.0", "1.1", "2.0"
  versionType: 'major' | 'minor' | 'draft';
  status: 'draft' | 'active' | 'archived' | 'superseded';

  // バージョン情報
  title: string;
  description?: string;
  changeLog?: string;
  tags?: string[];

  // スナップショット
  snapshot: {
    items: any[]; // EstimateItem[]
    totals: any; // EstimateTotals
    customer: any;
    projectInfo: any;
    taxRate: number;
    validUntil: string;
  };

  // メタデータ
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  approvedAt?: Date;
  approvedBy?: string;
  approvedByName?: string;

  // 関連情報
  parentVersionId?: string; // 元になったバージョン
  childVersionIds?: string[]; // このバージョンから作成されたバージョン

  // 差分情報
  changes?: VersionChange[];
}

export interface VersionChange {
  id: string;
  type: 'add' | 'modify' | 'delete';
  target: 'item' | 'section' | 'customer' | 'terms' | 'price';
  itemId?: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
  timestamp: Date;
}

export interface VersionComparison {
  versionA: EstimateVersion;
  versionB: EstimateVersion;
  changes: {
    added: ComparisonItem[];
    modified: ComparisonItem[];
    deleted: ComparisonItem[];
    priceChanges: PriceChange[];
    totalChange: {
      oldTotal: number;
      newTotal: number;
      difference: number;
      percentageChange: number;
    };
  };
}

export interface ComparisonItem {
  itemId: string;
  itemName: string;
  type: 'item' | 'section';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface PriceChange {
  itemId: string;
  itemName: string;
  oldPrice: number;
  newPrice: number;
  difference: number;
  percentageChange: number;
}

// バージョン作成オプション
export interface CreateVersionOptions {
  fromVersionId?: string;
  versionType: 'major' | 'minor' | 'draft';
  title: string;
  description?: string;
  changeLog?: string;
  keepDraft?: boolean;
  autoActivate?: boolean;
}
