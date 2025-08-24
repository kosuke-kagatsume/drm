'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  BarChart3,
  TrendingUp,
  Calculator,
  FileText,
  ChevronRight,
  ChevronDown,
  Building2,
  DollarSign,
  Target,
  ArrowRight,
} from 'lucide-react';
import {
  accountingChartService,
  ChartOfAccount,
  AccountType,
  ProfitAnalysisByAccount,
} from '@/services/accounting-chart.service';

export default function AccountingChartPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<
    AccountType | 'all'
  >('all');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set(),
  );
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(
    null,
  );
  const [showProjectSpecific, setShowProjectSpecific] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      loadAccounts();
    }
  }, [user, isLoading]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const accountData = await accountingChartService.getChartOfAccounts();
      setAccounts(accountData);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.includes(searchTerm) ||
      account.nameKana.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedAccountType === 'all' || account.type === selectedAccountType;
    const matchesProjectFilter =
      !showProjectSpecific || account.isProjectSpecific;

    return (
      matchesSearch && matchesType && matchesProjectFilter && account.isActive
    );
  });

  const accountTypeOptions = [
    { value: 'all', label: '全て' },
    { value: 'asset', label: '資産' },
    { value: 'liability', label: '負債' },
    { value: 'equity', label: '純資産' },
    { value: 'revenue', label: '収益' },
    { value: 'cost', label: '原価' },
    { value: 'expense', label: '費用' },
  ];

  const getAccountTypeLabel = (type: AccountType) => {
    const option = accountTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  };

  const getAccountTypeColor = (type: AccountType) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-purple-100 text-purple-800',
      cost: 'bg-orange-100 text-orange-800',
      expense: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const getChildAccounts = (parentId: string) => {
    return filteredAccounts.filter((account) => account.parentId === parentId);
  };

  const hasChildren = (accountId: string) => {
    return filteredAccounts.some((account) => account.parentId === accountId);
  };

  const handleAccountAnalysis = (account: ChartOfAccount) => {
    // 勘定科目別分析画面に遷移
    router.push(
      `/accounting/analysis/${account.id}?name=${encodeURIComponent(account.name)}`,
    );
  };

  const handleProjectAnalysis = (account: ChartOfAccount) => {
    // プロジェクト別管理会計画面に遷移
    router.push(
      `/accounting/project?account=${account.id}&name=${encodeURIComponent(account.name)}`,
    );
  };

  const AccountRow = ({
    account,
    level = 0,
  }: {
    account: ChartOfAccount;
    level?: number;
  }) => {
    const children = getChildAccounts(account.id);
    const isExpanded = expandedAccounts.has(account.id);
    const hasChildAccounts = hasChildren(account.id);

    return (
      <div key={account.id}>
        <div
          className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 ${
            selectedAccount?.id === account.id
              ? 'bg-blue-50 border-blue-200'
              : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => setSelectedAccount(account)}
        >
          <div className="flex items-center space-x-3 flex-grow">
            {hasChildAccounts && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAccountExpansion(account.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildAccounts && <div className="w-6" />}

            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm text-gray-600 min-w-[60px]">
                {account.code}
              </span>
              <div>
                <div className="font-medium text-gray-900">{account.name}</div>
                <div className="text-sm text-gray-500">{account.nameKana}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}
            >
              {getAccountTypeLabel(account.type)}
            </span>

            {account.isProjectSpecific && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                プロジェクト管理
              </span>
            )}

            {account.budgetManaged && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                予算管理
              </span>
            )}

            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountAnalysis(account);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="勘定科目分析"
              >
                <BarChart3 className="h-4 w-4" />
              </button>

              {account.isProjectSpecific && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectAnalysis(account);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="プロジェクト分析"
                >
                  <Building2 className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // 詳細画面への遷移処理
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 子勘定科目を表示 */}
        {hasChildAccounts && isExpanded && (
          <div>
            {children.map((childAccount) => (
              <AccountRow
                key={childAccount.id}
                account={childAccount}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const rootAccounts = filteredAccounts.filter((account) => !account.parentId);
  const projectSpecificAccounts = filteredAccounts.filter(
    (account) => account.isProjectSpecific,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-dandori-blue" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  勘定科目管理
                </h1>
                <p className="text-gray-600 mt-1">
                  建設業界向け管理会計・勘定科目体系
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/accounting/project')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span>プロジェクト別管理会計</span>
              </button>
              <button
                onClick={() => router.push('/accounting/analysis')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>損益分析</span>
              </button>
            </div>
          </div>
        </div>

        {/* クイックアクセス */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() =>
              handleProjectAnalysis({
                isProjectSpecific: true,
              } as ChartOfAccount)
            }
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-8 w-8" />
              <ArrowRight className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">プロジェクト別</h3>
            <p className="text-sm opacity-90">工事別損益管理</p>
          </div>

          <div
            onClick={() => setSelectedAccountType('cost')}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8" />
              <ArrowRight className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">原価管理</h3>
            <p className="text-sm opacity-90">工事原価分析</p>
          </div>

          <div
            onClick={() => setSelectedAccountType('revenue')}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8" />
              <ArrowRight className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">売上分析</h3>
            <p className="text-sm opacity-90">完成工事高分析</p>
          </div>

          <div
            onClick={() => setShowProjectSpecific(!showProjectSpecific)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8" />
              <ArrowRight className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">予算管理</h3>
            <p className="text-sm opacity-90">予算vs実績分析</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-grow min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="勘定科目名、コード、カナで検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={selectedAccountType}
              onChange={(e) =>
                setSelectedAccountType(e.target.value as AccountType | 'all')
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {accountTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showProjectSpecific}
                onChange={(e) => setShowProjectSpecific(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                プロジェクト管理対象のみ
              </span>
            </label>

            <div className="text-sm text-gray-600">
              {filteredAccounts.length}件 / {accounts.length}件
            </div>
          </div>
        </div>

        {/* 勘定科目一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              勘定科目一覧
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {rootAccounts.length > 0 ? (
              rootAccounts.map((account) => (
                <AccountRow key={account.id} account={account} level={0} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>該当する勘定科目が見つかりません</p>
                <p className="text-sm">検索条件を変更してお試しください</p>
              </div>
            )}
          </div>
        </div>

        {/* プロジェクト別管理対象勘定科目サマリー */}
        {projectSpecificAccounts.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-green-600" />
                プロジェクト別管理対象勘定科目
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectSpecificAccounts.slice(0, 6).map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleProjectAnalysis(account)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-gray-600">
                        {account.code}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}
                      >
                        {getAccountTypeLabel(account.type)}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {account.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {account.description}
                    </p>
                  </div>
                ))}
              </div>

              {projectSpecificAccounts.length > 6 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowProjectSpecific(true)}
                    className="text-dandori-blue hover:text-dandori-blue-dark"
                  >
                    すべて表示（{projectSpecificAccounts.length}件）→
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
