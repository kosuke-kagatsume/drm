// Customer Types - 顧客管理関連の型定義

export type CustomerStatus = 'lead' | 'prospect' | 'customer' | 'inactive';

// 顧客獲得経路
export type CustomerSource =
  | 'web'           // Web問い合わせ
  | 'showroom'      // 展示場来場
  | 'referral'      // 紹介
  | 'ma'            // MA経由
  | 'phone'         // 電話問い合わせ
  | 'event'         // イベント参加
  | 'direct'        // 直接来店
  | 'other';        // その他

// 家族関係のタイプ
export type FamilyRelationType =
  | 'spouse'        // 配偶者
  | 'child'         // 子供
  | 'parent'        // 親
  | 'sibling'       // 兄弟姉妹
  | 'other';        // その他

// 連絡先（複数登録可能）
export interface ContactPhone {
  id: string;
  number: string;
  type: 'mobile' | 'home' | 'work' | 'other';
  isPrimary: boolean;
  note?: string;
}

export interface ContactEmail {
  id: string;
  email: string;
  type: 'personal' | 'work' | 'other';
  isPrimary: boolean;
  note?: string;
}

// 住所情報
export interface Address {
  postalCode?: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
  fullAddress?: string;
}

// 家族関係
export interface FamilyRelation {
  id: string;
  relatedCustomerId: string;
  relatedCustomerName: string;
  relationType: FamilyRelationType;
  relationName?: string; // 「父」「長男」など自由記述
  note?: string;
}

export interface Customer {
  id: string;

  // 基本情報
  name: string;
  nameKana?: string; // ふりがな
  company?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';

  // 連絡先（拡張）
  phones: ContactPhone[];
  emails: ContactEmail[];

  // 住所（拡張）
  currentAddress: Address;           // 現住所
  familyHomeAddress?: Address;       // 実家住所
  workAddress?: Address;             // 勤務先住所

  // 旧フィールド（後方互換性のため）
  email: string;  // emails[0].email と同期
  phone: string;  // phones[0].number と同期
  address?: string; // currentAddress.fullAddress と同期

  // 家族関係
  familyRelations: FamilyRelation[];

  // 顧客分類
  industry?: string;
  status: CustomerStatus;
  tags: string[];
  assignee: string;
  notes?: string;

  // 組織・部署情報
  departmentId?: string;     // 担当部署ID (tokyo, osaka, tokyo-sales, etc.)
  departmentName?: string;   // 担当部署名 (東京支店、営業部、etc.)
  branchId?: string;         // 支店ID (tokyo, osaka)
  branchName?: string;       // 支店名 (東京支店、大阪支店)

  // 営業関連情報
  lastContact?: string;
  nextAction?: string;
  nextActionDate?: string;
  priority?: number; // 優先度 (1-5: 5が最高)
  value: number; // 顧客価値（見込み金額）
  source: CustomerSource; // 獲得チャネル
  leadScore?: number; // リードスコア（MA連携）

  // 紹介関係
  referredBy?: string; // 紹介者の顧客ID
  referredByName?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  companyId: string; // マルチテナント対応

  // 関連データ（カウント）
  propertiesCount?: number;
  estimatesCount?: number;
  contractsCount?: number;
  activitiesCount?: number;
  totalRevenue?: number;
  lastEstimateDate?: string;
  lastContractDate?: string;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'chat' | 'line' | 'note' | 'visit';
  content: string;
  date: string;
  duration?: number; // 分単位
  outcome?: string; // 結果・成果
  nextAction?: string;
  createdBy: string;
  createdAt: string;

  // 関連ファイル
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  type: 'general' | 'technical' | 'financial' | 'personal';
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProject {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget?: number;
  startDate?: string;
  endDate?: string;
  estimateId?: string;
  contractId?: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

// フィルター・検索用
export interface CustomerFilter {
  status?: CustomerStatus[];
  assignee?: string[];
  tags?: string[];
  industry?: string[];
  source?: string[];

  // 組織・部署フィルター
  departmentId?: string[];   // 部署IDでフィルタ
  branchId?: string[];       // 支店IDでフィルタ

  // 金額範囲
  valueMin?: number;
  valueMax?: number;

  // 日付範囲
  lastContactFrom?: string;
  lastContactTo?: string;
  createdFrom?: string;
  createdTo?: string;

  // テキスト検索
  search?: string; // 名前、会社名、メール、電話番号を対象

  // ソート
  sortBy?: 'name' | 'company' | 'lastContact' | 'value' | 'createdAt';
  sortOrder?: 'asc' | 'desc';

  // ページネーション
  offset?: number;
  limit?: number;
}

// 統計・分析用
export interface CustomerStats {
  total: number;

  byStatus: {
    lead: number;
    prospect: number;
    customer: number;
    inactive: number;
  };

  bySource: Record<string, number>;

  recentActivity: {
    newCustomersThisMonth: number;
    interactionsThisWeek: number;
    upcomingActions: number;
  };

  performance: {
    conversionRate: number; // lead → customer
    averageValue: number;
    averageLifetime: number; // 日数
    topAssignees: Array<{
      assignee: string;
      customerCount: number;
      totalValue: number;
      conversionRate: number;
    }>;
  };

  trends: {
    newCustomersTrend: Array<{
      month: string;
      count: number;
      value: number;
    }>;
    conversionTrend: Array<{
      month: string;
      rate: number;
    }>;
  };
}

// カンバンボード用
export interface CustomerKanbanColumn {
  status: CustomerStatus;
  title: string;
  color: string;
  customers: Customer[];
  count: number;
  totalValue: number;
}

// エクスポート・インポート用
export interface CustomerExportData {
  customers: Customer[];
  exportedAt: string;
  exportedBy: string;
  format: 'csv' | 'excel' | 'json';
}

export interface CustomerImportResult {
  success: number;
  skipped: number;
  errors: Array<{
    row: number;
    data: Partial<Customer>;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    data: Partial<Customer>;
    message: string;
  }>;
}

// ==================== 物件情報 ====================

export type PropertyType =
  | 'newBuild'      // 新築
  | 'renovation'    // リフォーム
  | 'extension'     // 増築
  | 'repair'        // 修繕
  | 'exterior'      // 外構のみ
  | 'other';

export type LandOwnership =
  | 'owned'         // 所有済み
  | 'willPurchase'  // 購入予定
  | 'undecided';    // 未定

export type BuildingStructure =
  | 'wood'          // 木造
  | 'steel'         // 鉄骨
  | 'rc'            // RC（鉄筋コンクリート）
  | 'src'           // SRC（鉄骨鉄筋コンクリート）
  | 'other';

export interface Property {
  id: string;
  customerId: string;

  // 物件基本情報
  name?: string; // 物件名（任意）
  address: Address;
  propertyType: PropertyType;

  // 土地情報
  land: {
    ownership: LandOwnership;
    landUse?: string;            // 地目（宅地・雑種地など）
    area?: number;               // 面積（㎡）
    areaInTsubo?: number;        // 面積（坪）
    soilCondition?: string;      // 地盤状況
  };

  // 建物情報
  building: {
    structure?: BuildingStructure;
    floors?: number;             // 階数
    totalFloorArea?: number;     // 延床面積（㎡）
    age?: number;                // 築年数（リフォームの場合）
  };

  // 工事情報
  desiredBudget?: number;
  scheduledStartDate?: string;   // 着工予定日
  scheduledCompletionDate?: string; // 竣工予定日
  actualStartDate?: string;      // 実際の着工日
  actualCompletionDate?: string; // 実際の竣工日

  // 見積・契約との紐付け
  estimateIds: string[];
  contractId?: string;

  // ステータス
  status: 'planning' | 'estimating' | 'contracted' | 'construction' | 'completed' | 'cancelled';

  // メタデータ
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
}

// ==================== 活動履歴 ====================

export type ActivityType =
  | 'visit'           // 訪問
  | 'call'            // 電話
  | 'email'           // メール
  | 'estimate'        // 見積提出
  | 'presentation'    // プレゼン・提案
  | 'contract'        // 契約
  | 'meeting'         // 打ち合わせ（設計・IC）
  | 'claim'           // クレーム対応
  | 'inspection'      // 定期点検
  | 'ma_action'       // MA自動アクション
  | 'note'            // メモ
  | 'other';

export interface Activity {
  id: string;
  customerId: string;
  propertyId?: string;

  // 活動基本情報
  type: ActivityType;
  title: string;
  content: string;

  // 次回アクション
  nextAction?: string;
  nextActionDate?: string;

  // 記録者
  createdBy: string;
  createdByName?: string;
  createdAt: string;

  // 自動記録フラグ
  isAutomatic: boolean;

  // 関連ファイル
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;

  // メタデータ
  duration?: number; // 時間（分）
  outcome?: string;  // 結果・成果
}

// 活動履歴テンプレート
export interface ActivityTemplate {
  id: string;
  name: string;
  type: ActivityType;
  title: string;
  content: string;
  companyId: string;
}
