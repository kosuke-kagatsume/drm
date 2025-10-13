'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  FileText,
  Users,
  Zap,
  ChevronRight,
  Sparkles,
  Clock,
  UserCheck,
  Search,
  CheckCircle,
} from 'lucide-react';

// 初期選択の定義（顧客情報あり/なし）
const INITIAL_OPTIONS = [
  {
    id: 'with-customer',
    title: '顧客情報がある',
    subtitle: '既存顧客から選択して見積作成',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    description: '顧客情報を選択してから、詳細見積か資金計画書を作成',
    features: ['顧客履歴の確認', '過去の見積参照', '顧客に合わせた提案'],
  },
  {
    id: 'quick',
    title: 'クイック見積',
    subtitle: '顧客情報なしですぐに作成',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    description: '顧客情報をスキップして、すぐに見積作成を開始',
    features: ['すぐに作成開始', '後から顧客情報追加可能', 'テンプレート活用'],
  },
];

// 見積タイプの定義
const ESTIMATE_TYPES = [
  {
    id: 'detailed',
    title: '詳細見積',
    subtitle: 'Excel型で細かく積み上げ',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-500',
    description:
      '工事明細を詳細に作成。Tab/Enterキー操作、テンプレート呼び出し可能',
    features: [
      'マスター連携',
      'メーカー品番から自動計算',
      '住設機器・水回りの一括登録',
      'CSVインポート対応',
    ],
    route: '/estimates/editor-v3/new',
  },
  {
    id: 'financial',
    title: '資金計画書',
    subtitle: '新築住宅向けざっくり見積',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    description: '大項目での簡易見積。後から詳細化も可能',
    route: '/estimates/financial/new',
  },
];

// サンプル顧客データ
const SAMPLE_CUSTOMERS = [
  {
    id: '1',
    name: '田中太郎',
    company: '田中建設株式会社',
    email: 'tanaka@example.com',
    phone: '03-1234-5678',
    address: '東京都渋谷区...',
    projectCount: 3,
    totalAmount: 45000000,
    lastContact: '2024/03/10',
  },
  {
    id: '2',
    name: '山田花子',
    company: '山田商事株式会社',
    email: 'yamada@example.com',
    phone: '06-2345-6789',
    address: '大阪府大阪市...',
    projectCount: 5,
    totalAmount: 62000000,
    lastContact: '2024/03/12',
  },
  {
    id: '3',
    name: '佐藤次郎',
    company: '個人',
    email: 'sato@example.com',
    phone: '045-3456-7890',
    address: '神奈川県横浜市...',
    projectCount: 1,
    totalAmount: 12000000,
    lastContact: '2024/03/08',
  },
  {
    id: '4',
    name: '鈴木一郎',
    company: '鈴木工務店',
    email: 'suzuki@example.com',
    phone: '052-4567-8901',
    address: '愛知県名古屋市...',
    projectCount: 8,
    totalAmount: 98000000,
    lastContact: '2024/03/15',
  },
];

function EstimateCreateV2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'initial' | 'customer' | 'type'>('initial');
  const [hasCustomer, setHasCustomer] = useState<boolean | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // 顧客詳細ページから直接遷移してきた場合の処理
  useEffect(() => {
    const customerId = searchParams.get('customerId');
    const customerName = searchParams.get('customerName');
    const skipCustomerSelection = searchParams.get('skipCustomerSelection');

    if (skipCustomerSelection === 'true' && customerId) {
      // 顧客選択をスキップして、直接見積タイプ選択画面へ
      setSelectedCustomer(customerId);
      setSelectedCustomerName(customerName || '');
      setHasCustomer(true);
      setStep('type');
    }
  }, [searchParams]);

  const filteredCustomers = SAMPLE_CUSTOMERS.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.company.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  // 初期選択（顧客情報あり/なし）
  const handleInitialSelect = (optionId: string) => {
    if (optionId === 'with-customer') {
      setHasCustomer(true);
      setStep('customer');
    } else {
      setHasCustomer(false);
      setStep('type');
    }
  };

  // 顧客選択
  const handleCustomerSelect = (customerId: string) => {
    const customer = SAMPLE_CUSTOMERS.find((c) => c.id === customerId);
    setSelectedCustomer(customerId);
    setSelectedCustomerName(customer?.name || '');
    setStep('type');
  };

  // 見積タイプ選択
  const handleTypeSelect = (typeId: string) => {
    const type = ESTIMATE_TYPES.find((t) => t.id === typeId);
    if (type) {
      if (selectedCustomer) {
        // 顧客選択済みの場合: LocalStorage に顧客情報を保存してから遷移
        const customer = SAMPLE_CUSTOMERS.find(
          (c) => c.id === selectedCustomer,
        );

        // 顧客情報を一時的に LocalStorage に保存
        localStorage.setItem(
          'temp_customer_info',
          JSON.stringify({
            customerId: selectedCustomer,
            customerName: customer?.name || '',
            customer: customer,
          }),
        );

        console.log('[create-v2] 顧客情報を LocalStorage に保存:', {
          customerId: selectedCustomer,
          customerName: customer?.name,
        });

        const params = new URLSearchParams({
          customerId: selectedCustomer,
          customerName: customer?.name || '',
        });
        router.push(type.route + `?${params.toString()}`);
      } else {
        // クイック見積の場合
        router.push(type.route + `?quick=true`);
      }
    }
  };

  const handleBack = () => {
    if (step === 'customer') {
      setStep('initial');
      setHasCustomer(null);
      setSelectedCustomer('');
    } else if (step === 'type') {
      if (hasCustomer) {
        setStep('customer');
      } else {
        setStep('initial');
        setHasCustomer(null);
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 戻る
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  新規見積作成
                </h1>
                <p className="text-sm text-gray-600">
                  {step === 'initial'
                    ? 'ステップ 1: 作成方法を選択'
                    : step === 'customer'
                      ? 'ステップ 2: 顧客を選択'
                      : 'ステップ ' +
                        (hasCustomer ? '3' : '2') +
                        ': 見積タイプを選択' +
                        (selectedCustomerName
                          ? ` - ${selectedCustomerName}様`
                          : '')}
                </p>
              </div>
            </div>
            {/* ステップインジケーター */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'initial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                1
              </div>
              {hasCustomer !== false && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step === 'customer'
                        ? 'bg-blue-600 text-white'
                        : step === 'type' && hasCustomer
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    2
                  </div>
                </>
              )}
              {hasCustomer && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step === 'type'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    3
                  </div>
                </>
              )}
              {hasCustomer === false && step === 'type' && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-600 text-white">
                    2
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* 初期選択画面（顧客情報あり/なし） */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {INITIAL_OPTIONS.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInitialSelect(option.id)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className={`h-2 bg-gradient-to-r ${option.color}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}
                        >
                          <option.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {option.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="space-y-2">
                      {option.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* 顧客選択画面 */}
          {step === 'customer' && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              {/* 検索バー */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="顧客名または会社名で検索..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 新規顧客登録ボタン */}
              <div className="mb-6">
                <button
                  onClick={() => setShowNewCustomerForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">新規顧客を登録</span>
                </button>
              </div>

              {/* 顧客リスト */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCustomerSelect(customer.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {customer.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {customer.company}
                        </p>
                      </div>
                      <UserCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {customer.email}</p>
                      <p>📱 {customer.phone}</p>
                      <p>📍 {customer.address}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        案件数: {customer.projectCount}
                      </span>
                      <span className="text-gray-500">
                        総額: ¥{customer.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>最終連絡: {customer.lastContact}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">該当する顧客が見つかりません</p>
                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    新規顧客を登録する
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 見積タイプ選択画面 */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* 選択された顧客情報（顧客情報ありの場合） */}
              {hasCustomer && selectedCustomer && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      選択された顧客
                    </h3>
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  {(() => {
                    const customer = SAMPLE_CUSTOMERS.find(
                      (c) => c.id === selectedCustomer,
                    );
                    return customer ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">顧客名</p>
                          <p className="font-bold">{customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">会社名</p>
                          <p className="font-bold">{customer.company}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">過去の案件数</p>
                          <p className="font-bold">{customer.projectCount}件</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">累計取引額</p>
                          <p className="font-bold">
                            ¥{customer.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* クイック見積の場合の表示 */}
              {!hasCustomer && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <div>
                      <h3 className="font-bold text-orange-900">
                        クイック見積モード
                      </h3>
                      <p className="text-sm text-orange-700">
                        顧客情報なしで見積を作成します。後から顧客情報を追加できます。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 見積タイプ選択 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  見積タイプを選択
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ESTIMATE_TYPES.map((type) => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTypeSelect(type.id)}
                      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                    >
                      <div className={`h-2 bg-gradient-to-r ${type.color}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center`}
                            >
                              <type.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {type.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {type.subtitle}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-4">{type.description}</p>
                        {type.features && (
                          <div className="space-y-2">
                            {type.features.map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm"
                              >
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 新規顧客登録モーダル（簡易版） */}
      {showNewCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">新規顧客登録</h3>
            <p className="text-gray-600 mb-4">
              この機能は現在開発中です。既存の顧客を選択してください。
            </p>
            <button
              onClick={() => setShowNewCustomerForm(false)}
              className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Suspenseでラップしたメインコンポーネント
export default function EstimateCreateV2Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <EstimateCreateV2Content />
    </Suspense>
  );
}
