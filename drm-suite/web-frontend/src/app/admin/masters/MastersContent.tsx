'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getConstructionMasters } from '@/data/construction-masters';
import type {
  ConstructionMasters,
  Product,
  Item,
  Customer,
  Supplier,
  Category,
} from '@/types/master';
import {
  Package,
  Wrench,
  Users,
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

export default function MastersManagement() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [masters, setMasters] = useState<ConstructionMasters>(
    {} as ConstructionMasters,
  );
  const [editingItem, setEditingItem] = useState<
    Product | Item | Customer | Supplier | null
  >(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  useEffect(() => {
    // マスタデータを読み込み
    const data = getConstructionMasters();
    setMasters(data);
  }, []);

  if (isLoading || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'products',
      name: '商品マスタ',
      icon: Package,
      count: masters.products?.length || 0,
    },
    {
      id: 'items',
      name: '作業項目マスタ',
      icon: Wrench,
      count: masters.items?.length || 0,
    },
    {
      id: 'customers',
      name: '顧客マスタ',
      icon: Users,
      count: masters.customers?.length || 0,
    },
    {
      id: 'suppliers',
      name: '協力会社マスタ',
      icon: Building2,
      count: masters.suppliers?.length || 0,
    },
  ];

  const getFilteredData = () => {
    let data = [];
    switch (activeTab) {
      case 'products':
        data = masters.products || [];
        break;
      case 'items':
        data = masters.items || [];
        break;
      case 'customers':
        data = masters.customers || [];
        break;
      case 'suppliers':
        data = masters.suppliers || [];
        break;
    }

    // カテゴリフィルタ
    if (
      selectedCategory !== 'all' &&
      (activeTab === 'products' || activeTab === 'items')
    ) {
      data = data.filter(
        (item: Product | Item) => item.categoryId === selectedCategory,
      );
    }

    // 検索フィルタ
    if (searchTerm) {
      data = data.filter(
        (item: Product | Item | Customer | Supplier) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return data;
  };

  const renderProductRow = (product: Product) => (
    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {product.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {
          masters.categories?.find((c: Category) => c.id === product.categoryId)
            ?.name
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {product.unit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ¥{product.standardPrice.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ¥{product.costPrice.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {Math.round(
          ((product.standardPrice - product.costPrice) /
            product.standardPrice) *
            100,
        )}
        %
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {product.isActive ? (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            有効
          </span>
        ) : (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            無効
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-4">
          <Edit className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  const renderItemRow = (item: Item) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {item.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {
          masters.categories?.find((c: Category) => c.id === item.categoryId)
            ?.name
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.unit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ¥{item.standardPrice.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ¥{item.costPrice.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.requiredDays}日
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.requiredWorkers}人
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-4">
          <Edit className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  const renderCustomerRow = (customer: Customer) => (
    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {customer.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {customer.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {customer.type === 'individual' ? '個人' : '法人'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {customer.tel}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {customer.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {customer.prefecture}
        {customer.city}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ¥{(customer.creditLimit || 0).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {customer.isActive ? (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            有効
          </span>
        ) : (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            無効
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-4">
          <Edit className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  const renderSupplierRow = (supplier: Supplier) => (
    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {supplier.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {supplier.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {supplier.type === 'painter' && '塗装'}
        {supplier.type === 'material' && '建材'}
        {supplier.type === 'plumber' && '設備'}
        {supplier.type === 'electrician' && '電気'}
        {supplier.type === 'general' && '総合'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {supplier.specialties?.join(', ')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {supplier.tel}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {supplier.evaluation?.技術力 && `${supplier.evaluation.技術力}/5`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {supplier.paymentTerms}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {supplier.isActive ? (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            有効
          </span>
        ) : (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            無効
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-4">
          <Edit className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 hover:opacity-80 transition"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold">マスタ管理</h1>
            </div>
            <div className="flex gap-4">
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <Upload className="h-4 w-4" />
                インポート
              </button>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <Download className="h-4 w-4" />
                エクスポート
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {(activeTab === 'products' || activeTab === 'items') && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">全カテゴリ</option>
                {masters.categories?.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新規追加
            </button>
          </div>
        </div>

        {/* データテーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'products' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        商品コード
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        商品名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        カテゴリ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        単位
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        標準単価
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        原価
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        利益率
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </>
                  )}
                  {activeTab === 'items' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        項目コード
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        項目名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        カテゴリ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        単位
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        標準単価
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        原価
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        工期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        人工
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </>
                  )}
                  {activeTab === 'customers' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        顧客コード
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        顧客名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        種別
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        電話番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メール
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        住所
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        与信限度額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </>
                  )}
                  {activeTab === 'suppliers' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        業者コード
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        業者名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        種別
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        専門分野
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        電話番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        評価
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        支払条件
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredData().map((item) => {
                  if (activeTab === 'products') return renderProductRow(item);
                  if (activeTab === 'items') return renderItemRow(item);
                  if (activeTab === 'customers') return renderCustomerRow(item);
                  if (activeTab === 'suppliers') return renderSupplierRow(item);
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">総商品数</h3>
            <p className="text-3xl font-bold text-gray-900">
              {masters.products?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              有効:{' '}
              {masters.products?.filter((p: Product) => p.isActive).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              総作業項目数
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {masters.items?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              カテゴリ: {masters.categories?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">顧客数</h3>
            <p className="text-3xl font-bold text-gray-900">
              {masters.customers?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              個人:{' '}
              {masters.customers?.filter(
                (c: Customer) => c.type === 'individual',
              ).length || 0}{' '}
              / 法人:{' '}
              {masters.customers?.filter(
                (c: Customer) => c.type === 'corporate',
              ).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              協力会社数
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {masters.suppliers?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              有効:{' '}
              {masters.suppliers?.filter((s: Supplier) => s.isActive).length ||
                0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
