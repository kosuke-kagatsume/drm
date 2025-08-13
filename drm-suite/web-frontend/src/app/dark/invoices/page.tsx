'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Invoice {
  id: string;
  projectName: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled';
  paymentProgress: number;
  items: InvoiceItem[];
  notes?: string;
  template: 'standard' | 'construction' | 'maintenance';
  recurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  tags: string[];
  attachments: string[];
  lastEmailSent?: string;
  emailOpenCount: number;
  downloadCount: number;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  taxRate: number;
}

interface InvoiceStats {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  averageDaysToPayment: number;
  thisMonthInvoiced: number;
  thisMonthPaid: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'date' | 'amount' | 'customer' | 'status'
  >('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Sample data adapted to Dark Elegant theme
  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      projectName: 'TANAKA RESIDENCE EXTERIOR PAINTING',
      customer: 'TANAKA CONSTRUCTION CO LTD',
      customerEmail: 'tanaka@example.com',
      customerPhone: '03-1234-5678',
      amount: 2300000,
      taxAmount: 230000,
      totalAmount: 2530000,
      issuedDate: '2024-01-10',
      dueDate: '2024-02-09',
      paidDate: '2024-01-25',
      status: 'paid',
      paymentProgress: 100,
      items: [
        {
          id: '1',
          description: 'EXTERIOR PAINTING COMPLETE SET',
          quantity: 1,
          unit: 'SET',
          unitPrice: 2000000,
          amount: 2000000,
          taxRate: 10,
        },
        {
          id: '2',
          description: 'SCAFFOLDING SETUP & REMOVAL',
          quantity: 150,
          unit: 'SQM',
          unitPrice: 2000,
          amount: 300000,
          taxRate: 10,
        },
      ],
      notes: 'INVOICE AFTER CONSTRUCTION COMPLETION.',
      template: 'construction',
      recurring: false,
      tags: ['EXTERIOR PAINTING', 'COMPLETED'],
      attachments: ['COMPLETION_PHOTOS.PDF', 'INSPECTION_REPORT.PDF'],
      lastEmailSent: '2024-01-10',
      emailOpenCount: 3,
      downloadCount: 2,
    },
    {
      id: 'INV-2024-002',
      projectName: 'YAMADA BUILDING INTERIOR RENOVATION',
      customer: 'YAMADA TRADING CO LTD',
      customerEmail: 'yamada@example.com',
      customerPhone: '03-9876-5432',
      amount: 5200000,
      taxAmount: 520000,
      totalAmount: 5720000,
      issuedDate: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'sent',
      paymentProgress: 0,
      items: [
        {
          id: '1',
          description: 'OFFICE INTERIOR CONSTRUCTION',
          quantity: 1,
          unit: 'SET',
          unitPrice: 4500000,
          amount: 4500000,
          taxRate: 10,
        },
        {
          id: '2',
          description: 'ELECTRICAL WORK',
          quantity: 1,
          unit: 'SET',
          unitPrice: 700000,
          amount: 700000,
          taxRate: 10,
        },
      ],
      template: 'construction',
      recurring: false,
      tags: ['RENOVATION', 'IN PROGRESS'],
      attachments: ['BLUEPRINTS.PDF'],
      lastEmailSent: '2024-01-15',
      emailOpenCount: 5,
      downloadCount: 1,
    },
    {
      id: 'INV-2024-003',
      projectName: 'SATO RESIDENCE ROOF REPAIR',
      customer: 'SATO TARO',
      customerEmail: 'sato@example.com',
      customerPhone: '090-1234-5678',
      amount: 980000,
      taxAmount: 98000,
      totalAmount: 1078000,
      issuedDate: '2023-12-20',
      dueDate: '2024-01-19',
      status: 'overdue',
      paymentProgress: 50,
      items: [
        {
          id: '1',
          description: 'ROOF TILE REPAIR',
          quantity: 25,
          unit: 'PCS',
          unitPrice: 35000,
          amount: 875000,
          taxRate: 10,
        },
        {
          id: '2',
          description: 'WATERPROOFING WORK',
          quantity: 1,
          unit: 'SET',
          unitPrice: 105000,
          amount: 105000,
          taxRate: 10,
        },
      ],
      notes: 'EMERGENCY RESPONSE FOR WATER LEAK REPAIR',
      template: 'maintenance',
      recurring: false,
      tags: ['ROOF REPAIR', 'EMERGENCY'],
      attachments: ['DAMAGE_PHOTOS.PDF'],
      lastEmailSent: '2024-01-20',
      emailOpenCount: 2,
      downloadCount: 0,
    },
    {
      id: 'INV-2024-004',
      projectName: 'SUZUKI FACTORY PERIODIC INSPECTION',
      customer: 'SUZUKI INDUSTRIAL CO LTD',
      customerEmail: 'suzuki@example.com',
      customerPhone: '03-5555-1234',
      amount: 450000,
      taxAmount: 45000,
      totalAmount: 495000,
      issuedDate: '2024-01-01',
      dueDate: '2024-01-31',
      status: 'viewed',
      paymentProgress: 0,
      items: [
        {
          id: '1',
          description: 'EQUIPMENT PERIODIC INSPECTION',
          quantity: 1,
          unit: 'SET',
          unitPrice: 350000,
          amount: 350000,
          taxRate: 10,
        },
        {
          id: '2',
          description: 'INSPECTION REPORT CREATION',
          quantity: 1,
          unit: 'SET',
          unitPrice: 100000,
          amount: 100000,
          taxRate: 10,
        },
      ],
      template: 'maintenance',
      recurring: true,
      recurringFrequency: 'quarterly',
      tags: ['PERIODIC INSPECTION', 'ONGOING CONTRACT'],
      attachments: ['INSPECTION_CHECKLIST.PDF'],
      lastEmailSent: '2024-01-01',
      emailOpenCount: 4,
      downloadCount: 1,
    },
  ]);

  // Statistics calculation
  const stats: InvoiceStats = useMemo(() => {
    const totalInvoiced = invoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const totalPaid = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOutstanding = invoices
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueAmount = invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // This month's invoices
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthInvoiced = invoices
      .filter((inv) => inv.issuedDate.startsWith(thisMonth))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const thisMonthPaid = invoices
      .filter((inv) => inv.paidDate?.startsWith(thisMonth))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      overdueAmount,
      averageDaysToPayment: 15, // Placeholder value
      thisMonthInvoiced,
      thisMonthPaid,
    };
  }, [invoices]);

  // Filtering
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date();

      if (filterDateRange === 'this-month') {
        filterDate.setMonth(today.getMonth());
        filtered = filtered.filter(
          (inv) => new Date(inv.issuedDate) >= filterDate,
        );
      } else if (filterDateRange === 'last-30-days') {
        filterDate.setDate(today.getDate() - 30);
        filtered = filtered.filter(
          (inv) => new Date(inv.issuedDate) >= filterDate,
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.issuedDate).getTime();
          bVal = new Date(b.issuedDate).getTime();
          break;
        case 'amount':
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case 'customer':
          aVal = a.customer.toLowerCase();
          bVal = b.customer.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [invoices, filterStatus, searchTerm, filterDateRange, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        color: 'text-zinc-500 border-zinc-600',
        label: 'DRAFT',
        indicator: '01',
      },
      sent: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'SENT',
        indicator: '02',
      },
      viewed: {
        color: 'text-purple-500 border-purple-500/50',
        label: 'VIEWED',
        indicator: '03',
      },
      overdue: {
        color: 'text-red-500 border-red-500/50',
        label: 'OVERDUE',
        indicator: '04',
      },
      paid: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'PAID',
        indicator: '05',
      },
      cancelled: {
        color: 'text-zinc-600 border-zinc-700',
        label: 'CANCELLED',
        indicator: '06',
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status.toUpperCase(),
      color: 'text-zinc-500 border-zinc-600',
      indicator: '00',
    };

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;

  const handleBulkAction = (action: string) => {
    alert(`EXECUTING "${action}" ON ${selectedInvoices.length} INVOICES`);
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="mr-4 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <div>
                <h1 className="text-2xl font-thin text-white tracking-widest">
                  INVOICE MANAGEMENT
                </h1>
                <p className="text-xs text-zinc-500 mt-1 tracking-wider">
                  INVOICE CREATION, DISTRIBUTION & MANAGEMENT
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {selectedInvoices.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-zinc-500 tracking-wider">
                    {selectedInvoices.length} SELECTED
                  </span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 bg-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-700 transition-colors"
                  >
                    BULK ACTIONS
                  </button>
                </div>
              )}
              <button
                onClick={() => router.push('/dark/invoices/templates')}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs tracking-wider transition-colors"
              >
                TEMPLATES
              </button>
              <button
                onClick={() => router.push('/dark/invoices/create')}
                className="px-6 py-2.5 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                NEW INVOICE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">
                  TOTAL INVOICED
                </p>
                <p className="text-2xl font-thin text-blue-500">
                  {formatCurrency(stats.totalInvoiced)}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                01
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider">RECEIVED</p>
                <p className="text-2xl font-thin text-emerald-500">
                  {formatCurrency(stats.totalPaid)}
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
                  OUTSTANDING
                </p>
                <p className="text-2xl font-thin text-amber-500">
                  {formatCurrency(stats.totalOutstanding)}
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
                <p className="text-xs text-zinc-500 tracking-wider">OVERDUE</p>
                <p className="text-2xl font-thin text-red-500">
                  {formatCurrency(stats.overdueAmount)}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                04
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH INVOICES..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="all">ALL STATUS</option>
                <option value="draft">DRAFT</option>
                <option value="sent">SENT</option>
                <option value="viewed">VIEWED</option>
                <option value="overdue">OVERDUE</option>
                <option value="paid">PAID</option>
              </select>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="all">ALL PERIODS</option>
                <option value="this-month">THIS MONTH</option>
                <option value="last-30-days">LAST 30 DAYS</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="date-desc">DATE (NEWEST)</option>
                <option value="date-asc">DATE (OLDEST)</option>
                <option value="amount-desc">AMOUNT (HIGH)</option>
                <option value="amount-asc">AMOUNT (LOW)</option>
                <option value="customer-asc">CUSTOMER (A-Z)</option>
                <option value="status-asc">STATUS</option>
              </select>
              <div className="flex border border-zinc-800">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  LIST
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  GRID
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Menu */}
          {showBulkActions && selectedInvoices.length > 0 && (
            <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800">
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('SEND')}
                  className="px-4 py-2 bg-blue-500 text-white text-xs tracking-wider hover:bg-blue-400 transition-colors"
                >
                  BULK SEND
                </button>
                <button
                  onClick={() => handleBulkAction('REMINDER')}
                  className="px-4 py-2 bg-amber-500 text-black text-xs tracking-wider hover:bg-amber-400 transition-colors"
                >
                  SEND REMINDER
                </button>
                <button
                  onClick={() => handleBulkAction('EXPORT PDF')}
                  className="px-4 py-2 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors"
                >
                  EXPORT PDF
                </button>
                <button
                  onClick={() => handleBulkAction('DELETE')}
                  className="px-4 py-2 bg-red-500 text-white text-xs tracking-wider hover:bg-red-400 transition-colors"
                >
                  DELETE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invoice List */}
        {viewMode === 'list' ? (
          <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices(
                              filteredInvoices.map((inv) => inv.id),
                            );
                          } else {
                            setSelectedInvoices([]);
                          }
                        }}
                        checked={
                          selectedInvoices.length === filteredInvoices.length &&
                          filteredInvoices.length > 0
                        }
                        className="rounded bg-black border-zinc-700"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                      INVOICE NUMBER
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                      PROJECT & CUSTOMER
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-zinc-500 tracking-widest">
                      AMOUNT
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                      ISSUED DATE
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                      DUE DATE
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-zinc-500 tracking-widest">
                      STATUS
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-zinc-500 tracking-widest">
                      PROGRESS
                    </th>
                    <th className="px-4 py-3 text-center text-xs text-zinc-500 tracking-widest">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleInvoiceSelect(invoice.id)}
                          className="rounded bg-black border-zinc-700"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-light text-white tracking-wider">
                              {invoice.id}
                            </div>
                            {invoice.recurring && (
                              <span className="inline-flex items-center px-2 py-0.5 border border-blue-500/50 text-xs text-blue-500 mt-1 tracking-wider">
                                RECURRING
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-light text-white tracking-wider">
                            {invoice.projectName}
                          </div>
                          <div className="text-xs text-zinc-500 tracking-wider">
                            {invoice.customer}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {invoice.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs text-zinc-600 tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-light text-white">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div className="text-xs text-zinc-500 tracking-wider">
                          TAX INCLUDED
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-400 tracking-wider">
                        {invoice.issuedDate}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-zinc-400 tracking-wider">
                          {invoice.dueDate}
                        </div>
                        {invoice.status === 'overdue' && (
                          <div className="text-xs text-red-500 font-light tracking-wider">
                            {Math.floor(
                              (new Date().getTime() -
                                new Date(invoice.dueDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}
                            D OVERDUE
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {invoice.paymentProgress > 0 && (
                          <div className="w-16 mx-auto">
                            <div className="flex justify-between text-xs text-zinc-400 mb-1 tracking-wider">
                              <span>{invoice.paymentProgress}%</span>
                            </div>
                            <div className="bg-zinc-900 h-1">
                              <div
                                className="bg-emerald-500/50 h-1"
                                style={{ width: `${invoice.paymentProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceModal(true);
                            }}
                            className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                            title="DETAILS"
                          >
                            VIEW
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/dark/invoices/${invoice.id}/edit`)
                            }
                            className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                            title="EDIT"
                          >
                            EDIT
                          </button>
                          <button
                            className="p-2 text-emerald-500 hover:text-emerald-400 border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                            title="SEND"
                          >
                            SEND
                          </button>
                          <button
                            className="p-2 text-purple-500 hover:text-purple-400 border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs tracking-wider"
                            title="PDF"
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice, index) => (
              <div
                key={invoice.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-sm font-light text-white tracking-wider">
                          {invoice.id}
                        </h3>
                        <p className="text-xs text-zinc-500 tracking-wider">
                          {invoice.projectName}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-zinc-500 tracking-wider">
                      {invoice.customer}
                    </p>
                    <p className="text-xl font-thin text-blue-500">
                      {formatCurrency(invoice.totalAmount)}
                    </p>
                  </div>

                  <div className="text-xs text-zinc-500 mb-4 tracking-wider">
                    <p>ISSUED: {invoice.issuedDate}</p>
                    <p>DUE: {invoice.dueDate}</p>
                  </div>

                  {invoice.paymentProgress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-zinc-500 mb-2 tracking-wider">
                        <span>PAYMENT PROGRESS</span>
                        <span>{invoice.paymentProgress}%</span>
                      </div>
                      <div className="bg-zinc-900 h-1">
                        <div
                          className="bg-emerald-500/50 h-1"
                          style={{ width: `${invoice.paymentProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowInvoiceModal(true);
                      }}
                      className="flex-1 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                    >
                      DETAILS
                    </button>
                    <button className="px-4 py-3 border border-zinc-800 text-emerald-500 hover:bg-zinc-900 transition-colors text-xs tracking-wider">
                      SEND
                    </button>
                    <button className="px-4 py-3 border border-zinc-800 text-purple-500 hover:bg-zinc-900 transition-colors text-xs tracking-wider">
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredInvoices.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 p-12 text-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-sm mx-auto mb-4">
              00
            </div>
            <p className="text-zinc-500 mb-4 tracking-wider">
              NO MATCHING INVOICES FOUND
            </p>
            <button
              onClick={() => router.push('/dark/invoices/create')}
              className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              CREATE NEW INVOICE
            </button>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-thin text-white mb-2 tracking-widest">
                    {selectedInvoice.id}
                  </h2>
                  <p className="text-zinc-500 text-sm tracking-wider">
                    {selectedInvoice.projectName}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-zinc-500 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-normal text-white mb-3 tracking-widest">
                    CUSTOMER INFORMATION
                  </h3>
                  <div className="space-y-2 text-xs tracking-wider">
                    <p>
                      <span className="text-zinc-500">CUSTOMER:</span>{' '}
                      <span className="text-white">
                        {selectedInvoice.customer}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-500">EMAIL:</span>{' '}
                      <span className="text-white">
                        {selectedInvoice.customerEmail}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-500">PHONE:</span>{' '}
                      <span className="text-white">
                        {selectedInvoice.customerPhone}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-normal text-white mb-3 tracking-widest">
                    INVOICE INFORMATION
                  </h3>
                  <div className="space-y-2 text-xs tracking-wider">
                    <p>
                      <span className="text-zinc-500">ISSUED:</span>{' '}
                      <span className="text-white">
                        {selectedInvoice.issuedDate}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-500">DUE DATE:</span>{' '}
                      <span className="text-white">
                        {selectedInvoice.dueDate}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-500">STATUS:</span>
                      <span className="ml-2">
                        {getStatusBadge(selectedInvoice.status)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-normal text-white mb-3 tracking-widest">
                  INVOICE ITEMS
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-zinc-800">
                    <thead className="bg-zinc-900 border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-2 text-left border border-zinc-800 text-xs text-zinc-500 tracking-widest">
                          ITEM
                        </th>
                        <th className="px-4 py-2 text-center border border-zinc-800 text-xs text-zinc-500 tracking-widest">
                          QTY
                        </th>
                        <th className="px-4 py-2 text-center border border-zinc-800 text-xs text-zinc-500 tracking-widest">
                          UNIT
                        </th>
                        <th className="px-4 py-2 text-right border border-zinc-800 text-xs text-zinc-500 tracking-widest">
                          UNIT PRICE
                        </th>
                        <th className="px-4 py-2 text-right border border-zinc-800 text-xs text-zinc-500 tracking-widest">
                          AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 border border-zinc-800 text-xs text-white tracking-wider">
                            {item.description}
                          </td>
                          <td className="px-4 py-2 text-center border border-zinc-800 text-xs text-white">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-center border border-zinc-800 text-xs text-white">
                            {item.unit}
                          </td>
                          <td className="px-4 py-2 text-right border border-zinc-800 text-xs text-white">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-2 text-right border border-zinc-800 text-xs text-white">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-900">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right border border-zinc-800 text-xs text-zinc-500 tracking-widest"
                        >
                          SUBTOTAL
                        </td>
                        <td className="px-4 py-2 text-right border border-zinc-800 text-xs text-white font-light">
                          {formatCurrency(selectedInvoice.amount)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right border border-zinc-800 text-xs text-zinc-500 tracking-widest"
                        >
                          TAX
                        </td>
                        <td className="px-4 py-2 text-right border border-zinc-800 text-xs text-white">
                          {formatCurrency(selectedInvoice.taxAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right border border-zinc-800 text-sm text-white font-light tracking-widest"
                        >
                          TOTAL
                        </td>
                        <td className="px-4 py-2 text-right border border-zinc-800 text-sm text-white font-light">
                          {formatCurrency(selectedInvoice.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    router.push(`/dark/invoices/${selectedInvoice.id}/edit`)
                  }
                  className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs tracking-wider transition-colors"
                >
                  EDIT
                </button>
                <button className="px-6 py-3 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors">
                  SEND INVOICE
                </button>
                <button className="px-6 py-3 bg-purple-500 text-white text-xs tracking-wider hover:bg-purple-400 transition-colors">
                  EXPORT PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
