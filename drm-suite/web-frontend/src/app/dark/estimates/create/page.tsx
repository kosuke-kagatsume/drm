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

// Dark Elegant Templates
const ESTIMATE_TEMPLATES = {
  reform: {
    name: 'RENOVATION PROJECT',
    description: 'INTERIOR & PLUMBING RENOVATION',
    sections: [
      {
        name: 'DEMOLITION WORK',
        items: [
          {
            name: 'INTERIOR DEMOLITION',
            unit: '㎡',
            quantity: 30,
            unitPrice: 3500,
            spec: 'FLOOR WALL CEILING REMOVAL',
          },
          {
            name: 'EQUIPMENT REMOVAL',
            unit: 'SET',
            quantity: 1,
            unitPrice: 80000,
            spec: 'EXISTING EQUIPMENT DISMANTLING',
          },
          {
            name: 'WASTE DISPOSAL',
            unit: 'TON',
            quantity: 2,
            unitPrice: 25000,
            spec: 'MIXED CONSTRUCTION WASTE',
          },
        ],
      },
      {
        name: 'KITCHEN CONSTRUCTION',
        items: [
          {
            name: 'SYSTEM KITCHEN',
            unit: 'SET',
            quantity: 1,
            unitPrice: 650000,
            spec: 'W2550 WITH DISHWASHER',
          },
          {
            name: 'KITCHEN PANEL',
            unit: '㎡',
            quantity: 6,
            unitPrice: 12000,
            spec: 'MELAMINE FIREPROOF PANEL',
          },
          {
            name: 'PLUMBING WORK',
            unit: 'SET',
            quantity: 1,
            unitPrice: 85000,
            spec: 'PIPE CONNECTION WORK',
          },
        ],
      },
    ],
  },
  exterior: {
    name: 'EXTERIOR & ROOF PAINTING',
    description: 'EXTERIOR WALL & ROOF COATING',
    sections: [
      {
        name: 'SCAFFOLDING WORK',
        items: [
          {
            name: 'SCAFFOLD SETUP',
            unit: '㎡',
            quantity: 250,
            unitPrice: 800,
            spec: 'SYSTEM SCAFFOLD',
          },
          {
            name: 'PROTECTION SHEET',
            unit: '㎡',
            quantity: 250,
            unitPrice: 200,
            spec: 'MESH PROTECTION',
          },
          {
            name: 'HIGH PRESSURE WASHING',
            unit: '㎡',
            quantity: 180,
            unitPrice: 300,
            spec: '150KG/CM² PRESSURE',
          },
        ],
      },
      {
        name: 'EXTERIOR PAINTING',
        items: [
          {
            name: 'SEALANT REPLACEMENT',
            unit: 'M',
            quantity: 120,
            unitPrice: 1200,
            spec: 'MODIFIED SILICONE',
          },
          {
            name: 'PRIMER COATING',
            unit: '㎡',
            quantity: 180,
            unitPrice: 800,
            spec: 'SEALER APPLICATION',
          },
          {
            name: 'INTERMEDIATE COATING',
            unit: '㎡',
            quantity: 180,
            unitPrice: 1200,
            spec: 'SILICONE PAINT',
          },
          {
            name: 'FINISH COATING',
            unit: '㎡',
            quantity: 180,
            unitPrice: 1200,
            spec: 'SILICONE PAINT',
          },
        ],
      },
    ],
  },
  newHouse: {
    name: 'NEW RESIDENTIAL CONSTRUCTION',
    description: 'WOODEN 2-STORY HOUSE',
    sections: [
      {
        name: 'FOUNDATION WORK',
        items: [
          {
            name: 'EXCAVATION',
            unit: 'M³',
            quantity: 80,
            unitPrice: 3500,
            spec: 'BACKHOE 0.25M³',
          },
          {
            name: 'CRUSHED STONE BASE',
            unit: '㎡',
            quantity: 120,
            unitPrice: 2800,
            spec: 'RECYCLED STONE T=100',
          },
          {
            name: 'FOUNDATION REBAR',
            unit: 'TON',
            quantity: 3.5,
            unitPrice: 95000,
            spec: 'D13 @200 SPACING',
          },
          {
            name: 'FOUNDATION CONCRETE',
            unit: 'M³',
            quantity: 35,
            unitPrice: 18000,
            spec: 'FC24 SLUMP15',
          },
        ],
      },
      {
        name: 'STRUCTURAL WORK',
        items: [
          {
            name: 'FOUNDATION PLATE',
            unit: 'M³',
            quantity: 2.5,
            unitPrice: 85000,
            spec: 'CYPRESS 120×120',
          },
          {
            name: 'STRUCTURAL COLUMNS',
            unit: 'M³',
            quantity: 8,
            unitPrice: 75000,
            spec: 'CEDAR 120×120',
          },
          {
            name: 'STRUCTURAL BEAMS',
            unit: 'M³',
            quantity: 6,
            unitPrice: 80000,
            spec: 'DOUGLAS FIR',
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

  // Basic information
  const [basicInfo, setBasicInfo] = useState({
    customerName: '',
    customerCompany: '',
    projectName: '',
    projectAddress: '',
    projectType: 'reform',
    constructionPeriod: '',
    paymentTerms: 'CONTRACT 30%, PROGRESS 40%, COMPLETION 30%',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  });

  // Estimate sections
  const [sections, setSections] = useState<EstimateSection[]>([
    {
      id: '1',
      name: 'EXTERIOR WORK',
      order: 1,
      isExpanded: true,
      subtotal: 600000,
      items: [
        {
          id: '1-1',
          category: 'EXTERIOR WORK',
          itemName: 'SCAFFOLD INSTALLATION',
          specification: 'FRAME SCAFFOLD W900×H1800',
          quantity: 150,
          unit: '㎡',
          unitPrice: 1200,
          amount: 180000,
          costPrice: 900,
          grossProfit: 45000,
          profitRate: 25,
          vendor: 'CONTRACTOR A',
        },
        {
          id: '1-2',
          category: 'EXTERIOR WORK',
          itemName: 'EXTERIOR PAINTING',
          specification: 'SILICONE PAINT 3-COAT SYSTEM',
          quantity: 120,
          unit: '㎡',
          unitPrice: 3500,
          amount: 420000,
          costPrice: 2800,
          grossProfit: 84000,
          profitRate: 20,
          vendor: 'CONTRACTOR B',
        },
      ],
    },
  ]);

  // Expense settings
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
      name: 'NEW SECTION',
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
      unit: 'SET',
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

  // Total calculation
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
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dark/estimates')}
              className="text-zinc-500 hover:text-white transition-colors text-sm tracking-wider"
            >
              ← ESTIMATE LIST
            </button>
            <div className="w-px h-6 bg-zinc-800"></div>
            <h1 className="text-2xl font-thin text-white tracking-widest">
              NEW ESTIMATE CREATION
            </h1>
          </div>
          <button
            onClick={() => setShowRAG(!showRAG)}
            className="bg-white text-black px-6 py-2 text-xs tracking-wider hover:bg-zinc-200 transition-colors"
          >
            RAG ASSISTANT
          </button>
        </div>
      </nav>

      {/* Step Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'TEMPLATE SELECTION' },
            { num: 2, label: 'BASIC INFORMATION' },
            { num: 3, label: 'ESTIMATE ITEMS' },
            { num: 4, label: 'EXPENSES & TOTAL' },
            { num: 5, label: 'REVIEW & ISSUE' },
          ].map((step, index) => (
            <div
              key={step.num}
              className={`flex items-center ${step.num < 5 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 border ${
                  activeStep >= step.num
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 text-zinc-500'
                }`}
              >
                {String(step.num).padStart(2, '0')}
              </div>
              <span className="ml-3 text-xs tracking-wider text-white">
                {step.label}
              </span>
              {step.num < 5 && (
                <div
                  className={`flex-1 h-px mx-4 ${
                    activeStep > step.num ? 'bg-white' : 'bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          <div className={showRAG ? 'w-2/3' : 'w-full'}>
            {/* Step 1: Template Selection */}
            {activeStep === 1 && (
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h2 className="text-lg font-thin text-white tracking-widest mb-6">
                  SELECT ESTIMATE TEMPLATE
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
                      className="group relative bg-black border border-zinc-800 p-6 hover:border-zinc-600 transition-all text-left"
                    >
                      <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-sm mb-4">
                        {String(
                          Object.keys(ESTIMATE_TEMPLATES).indexOf(key) + 1,
                        ).padStart(2, '0')}
                      </div>
                      <h3 className="text-sm font-light text-white tracking-wider mb-2">
                        {template.name}
                      </h3>
                      <p className="text-xs text-zinc-500 tracking-wider">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                  >
                    CREATE FROM BLANK →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Basic Information */}
            {activeStep === 2 && (
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h2 className="text-lg font-thin text-white tracking-widest mb-6">
                  BASIC INFORMATION
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      CUSTOMER NAME
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      PROJECT NAME
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
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      PROJECT TYPE
                    </label>
                    <select
                      value={basicInfo.projectType}
                      onChange={(e) =>
                        setBasicInfo({
                          ...basicInfo,
                          projectType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                    >
                      <option value="reform">RENOVATION</option>
                      <option value="new_build">NEW CONSTRUCTION</option>
                      <option value="commercial">COMMERCIAL FACILITY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-2">
                      STRUCTURE TYPE
                    </label>
                    <select className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm">
                      <option value="wooden">WOODEN FRAME</option>
                      <option value="steel">STEEL FRAME</option>
                      <option value="rc">REINFORCED CONCRETE</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-6 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                  >
                    ← PREVIOUS
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-6 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Estimate Items */}
            {activeStep === 3 && (
              <div className="bg-zinc-950 border border-zinc-800">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                  <h2 className="text-lg font-thin text-white tracking-widest">
                    DETAILED ITEMS
                  </h2>
                  <button
                    onClick={addSection}
                    className="px-6 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                  >
                    + ADD SECTION
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
                          className="text-sm font-light text-white bg-transparent border-none focus:outline-none tracking-wider"
                        />
                        <button
                          onClick={() => addItem(section.id)}
                          className="text-xs px-4 py-1 border border-zinc-800 text-white tracking-wider hover:bg-zinc-900 transition-colors"
                        >
                          + ADD ITEM
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-zinc-900">
                            <tr>
                              <th className="px-3 py-3 text-left text-zinc-500 tracking-wider">
                                WORK ITEM
                              </th>
                              <th className="px-3 py-3 text-left text-zinc-500 tracking-wider">
                                PRODUCT NAME
                              </th>
                              <th className="px-3 py-3 text-left text-zinc-500 tracking-wider">
                                SPECIFICATION
                              </th>
                              <th className="px-3 py-3 text-right text-zinc-500 tracking-wider">
                                QTY
                              </th>
                              <th className="px-3 py-3 text-left text-zinc-500 tracking-wider">
                                UNIT
                              </th>
                              <th className="px-3 py-3 text-right text-zinc-500 tracking-wider">
                                UNIT PRICE
                              </th>
                              <th className="px-3 py-3 text-right text-zinc-500 tracking-wider">
                                AMOUNT
                              </th>
                              <th className="px-3 py-3 text-right text-zinc-500 tracking-wider">
                                COST
                              </th>
                              <th className="px-3 py-3 text-right text-zinc-500 tracking-wider">
                                MARGIN
                              </th>
                              <th className="px-3 py-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.items.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-zinc-800"
                              >
                                <td className="px-3 py-3">
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
                                    className="w-full px-2 py-1 bg-black border border-zinc-800 text-white text-xs"
                                  />
                                </td>
                                <td className="px-3 py-3">
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
                                    className="w-full px-2 py-1 bg-black border border-zinc-800 text-white text-xs"
                                  />
                                </td>
                                <td className="px-3 py-3">
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
                                    className="w-full px-2 py-1 bg-black border border-zinc-800 text-white text-xs"
                                  />
                                </td>
                                <td className="px-3 py-3 text-right">
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
                                    className="w-20 px-2 py-1 bg-black border border-zinc-800 text-white text-xs text-right"
                                  />
                                </td>
                                <td className="px-3 py-3">
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
                                    className="w-16 px-2 py-1 bg-black border border-zinc-800 text-white text-xs"
                                  />
                                </td>
                                <td className="px-3 py-3 text-right">
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
                                    className="w-24 px-2 py-1 bg-black border border-zinc-800 text-white text-xs text-right"
                                  />
                                </td>
                                <td className="px-3 py-3 text-right font-light text-white">
                                  ¥{item.amount.toLocaleString()}
                                </td>
                                <td className="px-3 py-3 text-right">
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
                                    className="w-20 px-2 py-1 bg-black border border-zinc-800 text-white text-xs text-right"
                                  />
                                </td>
                                <td className="px-3 py-3 text-right">
                                  <span
                                    className={
                                      item.profitRate >= 20
                                        ? 'text-emerald-500'
                                        : 'text-red-500'
                                    }
                                  >
                                    {item.profitRate.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-3 py-3">
                                  <button
                                    onClick={() =>
                                      deleteItem(section.id, item.id)
                                    }
                                    className="text-red-500 hover:text-red-400 text-xs tracking-wider"
                                  >
                                    DELETE
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-zinc-900">
                            <tr>
                              <td
                                colSpan={6}
                                className="px-3 py-3 text-right text-zinc-500 tracking-wider text-xs"
                              >
                                SUBTOTAL
                              </td>
                              <td className="px-3 py-3 text-right font-light text-white text-sm">
                                ¥{section.subtotal.toLocaleString()}
                              </td>
                              <td colSpan={3}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 tracking-wider">
                        TOTAL AMOUNT
                      </span>
                      <span className="text-2xl font-thin text-white">
                        ¥{totals.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-zinc-600">
                      <div className="flex justify-between">
                        <span>TAX ({expenses.taxRate}%)</span>
                        <span>¥{totals.tax.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
                    >
                      ← PREVIOUS
                    </button>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 border border-zinc-800 text-white text-xs tracking-wider hover:bg-zinc-900 transition-colors">
                        SAVE DRAFT
                      </button>
                      <button
                        onClick={() => {
                          alert('ESTIMATE SUBMITTED FOR APPROVAL');
                          router.push('/dark/estimates');
                        }}
                        className="px-6 py-2 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                      >
                        SUBMIT FOR APPROVAL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RAG Side Panel */}
          {showRAG && (
            <div className="w-1/3">
              <div className="bg-zinc-950 border border-zinc-800 p-4 sticky top-4">
                <h3 className="text-sm text-white tracking-widest mb-4">
                  RAG ASSISTANT
                </h3>
                <div className="mb-4">
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="E.G. 20-YEAR WOODEN HOUSE EXTERIOR PAINTING"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-xs"
                  />
                  <button className="mt-3 w-full bg-white text-black py-3 text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                    SEARCH SIMILAR PROJECTS
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="border border-zinc-800 p-3 hover:bg-zinc-900 transition-colors">
                    <p className="text-sm text-white tracking-wider">
                      TANAKA RESIDENCE EXTERIOR RENOVATION
                    </p>
                    <p className="text-xs text-zinc-500 tracking-wider">
                      2023-06-15
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      AMOUNT: ¥1,850,000
                    </p>
                    <p className="text-xs text-zinc-400">MARGIN: 22%</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 text-xs">
                  <p className="text-amber-500 tracking-wider mb-1">
                    ⚠ MISSING ITEM CHECK
                  </p>
                  <p className="text-zinc-400 tracking-wider">
                    EXTERIOR PAINTING USUALLY REQUIRES "SCAFFOLDING COSTS". ADD?
                  </p>
                  <button className="mt-2 text-xs bg-amber-500 text-black px-3 py-1 hover:bg-amber-400 transition-colors tracking-wider">
                    AUTO ADD
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
