'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrganization } from '@/hooks/useOrganization';
import { Customer, CustomerStatus } from '@/types/customer';

// Customer interface now imported from types

interface RecentAction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'call' | 'email' | 'meeting' | 'chat' | 'line' | 'note';
  content: string;
  date: string;
  by: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { branches, loading: orgLoading } = useOrganization();
  const [selectedView, setSelectedView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Use the customers hook
  const {
    customers,
    loading: customersLoading,
    error: customersError,
    total,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers({
    filter: {
      search: searchTerm || undefined,
      status:
        filterStatus !== 'all' ? [filterStatus as CustomerStatus] : undefined,
    },
  });

  // Mock data fallback when API is not available
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: '田中太郎',
      company: '田中建設株式会社',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
      status: 'customer',
      lastContact: '2024-02-10',
      nextAction: '見積もりフォローアップ',
      value: 2500000,
      tags: ['外壁塗装', 'リピーター'],
      assignee: '山田花子',
      departmentId: 'tokyo-sales',
      departmentName: '営業部',
      branchId: 'tokyo',
      branchName: '東京支店',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-02-10T14:30:00Z',
      createdBy: 'system',
    } as Customer,
    {
      id: '2',
      name: '佐藤美咲',
      company: '',
      email: 'sato@example.com',
      phone: '080-9876-5432',
      status: 'prospect',
      lastContact: '2024-02-12',
      nextAction: '初回訪問予定',
      value: 0,
      tags: ['屋根工事', '新規'],
      assignee: '鈴木一郎',
      departmentId: 'osaka-sales',
      departmentName: '営業部',
      branchId: 'osaka',
      branchName: '大阪支店',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-12T16:00:00Z',
      createdBy: 'suzuki',
    } as Customer,
    {
      id: '3',
      name: '鈴木商事',
      company: '鈴木商事株式会社',
      email: 'info@suzuki.co.jp',
      phone: '03-1234-5678',
      status: 'lead',
      lastContact: '2024-02-08',
      nextAction: '資料送付',
      value: 0,
      tags: ['法人', '大型案件'],
      assignee: '山田花子',
      departmentId: 'tokyo-sales',
      departmentName: '営業部',
      branchId: 'tokyo',
      branchName: '東京支店',
      createdAt: '2024-02-05T11:00:00Z',
      updatedAt: '2024-02-08T13:00:00Z',
      createdBy: 'yamada',
    } as Customer,
  ];

  // Use API data if available, fallback to mock data
  const displayCustomers = customers.length > 0 ? customers : mockCustomers;

  const recentActions: RecentAction[] = [
    {
      id: '1',
      customerId: '1',
      customerName: '田中太郎',
      type: 'meeting',
      content: '見積もり内容について打ち合わせ。予算調整の相談あり。',
      date: '2024-02-10 14:00',
      by: '山田花子',
    },
    {
      id: '2',
      customerId: '2',
      customerName: '佐藤美咲',
      type: 'email',
      content: '見積書を送付。来週の訪問日程を調整中。',
      date: '2024-02-12 10:30',
      by: '鈴木一郎',
    },
    {
      id: '3',
      customerId: '1',
      customerName: '田中太郎',
      type: 'chat',
      content: 'チャットワークで工期について質問あり。回答済み。',
      date: '2024-02-11 16:45',
      by: '山田花子',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      lead: {
        label: 'リード',
        class: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
      },
      prospect: {
        label: '見込み客',
        class: 'bg-gradient-to-r from-dandori-blue to-dandori-sky text-white',
      },
      customer: {
        label: '顧客',
        class: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      },
      inactive: {
        label: '休眠',
        class:
          'bg-gradient-to-r from-dandori-pink to-dandori-orange text-white',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.lead;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'meeting':
        return '🤝';
      case 'chat':
        return '💬';
      case 'line':
        return '📱';
      case 'note':
        return '📝';
      default:
        return '📌';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 担当者の一覧を抽出
  const uniqueAssignees = Array.from(
    new Set(displayCustomers.map((c) => c.assignee).filter(Boolean)),
  ).sort();

  const filteredCustomers = displayCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || customer.status === filterStatus;
    const matchesBranch =
      filterBranch === 'all' || customer.branchId === filterBranch;
    const matchesAssignee =
      filterAssignee === 'all' || customer.assignee === filterAssignee;
    return matchesSearch && matchesStatus && matchesBranch && matchesAssignee;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Gradient */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← ダッシュボード
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <span className="text-4xl mr-3">👥</span>
                  顧客管理センター
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  {user?.role === 'sales'
                    ? '営業活動の中心'
                    : user?.role === 'manager'
                      ? '支店顧客の統括管理'
                      : '全社顧客データベース'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/customers/segmentation')}
                className="bg-white/10 border-2 border-white/30 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/20 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">📊</span>
                セグメント分析
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-dandori-blue px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-lg mr-2">+</span>
                新規顧客登録
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* Quick Stats - Animated Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">👥</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                +5
              </span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">
              {displayCustomers.length}
            </h4>
            <p className="text-sm text-gray-600">総顧客数</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✨</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                35%
              </span>
            </div>
            <h4 className="text-2xl font-bold">
              {displayCustomers.filter((c) => c.status === 'customer').length}
            </h4>
            <p className="text-sm text-white/90">アクティブ顧客</p>
          </div>

          <div className="bg-gradient-to-br from-dandori-blue to-dandori-sky text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📈</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">
                本日
              </span>
            </div>
            <h4 className="text-2xl font-bold">12</h4>
            <p className="text-sm text-white/90">今日のアクション</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="text-3xl mb-2">💰</div>
            <h4 className="text-2xl font-bold">
              ¥
              {(
                displayCustomers.reduce((sum, c) => sum + c.value, 0) / 1000000
              ).toFixed(1)}
              M
            </h4>
            <p className="text-sm text-white/90">顧客価値合計</p>
          </div>
        </div>

        {/* View Selector with Better Design */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedView('list')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    selectedView === 'list'
                      ? 'bg-gradient-dandori text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">📋</span>
                  リスト表示
                </button>
                <button
                  onClick={() => setSelectedView('kanban')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    selectedView === 'kanban'
                      ? 'bg-gradient-dandori text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">📊</span>
                  カンバン表示
                </button>
                <button
                  onClick={() => setSelectedView('timeline')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    selectedView === 'timeline'
                      ? 'bg-gradient-dandori text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">⏰</span>
                  タイムライン
                </button>
              </div>

              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 顧客を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 w-64"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
                >
                  <option value="all">🎯 全てのステータス</option>
                  <option value="lead">📍 リード</option>
                  <option value="prospect">🎯 見込み客</option>
                  <option value="customer">⭐ 顧客</option>
                  <option value="inactive">💤 休眠</option>
                </select>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
                >
                  <option value="all">🏢 全ての支店</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent transition-all duration-200 font-medium"
                >
                  <option value="all">👤 全ての担当者</option>
                  {uniqueAssignees.map((assignee) => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List View - Enhanced */}
        {selectedView === 'list' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      顧客情報
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      活動状況
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      担当部署
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      担当者
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gradient-to-r hover:from-dandori-blue/5 hover:to-dandori-sky/5 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 ${
                              customer.status === 'customer'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                : customer.status === 'prospect'
                                  ? 'bg-gradient-to-br from-dandori-blue to-dandori-sky'
                                  : customer.status === 'lead'
                                    ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                    : 'bg-gradient-to-br from-dandori-pink to-dandori-orange'
                            }`}
                          >
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {customer.name}
                            </div>
                            {customer.company && (
                              <div className="text-sm text-gray-500">
                                {customer.company}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(customer.tags || [])
                                .slice(0, 2)
                                .map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-dandori-blue/10 text-dandori-blue text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-700">
                            <span className="mr-2">📧</span>
                            {customer.email}
                          </div>
                          <div className="flex items-center text-gray-500 mt-1">
                            <span className="mr-2">📞</span>
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-700">
                            <span className="text-xs text-gray-500">
                              最終接触:
                            </span>
                            <span className="ml-1 font-medium">
                              {new Date(
                                customer.lastContact,
                              ).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          {customer.nextAction && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-1 bg-dandori-yellow/20 text-dandori-orange text-xs rounded-full">
                                <span className="mr-1">→</span>
                                {customer.nextAction}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {customer.branchName || '未設定'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {customer.departmentName || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                            {customer.assignee.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">
                            {customer.assignee}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/customers/${customer.id}`);
                            }}
                            className="px-3 py-1.5 bg-gradient-dandori text-white text-xs rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            詳細
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-dandori-blue transition-colors">
                            📝
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kanban View */}
        {selectedView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['lead', 'prospect', 'customer', 'inactive'].map((status) => (
              <div key={status} className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold mb-3">
                  {getStatusBadge(status)}
                  <span className="ml-2 text-sm text-gray-600">
                    (
                    {
                      filteredCustomers.filter((c) => c.status === status)
                        .length
                    }
                    )
                  </span>
                </h3>
                <div className="space-y-3">
                  {filteredCustomers
                    .filter((c) => c.status === status)
                    .map((customer) => (
                      <div
                        key={customer.id}
                        className="bg-white p-3 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                        onClick={() => router.push(`/customers/${customer.id}`)}
                      >
                        <h4 className="font-medium text-sm">{customer.name}</h4>
                        {customer.company && (
                          <p className="text-xs text-gray-500">
                            {customer.company}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {customer.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {customer.nextAction && (
                          <p className="text-xs text-blue-600 mt-2">
                            → {customer.nextAction}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline View */}
        {selectedView === 'timeline' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📅 最近のアクション</h3>
            <div className="space-y-4">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start space-x-3 pb-4 border-b"
                >
                  <div className="text-2xl">{getActionIcon(action.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        <button
                          onClick={() =>
                            router.push(`/customers/${action.customerId}`)
                          }
                          className="text-blue-600 hover:underline"
                        >
                          {action.customerName}
                        </button>
                      </h4>
                      <span className="text-sm text-gray-500">
                        {action.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      担当: {action.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Quick View Modal */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
            onClick={() => setSelectedCustomer(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedCustomer.name}
                  </h3>
                  {selectedCustomer.company && (
                    <p className="text-gray-600">{selectedCustomer.company}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    連絡先
                  </h4>
                  <p className="text-sm">📧 {selectedCustomer.email}</p>
                  <p className="text-sm mt-1">📞 {selectedCustomer.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    ステータス
                  </h4>
                  <div className="mb-2">
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    担当: {selectedCustomer.assignee}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    router.push(`/customers/${selectedCustomer.id}`)
                  }
                  className="flex-1 py-3 bg-gradient-dandori text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  詳細を見る
                </button>
                <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  メッセージ送信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">新規顧客登録</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メール
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="lead">リード</option>
                  <option value="prospect">見込み客</option>
                  <option value="customer">顧客</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                登録
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
