import { MasterItem, ProductType, MinorCategory } from './types';

// ==================== V5 定数 ====================

// 大項目のカテゴリ定義
export const CATEGORIES = [
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
] as const;

// 小項目のマスタ定義（大項目ごと）
export const MINOR_CATEGORIES: MinorCategory[] = [
  // 仮設工事
  { id: 'kari_ashiba', name: '足場・養生', majorCategory: '仮設工事' },
  { id: 'kari_setsubi', name: '仮設設備', majorCategory: '仮設工事' },
  { id: 'kari_hannyu', name: '資材搬入', majorCategory: '仮設工事' },

  // 解体工事
  { id: 'kaitai_naisou', name: '内装解体', majorCategory: '解体工事' },
  { id: 'kaitai_gaisou', name: '外装解体', majorCategory: '解体工事' },
  { id: 'kaitai_haizai', name: '廃材処分', majorCategory: '解体工事' },

  // 基礎工事
  { id: 'kiso_jigyou', name: '地業工事', majorCategory: '基礎工事' },
  { id: 'kiso_hontai', name: '基礎本体', majorCategory: '基礎工事' },
  { id: 'kiso_bousui', name: '防湿・防水', majorCategory: '基礎工事' },

  // 木工事
  { id: 'ki_kouzai', name: '構造材', majorCategory: '木工事' },
  { id: 'ki_zousaku', name: '造作材', majorCategory: '木工事' },
  { id: 'ki_tategu', name: '建具', majorCategory: '木工事' },
  { id: 'ki_dannetu', name: '断熱材', majorCategory: '木工事' },

  // 屋根工事
  { id: 'yane_zai', name: '屋根材', majorCategory: '屋根工事' },
  { id: 'yane_bousui', name: '防水工事', majorCategory: '屋根工事' },
  { id: 'yane_toi', name: '樋工事', majorCategory: '屋根工事' },

  // 外壁工事
  { id: 'gaiheki_zai', name: '外壁材', majorCategory: '外壁工事' },
  { id: 'gaiheki_bousui', name: '防水工事', majorCategory: '外壁工事' },
  { id: 'gaiheki_sash', name: 'サッシ', majorCategory: '外壁工事' },

  // 内装工事
  { id: 'naisou_yuka', name: '床工事', majorCategory: '内装工事' },
  { id: 'naisou_kabe', name: '壁・天井工事', majorCategory: '内装工事' },
  { id: 'naisou_tategu', name: '建具', majorCategory: '内装工事' },

  // 浴室工事
  { id: 'yoku_unit', name: 'ユニットバス', majorCategory: '浴室工事' },
  { id: 'yoku_setsubi', name: '浴室設備', majorCategory: '浴室工事' },
  { id: 'yoku_futai', name: '浴室付帯工事', majorCategory: '浴室工事' },

  // 電気工事
  { id: 'denki_haisen', name: '配線工事', majorCategory: '電気工事' },
  { id: 'denki_shoumei', name: '照明器具', majorCategory: '電気工事' },
  { id: 'denki_kanki', name: '換気設備', majorCategory: '電気工事' },

  // 給排水工事
  { id: 'kyuhai_kyusui', name: '給水設備', majorCategory: '給排水工事' },
  { id: 'kyuhai_haisui', name: '排水設備', majorCategory: '給排水工事' },
  { id: 'kyuhai_eisei', name: '衛生器具', majorCategory: '給排水工事' },

  // キッチン工事
  {
    id: 'kitchen_system',
    name: 'システムキッチン',
    majorCategory: 'キッチン工事',
  },
  {
    id: 'kitchen_setsubi',
    name: 'キッチン設備',
    majorCategory: 'キッチン工事',
  },
  {
    id: 'kitchen_futai',
    name: 'キッチン付帯工事',
    majorCategory: 'キッチン工事',
  },

  // 諸経費
  { id: 'shohi_genba', name: '現場管理費', majorCategory: '諸経費' },
  { id: 'shohi_ippan', name: '一般管理費', majorCategory: '諸経費' },
  { id: 'shohi_sonota', name: 'その他経費', majorCategory: '諸経費' },
];

// 大項目から小項目を取得するヘルパー関数
export function getMinorCategoriesByMajor(
  majorCategory: string,
): MinorCategory[] {
  return MINOR_CATEGORIES.filter((mc) => mc.majorCategory === majorCategory);
}

// 単位定義
export const UNITS = [
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
] as const;

// テンプレートカテゴリ
export const TEMPLATE_CATEGORIES = [
  '新築',
  'リフォーム',
  'リノベーション',
  '外構',
  'その他',
] as const;

// 支店リスト
export const BRANCHES = ['東京支店', '大阪支店', '名古屋支店'] as const;

// 住設機器カテゴリ（4段階検索対象）
export const EQUIPMENT_CATEGORIES = [
  'キッチン工事',
  '浴室工事',
  '給排水工事',
  '電気工事',
] as const;

// 商品種別定義（63種類）
export const PRODUCT_TYPES: ProductType[] = [
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

// マスタアイテムデータ（30項目のサンプル）
export const MASTER_ITEMS: MasterItem[] = [
  // 仮設工事
  {
    id: 'M001',
    category: '仮設工事',
    minorCategory: '足場・養生',
    productType: 'scaffold',
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
    minorCategory: '足場・養生',
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
    minorCategory: '仮設設備',
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
    minorCategory: '内装解体',
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
    minorCategory: '廃材処分',
    itemName: '廃材処分',
    specification: '2tトラック',
    unit: '台',
    standardPrice: 35000,
    costPrice: 21000,
    tags: ['処分'],
  },

  // 基礎工事
  {
    id: 'M006',
    category: '基礎工事',
    minorCategory: '基礎本体',
    itemName: 'ベタ基礎',
    specification: 'コンクリート打設',
    unit: 'm²',
    standardPrice: 8000,
    costPrice: 4800,
    tags: ['基礎'],
  },
  {
    id: 'M007',
    category: '基礎工事',
    minorCategory: '防湿・防水',
    itemName: '防湿シート',
    specification: '0.15mm厚',
    unit: 'm²',
    standardPrice: 500,
    costPrice: 300,
    tags: ['防湿'],
  },

  // 木工事
  {
    id: 'M008',
    category: '木工事',
    minorCategory: '構造材',
    itemName: '構造用合板',
    specification: '12mm厚',
    unit: '枚',
    standardPrice: 2500,
    costPrice: 1500,
    tags: ['合板'],
  },
  {
    id: 'M009',
    category: '木工事',
    minorCategory: '断熱材',
    itemName: '断熱材',
    specification: 'グラスウール',
    unit: 'm²',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['断熱'],
  },

  // 屋根工事
  {
    id: 'M010',
    category: '屋根工事',
    minorCategory: '屋根材',
    itemName: 'ガルバリウム鋼板',
    specification: '0.35mm厚',
    unit: 'm²',
    standardPrice: 6500,
    costPrice: 3900,
    tags: ['屋根材'],
  },
  {
    id: 'M011',
    category: '屋根工事',
    minorCategory: '防水工事',
    itemName: 'ルーフィング',
    specification: 'アスファルト系',
    unit: 'm²',
    standardPrice: 800,
    costPrice: 480,
    tags: ['防水'],
  },

  // 外壁工事
  {
    id: 'M012',
    category: '外壁工事',
    minorCategory: '外壁材',
    itemName: 'サイディング',
    specification: '窯業系16mm',
    unit: 'm²',
    standardPrice: 5500,
    costPrice: 3300,
    tags: ['外壁材'],
  },
  {
    id: 'M013',
    category: '外壁工事',
    minorCategory: '防水工事',
    itemName: '透湿防水シート',
    specification: 'タイベック',
    unit: 'm²',
    standardPrice: 600,
    costPrice: 360,
    tags: ['防水'],
  },

  // 内装工事
  {
    id: 'M014',
    category: '内装工事',
    minorCategory: '壁・天井工事',
    itemName: 'クロス',
    specification: 'ビニールクロス',
    unit: 'm²',
    standardPrice: 1200,
    costPrice: 720,
    tags: ['壁紙'],
  },
  {
    id: 'M015',
    category: '内装工事',
    minorCategory: '床工事',
    itemName: 'フローリング',
    specification: '複合フローリング',
    unit: 'm²',
    standardPrice: 7500,
    costPrice: 4500,
    tags: ['床材'],
  },

  // キッチン工事
  {
    id: 'M016',
    category: 'キッチン工事',
    minorCategory: 'システムキッチン',
    productType: 'kitchen_system',
    itemName: 'システムキッチン',
    specification: 'I型2550mm',
    unit: 'セット',
    standardPrice: 350000,
    costPrice: 210000,
    maker: 'LIXIL',
    tags: ['システムキッチン'],
  },
  {
    id: 'M017',
    category: 'キッチン工事',
    minorCategory: 'キッチン設備',
    productType: 'kitchen_ih',
    itemName: 'IHクッキングヒーター',
    specification: '3口IH',
    unit: '台',
    standardPrice: 85000,
    costPrice: 51000,
    maker: 'Panasonic',
    tags: ['IH'],
  },

  // 浴室工事
  {
    id: 'M018',
    category: '浴室工事',
    minorCategory: 'ユニットバス',
    productType: 'bathroom_unit',
    itemName: 'ユニットバス',
    specification: '1616サイズ',
    unit: 'セット',
    standardPrice: 450000,
    costPrice: 270000,
    maker: 'TOTO',
    tags: ['ユニットバス'],
  },
  {
    id: 'M019',
    category: '浴室工事',
    minorCategory: '浴室設備',
    productType: 'bathroom_heating',
    itemName: '浴室暖房乾燥機',
    specification: '24時間換気機能付',
    unit: '台',
    standardPrice: 95000,
    costPrice: 57000,
    maker: 'Panasonic',
    tags: ['浴室暖房'],
  },

  // 給排水工事
  {
    id: 'M020',
    category: '給排水工事',
    minorCategory: '衛生器具',
    productType: 'toilet',
    itemName: 'トイレ',
    specification: 'タンクレス',
    unit: '台',
    standardPrice: 180000,
    costPrice: 108000,
    maker: 'TOTO',
    tags: ['トイレ'],
  },
  {
    id: 'M021',
    category: '給排水工事',
    minorCategory: '給水設備',
    productType: 'water_heater',
    itemName: 'ガス給湯器',
    specification: '24号オート',
    unit: '台',
    standardPrice: 150000,
    costPrice: 90000,
    maker: 'リンナイ',
    tags: ['給湯器'],
  },

  // 電気工事
  {
    id: 'M022',
    category: '電気工事',
    minorCategory: '配線工事',
    itemName: '配線工事',
    specification: '一般住宅',
    unit: '式',
    standardPrice: 120000,
    costPrice: 72000,
    tags: ['配線'],
  },
  {
    id: 'M023',
    category: '電気工事',
    minorCategory: '換気設備',
    productType: 'air_conditioner',
    itemName: 'エアコン',
    specification: '2.8kW',
    unit: '台',
    standardPrice: 95000,
    costPrice: 57000,
    maker: 'ダイキン',
    tags: ['エアコン'],
  },

  // 諸経費
  {
    id: 'M024',
    category: '諸経費',
    minorCategory: '現場管理費',
    itemName: '現場管理費',
    specification: '工事全体の8%',
    unit: '式',
    standardPrice: 0,
    costPrice: 0,
    tags: ['管理費'],
  },
  {
    id: 'M025',
    category: '諸経費',
    minorCategory: '一般管理費',
    itemName: '一般管理費',
    specification: '工事全体の5%',
    unit: '式',
    standardPrice: 0,
    costPrice: 0,
    tags: ['管理費'],
  },

  // 追加マスタ（メーカー違い）
  {
    id: 'M026',
    category: 'キッチン工事',
    minorCategory: 'システムキッチン',
    productType: 'kitchen_system',
    itemName: 'システムキッチン',
    specification: 'L型2550×1650mm',
    unit: 'セット',
    standardPrice: 450000,
    costPrice: 270000,
    maker: 'クリナップ',
    tags: ['システムキッチン', 'L型'],
  },
  {
    id: 'M027',
    category: '浴室工事',
    minorCategory: 'ユニットバス',
    productType: 'bathroom_unit',
    itemName: 'ユニットバス',
    specification: '1620サイズ',
    unit: 'セット',
    standardPrice: 480000,
    costPrice: 288000,
    maker: 'LIXIL',
    tags: ['ユニットバス'],
  },
  {
    id: 'M028',
    category: '給排水工事',
    minorCategory: '給水設備',
    productType: 'eco_cute',
    itemName: 'エコキュート',
    specification: '370Lフルオート',
    unit: '台',
    standardPrice: 380000,
    costPrice: 228000,
    maker: 'Panasonic',
    tags: ['エコキュート'],
  },
  {
    id: 'M029',
    category: '電気工事',
    minorCategory: '換気設備',
    productType: 'ventilation',
    itemName: '換気システム',
    specification: '第1種換気',
    unit: 'セット',
    standardPrice: 250000,
    costPrice: 150000,
    maker: 'Panasonic',
    tags: ['換気'],
  },
  {
    id: 'M030',
    category: '木工事',
    minorCategory: '建具',
    productType: 'door',
    itemName: '玄関ドア',
    specification: '断熱ドア',
    unit: '箇所',
    standardPrice: 180000,
    costPrice: 108000,
    maker: 'LIXIL',
    tags: ['ドア', '玄関'],
  },
];

// メーカー一覧（住設機器用）
export const MAKERS = [
  'LIXIL',
  'TOTO',
  'Panasonic',
  'クリナップ',
  'タカラスタンダード',
  'ダイキン',
  'リンナイ',
  'ノーリツ',
  '三菱電機',
  'その他',
] as const;

// 自動保存の間隔（ミリ秒）
export const AUTO_SAVE_DELAY = 5000; // 5秒

// ローカルストレージのキー
export const STORAGE_KEYS = {
  ESTIMATE_PREFIX: 'estimate-v5-',
  VERSIONS_PREFIX: 'estimate-v5-versions-',
  TEMPLATES: 'estimate-v5-templates',
  RECENT_SEARCHES: 'estimate-v5-recent-searches',
} as const;
