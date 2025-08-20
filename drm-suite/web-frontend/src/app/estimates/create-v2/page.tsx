'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getConstructionMasters } from '@/data/construction-masters';
import {
  ArrowLeft,
  Save,
  FileText,
  Plus,
  Trash2,
  Calculator,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Wrench,
  Users,
  Building,
  AlertCircle,
  Check,
  X,
  Copy,
  BookOpen,
  Star,
} from 'lucide-react';

interface EstimateItem {
  id: string;
  categoryId: string;
  itemType: 'product' | 'labor';
  itemId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  amount: number;
  profitAmount: number;
  profitRate: number;
  notes?: string;
}

function CreateEstimateV2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [masters, setMasters] = useState<any>({});

  // テンプレート関連
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null,
  );
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('外壁・屋根工事');
  const [activeTab, setActiveTab] = useState<'customer' | 'items' | 'summary'>(
    'customer',
  );

  // 顧客情報
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // 見積情報
  const [estimateTitle, setEstimateTitle] = useState('');
  const [estimateDate, setEstimateDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [validUntil, setValidUntil] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('pt-001');
  const [estimateNotes, setEstimateNotes] = useState('');

  // 明細項目
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItemType, setSelectedItemType] = useState<'product' | 'labor'>(
    'product',
  );

  // 諸経費設定
  const [overheadSettings, setOverheadSettings] = useState({
    管理費率: 0.08,
    一般管理費率: 0.05,
    諸経費率: 0.03,
    廃材処分費率: 0.02,
  });

  // 利益率設定
  const [targetProfitRate, setTargetProfitRate] = useState(0.25);

  useEffect(() => {
    const data = getConstructionMasters();
    setMasters(data);

    // 有効期限を30日後に設定
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    setValidUntil(validDate.toISOString().split('T')[0]);

    // URLパラメータからテンプレート読み込み
    const templateId = searchParams.get('template');
    const editTemplate = searchParams.get('edit_template') === 'true';

    if (templateId) {
      loadTemplate(templateId, editTemplate);
    }
  }, [searchParams]);

  // テンプレート読み込み
  const loadTemplate = (templateId: string, editMode: boolean = false) => {
    const templates = JSON.parse(
      localStorage.getItem('estimate_templates') || '[]',
    );
    const template = templates.find((t: any) => t.id === templateId);

    if (template) {
      setItems(template.items || []);
      setOverheadSettings(
        template.overheadSettings || {
          管理費率: 0.08,
          一般管理費率: 0.05,
          諸経費率: 0.03,
          廃材処分費率: 0.02,
        },
      );

      if (editMode) {
        setIsEditingTemplate(true);
        setCurrentTemplateId(templateId);
        setTemplateName(template.name);
        setTemplateDescription(template.description);
        setTemplateCategory(template.category);
        setEstimateTitle(`${template.name}（テンプレート編集）`);
      } else {
        setEstimateTitle(template.name);
      }

      // 明細タブに移動
      if (template.items && template.items.length > 0) {
        setActiveTab('items');
      }
    }
  };

  // テンプレート保存
  const saveTemplate = () => {
    if (!templateName) {
      alert('テンプレート名を入力してください');
      return;
    }

    const templates = JSON.parse(
      localStorage.getItem('estimate_templates') || '[]',
    );
    const templateData = {
      id: currentTemplateId || `TMPL-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      items,
      overheadSettings,
      isDefault: false,
      createdBy: user?.email || '',
      createdAt: currentTemplateId
        ? templates.find((t: any) => t.id === currentTemplateId)?.createdAt ||
          new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: currentTemplateId
        ? templates.find((t: any) => t.id === currentTemplateId)?.usageCount ||
          0
        : 0,
    };

    let updatedTemplates;
    if (currentTemplateId) {
      // 既存テンプレート更新
      updatedTemplates = templates.map((t: any) =>
        t.id === currentTemplateId ? templateData : t,
      );
    } else {
      // 新規テンプレート追加
      updatedTemplates = [...templates, templateData];
    }

    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );
    setShowTemplateModal(false);

    alert(
      currentTemplateId
        ? 'テンプレートを更新しました'
        : 'テンプレートを保存しました',
    );

    // テンプレート編集モードの場合は一覧に戻る
    if (isEditingTemplate) {
      router.push('/estimates/templates');
    }
  };

  // 新規テンプレート作成
  const createNewTemplate = () => {
    setCurrentTemplateId(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('外壁・屋根工事');
    setShowTemplateModal(true);
  };

  // 顧客検索
  const filteredCustomers = masters.customers?.filter(
    (customer: any) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(customerSearchTerm.toLowerCase()),
  );

  // 商品・作業項目検索
  const getFilteredItems = () => {
    const itemList =
      selectedItemType === 'product' ? masters.products : masters.items;
    if (!itemList) return [];

    let filtered = itemList;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (item: any) => item.categoryId === selectedCategory,
      );
    }

    if (itemSearchTerm) {
      filtered = filtered.filter(
        (item: any) =>
          item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(itemSearchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  // 明細追加
  const addItem = (masterItem: any) => {
    const newItem: EstimateItem = {
      id: `item-${Date.now()}`,
      categoryId: masterItem.categoryId,
      itemType: selectedItemType,
      itemId: masterItem.id,
      name: masterItem.name,
      unit: masterItem.unit,
      quantity: 1,
      unitPrice: masterItem.standardPrice,
      costPrice: masterItem.costPrice,
      amount: masterItem.standardPrice,
      profitAmount: masterItem.standardPrice - masterItem.costPrice,
      profitRate:
        ((masterItem.standardPrice - masterItem.costPrice) /
          masterItem.standardPrice) *
        100,
    };

    setItems([...items, newItem]);
    setShowItemModal(false);
    setItemSearchTerm('');
  };

  // 数量変更
  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const amount = item.unitPrice * quantity;
          const costAmount = item.costPrice * quantity;
          return {
            ...item,
            quantity,
            amount,
            profitAmount: amount - costAmount,
          };
        }
        return item;
      }),
    );
  };

  // 単価変更
  const updateUnitPrice = (itemId: string, unitPrice: number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const amount = unitPrice * item.quantity;
          const costAmount = item.costPrice * item.quantity;
          return {
            ...item,
            unitPrice,
            amount,
            profitAmount: amount - costAmount,
            profitRate: ((unitPrice - item.costPrice) / unitPrice) * 100,
          };
        }
        return item;
      }),
    );
  };

  // 明細削除
  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // 合計計算
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const costTotal = items.reduce(
      (sum, item) => sum + item.costPrice * item.quantity,
      0,
    );

    // 諸経費計算
    const overhead = {
      管理費: subtotal * overheadSettings.管理費率,
      一般管理費: subtotal * overheadSettings.一般管理費率,
      諸経費: subtotal * overheadSettings.諸経費率,
      廃材処分費: subtotal * overheadSettings.廃材処分費率,
    };

    const overheadTotal = Object.values(overhead).reduce(
      (sum, val) => sum + val,
      0,
    );
    const beforeTax = subtotal + overheadTotal;
    const tax = beforeTax * 0.1;
    const total = beforeTax + tax;
    const profit = subtotal - costTotal;
    const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

    return {
      subtotal,
      costTotal,
      overhead,
      overheadTotal,
      beforeTax,
      tax,
      total,
      profit,
      profitRate,
    };
  };

  const totals = calculateTotals();

  // 保存処理
  const handleSave = () => {
    if (!selectedCustomer) {
      alert('顧客を選択してください');
      return;
    }

    if (!estimateTitle) {
      alert('見積件名を入力してください');
      return;
    }

    if (items.length === 0) {
      alert('明細を追加してください');
      return;
    }

    const estimateData = {
      id: `EST-${Date.now()}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      title: estimateTitle,
      date: estimateDate,
      validUntil,
      paymentTerms,
      items,
      overheadSettings,
      totals,
      notes: estimateNotes,
      createdBy: user?.email,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    // LocalStorageに保存
    const estimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    estimates.push(estimateData);
    localStorage.setItem('estimates', JSON.stringify(estimates));

    alert('見積を保存しました');
    router.push('/estimates');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 hover:opacity-80 transition"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">見積作成（マスタ連携版）</h1>
                <p className="text-sm opacity-90 mt-1">
                  マスタデータから効率的に見積を作成
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* テンプレート管理ボタン */}
              <button
                onClick={() => router.push('/estimates/templates')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                テンプレート
              </button>

              {/* テンプレート保存ボタン（項目がある場合のみ） */}
              {items.length > 0 && !isEditingTemplate && (
                <button
                  onClick={createNewTemplate}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  テンプレート化
                </button>
              )}

              {/* テンプレート更新ボタン（テンプレート編集時） */}
              {isEditingTemplate && (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  テンプレート更新
                </button>
              )}

              <button
                onClick={handleSave}
                className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isEditingTemplate ? '見積として保存' : '保存'}
              </button>
              <button className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg transition flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF出力
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
              <button
                onClick={() => setActiveTab('customer')}
                className={`${
                  activeTab === 'customer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition`}
              >
                <Users className="inline h-4 w-4 mr-2" />
                顧客情報
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition`}
              >
                <Package className="inline h-4 w-4 mr-2" />
                明細入力
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition`}
              >
                <Calculator className="inline h-4 w-4 mr-2" />
                集計・確認
              </button>
            </nav>
          </div>
        </div>

        {/* 顧客情報タブ */}
        {activeTab === 'customer' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-6">顧客情報</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 顧客選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顧客選択 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 transition"
                  >
                    {selectedCustomer ? (
                      <div>
                        <p className="font-medium">{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-500">
                          {selectedCustomer.code}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        顧客を選択してください
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {showCustomerSearch && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-3 border-b">
                        <input
                          type="text"
                          placeholder="顧客名・コードで検索"
                          value={customerSearchTerm}
                          onChange={(e) =>
                            setCustomerSearchTerm(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCustomers?.map((customer: any) => (
                          <button
                            key={customer.id}
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerSearch(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b"
                          >
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">
                              {customer.code} /{' '}
                              {customer.type === 'individual' ? '個人' : '法人'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 見積件名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  見積件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={estimateTitle}
                  onChange={(e) => setEstimateTitle(e.target.value)}
                  placeholder="例: 外壁塗装・屋根葺き替え工事"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 見積日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  見積日
                </label>
                <input
                  type="date"
                  value={estimateDate}
                  onChange={(e) => setEstimateDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 有効期限 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 支払条件 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  支払条件
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {masters.paymentTerms?.map((term: any) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 備考 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備考
                </label>
                <textarea
                  value={estimateNotes}
                  onChange={(e) => setEstimateNotes(e.target.value)}
                  rows={3}
                  placeholder="見積に関する備考事項"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 顧客詳細情報 */}
            {selectedCustomer && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">顧客詳細情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">住所:</span>
                    <span className="ml-2">
                      {selectedCustomer.prefecture}
                      {selectedCustomer.city}
                      {selectedCustomer.address}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">電話:</span>
                    <span className="ml-2">{selectedCustomer.tel}</span>
                  </div>
                  {selectedCustomer.propertyInfo && (
                    <>
                      <div>
                        <span className="text-gray-600">建物種別:</span>
                        <span className="ml-2">
                          {selectedCustomer.propertyInfo.建物種別}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">築年数:</span>
                        <span className="ml-2">
                          {selectedCustomer.propertyInfo.築年数}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 明細入力タブ */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* 明細追加ボタン */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">明細項目</h2>
                <button
                  onClick={() => setShowItemModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  項目追加
                </button>
              </div>

              {/* 明細一覧 */}
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          項目名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          単位
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          数量
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          単価
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          粗利
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                              min="0"
                              step="0.1"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateUnitPrice(item.id, Number(e.target.value))
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ¥{item.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`${item.profitRate > 20 ? 'text-green-600' : 'text-orange-600'}`}
                            >
                              {item.profitRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>明細項目がありません</p>
                  <p className="text-sm mt-2">
                    上のボタンから項目を追加してください
                  </p>
                </div>
              )}
            </div>

            {/* 小計表示 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">小計</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{totals.subtotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 集計・確認タブ */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* 集計情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-6">見積集計</h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span>小計</span>
                  <span className="font-medium">
                    ¥{totals.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>
                      現場管理費 ({(overheadSettings.管理費率 * 100).toFixed(0)}
                      %)
                    </span>
                    <span>¥{totals.overhead.管理費.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>
                      一般管理費 (
                      {(overheadSettings.一般管理費率 * 100).toFixed(0)}%)
                    </span>
                    <span>¥{totals.overhead.一般管理費.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>
                      諸経費 ({(overheadSettings.諸経費率 * 100).toFixed(0)}%)
                    </span>
                    <span>¥{totals.overhead.諸経費.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>
                      廃材処分費 (
                      {(overheadSettings.廃材処分費率 * 100).toFixed(0)}%)
                    </span>
                    <span>¥{totals.overhead.廃材処分費.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-t">
                  <span>税抜合計</span>
                  <span className="font-medium">
                    ¥{totals.beforeTax.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span>消費税（10%）</span>
                  <span className="font-medium">
                    ¥{totals.tax.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-t border-b text-lg font-bold">
                  <span>合計金額</span>
                  <span className="text-blue-600">
                    ¥{totals.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 利益分析 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-6">利益分析</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">原価合計</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥{totals.costTotal.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">粗利益</p>
                  <p className="text-2xl font-bold text-green-600">
                    ¥{totals.profit.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">粗利率</p>
                  <p
                    className={`text-2xl font-bold ${totals.profitRate > 20 ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {totals.profitRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              {totals.profitRate < 20 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">利益率が目標を下回っています</p>
                    <p className="mt-1">単価の見直しを検討してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 項目追加モーダル */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">項目を追加</h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4 border-b">
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItemType('product')}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedItemType === 'product'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Package className="inline h-4 w-4 mr-2" />
                    商品
                  </button>
                  <button
                    onClick={() => setSelectedItemType('labor')}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedItemType === 'labor'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Wrench className="inline h-4 w-4 mr-2" />
                    作業
                  </button>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">全カテゴリ</option>
                  {masters.categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="項目名・コードで検索"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-3">
                {getFilteredItems().map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.code}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ¥{item.standardPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">/{item.unit}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* テンプレート保存モーダル */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">
                {currentTemplateId ? 'テンプレート更新' : 'テンプレート保存'}
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テンプレート名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="例: 一般住宅外壁塗装基本パック"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="このテンプレートの用途や特徴を入力..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="外壁・屋根工事">外壁・屋根工事</option>
                    <option value="内装工事">内装工事</option>
                    <option value="水回り工事">水回り工事</option>
                    <option value="電気工事">電気工事</option>
                    <option value="エクステリア工事">エクステリア工事</option>
                    <option value="リフォーム工事">リフォーム工事</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      保存内容
                    </span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 明細項目: {items.length}項目</li>
                    <li>
                      • 諸経費設定: 管理費{overheadSettings.管理費率 * 100}%など
                    </li>
                    <li>• 顧客情報は保存されません</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                キャンセル
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                {currentTemplateId ? '更新' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateEstimateV2() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <CreateEstimateV2Content />
    </Suspense>
  );
}
