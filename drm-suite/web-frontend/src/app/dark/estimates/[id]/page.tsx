'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

export default function DarkEstimateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [estimate, setEstimate] = useState<EstimateData>({
    id: params.id as string,
    customer: 'TANAKA CONSTRUCTION CO., LTD.',
    projectName: 'TANAKA RESIDENCE EXTERIOR WALL & ROOF PAINTING',
    address: 'ROPPONGI 1-1-1, MINATO-KU, TOKYO',
    workType: 'EXTERIOR WALL & ROOF PAINTING',
    createdDate: '2024-01-15',
    validUntil: '2024-02-15',
    status: 'sent',
    subtotal: 2500000,
    tax: 250000,
    total: 2750000,
    notes:
      'NOTE: NOISE MAY OCCUR DURING SCAFFOLDING INSTALLATION\nNOTE: WORK WILL BE SUSPENDED DURING RAIN',
    items: [
      {
        id: '1',
        category: 'SCAFFOLDING',
        description: 'EXTERNAL SCAFFOLDING INSTALLATION & REMOVAL',
        unit: 'SQM',
        quantity: 150,
        unitPrice: 1200,
        laborCost: 120000,
        materialCost: 60000,
        totalPrice: 180000,
        margin: 33,
        notes: 'SAFETY MEASURES INCLUDED',
      },
      {
        id: '2',
        category: 'EXTERIOR PAINTING',
        description: 'SILICONE PAINT 3-COAT SYSTEM',
        unit: 'SQM',
        quantity: 120,
        unitPrice: 3500,
        laborCost: 280000,
        materialCost: 140000,
        totalPrice: 420000,
        margin: 25,
        notes: 'PRIMER + MIDDLE COAT + TOP COAT',
      },
      {
        id: '3',
        category: 'ROOF PAINTING',
        description: 'URETHANE PAINT 3-COAT SYSTEM',
        unit: 'SQM',
        quantity: 80,
        unitPrice: 4200,
        laborCost: 224000,
        materialCost: 112000,
        totalPrice: 336000,
        margin: 30,
        notes: 'TASPACER INSTALLATION INCLUDED',
      },
      {
        id: '4',
        category: 'AUXILIARY WORK',
        description: 'GUTTER & FASCIA BOARD PAINTING',
        unit: 'SET',
        quantity: 1,
        unitPrice: 180000,
        laborCost: 120000,
        materialCost: 60000,
        totalPrice: 180000,
        margin: 33,
        notes: 'PARTIAL REPAIR INCLUDED',
      },
    ],
  });

  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<EstimateItem>>({
    category: '',
    description: '',
    unit: 'SQM',
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
      unit: newItem.unit || 'SQM',
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
      unit: 'SQM',
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
      description: `${item.description} (COPY)`,
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        color: 'text-zinc-500 border-zinc-500/50',
        label: 'DRAFT',
        indicator: '01',
      },
      sent: {
        color: 'text-blue-500 border-blue-500/50',
        label: 'SENT',
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
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${config.color} flex items-center gap-2 inline-flex`}
      >
        <span>{config.indicator}</span>
        <span>{config.label}</span>
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.back()}
                className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← BACK
              </button>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                ESTIMATE DETAIL #{estimate.id}
              </h1>
              {getStatusBadge(estimate.status)}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-6 py-3 text-xs tracking-wider transition-colors ${
                  isEditing
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isEditing ? 'FINISH EDITING' : 'START EDITING'}
              </button>
              <button className="bg-emerald-500 text-white px-6 py-3 text-xs tracking-wider hover:bg-emerald-400 transition-colors">
                EXPORT PDF
              </button>
              {estimate.status === 'draft' && (
                <button className="bg-purple-500 text-white px-6 py-3 text-xs tracking-wider hover:bg-purple-400 transition-colors">
                  SEND
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
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h2 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  01
                </span>
                PROJECT OVERVIEW
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    CUSTOMER NAME
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    />
                  ) : (
                    <p className="text-white font-light tracking-wider">
                      {estimate.customer}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    PROJECT NAME
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    />
                  ) : (
                    <p className="text-white font-light tracking-wider">
                      {estimate.projectName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    PROJECT ADDRESS
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    />
                  ) : (
                    <p className="text-white font-light tracking-wider">
                      {estimate.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    WORK TYPE
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    >
                      <option value="EXTERIOR WALL & ROOF PAINTING">
                        EXTERIOR WALL & ROOF PAINTING
                      </option>
                      <option value="EXTERIOR WALL PAINTING">
                        EXTERIOR WALL PAINTING
                      </option>
                      <option value="ROOF PAINTING">ROOF PAINTING</option>
                      <option value="WATERPROOFING">WATERPROOFING</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  ) : (
                    <p className="text-white font-light tracking-wider">
                      {estimate.workType}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estimate Items */}
            <div className="bg-zinc-950 border border-zinc-800">
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-light text-white tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    02
                  </span>
                  ESTIMATE DETAILS
                </h2>
                {isEditing && (
                  <button
                    onClick={() =>
                      setNewItem({ ...newItem, category: '', description: '' })
                    }
                    className="bg-emerald-500 text-white px-6 py-2 text-xs tracking-wider hover:bg-emerald-400 transition-colors"
                  >
                    ADD ITEM
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs text-zinc-500 tracking-widest">
                        CATEGORY
                      </th>
                      <th className="px-4 py-4 text-left text-xs text-zinc-500 tracking-widest">
                        DESCRIPTION
                      </th>
                      <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                        UNIT
                      </th>
                      <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                        QTY
                      </th>
                      <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                        UNIT PRICE
                      </th>
                      <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                        AMOUNT
                      </th>
                      <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                        MARGIN
                      </th>
                      {isEditing && (
                        <th className="px-4 py-4 text-center text-xs text-zinc-500 tracking-widest">
                          ACTIONS
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {estimate.items.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-900/50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-light text-white tracking-wider">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                              {String(index + 1).padStart(2, '0')}
                            </span>
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
                                className="w-full px-2 py-1 bg-black border border-zinc-700 text-white text-sm tracking-wider"
                              />
                            ) : (
                              item.category
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-white font-light tracking-wider">
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
                              className="w-full px-2 py-1 bg-black border border-zinc-700 text-white text-sm tracking-wider"
                            />
                          ) : (
                            <div>
                              <p>{item.description}</p>
                              {item.notes && (
                                <p className="text-xs text-zinc-500 mt-1 tracking-wider">
                                  • {item.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-white font-light tracking-wider">
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
                              className="w-full px-2 py-1 bg-black border border-zinc-700 text-white text-sm tracking-wider"
                            >
                              <option value="SQM">SQM</option>
                              <option value="M">M</option>
                              <option value="PCS">PCS</option>
                              <option value="SET">SET</option>
                            </select>
                          ) : (
                            item.unit
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-white font-light tracking-wider">
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
                              className="w-20 px-2 py-1 bg-black border border-zinc-700 text-white text-sm text-center tracking-wider"
                            />
                          ) : (
                            item.quantity.toLocaleString()
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-white font-light tracking-wider">
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
                              className="w-24 px-2 py-1 bg-black border border-zinc-700 text-white text-sm text-center tracking-wider"
                            />
                          ) : (
                            `¥${item.unitPrice.toLocaleString()}`
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-center font-light text-white tracking-wider">
                          ¥{item.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-center">
                          <span
                            className={`px-2 py-1 border text-xs tracking-wider ${
                              item.margin >= 25
                                ? 'text-emerald-500 border-emerald-500/50'
                                : item.margin >= 15
                                  ? 'text-amber-500 border-amber-500/50'
                                  : 'text-red-500 border-red-500/50'
                            }`}
                          >
                            {item.margin}%
                          </span>
                        </td>
                        {isEditing && (
                          <td className="px-4 py-4 text-center">
                            {editingItem?.id === item.id ? (
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={handleItemSave}
                                  className="text-emerald-500 hover:text-emerald-400 text-xs tracking-wider"
                                >
                                  SAVE
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="text-zinc-500 hover:text-zinc-400 text-xs tracking-wider"
                                >
                                  CANCEL
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleItemEdit(item)}
                                  className="text-blue-500 hover:text-blue-400 text-xs tracking-wider"
                                >
                                  EDIT
                                </button>
                                <button
                                  onClick={() => duplicateItem(item)}
                                  className="text-purple-500 hover:text-purple-400 text-xs tracking-wider"
                                >
                                  DUPLICATE
                                </button>
                                <button
                                  onClick={() => handleItemDelete(item.id)}
                                  className="text-red-500 hover:text-red-400 text-xs tracking-wider"
                                >
                                  DELETE
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}

                    {/* Add New Item Row */}
                    {isEditing && (
                      <tr className="bg-zinc-900/50">
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
                            placeholder="CATEGORY"
                            className="w-full px-2 py-1 bg-black border border-zinc-700 text-white placeholder-zinc-600 text-sm tracking-wider"
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
                            placeholder="DESCRIPTION"
                            className="w-full px-2 py-1 bg-black border border-zinc-700 text-white placeholder-zinc-600 text-sm tracking-wider"
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
                            className="w-full px-2 py-1 bg-black border border-zinc-700 text-white text-sm tracking-wider"
                          >
                            <option value="SQM">SQM</option>
                            <option value="M">M</option>
                            <option value="PCS">PCS</option>
                            <option value="SET">SET</option>
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
                            className="w-20 px-2 py-1 bg-black border border-zinc-700 text-white placeholder-zinc-600 text-sm text-center tracking-wider"
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
                            className="w-24 px-2 py-1 bg-black border border-zinc-700 text-white placeholder-zinc-600 text-sm text-center tracking-wider"
                          />
                        </td>
                        <td className="px-4 py-4 text-center text-white font-light tracking-wider">
                          ¥
                          {calculateItemTotal(
                            newItem,
                          ).totalPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs text-zinc-600 tracking-wider">
                            {calculateItemTotal(newItem).margin}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={handleItemAdd}
                            className="bg-emerald-500 text-white px-3 py-1 text-xs tracking-wider hover:bg-emerald-400"
                          >
                            ADD
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  03
                </span>
                NOTES & SPECIAL REMARKS
              </h3>
              {isEditing ? (
                <textarea
                  value={estimate.notes}
                  onChange={(e) =>
                    setEstimate((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                />
              ) : (
                <div className="text-zinc-300 whitespace-pre-line font-light tracking-wider text-sm">
                  {estimate.notes}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Total Summary */}
            <div className="bg-zinc-950 border border-zinc-800 p-6">
              <h3 className="text-lg font-light text-white mb-6 tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                  04
                </span>
                AMOUNT SUMMARY
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    SUBTOTAL:
                  </span>
                  <span className="font-light text-white tracking-wider">
                    ¥{estimate.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-xs tracking-wider">
                    TAX (10%):
                  </span>
                  <span className="font-light text-white tracking-wider">
                    ¥{estimate.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-thin border-t border-zinc-800 pt-4">
                  <span className="tracking-wider">TOTAL:</span>
                  <span className="text-emerald-500 tracking-wider">
                    ¥{estimate.total.toLocaleString()}
                  </span>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500 text-xs tracking-wider">
                      AVG MARGIN:
                    </span>
                    <span className="font-light text-white tracking-wider">
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

            {/* AI Assistant */}
            <div className="bg-zinc-950 border border-zinc-800">
              <div className="px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                <h3 className="font-light text-white tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                    AI
                  </span>
                  ESTIMATE ASSISTANT
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-purple-900/10 border border-purple-500/20 p-4">
                    <p className="text-xs font-normal text-purple-400 mb-3 tracking-wider">
                      SUGGESTION
                    </p>
                    <p className="text-xs text-purple-300 mb-3 font-light tracking-wider">
                      THE 25% AVERAGE MARGIN FOR EXTERIOR PAINTING IS
                      APPROPRIATE. COMPARE WITH SIMILAR PAST PROJECTS?
                    </p>
                    <button className="text-xs bg-purple-500 text-white px-4 py-2 tracking-wider hover:bg-purple-400 transition-colors">
                      COMPARE
                    </button>
                  </div>
                  <div>
                    <textarea
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 text-sm tracking-wider focus:outline-none focus:border-zinc-600 transition-colors"
                      rows={3}
                      placeholder="ASK AI FOR ASSISTANCE..."
                    />
                    <button className="mt-3 w-full bg-purple-500 text-white py-3 hover:bg-purple-400 text-xs tracking-wider transition-colors">
                      CONSULT AI
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
