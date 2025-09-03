// 見積テンプレート関連の型定義

export interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  category:
    | 'kitchen'
    | 'bathroom'
    | 'exterior'
    | 'interior'
    | 'electrical'
    | 'plumbing'
    | 'renovation'
    | 'custom';
  tags: string[];
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // テンプレート内容
  sections: TemplateSection[];
  defaultTaxRate: number;
  defaultValidDays: number;
  notes?: string;
  terms?: string;

  // 原価率設定
  defaultCostRates?: {
    material: number; // 材料費の掛率
    labor: number; // 労務費の掛率
    subcontract: number; // 外注費の掛率
  };
}

export interface TemplateSection {
  id: string;
  name: string;
  order: number;
  items: TemplateItem[];
  isCollapsible: boolean;
  defaultExpanded: boolean;
}

export interface TemplateItem {
  id: string;
  itemName: string;
  specification?: string;
  unit: string;
  defaultQuantity: number;
  unitPrice: number;
  costPrice: number;
  category: string;

  // オプション設定
  isOptional: boolean; // 選択可能項目
  isRequired: boolean; // 必須項目
  allowQuantityChange: boolean;
  allowPriceChange: boolean;

  // 関連マスター
  masterItemId?: string;

  // 計算式（他項目との連動）
  formula?: {
    type: 'percentage' | 'fixed' | 'linked';
    value?: number;
    linkedItemId?: string;
    calculation?: string; // e.g., "linkedItem.quantity * 0.1"
  };
}

// テンプレート適用オプション
export interface TemplateApplyOptions {
  includeOptionalItems: boolean;
  overridePrices: boolean;
  keepExistingItems: boolean;
  applyFormulas: boolean;
  customerId?: string;
  projectName?: string;
  adjustmentRate?: number; // 全体の調整率
}

// テンプレートカテゴリ
export const TEMPLATE_CATEGORIES = {
  kitchen: {
    label: 'キッチン',
    icon: '🍳',
    color: 'bg-blue-100 text-blue-700',
  },
  bathroom: {
    label: '浴室・水回り',
    icon: '🚿',
    color: 'bg-cyan-100 text-cyan-700',
  },
  exterior: {
    label: '外装・エクステリア',
    icon: '🏠',
    color: 'bg-green-100 text-green-700',
  },
  interior: {
    label: '内装・インテリア',
    icon: '🛋️',
    color: 'bg-purple-100 text-purple-700',
  },
  electrical: {
    label: '電気工事',
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-700',
  },
  plumbing: {
    label: '配管工事',
    icon: '🔧',
    color: 'bg-orange-100 text-orange-700',
  },
  renovation: {
    label: 'リノベーション',
    icon: '🔨',
    color: 'bg-red-100 text-red-700',
  },
  custom: {
    label: 'カスタム',
    icon: '⚙️',
    color: 'bg-gray-100 text-gray-700',
  },
} as const;
