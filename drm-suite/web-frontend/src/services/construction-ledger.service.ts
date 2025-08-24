/**
 * 工事台帳管理サービス
 * 建設業法に準拠した工事台帳の作成・管理
 */

import { dwIntegrationService, DWOrder } from './dw-integration.service';

export type LedgerStatus =
  | 'planning'
  | 'in_progress'
  | 'completed'
  | 'suspended'
  | 'cancelled';
export type CostCategory = '材料費' | '労務費' | '外注費' | '経費' | '諸経費';

export interface ConstructionLedger {
  id: string;
  contractId: string;
  projectName: string;

  // 基本情報
  contractAmount: number;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  status: LedgerStatus;

  // 予算情報
  budgetBreakdown: {
    materialCost: number;
    laborCost: number;
    subcontractCost: number;
    expenseCost: number;
    overhead: number;
    profit: number;
  };

  // 実績情報
  actualCosts: {
    materialCost: number;
    laborCost: number;
    subcontractCost: number;
    expenseCost: number;
    overhead: number;
    total: number;
  };

  // 進捗情報
  progressRate: number;
  earnedValue: number;

  // 出来高・請求情報
  billingHistory: BillingRecord[];

  // 工程管理
  milestones: ProjectMilestone[];

  // 原価管理
  costEntries: CostEntry[];

  // メタ情報
  projectManager: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecord {
  id: string;
  billingDate: string;
  billingAmount: number;
  billingType: '着手金' | '中間金' | '精算金' | '変更請求';
  progressAtBilling: number;
  invoiceId?: string;
  paidDate?: string;
  paidAmount: number;
  notes?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  description: string;
  dependsOn: string[]; // 依存する前工程のID
}

export interface CostEntry {
  id: string;
  date: string;
  category: CostCategory;
  subcategory: string;
  description: string;
  amount: number;
  unit: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  invoiceNumber?: string;
  dwOrderId?: string; // DWから戻ってきた受発注データのID
  approvalStatus: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface ProfitAnalysis {
  contractAmount: number;
  totalBudgetCost: number;
  totalActualCost: number;
  budgetProfit: number;
  actualProfit: number;
  profitVariance: number;
  profitMarginBudget: number;
  profitMarginActual: number;
  costOverrun: number;
  costOverrunPercent: number;
}

export interface CostVarianceReport {
  category: CostCategory;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'over' | 'on_budget';
}

class ConstructionLedgerService {
  /**
   * 契約から工事台帳を作成
   */
  async createLedgerFromContract(
    contractId: string,
    contractData: any,
    budgetBreakdown: any,
  ): Promise<ConstructionLedger> {
    const ledger: ConstructionLedger = {
      id: `ledger_${Date.now()}`,
      contractId,
      projectName: contractData.projectName,
      contractAmount: contractData.amount,
      startDate: contractData.startDate,
      plannedEndDate: contractData.endDate,
      status: 'planning',

      budgetBreakdown: {
        materialCost: budgetBreakdown.materialCost || 0,
        laborCost: budgetBreakdown.laborCost || 0,
        subcontractCost: budgetBreakdown.subcontractCost || 0,
        expenseCost: budgetBreakdown.expenseCost || 0,
        overhead: budgetBreakdown.overhead || 0,
        profit: budgetBreakdown.profit || 0,
      },

      actualCosts: {
        materialCost: 0,
        laborCost: 0,
        subcontractCost: 0,
        expenseCost: 0,
        overhead: 0,
        total: 0,
      },

      progressRate: 0,
      earnedValue: 0,
      billingHistory: [],
      milestones: this.generateDefaultMilestones(
        contractData.startDate,
        contractData.endDate,
      ),
      costEntries: [],

      projectManager: contractData.manager || '未設定',
      createdBy: contractData.createdBy || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveLedger(ledger);
    return ledger;
  }

  /**
   * DWから戻ってきた受発注データを工事台帳に反映
   */
  async syncWithDWOrders(
    contractId: string,
  ): Promise<ConstructionLedger | null> {
    const ledger = await this.getLedgerByContract(contractId);
    if (!ledger) return null;

    // DWから承認された受発注データを取得
    const dwOrders = await dwIntegrationService.getOrdersByProject(contractId);
    const approvedOrders = dwOrders.filter(
      (order) => order.dwStatus === 'approved',
    );

    // 既存の原価エントリをクリア（DWから最新データで更新）
    ledger.costEntries = ledger.costEntries.filter((entry) => !entry.dwOrderId);

    // DWから戻ってきたデータを原価エントリに追加
    approvedOrders.forEach((order) => {
      order.orderDetails.forEach((detail) => {
        const costEntry: CostEntry = {
          id: `cost_${Date.now()}_${detail.id}`,
          date: order.approvedAt || order.createdAt,
          category: this.mapCategoryToCostCategory(detail.category),
          subcategory: detail.specification,
          description: detail.itemName,
          amount: detail.totalPrice,
          unit: detail.unit,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          supplier: detail.supplier,
          dwOrderId: order.id,
          approvalStatus: 'approved',
          notes: detail.notes,
        };

        ledger.costEntries.push(costEntry);
      });
    });

    // 実績原価を再計算
    this.recalculateActualCosts(ledger);

    ledger.updatedAt = new Date().toISOString();
    this.saveLedger(ledger);

    return ledger;
  }

  /**
   * 工事台帳一覧取得
   */
  async getLedgers(): Promise<ConstructionLedger[]> {
    const ledgers = localStorage.getItem('construction_ledgers');
    return ledgers ? JSON.parse(ledgers) : [];
  }

  /**
   * 契約IDで工事台帳取得
   */
  async getLedgerByContract(
    contractId: string,
  ): Promise<ConstructionLedger | null> {
    const ledgers = await this.getLedgers();
    return ledgers.find((ledger) => ledger.contractId === contractId) || null;
  }

  /**
   * 工事進捗更新
   */
  async updateProgress(
    contractId: string,
    progressRate: number,
    completedMilestones: string[],
  ): Promise<ConstructionLedger | null> {
    const ledger = await this.getLedgerByContract(contractId);
    if (!ledger) return null;

    ledger.progressRate = progressRate;
    ledger.earnedValue = Math.round(
      (ledger.contractAmount * progressRate) / 100,
    );

    // マイルストーンの状況を更新
    ledger.milestones.forEach((milestone) => {
      if (completedMilestones.includes(milestone.name)) {
        milestone.status = 'completed';
        milestone.actualDate = new Date().toISOString().split('T')[0];
      }
    });

    // 進捗に応じてステータス更新
    if (progressRate >= 100) {
      ledger.status = 'completed';
      ledger.actualEndDate = new Date().toISOString().split('T')[0];
    } else if (progressRate > 0) {
      ledger.status = 'in_progress';
    }

    ledger.updatedAt = new Date().toISOString();
    this.saveLedger(ledger);

    return ledger;
  }

  /**
   * 請求記録の追加
   */
  async addBillingRecord(
    contractId: string,
    billingRecord: Omit<BillingRecord, 'id'>,
  ): Promise<ConstructionLedger | null> {
    const ledger = await this.getLedgerByContract(contractId);
    if (!ledger) return null;

    const record: BillingRecord = {
      ...billingRecord,
      id: `billing_${Date.now()}`,
    };

    ledger.billingHistory.push(record);
    ledger.updatedAt = new Date().toISOString();
    this.saveLedger(ledger);

    return ledger;
  }

  /**
   * 収益性分析
   */
  async analyzeProfitability(
    contractId: string,
  ): Promise<ProfitAnalysis | null> {
    const ledger = await this.getLedgerByContract(contractId);
    if (!ledger) return null;

    const totalBudgetCost =
      Object.values(ledger.budgetBreakdown).reduce(
        (sum, cost) => sum + cost,
        0,
      ) - ledger.budgetBreakdown.profit;
    const totalActualCost = ledger.actualCosts.total;
    const budgetProfit = ledger.budgetBreakdown.profit;
    const actualProfit = ledger.contractAmount - totalActualCost;
    const profitVariance = actualProfit - budgetProfit;
    const costOverrun = totalActualCost - totalBudgetCost;

    return {
      contractAmount: ledger.contractAmount,
      totalBudgetCost,
      totalActualCost,
      budgetProfit,
      actualProfit,
      profitVariance,
      profitMarginBudget: (budgetProfit / ledger.contractAmount) * 100,
      profitMarginActual: (actualProfit / ledger.contractAmount) * 100,
      costOverrun,
      costOverrunPercent:
        totalBudgetCost > 0 ? (costOverrun / totalBudgetCost) * 100 : 0,
    };
  }

  /**
   * 原価差異分析
   */
  async analyzeCostVariance(contractId: string): Promise<CostVarianceReport[]> {
    const ledger = await this.getLedgerByContract(contractId);
    if (!ledger) return [];

    const categories: CostCategory[] = [
      '材料費',
      '労務費',
      '外注費',
      '経費',
      '諸経費',
    ];

    return categories.map((category) => {
      const budgetAmount = this.getBudgetAmountByCategory(ledger, category);
      const actualAmount = this.getActualAmountByCategory(ledger, category);
      const variance = actualAmount - budgetAmount;
      const variancePercent =
        budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

      return {
        category,
        budgetAmount,
        actualAmount,
        variance,
        variancePercent,
        status: variance > 0 ? 'over' : variance < 0 ? 'under' : 'on_budget',
      };
    });
  }

  // プライベートメソッド
  private generateDefaultMilestones(
    startDate: string,
    endDate: string,
  ): ProjectMilestone[] {
    return [
      {
        id: 'milestone_1',
        name: '着工',
        plannedDate: startDate,
        status: 'pending',
        description: '工事開始',
        dependsOn: [],
      },
      {
        id: 'milestone_2',
        name: '基礎工事完了',
        plannedDate: this.addDays(startDate, 14),
        status: 'pending',
        description: '基礎工事の完了',
        dependsOn: ['milestone_1'],
      },
      {
        id: 'milestone_3',
        name: '上棟',
        plannedDate: this.addDays(startDate, 45),
        status: 'pending',
        description: '建て方・上棟式',
        dependsOn: ['milestone_2'],
      },
      {
        id: 'milestone_4',
        name: '完工',
        plannedDate: endDate,
        status: 'pending',
        description: '工事完成・引き渡し',
        dependsOn: ['milestone_3'],
      },
    ];
  }

  private mapCategoryToCostCategory(category: string): CostCategory {
    const mapping: { [key: string]: CostCategory } = {
      材料: '材料費',
      労務: '労務費',
      外注: '外注費',
      経費: '経費',
    };
    return mapping[category] || '経費';
  }

  private recalculateActualCosts(ledger: ConstructionLedger): void {
    const costs = {
      materialCost: 0,
      laborCost: 0,
      subcontractCost: 0,
      expenseCost: 0,
      overhead: 0,
    };

    ledger.costEntries.forEach((entry) => {
      switch (entry.category) {
        case '材料費':
          costs.materialCost += entry.amount;
          break;
        case '労務費':
          costs.laborCost += entry.amount;
          break;
        case '外注費':
          costs.subcontractCost += entry.amount;
          break;
        case '経費':
          costs.expenseCost += entry.amount;
          break;
        case '諸経費':
          costs.overhead += entry.amount;
          break;
      }
    });

    ledger.actualCosts = {
      ...costs,
      total: Object.values(costs).reduce((sum, cost) => sum + cost, 0),
    };
  }

  private getBudgetAmountByCategory(
    ledger: ConstructionLedger,
    category: CostCategory,
  ): number {
    switch (category) {
      case '材料費':
        return ledger.budgetBreakdown.materialCost;
      case '労務費':
        return ledger.budgetBreakdown.laborCost;
      case '外注費':
        return ledger.budgetBreakdown.subcontractCost;
      case '経費':
        return ledger.budgetBreakdown.expenseCost;
      case '諸経費':
        return ledger.budgetBreakdown.overhead;
      default:
        return 0;
    }
  }

  private getActualAmountByCategory(
    ledger: ConstructionLedger,
    category: CostCategory,
  ): number {
    switch (category) {
      case '材料費':
        return ledger.actualCosts.materialCost;
      case '労務費':
        return ledger.actualCosts.laborCost;
      case '外注費':
        return ledger.actualCosts.subcontractCost;
      case '経費':
        return ledger.actualCosts.expenseCost;
      case '諸経費':
        return ledger.actualCosts.overhead;
      default:
        return 0;
    }
  }

  private addDays(date: string, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  private saveLedger(ledger: ConstructionLedger): void {
    const ledgers = JSON.parse(
      localStorage.getItem('construction_ledgers') || '[]',
    );
    const existingIndex = ledgers.findIndex(
      (l: ConstructionLedger) => l.id === ledger.id,
    );

    if (existingIndex >= 0) {
      ledgers[existingIndex] = ledger;
    } else {
      ledgers.push(ledger);
    }

    localStorage.setItem('construction_ledgers', JSON.stringify(ledgers));
  }
}

export const constructionLedgerService = new ConstructionLedgerService();
