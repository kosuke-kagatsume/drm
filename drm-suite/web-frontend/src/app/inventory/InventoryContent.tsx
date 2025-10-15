'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  inventoryService,
  type InventoryItem,
  type CreateInventoryDto,
  type CreateStockMovementDto,
} from '@/services/inventory.service';

export default function InventoryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState({
    companyId: 'default-company',
    storeId: 'default-store',
    limit: 20,
    offset: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjust'>(
    'in',
  );
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: '個',
    location: '',
  });

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventories(filter);
      setItems(response.items);
      setTotalItems(response.total);
    } catch (err) {
      setError('在庫データの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const createDto: CreateInventoryDto = {
        companyId: filter.companyId,
        storeId: filter.storeId,
        sku: newItem.sku || `SKU-${Date.now()}`,
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        currentStock: Number(newItem.currentStock),
        minStock: Number(newItem.minStock),
        maxStock: Number(newItem.maxStock),
        unit: newItem.unit,
        location: newItem.location,
        isActive: true,
      };

      await inventoryService.createInventory(createDto);
      await fetchInventory();
      setShowAddModal(false);
      setNewItem({
        sku: '',
        name: '',
        description: '',
        category: '',
        currentStock: '',
        minStock: '',
        maxStock: '',
        unit: '個',
        location: '',
      });
    } catch (err) {
      alert('商品の追加に失敗しました');
      console.error(err);
    }
  };

  const handleStockMovement = async () => {
    if (!selectedItem || !movementQuantity || !movementReason) return;

    try {
      const movementDto: CreateStockMovementDto = {
        inventoryId: selectedItem.id,
        type: movementType,
        quantity: Number(movementQuantity),
        reason: movementReason,
      };

      await inventoryService.createStockMovement(movementDto);
      await fetchInventory();
      setShowMovementModal(false);
      setSelectedItem(null);
      setMovementQuantity('');
      setMovementReason('');
    } catch (err) {
      alert('在庫移動の記録に失敗しました');
      console.error(err);
    }
  };

  const getStatusBadge = (item: InventoryItem) => {
    let status = 'normal';
    let label = '正常';
    let colorClass = 'bg-green-100 text-green-800';

    if (item.currentStock === 0) {
      status = 'out';
      label = '在庫切れ';
      colorClass = 'bg-red-100 text-red-800';
    } else if (item.lowStock) {
      status = 'low';
      label = '在庫少';
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else if (item.overStock) {
      status = 'over';
      label = '過剰在庫';
      colorClass = 'bg-blue-100 text-blue-800';
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

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
              {items.reduce((sum, item) => sum + Number(item.currentStock), 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">在庫不足</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {items.filter((item) => item.lowStock).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">在庫切れ</h3>
            <p className="text-3xl font-bold text-red-600">
              {items.filter((item) => item.currentStock === 0).length}
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
                    最小/最大在庫
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    単位
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
                      {Number(item.currentStock)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {Number(item.minStock)} / {Number(item.maxStock)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.unit}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowMovementModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        在庫移動
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
