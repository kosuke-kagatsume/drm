'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Contract {
  id: string;
  projectName: string;
  customer: string;
  customerCompany?: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  amount: number;
  status:
    | 'draft'
    | 'pending'
    | 'signed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'expired';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentProgress: number;
  dueDate: string;
  projectType: 'new_build' | 'renovation' | 'repair' | 'maintenance';
  contractType: 'lump_sum' | 'unit_price' | 'cost_plus' | 'time_material';
  documents: Document[];
  milestones: Milestone[];
  changeOrders: ChangeOrder[];
  riskLevel: 'low' | 'medium' | 'high';
  profitMargin: number;
  tags: string[];
  manager: string;
  lastActivity: string;
  notes?: string;
}

interface Document {
  id: string;
  name: string;
  type:
    | 'contract'
    | 'estimate'
    | 'drawing'
    | 'specification'
    | 'change_order'
    | 'invoice';
  uploadDate: string;
  size: string;
  status: 'draft' | 'approved' | 'signed';
}

interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  completionRate: number;
}

interface ChangeOrder {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  receivedAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  avgProfitMargin: number;
  completionRate: number;
  riskContracts: number;
}

export default function ContractsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('list');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    'date' | 'amount' | 'status' | 'customer'
  >('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // サンプルデータ（実際の建設業界のデータ構造を反映）
  const contracts: Contract[] = [
    {
      id: 'CON-2024-001',
      projectName: '田中様邸新築工事',
      customer: '田中太郎',
      customerCompany: '',
      contractDate: '2024-07-01',
      startDate: '2024-07-15',
      endDate: '2024-12-15',
      amount: 35000000,
      status: 'in_progress',
      paymentStatus: 'partial',
      paymentProgress: 45,
      dueDate: '2024-12-31',
      projectType: 'new_build',
      contractType: 'lump_sum',
      profitMargin: 18.5,
      riskLevel: 'low',
      manager: '山田次郎',
      lastActivity: '2時間前',
      tags: ['新築', '木造', '住宅'],
      documents: [
        {
          id: 'DOC001',
          name: '工事請負契約書.pdf',
          type: 'contract',
          uploadDate: '2024-07-01',
          size: '2.5MB',
          status: 'signed',
        },
        {
          id: 'DOC002',
          name: '見積書.pdf',
          type: 'estimate',
          uploadDate: '2024-06-25',
          size: '1.2MB',
          status: 'approved',
        },
        {
          id: 'DOC003',
          name: '設計図面.pdf',
          type: 'drawing',
          uploadDate: '2024-06-20',
          size: '15.8MB',
          status: 'approved',
        },
      ],
      milestones: [
        {
          id: 'M001',
          name: '基礎工事完了',
          dueDate: '2024-08-15',
          amount: 8000000,
          status: 'completed',
          completionRate: 100,
        },
        {
          id: 'M002',
          name: '上棟',
          dueDate: '2024-09-30',
          amount: 12000000,
          status: 'in_progress',
          completionRate: 75,
        },
        {
          id: 'M003',
          name: '外装工事完了',
          dueDate: '2024-11-15',
          amount: 8000000,
          status: 'pending',
          completionRate: 0,
        },
        {
          id: 'M004',
          name: '引き渡し',
          dueDate: '2024-12-15',
          amount: 7000000,
          status: 'pending',
          completionRate: 0,
        },
      ],
      changeOrders: [
        {
          id: 'CO001',
          description: 'キッチン仕様変更',
          amount: 500000,
          status: 'approved',
          requestDate: '2024-08-10',
        },
      ],
    },
    {
      id: 'CON-2024-002',
      projectName: '山田ビル改修工事',
      customer: '山田商事株式会社',
      customerCompany: '山田商事株式会社',
      contractDate: '2024-07-15',
      startDate: '2024-08-01',
      endDate: '2025-01-31',
      amount: 65000000,
      status: 'signed',
      paymentStatus: 'pending',
      paymentProgress: 0,
      dueDate: '2025-02-28',
      projectType: 'renovation',
      contractType: 'unit_price',
      profitMargin: 22.3,
      riskLevel: 'medium',
      manager: '佐藤健一',
      lastActivity: '1日前',
      tags: ['改修', 'ビル', '商業施設'],
      documents: [
        {
          id: 'DOC004',
          name: '工事請負契約書.pdf',
          type: 'contract',
          uploadDate: '2024-07-15',
          size: '3.1MB',
          status: 'signed',
        },
      ],
      milestones: [
        {
          id: 'M005',
          name: '着工',
          dueDate: '2024-08-01',
          amount: 10000000,
          status: 'pending',
          completionRate: 0,
        },
        {
          id: 'M006',
          name: '解体工事完了',
          dueDate: '2024-09-15',
          amount: 15000000,
          status: 'pending',
          completionRate: 0,
        },
      ],
      changeOrders: [],
    },
    {
      id: 'CON-2024-003',
      projectName: '佐藤様邸リフォーム',
      customer: '佐藤花子',
      contractDate: '2024-06-20',
      startDate: '2024-07-01',
      endDate: '2024-08-20',
      amount: 8500000,
      status: 'completed',
      paymentStatus: 'paid',
      paymentProgress: 100,
      dueDate: '2024-08-31',
      projectType: 'renovation',
      contractType: 'lump_sum',
      profitMargin: 25.8,
      riskLevel: 'low',
      manager: '鈴木一郎',
      lastActivity: '1週間前',
      tags: ['リフォーム', '水回り', '内装'],
      documents: [],
      milestones: [],
      changeOrders: [],
    },
    {
      id: 'CON-2024-004',
      projectName: '鈴木マンション外壁塗装',
      customer: '鈴木不動産管理',
      customerCompany: '鈴木不動産株式会社',
      contractDate: '2024-08-01',
      startDate: '2024-09-01',
      endDate: '2024-10-31',
      amount: 12000000,
      status: 'pending',
      paymentStatus: 'pending',
      paymentProgress: 0,
      dueDate: '2024-11-30',
      projectType: 'repair',
      contractType: 'lump_sum',
      profitMargin: 20.0,
      riskLevel: 'low',
      manager: '高橋美咲',
      lastActivity: '3時間前',
      tags: ['外壁', '塗装', 'マンション'],
      documents: [
        {
          id: 'DOC005',
          name: '見積書_draft.pdf',
          type: 'estimate',
          uploadDate: '2024-07-28',
          size: '980KB',
          status: 'draft',
        },
      ],
      milestones: [],
      changeOrders: [],
    },
    {
      id: 'CON-2024-005',
      projectName: '高橋工場増築工事',
      customer: '高橋製作所',
      customerCompany: '株式会社高橋製作所',
      contractDate: '2024-07-25',
      startDate: '2024-08-15',
      endDate: '2025-03-31',
      amount: 125000000,
      status: 'in_progress',
      paymentStatus: 'partial',
      paymentProgress: 20,
      dueDate: '2025-04-30',
      projectType: 'new_build',
      contractType: 'cost_plus',
      profitMargin: 15.2,
      riskLevel: 'high',
      manager: '山田次郎',
      lastActivity: '30分前',
      tags: ['工場', '増築', '鉄骨造'],
      documents: [],
      milestones: [
        {
          id: 'M007',
          name: '基礎工事',
          dueDate: '2024-09-30',
          amount: 25000000,
          status: 'in_progress',
          completionRate: 60,
        },
      ],
      changeOrders: [
        {
          id: 'CO002',
          description: '排水設備追加',
          amount: 3000000,
          status: 'pending',
          requestDate: '2024-08-05',
        },
        {
          id: 'CO003',
          description: '電気容量増設',
          amount: 2500000,
          status: 'pending',
          requestDate: '2024-08-08',
        },
      ],
      notes: '材料費高騰のリスクあり。月次で原価管理を徹底すること。',
    },
  ];

  // 統計計算
  const stats: ContractStats = useMemo(() => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(
      (c) => c.status === 'in_progress' || c.status === 'signed',
    ).length;
    const totalValue = contracts.reduce((sum, c) => sum + c.amount, 0);
    const receivedAmount = contracts.reduce(
      (sum, c) => sum + (c.amount * c.paymentProgress) / 100,
      0,
    );
    const pendingAmount = totalValue - receivedAmount;
    const overdueAmount = contracts
      .filter((c) => c.paymentStatus === 'overdue')
      .reduce(
        (sum, c) => sum + (c.amount * (100 - c.paymentProgress)) / 100,
        0,
      );
    const avgProfitMargin =
      contracts.reduce((sum, c) => sum + c.profitMargin, 0) / contracts.length;
    const completionRate =
      (contracts.filter((c) => c.status === 'completed').length /
        totalContracts) *
      100;
    const riskContracts = contracts.filter(
      (c) => c.riskLevel === 'high',
    ).length;

    return {
      totalContracts,
      activeContracts,
      totalValue,
      receivedAmount,
      pendingAmount,
      overdueAmount,
      avgProfitMargin,
      completionRate,
      riskContracts,
    };
  }, [contracts]);

  // フィルタリング
  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((c) => c.projectType === selectedType);
    }

    if (selectedRisk !== 'all') {
      filtered = filtered.filter((c) => c.riskLevel === selectedRisk);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.customerCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(
        (c) =>
          c.contractDate >= dateRange.start && c.contractDate <= dateRange.end,
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'date':
          compareValue =
            new Date(a.contractDate).getTime() -
            new Date(b.contractDate).getTime();
          break;
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'customer':
          compareValue = a.customer.localeCompare(b.customer);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [
    contracts,
    selectedStatus,
    selectedType,
    selectedRisk,
    searchTerm,
    dateRange,
    sortBy,
    sortOrder,
  ]);

  const getStatusBadge = (status: Contract['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      signed: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-500',
    };
    const labels = {
      draft: '下書き',
      pending: '承認待ち',
      signed: '契約済',
      in_progress: '進行中',
      completed: '完了',
      cancelled: 'キャンセル',
      expired: '期限切れ',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getPaymentBadge = (status: Contract['paymentStatus']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      partial: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: '未払い',
      partial: '一部入金',
      paid: '完済',
      overdue: '支払遅延',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getRiskBadge = (level: Contract['riskLevel']) => {
    const styles = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    const labels = {
      low: '低',
      medium: '中',
      high: '高',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level]}`}
      >
        リスク: {labels[level]}
      </span>
    );
  };

  const getProjectTypeLabel = (type: Contract['projectType']) => {
    const labels = {
      new_build: '新築',
      renovation: '改修',
      repair: '修繕',
      maintenance: '保守',
    };
    return labels[type];
  };

  const getContractTypeLabel = (type: Contract['contractType']) => {
    const labels = {
      lump_sum: '一括請負',
      unit_price: '単価契約',
      cost_plus: 'コストプラス',
      time_material: '実費精算',
    };
    return labels[type];
  };

  const handleBulkAction = (action: string) => {
    if (selectedContracts.length === 0) {
      alert('契約を選択してください');
      return;
    }
    alert(
      `${selectedContracts.length}件の契約に対して「${action}」を実行します`,
    );
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">契約管理</h1>
              <p className="mt-1 text-sm text-gray-600">
                プロジェクト契約の一元管理と進捗追跡
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ダッシュボード
              </button>
              <button
                onClick={() => router.push('/contracts/electronic')}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
              >
                ⚡ 電子契約管理
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-dandori-blue">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">契約総額</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ¥{stats.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalContracts}件 / 稼働中 {stats.activeContracts}件
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">入金済額</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ¥{stats.receivedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  回収率{' '}
                  {Math.round((stats.receivedAmount / stats.totalValue) * 100)}%
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">未収金額</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  ¥{stats.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  遅延 ¥{stats.overdueAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">平均利益率</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.avgProfitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-red-500 mt-1">
                  高リスク案件 {stats.riskContracts}件
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="契約番号・プロジェクト名・顧客名で検索..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">すべての状態</option>
                  <option value="draft">下書き</option>
                  <option value="pending">承認待ち</option>
                  <option value="signed">契約済</option>
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">すべての種別</option>
                  <option value="new_build">新築</option>
                  <option value="renovation">改修</option>
                  <option value="repair">修繕</option>
                  <option value="maintenance">保守</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dandori-blue/20"
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                >
                  <option value="all">すべてのリスク</option>
                  <option value="low">低リスク</option>
                  <option value="medium">中リスク</option>
                  <option value="high">高リスク</option>
                </select>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  詳細フィルター
                </button>
              </div>
            </div>

            {/* 詳細フィルター */}
            {showAdvancedFilters && (
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    契約日範囲
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                    <span className="self-center">〜</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    並び替え
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="date">契約日</option>
                      <option value="amount">契約金額</option>
                      <option value="customer">顧客名</option>
                      <option value="status">状態</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    表示モード
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-3 py-2 rounded-lg ${viewMode === 'list' ? 'bg-dandori-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      リスト
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-dandori-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      グリッド
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`flex-1 px-3 py-2 rounded-lg ${viewMode === 'kanban' ? 'bg-dandori-blue text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      カンバン
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 一括操作 */}
            {selectedContracts.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm text-blue-700">
                  {selectedContracts.length}件選択中
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm"
                  >
                    エクスポート
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm"
                  >
                    アーカイブ
                  </button>
                  <button
                    onClick={() => setSelectedContracts([])}
                    className="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm"
                  >
                    選択解除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 契約一覧 */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContracts(
                            filteredContracts.map((c) => c.id),
                          );
                        } else {
                          setSelectedContracts([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    契約番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロジェクト名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    契約金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支払状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進捗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    リスク
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContracts.includes(contract.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContracts([
                              ...selectedContracts,
                              contract.id,
                            ]);
                          } else {
                            setSelectedContracts(
                              selectedContracts.filter(
                                (id) => id !== contract.id,
                              ),
                            );
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contract.lastActivity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.projectName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getProjectTypeLabel(contract.projectType)} /{' '}
                        {getContractTypeLabel(contract.contractType)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {contract.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {contract.customer}
                      </div>
                      {contract.customerCompany && (
                        <div className="text-xs text-gray-500">
                          {contract.customerCompany}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{contract.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        利益率 {contract.profitMargin}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(contract.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              contract.paymentProgress === 100
                                ? 'bg-green-500'
                                : contract.paymentProgress > 50
                                  ? 'bg-blue-500'
                                  : contract.paymentProgress > 0
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-300'
                            }`}
                            style={{ width: `${contract.paymentProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {contract.paymentProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(contract.riskLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(`/contracts/${contract.id}`)
                          }
                          className="text-dandori-blue hover:text-dandori-blue-dark"
                        >
                          詳細
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/invoices/create?contractId=${contract.id}`,
                            )
                          }
                          className="text-green-600 hover:text-green-700"
                        >
                          請求
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          編集
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* グリッドビュー */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-gray-500">{contract.id}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">
                      {contract.projectName}
                    </h3>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">顧客</span>
                    <span className="text-sm font-medium">
                      {contract.customer}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">契約金額</span>
                    <span className="text-sm font-medium">
                      ¥{contract.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">工期</span>
                    <span className="text-sm">
                      {contract.startDate} 〜 {contract.endDate}
                    </span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">入金進捗</span>
                      <span className="text-sm font-medium">
                        {contract.paymentProgress}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          contract.paymentProgress === 100
                            ? 'bg-green-500'
                            : contract.paymentProgress > 50
                              ? 'bg-blue-500'
                              : contract.paymentProgress > 0
                                ? 'bg-yellow-500'
                                : 'bg-gray-300'
                        }`}
                        style={{ width: `${contract.paymentProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3">
                    <div className="flex gap-2">
                      {getPaymentBadge(contract.paymentStatus)}
                      {getRiskBadge(contract.riskLevel)}
                    </div>
                    <button
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                      className="text-dandori-blue hover:text-dandori-blue-dark text-sm font-medium"
                    >
                      詳細 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* カンバンビュー */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['draft', 'pending', 'signed', 'in_progress', 'completed'].map(
              (status) => {
                const statusContracts = filteredContracts.filter(
                  (c) => c.status === status,
                );
                const statusLabels = {
                  draft: '下書き',
                  pending: '承認待ち',
                  signed: '契約済',
                  in_progress: '進行中',
                  completed: '完了',
                };

                return (
                  <div key={status} className="flex-shrink-0 w-80">
                    <div className="bg-gray-50 rounded-t-lg p-3">
                      <h3 className="font-semibold text-gray-700">
                        {statusLabels[status as keyof typeof statusLabels]} (
                        {statusContracts.length})
                      </h3>
                    </div>
                    <div className="bg-gray-100 min-h-[600px] p-2 space-y-2">
                      {statusContracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() =>
                            router.push(`/contracts/${contract.id}`)
                          }
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {contract.id}
                          </div>
                          <h4 className="font-medium text-sm mb-2">
                            {contract.projectName}
                          </h4>
                          <div className="text-xs text-gray-600 mb-2">
                            {contract.customer}
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                              契約金額
                            </span>
                            <span className="text-sm font-medium">
                              ¥{(contract.amount / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {getPaymentBadge(contract.paymentStatus)}
                            {getRiskBadge(contract.riskLevel)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
