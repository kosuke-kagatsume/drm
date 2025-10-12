import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 顧客データの型定義
 */
interface CustomerRecord {
  id: string;
  tenantId: string;
  customerNo: string;
  name: string;
  company: string;
  firstTransactionDate: string; // 初回取引日
  lastTransactionDate: string; // 最終取引日
  type: 'new' | 'existing' | 'repeat'; // 顧客タイプ
  totalTransactions: number; // 総取引数
  totalRevenue: number; // 総取引額
  averageOrderValue: number; // 平均注文額
  status: 'active' | 'inactive' | 'at_risk'; // 顧客ステータス
  assignee: string; // 担当者ID
  assigneeName: string; // 担当者名
}

/**
 * サマリー情報の型定義
 */
interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number; // 今期の新規顧客
  repeatRate: number; // リピート率
  averageLTV: number; // 平均顧客生涯価値
  atRiskCustomers: number; // リスク顧客数
  totalRevenue: number; // 総売上
  revenuePerCustomer: number; // 顧客単価
}

/**
 * 月次トレンドデータの型定義
 */
interface MonthlyCustomerTrend {
  month: string;
  newCustomers: number;
  totalCustomers: number;
  revenue: number;
  averageLTV: number;
}

/**
 * 顧客タイプ別データの型定義
 */
interface CustomerTypeData {
  type: string;
  count: number;
  percentage: number;
  revenue: number;
  averageOrderValue: number;
}

/**
 * 顧客ランキングの型定義
 */
interface CustomerRanking {
  rank: number;
  customerNo: string;
  name: string;
  company: string;
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  lastTransactionDate: string;
  type: string;
}

/**
 * サンプル顧客データ
 */
const SAMPLE_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-001',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-001',
    name: '田中 太郎',
    company: '株式会社田中工務店',
    firstTransactionDate: '2023-03-15',
    lastTransactionDate: '2024-03-20',
    type: 'repeat',
    totalTransactions: 8,
    totalRevenue: 45000000,
    averageOrderValue: 5625000,
    status: 'active',
    assignee: 'user-001',
    assigneeName: '営業太郎',
  },
  {
    id: 'cust-002',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-002',
    name: '佐藤 花子',
    company: '佐藤建設株式会社',
    firstTransactionDate: '2022-11-10',
    lastTransactionDate: '2024-04-05',
    type: 'repeat',
    totalTransactions: 12,
    totalRevenue: 68000000,
    averageOrderValue: 5666667,
    status: 'active',
    assignee: 'user-001',
    assigneeName: '営業太郎',
  },
  {
    id: 'cust-003',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-003',
    name: '鈴木 一郎',
    company: '鈴木住宅',
    firstTransactionDate: '2024-01-08',
    lastTransactionDate: '2024-03-28',
    type: 'new',
    totalTransactions: 2,
    totalRevenue: 12000000,
    averageOrderValue: 6000000,
    status: 'active',
    assignee: 'user-002',
    assigneeName: '営業花子',
  },
  {
    id: 'cust-004',
    tenantId: 'demo-tenant',
    customerNo: 'C-2023-045',
    name: '高橋 美咲',
    company: '高橋リフォーム',
    firstTransactionDate: '2023-06-20',
    lastTransactionDate: '2024-02-14',
    type: 'repeat',
    totalTransactions: 5,
    totalRevenue: 28000000,
    averageOrderValue: 5600000,
    status: 'active',
    assignee: 'user-002',
    assigneeName: '営業花子',
  },
  {
    id: 'cust-005',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-005',
    name: '伊藤 健二',
    company: '伊藤建築事務所',
    firstTransactionDate: '2024-02-12',
    lastTransactionDate: '2024-04-10',
    type: 'new',
    totalTransactions: 3,
    totalRevenue: 18500000,
    averageOrderValue: 6166667,
    status: 'active',
    assignee: 'user-003',
    assigneeName: '営業次郎',
  },
  {
    id: 'cust-006',
    tenantId: 'demo-tenant',
    customerNo: 'C-2023-012',
    name: '渡辺 真一',
    company: '渡辺工業',
    firstTransactionDate: '2023-02-05',
    lastTransactionDate: '2023-10-15',
    type: 'existing',
    totalTransactions: 4,
    totalRevenue: 22000000,
    averageOrderValue: 5500000,
    status: 'at_risk',
    assignee: 'user-003',
    assigneeName: '営業次郎',
  },
  {
    id: 'cust-007',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-007',
    name: '山本 由美',
    company: '山本ホームズ',
    firstTransactionDate: '2024-03-05',
    lastTransactionDate: '2024-03-05',
    type: 'new',
    totalTransactions: 1,
    totalRevenue: 5800000,
    averageOrderValue: 5800000,
    status: 'active',
    assignee: 'user-001',
    assigneeName: '営業太郎',
  },
  {
    id: 'cust-008',
    tenantId: 'demo-tenant',
    customerNo: 'C-2023-028',
    name: '中村 達也',
    company: '中村設計',
    firstTransactionDate: '2023-04-18',
    lastTransactionDate: '2024-01-25',
    type: 'repeat',
    totalTransactions: 6,
    totalRevenue: 35000000,
    averageOrderValue: 5833333,
    status: 'active',
    assignee: 'user-002',
    assigneeName: '営業花子',
  },
  {
    id: 'cust-009',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-009',
    name: '小林 誠',
    company: '小林建材',
    firstTransactionDate: '2024-01-20',
    lastTransactionDate: '2024-04-08',
    type: 'new',
    totalTransactions: 4,
    totalRevenue: 24000000,
    averageOrderValue: 6000000,
    status: 'active',
    assignee: 'user-003',
    assigneeName: '営業次郎',
  },
  {
    id: 'cust-010',
    tenantId: 'demo-tenant',
    customerNo: 'C-2022-088',
    name: '加藤 恵美',
    company: '加藤住建',
    firstTransactionDate: '2022-08-10',
    lastTransactionDate: '2024-03-30',
    type: 'repeat',
    totalTransactions: 10,
    totalRevenue: 58000000,
    averageOrderValue: 5800000,
    status: 'active',
    assignee: 'user-001',
    assigneeName: '営業太郎',
  },
  {
    id: 'cust-011',
    tenantId: 'demo-tenant',
    customerNo: 'C-2023-055',
    name: '吉田 健',
    company: '吉田リノベーション',
    firstTransactionDate: '2023-07-22',
    lastTransactionDate: '2023-12-08',
    type: 'existing',
    totalTransactions: 3,
    totalRevenue: 16500000,
    averageOrderValue: 5500000,
    status: 'at_risk',
    assignee: 'user-002',
    assigneeName: '営業花子',
  },
  {
    id: 'cust-012',
    tenantId: 'demo-tenant',
    customerNo: 'C-2024-012',
    name: '清水 美里',
    company: '清水デザイン工房',
    firstTransactionDate: '2024-02-28',
    lastTransactionDate: '2024-04-12',
    type: 'new',
    totalTransactions: 2,
    totalRevenue: 11000000,
    averageOrderValue: 5500000,
    status: 'active',
    assignee: 'user-003',
    assigneeName: '営業次郎',
  },
];

/**
 * サマリー情報の計算
 */
function calculateSummary(customers: CustomerRecord[]): CustomerSummary {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;

  // 今年の新規顧客（2024年に初回取引）
  const currentYear = new Date().getFullYear();
  const newCustomers = customers.filter(
    (c) => new Date(c.firstTransactionDate).getFullYear() === currentYear,
  ).length;

  // リピート率（リピート顧客 / 全顧客）
  const repeatCustomers = customers.filter((c) => c.type === 'repeat').length;
  const repeatRate =
    totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  // 平均LTV
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);
  const averageLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // リスク顧客数
  const atRiskCustomers = customers.filter(
    (c) => c.status === 'at_risk',
  ).length;

  // 顧客単価
  const revenuePerCustomer =
    totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return {
    totalCustomers,
    activeCustomers,
    newCustomers,
    repeatRate,
    averageLTV,
    atRiskCustomers,
    totalRevenue,
    revenuePerCustomer,
  };
}

/**
 * 月次トレンドの計算
 */
function calculateMonthlyTrend(
  customers: CustomerRecord[],
): MonthlyCustomerTrend[] {
  const monthlyData = new Map<
    string,
    {
      newCustomers: Set<string>;
      allCustomers: Set<string>;
      revenue: number;
    }
  >();

  // 過去12ヶ月のデータを初期化
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.set(monthKey, {
      newCustomers: new Set(),
      allCustomers: new Set(),
      revenue: 0,
    });
  }

  // 顧客データから月次データを集計
  customers.forEach((customer) => {
    const firstDate = new Date(customer.firstTransactionDate);
    const firstMonthKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;

    // 初回取引月に新規顧客としてカウント
    if (monthlyData.has(firstMonthKey)) {
      const data = monthlyData.get(firstMonthKey)!;
      data.newCustomers.add(customer.id);
      data.allCustomers.add(customer.id);
    }

    // 最終取引月以降も顧客としてカウント（累積）
    const lastDate = new Date(customer.lastTransactionDate);
    monthlyData.forEach((data, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      const checkDate = new Date(year, month - 1, 1);

      if (checkDate >= firstDate && checkDate <= lastDate) {
        data.allCustomers.add(customer.id);
      }

      // その月の売上を配分（簡易的に均等配分）
      if (checkDate >= firstDate && checkDate <= lastDate) {
        const monthsBetween = Math.max(
          1,
          (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
            (lastDate.getMonth() - firstDate.getMonth()) +
            1,
        );
        data.revenue += customer.totalRevenue / monthsBetween;
      }
    });
  });

  // 結果を配列に変換
  return Array.from(monthlyData.entries()).map(([month, data]) => {
    const totalCustomers = data.allCustomers.size;
    const averageLTV = totalCustomers > 0 ? data.revenue / totalCustomers : 0;

    return {
      month,
      newCustomers: data.newCustomers.size,
      totalCustomers,
      revenue: Math.round(data.revenue),
      averageLTV: Math.round(averageLTV),
    };
  });
}

/**
 * 顧客タイプ別データの計算
 */
function calculateCustomerTypeData(
  customers: CustomerRecord[],
): CustomerTypeData[] {
  const typeMap = new Map<
    string,
    {
      count: number;
      revenue: number;
      totalOrderValue: number;
    }
  >();

  const typeLabels = {
    new: '新規顧客',
    existing: '既存顧客',
    repeat: 'リピート顧客',
  };

  customers.forEach((customer) => {
    const typeLabel = typeLabels[customer.type] || customer.type;

    if (!typeMap.has(typeLabel)) {
      typeMap.set(typeLabel, { count: 0, revenue: 0, totalOrderValue: 0 });
    }

    const data = typeMap.get(typeLabel)!;
    data.count++;
    data.revenue += customer.totalRevenue;
    data.totalOrderValue += customer.averageOrderValue;
  });

  const totalCustomers = customers.length;

  return Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    percentage: totalCustomers > 0 ? (data.count / totalCustomers) * 100 : 0,
    revenue: data.revenue,
    averageOrderValue: data.count > 0 ? data.totalOrderValue / data.count : 0,
  }));
}

/**
 * 顧客ランキングの計算（売上高順）
 */
function calculateCustomerRanking(
  customers: CustomerRecord[],
  sortBy: 'revenue' | 'transactions' = 'revenue',
  limit: number = 10,
): CustomerRanking[] {
  const sorted = [...customers].sort((a, b) => {
    if (sortBy === 'revenue') {
      return b.totalRevenue - a.totalRevenue;
    } else {
      return b.totalTransactions - a.totalTransactions;
    }
  });

  return sorted.slice(0, limit).map((customer, index) => ({
    rank: index + 1,
    customerNo: customer.customerNo,
    name: customer.name,
    company: customer.company,
    totalRevenue: customer.totalRevenue,
    totalTransactions: customer.totalTransactions,
    averageOrderValue: customer.averageOrderValue,
    lastTransactionDate: customer.lastTransactionDate,
    type:
      customer.type === 'new'
        ? '新規'
        : customer.type === 'existing'
          ? '既存'
          : 'リピート',
  }));
}

/**
 * リスク顧客の抽出
 */
function getAtRiskCustomers(customers: CustomerRecord[]): CustomerRanking[] {
  const atRiskCustomers = customers.filter((c) => c.status === 'at_risk');

  // 最終取引日が古い順にソート
  const sorted = atRiskCustomers.sort(
    (a, b) =>
      new Date(a.lastTransactionDate).getTime() -
      new Date(b.lastTransactionDate).getTime(),
  );

  return sorted.map((customer, index) => ({
    rank: index + 1,
    customerNo: customer.customerNo,
    name: customer.name,
    company: customer.company,
    totalRevenue: customer.totalRevenue,
    totalTransactions: customer.totalTransactions,
    averageOrderValue: customer.averageOrderValue,
    lastTransactionDate: customer.lastTransactionDate,
    type:
      customer.type === 'new'
        ? '新規'
        : customer.type === 'existing'
          ? '既存'
          : 'リピート',
  }));
}

/**
 * GET /api/analytics/customers
 * 顧客分析データを取得するAPIエンドポイント
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータの取得
    const tenantId = searchParams.get('tenantId') || 'demo-tenant';
    const period = searchParams.get('period') || 'yearly'; // monthly, quarterly, yearly
    const customerType = searchParams.get('customerType') || 'all'; // all, new, existing, repeat
    const status = searchParams.get('status') || 'all'; // all, active, inactive, at_risk

    // データのフィルタリング
    let filteredCustomers = SAMPLE_CUSTOMERS.filter(
      (c) => c.tenantId === tenantId,
    );

    if (customerType !== 'all') {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.type === customerType,
      );
    }

    if (status !== 'all') {
      filteredCustomers = filteredCustomers.filter((c) => c.status === status);
    }

    // 各種データの計算
    const summary = calculateSummary(filteredCustomers);
    const monthlyTrend = calculateMonthlyTrend(filteredCustomers);
    const customerTypeData = calculateCustomerTypeData(filteredCustomers);
    const topCustomersByRevenue = calculateCustomerRanking(
      filteredCustomers,
      'revenue',
      10,
    );
    const topCustomersByTransactions = calculateCustomerRanking(
      filteredCustomers,
      'transactions',
      10,
    );
    const atRiskCustomers = getAtRiskCustomers(filteredCustomers);

    // レスポンスデータの構築
    const responseData = {
      summary,
      monthlyTrend,
      customerTypeData,
      rankings: {
        byRevenue: topCustomersByRevenue,
        byTransactions: topCustomersByTransactions,
      },
      atRiskCustomers,
      filters: {
        tenantId,
        period,
        customerType,
        status,
      },
      metadata: {
        totalRecords: filteredCustomers.length,
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in customer analytics API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
