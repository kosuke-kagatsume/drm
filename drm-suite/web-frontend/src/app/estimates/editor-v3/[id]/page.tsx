'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { flushSync } from 'react-dom';
import GlobalMasterAddModal from './GlobalMasterAddModal';
import SavedEstimatesModal from './SavedEstimatesModal';
import { useRouter, useSearchParams } from 'next/navigation';
import TemplateSelectModal from '@/components/estimates/TemplateSelectModal';
import VersionManager from '@/components/estimates/VersionManager';
import ApprovalWorkflowComponent from '@/components/estimates/ApprovalWorkflow';
import TemplateSelector from '@/components/pdf/TemplateSelector';
import { PdfTemplate } from '@/types/pdf-template';
import { PdfTemplateEngine } from '@/lib/pdf-engine';
import { EstimateVersion } from '@/features/estimate-versions/types';
import {
  ApprovalWorkflow as ApprovalWorkflowType,
  ApprovalAction,
} from '@/features/estimate-workflow/types';
import {
  calcRow,
  legacyToCore,
  coreToUi,
  getCoreKey,
  FEATURE_FLAGS,
  nanoid,
  normalizeNumber,
  LineRow,
  MasterItem as CoreMasterItem,
} from '@/features/estimate-core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Save,
  FileDown,
  Plus,
  Trash2,
  Copy,
  Search,
  Filter,
  Upload,
  Package,
  Undo,
  Redo,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  Grid3x3,
  GripVertical,
  MessageSquare,
  FolderOpen,
  GitBranch,
  Send,
  Eye,
  EyeOff,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  FileText,
} from 'lucide-react';

// === DEBUG HOOK (一時) ===============================
declare global {
  interface Window {
    __est?: {
      debug: boolean;
      [key: string]: unknown;
    };
  }
}
if (typeof window !== 'undefined') {
  window.__est ??= {};
  window.__est.debug = false; // デバッグモード フラグ
  window.__est.enableDebug = () => {
    window.__est.debug = true;
    console.log('[estimate] Debug mode enabled');
  };
  window.__est.disableDebug = () => {
    window.__est.debug = false;
    console.log('[estimate] Debug mode disabled');
  };
  window.__est.ping = () => console.log('[estimate] debug hook alive');
}
// =====================================================

// 型定義
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
  isCategory?: boolean;
  isSubtotal?: boolean;
  // 原価管理
  costPrice?: number; // 原価
  costAmount?: number; // 原価合計
  grossProfit?: number; // 粗利額
  grossProfitRate?: number; // 粗利率(%)
  costType?: 'master' | 'negotiated'; // 原価タイプ（マスタ/交渉）
  masterCostRate?: number; // マスタ掛率
}

interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: EstimateItem[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// 商品種別の型定義
interface ProductType {
  id: string;
  category: string;
  name: string;
  icon?: string;
}

// マスタアイテムの型定義
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

// サンプル顧客データ
const SAMPLE_CUSTOMERS = [
  {
    id: 'CUST-001',
    name: '田中太郎',
    company: '田中工務店',
    email: 'tanaka@example.com',
    phone: '03-1234-5678',
  },
  {
    id: 'CUST-002',
    name: '佐藤花子',
    company: '',
    email: 'sato@example.com',
    phone: '090-1234-5678',
  },
];

// 商品種別定義（63種類）
const PRODUCT_TYPES: ProductType[] = [
  // キッチン関連
  { id: 'kitchen_system', category: 'キッチン工事', name: 'システムキッチン' },
  { id: 'kitchen_ih', category: 'キッチン工事', name: 'IHクッキングヒーター' },
  { id: 'kitchen_hood', category: 'キッチン工事', name: 'レンジフード' },
  {
    id: 'kitchen_dishwasher',
    category: 'キッチン工事',
    name: '食器洗い乾燥機',
  },

  // 浴室関連
  { id: 'bathroom_unit', category: '浴室工事', name: 'ユニットバス' },
  { id: 'bathroom_heating', category: '浴室工事', name: '浴室暖房乾燥機' },

  // 給排水関連
  { id: 'toilet', category: '給排水工事', name: 'トイレ' },
  { id: 'washbasin', category: '給排水工事', name: '洗面化粧台' },
  { id: 'water_heater', category: '給排水工事', name: 'ガス給湯器' },
  { id: 'eco_cute', category: '給排水工事', name: 'エコキュート' },

  // 電気関連
  { id: 'air_conditioner', category: '電気工事', name: 'エアコン' },
  { id: 'ventilation', category: '電気工事', name: '換気システム' },

  // 建具関連
  { id: 'door', category: '木工事', name: 'ドア' },
  { id: 'window', category: '木工事', name: '窓' },

  // 仮設関連
  { id: 'scaffold', category: '仮設工事', name: '足場・養生' },
];

// マスタアイテムデータ（75項目）
const MASTER_ITEMS: MasterItem[] = [
  // 仮設工事
  {
    id: 'M001',
    category: '仮設工事',
    productType: 'scaffold',
    itemName: '枠組足場',
    specification: 'W900×H1700',
    unit: '㎡',
    standardPrice: 1500,
    costPrice: 900,
    maker: '関東鳶',
    tags: ['足場', 'わくぐみ'],
  },
  {
    id: 'M002',
    category: '仮設工事',
    itemName: '養生シート',
    specification: 'メッシュシート 1.8×3.6m',
    unit: '㎡',
    standardPrice: 300,
    costPrice: 180,
    tags: ['養生', 'シート'],
  },
  {
    id: 'M003',
    category: '仮設工事',
    itemName: '仮設トイレ',
    specification: '水洗式',
    unit: '月',
    standardPrice: 15000,
    costPrice: 9000,
    tags: ['トイレ', '仮設'],
  },
  {
    id: 'M004',
    category: '仮設工事',
    itemName: '仮設電気',
    specification: '20A引込',
    unit: '式',
    standardPrice: 25000,
    costPrice: 15000,
    tags: ['電気', '仮設'],
  },

  // 解体工事
  {
    id: 'M005',
    category: '解体工事',
    itemName: '内装解体',
    specification: '一般住宅',
    unit: '㎡',
    standardPrice: 2000,
    costPrice: 1200,
    tags: ['解体', '内装'],
  },
  {
    id: 'M006',
    category: '解体工事',
    itemName: '屋根瓦撤去',
    specification: '和瓦',
    unit: '㎡',
    standardPrice: 1800,
    costPrice: 1080,
    tags: ['瓦', '撤去', '解体'],
  },
  {
    id: 'M007',
    category: '解体工事',
    itemName: '廃材処分',
    specification: '混合廃材',
    unit: 't',
    standardPrice: 15000,
    costPrice: 9000,
    tags: ['廃材', '処分', 'ゴミ'],
  },

  // 基礎工事
  {
    id: 'M008',
    category: '基礎工事',
    itemName: 'ベタ基礎',
    specification: 'コンクリート打設含む',
    unit: '㎡',
    standardPrice: 12000,
    costPrice: 7200,
    tags: ['基礎', 'ベタ', 'コンクリート'],
  },
  {
    id: 'M009',
    category: '基礎工事',
    itemName: '鉄筋工事',
    specification: 'D13 @200',
    unit: '㎡',
    standardPrice: 3500,
    costPrice: 2100,
    tags: ['鉄筋', '配筋'],
  },
  {
    id: 'M010',
    category: '基礎工事',
    itemName: '基礎断熱',
    specification: 'スタイロフォーム50mm',
    unit: '㎡',
    standardPrice: 2800,
    costPrice: 1680,
    tags: ['断熱', '基礎'],
  },

  // 外壁工事
  {
    id: 'M011',
    category: '外壁工事',
    itemName: 'サイディング材',
    specification: '16mm ニチハ',
    unit: '㎡',
    standardPrice: 8000,
    costPrice: 4800,
    tags: ['サイディング', '外壁'],
  },
  {
    id: 'M012',
    category: '外壁工事',
    itemName: '防水シート',
    specification: 'タイベック',
    unit: '㎡',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['防水', 'シート', 'タイベック'],
  },
  {
    id: 'M013',
    category: '外壁工事',
    itemName: 'コーキング',
    specification: '変性シリコン',
    unit: 'm',
    standardPrice: 800,
    costPrice: 480,
    tags: ['コーキング', 'シーリング'],
  },
  {
    id: 'M014',
    category: '外壁工事',
    itemName: '軒天井',
    specification: 'ケイカル板6mm',
    unit: '㎡',
    standardPrice: 3200,
    costPrice: 1920,
    tags: ['軒天', '軒天井'],
  },

  // 屋根工事
  {
    id: 'M015',
    category: '屋根工事',
    itemName: 'ガルバリウム鋼板',
    specification: '立平葺き 0.35mm',
    unit: '㎡',
    standardPrice: 6500,
    costPrice: 3900,
    tags: ['ガルバ', '屋根', '鋼板'],
  },
  {
    id: 'M016',
    category: '屋根工事',
    itemName: 'ルーフィング',
    specification: 'アスファルトルーフィング940',
    unit: '㎡',
    standardPrice: 800,
    costPrice: 480,
    tags: ['ルーフィング', '防水'],
  },
  {
    id: 'M017',
    category: '屋根工事',
    itemName: '雨樋',
    specification: '角型 105mm',
    unit: 'm',
    standardPrice: 2500,
    costPrice: 1500,
    tags: ['雨樋', 'とい', '雨どい'],
  },

  // 内装工事
  {
    id: 'M018',
    category: '内装工事',
    itemName: 'クロス貼り',
    specification: 'ビニルクロス 量産品',
    unit: '㎡',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['クロス', '壁紙'],
  },
  {
    id: 'M019',
    category: '内装工事',
    itemName: 'フローリング',
    specification: '複合12mm',
    unit: '㎡',
    standardPrice: 5500,
    costPrice: 3300,
    tags: ['フローリング', '床'],
  },
  {
    id: 'M020',
    category: '内装工事',
    itemName: '建具',
    specification: '片開きドア',
    unit: '箇所',
    standardPrice: 35000,
    costPrice: 21000,
    tags: ['ドア', '建具'],
  },

  // 電気工事
  {
    id: 'M021',
    category: '電気工事',
    itemName: 'コンセント',
    specification: '2口 アース付',
    unit: '箇所',
    standardPrice: 3500,
    costPrice: 2100,
    tags: ['コンセント', '電気'],
  },
  {
    id: 'M022',
    category: '電気工事',
    itemName: 'スイッチ',
    specification: '片切',
    unit: '箇所',
    standardPrice: 2500,
    costPrice: 1500,
    tags: ['スイッチ', '電気'],
  },
  {
    id: 'M023',
    category: '電気工事',
    itemName: 'LED照明',
    specification: 'ダウンライト 6畳用',
    unit: '台',
    standardPrice: 8000,
    costPrice: 4800,
    tags: ['照明', 'LED', 'ライト'],
  },

  // キッチン工事（住設機器の主要品目）
  {
    id: 'M024',
    category: 'キッチン工事',
    productType: 'kitchen_system',
    itemName: 'システムキッチン',
    specification: 'I型2550 シエラS',
    unit: 'セット',
    standardPrice: 450000,
    costPrice: 270000,
    maker: 'LIXIL',
    tags: ['キッチン', 'リクシル', 'LIXIL'],
  },
  {
    id: 'M025',
    category: 'キッチン工事',
    productType: 'kitchen_system',
    itemName: 'システムキッチン',
    specification: 'L型2700×1800 ラクエラ',
    unit: 'セット',
    standardPrice: 580000,
    costPrice: 348000,
    maker: 'クリナップ',
    tags: ['キッチン', 'クリナップ'],
  },
  {
    id: 'M026',
    category: 'キッチン工事',
    productType: 'kitchen_system',
    itemName: 'システムキッチン',
    specification: 'ペニンシュラ型 ミッテ',
    unit: 'セット',
    standardPrice: 750000,
    costPrice: 450000,
    maker: 'TOTO',
    tags: ['キッチン', 'TOTO', 'トートー'],
  },
  {
    id: 'M027',
    category: 'キッチン工事',
    productType: 'kitchen_ih',
    itemName: 'IHクッキングヒーター',
    specification: '3口 KZ-W373S',
    unit: '台',
    standardPrice: 180000,
    costPrice: 108000,
    maker: 'パナソニック',
    tags: ['IH', 'コンロ', 'パナソニック'],
  },
  {
    id: 'M028',
    category: 'キッチン工事',
    productType: 'kitchen_hood',
    itemName: 'レンジフード',
    specification: '幅900 BDR-3HLS-901',
    unit: '台',
    standardPrice: 85000,
    costPrice: 51000,
    maker: '富士工業',
    tags: ['換気扇', 'レンジフード'],
  },
  {
    id: 'M029',
    category: 'キッチン工事',
    productType: 'kitchen_dishwasher',
    itemName: '食器洗い乾燥機',
    specification: 'ビルトイン NP-45MS9S',
    unit: '台',
    standardPrice: 120000,
    costPrice: 72000,
    maker: 'パナソニック',
    tags: ['食洗機', '食器洗い'],
  },

  // 浴室工事（住設機器の主要品目）
  {
    id: 'M030',
    category: '浴室工事',
    productType: 'bathroom_unit',
    itemName: 'ユニットバス',
    specification: '1616 アライズ',
    unit: 'セット',
    standardPrice: 650000,
    costPrice: 390000,
    maker: 'LIXIL',
    tags: ['風呂', 'バス', 'リクシル', 'LIXIL'],
  },
  {
    id: 'M031',
    category: '浴室工事',
    productType: 'bathroom_unit',
    itemName: 'ユニットバス',
    specification: '1616 サザナ',
    unit: 'セット',
    standardPrice: 680000,
    costPrice: 408000,
    maker: 'TOTO',
    tags: ['風呂', 'バス', 'TOTO', 'トートー'],
  },
  {
    id: 'M032',
    category: '浴室工事',
    productType: 'bathroom_unit',
    itemName: 'ユニットバス',
    specification: '1620 オフローラ',
    unit: 'セット',
    standardPrice: 750000,
    costPrice: 450000,
    maker: 'パナソニック',
    tags: ['風呂', 'バス', 'パナソニック'],
  },
  {
    id: 'M033',
    category: '浴室工事',
    itemName: '浴室暖房乾燥機',
    specification: '天井埋込型 3室換気',
    unit: '台',
    standardPrice: 95000,
    costPrice: 57000,
    tags: ['暖房', '乾燥機', '換気'],
  },
  {
    id: 'M034',
    category: '浴室工事',
    itemName: '浴室ドア',
    specification: '折戸 W800',
    unit: '箇所',
    standardPrice: 45000,
    costPrice: 27000,
    tags: ['ドア', '扉'],
  },

  // 給排水工事（トイレ等の住設機器）
  {
    id: 'M035',
    category: '給排水工事',
    productType: 'toilet',
    itemName: 'トイレ',
    specification: 'ピュアレストQR タンク式',
    unit: 'セット',
    standardPrice: 85000,
    costPrice: 51000,
    maker: 'TOTO',
    tags: ['トイレ', '便器', 'TOTO'],
  },
  {
    id: 'M036',
    category: '給排水工事',
    productType: 'toilet',
    itemName: 'トイレ',
    specification: 'アメージュZA タンクレス',
    unit: 'セット',
    standardPrice: 180000,
    costPrice: 108000,
    maker: 'LIXIL',
    tags: ['トイレ', '便器', 'LIXIL', 'タンクレス'],
  },
  {
    id: 'M037',
    category: '給排水工事',
    productType: 'toilet',
    itemName: 'トイレ',
    specification: 'アラウーノ L150',
    unit: 'セット',
    standardPrice: 250000,
    costPrice: 150000,
    maker: 'パナソニック',
    tags: ['トイレ', '便器', 'パナソニック', 'アラウーノ'],
  },
  {
    id: 'M038',
    category: '給排水工事',
    productType: 'washbasin',
    itemName: '洗面化粧台',
    specification: 'W750 ピアラ',
    unit: 'セット',
    standardPrice: 120000,
    costPrice: 72000,
    maker: 'LIXIL',
    tags: ['洗面台', '洗面', 'LIXIL'],
  },
  {
    id: 'M039',
    category: '給排水工事',
    productType: 'washbasin',
    itemName: '洗面化粧台',
    specification: 'W900 サクア',
    unit: 'セット',
    standardPrice: 150000,
    costPrice: 90000,
    maker: 'TOTO',
    tags: ['洗面台', '洗面', 'TOTO'],
  },
  {
    id: 'M040',
    category: '給排水工事',
    productType: 'water_heater',
    itemName: 'ガス給湯器',
    specification: '24号 RUF-A2405SAW',
    unit: '台',
    standardPrice: 120000,
    costPrice: 72000,
    maker: 'リンナイ',
    tags: ['給湯器', 'ガス'],
  },
  {
    id: 'M041',
    category: '給排水工事',
    productType: 'water_heater',
    itemName: 'ガス給湯器',
    specification: '24号 GT-2460SAWX',
    unit: '台',
    standardPrice: 125000,
    costPrice: 75000,
    maker: 'ノーリツ',
    tags: ['給湯器', 'ガス'],
  },
  {
    id: 'M042',
    category: '給排水工事',
    productType: 'eco_cute',
    itemName: 'エコキュート',
    specification: '460L SRT-W464',
    unit: '台',
    standardPrice: 450000,
    costPrice: 270000,
    maker: '三菱電機',
    tags: ['給湯器', 'エコキュート', '三菱'],
  },
  {
    id: 'M043',
    category: '給排水工事',
    productType: 'eco_cute',
    itemName: 'エコキュート',
    specification: '370L EQX37VFTV',
    unit: '台',
    standardPrice: 420000,
    costPrice: 252000,
    maker: 'ダイキン',
    tags: ['給湯器', 'エコキュート', 'ダイキン'],
  },
  {
    id: 'M044',
    category: '給排水工事',
    productType: 'eco_cute',
    itemName: 'エコキュート',
    specification: '550L HE-J55JZS',
    unit: '台',
    standardPrice: 580000,
    costPrice: 348000,
    maker: 'パナソニック',
    tags: ['給湯器', 'エコキュート', 'パナソニック', '床暖房'],
  },
  {
    id: 'M045',
    category: '給排水工事',
    itemName: '水栓金具',
    specification: 'キッチン用シングルレバー',
    unit: '箇所',
    standardPrice: 25000,
    costPrice: 15000,
    tags: ['水栓', '蛇口'],
  },
  {
    id: 'M046',
    category: '給排水工事',
    itemName: '水栓金具',
    specification: '洗面用シングルレバー',
    unit: '箇所',
    standardPrice: 18000,
    costPrice: 10800,
    tags: ['水栓', '蛇口', '洗面'],
  },

  // 木工事（建具・造作材）
  {
    id: 'M047',
    category: '木工事',
    itemName: '玄関ドア',
    specification: 'LIXIL ジエスタ2 K2仕様',
    unit: '箇所',
    standardPrice: 280000,
    costPrice: 168000,
    tags: ['玄関', 'ドア', 'LIXIL'],
  },
  {
    id: 'M048',
    category: '木工事',
    itemName: '玄関ドア',
    specification: 'YKK AP ヴェナート D30',
    unit: '箇所',
    standardPrice: 320000,
    costPrice: 192000,
    tags: ['玄関', 'ドア', 'YKK'],
  },
  {
    id: 'M049',
    category: '木工事',
    itemName: '室内ドア',
    specification: 'LIXIL ラシッサ 片開き',
    unit: '箇所',
    standardPrice: 45000,
    costPrice: 27000,
    tags: ['ドア', '室内', '建具'],
  },
  {
    id: 'M050',
    category: '木工事',
    itemName: '引戸',
    specification: 'LIXIL ラシッサ 上吊り',
    unit: '箇所',
    standardPrice: 65000,
    costPrice: 39000,
    tags: ['引戸', '室内', '建具'],
  },
  {
    id: 'M051',
    category: '木工事',
    itemName: 'クローゼット扉',
    specification: '折戸 W1800',
    unit: '箇所',
    standardPrice: 55000,
    costPrice: 33000,
    tags: ['クローゼット', '収納', '扉'],
  },
  {
    id: 'M052',
    category: '木工事',
    itemName: '窓',
    specification: 'YKK AP APW330 引違い W1690×H1170',
    unit: '箇所',
    standardPrice: 68000,
    costPrice: 40800,
    tags: ['窓', 'サッシ', 'YKK'],
  },
  {
    id: 'M053',
    category: '木工事',
    itemName: '窓',
    specification: 'LIXIL サーモスX FIX窓 W730×H970',
    unit: '箇所',
    standardPrice: 45000,
    costPrice: 27000,
    tags: ['窓', 'サッシ', 'LIXIL', 'FIX'],
  },
  {
    id: 'M054',
    category: '木工事',
    itemName: '窓',
    specification: 'トリプルガラス 樹脂サッシ W1650×H1370',
    unit: '箇所',
    standardPrice: 120000,
    costPrice: 72000,
    tags: ['窓', 'サッシ', 'トリプルガラス'],
  },
  {
    id: 'M055',
    category: '木工事',
    itemName: 'シャッター',
    specification: '電動シャッター W1800',
    unit: '箇所',
    standardPrice: 180000,
    costPrice: 108000,
    tags: ['シャッター', '電動'],
  },

  // 電気工事（エアコン等）
  {
    id: 'M056',
    category: '電気工事',
    productType: 'air_conditioner',
    itemName: 'エアコン',
    specification: '6畳用 2.2kW S22ZTES',
    unit: '台',
    standardPrice: 85000,
    costPrice: 51000,
    maker: 'ダイキン',
    tags: ['エアコン', '空調', 'ダイキン'],
  },
  {
    id: 'M057',
    category: '電気工事',
    productType: 'air_conditioner',
    itemName: 'エアコン',
    specification: '10畳用 2.8kW MSZ-ZW2822',
    unit: '台',
    standardPrice: 120000,
    costPrice: 72000,
    maker: '三菱電機',
    tags: ['エアコン', '空調', '三菱'],
  },
  {
    id: 'M058',
    category: '電気工事',
    productType: 'air_conditioner',
    itemName: 'エアコン',
    specification: '14畳用 4.0kW CS-X402D2',
    unit: '台',
    standardPrice: 150000,
    costPrice: 90000,
    maker: 'パナソニック',
    tags: ['エアコン', '空調', 'パナソニック'],
  },
  {
    id: 'M059',
    category: '電気工事',
    productType: 'air_conditioner',
    itemName: 'エアコン',
    specification: '20畳用 6.3kW RAS-X63M2',
    unit: '台',
    standardPrice: 220000,
    costPrice: 132000,
    maker: '日立',
    tags: ['エアコン', '空調', '日立', 'リビング'],
  },
  {
    id: 'M060',
    category: '電気工事',
    itemName: '換気扇',
    specification: '24時間換気システム',
    unit: '式',
    standardPrice: 85000,
    costPrice: 51000,
    tags: ['換気', '24時間'],
  },
  {
    id: 'M061',
    category: '電気工事',
    itemName: '分電盤',
    specification: '住宅用 20回路',
    unit: '面',
    standardPrice: 65000,
    costPrice: 39000,
    tags: ['分電盤', 'ブレーカー'],
  },
  {
    id: 'M062',
    category: '電気工事',
    itemName: '太陽光発電',
    specification: '5.5kW パナソニック',
    unit: '式',
    standardPrice: 1200000,
    costPrice: 720000,
    tags: ['太陽光', 'ソーラー', 'パナソニック'],
  },
  {
    id: 'M063',
    category: '電気工事',
    itemName: '蓄電池',
    specification: '7.4kWh テスラ パワーウォール',
    unit: '台',
    standardPrice: 980000,
    costPrice: 588000,
    tags: ['蓄電池', 'バッテリー', 'テスラ'],
  },
  {
    id: 'M064',
    category: '電気工事',
    itemName: 'インターホン',
    specification: 'カラーモニター付 パナソニック',
    unit: 'セット',
    standardPrice: 45000,
    costPrice: 27000,
    tags: ['インターホン', 'ドアホン'],
  },

  // 内装工事（床暖房等）
  {
    id: 'M065',
    category: '内装工事',
    itemName: '床暖房',
    specification: '電気式 8畳',
    unit: '式',
    standardPrice: 280000,
    costPrice: 168000,
    tags: ['床暖房', '暖房'],
  },
  {
    id: 'M066',
    category: '内装工事',
    itemName: '床暖房',
    specification: '温水式 12畳',
    unit: '式',
    standardPrice: 380000,
    costPrice: 228000,
    tags: ['床暖房', '暖房', '温水'],
  },
  {
    id: 'M067',
    category: '内装工事',
    itemName: 'カーテンレール',
    specification: 'W2000 ダブル',
    unit: '箇所',
    standardPrice: 12000,
    costPrice: 7200,
    tags: ['カーテン', 'レール'],
  },
  {
    id: 'M068',
    category: '内装工事',
    itemName: 'ブラインド',
    specification: 'アルミ W1800×H1800',
    unit: '箇所',
    standardPrice: 25000,
    costPrice: 15000,
    tags: ['ブラインド'],
  },
  {
    id: 'M069',
    category: '内装工事',
    itemName: 'ロールスクリーン',
    specification: 'W1800×H2000',
    unit: '箇所',
    standardPrice: 35000,
    costPrice: 21000,
    tags: ['ロールスクリーン'],
  },
  {
    id: 'M070',
    category: '内装工事',
    itemName: '造作棚',
    specification: 'W900×D300 集成材',
    unit: '箇所',
    standardPrice: 45000,
    costPrice: 27000,
    tags: ['棚', '造作', '収納'],
  },

  // 諸経費
  {
    id: 'M071',
    category: '諸経費',
    itemName: '現場管理費',
    specification: '工事費の8%',
    unit: '式',
    standardPrice: 0,
    costPrice: 0,
    tags: ['管理費', '諸経費'],
  },
  {
    id: 'M072',
    category: '諸経費',
    itemName: '一般管理費',
    specification: '工事費の10%',
    unit: '式',
    standardPrice: 0,
    costPrice: 0,
    tags: ['管理費', '諸経費'],
  },
  {
    id: 'M073',
    category: '諸経費',
    itemName: '産業廃棄物処理費',
    specification: '4tトラック',
    unit: '台',
    standardPrice: 50000,
    costPrice: 30000,
    tags: ['廃棄物', '処分'],
  },
  {
    id: 'M074',
    category: '諸経費',
    itemName: '運搬費',
    specification: '4tトラック',
    unit: '台',
    standardPrice: 30000,
    costPrice: 18000,
    tags: ['運搬', 'トラック'],
  },
  {
    id: 'M075',
    category: '諸経費',
    itemName: '養生費',
    specification: '床・壁養生一式',
    unit: '式',
    standardPrice: 25000,
    costPrice: 15000,
    tags: ['養生'],
  },
];

function EstimateEditorV3Content({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Phase 10: URLパラメータから顧客情報を取得
  const customerId =
    searchParams?.get('customerId') || searchParams?.get('customer'); // 後方互換性
  const customerName = searchParams?.get('customerName');
  const isQuickEstimate = searchParams?.get('quick') === 'true';

  const customerInfo = customerId
    ? SAMPLE_CUSTOMERS.find((c) => c.id === customerId)
    : null;

  const [items, setItems] = useState<EstimateItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    row: string;
    col: string;
  } | null>(null);
  const [history, setHistory] = useState<EstimateItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved',
  );
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'customer' | 'internal'>('internal'); // 表示モード（顧客用/社内用）
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateMode, setTemplateMode] = useState<'load' | 'save'>('load');
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] =
    useState('外壁・屋根工事');
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<
    Set<string>
  >(new Set());

  // PDF テンプレート関連の状態
  const [showPdfTemplateSelector, setShowPdfTemplateSelector] = useState(false);
  const [selectedPdfTemplate, setSelectedPdfTemplate] =
    useState<PdfTemplate | null>(null);

  // 見積有効期限の状態管理
  const [validUntil, setValidUntil] = useState<string>(() => {
    // デフォルトは30日後
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [showValidUntilEditor, setShowValidUntilEditor] = useState(false);

  // 新機能用のステート
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
  const [estimateVersions, setEstimateVersions] = useState<EstimateVersion[]>(
    [],
  );
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  const [approvalWorkflow, setApprovalWorkflow] =
    useState<ApprovalWorkflowType | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<EstimateTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [masterSearchTerm, setMasterSearchTerm] = useState('');
  const [masterSearchRow, setMasterSearchRow] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [masterSearchPosition, setMasterSearchPosition] = useState({
    x: 0,
    y: 0,
  });
  const [searchStep, setSearchStep] = useState<
    'productType' | 'maker' | 'products'
  >('productType');
  const [selectedProductType, setSelectedProductType] = useState<string | null>(
    null,
  );
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [showGlobalMasterModal, setShowGlobalMasterModal] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  // モーダル用のref（外側クリック検知用）
  const panelRef = useRef<HTMLDivElement>(null);
  const ignoreOutsideRef = useRef(false);

  // masterSearchRowの最新値を保持するref（stale closure対策）
  const rowRef = useRef<string | null>(null);
  useEffect(() => {
    rowRef.current = masterSearchRow ?? null;
  }, [masterSearchRow]);

  // マスタデータが存在するカテゴリ
  const categoriesWithMaster = [
    'キッチン工事',
    '浴室工事',
    '給排水工事',
    '電気工事',
    '内装工事',
    '建具工事',
    '外壁工事',
    '屋根工事',
    '設備工事',
  ];
  // 掛率調整用の新しい状態
  const [showCostRateModal, setShowCostRateModal] = useState(false);

  // 保存済み見積モーダル用の状態
  const [showSavedEstimatesModal, setShowSavedEstimatesModal] = useState(false);
  const [costRateModalRow, setCostRateModalRow] = useState<string | null>(null);
  const [tempCostRate, setTempCostRate] = useState<number>(1.0);
  // インポート機能の状態
  const [showImportModal, setShowImportModal] = useState(false);
  // コメント機能の状態
  const [showComments, setShowComments] = useState(false);
  const [generalComment, setGeneralComment] = useState('');

  // カラム定義（表示モードによって切り替え）
  const allColumns = [
    { key: 'no', label: 'NO.', width: '50px', type: 'number' },
    { key: 'itemName', label: '項目名', width: '180px', type: 'text' },
    { key: 'specification', label: '仕様・規格', width: '200px', type: 'text' },
    { key: 'quantity', label: '数量', width: '60px', type: 'number' },
    { key: 'unit', label: '単位', width: '60px', type: 'text' },
    { key: 'unitPrice', label: '売価単価', width: '100px', type: 'number' },
    {
      key: 'amount',
      label: '売価金額',
      width: '100px',
      type: 'number',
      readonly: true,
    },
    {
      key: 'costPrice',
      label: '原価単価',
      width: '100px',
      type: 'number',
      className: 'bg-amber-50',
      internal: true,
    },
    {
      key: 'costAmount',
      label: '原価金額',
      width: '100px',
      type: 'number',
      readonly: true,
      className: 'bg-amber-50',
      internal: true,
    },
    {
      key: 'grossProfit',
      label: '粗利額',
      width: '100px',
      type: 'number',
      readonly: true,
      className: 'bg-green-50',
      internal: true,
    },
    {
      key: 'grossProfitRate',
      label: '粗利率',
      width: '70px',
      type: 'number',
      readonly: true,
      className: 'bg-green-50',
      internal: true,
    },
    { key: 'remarks', label: '備考', width: '120px', type: 'text' },
  ];

  // 表示モードに応じてカラムをフィルタリング
  const columns =
    viewMode === 'internal'
      ? allColumns
      : allColumns.filter((col) => !('internal' in col && col.internal));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 初期化
  useEffect(() => {
    // URLパラメータをチェック（新規作成か編集か）
    const isNewEstimate =
      params.id === 'new' ||
      params.id === 'create' ||
      params.id.startsWith('new-');

    if (isNewEstimate) {
      // 新規作成モード - 空の状態から開始
      console.log('新規見積作成モード');
      const initialItems: EstimateItem[] = [];
      setItems(initialItems);
      setHistory([initialItems]);
      setShowCategorySelector(true); // 大項目選択を表示
    } else {
      // 既存見積の編集モード
      console.log(`見積編集モード: ID=${params.id}`);
      const savedEstimate = localStorage.getItem(`estimate_${params.id}`);

      if (savedEstimate) {
        try {
          // 保存済みデータがある場合
          const estimateData = JSON.parse(savedEstimate);
          console.log('保存済みデータを読み込み:', estimateData);
          const loadedItems = estimateData.items || [];
          setItems(loadedItems);
          setHistory([loadedItems]);
          setShowCategorySelector(false);

          // その他のデータも復元
          if (estimateData.validUntil) {
            setValidUntil(estimateData.validUntil);
          }
          if (estimateData.customerName && customerInfo) {
            // 顧客情報の整合性チェック
            console.log(`顧客: ${estimateData.customerName}`);
          }
        } catch (error) {
          console.error('保存データの読み込みエラー:', error);
          // エラー時は空の編集モードで開始
          setItems([]);
          setHistory([[]]);
          setShowCategorySelector(true);
        }
      } else {
        // 保存済みデータがない場合は空の編集モードで開始
        console.log('保存済みデータなし - 空の編集モード');
        const initialItems: EstimateItem[] = [];
        setItems(initialItems);
        setHistory([initialItems]);
        setShowCategorySelector(true); // データがないので大項目選択を表示
      }
    }

    loadTemplates();
  }, [params.id]);

  // テンプレート読み込み
  const loadTemplates = () => {
    const savedTemplates = JSON.parse(
      localStorage.getItem('estimate_templates') || '[]',
    );
    setTemplates(savedTemplates);
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl+Z: 元に戻す
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y: やり直し
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  // 自動保存機能（データ変更から3秒後に自動保存）
  useEffect(() => {
    console.log('[自動保存] useEffect実行、saveStatus =', saveStatus);

    if (saveStatus !== 'unsaved') {
      console.log('[自動保存] saveStatusが未保存ではないのでスキップ');
      return;
    }

    console.log('[自動保存] ⏱️ タイマー開始（3秒後に保存）');
    const timer = setTimeout(() => {
      console.log('[自動保存] ✅ 3秒経過、自動保存を実行します');
      handleSave();
    }, 3000); // 3秒後に自動保存

    return () => {
      console.log(
        '[自動保存] 🧹 タイマークリア（saveStatusが変わった or アンマウント）',
      );
      clearTimeout(timer);
    };
  }, [saveStatus]); // saveStatusが変わるたびにタイマーリセット

  // ブラウザ離脱防止（タブを閉じる時・リロード時の警告）
  useEffect(() => {
    console.log('[離脱防止] useEffect実行、saveStatus =', saveStatus);

    if (saveStatus !== 'unsaved') {
      console.log(
        '[離脱防止] saveStatusが未保存ではないのでイベント登録しない',
      );
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log(
        '[離脱防止] ⚠️ beforeunloadイベント発火！ユーザーがタブを閉じようとしています',
      );
      e.preventDefault();
      // Chrome では returnValue を設定する必要がある
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    console.log(
      '[離脱防止] ✅ beforeunloadイベント登録完了（未保存の変更あり）',
    );

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      console.log('[離脱防止] 🧹 beforeunloadイベント解除');
    };
  }, [saveStatus]);

  // ブラウザバック対策（戻るボタン押下時の警告）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[バック対策] useEffect実行、saveStatus =', saveStatus);

    const handlePopState = () => {
      console.log(
        '[バック対策] ⬅️ popstateイベント発火！ユーザーが戻るボタンを押しました',
      );
      console.log('[バック対策] 現在のsaveStatus =', saveStatus);

      if (saveStatus === 'unsaved') {
        console.log('[バック対策] ⚠️ 未保存の変更あり、確認ダイアログを表示');
        const confirmLeave = window.confirm(
          '保存されていない変更があります。本当にページを離れますか？',
        );

        if (!confirmLeave) {
          // ユーザーがキャンセルした場合、現在のページに留まる
          window.history.pushState(null, '', window.location.href);
          console.log(
            '[バック対策] ✅ ユーザーがキャンセル、ページ遷移をキャンセル',
          );
        } else {
          console.log('[バック対策] ❌ ユーザーが承認、ページ遷移を許可');
        }
      } else {
        console.log('[バック対策] ✅ 保存済みなので警告なし');
      }
    };

    // 現在のURLをhistoryスタックに追加（バック時の検知用）
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    console.log('[バック対策] ✅ popstateイベント登録完了');

    return () => {
      window.removeEventListener('popstate', handlePopState);
      console.log('[バック対策] 🧹 popstateイベント解除');
    };
  }, [saveStatus]);

  // モーダルの外側クリック処理（一時的に無効化して原因切り分け）
  // useEffect(() => {
  //   if (!showMasterSearch) return;

  //   const onDocPointerDown = (ev: PointerEvent) => {
  //     if (ignoreOutsideRef.current) {      // 選択直後は閉じない
  //       ignoreOutsideRef.current = false;
  //       return;
  //     }
  //     const t = ev.target as Node;
  //     if (panelRef.current && !panelRef.current.contains(t)) {
  //       setShowMasterSearch(false);        // 既存のクローズ処理
  //       setSearchStep('productType');
  //       setSelectedCategory(null);
  //       setSelectedProductType(null);
  //       setSelectedMaker(null);
  //       setMasterSearchTerm('');
  //     }
  //   };

  //   document.addEventListener('pointerdown', onDocPointerDown, true); // capture
  //   return () => document.removeEventListener('pointerdown', onDocPointerDown, true);
  // }, [showMasterSearch]);

  // セル変更ハンドラー（0削除問題の修正）
  const handleCellChange = (rowId: string, colKey: string, value: string) => {
    // 旧UIを完全に無効化
    const ENABLE_LEGACY_NAMECELL_MASTER_PICKER =
      FEATURE_FLAGS.ENABLE_LEGACY_NAMECELL_MASTER_PICKER;

    // 項目名入力時にマスタ検索を開く（旧UI - 無効化）
    if (
      ENABLE_LEGACY_NAMECELL_MASTER_PICKER &&
      colKey === 'itemName' &&
      value.length > 0
    ) {
      setMasterSearchTerm(value);
      setMasterSearchRow(rowId);
      setShowMasterSearch(true);

      // 入力フィールドの位置を取得（簡易的に設定）
      const inputElement = document.querySelector(
        `[data-row="${rowId}"][data-col="${colKey}"]`,
      );
      if (inputElement) {
        const rect = inputElement.getBoundingClientRect();
        setMasterSearchPosition({ x: rect.left, y: rect.bottom });
      }
    }

    // 既存行を取得
    const legacyRow = items.find((item) => item.id === rowId);
    if (!legacyRow) return;

    // カテゴリ行や小計行は編集不可
    if (legacyRow.isCategory || legacyRow.isSubtotal) return;

    // 値を正規化（数値フィールドの場合）
    let normalizedValue: string | number | boolean = value;
    if (
      [
        'quantity',
        'qty',
        'unitPrice',
        'sellUnitPrice',
        'costPrice',
        'costUnitPrice',
      ].includes(colKey)
    ) {
      normalizedValue = normalizeNumber(value);
    }

    // UIキーから正規キーに変換
    const coreKey = getCoreKey(colKey);

    // 両方のキーで更新（互換性のため）
    const patch = withBothKeys({
      [colKey]: normalizedValue,
      [coreKey]: normalizedValue,
    });

    // 既存データとマージ
    const mergedData = { ...legacyRow, ...patch };

    // レガシー → コア変換
    const coreRow = legacyToCore(mergedData);

    // 再計算（純関数）
    const recalcedCore = calcRow(coreRow);

    // コア → UI変換し、両方のキーを持つようにする
    const uiRow = coreToUi(recalcedCore);
    const updatedUiRow = withBothKeys({ ...mergedData, ...uiRow });

    // 1行更新
    const newItems = items.map((item) =>
      item.id === rowId ? updatedUiRow : item,
    );

    // 小計/合計の再計算
    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSaveStatus('unsaved');
    console.log('[handleCellChange] saveStatus を unsaved に変更');
    addToHistory(updatedItems);

    // デバッグログ
    if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
      if (typeof window !== 'undefined' && window.__est?.debug)
        console.log('[handleCellChange]', {
          rowId,
          uiKey: colKey,
          coreKey,
          value: normalizedValue,
          recalcedCore: {
            sellAmount: recalcedCore.sellAmount,
            costAmount: recalcedCore.costAmount,
            grossProfit: recalcedCore.grossProfit,
            grossProfitRate: recalcedCore.grossProfitRate,
          },
        });
    }
  };

  // カテゴリ小計の更新
  const updateCategorySubtotals = (items: EstimateItem[]) => {
    const updatedItems = [...items];
    CATEGORIES.forEach((category) => {
      const categoryItems = items.filter(
        (item) =>
          item.category === category && !item.isCategory && !item.isSubtotal,
      );
      const subtotal = categoryItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const subtotalIndex = items.findIndex(
        (item) => item.isSubtotal && item.category === category,
      );
      if (subtotalIndex !== -1) {
        updatedItems[subtotalIndex].amount = subtotal;
      }
    });
    return updatedItems;
  };

  // rowIdをセットしてマスタ選択を開く
  const openRowMasterSelector = (rowId: string) => {
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[openRowMasterSelector] Setting activeRowId:', rowId);
    setActiveRowId(rowId); // props で直渡しするために保持
    setMasterSearchRow(rowId); // 後方互換のため残す
    setShowMasterSearch(true);
  };

  // 安全にRowIdを確保するヘルパー
  const ensureRowIdForMaster = (categoryHint?: string) => {
    // 既存の選択行を最優先
    const existing = rowRef.current ?? masterSearchRow ?? null;
    if (existing) return existing;

    // 行が無い場合はカテゴリに1行追加してIDを使う
    const fallbackCategory =
      categoryHint ??
      (Array.isArray(categoriesWithMaster) && categoriesWithMaster.length > 0
        ? categoriesWithMaster[0]
        : 'キッチン工事'); // 最低限のフォールバック

    const newId = addRow(fallbackCategory);
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[ensureRowIdForMaster] created row', {
        fallbackCategory,
        newId,
      });
    return newId;
  };

  // === マスタ選択の単一路線 ===
  const routeMasterSelect = (master: MasterItem, categoryHint?: string) => {
    const rowId = ensureRowIdForMaster(categoryHint);
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[routeMasterSelect]', {
        rowId,
        categoryHint,
        masterId: master?.id,
      });
    selectMasterItem(master, rowId); // ← ここに一本化
  };

  // カテゴリを追加
  const addCategory = (category: string): string | null => {
    // すでにカテゴリが存在する場合はそのIDを返す
    const existingCategory = items.find(
      (item) => item.isCategory && item.category === category,
    );
    if (existingCategory) {
      return existingCategory.id;
    }

    const newItems = [...items];
    const categoryId = `cat-${category}-${Date.now()}`;

    // カテゴリヘッダー
    newItems.push({
      id: categoryId,
      no: 0,
      category,
      itemName: category,
      specification: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      amount: 0,
      remarks: '',
      isCategory: true,
    });

    // 小計行
    newItems.push({
      id: `sub-${category}-${Date.now()}`,
      no: 0,
      category,
      itemName: `${category} 小計`,
      specification: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      amount: 0,
      remarks: '',
      isSubtotal: true,
    });

    setItems(newItems);
    setSaveStatus('unsaved');
    addToHistory(newItems);

    return categoryId;
  };

  // 正規キーとUIキーの両方を持つオブジェクトを作成するヘルパー
  const withBothKeys = (data: EstimateItem) => {
    const result: EstimateItem & Record<string, unknown> = { ...data };

    // 正規キー → UIキーのマッピング
    const mappings = {
      name: 'itemName',
      spec: 'specification',
      qty: 'quantity',
      unit: 'unit',
      sellUnitPrice: 'unitPrice',
      costUnitPrice: 'costPrice',
      sellAmount: 'amount',
      costAmount: 'costAmount',
      grossProfit: 'grossProfit',
      grossProfitRate: 'grossProfitRate',
      remarks: 'remarks',
    };

    // 正規キーが存在する場合、UIキーも設定
    Object.entries(mappings).forEach(([coreKey, uiKey]) => {
      if (coreKey in result && !(uiKey in result)) {
        result[uiKey] = result[coreKey];
      }
      // UIキーが存在する場合、正規キーも設定
      else if (uiKey in result && !(coreKey in result)) {
        result[coreKey] = result[uiKey];
      }
    });

    return result;
  };

  // 行を更新
  const updateRow = (
    lineId: string,
    patch: Partial<EstimateItem> & Record<string, unknown>,
  ) => {
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[updateRow] IN', lineId, patch);

    setItems((prev: EstimateItem[]) => {
      // 1) ID一致行を withBothKeys でマージ
      const merged = prev.map((it: EstimateItem) =>
        it.id === lineId ? withBothKeys({ ...it, ...patch }) : it,
      );

      // 2) 行ごと再計算（カテゴリ/小計はスキップ）
      const recalced = merged.map((it: EstimateItem) => {
        if (it.isCategory || it.isSubtotal) return it;
        try {
          const core = legacyToCore(it);
          const r = calcRow(core);
          const ui = coreToUi(r);
          return withBothKeys({ ...it, ...ui });
        } catch {
          // コア未結線でも落ちないフォールバック
          const qty = Number(it.qty ?? it.quantity ?? 0);
          const sp = Number(it.sellUnitPrice ?? it.unitPrice ?? 0);
          const cp = Number(it.costUnitPrice ?? it.costPrice ?? 0);
          const amount = Math.round(qty * sp);
          const costAmount = Math.round(qty * cp);
          const grossProfit = amount - costAmount;
          const grossProfitRate =
            amount > 0 ? Math.round((grossProfit / amount) * 100) : 0;
          return withBothKeys({
            ...it,
            sellAmount: amount,
            amount,
            costAmount,
            grossProfit,
            grossProfitRate,
          });
        }
      });

      // 3) カテゴリ小計の更新（関数が返すならその値、内部更新ならそのまま）
      let after = recalced;
      try {
        if (typeof updateCategorySubtotals === 'function') {
          const ret = updateCategorySubtotals(recalced);
          if (ret) after = ret;
        }
      } catch (e) {
        console.warn('[updateRow] updateCategorySubtotals error', e);
      }

      if (typeof window !== 'undefined' && window.__est?.debug)
        console.log(
          '[updateRow] OUT',
          lineId,
          after.find((x: EstimateItem) => x.id === lineId),
        );

      // 履歴に追加（更新後のitemsを使用）
      addToHistory(after);
      return after;
    });

    // 保存状態を未保存にする
    setSaveStatus('unsaved');
    console.log('[updateRow] saveStatus を unsaved に変更');
  };

  // 行追加
  const addRow = (category: string): string => {
    const categoryIndex = items.findIndex(
      (item) => item.isSubtotal && item.category === category,
    );
    if (categoryIndex === -1) return '';

    const newRowId = nanoid(); // nanoidを使用
    const newRow: EstimateItem = {
      id: newRowId,
      no: items.filter((i) => !i.isCategory && !i.isSubtotal).length + 1,
      category,
      itemName: '',
      specification: '',
      quantity: 0,
      unit: '式',
      unitPrice: 0,
      amount: 0,
      remarks: '',
      visible: true, // 追加
    };

    const newItems = [...items];
    newItems.splice(categoryIndex, 0, newRow);

    let itemNo = 1;
    newItems.forEach((item) => {
      if (!item.isCategory && !item.isSubtotal) {
        item.no = itemNo++;
      }
    });

    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSaveStatus('unsaved');
    addToHistory(updatedItems);

    return newRowId; // 新しい行のIDを返す
  };

  // 行削除
  const deleteSelectedRows = () => {
    if (selectedRows.size === 0) return;

    const newItems = items.filter((item) => !selectedRows.has(item.id));
    let itemNo = 1;
    newItems.forEach((item) => {
      if (!item.isCategory && !item.isSubtotal) {
        item.no = itemNo++;
      }
    });

    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSelectedRows(new Set());
    setSaveStatus('unsaved');
    addToHistory(updatedItems);
  };

  // ドラッグ&ドロップ（カテゴリ移動時は小項目も一緒に移動）
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const draggedItem = items.find((item) => item.id === active.id);
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      let newItems = [...items];

      // カテゴリヘッダーをドラッグした場合は、そのカテゴリの全ての項目を一緒に移動
      if (draggedItem?.isCategory) {
        const categoryName = draggedItem.category;

        // そのカテゴリに属する全ての項目（カテゴリヘッダー、通常項目、小計行）を取得
        const categoryItemIds: string[] = [];
        let startCollecting = false;

        items.forEach((item) => {
          if (item.isCategory && item.category === categoryName) {
            startCollecting = true;
            categoryItemIds.push(item.id);
          } else if (startCollecting) {
            if (item.category === categoryName) {
              categoryItemIds.push(item.id);
              // 小計行で終了
              if (item.isSubtotal) {
                startCollecting = false;
              }
            } else {
              startCollecting = false;
            }
          }
        });

        // カテゴリ全体を移動
        const categoryItems = items.filter((item) =>
          categoryItemIds.includes(item.id),
        );
        const otherItems = items.filter(
          (item) => !categoryItemIds.includes(item.id),
        );

        // 挿入位置を計算
        let insertIndex = newIndex;
        if (newIndex > oldIndex) {
          // 後ろに移動する場合は、カテゴリアイテム数分調整
          insertIndex = newIndex - categoryItems.length + 1;
        }

        // 新しい配列を構築
        newItems = [
          ...otherItems.slice(0, insertIndex),
          ...categoryItems,
          ...otherItems.slice(insertIndex),
        ];
      } else {
        // 通常の項目の場合は従来通り
        newItems = arrayMove(items, oldIndex, newIndex);
      }

      // 番号の振り直し
      let itemNo = 1;
      newItems.forEach((item) => {
        if (!item.isCategory && !item.isSubtotal) {
          item.no = itemNo++;
        }
      });

      const updatedItems = updateCategorySubtotals(newItems);
      setItems(updatedItems);
      setSaveStatus('unsaved');
      addToHistory(updatedItems);
    }
  };

  // 保存
  const handleSave = async () => {
    setSaveStatus('saving');

    // LocalStorageに保存
    const estimateData = {
      id: params.id,
      items,
      customer: customerInfo,
      customerId: customerId || customerInfo?.id, // Phase 10: 顧客ID
      customerName: customerName || customerInfo?.name, // Phase 10: 顧客名
      validUntil, // 有効期限を追加
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`estimate_${params.id}`, JSON.stringify(estimateData));

    // 疑似的な遅延
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSaveStatus('saved');
    console.log('Saved successfully with validUntil:', validUntil);
    console.log('Customer ID:', customerId, 'Customer Name:', customerName); // Phase 10: デバッグログ
  };

  // 新しいマルチテナントPDF生成機能
  const handleGeneratePDF = () => {
    // PDFテンプレートセレクターを表示
    setShowPdfTemplateSelector(true);
  };

  // PDF テンプレート選択時の処理
  const handlePdfTemplateSelect = async (template: PdfTemplate) => {
    try {
      setShowPdfTemplateSelector(false);

      // 見積データを準備
      const estimateData = {
        title: '建設工事見積書',
        documentNumber: params.id,
        date: new Date().toISOString(),
        validUntil,
        companyId: 'company_1', // 実際にはユーザー認証から取得
        customer: customerInfo
          ? {
              name: customerInfo.name,
              address: customerInfo.address || '',
              phone: customerInfo.phone || '',
              email: customerInfo.email || '',
              contactPerson: customerInfo.contactPerson || '',
            }
          : null,
        items: items
          .filter((item) => !item.isCategory && !item.isSubtotal)
          .map((item) => ({
            name: item.name || '',
            specification: item.specification || '',
            quantity: item.quantity || 0,
            unit: item.unit || '',
            unitPrice: item.unitPrice || 0,
            amount: item.amount || 0,
          })),
        totals: {
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.amount,
        },
        terms: [
          '工期：別途協議により決定',
          '支払条件：請求書発行後30日以内',
          `有効期限：${new Date(validUntil).toLocaleDateString('ja-JP')}まで`,
          '備考：材料費の変動により金額が変更になる場合があります',
        ],
      };

      // PDF生成リクエスト
      const response = await PdfTemplateEngine.generateFromTemplate({
        templateId: template.id,
        documentType: 'estimate',
        data: estimateData,
        options: {
          filename: `estimate_${params.id}_${Date.now()}.pdf`,
          downloadImmediately: true,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'PDF生成に失敗しました');
      }

      console.log('PDF生成完了:', response);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert(
        'PDF生成中にエラーが発生しました: ' +
          (error instanceof Error ? error.message : '不明なエラー'),
      );
    }
  };

  // 保存済み見積を読み込む
  const handleLoadSavedEstimate = (estimate: any) => {
    // LocalStorageから実際の見積データを読み込む
    const storedData = localStorage.getItem(`estimate_${estimate.id}`);

    if (storedData) {
      // 保存されている詳細データがある場合
      const estimateData = JSON.parse(storedData);
      setItems(estimateData.items || []);
      if (estimateData.validUntil) {
        setValidUntil(estimateData.validUntil);
      }
      addToHistory(estimateData.items || []);
    } else {
      // 詳細データがない場合は、サンプルデータを作成
      const sampleItems: EstimateItem[] = [];

      // カテゴリヘッダーを追加
      sampleItems.push({
        id: nanoid(),
        name: 'キッチン工事',
        isCategory: true,
        quantity: 0,
        unit: '',
        unitPrice: 0,
        amount: 0,
      });

      // サンプル明細行を追加
      sampleItems.push({
        id: nanoid(),
        category: 'キッチン工事',
        name: 'システムキッチン',
        specification: 'TOTO ミッテ I型2550',
        quantity: 1,
        unit: 'セット',
        unitPrice: 850000,
        amount: 850000,
        costPrice: 595000,
        grossProfitRate: 30,
        isSelected: false,
      });

      sampleItems.push({
        id: nanoid(),
        category: 'キッチン工事',
        name: 'IHクッキングヒーター',
        specification: '日立 HT-M300XTWF',
        quantity: 1,
        unit: '台',
        unitPrice: 120000,
        amount: 120000,
        costPrice: 84000,
        grossProfitRate: 30,
        isSelected: false,
      });

      // キッチン工事小計
      sampleItems.push({
        id: nanoid(),
        name: 'キッチン工事 小計',
        isSubtotal: true,
        quantity: 0,
        unit: '',
        unitPrice: 0,
        amount: 0,
        category: 'キッチン工事',
      });

      // 金額を再計算
      const updatedItems = updateCategorySubtotals(sampleItems);
      setItems(updatedItems);
      addToHistory(updatedItems);
    }

    setSaveStatus('unsaved');
    setShowSavedEstimatesModal(false);
    setShowCategorySelector(false); // 保存済みデータ読み込み時はカテゴリ選択を非表示

    // 通知
    alert(`見積書「${estimate.title}」を読み込みました`);
  };

  // 履歴管理
  const addToHistory = (newItems: EstimateItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newItems);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setItems(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setItems(history[historyIndex + 1]);
    }
  };

  // 合計計算
  const calculateTotal = () => {
    const normalItems = items.filter(
      (item) => !item.isCategory && !item.isSubtotal,
    );
    return {
      amount: normalItems.reduce((sum, item) => sum + (item.amount || 0), 0),
      costAmount: normalItems.reduce(
        (sum, item) => sum + (item.costAmount || 0),
        0,
      ),
      grossProfit: normalItems.reduce(
        (sum, item) => sum + (item.grossProfit || 0),
        0,
      ),
    };
  };

  const totals = calculateTotal();
  const totalGrossProfitRate =
    totals.amount > 0
      ? Math.round((totals.grossProfit / totals.amount) * 100)
      : 0;

  // テンプレート保存
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    const template: EstimateTemplate = {
      id: `TMPL-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim(),
      category: newTemplateCategory,
      items: items.filter((item) => !item.isCategory && !item.isSubtotal), // 通常項目のみ保存
      isDefault: false,
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );

    // フォームリセット
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('外壁・屋根工事');
    setShowTemplateModal(false);

    alert('テンプレートを保存しました！');
  };

  // テンプレートプレビュー表示
  const handlePreviewTemplate = (template: EstimateTemplate) => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
    setSelectedTemplateItems(new Set()); // 選択状態をリセット
  };

  // 選択したアイテムをコピー
  const handleCopySelectedItems = () => {
    if (!previewTemplate || selectedTemplateItems.size === 0) return;

    const itemsToCopy = previewTemplate.items.filter((item) =>
      selectedTemplateItems.has(item.id),
    );

    // 既存のアイテムに追加
    const newItems = [...items];

    // カテゴリごとに整理
    const categories = [...new Set(itemsToCopy.map((item) => item.category))];

    categories.forEach((category) => {
      // カテゴリが存在しない場合は追加
      if (
        !newItems.some((item) => item.isCategory && item.category === category)
      ) {
        // カテゴリヘッダー
        newItems.push({
          id: `cat-${category}-${Date.now()}`,
          no: 0,
          category,
          itemName: category,
          specification: '',
          quantity: 0,
          unit: '',
          unitPrice: 0,
          amount: 0,
          remarks: '',
          isCategory: true,
        });

        // 小計行
        newItems.push({
          id: `sub-${category}-${Date.now()}`,
          no: 0,
          category,
          itemName: `${category} 小計`,
          specification: '',
          quantity: 0,
          unit: '',
          unitPrice: 0,
          amount: 0,
          remarks: '',
          isSubtotal: true,
        });
      }

      // 該当カテゴリの小計行を探す
      const subtotalIndex = newItems.findIndex(
        (item) => item.isSubtotal && item.category === category,
      );

      // アイテムを小計の前に挿入
      const categoryItemsToCopy = itemsToCopy.filter(
        (item) => item.category === category,
      );
      categoryItemsToCopy.forEach((item, index) => {
        const newItem = {
          ...item,
          id: `${item.id}-${Date.now()}-${index}`,
        };
        if (subtotalIndex !== -1) {
          newItems.splice(subtotalIndex, 0, newItem);
        } else {
          newItems.push(newItem);
        }
      });
    });

    // 番号の振り直し
    let itemNo = 1;
    newItems.forEach((item) => {
      if (!item.isCategory && !item.isSubtotal) {
        item.no = itemNo++;
      }
    });

    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSaveStatus('unsaved');
    addToHistory(updatedItems);
    setShowTemplatePreview(false);
    setShowTemplateModal(false);
  };

  // テンプレート全体を読み込み
  const handleLoadTemplate = (template: EstimateTemplate) => {
    const templateItems: EstimateItem[] = [];

    // カテゴリごとにグループ化
    const categories = [
      ...new Set(template.items.map((item) => item.category)),
    ];

    categories.forEach((category) => {
      // カテゴリヘッダー
      templateItems.push({
        id: `cat-${category}-${Date.now()}`,
        no: 0,
        category,
        itemName: category,
        specification: '',
        quantity: 0,
        unit: '',
        unitPrice: 0,
        amount: 0,
        remarks: '',
        isCategory: true,
      });

      // そのカテゴリの項目
      const categoryItems = template.items.filter(
        (item) => item.category === category,
      );
      categoryItems.forEach((item, index) => {
        templateItems.push({
          ...item,
          id: `${item.id}-${Date.now()}-${index}`, // 重複回避
        });
      });

      // 小計行
      templateItems.push({
        id: `sub-${category}-${Date.now()}`,
        no: 0,
        category,
        itemName: `${category} 小計`,
        specification: '',
        quantity: 0,
        unit: '',
        unitPrice: 0,
        amount: 0,
        remarks: '',
        isSubtotal: true,
      });
    });

    const updatedItems = updateCategorySubtotals(templateItems);
    setItems(updatedItems);
    setSaveStatus('unsaved');
    addToHistory(updatedItems);
    setShowTemplateModal(false);
    setShowCategorySelector(false);

    // 使用回数を増やす
    const updatedTemplates = templates.map((t) =>
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t,
    );
    setTemplates(updatedTemplates);
    localStorage.setItem(
      'estimate_templates',
      JSON.stringify(updatedTemplates),
    );
  };

  // テンプレート削除
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      const updatedTemplates = templates.filter((t) => t.id !== templateId);
      setTemplates(updatedTemplates);
      localStorage.setItem(
        'estimate_templates',
        JSON.stringify(updatedTemplates),
      );
    }
  };

  // テンプレートカテゴリ
  const templateCategories = [
    '外壁・屋根工事',
    '内装工事',
    '水回り工事',
    '電気工事',
    'エクステリア工事',
    'リフォーム工事',
    'その他',
  ];

  // マスタアイテムを選択して自動入力（rowIdを直接受け取る）
  const selectMasterItem = (master: MasterItem, rowId?: string) => {
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[selectMasterItem] start', { rowId, masterId: master?.id });
    if (!rowId) {
      console.error('[selectMasterItem] missing rowId');
      return; // 行ID無しは親で ensureRowIdForMaster を通す前提にする
    }

    // payload（coreキー＋UIキー両方）
    const payload = {
      // 正規キー
      name: master.itemName,
      spec: master.specification || '',
      unit: master.unit || '式',
      qty: 1,
      sellUnitPrice: normalizeNumber(master.standardPrice),
      costUnitPrice: normalizeNumber(master.costPrice),
      visible: true,
      masterItemId: master.id,

      // UIキー
      itemName: master.itemName,
      specification: master.specification || '',
      quantity: 1,
      qty: 1, // コアキーも設定
      unitPrice: normalizeNumber(master.standardPrice),
      costPrice: normalizeNumber(master.costPrice),
    };

    // 再計算→UI変換
    const coreLine = calcRow(legacyToCore({ id: rowId, ...payload }));
    const uiPatch = coreToUi(coreLine);

    // 両キーで最終パッチ
    const finalPatch = withBothKeys({ ...payload, ...uiPatch });

    // 反映
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[selectMasterItem] updateRow', rowId, finalPatch);
    updateRow(rowId, finalPatch);
    if (typeof window !== 'undefined' && window.__est?.debug)
      console.log('[selectMasterItem] done', rowId);
  };

  // 掛率調整機能
  const handleShowCostRateModal = (rowId: string) => {
    const item = items.find((i) => i.id === rowId);
    if (item && item.costType === 'master') {
      setCostRateModalRow(rowId);
      setTempCostRate(item.masterCostRate || 1.0);
      setShowCostRateModal(true);
    }
  };

  const handleApplyCostRate = () => {
    if (!costRateModalRow) return;

    const newItems = items.map((item) => {
      if (item.id === costRateModalRow && item.costType === 'master') {
        const originalCostPrice =
          item.costPrice && item.masterCostRate
            ? item.costPrice / item.masterCostRate
            : item.costPrice || 0;

        const newCostPrice = originalCostPrice * tempCostRate;
        const qty = parseFloat(item.quantity as any) || 0;

        return {
          ...item,
          masterCostRate: tempCostRate,
          costPrice: newCostPrice,
          costAmount: qty * newCostPrice,
          grossProfit: item.amount - qty * newCostPrice,
          grossProfitRate:
            item.amount > 0
              ? Math.round(
                  ((item.amount - qty * newCostPrice) / item.amount) * 100,
                )
              : 0,
        };
      }
      return item;
    });

    const updatedItems = updateCategorySubtotals(newItems);
    setItems(updatedItems);
    setSaveStatus('unsaved');
    setShowCostRateModal(false);
    setCostRateModalRow(null);
  };

  // 階層検索のフィルタリング
  const getFilteredProductTypes = () => {
    if (!selectedCategory) return [];

    // 選択されたカテゴリに対応する商品種別のみ表示
    const categoryMapping: { [key: string]: string[] } = {
      キッチン工事: [
        'kitchen_system',
        'kitchen_ih',
        'kitchen_hood',
        'kitchen_dishwasher',
      ],
      浴室工事: ['bathroom_unit'],
      給排水工事: ['toilet', 'washbasin', 'water_heater', 'eco_cute'],
      電気工事: ['air_conditioner'],
      内装工事: ['door', 'window'],
      建具工事: ['door', 'window'],
      外壁工事: ['exterior_wall'],
      屋根工事: ['roof'],
      設備工事: ['equipment'],
    };

    const allowedTypes = categoryMapping[selectedCategory];
    return allowedTypes
      ? PRODUCT_TYPES.filter((pt) => allowedTypes.includes(pt.id))
      : [];
  };

  const getFilteredMasterItems = () => {
    if (searchStep === 'productType') return [];

    if (!selectedProductType || !masterSearchRow) return [];

    const currentItem = items.find((i) => i.id === masterSearchRow);
    const itemCategory = currentItem?.category || '';

    return MASTER_ITEMS.filter((master) => {
      // カテゴリと商品種別が一致するもの
      if (master.category !== itemCategory) return false;
      if (master.productType !== selectedProductType) return false;

      // 検索語でフィルタリング
      if (masterSearchTerm) {
        const searchLower = masterSearchTerm.toLowerCase();
        return (
          master.itemName.toLowerCase().includes(searchLower) ||
          master.specification.toLowerCase().includes(searchLower) ||
          master.maker?.toLowerCase().includes(searchLower) ||
          master.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  };

  // 3段階フローのフィルタリング
  const availableMakers = selectedProductType
    ? [
        ...new Set(
          MASTER_ITEMS.filter(
            (item) => item.productType === selectedProductType,
          )
            .map((item) => item.maker)
            .filter(Boolean),
        ),
      ].sort()
    : [];

  const filteredMasterItems =
    selectedProductType && selectedMaker
      ? MASTER_ITEMS.filter(
          (item) =>
            item.productType === selectedProductType &&
            item.maker === selectedMaker &&
            (masterSearchTerm === '' ||
              item.itemName
                .toLowerCase()
                .includes(masterSearchTerm.toLowerCase()) ||
              item.specification
                .toLowerCase()
                .includes(masterSearchTerm.toLowerCase())),
        ).sort((a, b) => a.itemName.localeCompare(b.itemName))
      : [];

  // メーカー選択後は常に商品一覧を表示
  const shouldShowProducts = selectedProductType && selectedMaker;

  // フィルタリングされたテンプレート
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      template.description
        .toLowerCase()
        .includes(templateSearchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  詳細見積編集 Pro
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">見積番号: {params.id}</p>
                  {customerInfo && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-900">
                        {customerInfo.name}
                      </span>
                      {customerInfo.company && (
                        <span className="text-xs text-blue-700">
                          ({customerInfo.company})
                        </span>
                      )}
                    </div>
                  )}

                  {/* 見積有効期限 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">有効期限:</span>
                    {!showValidUntilEditor ? (
                      <button
                        onClick={() => setShowValidUntilEditor(true)}
                        className="px-3 py-1 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors"
                        title="クリックして編集"
                      >
                        <span className="text-sm font-medium text-yellow-900">
                          {new Date(validUntil).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={validUntil}
                          onChange={(e) => setValidUntil(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => setShowValidUntilEditor(false)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="保存"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // 30日後にリセット
                            const date = new Date();
                            date.setDate(date.getDate() + 30);
                            setValidUntil(date.toISOString().split('T')[0]);
                            setShowValidUntilEditor(false);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="キャンセル"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-2">
              {/* 保存状態インジケーター */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">保存済み</span>
                  </>
                )}
                {saveStatus === 'saving' && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </motion.div>
                    <span className="text-yellow-600">保存中...</span>
                  </>
                )}
                {saveStatus === 'unsaved' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">未保存</span>
                  </>
                )}
              </div>

              {/* 履歴操作 */}
              <div className="flex items-center">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 bg-gray-100 text-gray-700 rounded-l-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="元に戻す (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 bg-gray-100 text-gray-700 rounded-r-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-300"
                  title="やり直し (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* 保存・ファイル管理グループ */}
              <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  disabled={saveStatus === 'saving'}
                >
                  <Save className="w-3.5 h-3.5" />
                  保存
                </button>

                <button
                  onClick={() => setShowSavedEstimatesModal(true)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  開く
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  インポート
                </button>

                <button
                  onClick={handleGeneratePDF}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="PDF出力"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>

              {/* セパレーター */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* テンプレートグループ */}
              <button
                onClick={() => setShowNewTemplateModal(true)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs"
              >
                <Package className="w-3.5 h-3.5" />
                テンプレート
              </button>

              {/* セパレーター */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* 表示モード切り替え */}
              <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('internal')}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    viewMode === 'internal'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  社内
                </button>
                <button
                  onClick={() => setViewMode('customer')}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    viewMode === 'customer'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  顧客
                </button>
              </div>

              {/* セパレーター */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* ワークフロー管理グループ */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowComments(true)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="コメント"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowVersionManager(!showVersionManager)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showVersionManager
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="バージョン管理"
                >
                  <GitBranch className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowApprovalWorkflow(!showApprovalWorkflow)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showApprovalWorkflow
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="承認申請"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* カテゴリ選択モード - 新規作成時のみ表示 */}
        {showCategorySelector && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">大項目を選択してください</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    addCategory(category);
                    setShowCategorySelector(false);
                  }}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-left"
                >
                  <div className="font-medium text-blue-900">{category}</div>
                </motion.button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setTemplateMode('load');
                  setShowTemplateModal(true);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                またはテンプレートから読み込む
              </button>
            </div>
          </motion.div>
        )}

        {/* 見積表 */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* ツールバー */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={deleteSelectedRows}
                    disabled={selectedRows.size === 0}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除 ({selectedRows.size})
                  </button>

                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
                    <Copy className="w-4 h-4" />
                    コピー
                  </button>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="項目を検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCategorySelector(true)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    大項目追加
                  </button>
                  <button
                    data-testid="add-from-master"
                    onClick={() => {
                      const targetRowId =
                        rowRef.current /* 直近の行を覚えている場合 */ ??
                        masterSearchRow /* state に保持している場合 */ ??
                        null;

                      setSearchStep('productType'); // 初期ステップ
                      setMasterSearchRow(targetRowId); // 選択対象行（nullでもOK）
                      setShowGlobalMasterModal(true); // モーダルを開く
                      if (typeof window !== 'undefined' && window.__est?.debug)
                        console.log('[ui] open master modal', { targetRowId });
                    }}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Package className="w-4 h-4" />
                    マスタから項目追加
                  </button>
                </div>
              </div>
            </div>

            {/* テーブル */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="w-8 px-2 py-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.size ===
                              items.filter((i) => !i.isCategory).length &&
                            items.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(
                                new Set(
                                  items
                                    .filter((i) => !i.isCategory)
                                    .map((i) => i.id),
                                ),
                              );
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="w-6 px-2 py-3"></th>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{ width: col.width }}
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const filteredItems = searchTerm
                          ? items.filter(
                              (item) =>
                                item.itemName
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                item.specification
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                item.category
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                            )
                          : items;

                        return filteredItems.map((item) => (
                          <SortableEstimateRow
                            key={item.id}
                            item={item}
                            columns={columns}
                            selectedRows={selectedRows}
                            editingCell={editingCell}
                            categoriesWithMaster={categoriesWithMaster}
                            setShowMasterSearch={setShowMasterSearch}
                            setSearchStep={setSearchStep}
                            setSelectedCategory={setSelectedCategory}
                            setSelectedProductType={setSelectedProductType}
                            setSelectedMaker={setSelectedMaker}
                            setMasterSearchRow={setMasterSearchRow}
                            onRowSelect={(id, selected) => {
                              const newSelected = new Set(selectedRows);
                              if (selected) {
                                newSelected.add(id);
                              } else {
                                newSelected.delete(id);
                              }
                              setSelectedRows(newSelected);
                            }}
                            onCellEdit={setEditingCell}
                            onCellChange={handleCellChange}
                            onAddRow={addRow}
                            onShowCostRateModal={handleShowCostRateModal}
                          />
                        ));
                      })()}
                    </tbody>
                  </SortableContext>
                </table>
              </div>
            </DndContext>

            {/* 合計行 */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>
                    項目数:{' '}
                    {items.filter((i) => !i.isCategory && !i.isSubtotal).length}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  {viewMode === 'internal' && (
                    <>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">原価合計</div>
                        <div className="font-bold text-amber-600">
                          ¥{totals.costAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">粗利額</div>
                        <div className="font-bold text-green-600">
                          ¥{totals.grossProfit.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">粗利率</div>
                        <div className="font-bold text-green-600">
                          {totalGrossProfitRate}%
                        </div>
                      </div>
                    </>
                  )}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">見積合計</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ¥{totals.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 階層マスタ検索ポップアップ */}
        {showMasterSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              ref={panelRef}
              role="listbox"
              className="bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto w-full max-w-2xl"
            >
              <div className="sticky top-0 bg-blue-50 px-4 py-2 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    品目マスタから選択
                    {searchStep === 'productType'
                      ? ' - 商品種別を選択'
                      : searchStep === 'maker'
                        ? ' - メーカーを選択'
                        : ' - 商品を選択'}
                  </span>
                  <div className="flex items-center gap-2">
                    {searchStep === 'maker' && (
                      <button
                        onClick={() => {
                          setSearchStep('productType');
                          setSelectedProductType(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        戻る
                      </button>
                    )}
                    {searchStep === 'products' && (
                      <button
                        onClick={() => {
                          setSearchStep('maker');
                          setSelectedMaker(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        戻る
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowMasterSearch(false);
                        setMasterSearchTerm('');
                        setSearchStep('productType');
                        setSelectedCategory(null);
                        setSelectedProductType(null);
                        setSelectedMaker(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {searchStep === 'productType' ? (
                <div className="divide-y divide-gray-100">
                  {getFilteredProductTypes().map((productType) => (
                    <button
                      key={productType.id}
                      onClick={() => {
                        setSelectedProductType(productType.id);
                        setSearchStep('maker');
                      }}
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {productType.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {productType.category}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchStep === 'maker' ? (
                <div className="divide-y divide-gray-100">
                  {availableMakers.map((maker) => (
                    <button
                      key={maker}
                      onClick={() => {
                        setSelectedMaker(maker);
                        setSearchStep('products');
                      }}
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {maker}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {
                          MASTER_ITEMS.filter(
                            (item) =>
                              item.productType === selectedProductType &&
                              item.maker === maker,
                          ).length
                        }
                        件の商品
                      </div>
                    </button>
                  ))}
                </div>
              ) : shouldShowProducts ? (
                <div>
                  {/* 商品検索バー */}
                  <div className="p-3 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="商品・メーカー名で絞り込み..."
                      value={masterSearchTerm}
                      onChange={(e) => setMasterSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="divide-y divide-gray-100">
                    {filteredMasterItems.slice(0, 10).map((master) => (
                      <button
                        key={master.id}
                        type="button"
                        role="option"
                        onPointerDown={(e) => {
                          console.debug('[mousedown]', {
                            id: master.id,
                            activeRowId,
                          });
                          e.preventDefault();
                          e.stopPropagation();
                          (e.nativeEvent as any).stopImmediatePropagation?.();

                          // ★ モーダルが閉じる前に状態更新を同期反映
                          flushSync(() => {
                            routeMasterSelect(master, selectedCategory);
                          });

                          // その後に明示的に閉じる
                          setShowMasterSearch(false);
                          setSearchStep('productType');
                          setSelectedCategory(null);
                          setSelectedProductType(null);
                          setSelectedMaker(null);
                          setMasterSearchTerm('');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600">
                              {master.itemName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {master.specification}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="text-gray-500">
                                単位:{' '}
                                <span className="font-medium">
                                  {master.unit}
                                </span>
                              </span>
                              {master.maker && (
                                <span className="text-purple-600">
                                  <span className="font-medium">
                                    {master.maker}
                                  </span>
                                </span>
                              )}
                              <span className="text-blue-600">
                                売価:{' '}
                                <span className="font-medium">
                                  ¥{master.standardPrice.toLocaleString()}
                                </span>
                              </span>
                              <span className="text-amber-600">
                                原価:{' '}
                                <span className="font-medium">
                                  ¥{master.costPrice.toLocaleString()}
                                </span>
                              </span>
                              <span className="text-green-600">
                                粗利率:{' '}
                                <span className="font-medium">
                                  {Math.round(
                                    ((master.standardPrice - master.costPrice) /
                                      master.standardPrice) *
                                      100,
                                  )}
                                  %
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {filteredMasterItems.length > 10 && (
                      <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-600">
                        他 {filteredMasterItems.length - 10} 件
                      </div>
                    )}

                    {filteredMasterItems.length === 0 && (
                      <div className="px-4 py-3 text-center text-sm text-gray-500">
                        該当する商品が見つかりません
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* 掛率調整モーダル */}
        <AnimatePresence>
          {showCostRateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCostRateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              >
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      掛率による原価調整
                    </h2>
                    <button
                      onClick={() => setShowCostRateModal(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        掛率 (倍率)
                      </label>
                      <input
                        type="number"
                        value={tempCostRate}
                        onChange={(e) =>
                          setTempCostRate(parseFloat(e.target.value) || 1.0)
                        }
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        1.0=等倍、0.8=8掛け、1.2=1.2倍
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">
                        現在の掛率:{' '}
                        {costRateModalRow
                          ? items.find((i) => i.id === costRateModalRow)
                              ?.masterCostRate || 1.0
                          : 1.0}
                        倍
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        調整後の掛率: {tempCostRate}倍
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => setShowCostRateModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleApplyCostRate}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        適用
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* インポートモーダル */}
        <AnimatePresence>
          {showImportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowImportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    データインポート
                  </h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* ドラッグ&ドロップエリア */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                    <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Excel/CSVファイルをドラッグ&ドロップ
                    </p>
                    <p className="text-sm text-gray-500 mb-4">または</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      ファイルを選択
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      対応形式: .xlsx, .xls, .csv
                    </p>
                  </div>

                  {/* テンプレートダウンロード */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      インポート用テンプレート
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-blue-700">
                        正しい形式でインポートするためのテンプレートをダウンロード
                      </p>
                      <button className="px-3 py-1.5 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        テンプレート
                      </button>
                    </div>
                  </div>

                  {/* 最近のインポート履歴 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      最近のインポート
                    </h3>
                    <div className="space-y-2">
                      {[
                        {
                          name: 'キッチンリフォーム見積.xlsx',
                          date: '2024/03/20',
                          items: 25,
                        },
                        {
                          name: '浴室工事明細.csv',
                          date: '2024/03/18',
                          items: 18,
                        },
                      ].map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {file.date} • {file.items}項目
                              </p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            再インポート
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* コメントサイドバー */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex"
              onClick={() => setShowComments(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="ml-auto w-96 bg-white h-full shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    コメント
                  </h2>
                  <button
                    onClick={() => setShowComments(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* コメント一覧 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* 全体コメント */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        全体コメント
                      </span>
                    </div>
                    <textarea
                      value={generalComment}
                      onChange={(e) => setGeneralComment(e.target.value)}
                      placeholder="見積全体に関するコメントを入力..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
                      rows={3}
                    />
                  </div>

                  {/* 項目別コメント例 */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 text-sm">
                      項目別コメント
                    </h3>

                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          キッチン工事
                        </span>
                        <span className="text-xs text-gray-500">2分前</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        IHクッキングヒーターの仕様変更について確認が必要
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>担当者</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>要確認</span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          給排水工事
                        </span>
                        <span className="text-xs text-gray-500">1時間前</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        既存配管の状況により追加工事の可能性あり
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>現場確認</span>
                        <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                        <span>注意</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* フッター（コメント送信） */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="新しいコメントを追加..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* グローバルマスタ追加モーダル */}
      <GlobalMasterAddModal
        open={showGlobalMasterModal}
        categories={CATEGORIES}
        onClose={() => setShowGlobalMasterModal(false)}
        onConfirm={(category) => {
          // カテゴリ行を追加または既存のIDを取得
          const categoryId = addCategory(category);
          if (categoryId) {
            // カテゴリと関連状態をセット
            setSelectedCategory(category);
            setSelectedProductType(null); // 前回値リセット
            setSelectedMaker(null); // メーカーもリセット
            setSearchStep('productType'); // ステップを最初へ
            setShowGlobalMasterModal(false);

            // openRowMasterSelectorでactiveRowIdをセットしてモーダルを開く
            setTimeout(() => openRowMasterSelector(categoryId), 0);
          }
        }}
        // ▼ 追加：ユーザーが商品を選んだら呼ばれる
        onSelect={(master, categoryFromModal) => {
          routeMasterSelect(master, categoryFromModal);
          setShowGlobalMasterModal(false);
        }}
      />

      {/* 保存済み見積モーダル */}
      <SavedEstimatesModal
        isOpen={showSavedEstimatesModal}
        onClose={() => setShowSavedEstimatesModal(false)}
        onLoad={handleLoadSavedEstimate}
      />

      {/* 新しいテンプレート選択モーダル */}
      {showNewTemplateModal && (
        <TemplateSelectModal
          isOpen={showNewTemplateModal}
          onClose={() => setShowNewTemplateModal(false)}
          onApply={(template, options) => {
            // テンプレートのアイテムを現在の見積に適用
            const newItems: EstimateItem[] = [];
            template.sections.forEach((section) => {
              section.items.forEach((item) => {
                newItems.push({
                  id: nanoid(),
                  no: newItems.length + 1,
                  category: section.name,
                  itemName: item.itemName,
                  specification: item.specification || '',
                  quantity: item.defaultQuantity,
                  unit: item.unit,
                  unitPrice: item.unitPrice,
                  amount: item.unitPrice * item.defaultQuantity,
                  remarks: '',
                  costPrice: item.costPrice,
                  costAmount: item.costPrice * item.defaultQuantity,
                  grossProfit:
                    (item.unitPrice - item.costPrice) * item.defaultQuantity,
                  grossProfitRate:
                    ((item.unitPrice - item.costPrice) / item.unitPrice) * 100,
                });
              });
            });
            if (options.keepExistingItems) {
              setItems((prevItems) => [...prevItems, ...newItems]);
            } else {
              setItems(newItems);
            }
            setShowNewTemplateModal(false);
          }}
        />
      )}

      {/* バージョン管理 */}
      {showVersionManager && (
        <div className="fixed bottom-4 right-4 z-40 w-96">
          <VersionManager
            estimateId={params.id}
            currentVersionId={currentVersionId}
            versions={estimateVersions}
            onCreateVersion={(options) => {
              // バージョン作成処理
              const newVersion: EstimateVersion = {
                id: nanoid(),
                estimateId: params.id,
                versionNumber: `${estimateVersions.length + 1}.0`,
                versionType: options.versionType || 'minor',
                title: options.title,
                description: options.description || '',
                changeLog: options.changeLog || '',
                status: options.autoActivate ? 'active' : 'draft',
                snapshot: {
                  items: items,
                  totals: {
                    amount: calculateTotal(),
                    costAmount: 0,
                    grossProfit: 0,
                  },
                  customer: customerInfo || {},
                  projectInfo: { projectName: customerInfo?.company || '' },
                  taxRate: 0.1,
                  validUntil: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                },
                createdAt: new Date(),
                createdBy: 'current-user',
                createdByName: 'システム管理者',
              };
              setEstimateVersions([...estimateVersions, newVersion]);
              if (options.autoActivate) {
                setCurrentVersionId(newVersion.id);
              }
            }}
            onSwitchVersion={(versionId) => {
              const version = estimateVersions.find((v) => v.id === versionId);
              if (version && version.snapshot) {
                setItems(version.snapshot.items || []);
                setCurrentVersionId(versionId);
              }
            }}
            onCompareVersions={(versionAId, versionBId) => {
              // バージョン比較機能の実装
              console.log('Compare versions:', versionAId, versionBId);
            }}
          />
        </div>
      )}

      {/* 承認ワークフロー */}
      {showApprovalWorkflow && (
        <div className="fixed top-20 right-4 z-40 w-96">
          <ApprovalWorkflowComponent
            workflow={
              approvalWorkflow || {
                id: nanoid(),
                estimateId: params.id,
                estimateNumber: `EST-${params.id}`,
                estimateTitle: customerInfo?.company || '見積書',
                totalAmount: calculateTotal().amount,
                status: 'draft',
                currentStep: 0,
                totalSteps: 3,
                steps: [
                  {
                    id: nanoid(),
                    stepNumber: 1,
                    name: '課長承認',
                    type: 'single',
                    status: 'in_progress',
                    approvers: [
                      {
                        id: nanoid(),
                        userId: 'user-manager',
                        userName: '田中 課長',
                        role: '課長',
                        action: null,
                        comment: '',
                        actionAt: null,
                        delegatedTo: null,
                        delegatedToName: null,
                      },
                    ],
                  },
                  {
                    id: nanoid(),
                    stepNumber: 2,
                    name: '部長承認',
                    type: 'single',
                    status: 'waiting',
                    approvers: [
                      {
                        id: nanoid(),
                        userId: 'user-director',
                        userName: '佐藤 部長',
                        role: '部長',
                        action: null,
                        comment: '',
                        actionAt: null,
                        delegatedTo: null,
                        delegatedToName: null,
                      },
                    ],
                  },
                  {
                    id: nanoid(),
                    stepNumber: 3,
                    name: '最終承認',
                    type: 'single',
                    status: 'waiting',
                    approvers: [
                      {
                        id: nanoid(),
                        userId: 'user-president',
                        userName: '鈴木 社長',
                        role: '代表取締役',
                        action: null,
                        comment: '',
                        actionAt: null,
                        delegatedTo: null,
                        delegatedToName: null,
                      },
                    ],
                  },
                ],
                requestedBy: 'current-user',
                requestedByName: 'システム管理者',
                requestedAt: new Date(),
                customerId: customerInfo?.id || '',
                customerName: customerInfo?.name || '',
                projectName: customerInfo?.company || '',
                urgency: 'normal',
              }
            }
            onSubmitForApproval={() => {
              // 承認申請処理
              if (approvalWorkflow) {
                setApprovalWorkflow({
                  ...approvalWorkflow,
                  status: 'pending',
                });
                console.log('Submit for approval');
              }
            }}
            onApprove={(action: ApprovalAction) => {
              // 承認処理
              console.log('Approve:', action);
            }}
            onReject={(action: ApprovalAction) => {
              // 却下処理
              console.log('Reject:', action);
            }}
            onDelegate={(action: ApprovalAction) => {
              // 委任処理
              console.log('Delegate:', action);
            }}
            currentUserId="current-user"
            canSubmit={true}
            canApprove={true}
          />
        </div>
      )}

      {/* PDFテンプレートセレクター */}
      {showPdfTemplateSelector && (
        <TemplateSelector
          companyId="company_1" // 実際にはユーザー認証から取得
          documentType="estimate"
          estimateData={{
            title: '建設工事見積書',
            documentNumber: params.id,
            date: new Date().toISOString(),
            validUntil,
            customer: customerInfo,
            items: items.filter((item) => !item.isCategory && !item.isSubtotal),
            totals: {
              subtotal: totals.subtotal,
              tax: totals.tax,
              total: totals.amount,
            },
          }}
          onTemplateSelect={handlePdfTemplateSelect}
          onClose={() => setShowPdfTemplateSelector(false)}
        />
      )}
    </div>
  );
}

// 表示フォーマット用のキーセット（グローバル定義）
const MONEY_KEYS = new Set([
  'unitPrice',
  'sellUnitPrice',
  'amount',
  'sellAmount',
  'costPrice',
  'costAmount',
  'grossProfit',
]);
const PERCENT_KEYS = new Set(['grossProfitRate']);
const PLAIN_NUMBER_KEYS = new Set(['no', 'quantity', 'qty']); // NO列と数量は通貨フォーマットなし
const formatPrice = (n: number) => `¥${Number(n || 0).toLocaleString('ja-JP')}`;

// ソート可能な見積行コンポーネント
function SortableEstimateRow({
  item,
  columns,
  selectedRows,
  editingCell,
  categoriesWithMaster,
  setShowMasterSearch,
  setSearchStep,
  setSelectedCategory,
  setSelectedProductType,
  setSelectedMaker,
  setMasterSearchRow,
  onRowSelect,
  onCellEdit,
  onCellChange,
  onAddRow,
  onShowCostRateModal,
}: {
  item: EstimateItem;
  columns: any[];
  selectedRows: Set<string>;
  editingCell: { row: string; col: string } | null;
  categoriesWithMaster: string[];
  setShowMasterSearch: (show: boolean) => void;
  setSearchStep: (step: 'productType' | 'maker' | 'products') => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedProductType: (type: string | null) => void;
  setSelectedMaker: (maker: string | null) => void;
  setMasterSearchRow: (row: string | null) => void;
  onRowSelect: (id: string, selected: boolean) => void;
  onCellEdit: (cell: { row: string; col: string } | null) => void;
  onCellChange: (rowId: string, colKey: string, value: string) => void;
  onAddRow: (category: string) => void;
  onShowCostRateModal: (rowId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const isSelected = selectedRows.has(item.id);

  // カテゴリ行の場合
  if (item.isCategory) {
    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 ${
          isDragging ? 'shadow-lg' : ''
        }`}
      >
        <td className="px-2 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onRowSelect(item.id, e.target.checked)}
            className="rounded border-gray-300"
          />
        </td>
        <td className="px-2 py-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move p-1 hover:bg-blue-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </td>
        <td colSpan={columns.length + 1} className="px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-bold text-blue-900 text-lg">
                {item.itemName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {categoriesWithMaster.includes(item.category) && (
                <button
                  onClick={() => {
                    setSelectedCategory(item.category);
                    setMasterSearchRow(null);
                    setShowMasterSearch(true);
                    setSearchStep('productType');
                    setSelectedProductType(null);
                    setSelectedMaker(null);
                  }}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  マスタから項目追加
                </button>
              )}
              <button
                onClick={() => onAddRow(item.category)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                項目追加
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  // 小計行の場合
  if (item.isSubtotal) {
    return (
      <tr className="bg-gray-100 border-t-2 border-gray-300">
        <td className="px-2 py-2"></td>
        <td className="px-2 py-2"></td>
        {columns.map((col) => {
          if (col.key === 'itemName') {
            return (
              <td key={col.key} className="px-3 py-2 font-bold text-gray-700">
                {item.itemName}
              </td>
            );
          } else if (col.key === 'amount') {
            return (
              <td
                key={col.key}
                className="px-3 py-2 font-bold text-blue-600 text-right"
              >
                ¥{item.amount.toLocaleString()}
              </td>
            );
          } else {
            return <td key={col.key} className="px-3 py-2"></td>;
          }
        })}
        <td className="px-2 py-2"></td>
      </tr>
    );
  }

  // 通常行の場合
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <td className="px-2 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowSelect(item.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-2 py-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </td>
      {columns.map((col) => {
        const isEditing =
          editingCell?.row === item.id && editingCell?.col === col.key;

        // 両対応：正規キーと旧キーの両方をチェック
        let value: any;
        if (col.key === 'no') {
          value = (item as any).no ?? (item as any).index ?? 0; // NO列の値
        } else if (col.key === 'itemName') {
          value = (item as any).name ?? (item as any).itemName ?? '';
        } else if (col.key === 'quantity') {
          value = (item as any).qty ?? (item as any).quantity ?? 0;
        } else if (col.key === 'unitPrice') {
          value = (item as any).sellUnitPrice ?? (item as any).unitPrice ?? 0;
          // デバッグ: unitPriceの値を確認
          if (typeof window !== 'undefined' && window.__est?.debug) {
            console.log('[SortableEstimateRow] unitPrice value:', {
              itemId: item.id,
              sellUnitPrice: (item as any).sellUnitPrice,
              unitPrice: (item as any).unitPrice,
              finalValue: value,
              item,
            });
          }
        } else if (col.key === 'costPrice') {
          value = (item as any).costUnitPrice ?? (item as any).costPrice ?? 0;
        } else if (col.key === 'amount') {
          value = (item as any).sellAmount ?? (item as any).amount ?? 0;
        } else {
          value = (item as any)[col.key];
        }

        // 数値表示の処理（空の場合は0を表示）
        const displayValue =
          col.type === 'number' ? (value === '' ? '' : value) : value || '';

        return (
          <td
            key={col.key}
            className={`px-3 py-2 ${col.className || ''} ${
              col.readonly ? 'bg-gray-50' : ''
            } relative group`}
            style={{ width: col.width }}
          >
            {col.readonly ? (
              <div className="text-right font-medium">
                {col.type === 'number'
                  ? PERCENT_KEYS.has(col.key)
                    ? `${value || 0}%`
                    : PLAIN_NUMBER_KEYS.has(col.key)
                      ? (value || 0).toString() // NO列と数量は通貨フォーマットなし
                      : MONEY_KEYS.has(col.key)
                        ? formatPrice(value || 0)
                        : (value || 0).toString() // その他の数値もプレーン表示
                  : value || ''}
              </div>
            ) : isEditing ? (
              <input
                type={col.type === 'number' ? 'number' : 'text'}
                value={displayValue}
                onChange={(e) => onCellChange(item.id, col.key, e.target.value)}
                onBlur={() => onCellEdit(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCellEdit(null);
                  } else if (e.key === 'Escape') {
                    onCellEdit(null);
                  }
                }}
                className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                step={col.key === 'quantity' ? '1' : '0.01'}
                data-row={item.id}
                data-col={col.key}
              />
            ) : (
              <div
                onClick={() => onCellEdit({ row: item.id, col: col.key })}
                className="min-h-[24px] cursor-text px-2 py-1 rounded hover:bg-blue-50 text-right"
              >
                {col.type === 'number'
                  ? displayValue
                    ? PERCENT_KEYS.has(col.key)
                      ? `${displayValue}%`
                      : PLAIN_NUMBER_KEYS.has(col.key)
                        ? Number(displayValue).toString() // NO列と数量は通貨フォーマットなし
                        : MONEY_KEYS.has(col.key)
                          ? formatPrice(Number(displayValue))
                          : Number(displayValue).toString() // その他の数値もプレーン表示
                    : ''
                  : displayValue}
              </div>
            )}

            {/* 掛率調整ボタン（マスタ原価項目のみ） */}
            {col.key === 'costPrice' && item.costType === 'master' && (
              <button
                onClick={() => onShowCostRateModal(item.id)}
                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 hover:bg-amber-200 text-amber-700 p-1 rounded text-xs"
                title="掛率調整"
              >
                <Grid3x3 className="w-3 h-3" />
              </button>
            )}
          </td>
        );
      })}
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="コメント"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="バリエーション"
          >
            <GitBranch className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Suspense境界でラップ
export default function EstimateEditorV3Page({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EstimateEditorV3Content params={params} />
    </Suspense>
  );
}
