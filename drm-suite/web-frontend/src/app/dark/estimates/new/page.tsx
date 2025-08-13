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
  isExpanded: boolean;
}

interface EstimateItem {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  materialCost: number;
  laborCost: number;
  subcontractorCost: number;
  amount: number;
  remarks: string;
  profitRate: number;
  isHighlighted?: boolean;
}

// 建設業界標準のテンプレート（市場価格付き）
const ESTIMATE_TEMPLATES = {
  newHouse: {
    name: '新築住宅（木造2階建て 30坪）',
    description: '標準的な木造2階建て住宅の新築工事',
    icon: '01',
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
            spec: 'FC=18N t=50',
          },
          {
            name: '基礎コンクリート',
            unit: 'm³',
            quantity: 35,
            unitPrice: 25000,
            spec: 'FC=24N 生コン',
          },
          {
            name: '鉄筋',
            unit: 't',
            quantity: 3.5,
            unitPrice: 180000,
            spec: 'D13 D16',
          },
          {
            name: '型枠',
            unit: '㎡',
            quantity: 140,
            unitPrice: 5500,
            spec: '合板型枠',
          },
        ],
      },
      {
        name: '躯体工事',
        items: [
          {
            name: '構造材',
            unit: 'm³',
            quantity: 25,
            unitPrice: 85000,
            spec: '杉・檜',
          },
          {
            name: '金物',
            unit: '式',
            quantity: 1,
            unitPrice: 280000,
            spec: '各種接合金物',
          },
          {
            name: '構造用合板',
            unit: '枚',
            quantity: 120,
            unitPrice: 3800,
            spec: '構造用12mm',
          },
          {
            name: '防湿シート',
            unit: '㎡',
            quantity: 200,
            unitPrice: 450,
            spec: '防湿バリア',
          },
        ],
      },
    ],
    totalAmount: 18500000,
  },
  exteriorRenovation: {
    name: '外壁塗装工事（30坪）',
    description: '外壁・屋根の塗装リフォーム工事',
    icon: '02',
    sections: [
      {
        name: '仮設工事',
        items: [
          {
            name: '足場',
            unit: '㎡',
            quantity: 200,
            unitPrice: 900,
            spec: '単管足場',
          },
          {
            name: '養生シート',
            unit: '㎡',
            quantity: 200,
            unitPrice: 200,
            spec: 'メッシュタイプ',
          },
        ],
      },
      {
        name: '外壁塗装工事',
        items: [
          {
            name: '高圧洗浄',
            unit: '㎡',
            quantity: 150,
            unitPrice: 300,
            spec: '150kgf/cm²',
          },
          {
            name: '下塗り',
            unit: '㎡',
            quantity: 150,
            unitPrice: 800,
            spec: 'エポキシシーラー',
          },
          {
            name: '中塗り',
            unit: '㎡',
            quantity: 150,
            unitPrice: 1200,
            spec: 'シリコン樹脂',
          },
          {
            name: '上塗り',
            unit: '㎡',
            quantity: 150,
            unitPrice: 1500,
            spec: 'シリコン樹脂',
          },
          {
            name: 'コーキング',
            unit: 'm',
            quantity: 80,
            unitPrice: 1200,
            spec: 'シリコンシーラント',
          },
        ],
      },
      {
        name: '屋根塗装工事',
        items: [
          {
            name: '高圧洗浄',
            unit: '㎡',
            quantity: 100,
            unitPrice: 350,
            spec: '150kgf/cm²',
          },
          {
            name: '錆止め',
            unit: '㎡',
            quantity: 100,
            unitPrice: 900,
            spec: 'エポキシプライマー',
          },
          {
            name: '上塗り',
            unit: '㎡',
            quantity: 100,
            unitPrice: 2000,
            spec: 'フッ素塗料',
          },
        ],
      },
    ],
    totalAmount: 1280000,
  },
};

export default function DarkNewEstimatePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // 顧客情報
  const [customerInfo, setCustomerInfo] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    projectName: '',
    projectLocation: '',
    estimateValidUntil: '',
    paymentTerms: '',
    deliveryDate: '',
  });

  // 見積セクション
  const [sections, setSections] = useState<EstimateSection[]>([]);

  // 設定
  const [settings, setSettings] = useState({
    showCostBreakdown: false,
    includeConsumptionTax: true,
    taxRate: 10,
    overheadRate: 15,
    profitMargin: 20,
    showUnitPrices: true,
    roundingMethod: 'floor',
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-500 text-xs tracking-wider">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  // テンプレート適用
  const applyTemplate = (templateKey: string) => {
    const template =
      ESTIMATE_TEMPLATES[templateKey as keyof typeof ESTIMATE_TEMPLATES];
    if (!template) return;

    const newSections: EstimateSection[] = template.sections.map(
      (section, sectionIndex) => ({
        id: `section-${sectionIndex}`,
        name: section.name,
        order: sectionIndex,
        isExpanded: true,
        items: section.items.map((item, itemIndex) => ({
          id: `item-${sectionIndex}-${itemIndex}`,
          category: section.name,
          subcategory: '',
          name: item.name,
          specification: item.spec,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          materialCost: item.unitPrice * 0.6,
          laborCost: item.unitPrice * 0.3,
          subcontractorCost: item.unitPrice * 0.1,
          amount: item.quantity * item.unitPrice,
          remarks: '',
          profitRate: settings.profitMargin,
        })),
        subtotal: section.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        ),
      }),
    );

    setSections(newSections);
    setSelectedTemplate(templateKey);
    setCurrentStep(2);
  };

  // 合計計算
  const calculateTotals = () => {
    const subtotal = sections.reduce(
      (sum, section) => sum + section.subtotal,
      0,
    );
    const overhead = subtotal * (settings.overheadRate / 100);
    const profit = subtotal * (settings.profitMargin / 100);
    const beforeTax = subtotal + overhead + profit;
    const tax = settings.includeConsumptionTax
      ? beforeTax * (settings.taxRate / 100)
      : 0;
    const total = beforeTax + tax;

    return {
      subtotal,
      overhead,
      profit,
      beforeTax,
      tax,
      total,
    };
  };

  const totals = calculateTotals();

  // 新しいセクション追加
  const addSection = () => {
    const newSection: EstimateSection = {
      id: `section-${sections.length}`,
      name: `新規セクション ${sections.length + 1}`,
      order: sections.length,
      items: [],
      subtotal: 0,
      isExpanded: true,
    };
    setSections([...sections, newSection]);
  };

  // セクションに項目追加
  const addItemToSection = (sectionId: string) => {
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
      profitRate: settings.profitMargin,
    };

    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dark/estimates')}
                className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← 見積一覧
              </button>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                新規見積作成
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-600 transition-colors text-xs tracking-wider">
                下書き保存
              </button>
              <button className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-xs tracking-wider">
                PDF生成
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 進捗ステップ */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { num: 1, label: 'テンプレート選択' },
              { num: 2, label: '顧客情報' },
              { num: 3, label: '見積詳細' },
              { num: 4, label: '確認・完了' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`w-12 h-12 border flex items-center justify-center text-sm transition-colors ${
                    currentStep >= step.num
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-zinc-500 border-zinc-700'
                  }`}
                >
                  {String(step.num).padStart(2, '0')}
                </button>
                <span
                  className={`ml-3 text-xs tracking-wider ${
                    currentStep >= step.num ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-24 h-px mx-6 ${
                      currentStep > step.num ? 'bg-white' : 'bg-zinc-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ステップ1: テンプレート選択 */}
        {currentStep === 1 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-light text-white mb-8 tracking-wider">
              見積テンプレートを選択
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(ESTIMATE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-600 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light">
                      {template.icon}
                    </div>
                    <span className="text-2xl font-thin text-emerald-500">
                      ¥{template.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-light text-white mb-2 tracking-wider">
                    {template.name}
                  </h3>
                  <p className="text-xs text-zinc-500 tracking-wider">
                    {template.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span className="tracking-wider">
                        {template.sections.length} セクション
                      </span>
                      <span className="tracking-wider">
                        {template.sections.reduce(
                          (sum, s) => sum + s.items.length,
                          0,
                        )}{' '}
                        項目
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {/* カスタム見積 */}
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 p-6 hover:border-blue-500/50 transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 border border-blue-500/50 flex items-center justify-center text-blue-400 font-light">
                    +
                  </div>
                </div>
                <h3 className="font-light text-white mb-2 tracking-wider">
                  カスタム見積
                </h3>
                <p className="text-xs text-zinc-500 tracking-wider">
                  ゼロから作成
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: 顧客情報 */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-light text-white mb-8 tracking-wider">
              顧客情報
            </h2>
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    会社名
                  </label>
                  <input
                    type="text"
                    value={customerInfo.companyName}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="会社名を入力"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    担当者名
                  </label>
                  <input
                    type="text"
                    value={customerInfo.contactPerson}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        contactPerson: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="担当者名を入力"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="000-0000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    住所
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="住所を入力"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    プロジェクト名
                  </label>
                  <input
                    type="text"
                    value={customerInfo.projectName}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        projectName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="プロジェクト名を入力"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    プロジェクト場所
                  </label>
                  <input
                    type="text"
                    value={customerInfo.projectLocation}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        projectLocation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    placeholder="プロジェクト場所を入力"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    見積有効期限
                  </label>
                  <input
                    type="date"
                    value={customerInfo.estimateValidUntil}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        estimateValidUntil: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    納期
                  </label>
                  <input
                    type="date"
                    value={customerInfo.deliveryDate}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        deliveryDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-zinc-500 mb-2 tracking-wider">
                    支払条件
                  </label>
                  <select
                    value={customerInfo.paymentTerms}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  >
                    <option value="">支払条件を選択</option>
                    <option value="cash">現金払い</option>
                    <option value="30days">30日以内</option>
                    <option value="60days">60日以内</option>
                    <option value="installment">分割払い</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-600 transition-colors text-xs tracking-wider"
                >
                  戻る
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-xs tracking-wider"
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ステップ3: 見積詳細 */}
        {currentStep === 3 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-light text-white tracking-wider">
                見積詳細
              </h2>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs tracking-wider"
              >
                + セクション追加
              </button>
            </div>

            {/* セクション */}
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="bg-zinc-950 border border-zinc-800"
                >
                  <div className="flex items-center justify-between p-4 border-b border-zinc-800">
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
                      className="flex items-center space-x-3"
                    >
                      <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs">
                        {String(sectionIndex + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-light text-white tracking-wider">
                        {section.name}
                      </h3>
                    </button>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-zinc-500 tracking-wider">
                        小計: ¥{section.subtotal.toLocaleString()}
                      </span>
                      <button
                        onClick={() => addItemToSection(section.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 tracking-wider"
                      >
                        + 項目追加
                      </button>
                    </div>
                  </div>

                  {section.isExpanded && (
                    <div className="p-4">
                      {section.items.length > 0 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-zinc-800">
                              <th className="text-left text-xs text-zinc-500 pb-3 tracking-wider">
                                項目
                              </th>
                              <th className="text-left text-xs text-zinc-500 pb-3 tracking-wider">
                                仕様
                              </th>
                              <th className="text-center text-xs text-zinc-500 pb-3 tracking-wider">
                                数量
                              </th>
                              <th className="text-center text-xs text-zinc-500 pb-3 tracking-wider">
                                単位
                              </th>
                              <th className="text-right text-xs text-zinc-500 pb-3 tracking-wider">
                                単価
                              </th>
                              <th className="text-right text-xs text-zinc-500 pb-3 tracking-wider">
                                金額
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.items.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-zinc-800/50"
                              >
                                <td className="py-3 text-sm text-white">
                                  {item.name}
                                </td>
                                <td className="py-3 text-xs text-zinc-400">
                                  {item.specification}
                                </td>
                                <td className="py-3 text-center text-sm text-white">
                                  {item.quantity}
                                </td>
                                <td className="py-3 text-center text-xs text-zinc-400">
                                  {item.unit}
                                </td>
                                <td className="py-3 text-right text-sm text-white">
                                  ¥{item.unitPrice.toLocaleString()}
                                </td>
                                <td className="py-3 text-right text-sm font-light text-emerald-500">
                                  ¥{item.amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center text-zinc-600 py-8 text-xs tracking-wider">
                          このセクションには項目がありません
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 合計サマリー */}
            <div className="mt-8 bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 p-6">
              <h3 className="text-lg font-light text-blue-400 mb-6 tracking-wider">
                見積概要
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 tracking-wider">小計</span>
                  <span className="text-white">
                    ¥{totals.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 tracking-wider">
                    諸経費 ({settings.overheadRate}%)
                  </span>
                  <span className="text-white">
                    ¥{totals.overhead.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 tracking-wider">
                    利益 ({settings.profitMargin}%)
                  </span>
                  <span className="text-white">
                    ¥{totals.profit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-blue-500/30">
                  <span className="text-zinc-400 tracking-wider">税抜金額</span>
                  <span className="text-white">
                    ¥{totals.beforeTax.toLocaleString()}
                  </span>
                </div>
                {settings.includeConsumptionTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 tracking-wider">
                      消費税 ({settings.taxRate}%)
                    </span>
                    <span className="text-white">
                      ¥{totals.tax.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg pt-3 border-t border-blue-500/30">
                  <span className="font-normal text-white tracking-wider">
                    合計金額
                  </span>
                  <span className="font-thin text-2xl text-blue-400">
                    ¥{totals.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-600 transition-colors text-xs tracking-wider"
              >
                戻る
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors text-xs tracking-wider"
              >
                確認
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: 確認・完了 */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-light text-white mb-8 tracking-wider">
              確認・完了
            </h2>

            {/* プレビュー */}
            <div className="bg-zinc-950 border border-zinc-800 p-8 mb-8">
              <div className="border-b border-zinc-800 pb-6 mb-6">
                <h3 className="text-2xl font-thin text-white mb-6 tracking-widest">
                  見積書
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1 tracking-wider">
                      宛先:
                    </p>
                    <p className="font-light text-white">
                      {customerInfo.companyName || '未指定'}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {customerInfo.contactPerson}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {customerInfo.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-1 tracking-wider">
                      見積番号:
                    </p>
                    <p className="font-light text-white">EST-2024-0001</p>
                    <p className="text-xs text-zinc-500 mt-3 tracking-wider">
                      発行日:
                    </p>
                    <p className="text-sm text-zinc-400">
                      {new Date().toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-xs text-zinc-500 mt-3 tracking-wider">
                      有効期限:
                    </p>
                    <p className="text-sm text-zinc-400">
                      {customerInfo.estimateValidUntil || '未指定'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-zinc-500 mb-2 tracking-wider">
                  プロジェクト:
                </p>
                <p className="font-light text-white text-lg">
                  {customerInfo.projectName || '未指定'}
                </p>
                <p className="text-sm text-zinc-400">
                  {customerInfo.projectLocation}
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-950/30 to-emerald-900/30 border border-emerald-500/30 p-6">
                <p className="text-xs text-emerald-400 mb-3 tracking-wider">
                  見積総額
                </p>
                <p className="text-4xl font-thin text-emerald-400">
                  ¥{totals.total.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 mt-2 tracking-wider">
                  (税込)
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-600 transition-colors text-xs tracking-wider"
              >
                戻る
              </button>
              <button
                onClick={() => router.push('/dark/estimates')}
                className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs tracking-wider"
              >
                見積作成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
