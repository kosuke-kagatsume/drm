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
    unit: 'PCS',
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
      setError('INVENTORY DATA RETRIEVAL FAILED');
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
        unit: 'PCS',
        location: '',
      });
    } catch (err) {
      alert('PRODUCT ADDITION FAILED');
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
      alert('STOCK MOVEMENT RECORDING FAILED');
      console.error(err);
    }
  };

  const getStatusBadge = (item: InventoryItem) => {
    let status = 'normal';
    let label = 'NORMAL';
    let indicator = '01';
    let colorClass = 'text-emerald-500 border-emerald-500/50';

    if (item.currentStock === 0) {
      status = 'out';
      label = 'OUT OF STOCK';
      indicator = '04';
      colorClass = 'text-red-500 border-red-500/50';
    } else if (item.lowStock) {
      status = 'low';
      label = 'LOW STOCK';
      indicator = '03';
      colorClass = 'text-amber-500 border-amber-500/50';
    } else if (item.overStock) {
      status = 'over';
      label = 'OVERSTOCK';
      indicator = '02';
      colorClass = 'text-blue-500 border-blue-500/50';
    }

    return (
      <span
        className={`px-3 py-1 border text-xs tracking-wider ${colorClass} flex items-center gap-2 inline-flex`}
      >
        <span>{indicator}</span>
        <span>{label}</span>
      </span>
    );
  };

  if (isLoading || !user || loading) {
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
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dark/dashboard')}
              className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
            >
              ← DASHBOARD
            </button>
            <div className="w-px h-6 bg-zinc-800"></div>
            <h1 className="text-2xl font-thin text-white tracking-widest">
              INVENTORY MANAGEMENT
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  TOTAL STOCK
                </h3>
                <p className="text-3xl font-thin text-white">
                  {items.reduce(
                    (sum, item) => sum + Number(item.currentStock),
                    0,
                  )}
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
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  LOW STOCK
                </h3>
                <p className="text-3xl font-thin text-amber-500">
                  {items.filter((item) => item.lowStock).length}
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
                <h3 className="text-xs text-zinc-500 tracking-wider mb-2">
                  OUT OF STOCK
                </h3>
                <p className="text-3xl font-thin text-red-500">
                  {items.filter((item) => item.currentStock === 0).length}
                </p>
              </div>
              <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                03
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-thin text-white tracking-widest">
              INVENTORY LIST
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-6 py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
            >
              + ADD PRODUCT
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    PRODUCT NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    CATEGORY
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    STOCK
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    MIN/MAX STOCK
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 tracking-widest">
                    UNIT
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
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-light text-white tracking-wider">
                      {item.sku}
                    </td>
                    <td className="px-4 py-4 text-sm text-white tracking-wider">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-400 tracking-wider">
                      {item.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-white">
                      {Number(item.currentStock)}
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-500 tracking-wider">
                      {Number(item.minStock)} / {Number(item.maxStock)}
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-400 tracking-wider">
                      {item.unit}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {getStatusBadge(item)}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowMovementModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-400 transition-colors tracking-wider"
                      >
                        STOCK MOVEMENT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                ADD NEW PRODUCT
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    PRODUCT NAME
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    SKU CODE
                  </label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) =>
                      setNewItem({ ...newItem, sku: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="SKU will be auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter category"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      CURRENT STOCK
                    </label>
                    <input
                      type="number"
                      value={newItem.currentStock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, currentStock: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      MIN STOCK
                    </label>
                    <input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, minStock: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      MAX STOCK
                    </label>
                    <input
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, maxStock: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      UNIT
                    </label>
                    <select
                      value={newItem.unit}
                      onChange={(e) =>
                        setNewItem({ ...newItem, unit: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    >
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="SET">SET</option>
                      <option value="BOX">BOX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      LOCATION
                    </label>
                    <input
                      type="text"
                      value={newItem.location}
                      onChange={(e) =>
                        setNewItem({ ...newItem, location: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                      placeholder="Storage location"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    rows={3}
                    placeholder="Product description"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-8 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  ADD PRODUCT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovementModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-sm font-normal text-white tracking-widest">
                STOCK MOVEMENT - {selectedItem.name}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-500 tracking-wider mb-2">
                  CURRENT STOCK: {Number(selectedItem.currentStock)}{' '}
                  {selectedItem.unit}
                </p>
                <p className="text-xs text-zinc-500 tracking-wider">
                  SKU: {selectedItem.sku}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    MOVEMENT TYPE
                  </label>
                  <select
                    value={movementType}
                    onChange={(e) =>
                      setMovementType(e.target.value as 'in' | 'out' | 'adjust')
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  >
                    <option value="in">STOCK IN</option>
                    <option value="out">STOCK OUT</option>
                    <option value="adjust">ADJUSTMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    QUANTITY
                  </label>
                  <input
                    type="number"
                    value={movementQuantity}
                    onChange={(e) => setMovementQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                    REASON
                  </label>
                  <select
                    value={movementReason}
                    onChange={(e) => setMovementReason(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  >
                    <option value="">SELECT REASON</option>
                    <option value="PURCHASE">PURCHASE</option>
                    <option value="SALE">SALE</option>
                    <option value="RETURN">RETURN</option>
                    <option value="DAMAGE">DAMAGE</option>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="ADJUSTMENT">ADJUSTMENT</option>
                    <option value="MANUFACTURING">MANUFACTURING</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-800">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowMovementModal(false);
                    setSelectedItem(null);
                    setMovementQuantity('');
                    setMovementReason('');
                  }}
                  className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleStockMovement}
                  className={`px-8 py-3 text-xs tracking-wider transition-colors ${
                    movementType === 'in'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : movementType === 'out'
                        ? 'bg-red-500 text-white hover:bg-red-400'
                        : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {movementType === 'in'
                    ? 'STOCK IN'
                    : movementType === 'out'
                      ? 'STOCK OUT'
                      : 'ADJUST'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
