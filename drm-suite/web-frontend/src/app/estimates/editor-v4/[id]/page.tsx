'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  ArrowLeft,
  AlertCircle,
  Search,
  X,
  Package,
} from 'lucide-react';
import { logger } from '@/lib/logger';

// ==================== 型定義 ====================

interface EstimateItem {
  id: string;
  no: number;
  category: string;
  itemName: string;
  specification: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  remarks: string;
  // 原価管理
  costPrice?: number;
  costAmount?: number;
  grossProfit?: number;
  grossProfitRate?: number;
}

interface MasterItem {
  id: string;
  category: string;
  productType?: string;
  itemName: string;
  specification: string;
  unit: string;
  standardPrice: number;
  costPrice: number;
  maker?: string;
  tags?: string[];
}

interface EstimateData {
  id: string;
  title: string;
  customer: string;
  items: EstimateItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== 定数 ====================

// 大項目のカテゴリ定義
const CATEGORIES = [
  '仮設工事',
  '解体工事',
  '基礎工事',
  '木工事',
  '屋根工事',
  '外壁工事',
  '内装工事',
  '浴室工事',
  '電気工事',
  '給排水工事',
  'キッチン工事',
  '諸経費',
];

// 単位定義
const UNITS = [
  '式',
  'm',
  'm²',
  'm³',
  '個',
  '台',
  '箇所',
  '枚',
  '本',
  'セット',
  '一式',
];

// マスタアイテムデータ（サンプル30個）
const MASTER_ITEMS: MasterItem[] = [
  // 仮設工事
  {
    id: 'M001',
    category: '仮設工事',
    itemName: '枠組足場',
    specification: 'W900×H1700',
    unit: 'm²',
    standardPrice: 1500,
    costPrice: 900,
    maker: '関東鳶',
    tags: ['足場'],
  },
  {
    id: 'M002',
    category: '仮設工事',
    itemName: '養生シート',
    specification: 'メッシュシート 1.8×3.6m',
    unit: 'm²',
    standardPrice: 300,
    costPrice: 180,
    tags: ['養生'],
  },
  {
    id: 'M003',
    category: '仮設工事',
    itemName: '仮設トイレ',
    specification: '水洗式',
    unit: '月',
    standardPrice: 15000,
    costPrice: 9000,
    tags: ['トイレ'],
  },

  // 解体工事
  {
    id: 'M004',
    category: '解体工事',
    itemName: '内装解体',
    specification: '一般住宅',
    unit: 'm²',
    standardPrice: 2000,
    costPrice: 1200,
    tags: ['解体'],
  },
  {
    id: 'M005',
    category: '解体工事',
    itemName: '廃材処分',
    specification: '混合廃材',
    unit: 't',
    standardPrice: 15000,
    costPrice: 9000,
    tags: ['廃材'],
  },

  // 基礎工事
  {
    id: 'M006',
    category: '基礎工事',
    itemName: 'ベタ基礎',
    specification: 'コンクリート打設含む',
    unit: 'm²',
    standardPrice: 12000,
    costPrice: 7200,
    tags: ['基礎'],
  },
  {
    id: 'M007',
    category: '基礎工事',
    itemName: '鉄筋工事',
    specification: 'D13 @200',
    unit: 'm²',
    standardPrice: 3500,
    costPrice: 2100,
    tags: ['鉄筋'],
  },

  // 外壁工事
  {
    id: 'M008',
    category: '外壁工事',
    itemName: 'サイディング材',
    specification: '16mm ニチハ',
    unit: 'm²',
    standardPrice: 8000,
    costPrice: 4800,
    maker: 'ニチハ',
    tags: ['サイディング'],
  },
  {
    id: 'M009',
    category: '外壁工事',
    itemName: '防水シート',
    specification: 'タイベック',
    unit: 'm²',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['防水'],
  },
  {
    id: 'M010',
    category: '外壁工事',
    itemName: 'コーキング',
    specification: '変性シリコン',
    unit: 'm',
    standardPrice: 800,
    costPrice: 480,
    tags: ['コーキング'],
  },

  // 屋根工事
  {
    id: 'M011',
    category: '屋根工事',
    itemName: 'ガルバリウム鋼板',
    specification: '立平葺き 0.35mm',
    unit: 'm²',
    standardPrice: 6500,
    costPrice: 3900,
    tags: ['ガルバ'],
  },
  {
    id: 'M012',
    category: '屋根工事',
    itemName: 'ルーフィング',
    specification: 'アスファルトルーフィング940',
    unit: 'm²',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['ルーフィング'],
  },

  // 内装工事
  {
    id: 'M013',
    category: '内装工事',
    itemName: 'クロス貼り',
    specification: 'ビニルクロス 量産品',
    unit: 'm²',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['クロス'],
  },
  {
    id: 'M014',
    category: '内装工事',
    itemName: 'フローリング',
    specification: '複合フローリング 12mm',
    unit: 'm²',
    standardPrice: 5500,
    costPrice: 3300,
    tags: ['床'],
  },
  {
    id: 'M015',
    category: '内装工事',
    itemName: '石膏ボード',
    specification: '12.5mm 910×1820',
    unit: '枚',
    standardPrice: 800,
    costPrice: 480,
    tags: ['ボード'],
  },

  // 浴室工事
  {
    id: 'M016',
    category: '浴室工事',
    itemName: 'ユニットバス',
    specification: '1616サイズ 標準仕様',
    unit: 'セット',
    standardPrice: 450000,
    costPrice: 270000,
    maker: 'LIXIL',
    tags: ['ユニットバス'],
  },
  {
    id: 'M017',
    category: '浴室工事',
    itemName: '浴室暖房乾燥機',
    specification: '200V 2室換気',
    unit: '台',
    standardPrice: 120000,
    costPrice: 72000,
    maker: 'パナソニック',
    tags: ['暖房'],
  },

  // 給排水工事
  {
    id: 'M018',
    category: '給排水工事',
    itemName: 'トイレ',
    specification: 'ピュアレストQR タンク式',
    unit: 'セット',
    standardPrice: 85000,
    costPrice: 51000,
    maker: 'TOTO',
    tags: ['トイレ'],
  },
  {
    id: 'M019',
    category: '給排水工事',
    itemName: 'トイレ',
    specification: 'アラウーノ L150',
    unit: 'セット',
    standardPrice: 250000,
    costPrice: 150000,
    maker: 'パナソニック',
    tags: ['トイレ', 'タンクレス'],
  },
  {
    id: 'M020',
    category: '給排水工事',
    itemName: '洗面化粧台',
    specification: 'W750 ピアラ',
    unit: 'セット',
    standardPrice: 120000,
    costPrice: 72000,
    maker: 'LIXIL',
    tags: ['洗面台'],
  },
  {
    id: 'M021',
    category: '給排水工事',
    itemName: 'ガス給湯器',
    specification: '24号 オート',
    unit: '台',
    standardPrice: 120000,
    costPrice: 72000,
    maker: 'リンナイ',
    tags: ['給湯器'],
  },

  // 電気工事
  {
    id: 'M022',
    category: '電気工事',
    itemName: 'エアコン',
    specification: '6畳用 2.2kW',
    unit: '台',
    standardPrice: 80000,
    costPrice: 48000,
    maker: 'ダイキン',
    tags: ['エアコン'],
  },
  {
    id: 'M023',
    category: '電気工事',
    itemName: 'エアコン',
    specification: '12畳用 3.6kW',
    unit: '台',
    standardPrice: 150000,
    costPrice: 90000,
    maker: '三菱電機',
    tags: ['エアコン'],
  },
  {
    id: 'M024',
    category: '電気工事',
    itemName: 'LED照明',
    specification: 'ダウンライト 60W相当',
    unit: '個',
    standardPrice: 3500,
    costPrice: 2100,
    tags: ['照明'],
  },

  // キッチン工事
  {
    id: 'M025',
    category: 'キッチン工事',
    itemName: 'システムキッチン',
    specification: 'I型 W2550 標準仕様',
    unit: 'セット',
    standardPrice: 650000,
    costPrice: 390000,
    maker: 'LIXIL',
    tags: ['キッチン'],
  },
  {
    id: 'M026',
    category: 'キッチン工事',
    itemName: 'IHクッキングヒーター',
    specification: '3口 200V',
    unit: '台',
    standardPrice: 150000,
    costPrice: 90000,
    maker: 'パナソニック',
    tags: ['IH'],
  },
  {
    id: 'M027',
    category: 'キッチン工事',
    itemName: 'レンジフード',
    specification: 'W900 深型',
    unit: '台',
    standardPrice: 45000,
    costPrice: 27000,
    maker: 'パナソニック',
    tags: ['レンジフード'],
  },
  {
    id: 'M028',
    category: 'キッチン工事',
    itemName: '食器洗い乾燥機',
    specification: 'ビルトイン 45cm',
    unit: '台',
    standardPrice: 80000,
    costPrice: 48000,
    maker: 'パナソニック',
    tags: ['食洗機'],
  },

  // 木工事
  {
    id: 'M029',
    category: '木工事',
    itemName: '内部建具',
    specification: '片開きドア W800',
    unit: '箇所',
    standardPrice: 35000,
    costPrice: 21000,
    tags: ['ドア'],
  },
  {
    id: 'M030',
    category: '木工事',
    itemName: 'サッシ',
    specification: 'アルミ樹脂複合 W1650×H2000',
    unit: '箇所',
    standardPrice: 75000,
    costPrice: 45000,
    maker: 'YKK AP',
    tags: ['窓'],
  },
];

// ==================== ユーティリティ関数 ====================

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 金額を計算（数量 × 単価）
 */
function calculateAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

/**
 * 原価金額を計算（数量 × 原価単価）
 */
function calculateCostAmount(quantity: number, costPrice: number): number {
  return Math.round(quantity * costPrice);
}

/**
 * 粗利額を計算（販売額 - 原価額）
 */
function calculateGrossProfit(amount: number, costAmount: number): number {
  return amount - costAmount;
}

/**
 * 粗利率を計算（粗利額 / 販売額 × 100）
 */
function calculateGrossProfitRate(grossProfit: number, amount: number): number {
  if (amount === 0) return 0;
  return Math.round((grossProfit / amount) * 10000) / 100;
}

/**
 * 金額フォーマット（3桁カンマ区切り）
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(value);
}

// ==================== メインコンポーネント ====================

export default function EstimateEditorV4() {
  const router = useRouter();
  const params = useParams();
  const estimateId = params?.id as string;

  // State
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [title, setTitle] = useState('新規見積書');
  const [customer, setCustomer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // マスタ検索モーダル関連
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [selectedItemIdForMaster, setSelectedItemIdForMaster] = useState<
    string | null
  >(null);
  const [masterSearchQuery, setMasterSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // ==================== データ読み込み ====================

  useEffect(() => {
    loadEstimate();
  }, [estimateId]);

  const loadEstimate = async () => {
    try {
      setIsLoading(true);

      // 既存データの読み込み（ローカルストレージまたはAPI）
      const savedData = localStorage.getItem(`estimate-v4-${estimateId}`);

      if (savedData) {
        const data: EstimateData = JSON.parse(savedData);
        setTitle(data.title);
        setCustomer(data.customer);
        setItems(data.items);
        logger.estimate.info('V4: 見積データ読み込み完了', { id: estimateId });
      } else {
        // 新規作成の場合、サンプル行を追加
        setItems([createNewItem(1)]);
        logger.estimate.info('V4: 新規見積作成', { id: estimateId });
      }
    } catch (error) {
      logger.estimate.error('V4: データ読み込みエラー', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== アイテム操作 ====================

  /**
   * 新しいアイテムを作成
   */
  const createNewItem = (no: number): EstimateItem => {
    return {
      id: generateId(),
      no,
      category: CATEGORIES[0],
      itemName: '',
      specification: '',
      quantity: 1,
      unit: UNITS[0],
      unitPrice: 0,
      amount: 0,
      remarks: '',
    };
  };

  /**
   * 行を追加
   */
  const handleAddRow = useCallback(() => {
    const newNo = items.length + 1;
    const newItem = createNewItem(newNo);
    setItems([...items, newItem]);
    logger.estimate.debug('V4: 行追加', { no: newNo });
  }, [items]);

  /**
   * 行を削除
   */
  const handleDeleteRow = useCallback((id: string) => {
    setItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.id !== id);
      // No を振り直し
      return filtered.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    });
    logger.estimate.debug('V4: 行削除', { id });
  }, []);

  /**
   * 行を複製
   */
  const handleCopyRow = useCallback(
    (id: string) => {
      const targetItem = items.find((item) => item.id === id);
      if (!targetItem) return;

      const newItem: EstimateItem = {
        ...targetItem,
        id: generateId(),
        no: items.length + 1,
      };

      setItems([...items, newItem]);
      logger.estimate.debug('V4: 行複製', { id, newId: newItem.id });
    },
    [items],
  );

  /**
   * セルの値を更新
   */
  const handleCellChange = useCallback(
    (id: string, field: keyof EstimateItem, value: any) => {
      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.id !== id) return item;

          const updated = { ...item, [field]: value };

          // 数量、単価、原価が変更された場合、金額と粗利を再計算
          if (
            field === 'quantity' ||
            field === 'unitPrice' ||
            field === 'costPrice'
          ) {
            // 金額を計算
            updated.amount = calculateAmount(
              updated.quantity,
              updated.unitPrice,
            );

            // 原価金額を計算（原価が設定されている場合のみ）
            if (updated.costPrice !== undefined && updated.costPrice > 0) {
              updated.costAmount = calculateCostAmount(
                updated.quantity,
                updated.costPrice,
              );

              // 粗利額を計算
              updated.grossProfit = calculateGrossProfit(
                updated.amount,
                updated.costAmount,
              );

              // 粗利率を計算
              updated.grossProfitRate = calculateGrossProfitRate(
                updated.grossProfit,
                updated.amount,
              );
            }
          }

          return updated;
        });
      });
    },
    [],
  );

  // ==================== マスタ検索 ====================

  /**
   * マスタモーダルを開く
   */
  const handleOpenMasterModal = useCallback((itemId: string) => {
    setSelectedItemIdForMaster(itemId);
    setMasterSearchQuery('');
    setSelectedCategory('all');
    setIsMasterModalOpen(true);
    logger.estimate.debug('V4: マスタモーダルを開く', { itemId });
  }, []);

  /**
   * マスタモーダルを閉じる
   */
  const handleCloseMasterModal = useCallback(() => {
    setIsMasterModalOpen(false);
    setSelectedItemIdForMaster(null);
    setMasterSearchQuery('');
    setSelectedCategory('all');
  }, []);

  /**
   * マスタを選択して行に適用
   */
  const handleSelectMaster = useCallback(
    (master: MasterItem) => {
      if (!selectedItemIdForMaster) return;

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id !== selectedItemIdForMaster) return item;

          // マスタの値を行に反映
          const updated: EstimateItem = {
            ...item,
            category: master.category,
            itemName: master.itemName,
            specification: master.specification,
            unit: master.unit,
            unitPrice: master.standardPrice,
            costPrice: master.costPrice,
          };

          // 金額・原価・粗利を計算
          updated.amount = calculateAmount(updated.quantity, updated.unitPrice);
          updated.costAmount = calculateCostAmount(
            updated.quantity,
            updated.costPrice || 0,
          );
          updated.grossProfit = calculateGrossProfit(
            updated.amount,
            updated.costAmount || 0,
          );
          updated.grossProfitRate = calculateGrossProfitRate(
            updated.grossProfit || 0,
            updated.amount,
          );

          return updated;
        }),
      );

      logger.estimate.info('V4: マスタを適用', {
        itemId: selectedItemIdForMaster,
        masterId: master.id,
      });

      handleCloseMasterModal();
    },
    [selectedItemIdForMaster, handleCloseMasterModal],
  );

  /**
   * マスタをフィルタリング
   */
  const filteredMasters = MASTER_ITEMS.filter((master) => {
    // カテゴリフィルタ
    if (selectedCategory !== 'all' && master.category !== selectedCategory) {
      return false;
    }

    // 検索キーワードフィルタ
    if (masterSearchQuery) {
      const query = masterSearchQuery.toLowerCase();
      return (
        master.itemName.toLowerCase().includes(query) ||
        master.specification.toLowerCase().includes(query) ||
        master.maker?.toLowerCase().includes(query) ||
        master.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // ==================== 保存処理 ====================

  /**
   * 見積を保存
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      const estimateData: EstimateData = {
        id: estimateId,
        title,
        customer,
        items,
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ローカルストレージに保存
      localStorage.setItem(
        `estimate-v4-${estimateId}`,
        JSON.stringify(estimateData),
      );

      setSaveMessage('✅ 保存しました');
      logger.estimate.info('V4: 保存完了', {
        id: estimateId,
        itemCount: items.length,
      });

      // 3秒後にメッセージを消す
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      logger.estimate.error('V4: 保存エラー', error);
      setSaveMessage('❌ 保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== 合計金額計算 ====================

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // ==================== レンダリング ====================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 左側: 戻るボタン + タイトル */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/estimates')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="見積一覧に戻る"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none px-2 py-1 transition-colors"
                    placeholder="見積書タイトル"
                  />
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    V4 (Beta)
                  </span>
                </div>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="text-sm text-gray-600 border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-2 py-1 transition-colors"
                  placeholder="顧客名を入力"
                />
              </div>
            </div>

            {/* 右側: アクションボタン */}
            <div className="flex items-center space-x-3">
              {saveMessage && (
                <span className="text-sm font-medium text-gray-700 animate-fade-in">
                  {saveMessage}
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    isSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ツールバー */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>行を追加</span>
              </button>

              <div className="text-sm text-gray-600 ml-4">
                合計:{' '}
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500">行数: {items.length}</div>
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    カテゴリ
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    項目名
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    仕様
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    数量
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    単位
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    単価
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    金額
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    備考
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        項目がありません
                      </p>
                      <p className="text-sm">
                        「行を追加」ボタンから新しい項目を追加してください
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <EstimateRow
                      key={item.id}
                      item={item}
                      onCellChange={handleCellChange}
                      onDelete={handleDeleteRow}
                      onCopy={handleCopyRow}
                      onOpenMasterModal={handleOpenMasterModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 合計行 */}
        {items.length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow-sm p-6 mt-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                合計金額（税抜）
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* マスタ検索モーダル */}
      <MasterSearchModal
        isOpen={isMasterModalOpen}
        onClose={handleCloseMasterModal}
        onSelect={handleSelectMaster}
        searchQuery={masterSearchQuery}
        onSearchQueryChange={setMasterSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filteredMasters={filteredMasters}
      />
    </div>
  );
}

// ==================== 行コンポーネント ====================

interface EstimateRowProps {
  item: EstimateItem;
  onCellChange: (id: string, field: keyof EstimateItem, value: any) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onOpenMasterModal: (id: string) => void;
}

function EstimateRow({
  item,
  onCellChange,
  onDelete,
  onCopy,
  onOpenMasterModal,
}: EstimateRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* No */}
      <td className="px-3 py-2 text-sm text-gray-900 text-center">{item.no}</td>

      {/* カテゴリ */}
      <td className="px-3 py-2">
        <select
          value={item.category}
          onChange={(e) => onCellChange(item.id, 'category', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </td>

      {/* 項目名 */}
      <td className="px-3 py-2">
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={item.itemName}
            onChange={(e) => onCellChange(item.id, 'itemName', e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="項目名を入力"
          />
          <button
            onClick={() => onOpenMasterModal(item.id)}
            className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
            title="マスタから選択"
          >
            <Package className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </td>

      {/* 仕様 */}
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.specification}
          onChange={(e) =>
            onCellChange(item.id, 'specification', e.target.value)
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="仕様を入力"
        />
      </td>

      {/* 数量 */}
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            onCellChange(item.id, 'quantity', parseFloat(e.target.value) || 0)
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
      </td>

      {/* 単位 */}
      <td className="px-3 py-2">
        <select
          value={item.unit}
          onChange={(e) => onCellChange(item.id, 'unit', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </td>

      {/* 単価 */}
      <td className="px-3 py-2">
        <input
          type="number"
          value={item.unitPrice}
          onChange={(e) =>
            onCellChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
          }
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="1"
        />
      </td>

      {/* 金額（自動計算） */}
      <td className="px-3 py-2">
        <div className="text-sm font-semibold text-right text-gray-900">
          {formatCurrency(item.amount)}
        </div>
      </td>

      {/* 備考 */}
      <td className="px-3 py-2">
        <input
          type="text"
          value={item.remarks}
          onChange={(e) => onCellChange(item.id, 'remarks', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="備考"
        />
      </td>

      {/* 操作ボタン */}
      <td className="px-3 py-2">
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => onCopy(item.id)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="行を複製"
          >
            <Copy className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="行を削除"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ==================== マスタ検索モーダルコンポーネント ====================

interface MasterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (master: MasterItem) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  filteredMasters: MasterItem[];
}

function MasterSearchModal({
  isOpen,
  onClose,
  onSelect,
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onCategoryChange,
  filteredMasters,
}: MasterSearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">マスタ検索</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 検索バー & フィルター */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* 検索入力 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="項目名、仕様、メーカー、タグで検索..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>

          {/* カテゴリフィルター */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全て
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* マスタ一覧 */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredMasters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                該当するマスタが見つかりません
              </p>
              <p className="text-sm mt-2">検索条件を変更してください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredMasters.map((master) => (
                <button
                  key={master.id}
                  onClick={() => onSelect(master)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {master.category}
                        </span>
                        {master.maker && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {master.maker}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {master.itemName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {master.specification}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">単価:</span>
                          <span className="font-bold text-blue-600">
                            {formatCurrency(master.standardPrice)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">原価:</span>
                          <span className="font-semibold text-gray-700">
                            {formatCurrency(master.costPrice)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">粗利率:</span>
                          <span className="font-semibold text-green-600">
                            {calculateGrossProfitRate(
                              master.standardPrice - master.costPrice,
                              master.standardPrice,
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                      {master.tags && master.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {master.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredMasters.length}件のマスタが見つかりました
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
