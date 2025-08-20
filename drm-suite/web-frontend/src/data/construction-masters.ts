// 建設業界向けマスタデータ
// このファイルは建設業界の実務に即したリアルなマスタデータを提供します

import {
  Product,
  Category,
  SubCategory,
  Item,
  Customer,
  Supplier,
} from '@/types/master';

// ===============================
// 工事カテゴリマスタ
// ===============================
export const constructionCategories = [
  { id: 'cat-exterior', name: '外装工事', code: 'EXT', displayOrder: 1 },
  { id: 'cat-roof', name: '屋根工事', code: 'ROOF', displayOrder: 2 },
  { id: 'cat-water', name: '水回り工事', code: 'WATER', displayOrder: 3 },
  { id: 'cat-interior', name: '内装工事', code: 'INT', displayOrder: 4 },
  { id: 'cat-electric', name: '電気工事', code: 'ELEC', displayOrder: 5 },
  {
    id: 'cat-garden',
    name: '外構・エクステリア',
    code: 'GARD',
    displayOrder: 6,
  },
  { id: 'cat-reform', name: 'リフォーム全般', code: 'REF', displayOrder: 7 },
  {
    id: 'cat-repair',
    name: '修繕・メンテナンス',
    code: 'REP',
    displayOrder: 8,
  },
];

// ===============================
// サブカテゴリマスタ（工事種別）
// ===============================
export const constructionSubCategories = [
  // 外装工事
  {
    id: 'sub-ext-01',
    categoryId: 'cat-exterior',
    name: '外壁塗装',
    code: 'EXT-01',
  },
  {
    id: 'sub-ext-02',
    categoryId: 'cat-exterior',
    name: 'サイディング張替',
    code: 'EXT-02',
  },
  {
    id: 'sub-ext-03',
    categoryId: 'cat-exterior',
    name: 'タイル工事',
    code: 'EXT-03',
  },
  {
    id: 'sub-ext-04',
    categoryId: 'cat-exterior',
    name: 'シーリング工事',
    code: 'EXT-04',
  },

  // 屋根工事
  {
    id: 'sub-roof-01',
    categoryId: 'cat-roof',
    name: '屋根葺き替え',
    code: 'ROOF-01',
  },
  {
    id: 'sub-roof-02',
    categoryId: 'cat-roof',
    name: '屋根塗装',
    code: 'ROOF-02',
  },
  {
    id: 'sub-roof-03',
    categoryId: 'cat-roof',
    name: '雨樋交換',
    code: 'ROOF-03',
  },
  {
    id: 'sub-roof-04',
    categoryId: 'cat-roof',
    name: '防水工事',
    code: 'ROOF-04',
  },

  // 水回り工事
  {
    id: 'sub-water-01',
    categoryId: 'cat-water',
    name: 'キッチンリフォーム',
    code: 'WATER-01',
  },
  {
    id: 'sub-water-02',
    categoryId: 'cat-water',
    name: '浴室リフォーム',
    code: 'WATER-02',
  },
  {
    id: 'sub-water-03',
    categoryId: 'cat-water',
    name: 'トイレリフォーム',
    code: 'WATER-03',
  },
  {
    id: 'sub-water-04',
    categoryId: 'cat-water',
    name: '洗面所リフォーム',
    code: 'WATER-04',
  },
  {
    id: 'sub-water-05',
    categoryId: 'cat-water',
    name: '給排水設備工事',
    code: 'WATER-05',
  },
];

// ===============================
// 商品マスタ（材料・設備・工事）
// ===============================
export const constructionProducts: Product[] = [
  // === 外壁塗装関連 ===
  {
    id: 'prod-001',
    code: 'P-EXT-001',
    name: 'シリコン系塗料（標準グレード）',
    categoryId: 'cat-exterior',
    subCategoryId: 'sub-ext-01',
    unit: '㎡',
    standardPrice: 2800,
    costPrice: 1680,
    description: '耐候性10-12年、防カビ・防藻機能付き',
    specifications: {
      耐用年数: '10-12年',
      塗布面積: '0.12-0.14kg/㎡',
      乾燥時間: '夏：4時間、冬：6時間',
      色数: '48色',
    },
    isActive: true,
  },
  {
    id: 'prod-002',
    code: 'P-EXT-002',
    name: 'フッ素系塗料（高耐久グレード）',
    categoryId: 'cat-exterior',
    subCategoryId: 'sub-ext-01',
    unit: '㎡',
    standardPrice: 4200,
    costPrice: 2520,
    description: '耐候性15-20年、超低汚染性',
    specifications: {
      耐用年数: '15-20年',
      塗布面積: '0.11-0.13kg/㎡',
      乾燥時間: '夏：4時間、冬：6時間',
      色数: '36色',
    },
    isActive: true,
  },
  {
    id: 'prod-003',
    code: 'P-EXT-003',
    name: '無機系塗料（最高級グレード）',
    categoryId: 'cat-exterior',
    subCategoryId: 'sub-ext-01',
    unit: '㎡',
    standardPrice: 5500,
    costPrice: 3300,
    description: '耐候性20年以上、セルフクリーニング機能',
    specifications: {
      耐用年数: '20年以上',
      塗布面積: '0.10-0.12kg/㎡',
      乾燥時間: '夏：3時間、冬：5時間',
      色数: '24色',
    },
    isActive: true,
  },

  // === 屋根材関連 ===
  {
    id: 'prod-010',
    code: 'P-ROOF-001',
    name: 'ガルバリウム鋼板（0.35mm厚）',
    categoryId: 'cat-roof',
    subCategoryId: 'sub-roof-01',
    unit: '㎡',
    standardPrice: 6800,
    costPrice: 4080,
    description: '軽量で耐久性抜群、断熱材一体型',
    specifications: {
      厚さ: '0.35mm',
      重量: '5.8kg/㎡',
      耐用年数: '25-30年',
      保証期間: '穴あき25年、塗膜15年',
    },
    isActive: true,
  },
  {
    id: 'prod-011',
    code: 'P-ROOF-002',
    name: 'アスファルトシングル',
    categoryId: 'cat-roof',
    subCategoryId: 'sub-roof-01',
    unit: '㎡',
    standardPrice: 4500,
    costPrice: 2700,
    description: '軽量で加工しやすく、デザイン性が高い',
    specifications: {
      厚さ: '3.0mm',
      重量: '9.6kg/㎡',
      耐用年数: '20-25年',
      防火性能: '飛び火認定取得',
    },
    isActive: true,
  },

  // === 水回り設備 ===
  {
    id: 'prod-020',
    code: 'P-WATER-001',
    name: 'システムキッチン I型2550（標準グレード）',
    categoryId: 'cat-water',
    subCategoryId: 'sub-water-01',
    unit: '台',
    standardPrice: 680000,
    costPrice: 408000,
    description: 'ステンレストップ、食洗機付き、ソフトクローズ',
    specifications: {
      サイズ: 'W2550×D650×H850mm',
      天板: 'ステンレス',
      収納: '引き出し式（ソフトクローズ）',
      食洗機: '45cm幅・5人用',
      水栓: 'シングルレバー混合水栓',
    },
    isActive: true,
  },
  {
    id: 'prod-021',
    code: 'P-WATER-002',
    name: 'システムバス 1616サイズ（標準グレード）',
    categoryId: 'cat-water',
    subCategoryId: 'sub-water-02',
    unit: '台',
    standardPrice: 780000,
    costPrice: 468000,
    description: '保温浴槽、LED照明、浴室暖房乾燥機付き',
    specifications: {
      サイズ: '1616（1坪）',
      浴槽: '魔法びん浴槽（高断熱）',
      床: 'ほっカラリ床',
      換気: '浴室暖房乾燥機（100V）',
      照明: 'LED照明',
    },
    isActive: true,
  },
  {
    id: 'prod-022',
    code: 'P-WATER-003',
    name: 'タンクレストイレ（自動洗浄機能付き）',
    categoryId: 'cat-water',
    subCategoryId: 'sub-water-03',
    unit: '台',
    standardPrice: 320000,
    costPrice: 192000,
    description: '節水型、自動開閉・洗浄、脱臭機能付き',
    specifications: {
      洗浄水量: '大3.8L/小3.3L',
      機能: '自動開閉、自動洗浄、脱臭',
      サイズ: 'W380×D700×H540mm',
      電源: 'AC100V',
    },
    isActive: true,
  },
];

// ===============================
// 作業項目マスタ（工事内容）
// ===============================
export const constructionItems: Item[] = [
  // === 外壁塗装工事 ===
  {
    id: 'item-001',
    code: 'L-EXT-001',
    name: '足場設置・撤去工事',
    categoryId: 'cat-exterior',
    unit: '㎡',
    standardPrice: 800,
    costPrice: 600,
    description: '単管足場、メッシュシート込み',
    requiredDays: 2,
    requiredWorkers: 3,
  },
  {
    id: 'item-002',
    code: 'L-EXT-002',
    name: '高圧洗浄作業',
    categoryId: 'cat-exterior',
    unit: '㎡',
    standardPrice: 200,
    costPrice: 120,
    description: '150MPa高圧洗浄、バイオ洗浄剤使用',
    requiredDays: 1,
    requiredWorkers: 1,
  },
  {
    id: 'item-003',
    code: 'L-EXT-003',
    name: '下地処理・ケレン作業',
    categoryId: 'cat-exterior',
    unit: '㎡',
    standardPrice: 500,
    costPrice: 350,
    description: 'クラック補修、パテ処理込み',
    requiredDays: 2,
    requiredWorkers: 2,
  },
  {
    id: 'item-004',
    code: 'L-EXT-004',
    name: '下塗り作業（シーラー）',
    categoryId: 'cat-exterior',
    unit: '㎡',
    standardPrice: 600,
    costPrice: 420,
    description: '浸透性シーラー使用',
    requiredDays: 1,
    requiredWorkers: 2,
  },
  {
    id: 'item-005',
    code: 'L-EXT-005',
    name: '中塗り・上塗り作業',
    categoryId: 'cat-exterior',
    unit: '㎡',
    standardPrice: 1200,
    costPrice: 840,
    description: '2回塗り、養生込み',
    requiredDays: 3,
    requiredWorkers: 2,
  },

  // === 屋根工事 ===
  {
    id: 'item-010',
    code: 'L-ROOF-001',
    name: '既存屋根材撤去作業',
    categoryId: 'cat-roof',
    unit: '㎡',
    standardPrice: 2000,
    costPrice: 1400,
    description: '廃材処分費込み',
    requiredDays: 2,
    requiredWorkers: 3,
  },
  {
    id: 'item-011',
    code: 'L-ROOF-002',
    name: '下地補修工事',
    categoryId: 'cat-roof',
    unit: '㎡',
    standardPrice: 1500,
    costPrice: 1050,
    description: '野地板補強、防水シート施工',
    requiredDays: 2,
    requiredWorkers: 2,
  },
  {
    id: 'item-012',
    code: 'L-ROOF-003',
    name: '屋根材施工作業',
    categoryId: 'cat-roof',
    unit: '㎡',
    standardPrice: 3500,
    costPrice: 2450,
    description: '役物取付、雨仕舞い込み',
    requiredDays: 3,
    requiredWorkers: 3,
  },

  // === 水回り工事 ===
  {
    id: 'item-020',
    code: 'L-WATER-001',
    name: '既存設備撤去作業',
    categoryId: 'cat-water',
    unit: '式',
    standardPrice: 50000,
    costPrice: 35000,
    description: '廃材処分費込み',
    requiredDays: 1,
    requiredWorkers: 2,
  },
  {
    id: 'item-021',
    code: 'L-WATER-002',
    name: '給排水配管工事',
    categoryId: 'cat-water',
    unit: '式',
    standardPrice: 80000,
    costPrice: 56000,
    description: '配管切り回し、接続工事',
    requiredDays: 1,
    requiredWorkers: 1,
  },
  {
    id: 'item-022',
    code: 'L-WATER-003',
    name: '設備機器設置作業',
    categoryId: 'cat-water',
    unit: '式',
    standardPrice: 60000,
    costPrice: 42000,
    description: '据付、調整、試運転込み',
    requiredDays: 1,
    requiredWorkers: 2,
  },
  {
    id: 'item-023',
    code: 'L-WATER-004',
    name: '電気配線工事',
    categoryId: 'cat-water',
    unit: '式',
    standardPrice: 40000,
    costPrice: 28000,
    description: '専用回路増設、アース工事',
    requiredDays: 1,
    requiredWorkers: 1,
  },
];

// ===============================
// 顧客マスタ
// ===============================
export const customers: Customer[] = [
  // 個人顧客
  {
    id: 'cust-001',
    code: 'C-001',
    name: '山田 太郎',
    nameKana: 'ヤマダ タロウ',
    type: 'individual',
    postalCode: '150-0001',
    prefecture: '東京都',
    city: '渋谷区',
    address: '神宮前1-2-3',
    building: 'ハイツ神宮前201',
    tel: '03-1234-5678',
    mobile: '090-1234-5678',
    email: 'yamada@example.com',
    propertyInfo: {
      建物種別: '戸建て',
      築年数: '15年',
      延床面積: '120㎡',
      構造: '木造2階建て',
    },
    contractHistory: [
      { date: '2023-05-15', content: '外壁塗装工事', amount: 1200000 },
      { date: '2022-08-20', content: '屋根補修工事', amount: 450000 },
    ],
    memo: '定期メンテナンス希望のお客様',
    creditLimit: 3000000,
    paymentTerms: '月末締め翌月末払い',
    isActive: true,
  },
  {
    id: 'cust-002',
    code: 'C-002',
    name: '鈴木 花子',
    nameKana: 'スズキ ハナコ',
    type: 'individual',
    postalCode: '231-0001',
    prefecture: '神奈川県',
    city: '横浜市中区',
    address: '関内2-3-4',
    building: '',
    tel: '045-234-5678',
    mobile: '090-2345-6789',
    email: 'suzuki@example.com',
    propertyInfo: {
      建物種別: '戸建て',
      築年数: '25年',
      延床面積: '95㎡',
      構造: '木造2階建て',
    },
    contractHistory: [
      { date: '2024-02-10', content: 'キッチンリフォーム', amount: 1800000 },
    ],
    memo: '高齢のため、バリアフリー化を検討中',
    creditLimit: 2000000,
    paymentTerms: '月末締め翌月末払い',
    isActive: true,
  },
  {
    id: 'cust-003',
    code: 'C-003',
    name: '田中商事株式会社',
    nameKana: 'タナカショウジ',
    type: 'corporate',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内1-1-1',
    building: '丸の内ビル10F',
    tel: '03-3456-7890',
    fax: '03-3456-7891',
    email: 'info@tanaka-shoji.co.jp',
    representative: '田中 一郎',
    department: '総務部',
    contactPerson: '佐藤 次郎',
    propertyInfo: {
      建物種別: 'ビル',
      築年数: '20年',
      延床面積: '2500㎡',
      構造: 'RC造8階建て',
      物件数: '3棟',
    },
    contractHistory: [
      { date: '2024-01-15', content: '外壁改修工事', amount: 15000000 },
      { date: '2023-11-20', content: '防水工事', amount: 3500000 },
      { date: '2023-06-10', content: '空調設備更新', amount: 8000000 },
    ],
    memo: '年間保守契約締結済み、請求書は本社一括',
    creditLimit: 50000000,
    paymentTerms: '月末締め翌々月末払い',
    isActive: true,
  },

  // 法人顧客（マンション管理組合）
  {
    id: 'cust-004',
    code: 'C-004',
    name: 'グランドハイツ管理組合',
    nameKana: 'グランドハイツカンリクミアイ',
    type: 'corporate',
    postalCode: '158-0001',
    prefecture: '東京都',
    city: '世田谷区',
    address: '用賀3-4-5',
    building: '',
    tel: '03-4567-8901',
    email: 'grand-heights@example.com',
    representative: '管理組合理事長 高橋',
    contactPerson: '管理会社 ABC管理',
    propertyInfo: {
      建物種別: 'マンション',
      築年数: '18年',
      延床面積: '8500㎡',
      構造: 'RC造15階建て',
      戸数: '120戸',
    },
    contractHistory: [
      { date: '2023-09-01', content: '大規模修繕工事', amount: 85000000 },
    ],
    memo: '次回大規模修繕は2035年予定',
    creditLimit: 100000000,
    paymentTerms: '完成後一括払い',
    isActive: true,
  },
];

// ===============================
// 協力会社マスタ（外注先）
// ===============================
export const suppliers: Supplier[] = [
  {
    id: 'supp-001',
    code: 'S-001',
    name: '山田塗装工業',
    nameKana: 'ヤマダトソウコウギョウ',
    type: 'painter',
    specialties: ['外壁塗装', '屋根塗装', '防水工事'],
    postalCode: '120-0001',
    prefecture: '東京都',
    city: '足立区',
    address: '千住1-2-3',
    tel: '03-5678-9012',
    fax: '03-5678-9013',
    email: 'yamada-paint@example.com',
    representative: '山田 一郎',
    employees: 8,
    established: '1995-04-01',
    capital: 10000000,
    licenses: ['塗装工事業', '防水工事業'],
    insurance: {
      労災保険: '加入済み',
      賠償責任保険: '1億円',
    },
    evaluation: {
      技術力: 5,
      価格: 4,
      納期: 5,
      対応: 5,
    },
    unitPrices: [
      { item: '外壁塗装工賃', unit: '㎡', price: 1800 },
      { item: '屋根塗装工賃', unit: '㎡', price: 2200 },
      { item: '職人日当', unit: '人日', price: 25000 },
    ],
    paymentTerms: '月末締め翌月末払い',
    memo: '技術力高く、対応も丁寧。繁忙期は早めの手配が必要',
    isActive: true,
  },
  {
    id: 'supp-002',
    code: 'S-002',
    name: '田中建材株式会社',
    nameKana: 'タナカケンザイ',
    type: 'material',
    specialties: ['建材卸', '塗料販売', '屋根材販売'],
    postalCode: '140-0001',
    prefecture: '東京都',
    city: '品川区',
    address: '東品川2-3-4',
    tel: '03-6789-0123',
    fax: '03-6789-0124',
    email: 'info@tanaka-kenzai.co.jp',
    representative: '田中 次郎',
    employees: 25,
    established: '1980-06-15',
    capital: 50000000,
    licenses: ['建設業許可（販売）'],
    evaluation: {
      品質: 4,
      価格: 5,
      納期: 4,
      対応: 4,
    },
    unitPrices: [
      { item: 'シリコン塗料', unit: '缶', price: 12000 },
      { item: 'ガルバリウム鋼板', unit: '㎡', price: 3800 },
      { item: '防水シート', unit: '㎡', price: 1200 },
    ],
    paymentTerms: '月末締め翌月末払い',
    discountRate: 0.15, // 15%引き
    memo: '大量発注で特別割引あり。配送は翌日可能',
    isActive: true,
  },
  {
    id: 'supp-003',
    code: 'S-003',
    name: '鈴木設備工業',
    nameKana: 'スズキセツビコウギョウ',
    type: 'plumber',
    specialties: ['給排水工事', '水回りリフォーム', '配管工事'],
    postalCode: '110-0001',
    prefecture: '東京都',
    city: '台東区',
    address: '上野3-4-5',
    tel: '03-7890-1234',
    mobile: '090-3456-7890',
    email: 'suzuki-setsubi@example.com',
    representative: '鈴木 三郎',
    employees: 5,
    established: '2005-08-20',
    capital: 5000000,
    licenses: ['管工事業', '水道施設工事業'],
    insurance: {
      労災保険: '加入済み',
      賠償責任保険: '5000万円',
    },
    evaluation: {
      技術力: 5,
      価格: 3,
      納期: 4,
      対応: 5,
    },
    unitPrices: [
      { item: '配管工事', unit: 'm', price: 8000 },
      { item: '設備設置工賃', unit: '台', price: 35000 },
      { item: '職人日当', unit: '人日', price: 28000 },
    ],
    paymentTerms: '月末締め翌月20日払い',
    memo: '水回り専門で技術力高い。緊急対応も可能',
    isActive: true,
  },
  {
    id: 'supp-004',
    code: 'S-004',
    name: '高橋電気工事',
    nameKana: 'タカハシデンキコウジ',
    type: 'electrician',
    specialties: ['電気工事', '照明工事', 'エアコン工事'],
    postalCode: '130-0001',
    prefecture: '東京都',
    city: '墨田区',
    address: '錦糸1-2-3',
    tel: '03-8901-2345',
    mobile: '090-4567-8901',
    email: 'takahashi-denki@example.com',
    representative: '高橋 四郎',
    employees: 3,
    established: '2010-03-15',
    capital: 3000000,
    licenses: ['電気工事業', '電気工事士1種'],
    insurance: {
      労災保険: '加入済み',
      賠償責任保険: '3000万円',
    },
    evaluation: {
      技術力: 4,
      価格: 4,
      納期: 5,
      対応: 4,
    },
    unitPrices: [
      { item: '配線工事', unit: 'm', price: 2500 },
      { item: 'コンセント増設', unit: '箇所', price: 8000 },
      { item: '分電盤交換', unit: '台', price: 45000 },
    ],
    paymentTerms: '月末締め翌月末払い',
    memo: '少人数だが仕事は確実。住宅専門',
    isActive: true,
  },
  {
    id: 'supp-005',
    code: 'S-005',
    name: '株式会社大和建設',
    nameKana: 'ヤマトケンセツ',
    type: 'general',
    specialties: ['総合建設', '大規模改修', 'RC工事'],
    postalCode: '105-0001',
    prefecture: '東京都',
    city: '港区',
    address: '虎ノ門2-3-4',
    building: '虎ノ門ビル5F',
    tel: '03-9012-3456',
    fax: '03-9012-3457',
    email: 'info@yamato-kensetsu.co.jp',
    representative: '大和 太郎',
    employees: 150,
    established: '1970-04-01',
    capital: 100000000,
    licenses: ['特定建設業許可（建築一式）', '一級建築士事務所'],
    insurance: {
      労災保険: '加入済み',
      賠償責任保険: '10億円',
      建設工事保険: '加入済み',
    },
    evaluation: {
      技術力: 5,
      価格: 3,
      納期: 4,
      対応: 4,
    },
    paymentTerms: '月末締め翌々月末払い',
    memo: '大規模工事やRC造の実績豊富。価格は高めだが品質は確実',
    isActive: true,
  },
];

// ===============================
// 諸経費マスタ
// ===============================
export const overheadCosts = [
  {
    id: 'oh-001',
    name: '現場管理費',
    rate: 0.08, // 8%
    description: '現場監督費、安全管理費、品質管理費',
    calculationBase: 'material_and_labor', // 材工費に対して
  },
  {
    id: 'oh-002',
    name: '一般管理費',
    rate: 0.05, // 5%
    description: '本社経費、営業経費、事務経費',
    calculationBase: 'subtotal', // 小計に対して
  },
  {
    id: 'oh-003',
    name: '諸経費',
    rate: 0.03, // 3%
    description: '交通費、通信費、消耗品費',
    calculationBase: 'material_and_labor',
  },
  {
    id: 'oh-004',
    name: '廃材処分費',
    rate: 0.02, // 2%
    description: '産業廃棄物処理費用',
    calculationBase: 'material',
  },
];

// ===============================
// 利益率マスタ
// ===============================
export const profitMargins = [
  {
    id: 'pm-001',
    projectType: '新築工事',
    minMargin: 0.15, // 15%
    standardMargin: 0.2, // 20%
    maxMargin: 0.25, // 25%
  },
  {
    id: 'pm-002',
    projectType: 'リフォーム工事',
    minMargin: 0.2, // 20%
    standardMargin: 0.25, // 25%
    maxMargin: 0.3, // 30%
  },
  {
    id: 'pm-003',
    projectType: '修繕工事',
    minMargin: 0.25, // 25%
    standardMargin: 0.3, // 30%
    maxMargin: 0.35, // 35%
  },
  {
    id: 'pm-004',
    projectType: '緊急工事',
    minMargin: 0.3, // 30%
    standardMargin: 0.35, // 35%
    maxMargin: 0.4, // 40%
  },
];

// ===============================
// 支払条件マスタ
// ===============================
export const paymentTerms = [
  {
    id: 'pt-001',
    name: '契約時30%、完工時70%',
    description: '標準的な支払条件',
    schedule: [
      { timing: '契約時', rate: 0.3 },
      { timing: '完工時', rate: 0.7 },
    ],
  },
  {
    id: 'pt-002',
    name: '契約時30%、中間時40%、完工時30%',
    description: '大規模工事向け',
    schedule: [
      { timing: '契約時', rate: 0.3 },
      { timing: '中間時', rate: 0.4 },
      { timing: '完工時', rate: 0.3 },
    ],
  },
  {
    id: 'pt-003',
    name: '完工後一括払い',
    description: '小規模工事向け',
    schedule: [{ timing: '完工時', rate: 1.0 }],
  },
  {
    id: 'pt-004',
    name: '月末締め翌月末払い',
    description: '継続取引先向け',
    schedule: [{ timing: '請求後翌月末', rate: 1.0 }],
  },
];

// ===============================
// データ初期化関数
// ===============================
export function initializeConstructionMasters() {
  // LocalStorageに保存
  if (typeof window !== 'undefined') {
    // カテゴリ
    localStorage.setItem(
      'construction_categories',
      JSON.stringify(constructionCategories),
    );
    localStorage.setItem(
      'construction_subcategories',
      JSON.stringify(constructionSubCategories),
    );

    // 商品・項目
    localStorage.setItem(
      'construction_products',
      JSON.stringify(constructionProducts),
    );
    localStorage.setItem(
      'construction_items',
      JSON.stringify(constructionItems),
    );

    // 顧客・協力会社
    localStorage.setItem('construction_customers', JSON.stringify(customers));
    localStorage.setItem('construction_suppliers', JSON.stringify(suppliers));

    // 諸経費・利益率
    localStorage.setItem('overhead_costs', JSON.stringify(overheadCosts));
    localStorage.setItem('profit_margins', JSON.stringify(profitMargins));
    localStorage.setItem('payment_terms', JSON.stringify(paymentTerms));

    console.log('建設業マスタデータを初期化しました');
  }
}

// ===============================
// データ取得関数
// ===============================
export function getConstructionMasters() {
  if (typeof window === 'undefined') {
    return {
      categories: [],
      subCategories: [],
      products: [],
      items: [],
      customers: [],
      suppliers: [],
      overheadCosts: [],
      profitMargins: [],
      paymentTerms: [],
    };
  }

  return {
    categories: JSON.parse(
      localStorage.getItem('construction_categories') || '[]',
    ),
    subCategories: JSON.parse(
      localStorage.getItem('construction_subcategories') || '[]',
    ),
    products: JSON.parse(localStorage.getItem('construction_products') || '[]'),
    items: JSON.parse(localStorage.getItem('construction_items') || '[]'),
    customers: JSON.parse(
      localStorage.getItem('construction_customers') || '[]',
    ),
    suppliers: JSON.parse(
      localStorage.getItem('construction_suppliers') || '[]',
    ),
    overheadCosts: JSON.parse(localStorage.getItem('overhead_costs') || '[]'),
    profitMargins: JSON.parse(localStorage.getItem('profit_margins') || '[]'),
    paymentTerms: JSON.parse(localStorage.getItem('payment_terms') || '[]'),
  };
}
