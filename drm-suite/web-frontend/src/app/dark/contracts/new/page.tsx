'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Contract templates
const CONTRACT_TEMPLATES = {
  construction: {
    name: 'CONSTRUCTION CONTRACT',
    description: 'GENERAL CONSTRUCTION WORK CONTRACT',
    indicator: '01',
    clauses: [
      'WORK CONTENT & SCOPE',
      'CONTRACT AMOUNT & PAYMENT TERMS',
      'CONSTRUCTION PERIOD & DELIVERY',
      'CONSTRUCTION & SAFETY MANAGEMENT',
      'WARRANTY LIABILITY',
      'CONTRACT TERMINATION',
      'DAMAGE COMPENSATION',
      'DISPUTE RESOLUTION',
    ],
  },
  subcontract: {
    name: 'SUBCONTRACT AGREEMENT',
    description: 'SUBCONTRACTOR AGREEMENT',
    indicator: '02',
    clauses: [
      'WORK CONTENT',
      'CONTRACT AMOUNT',
      'PAYMENT TERMS',
      'CONSTRUCTION PERIOD',
      'SAFETY MANAGEMENT',
      'INSURANCE COVERAGE',
      'SUB-SUBCONTRACTING PROHIBITION',
    ],
  },
  maintenance: {
    name: 'MAINTENANCE CONTRACT',
    description: 'PERIODIC MAINTENANCE SERVICE CONTRACT',
    indicator: '03',
    clauses: [
      'MAINTENANCE CONTENT',
      'CONTRACT PERIOD',
      'FEES & PAYMENT METHOD',
      'SERVICE HOURS',
      'EMERGENCY RESPONSE',
      'PARTS REPLACEMENT',
      'DISCLAIMERS',
    ],
  },
  lease: {
    name: 'EQUIPMENT LEASE CONTRACT',
    description: 'CONSTRUCTION EQUIPMENT LEASE AGREEMENT',
    indicator: '04',
    clauses: [
      'LEASE ITEMS',
      'LEASE PERIOD',
      'LEASE FEES',
      'MAINTENANCE',
      'INSURANCE',
      'RETURN CONDITIONS',
      'DAMAGE COMPENSATION',
    ],
  },
  consulting: {
    name: 'CONSULTING CONTRACT',
    description: 'DESIGN & SUPERVISION CONSULTING CONTRACT',
    indicator: '05',
    clauses: [
      'SERVICE CONTENT',
      'CONTRACT PERIOD',
      'COMPENSATION',
      'DELIVERABLES',
      'INTELLECTUAL PROPERTY',
      'CONFIDENTIALITY',
      'LIABILITY SCOPE',
    ],
  },
};

interface ContractFormData {
  // Basic info
  contractType: string;
  contractNo: string;
  contractDate: string;

  // Party A (Client) info
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientRepresentative: string;

  // Party B (Contractor) info
  contractorName: string;
  contractorCompany: string;
  contractorAddress: string;
  contractorPhone: string;
  contractorEmail: string;
  contractorRepresentative: string;

  // Project info
  projectName: string;
  projectLocation: string;
  projectDescription: string;
  startDate: string;
  endDate: string;

  // Amount info
  contractAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;

  // Payment terms
  paymentTerms: string;
  paymentSchedule: PaymentSchedule[];

  // Special clauses
  specialClauses: string;
  attachments: string[];
}

interface PaymentSchedule {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  dueDate: string;
  condition: string;
}

export default function DarkNewContractPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<
    keyof typeof CONTRACT_TEMPLATES | null
  >(null);

  const [formData, setFormData] = useState<ContractFormData>({
    contractType: '',
    contractNo: `CON-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    contractDate: new Date().toISOString().split('T')[0],

    clientName: '',
    clientCompany: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    clientRepresentative: '',

    contractorName: 'YAMADA CONSTRUCTION CO., LTD.',
    contractorCompany: 'YAMADA CONSTRUCTION CO., LTD.',
    contractorAddress: 'MINATO-KU, TOKYO',
    contractorPhone: '03-1234-5678',
    contractorEmail: 'info@yamada-construction.jp',
    contractorRepresentative: 'YAMADA TARO',

    projectName: '',
    projectLocation: '',
    projectDescription: '',
    startDate: '',
    endDate: '',

    contractAmount: 0,
    taxRate: 10,
    taxAmount: 0,
    totalAmount: 0,

    paymentTerms: '30% ON CONTRACT, 40% MIDTERM, 30% ON COMPLETION',
    paymentSchedule: [
      {
        id: '1',
        name: 'CONTRACT FEE',
        percentage: 30,
        amount: 0,
        dueDate: '',
        condition: 'ON CONTRACT SIGNING',
      },
      {
        id: '2',
        name: 'MIDTERM PAYMENT',
        percentage: 40,
        amount: 0,
        dueDate: '',
        condition: 'ON FRAMEWORK COMPLETION',
      },
      {
        id: '3',
        name: 'FINAL PAYMENT',
        percentage: 30,
        amount: 0,
        dueDate: '',
        condition: 'ON DELIVERY',
      },
    ],

    specialClauses: '',
    attachments: [],
  });

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

  const handleTemplateSelect = (template: keyof typeof CONTRACT_TEMPLATES) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      contractType: CONTRACT_TEMPLATES[template].name,
    });
    setActiveStep(2);
  };

  const updateAmount = () => {
    const tax = formData.contractAmount * (formData.taxRate / 100);
    const total = formData.contractAmount + tax;

    setFormData({
      ...formData,
      taxAmount: tax,
      totalAmount: total,
      paymentSchedule: formData.paymentSchedule.map((schedule) => ({
        ...schedule,
        amount: Math.round(total * (schedule.percentage / 100)),
      })),
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dark/contracts')}
                className="mr-6 text-zinc-500 hover:text-white transition-colors text-xs tracking-wider"
              >
                ← BACK
              </button>
              <h1 className="text-2xl font-thin text-white tracking-widest">
                CREATE NEW CONTRACT
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-zinc-800 text-zinc-300 text-xs tracking-wider hover:bg-zinc-700 hover:text-white transition-colors">
                SAVE DRAFT
              </button>
              <button className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors">
                CREATE CONTRACT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'TEMPLATE SELECTION' },
            { num: 2, label: 'PARTY INFORMATION' },
            { num: 3, label: 'PROJECT DETAILS' },
            { num: 4, label: 'AMOUNT & PAYMENT' },
            { num: 5, label: 'REVIEW & CREATE' },
          ].map((step) => (
            <div
              key={step.num}
              className={`flex items-center ${step.num < 5 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 border flex items-center justify-center text-xs tracking-wider ${
                  activeStep >= step.num
                    ? 'bg-white text-black border-white'
                    : 'border-zinc-700 text-zinc-500'
                }`}
              >
                {String(step.num).padStart(2, '0')}
              </div>
              <span className="ml-3 text-xs font-light text-zinc-400 tracking-wider">
                {step.label}
              </span>
              {step.num < 5 && (
                <div
                  className={`flex-1 h-px mx-4 ${
                    activeStep > step.num ? 'bg-zinc-500' : 'bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Step 1: Template Selection */}
        {activeStep === 1 && (
          <div className="bg-zinc-950 border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-thin text-white tracking-widest mb-3">
                SELECT CONTRACT TEMPLATE
              </h2>
              <p className="text-zinc-500 text-sm tracking-wider">
                CHOOSE A TEMPLATE BASED ON YOUR CONTRACT TYPE
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(CONTRACT_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleTemplateSelect(
                        key as keyof typeof CONTRACT_TEMPLATES,
                      )
                    }
                    className="group relative bg-black border border-zinc-800 p-6 hover:border-zinc-600 transition-all text-left"
                  >
                    <div className="absolute top-6 right-6 w-12 h-12 border border-zinc-700 flex items-center justify-center text-zinc-400 font-light text-xs group-hover:border-zinc-500 group-hover:text-zinc-300">
                      {template.indicator}
                    </div>
                    <div className="pr-16">
                      <h3 className="text-lg font-light text-white mb-3 tracking-wider">
                        {template.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mb-4 tracking-wider">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-normal text-zinc-400 tracking-wider">
                          KEY CLAUSES:
                        </p>
                        {template.clauses.slice(0, 3).map((clause, index) => (
                          <div
                            key={index}
                            className="flex items-center text-xs text-zinc-600 tracking-wider"
                          >
                            <span className="w-1 h-1 bg-zinc-600 mr-3"></span>
                            {clause}
                          </div>
                        ))}
                        {template.clauses.length > 3 && (
                          <p className="text-xs text-zinc-700 italic tracking-wider">
                            +{template.clauses.length - 3} MORE ITEMS
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-zinc-600 to-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button className="text-zinc-500 hover:text-zinc-300 flex items-center gap-3 text-xs tracking-wider transition-colors">
                      <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-xs">
                        06
                      </span>
                      <span>CREATE FROM PAST CONTRACT</span>
                    </button>
                    <button className="text-zinc-500 hover:text-zinc-300 flex items-center gap-3 text-xs tracking-wider transition-colors">
                      <span className="w-6 h-6 border border-zinc-700 flex items-center justify-center text-xs">
                        07
                      </span>
                      <span>IMPORT WORD FILE</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-zinc-400 hover:text-white font-light tracking-wider text-xs transition-colors"
                  >
                    CREATE FROM BLANK →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Party Information */}
        {activeStep === 2 && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h2 className="text-xl font-thin text-white mb-8 tracking-widest">
              PARTY INFORMATION
            </h2>

            <div className="space-y-8">
              {/* Party A (Client) Information */}
              <div>
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center">
                  <span className="bg-blue-500 text-white px-3 py-1 text-xs mr-4 tracking-wider">
                    PARTY A
                  </span>
                  CLIENT INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                      placeholder="TANAKA TARO"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      COMPANY
                    </label>
                    <input
                      type="text"
                      value={formData.clientCompany}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientCompany: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                      placeholder="COMPANY NAME"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.clientAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientAddress: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                      placeholder="TOKYO, JAPAN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      PHONE
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientPhone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                      placeholder="090-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientEmail: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                      placeholder="tanaka@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Party B (Contractor) Information */}
              <div>
                <h3 className="text-lg font-light text-white mb-6 tracking-wider flex items-center">
                  <span className="bg-amber-500 text-white px-3 py-1 text-xs mr-4 tracking-wider">
                    PARTY B
                  </span>
                  CONTRACTOR INFORMATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      COMPANY NAME
                    </label>
                    <input
                      type="text"
                      value={formData.contractorCompany}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractorCompany: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      REPRESENTATIVE
                    </label>
                    <input
                      type="text"
                      value={formData.contractorRepresentative}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractorRepresentative: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                      ADDRESS
                    </label>
                    <input
                      type="text"
                      value={formData.contractorAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contractorAddress: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-6 py-3 text-zinc-500 hover:text-white text-xs tracking-wider transition-colors"
              >
                ← PREVIOUS
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Project Details */}
        {activeStep === 3 && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h2 className="text-xl font-thin text-white mb-8 tracking-widest">
              PROJECT DETAILS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                  PROJECT NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  placeholder="RESIDENCE CONSTRUCTION PROJECT"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                  PROJECT LOCATION <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectLocation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  placeholder="TOKYO, JAPAN"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                  PROJECT DESCRIPTION
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  rows={4}
                  placeholder="ENTER PROJECT DESCRIPTION..."
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                  START DATE <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                  COMPLETION DATE <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-6 py-3 text-zinc-500 hover:text-white text-xs tracking-wider transition-colors"
              >
                ← PREVIOUS
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                NEXT →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Amount & Payment Terms */}
        {activeStep === 4 && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h2 className="text-xl font-thin text-white mb-8 tracking-widest">
              AMOUNT & PAYMENT TERMS
            </h2>

            <div className="space-y-8">
              {/* Contract Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    CONTRACT AMOUNT (EXCL. TAX){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.contractAmount}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        contractAmount: parseFloat(e.target.value) || 0,
                      });
                    }}
                    onBlur={updateAmount}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 tracking-wider mb-3">
                    TAX RATE (%)
                  </label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        taxRate: parseFloat(e.target.value) || 0,
                      });
                    }}
                    onBlur={updateAmount}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 transition-colors text-sm tracking-wider"
                  />
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-xs tracking-wider">
                      CONTRACT AMOUNT (EXCL. TAX)
                    </span>
                    <span className="font-light text-white tracking-wider">
                      ¥{formData.contractAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-xs tracking-wider">
                      TAX ({formData.taxRate}%)
                    </span>
                    <span className="font-light text-white tracking-wider">
                      ¥{formData.taxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-zinc-800">
                    <span className="text-lg font-thin tracking-wider">
                      TOTAL AMOUNT (INCL. TAX)
                    </span>
                    <span className="text-lg font-thin text-emerald-500 tracking-wider">
                      ¥{formData.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div>
                <h3 className="text-lg font-light text-white mb-6 tracking-wider">
                  PAYMENT SCHEDULE
                </h3>
                <div className="space-y-3">
                  {formData.paymentSchedule.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className="grid grid-cols-5 gap-3 items-center p-4 bg-zinc-900/30 border border-zinc-800"
                    >
                      <input
                        type="text"
                        value={schedule.name}
                        onChange={(e) => {
                          const updated = [...formData.paymentSchedule];
                          updated[index].name = e.target.value;
                          setFormData({
                            ...formData,
                            paymentSchedule: updated,
                          });
                        }}
                        className="px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 text-sm tracking-wider"
                        placeholder="PAYMENT NAME"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={schedule.percentage}
                          onChange={(e) => {
                            const updated = [...formData.paymentSchedule];
                            updated[index].percentage =
                              parseFloat(e.target.value) || 0;
                            updated[index].amount = Math.round(
                              formData.totalAmount *
                                (updated[index].percentage / 100),
                            );
                            setFormData({
                              ...formData,
                              paymentSchedule: updated,
                            });
                          }}
                          className="w-20 px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 text-sm text-right tracking-wider"
                        />
                        <span className="text-zinc-500">%</span>
                      </div>
                      <div className="text-right font-light text-white tracking-wider">
                        ¥{schedule.amount.toLocaleString()}
                      </div>
                      <input
                        type="date"
                        value={schedule.dueDate}
                        onChange={(e) => {
                          const updated = [...formData.paymentSchedule];
                          updated[index].dueDate = e.target.value;
                          setFormData({
                            ...formData,
                            paymentSchedule: updated,
                          });
                        }}
                        className="px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 text-sm tracking-wider"
                      />
                      <input
                        type="text"
                        value={schedule.condition}
                        onChange={(e) => {
                          const updated = [...formData.paymentSchedule];
                          updated[index].condition = e.target.value;
                          setFormData({
                            ...formData,
                            paymentSchedule: updated,
                          });
                        }}
                        className="px-3 py-2 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-600 text-sm tracking-wider"
                        placeholder="PAYMENT CONDITION"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      paymentSchedule: [
                        ...formData.paymentSchedule,
                        {
                          id: String(Date.now()),
                          name: '',
                          percentage: 0,
                          amount: 0,
                          dueDate: '',
                          condition: '',
                        },
                      ],
                    });
                  }}
                  className="mt-4 px-6 py-3 border-2 border-dashed border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors w-full text-xs tracking-wider"
                >
                  + ADD PAYMENT TERM
                </button>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setActiveStep(3)}
                className="px-6 py-3 text-zinc-500 hover:text-white text-xs tracking-wider transition-colors"
              >
                ← PREVIOUS
              </button>
              <button
                onClick={() => setActiveStep(5)}
                className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
              >
                REVIEW →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Create */}
        {activeStep === 5 && (
          <div className="bg-zinc-950 border border-zinc-800 p-6">
            <h2 className="text-xl font-thin text-white mb-8 tracking-widest">
              CONTRACT REVIEW
            </h2>

            <div className="border border-zinc-800 p-8 mb-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-thin tracking-widest text-white">
                  {formData.contractType || 'CONSTRUCTION CONTRACT'}
                </h3>
                <p className="text-xs text-zinc-500 mt-3 tracking-wider">
                  CONTRACT NO: {formData.contractNo}
                </p>
              </div>

              <div className="space-y-8">
                {/* Contract Parties */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      PARTY A (CLIENT)
                    </p>
                    <p className="font-normal text-lg text-white tracking-wider">
                      {formData.clientName}
                    </p>
                    {formData.clientCompany && (
                      <p className="text-sm text-zinc-400 tracking-wider">
                        {formData.clientCompany}
                      </p>
                    )}
                    <p className="text-sm text-zinc-500 mt-2 tracking-wider">
                      {formData.clientAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 tracking-wider mb-2">
                      PARTY B (CONTRACTOR)
                    </p>
                    <p className="font-normal text-lg text-white tracking-wider">
                      {formData.contractorCompany}
                    </p>
                    <p className="text-sm text-zinc-400 tracking-wider">
                      {formData.contractorRepresentative}
                    </p>
                    <p className="text-sm text-zinc-500 mt-2 tracking-wider">
                      {formData.contractorAddress}
                    </p>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h4 className="font-normal text-white mb-4 tracking-wider">
                    PROJECT DETAILS
                  </h4>
                  <div className="bg-zinc-900/30 border border-zinc-800 p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-zinc-500 tracking-wider">
                        PROJECT NAME:
                      </span>
                      <span className="font-light text-white tracking-wider">
                        {formData.projectName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-zinc-500 tracking-wider">
                        PROJECT LOCATION:
                      </span>
                      <span className="font-light text-white tracking-wider">
                        {formData.projectLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-zinc-500 tracking-wider">
                        PROJECT PERIOD:
                      </span>
                      <span className="font-light text-white tracking-wider">
                        {formData.startDate} - {formData.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contract Amount */}
                <div className="text-center py-8 bg-zinc-900/30 border border-zinc-800">
                  <p className="text-xs text-zinc-500 tracking-wider">
                    CONTRACT AMOUNT
                  </p>
                  <p className="text-4xl font-thin text-emerald-500 mt-3 tracking-wider">
                    ¥{formData.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 mt-3 tracking-wider">
                    (TAX INCLUDED)
                  </p>
                </div>

                {/* Payment Terms */}
                <div>
                  <h4 className="font-normal text-white mb-4 tracking-wider">
                    PAYMENT TERMS
                  </h4>
                  <div className="bg-zinc-900/30 border border-zinc-800 p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left py-3 text-xs text-zinc-500 tracking-wider">
                            PAYMENT
                          </th>
                          <th className="text-right py-3 text-xs text-zinc-500 tracking-wider">
                            PERCENTAGE
                          </th>
                          <th className="text-right py-3 text-xs text-zinc-500 tracking-wider">
                            AMOUNT
                          </th>
                          <th className="text-left py-3 pl-6 text-xs text-zinc-500 tracking-wider">
                            CONDITION
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.paymentSchedule.map((schedule) => (
                          <tr
                            key={schedule.id}
                            className="border-b border-zinc-800"
                          >
                            <td className="py-3 text-white font-light tracking-wider">
                              {schedule.name}
                            </td>
                            <td className="text-right py-3 text-zinc-400 tracking-wider">
                              {schedule.percentage}%
                            </td>
                            <td className="text-right py-3 text-white font-light tracking-wider">
                              ¥{schedule.amount.toLocaleString()}
                            </td>
                            <td className="py-3 pl-6 text-zinc-400 tracking-wider">
                              {schedule.condition}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(4)}
                className="px-6 py-3 text-zinc-500 hover:text-white text-xs tracking-wider transition-colors"
              >
                ← PREVIOUS
              </button>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-zinc-800 text-zinc-300 text-xs tracking-wider hover:bg-zinc-700 hover:text-white transition-colors">
                  EXPORT PDF
                </button>
                <button className="px-6 py-3 bg-emerald-500 text-white text-xs tracking-wider hover:bg-emerald-400 transition-colors">
                  REQUEST E-SIGNATURE
                </button>
                <button
                  onClick={() => {
                    alert('CONTRACT CREATED SUCCESSFULLY');
                    router.push('/dark/contracts');
                  }}
                  className="px-6 py-3 bg-white text-black text-xs tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  CREATE CONTRACT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
