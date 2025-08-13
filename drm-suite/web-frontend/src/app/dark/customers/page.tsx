'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  lastContact: string;
  nextAction?: string;
  value: number;
  tags: string[];
  assignee: string;
}

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
  const [selectedView, setSelectedView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const customers: Customer[] = [
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
    },
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
    },
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
    },
  ];

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
      lead: { label: 'LEAD', color: 'text-zinc-500' },
      prospect: { label: 'PROSPECT', color: 'text-blue-500' },
      customer: { label: 'CUSTOMER', color: 'text-emerald-500' },
      inactive: { label: 'INACTIVE', color: 'text-amber-500' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.lead;
    return (
      <span className={`text-xs font-light tracking-wider ${config.color}`}>
        ● {config.label}
      </span>
    );
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

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="text-zinc-500 hover:text-white transition-colors text-sm tracking-wider"
              >
                ← DASHBOARD
              </button>
              <div className="w-px h-6 bg-zinc-800"></div>
              <div>
                <h1 className="text-2xl font-thin text-white tracking-widest">
                  CUSTOMER DATABASE
                </h1>
                <p className="text-xs text-zinc-500 mt-2 tracking-wider">
                  {user?.role === 'sales'
                    ? 'SALES CRM SYSTEM'
                    : user?.role === 'manager'
                      ? 'BRANCH MANAGEMENT'
                      : 'EXECUTIVE OVERVIEW'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-8 py-3 text-sm font-medium tracking-wider hover:bg-zinc-200 transition-colors"
            >
              ADD NEW
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6 mb-8">
          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">TOTAL</p>
            <h4 className="text-4xl font-thin text-white">
              {customers.length}
            </h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-emerald-500">+5</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">ACTIVE</p>
            <h4 className="text-4xl font-thin text-white">
              {customers.filter((c) => c.status === 'customer').length}
            </h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-emerald-500">35%</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">TODAY</p>
            <h4 className="text-4xl font-thin text-white">12</h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-500">ACTIONS</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <p className="text-xs text-zinc-500 tracking-wider mb-2">
              TOTAL VALUE
            </p>
            <h4 className="text-4xl font-thin text-white">
              ¥
              {(
                customers.reduce((sum, c) => sum + c.value, 0) / 1000000
              ).toFixed(1)}
              M
            </h4>
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-purple-500">+18.9%</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-xs tracking-wider">
              <button
                onClick={() => setSelectedView('list')}
                className={`px-4 py-2 transition-colors ${
                  selectedView === 'list'
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                LIST VIEW
              </button>
              <div className="w-px h-4 bg-zinc-800"></div>
              <button
                onClick={() => setSelectedView('kanban')}
                className={`px-4 py-2 transition-colors ${
                  selectedView === 'kanban'
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                KANBAN
              </button>
              <div className="w-px h-4 bg-zinc-800"></div>
              <button
                onClick={() => setSelectedView('timeline')}
                className={`px-4 py-2 transition-colors ${
                  selectedView === 'timeline'
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                TIMELINE
              </button>
            </div>

            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH DATABASE"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-600 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-6 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 text-sm tracking-wider"
              >
                <option value="all">ALL STATUS</option>
                <option value="lead">LEAD</option>
                <option value="prospect">PROSPECT</option>
                <option value="customer">ACTIVE</option>
                <option value="inactive">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        {/* List View - Dark Elegant */}
        {selectedView === 'list' && (
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-normal text-zinc-500 tracking-widest">
                      CUSTOMER
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-normal text-zinc-500 tracking-widest">
                      CONTACT
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-normal text-zinc-500 tracking-widest">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-normal text-zinc-500 tracking-widest">
                      ACTIVITY
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-normal text-zinc-500 tracking-widest">
                      ASSIGNEE
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-normal text-zinc-500 tracking-widest">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredCustomers.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-zinc-900/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-lg mr-4">
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <div className="text-white font-light">
                              {customer.name}
                            </div>
                            {customer.company && (
                              <div className="text-xs text-zinc-500 tracking-wider mt-1">
                                {customer.company.toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {customer.tags.slice(0, 2).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs text-zinc-600 tracking-wider"
                                >
                                  {tag.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          <div className="text-zinc-400 text-xs tracking-wider">
                            {customer.email}
                          </div>
                          <div className="text-zinc-500 text-xs tracking-wider mt-1">
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`text-xs font-light tracking-wider ${
                            customer.status === 'customer'
                              ? 'text-emerald-500'
                              : customer.status === 'prospect'
                                ? 'text-blue-500'
                                : customer.status === 'lead'
                                  ? 'text-zinc-500'
                                  : 'text-amber-500'
                          }`}
                        >
                          ● {customer.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs">
                          <div className="text-zinc-400 tracking-wider">
                            <span className="text-zinc-600">LAST:</span>
                            <span className="ml-2">
                              {new Date(customer.lastContact)
                                .toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                                .toUpperCase()}
                            </span>
                          </div>
                          {customer.nextAction && (
                            <div className="mt-1 text-zinc-600 tracking-wider">
                              → {customer.nextAction.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-zinc-400 tracking-wider">
                          {customer.assignee.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dark/customers/${customer.id}`);
                            }}
                            className="text-zinc-600 hover:text-white transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
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

        {/* Kanban View - Dark Elegant */}
        {selectedView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['lead', 'prospect', 'customer', 'inactive'].map((status) => (
              <div
                key={status}
                className="bg-zinc-950 border border-zinc-800 p-4"
              >
                <h3 className="text-xs font-normal text-zinc-500 tracking-widest mb-4">
                  {status.toUpperCase()}
                  <span className="ml-2 text-zinc-600">
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
                        className="bg-black border border-zinc-800 p-4 cursor-pointer hover:border-zinc-700 transition-colors"
                        onClick={() => router.push(`/customers/${customer.id}`)}
                      >
                        <h4 className="text-white font-light text-sm">
                          {customer.name}
                        </h4>
                        {customer.company && (
                          <p className="text-xs text-zinc-500 tracking-wider mt-1">
                            {customer.company.toUpperCase()}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {customer.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs text-zinc-600 tracking-wider"
                            >
                              {tag.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        {customer.nextAction && (
                          <p className="text-xs text-zinc-500 mt-3">
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

        {/* Timeline View - Dark Elegant */}
        {selectedView === 'timeline' && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h3 className="text-sm font-normal text-white tracking-widest mb-6">
              RECENT ACTIVITY
            </h3>
            <div className="space-y-0 divide-y divide-zinc-800">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start space-x-4 py-5"
                >
                  <div className="w-px h-full bg-zinc-800"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-light">
                        <button
                          onClick={() =>
                            router.push(`/customers/${action.customerId}`)
                          }
                          className="hover:text-zinc-400 transition-colors"
                        >
                          {action.customerName}
                        </button>
                      </h4>
                      <span className="text-xs text-zinc-600 tracking-wider">
                        {new Date(action.date)
                          .toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          .toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-2">
                      {action.content}
                    </p>
                    <p className="text-xs text-zinc-600 tracking-wider mt-2">
                      BY: {action.by.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Quick View Modal - Dark Elegant */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40"
            onClick={() => setSelectedCustomer(null)}
          >
            <div
              className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-normal text-white tracking-widest">
                      CUSTOMER PROFILE
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 tracking-wider">
                      ID: CUS-{selectedCustomer.id.padStart(6, '0')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start space-x-6 mb-8">
                  <div className="w-20 h-20 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-2xl">
                    {filteredCustomers.findIndex(
                      (c) => c.id === selectedCustomer.id,
                    ) + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-thin text-white">
                      {selectedCustomer.name}
                    </h4>
                    {selectedCustomer.company && (
                      <p className="text-sm text-zinc-500 tracking-wider mt-1">
                        {selectedCustomer.company.toUpperCase()}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-4">
                      <span
                        className={`text-xs tracking-wider ${
                          selectedCustomer.status === 'customer'
                            ? 'text-emerald-500'
                            : selectedCustomer.status === 'prospect'
                              ? 'text-blue-500'
                              : selectedCustomer.status === 'lead'
                                ? 'text-zinc-500'
                                : 'text-amber-500'
                        }`}
                      >
                        ● {selectedCustomer.status.toUpperCase()}
                      </span>
                      <div className="w-px h-4 bg-zinc-800"></div>
                      <span className="text-xs text-zinc-500 tracking-wider">
                        SINCE{' '}
                        {new Date(selectedCustomer.lastContact).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="border border-zinc-800 p-6">
                    <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                      CONTACT INFORMATION
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 tracking-wider">
                          EMAIL
                        </span>
                        <span className="text-white font-light">
                          {selectedCustomer.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 tracking-wider">
                          PHONE
                        </span>
                        <span className="text-white font-light">
                          {selectedCustomer.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-zinc-800 p-6">
                    <h5 className="text-xs font-normal text-white tracking-widest mb-4">
                      ASSIGNMENT
                    </h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 tracking-wider">
                          ASSIGNEE
                        </span>
                        <span className="text-white font-light">
                          {selectedCustomer.assignee.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 tracking-wider">
                          VALUE
                        </span>
                        <span className="text-white font-light">
                          ¥{(selectedCustomer.value / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-zinc-800">
                <div className="flex justify-between">
                  <button
                    onClick={() =>
                      router.push(`/customers/${selectedCustomer.id}`)
                    }
                    className="px-8 py-3 bg-white text-black text-xs tracking-wider font-medium hover:bg-zinc-200 transition-colors"
                  >
                    VIEW FULL PROFILE
                  </button>
                  <button className="px-8 py-3 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                    SEND MESSAGE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal - Dark Elegant */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                NEW CUSTOMER REGISTRATION
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    COMPANY
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter company name (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      placeholder="000-0000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    STATUS
                  </label>
                  <select className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm">
                    <option value="lead">LEAD</option>
                    <option value="prospect">PROSPECT</option>
                    <option value="customer">CUSTOMER</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button className="px-8 py-3 bg-white text-black text-xs tracking-wider font-medium hover:bg-zinc-200 transition-colors">
                  REGISTER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
