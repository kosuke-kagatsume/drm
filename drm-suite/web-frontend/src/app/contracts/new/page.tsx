'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 契約書テンプレート
const CONTRACT_TEMPLATES = {
  construction: {
    name: '建設工事請負契約',
    description: '一般的な建設工事の請負契約書',
    icon: '🏗️',
    clauses: [
      '工事内容及び請負範囲',
      '請負代金及び支払条件',
      '工期及び引渡し',
      '施工管理及び安全管理',
      '瑕疵担保責任',
      '契約解除',
      '損害賠償',
      '紛争解決',
    ],
  },
  subcontract: {
    name: '下請負契約',
    description: '協力会社との下請負契約書',
    icon: '🤝',
    clauses: [
      '工事内容',
      '請負代金',
      '支払条件',
      '工期',
      '安全管理',
      '保険加入',
      '再下請負の禁止',
    ],
  },
  maintenance: {
    name: '保守メンテナンス契約',
    description: '定期保守・メンテナンス契約書',
    icon: '🔧',
    clauses: [
      'メンテナンス内容',
      '契約期間',
      '料金及び支払方法',
      '対応時間',
      '緊急対応',
      '部品交換',
      '免責事項',
    ],
  },
  lease: {
    name: '建設機械リース契約',
    description: '建設機械・重機のリース契約書',
    icon: '🚜',
    clauses: [
      'リース物件',
      'リース期間',
      'リース料金',
      '保守管理',
      '保険',
      '返却条件',
      '損害賠償',
    ],
  },
  consulting: {
    name: 'コンサルティング契約',
    description: '設計・監理等のコンサルティング契約',
    icon: '📋',
    clauses: [
      '業務内容',
      '契約期間',
      '報酬',
      '成果物',
      '知的財産権',
      '秘密保持',
      '責任範囲',
    ],
  },
};

interface ContractFormData {
  // 基本情報
  contractType: string;
  contractNo: string;
  contractDate: string;

  // 甲（発注者）情報
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientRepresentative: string;

  // 乙（受注者）情報
  contractorName: string;
  contractorCompany: string;
  contractorAddress: string;
  contractorPhone: string;
  contractorEmail: string;
  contractorRepresentative: string;

  // 工事情報
  projectName: string;
  projectLocation: string;
  projectDescription: string;
  startDate: string;
  endDate: string;

  // 金額情報
  contractAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;

  // 支払条件
  paymentTerms: string;
  paymentSchedule: PaymentSchedule[];

  // 特記事項
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

export default function NewContractPage() {
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

    contractorName: '山田建設株式会社',
    contractorCompany: '山田建設株式会社',
    contractorAddress: '東京都港区〇〇1-2-3',
    contractorPhone: '03-1234-5678',
    contractorEmail: 'info@yamada-construction.jp',
    contractorRepresentative: '山田太郎',

    projectName: '',
    projectLocation: '',
    projectDescription: '',
    startDate: '',
    endDate: '',

    contractAmount: 0,
    taxRate: 10,
    taxAmount: 0,
    totalAmount: 0,

    paymentTerms: '契約時30%、中間時40%、完成引渡時30%',
    paymentSchedule: [
      {
        id: '1',
        name: '契約金',
        percentage: 30,
        amount: 0,
        dueDate: '',
        condition: '契約締結時',
      },
      {
        id: '2',
        name: '中間金',
        percentage: 40,
        amount: 0,
        dueDate: '',
        condition: '上棟時',
      },
      {
        id: '3',
        name: '完成金',
        percentage: 30,
        amount: 0,
        dueDate: '',
        condition: '引渡時',
      },
    ],

    specialClauses: '',
    attachments: [],
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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/contracts')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                新規契約書作成
              </h1>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                下書き保存
              </button>
              <button className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark">
                契約書作成
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
            { num: 2, label: '契約者情報' },
            { num: 3, label: '工事詳細' },
            { num: 4, label: '金額・支払条件' },
            { num: 5, label: '確認・作成' },
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
                契約書テンプレートを選択
              </h2>
              <p className="text-gray-600">
                用途に合わせたテンプレートを選択してください
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CONTRACT_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleTemplateSelect(
                        key as keyof typeof CONTRACT_TEMPLATES,
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
                          主な条項:
                        </p>
                        {template.clauses.slice(0, 3).map((clause, index) => (
                          <div
                            key={index}
                            className="flex items-center text-xs text-gray-600"
                          >
                            <span className="w-1.5 h-1.5 bg-dandori-blue rounded-full mr-2"></span>
                            {clause}
                          </div>
                        ))}
                        {template.clauses.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            ...他{template.clauses.length - 3}項目
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
                      <span className="text-sm">過去の契約書から作成</span>
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
                      <span>⬇️</span>
                      <span className="text-sm">Wordファイルをインポート</span>
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

        {/* ステップ2: 契約者情報 */}
        {activeStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">契約者情報</h2>

            <div className="space-y-6">
              {/* 甲（発注者）情報 */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <span className="bg-dandori-blue text-white rounded px-2 py-1 text-sm mr-2">
                    甲
                  </span>
                  発注者情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
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
                      value={formData.clientCompany}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientCompany: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                      placeholder="株式会社〇〇"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      住所 <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                      placeholder="東京都〇〇区〇〇1-2-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                      placeholder="090-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                      placeholder="tanaka@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* 乙（受注者）情報 */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <span className="bg-dandori-orange text-white rounded px-2 py-1 text-sm mr-2">
                    乙
                  </span>
                  受注者情報（自社）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      会社名
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      代表者名
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      住所
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    />
                  </div>
                </div>
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

        {/* ステップ3: 工事詳細 */}
        {activeStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">工事詳細</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="〇〇様邸新築工事"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事場所 <span className="text-red-500">*</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  placeholder="東京都〇〇区〇〇1-2-3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事概要
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  rows={4}
                  placeholder="工事の概要を入力してください"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  着工日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  完成予定日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
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

        {/* ステップ4: 金額・支払条件 */}
        {activeStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">金額・支払条件</h2>

            <div className="space-y-6">
              {/* 契約金額 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    契約金額（税抜） <span className="text-red-500">*</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    消費税率（%）
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                  />
                </div>
              </div>

              {/* 金額サマリー */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">契約金額（税抜）</span>
                    <span className="font-medium">
                      ¥{formData.contractAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      消費税（{formData.taxRate}%）
                    </span>
                    <span className="font-medium">
                      ¥{formData.taxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-lg font-bold">合計金額（税込）</span>
                    <span className="text-lg font-bold text-dandori-blue">
                      ¥{formData.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 支払スケジュール */}
              <div>
                <h3 className="text-lg font-medium mb-4">支払スケジュール</h3>
                <div className="space-y-3">
                  {formData.paymentSchedule.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className="grid grid-cols-5 gap-3 items-center p-3 bg-gray-50 rounded-lg"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                        placeholder="支払名"
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
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue text-right"
                        />
                        <span>%</span>
                      </div>
                      <div className="text-right font-medium">
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dandori-blue/20 focus:border-dandori-blue"
                        placeholder="支払条件"
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
                  className="mt-3 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-dandori-blue hover:text-dandori-blue transition-colors w-full"
                >
                  + 支払条件を追加
                </button>
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

        {/* ステップ5: 確認・作成 */}
        {activeStep === 5 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">契約内容の確認</h2>

            <div className="border rounded-lg p-6 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">
                  {formData.contractType || '工事請負契約書'}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  契約番号: {formData.contractNo}
                </p>
              </div>

              <div className="space-y-6">
                {/* 契約当事者 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">甲（発注者）</p>
                    <p className="font-bold text-lg">{formData.clientName}</p>
                    {formData.clientCompany && (
                      <p className="text-sm">{formData.clientCompany}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.clientAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">乙（受注者）</p>
                    <p className="font-bold text-lg">
                      {formData.contractorCompany}
                    </p>
                    <p className="text-sm">
                      {formData.contractorRepresentative}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.contractorAddress}
                    </p>
                  </div>
                </div>

                {/* 工事内容 */}
                <div>
                  <h4 className="font-medium mb-2">工事内容</h4>
                  <div className="bg-gray-50 rounded p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">工事名称:</span>
                      <span className="font-medium">
                        {formData.projectName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">工事場所:</span>
                      <span className="font-medium">
                        {formData.projectLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">工期:</span>
                      <span className="font-medium">
                        {formData.startDate} 〜 {formData.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 契約金額 */}
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">契約金額</p>
                  <p className="text-4xl font-bold text-dandori-blue mt-2">
                    ¥{formData.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">（税込）</p>
                </div>

                {/* 支払条件 */}
                <div>
                  <h4 className="font-medium mb-2">支払条件</h4>
                  <div className="bg-gray-50 rounded p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">支払名</th>
                          <th className="text-right py-2">割合</th>
                          <th className="text-right py-2">金額</th>
                          <th className="text-left py-2 pl-4">条件</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.paymentSchedule.map((schedule) => (
                          <tr key={schedule.id} className="border-b">
                            <td className="py-2">{schedule.name}</td>
                            <td className="text-right py-2">
                              {schedule.percentage}%
                            </td>
                            <td className="text-right py-2">
                              ¥{schedule.amount.toLocaleString()}
                            </td>
                            <td className="py-2 pl-4">{schedule.condition}</td>
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← 前へ
              </button>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  PDF出力
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  電子署名を依頼
                </button>
                <button
                  onClick={() => {
                    alert('契約書を作成しました');
                    router.push('/contracts');
                  }}
                  className="px-4 py-2 bg-dandori-blue text-white rounded-lg hover:bg-dandori-blue-dark"
                >
                  契約書を作成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
