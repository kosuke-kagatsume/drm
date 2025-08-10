'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface EstimateItem {
  id: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  laborCost: number;
  materialCost: number;
  totalPrice: number;
  margin: number;
  notes?: string;
}

interface EstimateData {
  id: string;
  customer: string;
  projectName: string;
  address: string;
  workType: string;
  createdDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
}

export default function EstimateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [estimate, setEstimate] = useState<EstimateData>({
    id: params.id as string,
    customer: '田中建設株式会社',
    projectName: '田中様邸 外壁・屋根塗装工事',
    address: '東京都港区六本木1-1-1',
    workType: '外壁・屋根塗装',
    createdDate: '2024-01-15',
    validUntil: '2024-02-15',
    status: 'sent',
    subtotal: 2500000,
    tax: 250000,
    total: 2750000,
    notes:
      '※足場設置期間中は騒音が発生する場合があります\n※雨天時は作業を中止いたします',
    items: [
      {
        id: '1',
        category: '足場工事',
        description: '外部足場設置・撤去',
        unit: '㎡',
        quantity: 150,
        unitPrice: 1200,
        laborCost: 120000,
        materialCost: 60000,
        totalPrice: 180000,
        margin: 33,
        notes: '安全対策込み',
      },
      {
        id: '2',
        category: '外壁塗装',
        description: 'シリコン塗料 3回塗り',
        unit: '㎡',
        quantity: 120,
        unitPrice: 3500,
        laborCost: 280000,
        materialCost: 140000,
        totalPrice: 420000,
        margin: 25,
        notes: 'プライマー・中塗り・上塗り',
      },
      {
        id: '3',
        category: '屋根塗装',
        description: 'ウレタン塗料 3回塗り',
        unit: '㎡',
        quantity: 80,
        unitPrice: 4200,
        laborCost: 224000,
        materialCost: 112000,
        totalPrice: 336000,
        margin: 30,
        notes: 'タスペーサー設置込み',
      },
      {
        id: '4',
        category: '付帯工事',
        description: '雨樋・破風板塗装',
        unit: '式',
        quantity: 1,
        unitPrice: 180000,
        laborCost: 120000,
        materialCost: 60000,
        totalPrice: 180000,
        margin: 33,
        notes: '部分補修込み',
      },
    ],
  });

  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<EstimateItem>>({
    category: '',
    description: '',
    unit: '㎡',
    quantity: 0,
    unitPrice: 0,
    laborCost: 0,
    materialCost: 0,
    notes: '',
  });

  const calculateItemTotal = (item: Partial<EstimateItem>) => {
    const quantity = item.quantity || 0;
    const laborCost = item.laborCost || 0;
    const materialCost = item.materialCost || 0;
    const totalCost = laborCost + materialCost;
    const totalPrice = quantity * (item.unitPrice || 0);
    const margin =
      totalCost > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

    return {
      totalPrice,
      margin: Math.round(margin),
    };
  };

  const handleItemEdit = (item: EstimateItem) => {
    setEditingItem({ ...item });
  };

  const handleItemSave = () => {
    if (!editingItem) return;

    const calculated = calculateItemTotal(editingItem);
    const updatedItem = {
      ...editingItem,
      totalPrice: calculated.totalPrice,
      margin: calculated.margin,
    };

    setEstimate((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === editingItem.id ? updatedItem : item,
      ),
    }));
    setEditingItem(null);
  };

  const handleItemAdd = () => {
    if (!newItem.category || !newItem.description) return;

    const calculated = calculateItemTotal(newItem);
    const item: EstimateItem = {
      id: Date.now().toString(),
      category: newItem.category || '',
      description: newItem.description || '',
      unit: newItem.unit || '㎡',
      quantity: newItem.quantity || 0,
      unitPrice: newItem.unitPrice || 0,
      laborCost: newItem.laborCost || 0,
      materialCost: newItem.materialCost || 0,
      totalPrice: calculated.totalPrice,
      margin: calculated.margin,
      notes: newItem.notes,
    };

    setEstimate((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({
      category: '',
      description: '',
      unit: '㎡',
      quantity: 0,
      unitPrice: 0,
      laborCost: 0,
      materialCost: 0,
      notes: '',
    });
  };

  const handleItemDelete = (id: string) => {
    setEstimate((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const duplicateItem = (item: EstimateItem) => {
    const newItem: EstimateItem = {
      ...item,
      id: Date.now().toString(),
      description: `${item.description} (コピー)`,
    };
    setEstimate((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Recalculate totals when items change
  useEffect(() => {
    const subtotal = estimate.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    setEstimate((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }));
  }, [estimate.items]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'sent':
        return '送付済み';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                見積書詳細 #{estimate.id}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estimate.status)}`}
              >
                {getStatusLabel(estimate.status)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? '編集終了' : '編集開始'}
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                PDF出力
              </button>
              {estimate.status === 'draft' && (
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  送付
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📋 工事概要</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顧客名
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={estimate.customer}
                      onChange={(e) =>
                        setEstimate((prev) => ({
                          ...prev,
                          customer: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{estimate.customer}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工事名
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={estimate.projectName}
                      onChange={(e) =>
                        setEstimate((prev) => ({
                          ...prev,
                          projectName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{estimate.projectName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工事住所
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={estimate.address}
                      onChange={(e) =>
                        setEstimate((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900">{estimate.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工事種別
                  </label>
                  {isEditing ? (
                    <select
                      value={estimate.workType}
                      onChange={(e) =>
                        setEstimate((prev) => ({
                          ...prev,
                          workType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="外壁・屋根塗装">外壁・屋根塗装</option>
                      <option value="外壁塗装">外壁塗装</option>
                      <option value="屋根塗装">屋根塗装</option>
                      <option value="防水工事">防水工事</option>
                      <option value="その他">その他</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{estimate.workType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Estimate Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">📝 見積明細</h2>
                {isEditing && (
                  <button
                    onClick={() =>
                      setNewItem({ ...newItem, category: '', description: '' })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    項目追加
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        工種
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        工事内容
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        単位
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        数量
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        単価
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        金額
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        粗利率
                      </th>
                      {isEditing && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          操作
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {estimate.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              value={editingItem.category}
                              onChange={(e) =>
                                setEditingItem((prev) =>
                                  prev
                                    ? { ...prev, category: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            item.category
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              value={editingItem.description}
                              onChange={(e) =>
                                setEditingItem((prev) =>
                                  prev
                                    ? { ...prev, description: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <div>
                              <p>{item.description}</p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ※ {item.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          {editingItem?.id === item.id ? (
                            <select
                              value={editingItem.unit}
                              onChange={(e) =>
                                setEditingItem((prev) =>
                                  prev
                                    ? { ...prev, unit: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="㎡">㎡</option>
                              <option value="m">m</option>
                              <option value="個">個</option>
                              <option value="式">式</option>
                            </select>
                          ) : (
                            item.unit
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          {editingItem?.id === item.id ? (
                            <input
                              type="number"
                              value={editingItem.quantity}
                              onChange={(e) =>
                                setEditingItem((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        quantity:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : null,
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                          ) : (
                            item.quantity.toLocaleString()
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          {editingItem?.id === item.id ? (
                            <input
                              type="number"
                              value={editingItem.unitPrice}
                              onChange={(e) =>
                                setEditingItem((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        unitPrice:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : null,
                                )
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                          ) : (
                            `¥${item.unitPrice.toLocaleString()}`
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center font-medium">
                          ¥{item.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.margin >= 25
                                ? 'bg-green-100 text-green-800'
                                : item.margin >= 15
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.margin}%
                          </span>
                        </td>
                        {isEditing && (
                          <td className="px-4 py-4 text-center">
                            {editingItem?.id === item.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleItemSave}
                                  className="text-green-600 hover:text-green-800 text-xs"
                                >
                                  保存
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="text-gray-600 hover:text-gray-800 text-xs"
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleItemEdit(item)}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => duplicateItem(item)}
                                  className="text-purple-600 hover:text-purple-800 text-xs"
                                >
                                  複製
                                </button>
                                <button
                                  onClick={() => handleItemDelete(item.id)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  削除
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}

                    {/* Add New Item Row */}
                    {isEditing && (
                      <tr className="bg-blue-50">
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={newItem.category}
                            onChange={(e) =>
                              setNewItem((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                            placeholder="工種"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={newItem.description}
                            onChange={(e) =>
                              setNewItem((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="工事内容"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={newItem.unit}
                            onChange={(e) =>
                              setNewItem((prev) => ({
                                ...prev,
                                unit: e.target.value,
                              }))
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="㎡">㎡</option>
                            <option value="m">m</option>
                            <option value="個">個</option>
                            <option value="式">式</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) =>
                              setNewItem((prev) => ({
                                ...prev,
                                quantity: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={newItem.unitPrice}
                            onChange={(e) =>
                              setNewItem((prev) => ({
                                ...prev,
                                unitPrice: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          ¥
                          {calculateItemTotal(
                            newItem,
                          ).totalPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs text-gray-600">
                            {calculateItemTotal(newItem).margin}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={handleItemAdd}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            追加
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">📝 備考・特記事項</h3>
              {isEditing ? (
                <textarea
                  value={estimate.notes}
                  onChange={(e) =>
                    setEstimate((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <div className="text-gray-700 whitespace-pre-line">
                  {estimate.notes}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Total Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">💰 金額サマリー</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">小計:</span>
                  <span className="font-medium">
                    ¥{estimate.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">消費税 (10%):</span>
                  <span className="font-medium">
                    ¥{estimate.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>合計:</span>
                  <span className="text-blue-600">
                    ¥{estimate.total.toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">平均粗利率:</span>
                    <span className="font-medium">
                      {estimate.items.length > 0
                        ? Math.round(
                            estimate.items.reduce(
                              (sum, item) => sum + item.margin,
                              0,
                            ) / estimate.items.length,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RAG Assistant */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <h3 className="font-semibold">🤖 見積アシスタント</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm font-medium text-purple-900 mb-2">
                      💡 提案
                    </p>
                    <p className="text-xs text-purple-700 mb-2">
                      「外壁塗装の平均粗利率25%は適正です。類似工事の過去実績と比較しますか？」
                    </p>
                    <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded">
                      比較する
                    </button>
                  </div>
                  <div>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      placeholder="例: この見積の適正価格は？"
                    />
                    <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm">
                      AIに相談
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
