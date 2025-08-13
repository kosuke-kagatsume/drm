'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 建設業界標準の見積もり項目構造
interface EstimateSection {
  id: string;
  name: string;
  order: number;
  items: EstimateItem[];
  subtotal: number;
  isExpanded: boolean; // セクションの展開状態
}

interface EstimateItem {
  id: string;
  category: string; // 大項目（仮設工事、基礎工事、躯体工事など）
  subcategory: string; // 中項目（足場工事、土工事など）
  name: string; // 小項目（単管足場、掘削など）
  specification: string; // 仕様・規格
  unit: string; // 単位（㎡、m³、式など）
  quantity: number; // 数量
  unitPrice: number; // 単価
  materialCost: number; // 材料費
  laborCost: number; // 労務費
  subcontractorCost: number; // 外注費
  amount: number; // 金額
  remarks: string; // 備考
  profitRate: number; // 利益率
  isHighlighted?: boolean; // ハイライト表示
}

// 建設業界標準の見積もりテンプレート（実際の相場価格付き）
const ESTIMATE_TEMPLATES = {
  newHouse: {
    name: '新築住宅（木造2階建て 30坪）',
    description: '一般的な木造2階建て住宅の新築工事',
    icon: '🏠',
    sections: [
      {
        name: '仮設工事',
        items: [
          {
            name: '外部足場',
            unit: '㎡',
            quantity: 250,
            unitPrice: 1200,
            spec: 'くさび足場',
          },
          {
            name: '養生シート',
            unit: '㎡',
            quantity: 250,
            unitPrice: 300,
            spec: 'メッシュシート',
          },
          {
            name: '仮設電気',
            unit: '式',
            quantity: 1,
            unitPrice: 50000,
            spec: '工事用電源',
          },
          {
            name: '仮設水道',
            unit: '式',
            quantity: 1,
            unitPrice: 30000,
            spec: '工事用水道',
          },
          {
            name: '仮設トイレ',
            unit: '月',
            quantity: 4,
            unitPrice: 15000,
            spec: '簡易水洗式',
          },
        ],
      },
      {
        name: '基礎工事',
        items: [
          {
            name: '掘削',
            unit: 'm³',
            quantity: 80,
            unitPrice: 3500,
            spec: 'バックホー0.25m³',
          },
          {
            name: '砕石地業',
            unit: '㎡',
            quantity: 120,
            unitPrice: 2800,
            spec: '再生砕石t=100',
          },
          {
            name: '捨てコンクリート',
            unit: '㎡',
            quantity: 120,
            unitPrice: 3200,
            spec: 'FC18 t=50',
          },
          {
            name: '基礎配筋',
            unit: 't',
            quantity: 3.5,
            unitPrice: 95000,
            spec: 'D13 @200',
          },
          {
            name: '基礎コンクリート',
            unit: 'm³',
            quantity: 35,
            unitPrice: 18000,
            spec: 'FC24 S15',
          },
        ],
      },
      {
        name: '躯体工事',
        items: [
          {
            name: '土台',
            unit: 'm³',
            quantity: 2.5,
            unitPrice: 85000,
            spec: '檜120×120',
          },
          {
            name: '柱',
            unit: 'm³',
            quantity: 8,
            unitPrice: 75000,
            spec: '杉120×120',
          },
          {
            name: '梁',
            unit: 'm³',
            quantity: 6,
            unitPrice: 80000,
            spec: '米松',
          },
          {
            name: '床組',
            unit: '㎡',
            quantity: 100,
            unitPrice: 4500,
            spec: '構造用合板24mm',
          },
          {
            name: '屋根下地',
            unit: '㎡',
            quantity: 120,
            unitPrice: 3800,
            spec: '野地板12mm',
          },
        ],
      },
      {
        name: '屋根工事',
        items: [
          {
            name: '防水シート',
            unit: '㎡',
            quantity: 120,
            unitPrice: 1200,
            spec: 'アスファルトルーフィング',
          },
          {
            name: '瓦葺き',
            unit: '㎡',
            quantity: 120,
            unitPrice: 8500,
            spec: '陶器瓦',
          },
          {
            name: '棟瓦',
            unit: 'm',
            quantity: 15,
            unitPrice: 6500,
            spec: '冠瓦',
          },
          {
            name: '雨樋',
            unit: 'm',
            quantity: 45,
            unitPrice: 3500,
            spec: '塩ビ製105mm',
          },
        ],
      },
    ],
  },
  reform: {
    name: 'リフォーム（水回り4点セット）',
    description: 'キッチン・バス・トイレ・洗面の全面改装',
    icon: '🔧',
    sections: [
      {
        name: '解体工事',
        items: [
          {
            name: '内装解体',
            unit: '㎡',
            quantity: 30,
            unitPrice: 3500,
            spec: '床壁天井撤去',
          },
          {
            name: '設備撤去',
            unit: '式',
            quantity: 1,
            unitPrice: 80000,
            spec: '既存設備機器撤去',
          },
          {
            name: '廃材処分',
            unit: 't',
            quantity: 2,
            unitPrice: 25000,
            spec: '混合廃棄物',
          },
        ],
      },
      {
        name: 'キッチン工事',
        items: [
          {
            name: 'システムキッチン',
            unit: '式',
            quantity: 1,
            unitPrice: 650000,
            spec: 'W2550 食洗機付',
          },
          {
            name: 'キッチンパネル',
            unit: '㎡',
            quantity: 6,
            unitPrice: 12000,
            spec: 'メラミン不燃化粧板',
          },
          {
            name: '給排水工事',
            unit: '式',
            quantity: 1,
            unitPrice: 85000,
            spec: '配管接続工事',
          },
          {
            name: '電気工事',
            unit: '式',
            quantity: 1,
            unitPrice: 45000,
            spec: 'IH用200V配線',
          },
        ],
      },
      {
        name: 'バスルーム工事',
        items: [
          {
            name: 'ユニットバス',
            unit: '式',
            quantity: 1,
            unitPrice: 850000,
            spec: '1616サイズ',
          },
          {
            name: '給排水工事',
            unit: '式',
            quantity: 1,
            unitPrice: 120000,
            spec: '配管接続工事',
          },
          {
            name: '電気工事',
            unit: '式',
            quantity: 1,
            unitPrice: 35000,
            spec: '換気扇・照明配線',
          },
          {
            name: 'ドア枠工事',
            unit: '式',
            quantity: 1,
            unitPrice: 45000,
            spec: '開口部調整',
          },
        ],
      },
    ],
  },
  exterior: {
    name: '外壁・屋根塗装（30坪）',
    description: '外壁と屋根の塗装工事（シリコン塗料）',
    icon: '🎨',
    sections: [
      {
        name: '仮設工事',
        items: [
          {
            name: '足場架設',
            unit: '㎡',
            quantity: 250,
            unitPrice: 800,
            spec: 'くさび足場',
          },
          {
            name: '養生シート',
            unit: '㎡',
            quantity: 250,
            unitPrice: 200,
            spec: 'メッシュシート',
          },
          {
            name: '高圧洗浄',
            unit: '㎡',
            quantity: 180,
            unitPrice: 300,
            spec: '150kg/cm²',
          },
        ],
      },
      {
        name: '外壁塗装工事',
        items: [
          {
            name: 'クラック補修',
            unit: '箇所',
            quantity: 20,
            unitPrice: 2500,
            spec: 'Uカットシール',
          },
          {
            name: 'シーリング打替',
            unit: 'm',
            quantity: 120,
            unitPrice: 1200,
            spec: '変成シリコン',
          },
          {
            name: '下塗り',
            unit: '㎡',
            quantity: 180,
            unitPrice: 800,
            spec: 'シーラー',
          },
          {
            name: '中塗り',
            unit: '㎡',
            quantity: 180,
            unitPrice: 1200,
            spec: 'シリコン塗料',
          },
          {
            name: '上塗り',
            unit: '㎡',
            quantity: 180,
            unitPrice: 1200,
            spec: 'シリコン塗料',
          },
        ],
      },
      {
        name: '屋根塗装工事',
        items: [
          {
            name: 'ケレン作業',
            unit: '㎡',
            quantity: 100,
            unitPrice: 400,
            spec: '3種ケレン',
          },
          {
            name: '錆止め塗装',
            unit: '㎡',
            quantity: 100,
            unitPrice: 700,
            spec: 'エポキシ系',
          },
          {
            name: '中塗り',
            unit: '㎡',
            quantity: 100,
            unitPrice: 1000,
            spec: 'シリコン塗料',
          },
          {
            name: '上塗り',
            unit: '㎡',
            quantity: 100,
            unitPrice: 1000,
            spec: 'シリコン塗料',
          },
        ],
      },
    ],
  },
  // 追加テンプレート
  renovation: {
    name: 'マンションリノベーション（70㎡）',
    description: 'マンション全面リノベーション工事',
    icon: '🏢',
    sections: [
      {
        name: '解体・撤去工事',
        items: [
          {
            name: '内装解体',
            unit: '㎡',
            quantity: 70,
            unitPrice: 4000,
            spec: '間仕切り壁含む',
          },
          {
            name: '設備機器撤去',
            unit: '式',
            quantity: 1,
            unitPrice: 150000,
            spec: '水回り設備一式',
          },
          {
            name: '廃材処分',
            unit: 't',
            quantity: 5,
            unitPrice: 25000,
            spec: '混合廃棄物',
          },
        ],
      },
    ],
  },
  shop: {
    name: '店舗内装（飲食店30坪）',
    description: '飲食店の内装工事',
    icon: '🍴',
    sections: [
      {
        name: '内装工事',
        items: [
          {
            name: '軽鉄下地',
            unit: '㎡',
            quantity: 100,
            unitPrice: 2800,
            spec: 'LGS65',
          },
          {
            name: '石膏ボード',
            unit: '㎡',
            quantity: 200,
            unitPrice: 1500,
            spec: '12.5mm',
          },
          {
            name: 'クロス貼り',
            unit: '㎡',
            quantity: 200,
            unitPrice: 1200,
            spec: '量産クロス',
          },
          {
            name: '床仕上げ',
            unit: '㎡',
            quantity: 100,
            unitPrice: 4500,
            spec: 'フロアタイル',
          },
        ],
      },
    ],
  },
};

export default function NewEstimatePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof ESTIMATE_TEMPLATES | null
  >(null);

  // 基本情報
  const [basicInfo, setBasicInfo] = useState({
    customerName: '',
    customerCompany: '',
    projectName: '',
    projectAddress: '',
    projectType: '',
    estimateDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    paymentTerms: '契約時30%、中間時40%、完成時30%',
    deliveryDate: '',
    constructionPeriod: '',
  });

  // 見積もり項目
  const [sections, setSections] = useState<EstimateSection[]>([]);

  // 諸経費設定
  const [expenses, setExpenses] = useState({
    siteManagementRate: 10, // 現場管理費（%）
    generalManagementRate: 8, // 一般管理費（%）
    profitRate: 10, // 利益率（%）
    discountAmount: 0, // 値引き額
    taxRate: 10, // 消費税率（%）
  });

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

  const handleTemplateSelect = (template: keyof typeof ESTIMATE_TEMPLATES) => {
    setSelectedTemplate(template);
    const templateData = ESTIMATE_TEMPLATES[template];

    // テンプレートから初期セクションを作成（実際の価格データ付き）
    const initialSections: EstimateSection[] = templateData.sections.map(
      (section, index) => {
        const items = section.items.map((item, itemIndex) => {
          const estimateItem: EstimateItem = {
            id: `item-${index}-${itemIndex}`,
            category: section.name,
            subcategory: '',
            name: item.name,
            specification: item.spec || '',
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            materialCost: Math.round(item.unitPrice * 0.6), // 材料費は単価の60%と仮定
            laborCost: Math.round(item.unitPrice * 0.3), // 労務費は単価の30%と仮定
            subcontractorCost: Math.round(item.unitPrice * 0.1), // 外注費は単価の10%と仮定
            amount: item.quantity * item.unitPrice,
            remarks: '',
            profitRate: 10,
          };
          return estimateItem;
        });

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

        return {
          id: `section-${index}`,
          name: section.name,
          order: index,
          items,
          subtotal,
          isExpanded: true,
        };
      },
    );

    setSections(initialSections);
    setActiveStep(2);
  };

  const addSection = () => {
    const newSection: EstimateSection = {
      id: `section-${sections.length}`,
      name: '新規項目',
      order: sections.length,
      items: [],
      subtotal: 0,
      isExpanded: true,
    };
    setSections([...sections, newSection]);
  };

  const addItem = (sectionId: string) => {
    const newItem: EstimateItem = {
      id: `item-${Date.now()}`,
      category: '',
      subcategory: '',
      name: '',
      specification: '',
      unit: '式',
      quantity: 1,
      unitPrice: 0,
      materialCost: 0,
      laborCost: 0,
      subcontractorCost: 0,
      amount: 0,
      remarks: '',
      profitRate: 10,
    };

    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section,
      ),
    );
  };

  const updateItem = (
    sectionId: string,
    itemId: string,
    field: keyof EstimateItem,
    value: any,
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const updatedItems = section.items.map((item) => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: value };
              // 金額を再計算
              if (
                [
                  'quantity',
                  'unitPrice',
                  'materialCost',
                  'laborCost',
                  'subcontractorCost',
                ].includes(field)
              ) {
                updatedItem.amount =
                  updatedItem.quantity * updatedItem.unitPrice;
              }
              return updatedItem;
            }
            return item;
          });

          // セクション小計を再計算
          const subtotal = updatedItems.reduce(
            (sum, item) => sum + item.amount,
            0,
          );
          return { ...section, items: updatedItems, subtotal };
        }
        return section;
      }),
    );
  };

  // 合計金額の計算
  const calculateTotals = () => {
    const directCost = sections.reduce(
      (sum, section) => sum + section.subtotal,
      0,
    );
    const siteManagement = directCost * (expenses.siteManagementRate / 100);
    const generalManagement =
      directCost * (expenses.generalManagementRate / 100);
    const totalBeforeProfit = directCost + siteManagement + generalManagement;
    const profit = totalBeforeProfit * (expenses.profitRate / 100);
    const subtotal = totalBeforeProfit + profit - expenses.discountAmount;
    const tax = subtotal * (expenses.taxRate / 100);
    const total = subtotal + tax;

    return {
      directCost,
      siteManagement,
      generalManagement,
      profit,
      subtotal,
      tax,
      total,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/estimates')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                新規見積書作成
              </h1>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                下書き保存
              </button>
              <button className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark">
                見積書発行
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'テンプレート選択' },
            { num: 2, label: '基本情報' },
            { num: 3, label: '見積項目' },
            { num: 4, label: '諸経費・合計' },
            { num: 5, label: '確認・発行' },
          ].map((step) => (
            <div
              key={step.num}
              className={`flex items-center ${step.num < 5 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep >= step.num
                    ? 'bg-dandori-blue text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.num}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {step.label}
              </span>
              {step.num < 5 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    activeStep > step.num ? 'bg-dandori-blue' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* ステップ1: テンプレート選択 */}
        {activeStep === 1 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold mb-2">
                見積もりテンプレートを選択
              </h2>
              <p className="text-gray-600">
                業界標準の価格設定済みテンプレートから選択してください
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ESTIMATE_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleTemplateSelect(
                        key as keyof typeof ESTIMATE_TEMPLATES,
                      )
                    }
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-dandori-blue hover:shadow-lg transition-all text-left"
                  >
                    <div className="absolute top-4 right-4 text-4xl group-hover:scale-110 transition-transform">
                      {template.icon}
                    </div>
                    <div className="pr-12">
                      <h3 className="text-lg font-bold mb-2 text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">
                          主な工事内容:
                        </p>
                        {template.sections.slice(0, 3).map((section, index) => (
                          <div
                            key={index}
                            className="flex items-center text-xs text-gray-600"
                          >
                            <span className="w-1.5 h-1.5 bg-dandori-blue rounded-full mr-2"></span>
                            {section.name}
                          </div>
                        ))}
                        {template.sections.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            ...他{template.sections.length - 3}項目
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-dandori-blue to-dandori-sky rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
                      <span>📁</span>
                      <span className="text-sm">過去の見積もりから作成</span>
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
                      <span>⬇️</span>
                      <span className="text-sm">Excelファイルをインポート</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-dandori-blue hover:text-dandori-blue-dark font-medium"
                  >
                    空白から作成 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ステップ2: 基本情報 */}
        {activeStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">基本情報の入力</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.customerName}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, customerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="田中 太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名
                </label>
                <input
                  type="text"
                  value={basicInfo.customerCompany}
                  onChange={(e) =>
                    setBasicInfo({
                      ...basicInfo,
                      customerCompany: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="株式会社〇〇"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.projectName}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, projectName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="〇〇様邸 新築工事"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事場所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.projectAddress}
                  onChange={(e) =>
                    setBasicInfo({
                      ...basicInfo,
                      projectAddress: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="東京都〇〇区〇〇1-2-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  見積日
                </label>
                <input
                  type="date"
                  value={basicInfo.estimateDate}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, estimateDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  見積有効期限
                </label>
                <input
                  type="date"
                  value={basicInfo.validUntil}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, validUntil: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工期
                </label>
                <input
                  type="text"
                  value={basicInfo.constructionPeriod}
                  onChange={(e) =>
                    setBasicInfo({
                      ...basicInfo,
                      constructionPeriod: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="約3ヶ月"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  支払条件
                </label>
                <input
                  type="text"
                  value={basicInfo.paymentTerms}
                  onChange={(e) =>
                    setBasicInfo({ ...basicInfo, paymentTerms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← 前へ
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
              >
                次へ →
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: 見積項目 */}
        {activeStep === 3 && (
          <div className="space-y-4">
            {/* クイックアクションバー */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const expanded = sections.map((s) => ({
                        ...s,
                        isExpanded: true,
                      }));
                      setSections(expanded);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    全て展開
                  </button>
                  <button
                    onClick={() => {
                      const collapsed = sections.map((s) => ({
                        ...s,
                        isExpanded: false,
                      }));
                      setSections(collapsed);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    全て折りたたむ
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    📋 テンプレートとして保存
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    直接工事費合計:{' '}
                    <span className="text-lg font-bold text-dandori-blue">
                      ¥
                      {sections
                        .reduce((sum, s) => sum + s.subtotal, 0)
                        .toLocaleString()}
                    </span>
                  </span>
                  <button
                    onClick={addSection}
                    className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark flex items-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    大項目追加
                  </button>
                </div>
              </div>
            </div>

            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <button
                  onClick={() => {
                    const updated = [...sections];
                    updated[sectionIndex].isExpanded =
                      !updated[sectionIndex].isExpanded;
                    setSections(updated);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">
                        {section.isExpanded ? '▼' : '▶'}
                      </span>
                      <input
                        type="text"
                        value={section.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[sectionIndex].name = e.target.value;
                          setSections(updated);
                        }}
                        className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 rounded px-2"
                      />
                      <span className="text-sm text-gray-500">
                        ({section.items.length}項目)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-dandori-blue">
                        ¥{section.subtotal.toLocaleString()}
                      </span>
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => addItem(section.id)}
                          className="px-3 py-1 bg-dandori-blue text-white text-sm rounded hover:bg-dandori-blue-dark"
                        >
                          + 項目
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(`「${section.name}」を削除しますか？`)
                            ) {
                              setSections(
                                sections.filter((s) => s.id !== section.id),
                              );
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </button>
                {section.isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs border-t">
                        <tr>
                          <th className="px-3 py-3 text-left font-medium text-gray-700">
                            項目名
                          </th>
                          <th className="px-3 py-3 text-left font-medium text-gray-700">
                            仕様・規格
                          </th>
                          <th className="px-3 py-3 text-center font-medium text-gray-700">
                            単位
                          </th>
                          <th className="px-3 py-3 text-right font-medium text-gray-700">
                            数量
                          </th>
                          <th className="px-3 py-3 text-right font-medium text-gray-700">
                            単価
                          </th>
                          <th className="px-3 py-3 text-right font-medium text-gray-700">
                            材料費
                          </th>
                          <th className="px-3 py-3 text-right font-medium text-gray-700">
                            労務費
                          </th>
                          <th className="px-3 py-3 text-right font-medium text-gray-700">
                            外注費
                          </th>
                          <th className="px-3 py-3 text-right font-medium text-gray-700">
                            金額
                          </th>
                          <th className="px-3 py-3 text-center font-medium text-gray-700">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {section.items.map((item, itemIndex) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-gray-50 transition-colors ${item.isHighlighted ? 'bg-dandori-yellow/10' : ''}`}
                          >
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'name',
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                                placeholder="項目名"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.specification}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'specification',
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                                placeholder="仕様・規格"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={item.unit}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'unit',
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                              >
                                <option value="式">式</option>
                                <option value="㎡">㎡</option>
                                <option value="m³">m³</option>
                                <option value="m">m</option>
                                <option value="個">個</option>
                                <option value="台">台</option>
                                <option value="本">本</option>
                                <option value="枚">枚</option>
                                <option value="ヶ所">ヶ所</option>
                                <option value="t">t</option>
                                <option value="kg">kg</option>
                                <option value="L">L</option>
                                <option value="袋">袋</option>
                                <option value="箱">箱</option>
                                <option value="月">月</option>
                                <option value="日">日</option>
                                <option value="人工">人工</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'quantity',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                                step="0.01"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'unitPrice',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-24 px-2 py-1 border border-gray-200 rounded text-right focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.materialCost}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'materialCost',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.laborCost}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'laborCost',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={item.subcontractorCost}
                                onChange={(e) =>
                                  updateItem(
                                    section.id,
                                    item.id,
                                    'subcontractorCost',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="font-bold text-dandori-blue">
                                ¥{item.amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    const updated = sections.map((s) => {
                                      if (s.id === section.id) {
                                        return {
                                          ...s,
                                          items: s.items.map((i) =>
                                            i.id === item.id
                                              ? {
                                                  ...i,
                                                  isHighlighted:
                                                    !i.isHighlighted,
                                                }
                                              : i,
                                          ),
                                        };
                                      }
                                      return s;
                                    });
                                    setSections(updated);
                                  }}
                                  className={`p-1 rounded ${item.isHighlighted ? 'text-dandori-yellow' : 'text-gray-400'} hover:text-dandori-yellow`}
                                  title="ハイライト"
                                >
                                  ★
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = sections.map((s) => {
                                      if (s.id === section.id) {
                                        // 項目を複製
                                        const newItem = {
                                          ...item,
                                          id: `item-${Date.now()}`,
                                          name: item.name + ' (コピー)',
                                        };
                                        return {
                                          ...s,
                                          items: [...s.items, newItem],
                                          subtotal: s.subtotal + newItem.amount,
                                        };
                                      }
                                      return s;
                                    });
                                    setSections(updated);
                                  }}
                                  className="p-1 text-gray-400 hover:text-dandori-blue rounded"
                                  title="複製"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = sections.map((s) => {
                                      if (s.id === section.id) {
                                        return {
                                          ...s,
                                          items: s.items.filter(
                                            (i) => i.id !== item.id,
                                          ),
                                          subtotal: s.items
                                            .filter((i) => i.id !== item.id)
                                            .reduce(
                                              (sum, i) => sum + i.amount,
                                              0,
                                            ),
                                        };
                                      }
                                      return s;
                                    });
                                    setSections(updated);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                                  title="削除"
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {section.items.length === 0 && (
                          <tr>
                            <td
                              colSpan={10}
                              className="px-3 py-8 text-center text-gray-400"
                            >
                              項目がありません。「+
                              項目」ボタンで追加してください。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* サマリー */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">直接工事費内訳</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <span className="text-gray-700">{section.name}</span>
                    <span className="font-medium">
                      ¥{section.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">合計</span>
                  <span className="font-bold text-lg text-dandori-blue">
                    ¥
                    {sections
                      .reduce((sum, s) => sum + s.subtotal, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← 前へ
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
              >
                次へ →
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: 諸経費・合計 */}
        {activeStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">諸経費・合計金額</h2>

            <div className="space-y-4">
              {/* 直接工事費 */}
              <div className="flex justify-between items-center py-3 border-b">
                <span className="font-medium">直接工事費</span>
                <span className="text-xl font-bold">
                  ¥{totals.directCost.toLocaleString()}
                </span>
              </div>

              {/* 諸経費設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現場管理費（%）
                  </label>
                  <input
                    type="number"
                    value={expenses.siteManagementRate}
                    onChange={(e) =>
                      setExpenses({
                        ...expenses,
                        siteManagementRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    ¥{totals.siteManagement.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    一般管理費（%）
                  </label>
                  <input
                    type="number"
                    value={expenses.generalManagementRate}
                    onChange={(e) =>
                      setExpenses({
                        ...expenses,
                        generalManagementRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    ¥{totals.generalManagement.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    利益率（%）
                  </label>
                  <input
                    type="number"
                    value={expenses.profitRate}
                    onChange={(e) =>
                      setExpenses({
                        ...expenses,
                        profitRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  />
                  <p className="mt-1 text-sm text-gray-600">
                    ¥{totals.profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    値引き額
                  </label>
                  <input
                    type="number"
                    value={expenses.discountAmount}
                    onChange={(e) =>
                      setExpenses({
                        ...expenses,
                        discountAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  />
                </div>
              </div>

              {/* 小計 */}
              <div className="flex justify-between items-center py-3 border-t">
                <span className="font-medium">小計</span>
                <span className="text-xl">
                  ¥{totals.subtotal.toLocaleString()}
                </span>
              </div>

              {/* 消費税 */}
              <div className="flex justify-between items-center py-3">
                <span className="font-medium">
                  消費税（{expenses.taxRate}%）
                </span>
                <span className="text-xl">¥{totals.tax.toLocaleString()}</span>
              </div>

              {/* 合計 */}
              <div className="flex justify-between items-center py-4 border-t-2 border-gray-300">
                <span className="text-xl font-bold">合計金額</span>
                <span className="text-3xl font-bold text-dandori-blue">
                  ¥{totals.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← 前へ
              </button>
              <button
                onClick={() => setActiveStep(5)}
                className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
              >
                確認画面へ →
              </button>
            </div>
          </div>
        )}

        {/* ステップ5: 確認・発行 */}
        {activeStep === 5 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">見積書の確認</h2>

            <div className="border rounded-lg p-6 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">御見積書</h3>
                <p className="text-sm text-gray-600 mt-2">
                  見積番号: EST-{new Date().getFullYear()}-
                  {String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">宛先</p>
                  <p className="font-bold text-lg">
                    {basicInfo.customerName} 様
                  </p>
                  {basicInfo.customerCompany && (
                    <p className="text-sm">{basicInfo.customerCompany}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">見積日</p>
                  <p>
                    {new Date(basicInfo.estimateDate).toLocaleDateString(
                      'ja-JP',
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">有効期限</p>
                  <p>
                    {new Date(basicInfo.validUntil).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">工事名称</p>
                <p className="font-bold">{basicInfo.projectName}</p>
                <p className="text-sm text-gray-600 mt-2">工事場所</p>
                <p>{basicInfo.projectAddress}</p>
              </div>

              <div className="text-center py-6 bg-gray-50 rounded-lg mb-6">
                <p className="text-sm text-gray-600">御見積金額</p>
                <p className="text-4xl font-bold text-dandori-blue mt-2">
                  ¥{totals.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">（税込）</p>
              </div>

              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">工期:</span>{' '}
                  {basicInfo.constructionPeriod}
                </p>
                <p>
                  <span className="font-medium">支払条件:</span>{' '}
                  {basicInfo.paymentTerms}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← 前へ
              </button>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  PDF出力
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  メール送信
                </button>
                <button
                  onClick={() => {
                    alert('見積書を発行しました');
                    router.push('/estimates');
                  }}
                  className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
                >
                  発行完了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
