'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PurchasingDashboardProps {
  userEmail: string;
}

interface OrderItem {
  id: string;
  projectName: string;
  vendor: string;
  items: string;
  amount: number;
  requestDate: string;
  deliveryDate: string;
  status: 'pending' | 'approved' | 'ordered' | 'delivered';
  urgency: 'high' | 'medium' | 'low';
}

interface VendorStock {
  vendor: string;
  category: string;
  availableItems: number;
  leadTime: string;
  reliability: number;
  lastOrder: string;
}

interface StockAlert {
  item: string;
  currentStock: number;
  requiredStock: number;
  projects: string[];
}

export default function PurchasingDashboard({
  userEmail,
}: PurchasingDashboardProps) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const pendingOrders: OrderItem[] = [
    {
      id: 'PO-001',
      projectName: '田中様邸 外壁塗装',
      vendor: '塗料センター株式会社',
      items: '外壁塗料 20缶, プライマー 10缶',
      amount: 480000,
      requestDate: '本日 09:00',
      deliveryDate: '3日後',
      status: 'pending',
      urgency: 'high',
    },
    {
      id: 'PO-002',
      projectName: '山田ビル リフォーム',
      vendor: '建材商事',
      items: '断熱材 50㎡, 石膏ボード 30枚',
      amount: 320000,
      requestDate: '本日 10:30',
      deliveryDate: '5日後',
      status: 'pending',
      urgency: 'medium',
    },
    {
      id: 'PO-003',
      projectName: '佐藤邸 屋根修理',
      vendor: '瓦工業',
      items: '瓦 100枚, 防水シート 20m',
      amount: 250000,
      requestDate: '昨日',
      deliveryDate: '1週間後',
      status: 'approved',
      urgency: 'low',
    },
  ];

  const vendorStock: VendorStock[] = [
    {
      vendor: '塗料センター株式会社',
      category: '塗料・塗装材',
      availableItems: 145,
      leadTime: '2-3日',
      reliability: 95,
      lastOrder: '3日前',
    },
    {
      vendor: '建材商事',
      category: '建築資材全般',
      availableItems: 523,
      leadTime: '3-5日',
      reliability: 88,
      lastOrder: '1週間前',
    },
    {
      vendor: '瓦工業',
      category: '屋根材',
      availableItems: 89,
      leadTime: '5-7日',
      reliability: 92,
      lastOrder: '2週間前',
    },
  ];

  const stockAlerts: StockAlert[] = [
    {
      item: '外壁用プライマー',
      currentStock: 5,
      requiredStock: 20,
      projects: ['田中様邸', '鈴木マンション'],
    },
    {
      item: '防水シート',
      currentStock: 10,
      requiredStock: 30,
      projects: ['佐藤邸', '高橋ビル'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'ordered':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'ordered':
        return '発注済み';
      case 'delivered':
        return '納品済み';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* 緊急アラート */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚨</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                緊急発注が必要
              </h3>
              <p className="text-sm text-red-700 mt-1">
                田中様邸の外壁塗料が本日中に発注必要です
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrder('PO-001')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            今すぐ発注
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 発注申請一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-800">
                📦 発注申請一覧
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`border-l-4 p-4 rounded ${getUrgencyColor(order.urgency)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {order.projectName}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        発注先: {order.vendor}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold">
                            ¥{order.amount.toLocaleString()}
                          </span>
                          <span className="ml-3 text-sm text-gray-500">
                            納期: {order.deliveryDate}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <>
                              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                承認
                              </button>
                              <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                                保留
                              </button>
                            </>
                          )}
                          {order.status === 'approved' && (
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                              発注実行
                            </button>
                          )}
                          <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                            詳細
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 在庫アラート */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b bg-orange-50">
              <h2 className="text-lg font-semibold text-orange-800">
                ⚠️ 在庫不足アラート
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stockAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {alert.item}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          現在庫:{' '}
                          <span className="text-red-600 font-bold">
                            {alert.currentStock}個
                          </span>
                          {' / '}
                          必要数:{' '}
                          <span className="font-bold">
                            {alert.requiredStock}個
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          使用予定: {alert.projects.join(', ')}
                        </p>
                      </div>
                      <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                        発注
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右サイドバー */}
        <div className="lg:col-span-1 space-y-6">
          {/* 本日のサマリー */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">📊 本日のサマリー</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">新規申請</span>
                <span className="font-bold text-blue-600">5件</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">承認待ち</span>
                <span className="font-bold text-yellow-600">3件</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">本日納品予定</span>
                <span className="font-bold text-green-600">2件</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">発注総額</span>
                <span className="font-bold">¥1,050,000</span>
              </div>
            </div>
          </div>

          {/* 協力会社在庫状況 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">🏢 協力会社在庫状況</h3>
            </div>
            <div className="p-4 space-y-3">
              {vendorStock.map((vendor, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{vendor.vendor}</p>
                      <p className="text-xs text-gray-500">{vendor.category}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        vendor.reliability >= 90
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      信頼度 {vendor.reliability}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">在庫数:</span>
                      <span className="ml-1 font-medium">
                        {vendor.availableItems}品
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">納期:</span>
                      <span className="ml-1 font-medium">
                        {vendor.leadTime}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    最終発注: {vendor.lastOrder}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold">⚡ クイックアクション</h3>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                新規発注申請
              </button>
              <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                在庫確認
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                納品確認
              </button>
              <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                協力会社一覧
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
