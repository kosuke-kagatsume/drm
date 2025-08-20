'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 見積もりインターフェース定義
interface EstimateDetail {
  id: string;
  categoryL1: string; // 大分類
  categoryL2: string; // 中分類
  categoryL3?: string; // 小分類
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  costPrice: number;
  profitMargin: number;
  profitRate: number;
  vendor?: string;
  vendorQuoteId?: string;
  laborCost?: number;
  materialCost?: number;
  otherCost?: number;
  remarks?: string;
  imageUrls?: string[];
  isOptional?: boolean;
  isRecommended?: boolean;
  aiSuggested?: boolean;
}

interface EstimateSection {
  id: string;
  name: string;
  color: string;
  items: EstimateDetail[];
  subtotal: number;
  isExpanded: boolean;
  completionRate: number;
}

// ダンドリワークAPI連携の協力会社データ（モック）
const DW_VENDORS = [
  { id: 'vendor-1', name: '山田建設', type: '足場', rating: 95, score: 100 },
  { id: 'vendor-2', name: '佐藤塗装', type: '塗装', rating: 90, score: 100 },
  { id: 'vendor-3', name: '鈴木電気', type: '電気', rating: 88, score: 100 },
  { id: 'vendor-4', name: '田中工務店', type: '内装', rating: 92, score: 100 },
  { id: 'vendor-5', name: '高橋設備', type: '設備', rating: 89, score: 100 },
];

// 建設業界標準のマスターデータ
const CONSTRUCTION_CATEGORIES = {
  foundation: {
    name: '基礎工事',
    color: 'bg-gradient-to-r from-gray-600 to-gray-700',
    subcategories: ['掘削', '地業', '配筋', 'コンクリート', '型枠'],
  },
  structure: {
    name: '躯体工事',
    color: 'bg-gradient-to-r from-amber-600 to-orange-600',
    subcategories: ['土台', '柱', '梁', '床', '屋根'],
  },
  exterior: {
    name: '外装工事',
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    subcategories: ['外壁', '屋根', '防水', '塗装', 'シーリング'],
  },
  interior: {
    name: '内装工事',
    color: 'bg-gradient-to-r from-green-600 to-emerald-600',
    subcategories: ['床', '壁', '天井', '建具', '造作'],
  },
  equipment: {
    name: '設備工事',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    subcategories: ['電気', '給排水', '空調', 'ガス', '換気'],
  },
  temporary: {
    name: '仮設工事',
    color: 'bg-gradient-to-r from-red-600 to-pink-600',
    subcategories: ['足場', '養生', '仮囲い', '仮設電気', '仮設水道'],
  },
};

const UNIT_OPTIONS = [
  '式',
  '㎡',
  '㎥',
  'm',
  'm²',
  'm³',
  'kg',
  't',
  '本',
  '枚',
  '個',
  '箇所',
  '台',
  '組',
  '人工',
  '日',
];

// AIによる提案データ
const AI_SUGGESTIONS = [
  {
    condition: '外壁塗装',
    suggestions: [
      { item: '高圧洗浄', unit: '㎡', unitPrice: 300, required: true },
      { item: 'シーリング打替', unit: 'm', unitPrice: 1200, required: true },
      { item: '軒天塗装', unit: '㎡', unitPrice: 1500, required: false },
    ],
  },
  {
    condition: '屋根工事',
    suggestions: [
      { item: '既存屋根撤去', unit: '㎡', unitPrice: 1800, required: true },
      { item: '下地補修', unit: '㎡', unitPrice: 2500, required: false },
      { item: '防水シート', unit: '㎡', unitPrice: 1200, required: true },
    ],
  },
];

function EnhancedCreateEstimateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<
    (typeof DW_VENDORS)[0] | null
  >(null);

  // 編集モードの判定
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  // 基本情報
  const [estimateInfo, setEstimateInfo] = useState({
    estimateNumber: isEditMode
      ? `EST-2024-${String(editId).padStart(3, '0')}`
      : 'EST-2024-0001',
    version: 1,
    customerName: '',
    customerCompany: '',
    customerAddress: '',
    projectName: '',
    projectAddress: '',
    projectType: '',
    buildingStructure: '',
    buildingArea: '',
    floors: '',
    constructionPeriod: '',
    startDate: '',
    endDate: '',
    paymentTerms: '契約時30%、中間時40%、完成時30%',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    salesPerson: user?.name || '',
    estimateDate: new Date().toISOString().split('T')[0],
  });

  // 見積セクション
  const [sections, setSections] = useState<EstimateSection[]>([
    {
      id: 'section-1',
      name: '仮設工事',
      color: 'bg-gradient-to-r from-red-600 to-pink-600',
      isExpanded: true,
      completionRate: 100,
      subtotal: 304000,
      items: [
        {
          id: 'item-1-1',
          categoryL1: '仮設工事',
          categoryL2: '足場',
          itemName: '枠組足場架設',
          specification: 'W900×H1800 メッシュシート込',
          quantity: 250,
          unit: '㎡',
          unitPrice: 800,
          amount: 200000,
          costPrice: 600,
          profitMargin: 50000,
          profitRate: 25,
          vendor: '協力会社A',
          isRecommended: true,
        },
        {
          id: 'item-1-2',
          categoryL1: '仮設工事',
          categoryL2: '養生',
          itemName: '養生シート',
          specification: '防音・防塵シート',
          quantity: 250,
          unit: '㎡',
          unitPrice: 200,
          amount: 50000,
          costPrice: 150,
          profitMargin: 12500,
          profitRate: 25,
        },
        {
          id: 'item-1-3',
          categoryL1: '仮設工事',
          categoryL2: '清掃',
          itemName: '高圧洗浄',
          specification: '150kg/cm² 外壁・屋根',
          quantity: 180,
          unit: '㎡',
          unitPrice: 300,
          amount: 54000,
          costPrice: 200,
          profitMargin: 18000,
          profitRate: 33,
          aiSuggested: true,
        },
      ],
    },
    {
      id: 'section-2',
      name: '外壁工事',
      color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      isExpanded: true,
      completionRate: 75,
      subtotal: 936000,
      items: [
        {
          id: 'item-2-1',
          categoryL1: '外壁工事',
          categoryL2: 'シーリング',
          itemName: 'シーリング打替',
          specification: '変成シリコン 15mm幅',
          quantity: 120,
          unit: 'm',
          unitPrice: 1200,
          amount: 144000,
          costPrice: 800,
          profitMargin: 48000,
          profitRate: 33,
          vendor: '協力会社B',
        },
        {
          id: 'item-2-2',
          categoryL1: '外壁工事',
          categoryL2: '塗装',
          categoryL3: '下塗り',
          itemName: '下塗り（シーラー）',
          specification: '水性シーラー 1回塗り',
          quantity: 180,
          unit: '㎡',
          unitPrice: 800,
          amount: 144000,
          costPrice: 500,
          profitMargin: 54000,
          profitRate: 37.5,
        },
        {
          id: 'item-2-3',
          categoryL1: '外壁工事',
          categoryL2: '塗装',
          categoryL3: '中塗り',
          itemName: '中塗り',
          specification: 'シリコン塗料',
          quantity: 180,
          unit: '㎡',
          unitPrice: 1200,
          amount: 216000,
          costPrice: 800,
          profitMargin: 72000,
          profitRate: 33,
        },
        {
          id: 'item-2-4',
          categoryL1: '外壁工事',
          categoryL2: '塗装',
          categoryL3: '上塗り',
          itemName: '上塗り',
          specification: 'シリコン塗料 艶あり',
          quantity: 180,
          unit: '㎡',
          unitPrice: 1200,
          amount: 216000,
          costPrice: 800,
          profitMargin: 72000,
          profitRate: 33,
        },
        {
          id: 'item-2-5',
          categoryL1: '外壁工事',
          categoryL2: '付帯',
          itemName: '軒天塗装',
          specification: 'EP塗装 2回塗り',
          quantity: 45,
          unit: '㎡',
          unitPrice: 1800,
          amount: 81000,
          costPrice: 1200,
          profitMargin: 27000,
          profitRate: 33,
          isOptional: true,
        },
        {
          id: 'item-2-6',
          categoryL1: '外壁工事',
          categoryL2: '付帯',
          itemName: '破風板塗装',
          specification: 'ウレタン塗装 2回塗り',
          quantity: 35,
          unit: 'm',
          unitPrice: 2500,
          amount: 87500,
          costPrice: 1800,
          profitMargin: 24500,
          profitRate: 28,
          isOptional: true,
        },
        {
          id: 'item-2-7',
          categoryL1: '外壁工事',
          categoryL2: '付帯',
          itemName: '雨樋塗装',
          specification: 'ウレタン塗装',
          quantity: 60,
          unit: 'm',
          unitPrice: 800,
          amount: 48000,
          costPrice: 500,
          profitMargin: 18000,
          profitRate: 37.5,
          isOptional: true,
        },
      ],
    },
  ]);

  // 編集モードの場合、データを読み込む
  useEffect(() => {
    if (isEditMode && editId) {
      // 実際のアプリではAPIから読み込む
      // ここではモックデータで対応
      console.log(`編集モード: 見積ID ${editId} を読み込み中...`);
      // 既存のセクションデータが既に設定されているため、追加の処理は不要
    }
  }, [isEditMode, editId]);

  // 諸経費設定
  const [expenses, setExpenses] = useState({
    siteManagementRate: 10,
    generalManagementRate: 8,
    designRate: 3,
    profitRate: 12,
    discountType: 'amount',
    discountValue: 0,
    taxRate: 10,
  });

  // 合計計算
  const calculateTotals = () => {
    const directCost = sections.reduce(
      (sum, section) => sum + section.subtotal,
      0,
    );
    const siteManagement = Math.round(
      directCost * (expenses.siteManagementRate / 100),
    );
    const generalManagement = Math.round(
      directCost * (expenses.generalManagementRate / 100),
    );
    const design = Math.round(directCost * (expenses.designRate / 100));
    const subtotalBeforeProfit =
      directCost + siteManagement + generalManagement + design;
    const profit = Math.round(
      subtotalBeforeProfit * (expenses.profitRate / 100),
    );

    let discount = 0;
    if (expenses.discountType === 'amount') {
      discount = expenses.discountValue;
    } else {
      discount = Math.round(
        (subtotalBeforeProfit + profit) * (expenses.discountValue / 100),
      );
    }

    const subtotalAfterDiscount = subtotalBeforeProfit + profit - discount;
    const tax = Math.round(subtotalAfterDiscount * (expenses.taxRate / 100));
    const total = subtotalAfterDiscount + tax;

    // 原価計算
    const totalCost = sections.reduce(
      (sum, section) =>
        sum +
        section.items.reduce(
          (itemSum, item) => itemSum + item.quantity * item.costPrice,
          0,
        ),
      0,
    );
    const totalProfit = total - totalCost - tax;
    const totalProfitRate = total > 0 ? (totalProfit / total) * 100 : 0;

    return {
      directCost,
      siteManagement,
      generalManagement,
      design,
      subtotalBeforeProfit,
      profit,
      discount,
      subtotalAfterDiscount,
      tax,
      total,
      totalCost,
      totalProfit,
      totalProfitRate,
    };
  };

  const totals = calculateTotals();

  // セクション追加
  const addSection = (categoryKey: keyof typeof CONSTRUCTION_CATEGORIES) => {
    const category = CONSTRUCTION_CATEGORIES[categoryKey];
    const newSection: EstimateSection = {
      id: `section-${Date.now()}`,
      name: category.name,
      color: category.color,
      items: [],
      subtotal: 0,
      isExpanded: true,
      completionRate: 0,
    };
    setSections([...sections, newSection]);
  };

  // アイテム追加
  const addItem = (sectionId: string) => {
    const newItem: EstimateDetail = {
      id: `item-${Date.now()}`,
      categoryL1: '',
      categoryL2: '',
      itemName: '',
      specification: '',
      quantity: 1,
      unit: '式',
      unitPrice: 0,
      amount: 0,
      costPrice: 0,
      profitMargin: 0,
      profitRate: 0,
    };

    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section,
      ),
    );
  };

  if (isLoading || !user) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <div className="bg-gradient-dandori text-white shadow-xl">
        <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/estimates')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← 見積一覧
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <span className="text-4xl mr-3">📝</span>
                  {isEditMode
                    ? 'プロフェッショナル見積編集'
                    : 'プロフェッショナル見積作成'}
                </h1>
                <p className="text-dandori-yellow/80 text-sm mt-1">
                  見積番号: {estimateInfo.estimateNumber} | バージョン:{' '}
                  {estimateInfo.version}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                <span className="text-lg mr-2">📋</span>
                テンプレート
              </button>
              <button
                onClick={() => setShowPriceComparison(!showPriceComparison)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                <span className="text-lg mr-2">💰</span>
                価格比較
              </button>
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-lg mr-2">🤖</span>
                AIアシスタント
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full-hd mx-auto px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
        <div className="flex gap-6">
          {/* メインコンテンツ */}
          <div className={showAIAssistant ? 'w-3/4' : 'w-full'}>
            {/* タブナビゲーション */}
            <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'basic', label: '基本情報', icon: '📋' },
                  { id: 'details', label: '明細入力', icon: '📝' },
                  { id: 'expenses', label: '諸経費', icon: '💰' },
                  { id: 'preview', label: 'プレビュー', icon: '👁️' },
                  { id: 'analysis', label: '分析', icon: '📊' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-dandori text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 基本情報タブ */}
            {activeTab === 'basic' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6">基本情報</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">顧客情報</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          顧客名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.customerName}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              customerName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="田中太郎"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          会社名
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.customerCompany}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              customerCompany: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="田中建設株式会社"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          顧客住所
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.customerAddress}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              customerAddress: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="東京都渋谷区..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">工事情報</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          工事名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.projectName}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              projectName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="○○様邸 外壁塗装工事"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          工事場所
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.projectAddress}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              projectAddress: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="東京都世田谷区..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            工事種別
                          </label>
                          <select
                            value={estimateInfo.projectType}
                            onChange={(e) =>
                              setEstimateInfo({
                                ...estimateInfo,
                                projectType: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          >
                            <option value="">選択してください</option>
                            <option value="新築">新築</option>
                            <option value="リフォーム">リフォーム</option>
                            <option value="改修">改修</option>
                            <option value="解体">解体</option>
                            <option value="外構">外構</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            構造
                          </label>
                          <select
                            value={estimateInfo.buildingStructure}
                            onChange={(e) =>
                              setEstimateInfo({
                                ...estimateInfo,
                                buildingStructure: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          >
                            <option value="">選択してください</option>
                            <option value="木造">木造</option>
                            <option value="鉄骨造">鉄骨造</option>
                            <option value="RC造">RC造</option>
                            <option value="SRC造">SRC造</option>
                            <option value="その他">その他</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">工期</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          着工予定日
                        </label>
                        <input
                          type="date"
                          value={estimateInfo.startDate}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          完工予定日
                        </label>
                        <input
                          type="date"
                          value={estimateInfo.endDate}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">支払条件</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          支払条件
                        </label>
                        <select
                          value={estimateInfo.paymentTerms}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              paymentTerms: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                        >
                          <option value="契約時30%、中間時40%、完成時30%">
                            契約時30%、中間時40%、完成時30%
                          </option>
                          <option value="契約時50%、完成時50%">
                            契約時50%、完成時50%
                          </option>
                          <option value="完成時一括">完成時一括</option>
                          <option value="月末締め翌月末払い">
                            月末締め翌月末払い
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          見積有効期限
                        </label>
                        <input
                          type="date"
                          value={estimateInfo.validUntil}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              validUntil: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 mb-3">その他</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          建築面積
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.buildingArea}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              buildingArea: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="120㎡"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          階数
                        </label>
                        <input
                          type="text"
                          value={estimateInfo.floors}
                          onChange={(e) =>
                            setEstimateInfo({
                              ...estimateInfo,
                              floors: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dandori-blue focus:border-transparent"
                          placeholder="2階建て"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 明細入力タブ */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* カテゴリ追加ボタン */}
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <h3 className="font-bold mb-3">工事カテゴリを追加</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CONSTRUCTION_CATEGORIES).map(
                      ([key, category]) => (
                        <button
                          key={key}
                          onClick={() =>
                            addSection(
                              key as keyof typeof CONSTRUCTION_CATEGORIES,
                            )
                          }
                          className={`px-4 py-2 rounded-xl text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${category.color}`}
                        >
                          + {category.name}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* 各セクション */}
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className={`px-6 py-4 text-white ${section.color}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-xl font-bold">{section.name}</h3>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                            {section.items.length} 項目
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">完成度:</span>
                            <div className="w-32 bg-white/20 rounded-full h-2">
                              <div
                                className="bg-white h-2 rounded-full"
                                style={{ width: `${section.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">
                              {section.completionRate}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-bold">
                            ¥{section.subtotal.toLocaleString()}
                          </span>
                          <button
                            onClick={() =>
                              setSections(
                                sections.map((s) =>
                                  s.id === section.id
                                    ? { ...s, isExpanded: !s.isExpanded }
                                    : s,
                                ),
                              )
                            }
                            className="text-white/80 hover:text-white"
                          >
                            {section.isExpanded ? '▼' : '▶'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {section.isExpanded && (
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left">#</th>
                                <th className="px-3 py-2 text-left">大分類</th>
                                <th className="px-3 py-2 text-left">中分類</th>
                                <th className="px-3 py-2 text-left">品名</th>
                                <th className="px-3 py-2 text-left">仕様</th>
                                <th className="px-3 py-2 text-right">数量</th>
                                <th className="px-3 py-2 text-left">単位</th>
                                <th className="px-3 py-2 text-right">単価</th>
                                <th className="px-3 py-2 text-right">金額</th>
                                <th className="px-3 py-2 text-right">原価率</th>
                                <th className="px-3 py-2 text-center">
                                  ステータス
                                </th>
                                <th className="px-3 py-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.items.map((item, index) => (
                                <tr
                                  key={item.id}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="px-3 py-2">{index + 1}</td>
                                  <td className="px-3 py-2">
                                    {item.categoryL1}
                                  </td>
                                  <td className="px-3 py-2">
                                    {item.categoryL2}
                                  </td>
                                  <td className="px-3 py-2 font-medium">
                                    {item.itemName}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-600">
                                    {item.specification}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2">{item.unit}</td>
                                  <td className="px-3 py-2 text-right">
                                    ¥{item.unitPrice.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold">
                                    ¥{item.amount.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <span
                                      className={`font-medium ${
                                        item.profitRate >= 30
                                          ? 'text-green-600'
                                          : item.profitRate >= 20
                                            ? 'text-blue-600'
                                            : 'text-red-600'
                                      }`}
                                    >
                                      {item.profitRate}%
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {item.aiSuggested && (
                                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        AI推奨
                                      </span>
                                    )}
                                    {item.isRecommended && (
                                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        推奨
                                      </span>
                                    )}
                                    {item.isOptional && (
                                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                        オプション
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center space-x-2">
                                      {item.vendor && (
                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                          {item.vendor}
                                        </span>
                                      )}
                                      <button
                                        onClick={() => setShowVendorModal(true)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="協力会社を選択"
                                      >
                                        🏢
                                      </button>
                                      <button className="text-gray-400 hover:text-gray-600">
                                        ⋮
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button
                          onClick={() => addItem(section.id)}
                          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          + 明細行を追加
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* 合計サマリー */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">金額サマリー</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">直接工事費</span>
                        <span className="font-medium">
                          ¥{totals.directCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          現場管理費 ({expenses.siteManagementRate}%)
                        </span>
                        <span className="font-medium">
                          ¥{totals.siteManagement.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          一般管理費 ({expenses.generalManagementRate}%)
                        </span>
                        <span className="font-medium">
                          ¥{totals.generalManagement.toLocaleString()}
                        </span>
                      </div>
                      {expenses.designRate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            設計監理費 ({expenses.designRate}%)
                          </span>
                          <span className="font-medium">
                            ¥{totals.design.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">小計</span>
                        <span className="font-medium">
                          ¥{totals.subtotalBeforeProfit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          利益 ({expenses.profitRate}%)
                        </span>
                        <span className="font-medium">
                          ¥{totals.profit.toLocaleString()}
                        </span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>値引き</span>
                          <span className="font-medium">
                            -¥{totals.discount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">税抜合計</span>
                        <span className="font-bold text-lg">
                          ¥{totals.subtotalAfterDiscount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          消費税 ({expenses.taxRate}%)
                        </span>
                        <span className="font-medium">
                          ¥{totals.tax.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="text-xl font-bold">
                            お見積り金額
                          </span>
                          <span className="text-2xl font-bold text-dandori-blue">
                            ¥{totals.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 利益分析 */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-800 mb-3">利益分析</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">総原価</span>
                        <p className="font-bold text-lg">
                          ¥{totals.totalCost.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">総利益</span>
                        <p className="font-bold text-lg text-green-600">
                          ¥{totals.totalProfit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">総利益率</span>
                        <p
                          className={`font-bold text-lg ${
                            totals.totalProfitRate >= 25
                              ? 'text-green-600'
                              : totals.totalProfitRate >= 20
                                ? 'text-blue-600'
                                : 'text-red-600'
                          }`}
                        >
                          {totals.totalProfitRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 諸経費タブ */}
            {activeTab === 'expenses' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="text-3xl mr-3">💰</span>
                  諸経費設定
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 諸経費率設定 */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                        <span className="text-xl mr-2">⚙️</span>
                        諸経費率設定
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            現場管理費 (%)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="20"
                              step="0.5"
                              value={expenses.siteManagementRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  siteManagementRate: parseFloat(
                                    e.target.value,
                                  ),
                                })
                              }
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                              type="number"
                              value={expenses.siteManagementRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  siteManagementRate:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                              step="0.5"
                              min="0"
                              max="20"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            業界平均: 8-12% | 金額: ¥
                            {Math.round(
                              totals.directCost *
                                (expenses.siteManagementRate / 100),
                            ).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            一般管理費 (%)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="15"
                              step="0.5"
                              value={expenses.generalManagementRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  generalManagementRate: parseFloat(
                                    e.target.value,
                                  ),
                                })
                              }
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                              type="number"
                              value={expenses.generalManagementRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  generalManagementRate:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                              step="0.5"
                              min="0"
                              max="15"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            業界平均: 5-10% | 金額: ¥
                            {Math.round(
                              totals.directCost *
                                (expenses.generalManagementRate / 100),
                            ).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            設計監理費 (%)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.5"
                              value={expenses.designRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  designRate: parseFloat(e.target.value),
                                })
                              }
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                              type="number"
                              value={expenses.designRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  designRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                              step="0.5"
                              min="0"
                              max="10"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            業界平均: 2-5% | 金額: ¥
                            {Math.round(
                              totals.directCost * (expenses.designRate / 100),
                            ).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            利益率 (%)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="30"
                              step="0.5"
                              value={expenses.profitRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  profitRate: parseFloat(e.target.value),
                                })
                              }
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                              type="number"
                              value={expenses.profitRate}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  profitRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                              step="0.5"
                              min="0"
                              max="30"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            推奨: 15-25% | 金額: ¥
                            {Math.round(
                              totals.subtotalBeforeProfit *
                                (expenses.profitRate / 100),
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 値引き・税率設定 */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h3 className="font-bold text-green-800 mb-4 flex items-center">
                        <span className="text-xl mr-2">💸</span>
                        値引き・税率設定
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            値引き
                          </label>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="discountType"
                                value="amount"
                                checked={expenses.discountType === 'amount'}
                                onChange={(e) =>
                                  setExpenses({
                                    ...expenses,
                                    discountType: e.target.value as
                                      | 'amount'
                                      | 'percent',
                                  })
                                }
                                className="mr-2"
                              />
                              金額
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="discountType"
                                value="percent"
                                checked={expenses.discountType === 'percent'}
                                onChange={(e) =>
                                  setExpenses({
                                    ...expenses,
                                    discountType: e.target.value as
                                      | 'amount'
                                      | 'percent',
                                  })
                                }
                                className="mr-2"
                              />
                              割合
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={expenses.discountValue}
                              onChange={(e) =>
                                setExpenses({
                                  ...expenses,
                                  discountValue:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="0"
                            />
                            <span className="text-sm text-gray-600">
                              {expenses.discountType === 'amount' ? '円' : '%'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            消費税率 (%)
                          </label>
                          <select
                            value={expenses.taxRate}
                            onChange={(e) =>
                              setExpenses({
                                ...expenses,
                                taxRate: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value={8}>8%（軽減税率）</option>
                            <option value={10}>10%（標準税率）</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 計算結果とシミュレーション */}
                  <div className="space-y-6">
                    {/* リアルタイム計算結果 */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="font-bold text-purple-800 mb-4 flex items-center">
                        <span className="text-xl mr-2">🧮</span>
                        リアルタイム計算
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">直接工事費</span>
                          <span className="font-medium">
                            ¥{totals.directCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">現場管理費</span>
                          <span className="font-medium text-blue-600">
                            ¥{totals.siteManagement.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">一般管理費</span>
                          <span className="font-medium text-blue-600">
                            ¥{totals.generalManagement.toLocaleString()}
                          </span>
                        </div>
                        {totals.design > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-purple-200">
                            <span className="text-gray-600">設計監理費</span>
                            <span className="font-medium text-blue-600">
                              ¥{totals.design.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">小計</span>
                          <span className="font-medium">
                            ¥{totals.subtotalBeforeProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">利益</span>
                          <span className="font-medium text-green-600">
                            ¥{totals.profit.toLocaleString()}
                          </span>
                        </div>
                        {totals.discount > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-purple-200">
                            <span className="text-gray-600">値引き</span>
                            <span className="font-medium text-red-600">
                              -¥{totals.discount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">税抜合計</span>
                          <span className="font-bold text-lg">
                            ¥{totals.subtotalAfterDiscount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-200">
                          <span className="text-gray-600">消費税</span>
                          <span className="font-medium">
                            ¥{totals.tax.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-purple-100 rounded-lg px-3 mt-3">
                          <span className="text-xl font-bold text-purple-800">
                            最終金額
                          </span>
                          <span className="text-2xl font-bold text-purple-800">
                            ¥{totals.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 業界ベンチマーク */}
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200">
                      <h3 className="font-bold text-yellow-800 mb-4 flex items-center">
                        <span className="text-xl mr-2">📊</span>
                        業界ベンチマーク
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {totals.totalProfitRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              あなたの利益率
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              22.5%
                            </div>
                            <div className="text-sm text-gray-600">
                              業界平均
                            </div>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full relative"
                            style={{
                              width: `${Math.min(totals.totalProfitRate * 2, 100)}%`,
                            }}
                          >
                            <div className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          {totals.totalProfitRate >= 25 ? (
                            <span className="text-green-600 font-medium">
                              ✅ 優秀な利益率です
                            </span>
                          ) : totals.totalProfitRate >= 20 ? (
                            <span className="text-blue-600 font-medium">
                              👍 良好な利益率です
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              ⚠️ 利益率の改善を検討してください
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 諸経費テンプレート */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-xl mr-2">📋</span>
                        諸経費テンプレート
                      </h3>

                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setExpenses({
                              ...expenses,
                              siteManagementRate: 10,
                              generalManagementRate: 8,
                              designRate: 3,
                              profitRate: 15,
                            })
                          }
                          className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium">標準設定</div>
                          <div className="text-sm text-gray-600">
                            現場管理10% / 一般管理8% / 設計3% / 利益15%
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setExpenses({
                              ...expenses,
                              siteManagementRate: 12,
                              generalManagementRate: 10,
                              designRate: 5,
                              profitRate: 20,
                            })
                          }
                          className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium">高利益設定</div>
                          <div className="text-sm text-gray-600">
                            現場管理12% / 一般管理10% / 設計5% / 利益20%
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setExpenses({
                              ...expenses,
                              siteManagementRate: 8,
                              generalManagementRate: 6,
                              designRate: 2,
                              profitRate: 12,
                            })
                          }
                          className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium">競争価格設定</div>
                          <div className="text-sm text-gray-600">
                            現場管理8% / 一般管理6% / 設計2% / 利益12%
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* プレビュータブ */}
            {activeTab === 'preview' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="text-3xl mr-3">👁️</span>
                  見積書プレビュー
                </h2>

                <div
                  className="bg-white border-2 border-gray-200 rounded-xl p-8 max-w-4xl mx-auto"
                  style={{ aspectRatio: '210/297' }}
                >
                  {/* A4用紙風のレイアウト */}
                  <div className="space-y-6">
                    {/* ヘッダー */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-bold text-dandori-blue mb-2">
                          御見積書
                        </h1>
                        <div className="text-sm text-gray-600">
                          <p>見積番号: {estimateInfo.estimateNumber}</p>
                          <p>
                            作成日:{' '}
                            {new Date(
                              estimateInfo.estimateDate,
                            ).toLocaleDateString('ja-JP')}
                          </p>
                          <p>
                            有効期限:{' '}
                            {new Date(
                              estimateInfo.validUntil,
                            ).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-2">
                          株式会社ダンドリワーク
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>〒000-0000 東京都渋谷区〇〇1-1-1</p>
                          <p>TEL: 03-0000-0000</p>
                          <p>担当: {estimateInfo.salesPerson}</p>
                        </div>
                      </div>
                    </div>

                    {/* 顧客情報 */}
                    <div className="border-b pb-4">
                      <div className="text-lg font-bold">
                        {estimateInfo.customerName} 様
                      </div>
                      {estimateInfo.customerCompany && (
                        <div className="text-gray-600">
                          {estimateInfo.customerCompany}
                        </div>
                      )}
                      {estimateInfo.customerAddress && (
                        <div className="text-sm text-gray-600">
                          {estimateInfo.customerAddress}
                        </div>
                      )}
                    </div>

                    {/* 工事情報 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold mb-2">工事概要</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">工事名称:</span>
                          <span className="ml-2 font-medium">
                            {estimateInfo.projectName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">工事場所:</span>
                          <span className="ml-2 font-medium">
                            {estimateInfo.projectAddress}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">工事種別:</span>
                          <span className="ml-2 font-medium">
                            {estimateInfo.projectType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">構造:</span>
                          <span className="ml-2 font-medium">
                            {estimateInfo.buildingStructure}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 金額サマリー */}
                    <div className="border-2 border-dandori-blue rounded-lg p-4">
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-dandori-blue">
                          お見積り金額
                        </div>
                        <div className="text-4xl font-bold text-dandori-blue mt-2">
                          ¥{totals.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          （消費税込み）
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>直接工事費</span>
                          <span>¥{totals.directCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            現場管理費 ({expenses.siteManagementRate}%)
                          </span>
                          <span>¥{totals.siteManagement.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            一般管理費 ({expenses.generalManagementRate}%)
                          </span>
                          <span>
                            ¥{totals.generalManagement.toLocaleString()}
                          </span>
                        </div>
                        {totals.design > 0 && (
                          <div className="flex justify-between">
                            <span>設計監理費 ({expenses.designRate}%)</span>
                            <span>¥{totals.design.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>利益 ({expenses.profitRate}%)</span>
                          <span>¥{totals.profit.toLocaleString()}</span>
                        </div>
                        {totals.discount > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>値引き</span>
                            <span>-¥{totals.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>税抜合計</span>
                          <span>
                            ¥{totals.subtotalAfterDiscount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>消費税 ({expenses.taxRate}%)</span>
                          <span>¥{totals.tax.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* 明細サマリー */}
                    <div>
                      <h3 className="font-bold mb-3">工事明細</h3>
                      <div className="space-y-2">
                        {sections.map((section) => (
                          <div
                            key={section.id}
                            className="flex justify-between items-center py-2 border-b"
                          >
                            <div>
                              <span className="font-medium">
                                {section.name}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                ({section.items.length}項目)
                              </span>
                            </div>
                            <span className="font-medium">
                              ¥{section.subtotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 支払条件・備考 */}
                    <div className="text-sm">
                      <div className="mb-2">
                        <span className="font-medium">支払条件:</span>
                        <span className="ml-2">
                          {estimateInfo.paymentTerms}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>
                          ※
                          本見積もりは材料費・労務費の変動により変更となる場合があります。
                        </p>
                        <p>※ 工事期間中の安全管理には十分注意いたします。</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* プレビューアクション */}
                <div className="flex justify-center space-x-4 mt-6">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    📄 PDF出力
                  </button>
                  <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                    📧 メール送信
                  </button>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                    🖨️ 印刷
                  </button>
                </div>
              </div>
            )}

            {/* 分析タブ */}
            {activeTab === 'analysis' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="text-3xl mr-3">📊</span>
                  見積分析
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 利益分析 */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-bold text-green-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">💰</span>
                      利益分析
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            ¥{totals.totalProfit.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">総利益</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {totals.totalProfitRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">利益率</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">直接利益</span>
                          <span className="font-medium">
                            ¥
                            {(
                              totals.totalProfit -
                              totals.siteManagement -
                              totals.generalManagement -
                              totals.design
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">管理費込み利益</span>
                          <span className="font-medium">
                            ¥{totals.profit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">1日あたり利益</span>
                          <span className="font-medium">
                            ¥
                            {Math.round(
                              totals.totalProfit / 30,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 原価分析 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">📈</span>
                      原価分析
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ¥{totals.totalCost.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">総原価</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {((totals.totalCost / totals.total) * 100).toFixed(
                              1,
                            )}
                            %
                          </div>
                          <div className="text-sm text-gray-600">原価率</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {sections.map((section) => {
                          const sectionCost = section.items.reduce(
                            (sum, item) => sum + item.quantity * item.costPrice,
                            0,
                          );
                          const sectionCostRate =
                            totals.totalCost > 0
                              ? (sectionCost / totals.totalCost) * 100
                              : 0;
                          return (
                            <div
                              key={section.id}
                              className="flex justify-between"
                            >
                              <span className="text-gray-600">
                                {section.name}
                              </span>
                              <span className="font-medium">
                                ¥{sectionCost.toLocaleString()} (
                                {sectionCostRate.toFixed(1)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 競合比較 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">⚔️</span>
                      競合比較
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">あなたの見積</span>
                          <span className="font-bold text-purple-600">
                            ¥{totals.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">市場平均価格</span>
                          <span className="font-bold text-gray-600">
                            ¥{Math.round(totals.total * 1.1).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-500 h-2 rounded-full"
                            style={{ width: '110%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">競合A社予想</span>
                          <span className="font-bold text-red-600">
                            ¥{Math.round(totals.total * 0.95).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: '95%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mt-3">
                        <p className="font-medium text-purple-800">
                          競争力分析:
                        </p>
                        <p>
                          • 市場平均より{' '}
                          {(
                            (1 - totals.total / (totals.total * 1.1)) *
                            100
                          ).toFixed(1)}
                          % 安価
                        </p>
                        <p>• 適正な利益率を確保</p>
                        <p>• 競合に対して競争力あり</p>
                      </div>
                    </div>
                  </div>

                  {/* リスク分析 */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
                    <h3 className="font-bold text-red-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">⚠️</span>
                      リスク分析
                    </h3>

                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">利益率リスク</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              totals.totalProfitRate >= 20
                                ? 'bg-green-100 text-green-800'
                                : totals.totalProfitRate >= 15
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {totals.totalProfitRate >= 20
                              ? '低'
                              : totals.totalProfitRate >= 15
                                ? '中'
                                : '高'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {totals.totalProfitRate >= 20
                            ? '十分な利益率を確保'
                            : totals.totalProfitRate >= 15
                              ? '最低限の利益率'
                              : '利益率が低く、リスクが高い'}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">価格競争リスク</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            中
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          競合より高めの設定、値下げ圧力の可能性
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">材料費変動リスク</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            中
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          材料費5%上昇で利益率が
                          {(totals.totalProfitRate - 5).toFixed(1)}%に減少
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">工期遅延リスク</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            低
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          十分な工期を設定、余裕あり
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 改善提案 */}
                  <div className="lg:col-span-2 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-4 flex items-center">
                      <span className="text-xl mr-2">💡</span>
                      改善提案
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-bold text-green-600 mb-2">
                          利益改善
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• オプション工事の提案</li>
                          <li>• 高品質材料への変更提案</li>
                          <li>• 追加サービスの提案</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-bold text-blue-600 mb-2">
                          コスト削減
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 材料の一括仕入れ</li>
                          <li>• 協力会社との価格交渉</li>
                          <li>• 工程の効率化</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-bold text-purple-600 mb-2">
                          競争力強化
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 付加価値サービス</li>
                          <li>• 長期保証の提供</li>
                          <li>• アフターサービス充実</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300">
                    下書き保存
                  </button>
                  <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                    プレビュー
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <span className="mr-2">✓</span>
                    承認申請
                  </button>
                  <button className="px-6 py-3 bg-gradient-dandori text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <span className="mr-2">📨</span>
                    顧客へ送信
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AIアシスタントサイドバー */}
          {showAIAssistant && (
            <div className="w-1/4">
              <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">🤖 AIアシスタント</h3>
                  <button
                    onClick={() => setShowAIAssistant(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* AI提案 */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">
                      💡 おすすめ追加項目
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-sm font-medium">雨戸・戸袋塗装</p>
                        <p className="text-xs text-gray-600">
                          外壁塗装時に同時施工で効率的
                        </p>
                        <button className="mt-1 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">
                          追加
                        </button>
                      </div>
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-sm font-medium">ベランダ防水</p>
                        <p className="text-xs text-gray-600">
                          足場設置時に施工がお得
                        </p>
                        <button className="mt-1 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">
                          追加
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2">
                      ⚠️ 注意事項
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li>• 高圧洗浄の単価が相場より低い可能性</li>
                      <li>• 諸経費率が業界平均より高め</li>
                      <li>• 工期が短めに設定されています</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">
                      📊 類似案件
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-sm font-medium">山田様邸 外壁塗装</p>
                        <p className="text-xs text-gray-600">
                          180㎡ | ¥1,850,000
                        </p>
                        <p className="text-xs text-green-600">粗利率: 28%</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-sm font-medium">鈴木ビル 外装改修</p>
                        <p className="text-xs text-gray-600">
                          250㎡ | ¥2,450,000
                        </p>
                        <p className="text-xs text-green-600">粗利率: 25%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">
                      ✅ 完成度チェック
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">基本情報</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">明細入力</span>
                        <span className="font-medium text-yellow-600">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">原価設定</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">画像添付</span>
                        <span className="font-medium text-gray-400">0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 協力会社選択モーダル（ダンドリワーク連携） */}
        {showVendorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">協力会社選択</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      ダンドリワークAPI連携
                    </p>
                  </div>
                  <button
                    onClick={() => setShowVendorModal(false)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* DW連携通知 */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-xl">🔗</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        協力会社データはダンドリワークから取得されています。
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        発注処理はダンドリワークポータルで行われます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 協力会社リスト */}
                <div className="space-y-3">
                  {DW_VENDORS.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowVendorModal(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {vendor.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {vendor.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              工事種別: {vendor.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {vendor.rating}
                            </div>
                            <div className="text-xs text-gray-500">
                              品質評価
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {vendor.score}
                            </div>
                            <div className="text-xs text-gray-500">
                              総合スコア
                            </div>
                          </div>
                          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            選択
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ダンドリワークへのリンク */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      詳細な協力会社情報や発注処理はダンドリワークで管理されます
                    </p>
                    <button
                      onClick={() =>
                        window.open(
                          'https://dandori-work.com/vendors',
                          '_blank',
                        )
                      }
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      ダンドリワークで管理 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EnhancedCreateEstimatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dandori-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <EnhancedCreateEstimateContent />
    </Suspense>
  );
}
