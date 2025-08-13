'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Estimate {
  id: string;
  estimateNo: string;
  customerName: string;
  companyName: string;
  projectName: string;
  projectType: string;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  validUntil: string;
  createdBy: string;
  lastModified: string;
  version: number;
  tags: string[];
}

export default function EstimatesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [estimates, setEstimates] = useState<Estimate[]>([
    {
      id: '1',
      estimateNo: 'EST-2024-001',
      customerName: 'TANAKA TARO',
      companyName: 'TANAKA CONSTRUCTION CO LTD',
      projectName: 'TANAKA RESIDENCE NEW CONSTRUCTION',
      projectType: 'NEW CONSTRUCTION',
      totalAmount: 15500000,
      status: 'pending',
      createdAt: '2024-08-01',
      validUntil: '2024-08-31',
      createdBy: 'SATO JIRO',
      lastModified: '2024-08-10',
      version: 2,
      tags: ['WOODEN', '2-STORY', 'URGENT'],
    },
    {
      id: '2',
      estimateNo: 'EST-2024-002',
      customerName: 'YAMADA HANAKO',
      companyName: 'YAMADA TRADING CO LTD',
      projectName: 'YAMADA BUILDING EXTERIOR RENOVATION',
      projectType: 'EXTERIOR PAINTING',
      totalAmount: 3200000,
      status: 'approved',
      createdAt: '2024-08-03',
      validUntil: '2024-09-03',
      createdBy: 'SUZUKI ICHIRO',
      lastModified: '2024-08-05',
      version: 1,
      tags: ['PAINTING', 'BUILDING'],
    },
    {
      id: '3',
      estimateNo: 'EST-2024-003',
      customerName: 'SUZUKI AKIRA',
      companyName: 'SUZUKI REAL ESTATE',
      projectName: 'APARTMENT RENOVATION',
      projectType: 'RENOVATION',
      totalAmount: 8500000,
      status: 'draft',
      createdAt: '2024-08-05',
      validUntil: '2024-09-05',
      createdBy: 'SATO JIRO',
      lastModified: '2024-08-09',
      version: 3,
      tags: ['APARTMENT', 'PLUMBING'],
    },
    {
      id: '4',
      estimateNo: 'EST-2024-004',
      customerName: 'TAKAHASHI ICHIRO',
      companyName: '',
      projectName: 'TAKAHASHI RESIDENCE EXTENSION',
      projectType: 'EXTENSION',
      totalAmount: 12000000,
      status: 'rejected',
      createdAt: '2024-07-20',
      validUntil: '2024-08-20',
      createdBy: 'YAMADA TARO',
      lastModified: '2024-07-25',
      version: 2,
      tags: ['EXTENSION', 'RESIDENTIAL'],
    },
    {
      id: '5',
      estimateNo: 'EST-2024-005',
      customerName: 'WATANABE MIHO',
      companyName: 'WATANABE CORPORATION',
      projectName: 'STORE INTERIOR CONSTRUCTION',
      projectType: 'STORE INTERIOR',
      totalAmount: 5500000,
      status: 'expired',
      createdAt: '2024-06-01',
      validUntil: '2024-07-01',
      createdBy: 'SUZUKI ICHIRO',
      lastModified: '2024-06-15',
      version: 1,
      tags: ['RESTAURANT', 'INTERIOR'],
    },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
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
      approved: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'APPROVED',
        indicator: '03',
      },
      rejected: {
        color: 'text-red-500 border-red-500/50',
        label: 'REJECTED',
        indicator: '04',
      },
      expired: {
        color: 'text-zinc-600 border-zinc-700',
        label: 'EXPIRED',
        indicator: '05',
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  // Filtering and sorting
  const filteredEstimates = estimates
    .filter((estimate) => {
      const matchesSearch =
        searchTerm === '' ||
        estimate.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        estimate.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.estimateNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || estimate.status === filterStatus;
      const matchesType =
        filterType === 'all' || estimate.projectType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        case 'date':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  // Statistics
  const stats = {
    total: estimates.length,
    totalAmount: estimates.reduce((sum, e) => sum + e.totalAmount, 0),
    pending: estimates.filter((e) => e.status === 'pending').length,
    approved: estimates.filter((e) => e.status === 'approved').length,
    averageAmount:
      estimates.length > 0
        ? estimates.reduce((sum, e) => sum + e.totalAmount, 0) /
          estimates.length
        : 0,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="mr-4 text-zinc-500 hover:text-white transition-colors text-sm tracking-wider"
              >
                ← BACK
              </button>
              <div>
                <h1 className="text-2xl font-thin text-white tracking-widest">
                  ESTIMATE MANAGEMENT
                </h1>
                <p className="text-xs text-zinc-500 tracking-wider mt-1">
                  CREATE, MANAGE, AND APPROVE ESTIMATES
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dark/estimates/create')}
              className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              + NEW ESTIMATE
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  TOTAL ESTIMATES
                </p>
                <p className="text-2xl font-thin text-white">{stats.total}</p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                01
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  TOTAL AMOUNT
                </p>
                <p className="text-2xl font-thin text-blue-500">
                  ¥{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                02
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  PENDING APPROVAL
                </p>
                <p className="text-2xl font-thin text-amber-500">
                  {stats.pending}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                03
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  AVERAGE AMOUNT
                </p>
                <p className="text-2xl font-thin text-white">
                  ¥{Math.round(stats.averageAmount).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                04
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="SEARCH BY CUSTOMER NAME, PROJECT NAME, ESTIMATE NUMBER..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              >
                <option value="all">ALL STATUS</option>
                <option value="draft">DRAFT</option>
                <option value="pending">PENDING</option>
                <option value="approved">APPROVED</option>
                <option value="rejected">REJECTED</option>
                <option value="expired">EXPIRED</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              >
                <option value="all">ALL TYPES</option>
                <option value="NEW CONSTRUCTION">NEW CONSTRUCTION</option>
                <option value="RENOVATION">RENOVATION</option>
                <option value="EXTERIOR PAINTING">EXTERIOR PAINTING</option>
                <option value="EXTENSION">EXTENSION</option>
                <option value="STORE INTERIOR">STORE INTERIOR</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'date' | 'amount' | 'customer')
                }
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
              >
                <option value="date">BY DATE</option>
                <option value="amount">BY AMOUNT</option>
                <option value="customer">BY CUSTOMER</option>
              </select>
              <div className="flex border border-zinc-800">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 text-xs tracking-wider ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500'} transition-colors`}
                  title="List View"
                >
                  LIST
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-3 text-xs tracking-wider ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500'} transition-colors`}
                  title="Grid View"
                >
                  GRID
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-zinc-950 border border-zinc-800">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    ESTIMATE INFORMATION
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    CUSTOMER INFORMATION
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredEstimates.map((estimate, index) => (
                  <tr
                    key={estimate.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-light text-white tracking-wider">
                              {estimate.estimateNo}
                            </p>
                            <span className="text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 tracking-wider">
                              V{estimate.version}
                            </span>
                          </div>
                          <p className="text-sm text-white mt-1 tracking-wider">
                            {estimate.projectName}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-zinc-500 tracking-wider">
                              TYPE: {estimate.projectType}
                            </span>
                            <span className="text-xs text-zinc-500 tracking-wider">
                              DATE: {estimate.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-light text-white tracking-wider">
                          {estimate.customerName}
                        </p>
                        {estimate.companyName && (
                          <p className="text-xs text-zinc-500 tracking-wider">
                            {estimate.companyName}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1">
                          {estimate.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs text-zinc-600 tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-lg font-thin text-white">
                        ¥{estimate.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500 tracking-wider">
                        TAX INCLUDED
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        {getStatusBadge(estimate.status)}
                        <p className="text-xs text-zinc-500 mt-1 tracking-wider">
                          EXPIRES: {estimate.validUntil}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/dark/estimates/${estimate.id}`)
                          }
                          className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                          title="Details"
                        >
                          VIEW
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/dark/estimates/${estimate.id}/edit`)
                          }
                          className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                          title="Edit"
                        >
                          EDIT
                        </button>
                        <button
                          className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                          title="Duplicate"
                        >
                          COPY
                        </button>
                        <button
                          className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                          title="PDF Export"
                        >
                          PDF
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
            {filteredEstimates.map((estimate, index) => (
              <div
                key={estimate.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/dark/estimates/${estimate.id}`)}
              >
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-sm font-light text-white tracking-wider">
                          {estimate.estimateNo}
                        </p>
                        <p className="text-xs text-zinc-500 tracking-wider">
                          V{estimate.version}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(estimate.status)}
                  </div>
                  <h3 className="text-lg font-light text-white mb-1 tracking-wider">
                    {estimate.projectName}
                  </h3>
                  <p className="text-sm text-zinc-400 tracking-wider">
                    {estimate.customerName}
                  </p>
                  {estimate.companyName && (
                    <p className="text-xs text-zinc-500 tracking-wider">
                      {estimate.companyName}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-zinc-500 tracking-wider">
                      ESTIMATE AMOUNT
                    </span>
                    <span className="text-xl font-thin text-white">
                      ¥{estimate.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-500">
                    <div className="flex justify-between">
                      <span className="tracking-wider">
                        TYPE: {estimate.projectType}
                      </span>
                      <span className="tracking-wider">
                        DATE: {estimate.createdAt}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="tracking-wider">
                        BY: {estimate.createdBy}
                      </span>
                      <span className="tracking-wider">
                        EXPIRES: {estimate.validUntil}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {estimate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs text-zinc-600 tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className="px-4 pb-4 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      router.push(`/dark/estimates/${estimate.id}/edit`)
                    }
                    className="flex-1 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                  >
                    EDIT
                  </button>
                  <button className="flex-1 py-2 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredEstimates.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 p-12 text-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-sm mx-auto mb-4">
              00
            </div>
            <p className="text-zinc-500 mb-4 tracking-wider">
              NO MATCHING ESTIMATES FOUND
            </p>
            <button
              onClick={() => router.push('/dark/estimates/create')}
              className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              CREATE NEW ESTIMATE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
