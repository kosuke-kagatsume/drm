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

  // Sample data adapted to Dark Elegant theme
  const contracts: Contract[] = [
    {
      id: 'CON-2024-001',
      projectName: 'TANAKA RESIDENCE NEW CONSTRUCTION',
      customer: 'TANAKA TARO',
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
      manager: 'YAMADA JIRO',
      lastActivity: '2 HOURS AGO',
      tags: ['NEW BUILD', 'WOODEN', 'RESIDENTIAL'],
      documents: [
        {
          id: 'DOC001',
          name: 'CONSTRUCTION CONTRACT.PDF',
          type: 'contract',
          uploadDate: '2024-07-01',
          size: '2.5MB',
          status: 'signed',
        },
        {
          id: 'DOC002',
          name: 'ESTIMATE.PDF',
          type: 'estimate',
          uploadDate: '2024-06-25',
          size: '1.2MB',
          status: 'approved',
        },
        {
          id: 'DOC003',
          name: 'BLUEPRINTS.PDF',
          type: 'drawing',
          uploadDate: '2024-06-20',
          size: '15.8MB',
          status: 'approved',
        },
      ],
      milestones: [
        {
          id: 'M001',
          name: 'FOUNDATION COMPLETION',
          dueDate: '2024-08-15',
          amount: 8000000,
          status: 'completed',
          completionRate: 100,
        },
        {
          id: 'M002',
          name: 'ROOF RAISING',
          dueDate: '2024-09-30',
          amount: 12000000,
          status: 'in_progress',
          completionRate: 75,
        },
        {
          id: 'M003',
          name: 'EXTERIOR COMPLETION',
          dueDate: '2024-11-15',
          amount: 8000000,
          status: 'pending',
          completionRate: 0,
        },
        {
          id: 'M004',
          name: 'HANDOVER',
          dueDate: '2024-12-15',
          amount: 7000000,
          status: 'pending',
          completionRate: 0,
        },
      ],
      changeOrders: [
        {
          id: 'CO001',
          description: 'KITCHEN SPECIFICATION CHANGE',
          amount: 500000,
          status: 'approved',
          requestDate: '2024-08-10',
        },
      ],
    },
    {
      id: 'CON-2024-002',
      projectName: 'YAMADA BUILDING RENOVATION',
      customer: 'YAMADA TRADING CO LTD',
      customerCompany: 'YAMADA TRADING CO LTD',
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
      manager: 'SATO KENICHI',
      lastActivity: '1 DAY AGO',
      tags: ['RENOVATION', 'BUILDING', 'COMMERCIAL'],
      documents: [
        {
          id: 'DOC004',
          name: 'CONSTRUCTION CONTRACT.PDF',
          type: 'contract',
          uploadDate: '2024-07-15',
          size: '3.1MB',
          status: 'signed',
        },
      ],
      milestones: [
        {
          id: 'M005',
          name: 'CONSTRUCTION START',
          dueDate: '2024-08-01',
          amount: 10000000,
          status: 'pending',
          completionRate: 0,
        },
        {
          id: 'M006',
          name: 'DEMOLITION COMPLETION',
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
      projectName: 'SATO RESIDENCE RENOVATION',
      customer: 'SATO HANAKO',
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
      manager: 'SUZUKI ICHIRO',
      lastActivity: '1 WEEK AGO',
      tags: ['RENOVATION', 'PLUMBING', 'INTERIOR'],
      documents: [],
      milestones: [],
      changeOrders: [],
    },
    {
      id: 'CON-2024-004',
      projectName: 'SUZUKI APARTMENT EXTERIOR PAINTING',
      customer: 'SUZUKI PROPERTY MANAGEMENT',
      customerCompany: 'SUZUKI REAL ESTATE CO LTD',
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
      manager: 'TAKAHASHI MISAKI',
      lastActivity: '3 HOURS AGO',
      tags: ['EXTERIOR', 'PAINTING', 'APARTMENT'],
      documents: [
        {
          id: 'DOC005',
          name: 'ESTIMATE_DRAFT.PDF',
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
      projectName: 'TAKAHASHI FACTORY EXPANSION',
      customer: 'TAKAHASHI MANUFACTURING',
      customerCompany: 'TAKAHASHI MANUFACTURING CO LTD',
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
      manager: 'YAMADA JIRO',
      lastActivity: '30 MINUTES AGO',
      tags: ['FACTORY', 'EXPANSION', 'STEEL STRUCTURE'],
      documents: [],
      milestones: [
        {
          id: 'M007',
          name: 'FOUNDATION WORK',
          dueDate: '2024-09-30',
          amount: 25000000,
          status: 'in_progress',
          completionRate: 60,
        },
      ],
      changeOrders: [
        {
          id: 'CO002',
          description: 'ADDITIONAL DRAINAGE SYSTEM',
          amount: 3000000,
          status: 'pending',
          requestDate: '2024-08-05',
        },
        {
          id: 'CO003',
          description: 'ELECTRICAL CAPACITY UPGRADE',
          amount: 2500000,
          status: 'pending',
          requestDate: '2024-08-08',
        },
      ],
      notes: 'MATERIAL COST INFLATION RISK. MONTHLY COST MANAGEMENT REQUIRED.',
    },
  ];

  // Statistics calculation
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

  // Filtering
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

    // Sorting
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
      draft: {
        color: 'text-zinc-500 border-zinc-600',
        label: 'DRAFT',
        indicator: '01',
      },
      pending: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'PENDING',
        indicator: '02',
      },
      signed: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'SIGNED',
        indicator: '03',
      },
      in_progress: {
        color: 'text-purple-500 border-purple-500/50',
        label: 'IN PROGRESS',
        indicator: '04',
      },
      completed: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'COMPLETED',
        indicator: '05',
      },
      cancelled: {
        color: 'text-red-500 border-red-500/50',
        label: 'CANCELLED',
        indicator: '06',
      },
      expired: {
        color: 'text-zinc-600 border-zinc-700',
        label: 'EXPIRED',
        indicator: '07',
      },
    };
    const config = styles[status];
    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getPaymentBadge = (status: Contract['paymentStatus']) => {
    const styles = {
      pending: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'PENDING',
        indicator: '01',
      },
      partial: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'PARTIAL',
        indicator: '02',
      },
      paid: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'PAID',
        indicator: '03',
      },
      overdue: {
        color: 'text-red-500 border-red-500/50',
        label: 'OVERDUE',
        indicator: '04',
      },
    };
    const config = styles[status];
    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getRiskBadge = (level: Contract['riskLevel']) => {
    const styles = {
      low: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'LOW',
        indicator: '01',
      },
      medium: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'MEDIUM',
        indicator: '02',
      },
      high: {
        color: 'text-red-500 border-red-500/50',
        label: 'HIGH',
        indicator: '03',
      },
    };
    const config = styles[level];
    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>RISK:</span>
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getProjectTypeLabel = (type: Contract['projectType']) => {
    const labels = {
      new_build: 'NEW BUILD',
      renovation: 'RENOVATION',
      repair: 'REPAIR',
      maintenance: 'MAINTENANCE',
    };
    return labels[type];
  };

  const getContractTypeLabel = (type: Contract['contractType']) => {
    const labels = {
      lump_sum: 'LUMP SUM',
      unit_price: 'UNIT PRICE',
      cost_plus: 'COST PLUS',
      time_material: 'TIME & MATERIAL',
    };
    return labels[type];
  };

  const handleBulkAction = (action: string) => {
    if (selectedContracts.length === 0) {
      alert('SELECT CONTRACTS FIRST');
      return;
    }
    alert(`EXECUTING "${action}" ON ${selectedContracts.length} CONTRACTS`);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                CONTRACT MANAGEMENT
              </h1>
              <p className="mt-1 text-xs text-zinc-500 tracking-wider">
                CENTRALIZED PROJECT CONTRACT MANAGEMENT AND PROGRESS TRACKING
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="px-4 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <button
                onClick={() => router.push('/dark/contracts/new')}
                className="px-6 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                NEW CONTRACT
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  TOTAL CONTRACT VALUE
                </p>
                <p className="text-2xl font-thin text-white mt-1">
                  ¥{stats.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 mt-1 tracking-wider">
                  {stats.totalContracts} CONTRACTS / {stats.activeContracts}{' '}
                  ACTIVE
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                01
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  RECEIVED AMOUNT
                </p>
                <p className="text-2xl font-thin text-emerald-500 mt-1">
                  ¥{stats.receivedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 mt-1 tracking-wider">
                  COLLECTION RATE{' '}
                  {Math.round((stats.receivedAmount / stats.totalValue) * 100)}%
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                02
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  OUTSTANDING AMOUNT
                </p>
                <p className="text-2xl font-thin text-amber-500 mt-1">
                  ¥{stats.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-red-500 mt-1 tracking-wider">
                  OVERDUE ¥{stats.overdueAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                03
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  AVERAGE PROFIT MARGIN
                </p>
                <p className="text-2xl font-thin text-purple-500 mt-1">
                  {stats.avgProfitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-red-500 mt-1 tracking-wider">
                  HIGH RISK {stats.riskContracts} CONTRACTS
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                04
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="SEARCH BY CONTRACT NUMBER, PROJECT NAME, CUSTOMER..."
                  className="w-full px-4 py-2 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">ALL STATUS</option>
                  <option value="draft">DRAFT</option>
                  <option value="pending">PENDING</option>
                  <option value="signed">SIGNED</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>

                <select
                  className="px-4 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">ALL TYPES</option>
                  <option value="new_build">NEW BUILD</option>
                  <option value="renovation">RENOVATION</option>
                  <option value="repair">REPAIR</option>
                  <option value="maintenance">MAINTENANCE</option>
                </select>

                <select
                  className="px-4 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                >
                  <option value="all">ALL RISK LEVELS</option>
                  <option value="low">LOW RISK</option>
                  <option value="medium">MEDIUM RISK</option>
                  <option value="high">HIGH RISK</option>
                </select>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                >
                  ADVANCED FILTERS
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t border-zinc-800 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-1">
                    CONTRACT DATE RANGE
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                    <span className="self-center text-zinc-500">—</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-1">
                    SORT BY
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    >
                      <option value="date">CONTRACT DATE</option>
                      <option value="amount">CONTRACT AMOUNT</option>
                      <option value="customer">CUSTOMER NAME</option>
                      <option value="status">STATUS</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      className="px-3 py-2 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors text-xs"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-1">
                    VIEW MODE
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-3 py-2 text-xs tracking-wider transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white border border-zinc-800'}`}
                    >
                      LIST
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 px-3 py-2 text-xs tracking-wider transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white border border-zinc-800'}`}
                    >
                      GRID
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`flex-1 px-3 py-2 text-xs tracking-wider transition-colors ${viewMode === 'kanban' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white border border-zinc-800'}`}
                    >
                      KANBAN
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedContracts.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 p-3 flex justify-between items-center">
                <span className="text-xs text-zinc-400 tracking-wider">
                  {selectedContracts.length} CONTRACTS SELECTED
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('EXPORT')}
                    className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-xs tracking-wider"
                  >
                    EXPORT
                  </button>
                  <button
                    onClick={() => handleBulkAction('ARCHIVE')}
                    className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-xs tracking-wider"
                  >
                    ARCHIVE
                  </button>
                  <button
                    onClick={() => setSelectedContracts([])}
                    className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-xs tracking-wider"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contract List */}
        {viewMode === 'list' && (
          <div className="bg-zinc-950 border border-zinc-800">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
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
                      className="rounded bg-black border-zinc-700"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    CONTRACT NUMBER
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    PROJECT NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    CUSTOMER
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    CONTRACT AMOUNT
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    PAYMENT STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    PROGRESS
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    RISK
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
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
                        className="rounded bg-black border-zinc-700"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-light text-white tracking-wider">
                        {contract.id}
                      </div>
                      <div className="text-xs text-zinc-500 tracking-wider">
                        {contract.lastActivity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-light text-white tracking-wider">
                        {contract.projectName}
                      </div>
                      <div className="text-xs text-zinc-500 tracking-wider">
                        {getProjectTypeLabel(contract.projectType)} /{' '}
                        {getContractTypeLabel(contract.contractType)}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {contract.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-zinc-600 tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white tracking-wider">
                        {contract.customer}
                      </div>
                      {contract.customerCompany && (
                        <div className="text-xs text-zinc-500 tracking-wider">
                          {contract.customerCompany}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-light text-white">
                        ¥{contract.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500 tracking-wider">
                        MARGIN {contract.profitMargin}%
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
                        <div className="flex-1 bg-zinc-900 h-1 mr-2 max-w-[100px]">
                          <div
                            className={`h-1 transition-all duration-300 ${
                              contract.paymentProgress === 100
                                ? 'bg-emerald-500/50'
                                : contract.paymentProgress > 50
                                  ? 'bg-blue-500/50'
                                  : contract.paymentProgress > 0
                                    ? 'bg-amber-500/50'
                                    : 'bg-zinc-700'
                            }`}
                            style={{ width: `${contract.paymentProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400 tracking-wider">
                          {contract.paymentProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(contract.riskLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(`/dark/contracts/${contract.id}`)
                          }
                          className="text-zinc-500 hover:text-white transition-colors tracking-wider"
                        >
                          DETAILS
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/dark/invoices/create?contractId=${contract.id}`,
                            )
                          }
                          className="text-emerald-500 hover:text-emerald-400 transition-colors tracking-wider"
                        >
                          INVOICE
                        </button>
                        <button className="text-zinc-500 hover:text-white transition-colors tracking-wider">
                          EDIT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-zinc-500 tracking-wider">
                      {contract.id}
                    </div>
                    <h3 className="text-sm font-light text-white mt-1 tracking-wider">
                      {contract.projectName}
                    </h3>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      CUSTOMER
                    </span>
                    <span className="text-xs font-light text-white tracking-wider">
                      {contract.customer}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      CONTRACT AMOUNT
                    </span>
                    <span className="text-xs font-light text-white">
                      ¥{contract.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 tracking-wider">
                      PERIOD
                    </span>
                    <span className="text-xs text-zinc-400 tracking-wider">
                      {contract.startDate} — {contract.endDate}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-zinc-500 tracking-wider">
                        PAYMENT PROGRESS
                      </span>
                      <span className="text-xs font-light text-white">
                        {contract.paymentProgress}%
                      </span>
                    </div>
                    <div className="bg-zinc-900 h-1">
                      <div
                        className={`h-1 ${
                          contract.paymentProgress === 100
                            ? 'bg-emerald-500/50'
                            : contract.paymentProgress > 50
                              ? 'bg-blue-500/50'
                              : contract.paymentProgress > 0
                                ? 'bg-amber-500/50'
                                : 'bg-zinc-700'
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
                      onClick={() =>
                        router.push(`/dark/contracts/${contract.id}`)
                      }
                      className="text-zinc-500 hover:text-white text-xs font-light tracking-wider transition-colors"
                    >
                      DETAILS →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['draft', 'pending', 'signed', 'in_progress', 'completed'].map(
              (status) => {
                const statusContracts = filteredContracts.filter(
                  (c) => c.status === status,
                );
                const statusLabels = {
                  draft: 'DRAFT',
                  pending: 'PENDING',
                  signed: 'SIGNED',
                  in_progress: 'IN PROGRESS',
                  completed: 'COMPLETED',
                };

                return (
                  <div key={status} className="flex-shrink-0 w-80">
                    <div className="bg-zinc-900 border border-zinc-800 p-3">
                      <h3 className="text-xs font-normal text-white tracking-widest">
                        {statusLabels[status as keyof typeof statusLabels]} (
                        {statusContracts.length})
                      </h3>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 border-t-0 min-h-[600px] p-2 space-y-2">
                      {statusContracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="bg-black border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/dark/contracts/${contract.id}`)
                          }
                        >
                          <div className="text-xs text-zinc-500 mb-1 tracking-wider">
                            {contract.id}
                          </div>
                          <h4 className="font-light text-xs mb-2 text-white tracking-wider">
                            {contract.projectName}
                          </h4>
                          <div className="text-xs text-zinc-400 mb-2 tracking-wider">
                            {contract.customer}
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-zinc-500 tracking-wider">
                              AMOUNT
                            </span>
                            <span className="text-xs font-light text-white">
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

        {/* Empty State */}
        {filteredContracts.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 p-12 text-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-sm mx-auto mb-4">
              00
            </div>
            <p className="text-zinc-500 mb-4 tracking-wider">
              NO MATCHING CONTRACTS FOUND
            </p>
            <button
              onClick={() => router.push('/dark/contracts/new')}
              className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              CREATE NEW CONTRACT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
