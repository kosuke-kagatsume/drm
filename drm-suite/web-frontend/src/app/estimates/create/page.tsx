'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  subcategory?: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  costPrice: number;
  grossProfit: number;
  profitRate: number;
  vendor?: string;
  materialCost?: number;
  laborCost?: number;
  subcontractorCost?: number;
  remarks?: string;
  isHighlighted?: boolean;
}

// 建設業界標準のテンプレート
const ESTIMATE_TEMPLATES = {
  reform: {
    name: 'リフォーム工事',
    description: '水回り・内装リフォーム',
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
        ],
      },
    ],
  },
  exterior: {
    name: '外壁・屋根塗装',
    description: '外壁と屋根の塗装工事',
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
    ],
  },
  newHouse: {
    name: '新築住宅',
    description: '木造2階建て住宅',
    icon: '🏠',
    sections: [
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
        ],
      },
    ],
  },
};

export default function CreateEstimatePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof ESTIMATE_TEMPLATES | null
  >(null);
  const [showRAG, setShowRAG] = useState(false);
  const [ragQuery, setRagQuery] = useState('');

  // 基本情報
  const [basicInfo, setBasicInfo] = useState({
    customerName: '',
    customerCompany: '',
    projectName: '',
    projectAddress: '',
    projectType: 'reform',
    constructionPeriod: '',
    paymentTerms: '契約時30%、中間時40%、完成時30%',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  });

  // 見積もりセクション
  const [sections, setSections] = useState<EstimateSection[]>([
    {
      id: '1',
      name: '外壁工事',
      order: 1,
      isExpanded: true,
      subtotal: 600000,
      items: [
        {
          id: '1-1',
          category: '外壁工事',
          itemName: '足場設置',
          specification: '枠組足場 W900×H1800',
          quantity: 150,
          unit: '㎡',
          unitPrice: 1200,
          amount: 180000,
          costPrice: 900,
          grossProfit: 45000,
          profitRate: 25,
          vendor: '協力会社A',
        },
        {
          id: '1-2',
          category: '外壁工事',
          itemName: '外壁塗装',
          specification: 'シリコン塗料 3回塗り',
          quantity: 120,
          unit: '㎡',
          unitPrice: 3500,
          amount: 420000,
          costPrice: 2800,
          grossProfit: 84000,
          profitRate: 20,
          vendor: '協力会社B',
        },
      ],
    },
  ]);

  // 諸経費設定
  const [expenses, setExpenses] = useState({
    siteManagementRate: 10,
    generalManagementRate: 8,
    profitRate: 10,
    discountAmount: 0,
    taxRate: 10,
  });

  const handleTemplateSelect = (template: keyof typeof ESTIMATE_TEMPLATES) => {
    setSelectedTemplate(template);
    const templateData = ESTIMATE_TEMPLATES[template];

    // テンプレートから初期セクションを作成
    const initialSections: EstimateSection[] = templateData.sections.map(
      (section, index) => {
        const items = section.items.map((item, itemIndex) => {
          const estimateItem: EstimateItem = {
            id: `item-${index}-${itemIndex}`,
            category: section.name,
            itemName: item.name,
            specification: item.spec || '',
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            costPrice: Math.round(item.unitPrice * 0.7),
            grossProfit: Math.round(item.quantity * item.unitPrice * 0.3),
            profitRate: 30,
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
      itemName: '',
      specification: '',
      unit: '式',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      costPrice: 0,
      grossProfit: 0,
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
              if (['quantity', 'unitPrice'].includes(field)) {
                updatedItem.amount =
                  updatedItem.quantity * updatedItem.unitPrice;
                updatedItem.grossProfit =
                  updatedItem.amount -
                  updatedItem.quantity * updatedItem.costPrice;
                updatedItem.profitRate =
                  updatedItem.amount > 0
                    ? (updatedItem.grossProfit / updatedItem.amount) * 100
                    : 0;
              }
              return updatedItem;
            }
            return item;
          });

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

  const deleteItem = (sectionId: string, itemId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const updatedItems = section.items.filter(
            (item) => item.id !== itemId,
          );
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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/estimates')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 見積一覧
            </button>
            <h1 className="text-2xl font-bold text-gray-900">新規見積作成</h1>
          </div>
          <button
            onClick={() => setShowRAG(!showRAG)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            🤖 RAGアシスタント
          </button>
        </div>
      </nav>

      {/* ステップインジケーター */}
      <div className="container mx-auto px-4 py-6">
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

        {/* メインコンテンツ */}
        <div className="flex gap-6">
          <div className={showRAG ? 'w-2/3' : 'w-full'}>
            {/* ステップ1: テンプレート選択 */}
            {activeStep === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">
                  見積もりテンプレートを選択
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                      <div className="text-4xl mb-3">{template.icon}</div>
                      <h3 className="text-lg font-bold mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-dandori-blue hover:text-dandori-blue-dark font-medium"
                  >
                    空白から作成 →
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 基本情報 */}
            {activeStep === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">基本情報</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      顧客名
                    </label>
                    <input
                      type="text"
                      value={basicInfo.customerName}
                      onChange={(e) =>
                        setBasicInfo({
                          ...basicInfo,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      案件名
                    </label>
                    <input
                      type="text"
                      value={basicInfo.projectName}
                      onChange={(e) =>
                        setBasicInfo({
                          ...basicInfo,
                          projectName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工事種別
                    </label>
                    <select
                      value={basicInfo.projectType}
                      onChange={(e) =>
                        setBasicInfo({
                          ...basicInfo,
                          projectType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="reform">リフォーム</option>
                      <option value="new_build">新築</option>
                      <option value="commercial">商業施設</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      構造
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="wooden">木造</option>
                      <option value="steel">鉄骨造</option>
                      <option value="rc">RC造</option>
                    </select>
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
                    className="px-4 py-2 bg-dandori-blue text-white rounded hover:bg-dandori-blue-dark"
                  >
                    次へ →
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: 見積項目 */}
            {activeStep === 3 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">明細</h2>
                  <button
                    onClick={addSection}
                    className="px-4 py-2 bg-dandori-blue text-white rounded hover:bg-dandori-blue-dark"
                  >
                    + 項目追加
                  </button>
                </div>
                <div className="p-6">
                  {sections.map((section) => (
                    <div key={section.id} className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <input
                          type="text"
                          value={section.name}
                          onChange={(e) => {
                            const updated = sections.map((s) =>
                              s.id === section.id
                                ? { ...s, name: e.target.value }
                                : s,
                            );
                            setSections(updated);
                          }}
                          className="text-lg font-bold bg-transparent border-none focus:outline-none"
                        />
                        <button
                          onClick={() => addItem(section.id)}
                          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          + 行追加
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-2 text-left">工事項目</th>
                              <th className="px-2 py-2 text-left">品名</th>
                              <th className="px-2 py-2 text-left">仕様</th>
                              <th className="px-2 py-2 text-right">数量</th>
                              <th className="px-2 py-2 text-left">単位</th>
                              <th className="px-2 py-2 text-right">単価</th>
                              <th className="px-2 py-2 text-right">金額</th>
                              <th className="px-2 py-2 text-right">原価</th>
                              <th className="px-2 py-2 text-right">粗利率</th>
                              <th className="px-2 py-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.items.map((item) => (
                              <tr key={item.id} className="border-b">
                                <td className="px-2 py-2">
                                  <input
                                    type="text"
                                    value={item.category}
                                    onChange={(e) =>
                                      updateItem(
                                        section.id,
                                        item.id,
                                        'category',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-1 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <input
                                    type="text"
                                    value={item.itemName}
                                    onChange={(e) =>
                                      updateItem(
                                        section.id,
                                        item.id,
                                        'itemName',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-1 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-2 py-2">
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
                                    className="w-full px-1 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItem(
                                        section.id,
                                        item.id,
                                        'quantity',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-20 px-1 py-1 border rounded text-right"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) =>
                                      updateItem(
                                        section.id,
                                        item.id,
                                        'unit',
                                        e.target.value,
                                      )
                                    }
                                    className="w-16 px-1 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                      updateItem(
                                        section.id,
                                        item.id,
                                        'unitPrice',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-24 px-1 py-1 border rounded text-right"
                                  />
                                </td>
                                <td className="px-2 py-2 text-right font-medium">
                                  ¥{item.amount.toLocaleString()}
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <input
                                    type="number"
                                    value={item.costPrice}
                                    onChange={(e) =>
                                      updateItem(
                                        section.id,
                                        item.id,
                                        'costPrice',
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-20 px-1 py-1 border rounded text-right"
                                  />
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <span
                                    className={
                                      item.profitRate >= 20
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }
                                  >
                                    {item.profitRate.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-2 py-2">
                                  <button
                                    onClick={() =>
                                      deleteItem(section.id, item.id)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    削除
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-100">
                            <tr>
                              <td
                                colSpan={6}
                                className="px-2 py-3 text-right font-semibold"
                              >
                                小計
                              </td>
                              <td className="px-2 py-3 text-right font-bold text-lg">
                                ¥{section.subtotal.toLocaleString()}
                              </td>
                              <td colSpan={3}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-gray-100 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">合計</span>
                      <span className="font-bold text-2xl text-dandori-blue">
                        ¥{totals.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>消費税（{expenses.taxRate}%）</span>
                        <span>¥{totals.tax.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      ← 前へ
                    </button>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        下書き保存
                      </button>
                      <button
                        onClick={() => {
                          alert('見積書を発行しました');
                          router.push('/estimates');
                        }}
                        className="px-6 py-2 bg-dandori-blue text-white rounded hover:bg-dandori-blue-dark"
                      >
                        承認申請
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RAGサイドパネル */}
          {showRAG && (
            <div className="w-1/3">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h3 className="font-semibold mb-3">🤖 RAGアシスタント</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="例: 築20年 木造 外壁塗装"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                    類似案件を検索
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="border rounded p-3 hover:bg-gray-50">
                    <p className="font-medium text-sm">
                      田中様邸 外壁リフォーム
                    </p>
                    <p className="text-xs text-gray-500">2023-06-15</p>
                    <p className="text-sm mt-1">金額: ¥1,850,000</p>
                    <p className="text-sm">粗利率: 22%</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded text-sm">
                  <p className="font-medium text-yellow-800 mb-1">
                    ⚠️ 抜け漏れチェック
                  </p>
                  <p className="text-xs text-gray-700">
                    外壁塗装には通常「足場費用」が必要です。追加しますか？
                  </p>
                  <button className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
                    自動追加
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
