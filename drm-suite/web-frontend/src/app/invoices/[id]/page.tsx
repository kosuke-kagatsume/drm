'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Download,
  Send,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';

// API型定義
interface Invoice {
  id: string;
  tenantId: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  contractId: string;
  contractNo: string;
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  projectName: string;
  projectType: string;
  items: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms: string;
  paymentMethod: string;
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  paidAmount: number;
  paidDate?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  sentDate?: string;
  sentMethod?: 'email' | 'mail' | 'hand' | 'fax';
  sentTo?: string;
  notes?: string;
  internalNotes?: string;
  createdBy: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

// 入金記録の型
interface PaymentRecord {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'payments' | 'related'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: '銀行振込',
    reference: '',
    notes: '',
  });

  // APIから請求書データを取得
  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/invoices?id=${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      const data = await response.json();
      if (data.success && data.invoice) {
        setInvoice(data.invoice);
      } else {
        throw new Error(data.error || 'Invoice not found');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    if (user && invoiceId) {
      fetchInvoice();
    }
  }, [user, invoiceId]);

  // ステータスの色とラベル
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'issued':
        return '発行済み';
      case 'sent':
        return '送付済み';
      case 'overdue':
        return '期限超過';
      case 'paid':
        return '支払済み';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`;

  // 入金登録
  const handleAddPayment = async () => {
    if (!invoice) return;
    if (newPayment.amount <= 0) {
      alert('入金額を入力してください');
      return;
    }

    try {
      // 入金記録を追加（簡易実装）
      const record: PaymentRecord = {
        id: `PAY-${Date.now()}`,
        invoiceId: invoice.id,
        ...newPayment,
        createdBy: user?.name || 'Unknown',
        createdAt: new Date().toISOString(),
      };
      setPaymentRecords([...paymentRecords, record]);

      // 請求書の支払状況を更新
      const newPaidAmount = invoice.paidAmount + newPayment.amount;
      const updatedInvoice: Invoice = {
        ...invoice,
        paidAmount: newPaidAmount,
        paymentStatus: newPaidAmount >= invoice.totalAmount ? 'paid' : 'partially_paid',
        status: newPaidAmount >= invoice.totalAmount ? 'paid' : invoice.status,
        paidDate: newPaidAmount >= invoice.totalAmount ? newPayment.paymentDate : invoice.paidDate,
      };

      // APIに更新を送信
      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInvoice),
      });

      if (response.ok) {
        setInvoice(updatedInvoice);
        setShowPaymentModal(false);
        setNewPayment({
          paymentDate: new Date().toISOString().split('T')[0],
          amount: 0,
          paymentMethod: '銀行振込',
          reference: '',
          notes: '',
        });
        alert('入金を記録しました');
      } else {
        throw new Error('Failed to update invoice');
      }
    } catch (err) {
      console.error('Error adding payment:', err);
      alert('入金の記録に失敗しました');
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">請求書が見つかりません</h2>
          <p className="text-gray-600 mb-6">{error || '指定された請求書は存在しません'}</p>
          <button
            onClick={() => router.push('/invoices')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            請求書一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // 支払進捗を計算
  const paymentProgress = invoice.totalAmount > 0
    ? Math.round((invoice.paidAmount / invoice.totalAmount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/invoices')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNo}</h1>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{invoice.projectName}</p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="h-4 w-4" />
                入金記録
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Send className="h-4 w-4" />
                送付
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="flex border-t">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'items'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              明細
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              入金管理
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'related'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              関連情報
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 支払進捗カード */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">支払状況</h2>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">請求金額</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">入金済み</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(invoice.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">未収金</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>入金進捗</span>
                  <span className="font-medium">{paymentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 顧客情報 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">顧客情報</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">顧客名</p>
                    <p className="text-base font-medium text-gray-900">{invoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">会社名</p>
                    <p className="text-base font-medium text-gray-900">{invoice.customerCompany}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">住所</p>
                      <p className="text-base text-gray-900">{invoice.customerAddress}</p>
                    </div>
                  </div>
                  {invoice.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">メール</p>
                        <p className="text-base text-gray-900">{invoice.customerEmail}</p>
                      </div>
                    </div>
                  )}
                  {invoice.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">電話番号</p>
                        <p className="text-base text-gray-900">{invoice.customerPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 請求情報 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">請求情報</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">契約番号</p>
                    <p className="text-base font-medium text-gray-900">{invoice.contractNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">工事種別</p>
                    <p className="text-base font-medium text-gray-900">{invoice.projectType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">発行日</p>
                      <p className="text-base text-gray-900">{invoice.invoiceDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">支払期限</p>
                      <p className="text-base text-gray-900">{invoice.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">支払方法</p>
                      <p className="text-base text-gray-900">{invoice.paymentMethod}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">支払条件</p>
                    <p className="text-base text-gray-900">{invoice.paymentTerms}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 振込先情報 */}
            {invoice.bankInfo && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">振込先情報</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">銀行名</p>
                    <p className="text-base font-medium text-gray-900">{invoice.bankInfo.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">支店名</p>
                    <p className="text-base font-medium text-gray-900">{invoice.bankInfo.branchName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">口座種別</p>
                    <p className="text-base font-medium text-gray-900">{invoice.bankInfo.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">口座番号</p>
                    <p className="text-base font-medium text-gray-900">{invoice.bankInfo.accountNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">口座名義</p>
                    <p className="text-base font-medium text-gray-900">{invoice.bankInfo.accountHolder}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 備考 */}
            {invoice.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">備考</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* 明細タブ */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      項目
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      単位
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      単価
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      金額
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-gray-900">{item.quantity}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-gray-600">{item.unit}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm text-gray-900">{formatCurrency(item.unitPrice)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      小計
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right text-sm text-gray-600">
                      消費税 ({invoice.taxRate}%)
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(invoice.taxAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right text-base font-bold text-gray-900">
                      合計
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 入金管理タブ */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* 入金サマリー */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">入金サマリー</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">請求金額</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">入金済み</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(invoice.paidAmount)}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium mb-1">未収金</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* 入金履歴 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">入金履歴</h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    入金記録
                  </button>
                </div>
              </div>
              <div className="p-6">
                {paymentRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">入金記録がありません</p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      最初の入金を記録する
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(record.amount)}
                            </span>
                            <span className="text-sm text-gray-500">|</span>
                            <span className="text-sm text-gray-600">{record.paymentMethod}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                            <span>入金日: {record.paymentDate}</span>
                            {record.reference && <span>参照: {record.reference}</span>}
                            <span>記録者: {record.createdBy}</span>
                          </div>
                          {record.notes && (
                            <p className="text-sm text-gray-600 ml-8 mt-1">{record.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 関連情報タブ */}
        {activeTab === 'related' && (
          <div className="space-y-6">
            {/* 契約情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">契約情報</h3>
                <button
                  onClick={() => router.push(`/contracts/${invoice.contractId}`)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  契約詳細を見る
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">契約番号</p>
                  <p className="text-base font-medium text-gray-900">{invoice.contractNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">契約ID</p>
                  <p className="text-base font-medium text-gray-900">{invoice.contractId}</p>
                </div>
              </div>
            </div>

            {/* 工事台帳情報（将来的に連携） */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">工事台帳</h3>
              </div>
              <p className="text-sm text-gray-600">
                この請求書に関連する工事台帳は現在連携されていません。
              </p>
              <p className="text-sm text-gray-500 mt-2">
                契約番号: {invoice.contractNo} から工事台帳を検索できます。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 入金記録モーダル */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">入金記録</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入金日</label>
                <input
                  type="date"
                  value={newPayment.paymentDate}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入金額</label>
                <input
                  type="number"
                  value={newPayment.amount || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  未収金: {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支払方法</label>
                <select
                  value={newPayment.paymentMethod}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="銀行振込">銀行振込</option>
                  <option value="現金">現金</option>
                  <option value="クレジットカード">クレジットカード</option>
                  <option value="手形">手形</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参照番号（任意）</label>
                <input
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="振込番号など"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考（任意）</label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="メモなど"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddPayment}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                記録する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
