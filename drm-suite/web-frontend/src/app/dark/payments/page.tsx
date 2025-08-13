'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  projectName: string;
  customer: string;
  amount: number;
  method: 'bank-transfer' | 'cash' | 'check' | 'credit-card' | 'cryptocurrency';
  receivedDate: string;
  recordedDate: string;
  status: 'pending' | 'verified' | 'reconciled' | 'disputed' | 'returned';
  bankAccount?: string;
  transactionId?: string;
  notes?: string;
  attachments: string[];
  verifiedBy?: string;
  reconciledBy?: string;
  fees?: number;
  exchangeRate?: number;
  originalCurrency?: string;
  originalAmount?: number;
}

interface PaymentStats {
  totalReceived: number;
  todayReceived: number;
  pendingAmount: number;
  averagePaymentDays: number;
  thisMonthReceived: number;
  reconciliationRate: number;
}

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  lastReconciled: string;
}

export default function DarkPaymentsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<
    'list' | 'timeline' | 'reconciliation'
  >('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'date' | 'amount' | 'customer' | 'status'
  >('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showBatchReconciliation, setShowBatchReconciliation] = useState(false);

  // Sample data adapted to Dark Elegant theme
  const [payments] = useState<Payment[]>([
    {
      id: 'PAY-2024-001',
      invoiceId: 'INV-2024-001',
      invoiceNumber: 'INV-2024-001',
      projectName: 'TANAKA RESIDENCE EXTERIOR PAINTING',
      customer: 'TANAKA CONSTRUCTION CO.',
      amount: 2530000,
      method: 'bank-transfer',
      receivedDate: '2024-01-25',
      recordedDate: '2024-01-25',
      status: 'reconciled',
      bankAccount: 'MIZUHO BANK #1234567',
      transactionId: 'T202401250001',
      notes: 'PAYMENT RECEIVED AS SCHEDULED.',
      attachments: ['payment_confirmation.pdf'],
      verifiedBy: 'FINANCE_A',
      reconciledBy: 'FINANCE_A',
      fees: 330,
    },
    {
      id: 'PAY-2024-002',
      invoiceId: 'INV-2024-002',
      invoiceNumber: 'INV-2024-002',
      projectName: 'YAMADA BUILDING INTERIOR RENOVATION',
      customer: 'YAMADA TRADING CO.',
      amount: 2860000,
      method: 'bank-transfer',
      receivedDate: '2024-01-28',
      recordedDate: '2024-01-28',
      status: 'verified',
      bankAccount: 'MIZUHO BANK #1234567',
      transactionId: 'T202401280001',
      attachments: ['transfer_receipt.pdf'],
      verifiedBy: 'FINANCE_B',
      fees: 330,
    },
    {
      id: 'PAY-2024-003',
      invoiceId: 'INV-2024-003',
      invoiceNumber: 'INV-2024-003',
      projectName: 'SATO RESIDENCE ROOF REPAIR',
      customer: 'SATO TARO',
      amount: 539000,
      method: 'bank-transfer',
      receivedDate: '2024-01-30',
      recordedDate: '2024-01-30',
      status: 'pending',
      bankAccount: 'MIZUHO BANK #1234567',
      transactionId: 'T202401300001',
      notes: 'PARTIAL PAYMENT (50%)',
      attachments: ['partial_payment.pdf'],
      fees: 330,
    },
    {
      id: 'PAY-2024-004',
      invoiceId: 'INV-2024-004',
      invoiceNumber: 'INV-2024-004',
      projectName: 'SUZUKI FACTORY MAINTENANCE',
      customer: 'SUZUKI INDUSTRIAL CO.',
      amount: 495000,
      method: 'credit-card',
      receivedDate: '2024-01-31',
      recordedDate: '2024-01-31',
      status: 'verified',
      transactionId: 'CC202401310001',
      attachments: ['credit_statement.pdf'],
      verifiedBy: 'FINANCE_A',
      fees: 14850,
      notes: 'CREDIT CARD PAYMENT',
    },
    {
      id: 'PAY-2024-005',
      invoiceId: '',
      invoiceNumber: '',
      projectName: 'ADVANCE PAYMENT',
      customer: 'TAKAHASHI CONSTRUCTION',
      amount: 1500000,
      method: 'bank-transfer',
      receivedDate: '2024-02-01',
      recordedDate: '2024-02-01',
      status: 'pending',
      bankAccount: 'MIZUHO BANK #1234567',
      transactionId: 'T202402010001',
      attachments: ['advance_receipt.pdf'],
      notes: 'ADVANCE PAYMENT FOR NEW CONSTRUCTION',
      fees: 330,
    },
  ]);

  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: 'BA-001',
      name: 'MAIN ACCOUNT',
      bankName: 'MIZUHO BANK',
      accountNumber: '#1234567',
      balance: 15780000,
      lastReconciled: '2024-01-31',
    },
    {
      id: 'BA-002',
      name: 'PAYMENT ACCOUNT',
      bankName: 'MUFG BANK',
      accountNumber: '#9876543',
      balance: 3450000,
      lastReconciled: '2024-01-30',
    },
  ]);

  // Statistics calculation
  const stats: PaymentStats = useMemo(() => {
    const totalReceived = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const today = new Date().toISOString().split('T')[0];
    const todayReceived = payments
      .filter((p) => p.receivedDate === today)
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthReceived = payments
      .filter((p) => p.receivedDate.startsWith(thisMonth))
      .reduce((sum, p) => sum + p.amount, 0);
    const reconciledCount = payments.filter(
      (p) => p.status === 'reconciled',
    ).length;
    const reconciliationRate =
      payments.length > 0 ? (reconciledCount / payments.length) * 100 : 0;

    return {
      totalReceived,
      todayReceived,
      pendingAmount,
      averagePaymentDays: 12,
      thisMonthReceived,
      reconciliationRate,
    };
  }, [payments]);

  // Filtering
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterMethod !== 'all') {
      filtered = filtered.filter((p) => p.method === filterMethod);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.receivedDate).getTime();
          bVal = new Date(b.receivedDate).getTime();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
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
  }, [payments, filterStatus, filterMethod, searchTerm, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: 'text-amber-500 border-amber-500/50',
        label: 'PENDING',
        indicator: '01',
      },
      verified: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'VERIFIED',
        indicator: '02',
      },
      reconciled: {
        color: 'text-emerald-500 border-emerald-500/50',
        label: 'RECONCILED',
        indicator: '03',
      },
      disputed: {
        color: 'text-red-500 border-red-500/50',
        label: 'DISPUTED',
        indicator: '04',
      },
      returned: {
        color: 'text-zinc-500 border-zinc-500/50',
        label: 'RETURNED',
        indicator: '05',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bank-transfer':
        return 'BANK TRANSFER';
      case 'cash':
        return 'CASH';
      case 'check':
        return 'CHECK';
      case 'credit-card':
        return 'CREDIT CARD';
      case 'cryptocurrency':
        return 'CRYPTOCURRENCY';
      default:
        return method;
    }
  };

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;

  const handlePaymentAction = (action: string, paymentId?: string) => {
    if (paymentId) {
      alert(`EXECUTING "${action}" FOR PAYMENT ${paymentId}`);
    } else {
      alert(
        `EXECUTING "${action}" FOR ${selectedPayments.length} SELECTED PAYMENTS`,
      );
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId],
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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dark/dashboard')}
                className="mr-6 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← DASHBOARD
              </button>
              <div>
                <h1 className="text-2xl font-thin text-white tracking-widest">
                  PAYMENT MANAGEMENT
                </h1>
                <p className="text-zinc-500 mt-1 text-xs tracking-wider">
                  PAYMENT RECORDING • VERIFICATION • RECONCILIATION
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              {selectedPayments.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-zinc-500 tracking-wider">
                    {selectedPayments.length} SELECTED
                  </span>
                  <button
                    onClick={() => setShowBatchReconciliation(true)}
                    className="px-6 py-3 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors"
                  >
                    BATCH RECONCILE
                  </button>
                </div>
              )}
              <button
                onClick={() => router.push('/dark/payments/import')}
                className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-white text-xs tracking-wider hover:border-zinc-600 transition-colors"
              >
                CSV IMPORT
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                + MANUAL RECORD
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  TOTAL RECEIVED
                </p>
                <p className="text-2xl font-thin text-white">
                  {formatCurrency(stats.totalReceived)}
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
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  TODAY RECEIVED
                </p>
                <p className="text-2xl font-thin text-emerald-500">
                  {formatCurrency(stats.todayReceived)}
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
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  PENDING AMOUNT
                </p>
                <p className="text-2xl font-thin text-amber-500">
                  {formatCurrency(stats.pendingAmount)}
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
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  RECONCILE RATE
                </p>
                <p className="text-2xl font-thin text-purple-500">
                  {stats.reconciliationRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                04
              </div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  THIS MONTH
                </p>
                <p className="text-2xl font-thin text-blue-500">
                  {formatCurrency(stats.thisMonthReceived)}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                05
              </div>
            </div>
          </div>
        </div>

        {/* Bank Account Balances */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
          <h3 className="text-sm font-normal text-white mb-6 tracking-widest">
            BANK ACCOUNT BALANCES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankAccounts.map((account, index) => (
              <div
                key={account.id}
                className="bg-black border border-zinc-800 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-light text-white tracking-wider">
                      {account.name}
                    </h4>
                    <p className="text-xs text-zinc-500 tracking-wider mt-1">
                      {account.bankName}
                    </p>
                    <p className="text-xs text-zinc-600 tracking-wider">
                      {account.accountNumber}
                    </p>
                  </div>
                  <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-light text-emerald-500">
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs text-zinc-600 mt-2 tracking-wider">
                    LAST RECONCILED: {account.lastReconciled}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH PAYMENTS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="all">ALL STATUS</option>
                <option value="pending">PENDING</option>
                <option value="verified">VERIFIED</option>
                <option value="reconciled">RECONCILED</option>
                <option value="disputed">DISPUTED</option>
                <option value="returned">RETURNED</option>
              </select>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
              >
                <option value="all">ALL METHODS</option>
                <option value="bank-transfer">BANK TRANSFER</option>
                <option value="cash">CASH</option>
                <option value="check">CHECK</option>
                <option value="credit-card">CREDIT CARD</option>
                <option value="cryptocurrency">CRYPTOCURRENCY</option>
              </select>
            </div>

            <div className="flex gap-4">
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
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  LIST
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'timeline' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  TIMELINE
                </button>
                <button
                  onClick={() => setViewMode('reconciliation')}
                  className={`px-4 py-3 text-xs tracking-wider transition-colors ${viewMode === 'reconciliation' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}
                >
                  RECONCILE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments(
                            filteredPayments.map((p) => p.id),
                          );
                        } else {
                          setSelectedPayments([]);
                        }
                      }}
                      checked={
                        selectedPayments.length === filteredPayments.length &&
                        filteredPayments.length > 0
                      }
                      className="bg-black border-zinc-700"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    TRANSACTION ID • INVOICE
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    PROJECT • CUSTOMER
                  </th>
                  <th className="px-6 py-4 text-right text-xs text-zinc-500 tracking-widest">
                    PAYMENT AMOUNT
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    PAYMENT METHOD
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-zinc-500 tracking-widest">
                    RECEIVED DATE
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-zinc-500 tracking-widest">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-zinc-500 tracking-widest">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handlePaymentSelect(payment.id)}
                        className="bg-black border-zinc-700"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs mt-0.5">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="text-sm font-light text-white tracking-wider">
                            {payment.transactionId || payment.id}
                          </div>
                          {payment.invoiceNumber && (
                            <div className="text-xs text-zinc-500 tracking-wider mt-1">
                              INVOICE: {payment.invoiceNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-light text-white tracking-wider">
                          {payment.projectName}
                        </div>
                        <div className="text-xs text-zinc-500 tracking-wider mt-1">
                          {payment.customer}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-light text-white">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.fees && (
                        <div className="text-xs text-red-500 mt-1">
                          FEES: {formatCurrency(payment.fees)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-white tracking-wider">
                        {getMethodLabel(payment.method)}
                      </div>
                      {payment.bankAccount && (
                        <div className="text-xs text-zinc-500 tracking-wider mt-1">
                          {payment.bankAccount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400 tracking-wider">
                      {payment.receivedDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentModal(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-500 hover:text-white border border-zinc-700 hover:border-blue-500 transition-colors text-xs"
                          title="DETAILS"
                        >
                          VIEW
                        </button>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() =>
                              handlePaymentAction('VERIFY', payment.id)
                            }
                            className="p-2 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-zinc-700 hover:border-emerald-500 transition-colors text-xs"
                            title="VERIFY"
                          >
                            VERIFY
                          </button>
                        )}
                        {payment.status === 'verified' && (
                          <button
                            onClick={() =>
                              handlePaymentAction('RECONCILE', payment.id)
                            }
                            className="p-2 text-purple-500 hover:bg-purple-500 hover:text-white border border-zinc-700 hover:border-purple-500 transition-colors text-xs"
                            title="RECONCILE"
                          >
                            RECONCILE
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="bg-zinc-950 border border-zinc-800 p-16 text-center">
            <div className="w-16 h-16 border border-zinc-700 flex items-center justify-center text-zinc-500 font-light text-2xl mx-auto mb-6">
              PAY
            </div>
            <p className="text-zinc-500 mb-6 text-xs tracking-wider">
              NO PAYMENT RECORDS FOUND
            </p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              RECORD NEW PAYMENT
            </button>
          </div>
        )}
      </div>

      {/* Payment Detail/Record Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-thin text-white mb-2 tracking-widest">
                    {selectedPayment
                      ? `PAYMENT DETAILS - ${selectedPayment.id}`
                      : 'NEW PAYMENT RECORD'}
                  </h2>
                  {selectedPayment && (
                    <p className="text-zinc-500 text-xs tracking-wider">
                      {selectedPayment.projectName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-zinc-500 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedPayment ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-normal text-white mb-4 tracking-widest">
                        BASIC INFORMATION
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            CUSTOMER:
                          </span>
                          <span className="text-white tracking-wider">
                            {selectedPayment.customer}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            PROJECT:
                          </span>
                          <span className="text-white tracking-wider">
                            {selectedPayment.projectName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            INVOICE:
                          </span>
                          <span className="text-white tracking-wider">
                            {selectedPayment.invoiceNumber || 'NONE'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            AMOUNT:
                          </span>
                          <span className="text-emerald-500 tracking-wider">
                            {formatCurrency(selectedPayment.amount)}
                          </span>
                        </div>
                        {selectedPayment.fees && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500 tracking-wider">
                              FEES:
                            </span>
                            <span className="text-red-500 tracking-wider">
                              {formatCurrency(selectedPayment.fees)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-normal text-white mb-4 tracking-widest">
                        TRANSACTION INFORMATION
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            METHOD:
                          </span>
                          <span className="text-white tracking-wider">
                            {getMethodLabel(selectedPayment.method)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            TRANSACTION ID:
                          </span>
                          <span className="text-white tracking-wider">
                            {selectedPayment.transactionId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            RECEIVED:
                          </span>
                          <span className="text-white tracking-wider">
                            {selectedPayment.receivedDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 tracking-wider">
                            RECORDED:
                          </span>
                          <span className="text-white tracking-wider">
                            {selectedPayment.recordedDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500 tracking-wider">
                            STATUS:
                          </span>
                          {getStatusBadge(selectedPayment.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.notes && (
                    <div>
                      <h3 className="text-sm font-normal text-white mb-3 tracking-widest">
                        NOTES
                      </h3>
                      <div className="text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 p-4 tracking-wider">
                        {selectedPayment.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
                    {selectedPayment.status === 'pending' && (
                      <button
                        onClick={() =>
                          handlePaymentAction('VERIFY', selectedPayment.id)
                        }
                        className="px-6 py-3 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors"
                      >
                        VERIFY PAYMENT
                      </button>
                    )}
                    {selectedPayment.status === 'verified' && (
                      <button
                        onClick={() =>
                          handlePaymentAction('RECONCILE', selectedPayment.id)
                        }
                        className="px-6 py-3 bg-blue-500 text-white text-xs tracking-wider hover:bg-blue-400 transition-colors"
                      >
                        RECONCILE PAYMENT
                      </button>
                    )}
                    <button className="px-6 py-3 bg-purple-500 text-white text-xs tracking-wider hover:bg-purple-400 transition-colors">
                      GENERATE REPORT
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                        CUSTOMER NAME
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                        PROJECT NAME
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                        placeholder="Enter project name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                        PAYMENT AMOUNT (¥)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                        PAYMENT METHOD
                      </label>
                      <select className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm">
                        <option value="bank-transfer">BANK TRANSFER</option>
                        <option value="cash">CASH</option>
                        <option value="check">CHECK</option>
                        <option value="credit-card">CREDIT CARD</option>
                        <option value="cryptocurrency">CRYPTOCURRENCY</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                        RECEIVED DATE
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                        TRANSACTION ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                        placeholder="Enter transaction ID"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      NOTES
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      rows={4}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedPayment(null);
                      }}
                      className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                    >
                      RECORD PAYMENT
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Reconciliation Modal */}
      {showBatchReconciliation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 max-w-3xl w-full">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-thin text-white mb-2 tracking-widest">
                    BATCH RECONCILIATION
                  </h2>
                  <p className="text-zinc-500 text-xs tracking-wider">
                    RECONCILING {selectedPayments.length} PAYMENTS
                  </p>
                </div>
                <button
                  onClick={() => setShowBatchReconciliation(false)}
                  className="text-zinc-500 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-amber-500 bg-opacity-10 border border-amber-500/20 p-4 mb-6">
                <p className="text-xs text-amber-500 tracking-wider">
                  SELECTED PAYMENT RECORDS WILL BE RECONCILED WITH BANK
                  TRANSACTION STATEMENTS AND STATUS UPDATED TO "RECONCILED".
                  THIS ACTION CANNOT BE UNDONE.
                </p>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto">
                {selectedPayments.map((paymentId) => {
                  const payment = payments.find((p) => p.id === paymentId);
                  if (!payment) return null;
                  return (
                    <div
                      key={paymentId}
                      className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800"
                    >
                      <div>
                        <p className="text-sm font-light text-white tracking-wider">
                          {payment.customer}
                        </p>
                        <p className="text-xs text-zinc-400 tracking-wider">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-400 tracking-wider">
                          {payment.receivedDate}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
                <button
                  onClick={() => setShowBatchReconciliation(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    handlePaymentAction('BATCH RECONCILE');
                    setShowBatchReconciliation(false);
                  }}
                  className="px-8 py-3 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors"
                >
                  EXECUTE RECONCILIATION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
