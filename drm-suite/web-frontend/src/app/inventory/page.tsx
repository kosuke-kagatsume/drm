'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      sku: 'SKU-001',
      name: 'ノートパソコン',
      category: 'IT機器',
      quantity: 15,
      minQuantity: 10,
      price: 120000,
      status: 'in_stock',
    },
    {
      id: '2',
      sku: 'SKU-002',
      name: 'オフィスチェア',
      category: '家具',
      quantity: 8,
      minQuantity: 10,
      price: 35000,
      status: 'low_stock',
    },
    {
      id: '3',
      sku: 'SKU-003',
      name: 'プリンター用紙',
      category: '消耗品',
      quantity: 0,
      minQuantity: 50,
      price: 500,
      status: 'out_of_stock',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    price: '',
  });

  useEffect(() => {
    // Check localStorage for login information
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    if (!role || !email) {
      router.push('/login');
    }
  }, [router]);

  const handleAddItem = () => {
    const item: InventoryItem = {
      id: Date.now().toString(),
      sku: `SKU-${String(items.length + 1).padStart(3, '0')}`,
      name: newItem.name,
      category: newItem.category,
      quantity: Number(newItem.quantity),
      minQuantity: Number(newItem.minQuantity),
      price: Number(newItem.price),
      status:
        Number(newItem.quantity) === 0
          ? 'out_of_stock'
          : Number(newItem.quantity) < Number(newItem.minQuantity)
            ? 'low_stock'
            : 'in_stock',
    };
    setItems([...items, item]);
    setShowAddModal(false);
    setNewItem({
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      price: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    const labels = {
      in_stock: '在庫あり',
      low_stock: '在庫少',
      out_of_stock: '在庫切れ',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← ダッシュボード
            </button>
            <h1 className="text-2xl font-bold text-gray-900">在庫管理</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">総在庫数</h3>
            <p className="text-3xl font-bold text-gray-900">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">在庫不足</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {items.filter((item) => item.status === 'low_stock').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">在庫切れ</h3>
            <p className="text-3xl font-bold text-red-600">
              {items.filter((item) => item.status === 'out_of_stock').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">在庫一覧</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              + 商品追加
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    商品名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    カテゴリ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    在庫数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    最小在庫
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    単価
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {item.minQuantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      ¥{item.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        編集
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        入荷
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">商品追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    在庫数
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最小在庫
                  </label>
                  <input
                    type="number"
                    value={newItem.minQuantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, minQuantity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  単価
                </label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
