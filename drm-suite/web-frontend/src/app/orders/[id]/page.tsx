'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Send,
  Download,
  Edit,
  RefreshCw,
} from 'lucide-react';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?id=${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('発注データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToDW = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/orders/sync-to-dw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!response.ok) throw new Error('Failed to sync to DW');

      alert('DWへの送信が完了しました');
      loadOrder();
    } catch (error) {
      console.error('Error syncing to DW:', error);
      alert('DWへの送信に失敗しました');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: '下書き' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '承認待ち' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: '承認済み' },
      sent_to_dw: { bg: 'bg-green-100', text: 'text-green-800', label: 'DW送信済み' },
      in_progress: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: '進行中' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: '完了' },
    };
    const cfg = config[status] || config.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  };

  const getSyncStatusBadge = (syncStatus: string) => {
    const config: any = {
      not_synced: { bg: 'bg-gray-100', text: 'text-gray-800', label: '未送信', icon: AlertTriangle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '送信中', icon: RefreshCw },
      synced: { bg: 'bg-green-100', text: 'text-green-800', label: '同期済み', icon: CheckCircle },
      error: { bg: 'bg-red-100', text: 'text-red-800', label: 'エラー', icon: AlertTriangle },
    };
    const cfg = config[syncStatus] || config.not_synced;
    const Icon = cfg.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text} flex items-center gap-1 inline-flex`}>
        <Icon className="h-4 w-4" />
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">発注データが見つかりません</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            発注一覧へ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  発注書詳細
                </h1>
                <p className="text-sm text-gray-600 mt-1">{order.orderNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="h-4 w-4" />
                編集
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <Download className="h-4 w-4" />
                PDF出力
              </button>
              {order.dwSyncStatus === 'not_synced' && order.status === 'approved' && (
                <button
                  onClick={handleSyncToDW}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {syncing ? 'DW送信中...' : 'DWに送信'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 期限アラート */}
        {(order.isOverdue || order.daysUntilDeadline <= 3) && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              order.isOverdue
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`h-5 w-5 mt-0.5 ${
                  order.isOverdue ? 'text-red-600' : 'text-yellow-600'
                }`}
              />
              <div>
                <p
                  className={`font-medium ${
                    order.isOverdue ? 'text-red-900' : 'text-yellow-900'
                  }`}
                >
                  {order.isOverdue ? '発注期限超過！' : '発注期限まであとわずか'}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    order.isOverdue ? 'text-red-700' : 'text-yellow-700'
                  }`}
                >
                  期限: {order.orderDeadline} (
                  {order.isOverdue ? '期限超過' : `あと${order.daysUntilDeadline}日`})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ステータス・基本情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getStatusBadge(order.status)}
              {getSyncStatusBadge(order.dwSyncStatus)}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">発注日</p>
              <p className="text-lg font-bold text-gray-900">{order.orderDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">プロジェクト名</p>
              <p className="text-lg font-bold text-gray-900">{order.projectName}</p>
              <p className="text-sm text-gray-600 mt-1">契約: {order.contractNo}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">発注金額</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{order.totalAmount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                (税抜: ¥{order.subtotal?.toLocaleString()})
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">工期</p>
              <p className="text-lg font-bold text-gray-900">{order.duration}日間</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.startDate} ～ {order.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* 協力会社情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            協力会社情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">会社名</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {order.partnerName}
              </p>
            </div>
            {order.partnerContact && (
              <div>
                <p className="text-sm text-gray-600">担当者</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {order.partnerContact}
                </p>
              </div>
            )}
            {order.partnerEmail && (
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {order.partnerEmail}
                </p>
              </div>
            )}
            {order.partnerPhone && (
              <div>
                <p className="text-sm text-gray-600">電話番号</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {order.partnerPhone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 工事項目 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">工事項目</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    工事分類
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    工事名
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    数量
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    単位
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    単価
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    金額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.workItems?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ¥{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      ¥{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    小計
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    ¥{order.subtotal?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    消費税（10%）
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    ¥{order.taxAmount?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    合計金額
                  </td>
                  <td className="px-4 py-3 text-lg font-bold text-green-600 text-right">
                    ¥{order.totalAmount?.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 支払条件・メモ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              支払条件
            </h2>
            <p className="text-gray-900 whitespace-pre-wrap">
              {order.paymentTerms || '未設定'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">メモ</h2>
            <p className="text-gray-900 whitespace-pre-wrap">
              {order.notes || 'なし'}
            </p>
          </div>
        </div>

        {/* DW連携情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">DW連携情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">DRM発注ID</p>
              <p className="text-gray-900 mt-1 font-mono">{order.drmOrderId}</p>
            </div>
            {order.dwOrderId && (
              <div>
                <p className="text-gray-600">DW発注ID</p>
                <p className="text-gray-900 mt-1 font-mono">{order.dwOrderId}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">同期ステータス</p>
              <div className="mt-1">{getSyncStatusBadge(order.dwSyncStatus)}</div>
            </div>
            {order.dwSyncedAt && (
              <div>
                <p className="text-gray-600">最終同期日時</p>
                <p className="text-gray-900 mt-1">{order.dwSyncedAt}</p>
              </div>
            )}
            {order.dwSyncError && (
              <div className="md:col-span-3">
                <p className="text-gray-600">エラー内容</p>
                <p className="text-red-600 mt-1">{order.dwSyncError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
