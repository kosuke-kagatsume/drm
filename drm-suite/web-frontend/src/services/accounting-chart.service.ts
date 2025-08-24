/**
 * 建設業界向け勘定科目管理サービス
 * 管理会計・プロジェクト会計に対応
 */

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense'
  | 'cost';
export type CostCenter = 'project' | 'department' | 'equipment' | 'overhead';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  nameKana: string;
  type: AccountType;
  category: string;
  subCategory?: string;
  level: number; // 1=大分類, 2=中分類, 3=小分類, 4=補助科目
  parentId?: string;
  isActive: boolean;

  // 建設業特有の設定
  isProjectSpecific: boolean; // プロジェクト別管理対象
  costCenter?: CostCenter;
  taxType?: 'taxable' | 'tax_free' | 'non_taxable';

  // 管理会計用
  profitCenterCode?: string; // 収益部門コード
  costCenterCode?: string; // 原価部門コード
  budgetManaged: boolean; // 予算管理対象

  // メタ情報
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingEntry {
  id: string;
  date: string;
  documentNo: string;
  description: string;
  projectId?: string;
  contractId?: string;

  // 仕訳
  debitAccountId: string;
  debitAmount: number;
  creditAccountId: string;
  creditAmount: number;

  // 税務
  taxAmount?: number;
  taxRate?: number;

  // 管理会計
  costCenter?: string;
  profitCenter?: string;
  budgetCode?: string;

  // DW連携
  dwTransactionId?: string;
  dwApprovalStatus?: 'pending' | 'approved' | 'rejected';

  createdBy: string;
  createdAt: string;
}

export interface BudgetAllocation {
  id: string;
  accountId: string;
  projectId?: string;
  fiscalYear: number;
  period: number; // 1-12月
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  lastUpdated: string;
}

export interface ProfitAnalysisByAccount {
  accountId: string;
  accountName: string;
  projectId?: string;
  projectName?: string;

  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;

  // 月別推移
  monthlyData: {
    month: number;
    budget: number;
    actual: number;
    variance: number;
  }[];
}

class AccountingChartService {
  /**
   * 建設業標準勘定科目を取得
   */
  getDefaultChartOfAccounts(): ChartOfAccount[] {
    return [
      // 資産の部
      {
        id: 'acc_100',
        code: '100',
        name: '流動資産',
        nameKana: 'リュウドウシサン',
        type: 'asset',
        category: '流動資産',
        level: 1,
        isActive: true,
        isProjectSpecific: false,
        budgetManaged: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_101',
        code: '101',
        name: '現金',
        nameKana: 'ゲンキン',
        type: 'asset',
        category: '流動資産',
        subCategory: '現金預金',
        level: 2,
        parentId: 'acc_100',
        isActive: true,
        isProjectSpecific: false,
        budgetManaged: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_102',
        code: '102',
        name: '普通預金',
        nameKana: 'フツウヨキン',
        type: 'asset',
        category: '流動資産',
        subCategory: '現金預金',
        level: 2,
        parentId: 'acc_100',
        isActive: true,
        isProjectSpecific: false,
        budgetManaged: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_110',
        code: '110',
        name: '完成工事未収入金',
        nameKana: 'カンセイコウジミシュウニュウキン',
        type: 'asset',
        category: '流動資産',
        subCategory: '売掛債権',
        level: 2,
        parentId: 'acc_100',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        budgetManaged: true,
        description: '完成工事に対する未収入金（建設業特有）',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_111',
        code: '111',
        name: '未成工事支出金',
        nameKana: 'ミセイコウジシシュツキン',
        type: 'asset',
        category: '流動資産',
        subCategory: '棚卸資産',
        level: 2,
        parentId: 'acc_100',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        budgetManaged: true,
        description: '未完成工事の支出金（建設業特有の仕掛品）',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 売上の部（建設業特有）
      {
        id: 'acc_400',
        code: '400',
        name: '完成工事高',
        nameKana: 'カンセイコウジダカ',
        type: 'revenue',
        category: '売上高',
        level: 1,
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        taxType: 'taxable',
        budgetManaged: true,
        description: '完成工事の売上高（建設業特有）',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_401',
        code: '401',
        name: '完成工事高（住宅）',
        nameKana: 'カンセイコウジダカジュウタク',
        type: 'revenue',
        category: '売上高',
        subCategory: '住宅工事',
        level: 2,
        parentId: 'acc_400',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        taxType: 'taxable',
        profitCenterCode: 'PC_HOUSE',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_402',
        code: '402',
        name: '完成工事高（店舗）',
        nameKana: 'カンセイコウジダカテンポ',
        type: 'revenue',
        category: '売上高',
        subCategory: '店舗工事',
        level: 2,
        parentId: 'acc_400',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        taxType: 'taxable',
        profitCenterCode: 'PC_STORE',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_403',
        code: '403',
        name: '完成工事高（リフォーム）',
        nameKana: 'カンセイコウジダカリフォーム',
        type: 'revenue',
        category: '売上高',
        subCategory: 'リフォーム工事',
        level: 2,
        parentId: 'acc_400',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        taxType: 'taxable',
        profitCenterCode: 'PC_REFORM',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 原価の部（建設業特有）
      {
        id: 'acc_500',
        code: '500',
        name: '完成工事原価',
        nameKana: 'カンセイコウジゲンカ',
        type: 'cost',
        category: '売上原価',
        level: 1,
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        budgetManaged: true,
        description: '完成工事の原価（建設業特有）',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_501',
        code: '501',
        name: '材料費',
        nameKana: 'ザイリョウヒ',
        type: 'cost',
        category: '売上原価',
        subCategory: '材料費',
        level: 2,
        parentId: 'acc_500',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        costCenterCode: 'CC_MATERIAL',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_502',
        code: '502',
        name: '労務費',
        nameKana: 'ロウムヒ',
        type: 'cost',
        category: '売上原価',
        subCategory: '労務費',
        level: 2,
        parentId: 'acc_500',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        costCenterCode: 'CC_LABOR',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_503',
        code: '503',
        name: '外注費',
        nameKana: 'ガイチュウヒ',
        type: 'cost',
        category: '売上原価',
        subCategory: '外注費',
        level: 2,
        parentId: 'acc_500',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        costCenterCode: 'CC_SUBCONTRACT',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_504',
        code: '504',
        name: '経費',
        nameKana: 'ケイヒ',
        type: 'cost',
        category: '売上原価',
        subCategory: '経費',
        level: 2,
        parentId: 'acc_500',
        isActive: true,
        isProjectSpecific: true,
        costCenter: 'project',
        costCenterCode: 'CC_EXPENSE',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // 販売費及び一般管理費
      {
        id: 'acc_600',
        code: '600',
        name: '販売費及び一般管理費',
        nameKana: 'ハンバイヒオヨビイッパンカンリヒ',
        type: 'expense',
        category: '販管費',
        level: 1,
        isActive: true,
        isProjectSpecific: false,
        costCenter: 'overhead',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_601',
        code: '601',
        name: '役員報酬',
        nameKana: 'ヤクインホウシュウ',
        type: 'expense',
        category: '販管費',
        subCategory: '人件費',
        level: 2,
        parentId: 'acc_600',
        isActive: true,
        isProjectSpecific: false,
        costCenter: 'overhead',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_602',
        code: '602',
        name: '給料手当',
        nameKana: 'キュウリョウテアテ',
        type: 'expense',
        category: '販管費',
        subCategory: '人件費',
        level: 2,
        parentId: 'acc_600',
        isActive: true,
        isProjectSpecific: false,
        costCenter: 'department',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_610',
        code: '610',
        name: '広告宣伝費',
        nameKana: 'コウコクセンデンヒ',
        type: 'expense',
        category: '販管費',
        subCategory: 'マーケティング費',
        level: 2,
        parentId: 'acc_600',
        isActive: true,
        isProjectSpecific: false,
        costCenter: 'department',
        budgetManaged: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * 勘定科目一覧取得
   */
  async getChartOfAccounts(): Promise<ChartOfAccount[]> {
    const accounts = localStorage.getItem('chart_of_accounts');
    if (accounts) {
      return JSON.parse(accounts);
    }

    // 初回はデフォルト勘定科目を設定
    const defaultAccounts = this.getDefaultChartOfAccounts();
    localStorage.setItem('chart_of_accounts', JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }

  /**
   * プロジェクト別勘定科目取得
   */
  async getProjectSpecificAccounts(): Promise<ChartOfAccount[]> {
    const accounts = await this.getChartOfAccounts();
    return accounts.filter((account) => account.isProjectSpecific);
  }

  /**
   * 勘定科目別残高取得
   */
  async getAccountBalances(
    accountIds: string[],
    projectId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ [accountId: string]: number }> {
    // 実際の実装では仕訳データから残高を計算
    // ここではサンプルデータを返す
    const balances: { [accountId: string]: number } = {};

    accountIds.forEach((accountId) => {
      // 勘定科目の種類に応じてサンプル残高を生成
      if (accountId.startsWith('acc_4')) {
        // 売上高
        balances[accountId] = Math.random() * 50000000; // 0-50M
      } else if (accountId.startsWith('acc_5')) {
        // 原価
        balances[accountId] = Math.random() * 40000000; // 0-40M
      } else if (accountId.startsWith('acc_6')) {
        // 販管費
        balances[accountId] = Math.random() * 5000000; // 0-5M
      } else {
        balances[accountId] = Math.random() * 10000000; // その他
      }
    });

    return balances;
  }

  /**
   * プロジェクト別損益計算
   */
  async calculateProjectProfitLoss(
    projectId: string,
  ): Promise<ProfitAnalysisByAccount[]> {
    const projectAccounts = await this.getProjectSpecificAccounts();
    const results: ProfitAnalysisByAccount[] = [];

    for (const account of projectAccounts) {
      const budgetAmount = Math.random() * 10000000; // サンプル予算
      const actualAmount = Math.random() * 12000000; // サンプル実績
      const variance = actualAmount - budgetAmount;
      const variancePercent =
        budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;

      // 月別データ生成
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        budget: budgetAmount / 12,
        actual: (actualAmount / 12) * (0.8 + Math.random() * 0.4), // ランダム変動
        variance: 0,
      }));

      monthlyData.forEach((data) => {
        data.variance = data.actual - data.budget;
      });

      results.push({
        accountId: account.id,
        accountName: account.name,
        projectId,
        projectName: `プロジェクト${projectId}`, // 実際にはプロジェクト名を取得
        budgetAmount,
        actualAmount,
        variance,
        variancePercent,
        monthlyData,
      });
    }

    return results;
  }

  /**
   * 勘定科目階層取得
   */
  async getAccountHierarchy(): Promise<ChartOfAccount[]> {
    const accounts = await this.getChartOfAccounts();
    return this.buildHierarchy(accounts);
  }

  /**
   * 勘定科目検索
   */
  async searchAccounts(
    searchTerm: string,
    accountType?: AccountType,
  ): Promise<ChartOfAccount[]> {
    const accounts = await this.getChartOfAccounts();

    return accounts.filter((account) => {
      const matchesSearch =
        account.name.includes(searchTerm) ||
        account.nameKana.includes(searchTerm) ||
        account.code.includes(searchTerm);

      const matchesType = !accountType || account.type === accountType;

      return matchesSearch && matchesType && account.isActive;
    });
  }

  // プライベートメソッド
  private buildHierarchy(accounts: ChartOfAccount[]): ChartOfAccount[] {
    const accountMap = new Map<
      string,
      ChartOfAccount & { children: ChartOfAccount[] }
    >();
    const rootAccounts: ChartOfAccount[] = [];

    // まず全アカウントをマップに追加
    accounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // 階層構造を構築
    accounts.forEach((account) => {
      const accountWithChildren = accountMap.get(account.id)!;

      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children.push(accountWithChildren);
        }
      } else {
        rootAccounts.push(accountWithChildren);
      }
    });

    return rootAccounts;
  }

  /**
   * 仕訳エントリ作成
   */
  async createAccountingEntry(
    entry: Omit<AccountingEntry, 'id' | 'createdAt'>,
  ): Promise<AccountingEntry> {
    const newEntry: AccountingEntry = {
      ...entry,
      id: `entry_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const entries = JSON.parse(
      localStorage.getItem('accounting_entries') || '[]',
    );
    entries.push(newEntry);
    localStorage.setItem('accounting_entries', JSON.stringify(entries));

    return newEntry;
  }

  /**
   * 予算実績分析
   */
  async getBudgetAnalysis(
    accountIds: string[],
    fiscalYear: number,
    projectId?: string,
  ): Promise<BudgetAllocation[]> {
    // サンプルデータを返す（実際にはDBから取得）
    return accountIds
      .map((accountId) => ({
        id: `budget_${accountId}_${fiscalYear}`,
        accountId,
        projectId,
        fiscalYear,
        period: new Date().getMonth() + 1,
        budgetAmount: Math.random() * 10000000,
        actualAmount: Math.random() * 12000000,
        variance: 0,
        variancePercent: 0,
        lastUpdated: new Date().toISOString(),
      }))
      .map((allocation) => {
        allocation.variance = allocation.actualAmount - allocation.budgetAmount;
        allocation.variancePercent =
          allocation.budgetAmount > 0
            ? (allocation.variance / allocation.budgetAmount) * 100
            : 0;
        return allocation;
      });
  }
}

export const accountingChartService = new AccountingChartService();
