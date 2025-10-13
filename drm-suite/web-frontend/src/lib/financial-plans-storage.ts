/**
 * 資金計画書のlocalStorage管理
 * Vercelのサーバーレス環境の制約を回避するため、クライアント側で永続化
 */

import type { FinancialPlanVersion } from '@/types/financial-plan';

const STORAGE_KEY = 'drm-financial-plans';

// サンプルデータ（初期データとして使用）
const SAMPLE_DATA: FinancialPlanVersion[] = [
  {
    id: 'fp-1',
    customerId: 'cust-1',
    customerName: '田中様',
    versionNumber: 1,
    versionLabel: '初回',
    createdAt: new Date('2025-10-08T09:00:00'),
    updatedAt: new Date('2025-10-08T09:00:00'),
    createdBy: '営業担当A',
    status: 'superseded',
    buildingArea: 40,
    unitPrice: 500000,
    financialData: [],
    loanInfo: {
      borrowingAmount: 33000000,
      selfFund: 500000,
      monthlyPayment: 90000,
      bonus: 0,
      years: 35,
      rate: 0.5,
    },
    changeNote: '初回提出',
    totalAmount: 33500000,
  },
  {
    id: 'fp-2',
    customerId: 'cust-1',
    customerName: '田中様',
    versionNumber: 2,
    versionLabel: '2回目',
    createdAt: new Date('2025-10-10T14:20:00'),
    updatedAt: new Date('2025-10-10T14:20:00'),
    createdBy: '営業担当A',
    status: 'superseded',
    buildingArea: 40,
    unitPrice: 500000,
    financialData: [],
    loanInfo: {
      borrowingAmount: 34000000,
      selfFund: 872110,
      monthlyPayment: 92000,
      bonus: 0,
      years: 35,
      rate: 0.5,
    },
    changeNote: 'オール電化に変更',
    previousVersionId: 'fp-1',
    totalAmount: 34872110,
  },
  {
    id: 'fp-3',
    customerId: 'cust-1',
    customerName: '田中様',
    versionNumber: 3,
    versionLabel: '3回目',
    createdAt: new Date('2025-10-13T10:30:00'),
    updatedAt: new Date('2025-10-13T10:30:00'),
    createdBy: '営業担当A',
    status: 'submitted',
    buildingArea: 40,
    unitPrice: 500000,
    financialData: [],
    loanInfo: {
      borrowingAmount: 35000000,
      selfFund: 572110,
      monthlyPayment: 95000,
      bonus: 0,
      years: 35,
      rate: 0.5,
    },
    changeNote: '地盤改良費を追加',
    previousVersionId: 'fp-2',
    totalAmount: 35572110,
  },
];

/**
 * localStorageから全データを取得
 */
export function getAllPlans(): FinancialPlanVersion[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // 初回アクセス時はサンプルデータを保存
      savePlans(SAMPLE_DATA);
      return SAMPLE_DATA;
    }

    const plans = JSON.parse(stored);
    // Date型の復元
    return plans.map((plan: any) => ({
      ...plan,
      createdAt: new Date(plan.createdAt),
      updatedAt: new Date(plan.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load plans from localStorage:', error);
    return [];
  }
}

/**
 * 特定のバージョンを取得
 */
export function getPlanById(id: string): FinancialPlanVersion | null {
  const plans = getAllPlans();
  return plans.find((p) => p.id === id) || null;
}

/**
 * 顧客IDで絞り込み
 */
export function getPlansByCustomerId(
  customerId: string,
): FinancialPlanVersion[] {
  const plans = getAllPlans();
  return plans
    .filter((p) => p.customerId === customerId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

/**
 * 全データを保存
 */
export function savePlans(plans: FinancialPlanVersion[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('Failed to save plans to localStorage:', error);
  }
}

/**
 * 新規バージョンを作成
 */
export function createPlan(
  plan: Omit<FinancialPlanVersion, 'id' | 'versionNumber' | 'versionLabel'>,
): FinancialPlanVersion {
  const plans = getAllPlans();

  // 同じ顧客の既存バージョンを取得
  const existingVersions = plans.filter(
    (p) => p.customerId === plan.customerId,
  );

  // 新しいバージョン番号を計算
  const maxVersionNumber =
    existingVersions.length > 0
      ? Math.max(...existingVersions.map((v) => v.versionNumber))
      : 0;
  const newVersionNumber = maxVersionNumber + 1;

  // バージョンラベルを生成
  const versionLabel =
    newVersionNumber === 1 ? '初回' : `${newVersionNumber}回目`;

  // 前のバージョンを旧版にする
  if (plan.previousVersionId) {
    const prevIndex = plans.findIndex((p) => p.id === plan.previousVersionId);
    if (prevIndex !== -1 && plans[prevIndex].status !== 'superseded') {
      plans[prevIndex].status = 'superseded';
    }
  }

  // 新しいバージョンを作成
  const newPlan: FinancialPlanVersion = {
    ...plan,
    id: `fp-${Date.now()}`,
    versionNumber: newVersionNumber,
    versionLabel,
  };

  plans.push(newPlan);
  savePlans(plans);

  return newPlan;
}

/**
 * バージョンを更新
 */
export function updatePlan(
  id: string,
  updates: Partial<FinancialPlanVersion>,
): FinancialPlanVersion | null {
  const plans = getAllPlans();
  const index = plans.findIndex((p) => p.id === id);

  if (index === -1) return null;

  plans[index] = {
    ...plans[index],
    ...updates,
    updatedAt: new Date(),
  };

  savePlans(plans);
  return plans[index];
}

/**
 * バージョンを削除
 */
export function deletePlan(id: string): boolean {
  const plans = getAllPlans();
  const filtered = plans.filter((p) => p.id !== id);

  if (filtered.length === plans.length) return false;

  savePlans(filtered);
  return true;
}

/**
 * 2つのバージョンを比較
 */
export function comparePlans(versionAId: string, versionBId: string) {
  const versionA = getPlanById(versionAId);
  const versionB = getPlanById(versionBId);

  if (!versionA || !versionB) {
    return null;
  }

  const totalDifference = versionB.totalAmount - versionA.totalAmount;

  // 項目ごとの差分を計算
  const differences: any[] = [];

  // 基本情報の比較
  if (versionA.buildingArea !== versionB.buildingArea) {
    differences.push({
      category: '基本情報',
      itemName: '施工面積',
      oldAmount: versionA.buildingArea,
      newAmount: versionB.buildingArea,
      change: versionB.buildingArea - versionA.buildingArea,
      changePercent:
        versionA.buildingArea > 0
          ? ((versionB.buildingArea - versionA.buildingArea) /
              versionA.buildingArea) *
            100
          : 0,
    });
  }

  if (versionA.unitPrice !== versionB.unitPrice) {
    differences.push({
      category: '基本情報',
      itemName: '坪単価',
      oldAmount: versionA.unitPrice,
      newAmount: versionB.unitPrice,
      change: versionB.unitPrice - versionA.unitPrice,
      changePercent:
        versionA.unitPrice > 0
          ? ((versionB.unitPrice - versionA.unitPrice) / versionA.unitPrice) *
            100
          : 0,
    });
  }

  // financialDataの比較（各カテゴリと項目）
  if (versionA.financialData && versionB.financialData) {
    // 両方のバージョンの全カテゴリと項目をマップに格納
    const itemsMapA: Record<string, Record<string, number>> = {};
    const itemsMapB: Record<string, Record<string, number>> = {};

    versionA.financialData.forEach((category) => {
      if (!itemsMapA[category.category]) {
        itemsMapA[category.category] = {};
      }
      category.items.forEach((item) => {
        itemsMapA[category.category][item.name] = item.amount;
      });
    });

    versionB.financialData.forEach((category) => {
      if (!itemsMapB[category.category]) {
        itemsMapB[category.category] = {};
      }
      category.items.forEach((item) => {
        itemsMapB[category.category][item.name] = item.amount;
      });
    });

    // 全カテゴリを取得
    const allCategories = new Set([
      ...Object.keys(itemsMapA),
      ...Object.keys(itemsMapB),
    ]);

    allCategories.forEach((categoryName) => {
      const itemsA = itemsMapA[categoryName] || {};
      const itemsB = itemsMapB[categoryName] || {};

      // 全項目を取得
      const allItems = new Set([
        ...Object.keys(itemsA),
        ...Object.keys(itemsB),
      ]);

      allItems.forEach((itemName) => {
        const oldAmount = itemsA[itemName] || 0;
        const newAmount = itemsB[itemName] || 0;

        // 金額が異なる場合のみ差分として記録
        if (oldAmount !== newAmount) {
          const change = newAmount - oldAmount;
          const changePercent = oldAmount > 0 ? (change / oldAmount) * 100 : 0;

          differences.push({
            category: categoryName,
            itemName: itemName,
            oldAmount,
            newAmount,
            change,
            changePercent,
          });
        }
      });
    });
  }

  return {
    versionA: {
      id: versionA.id,
      versionLabel: versionA.versionLabel,
      totalAmount: versionA.totalAmount,
      createdAt: versionA.createdAt,
    },
    versionB: {
      id: versionB.id,
      versionLabel: versionB.versionLabel,
      totalAmount: versionB.totalAmount,
      createdAt: versionB.createdAt,
    },
    totalChange: totalDifference,
    differences,
  };
}
