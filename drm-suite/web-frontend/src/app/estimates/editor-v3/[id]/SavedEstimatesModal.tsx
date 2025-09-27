'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Search, Filter, Download, Copy, Trash2, Clock, User, Building } from 'lucide-react';

interface SavedEstimate {
  id: string;
  title: string;
  customerName: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  status: '下書き' | '提出済み' | '交渉中' | '受注' | '失注';
  tags: string[];
}

interface SavedEstimatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (estimate: SavedEstimate) => void;
}

// 見積データを生成してLocalStorageに保存
const generateAndStoreEstimateData = () => {
  // EST-001: 山田工務店 キッチンリフォーム
  const est001Items = [
    { id: 'cat1', name: 'キッチン工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: 'キッチン工事', name: 'システムキッチン', specification: 'LIXIL シエラS I型2550', quantity: 1, unit: 'セット', unitPrice: 680000, amount: 680000, costPrice: 476000, grossProfitRate: 30 },
    { id: '1-2', category: 'キッチン工事', name: 'IHクッキングヒーター', specification: 'パナソニック KZ-G32AST', quantity: 1, unit: '台', unitPrice: 95000, amount: 95000, costPrice: 66500, grossProfitRate: 30 },
    { id: '1-3', category: 'キッチン工事', name: 'レンジフード', specification: '富士工業 USR-3A-751', quantity: 1, unit: '台', unitPrice: 125000, amount: 125000, costPrice: 87500, grossProfitRate: 30 },
    { id: 'sub1', name: 'キッチン工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 900000, category: 'キッチン工事' },
    { id: 'cat2', name: '給排水工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '給排水工事', name: '給排水配管工事', specification: '既存配管撤去・新設', quantity: 1, unit: '式', unitPrice: 180000, amount: 180000, costPrice: 126000, grossProfitRate: 30 },
    { id: 'sub2', name: '給排水工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 180000, category: '給排水工事' },
  ];
  localStorage.setItem('estimate_EST-001', JSON.stringify({ id: 'EST-001', items: est001Items, validUntil: '2025-10-26' }));

  // EST-002: 田中建設 新築工事（浴室・トイレ）
  const est002Items = [
    { id: 'cat1', name: '浴室工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '浴室工事', name: 'ユニットバス', specification: 'TOTO サザナ 1616サイズ', quantity: 1, unit: 'セット', unitPrice: 850000, amount: 850000, costPrice: 595000, grossProfitRate: 30 },
    { id: '1-2', category: '浴室工事', name: '浴室暖房乾燥機', specification: '三菱 V-141BZ', quantity: 1, unit: '台', unitPrice: 95000, amount: 95000, costPrice: 66500, grossProfitRate: 30 },
    { id: 'sub1', name: '浴室工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 945000, category: '浴室工事' },
    { id: 'cat2', name: '給排水工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '給排水工事', name: 'トイレ', specification: 'TOTO ウォシュレット一体型', quantity: 2, unit: '台', unitPrice: 180000, amount: 360000, costPrice: 252000, grossProfitRate: 30 },
    { id: '2-2', category: '給排水工事', name: '洗面化粧台', specification: 'LIXIL ピアラ 750mm', quantity: 2, unit: '台', unitPrice: 120000, amount: 240000, costPrice: 168000, grossProfitRate: 30 },
    { id: 'sub2', name: '給排水工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 600000, category: '給排水工事' },
  ];
  localStorage.setItem('estimate_EST-002', JSON.stringify({ id: 'EST-002', items: est002Items, validUntil: '2025-10-24' }));

  // EST-003: 佐藤商事 倉庫改修（電気・内装）
  const est003Items = [
    { id: 'cat1', name: '電気工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '電気工事', name: 'LED照明器具', specification: 'パナソニック 直管LED 40形', quantity: 50, unit: '台', unitPrice: 12000, amount: 600000, costPrice: 420000, grossProfitRate: 30 },
    { id: '1-2', category: '電気工事', name: '配線工事', specification: 'VVFケーブル 2.0mm', quantity: 500, unit: 'm', unitPrice: 280, amount: 140000, costPrice: 98000, grossProfitRate: 30 },
    { id: 'sub1', name: '電気工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 740000, category: '電気工事' },
    { id: 'cat2', name: '内装工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '内装工事', name: '床材張替', specification: '防塵塗装 300㎡', quantity: 300, unit: '㎡', unitPrice: 3500, amount: 1050000, costPrice: 735000, grossProfitRate: 30 },
    { id: 'sub2', name: '内装工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1050000, category: '内装工事' },
  ];
  localStorage.setItem('estimate_EST-003', JSON.stringify({ id: 'EST-003', items: est003Items, validUntil: '2025-10-18' }));

  // EST-004: 鈴木邸 外壁塗装
  const est004Items = [
    { id: 'cat1', name: '外壁工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '外壁工事', name: '高圧洗浄', specification: '外壁・屋根全体', quantity: 180, unit: '㎡', unitPrice: 500, amount: 90000, costPrice: 63000, grossProfitRate: 30 },
    { id: '1-2', category: '外壁工事', name: '外壁塗装', specification: 'シリコン塗料 3回塗り', quantity: 150, unit: '㎡', unitPrice: 3800, amount: 570000, costPrice: 399000, grossProfitRate: 30 },
    { id: '1-3', category: '外壁工事', name: 'コーキング打替', specification: 'シーリング材', quantity: 80, unit: 'm', unitPrice: 1200, amount: 96000, costPrice: 67200, grossProfitRate: 30 },
    { id: 'sub1', name: '外壁工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 756000, category: '外壁工事' },
    { id: 'cat2', name: '仮設工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '仮設工事', name: '足場設置・撤去', specification: '単管足場 200㎡', quantity: 200, unit: '㎡', unitPrice: 1100, amount: 220000, costPrice: 154000, grossProfitRate: 30 },
    { id: 'sub2', name: '仮設工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 220000, category: '仮設工事' },
  ];
  localStorage.setItem('estimate_EST-004', JSON.stringify({ id: 'EST-004', items: est004Items, validUntil: '2025-10-11' }));

  // EST-005: グリーンホーム マンション共用部
  const est005Items = [
    { id: 'cat1', name: '防水工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '防水工事', name: '屋上防水', specification: 'ウレタン防水 密着工法', quantity: 450, unit: '㎡', unitPrice: 8500, amount: 3825000, costPrice: 2677500, grossProfitRate: 30 },
    { id: '1-2', category: '防水工事', name: '排水ドレン改修', specification: '改修用ドレン', quantity: 8, unit: '箇所', unitPrice: 35000, amount: 280000, costPrice: 196000, grossProfitRate: 30 },
    { id: 'sub1', name: '防水工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 4105000, category: '防水工事' },
    { id: 'cat2', name: '内装工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '内装工事', name: '共用廊下床シート', specification: '防滑性シート', quantity: 680, unit: '㎡', unitPrice: 4200, amount: 2856000, costPrice: 1999200, grossProfitRate: 30 },
    { id: '2-2', category: '内装工事', name: 'エントランス改修', specification: '天然石仕上げ', quantity: 45, unit: '㎡', unitPrice: 18000, amount: 810000, costPrice: 567000, grossProfitRate: 30 },
    { id: 'sub2', name: '内装工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 3666000, category: '内装工事' },
  ];
  localStorage.setItem('estimate_EST-005', JSON.stringify({ id: 'EST-005', items: est005Items, validUntil: '2025-10-22' }));

  // EST-006: 中村産業 工場増築工事 (鉄骨造平屋建て 500㎡)
  const est006Items = [
    { id: 'cat1', name: '仮設工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '仮設工事', name: '共通仮設', specification: '事務所・トイレ・電気水道', quantity: 1, unit: '式', unitPrice: 2800000, amount: 2800000, costPrice: 1960000, grossProfitRate: 30 },
    { id: '1-2', category: '仮設工事', name: '足場工事', specification: '外部足場 H=8m', quantity: 800, unit: '㎡', unitPrice: 1500, amount: 1200000, costPrice: 840000, grossProfitRate: 30 },
    { id: 'sub1', name: '仮設工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 4000000, category: '仮設工事' },
    { id: 'cat2', name: '基礎工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '基礎工事', name: '土工事', specification: '掘削・残土処分', quantity: 600, unit: '㎥', unitPrice: 8500, amount: 5100000, costPrice: 3570000, grossProfitRate: 30 },
    { id: '2-2', category: '基礎工事', name: '鉄筋工事', specification: 'D13・D16 配筋', quantity: 35, unit: 't', unitPrice: 180000, amount: 6300000, costPrice: 4410000, grossProfitRate: 30 },
    { id: '2-3', category: '基礎工事', name: 'コンクリート工事', specification: 'FC24 基礎・土間', quantity: 450, unit: '㎥', unitPrice: 28000, amount: 12600000, costPrice: 8820000, grossProfitRate: 30 },
    { id: 'sub2', name: '基礎工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 24000000, category: '基礎工事' },
    { id: 'cat3', name: '鉄骨工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '3-1', category: '鉄骨工事', name: '鉄骨製作', specification: 'H形鋼・角形鋼管', quantity: 120, unit: 't', unitPrice: 250000, amount: 30000000, costPrice: 21000000, grossProfitRate: 30 },
    { id: '3-2', category: '鉄骨工事', name: '鉄骨建方', specification: 'クレーン作業込み', quantity: 120, unit: 't', unitPrice: 45000, amount: 5400000, costPrice: 3780000, grossProfitRate: 30 },
    { id: '3-3', category: '鉄骨工事', name: '耐火被覆', specification: '耐火塗料 1時間耐火', quantity: 850, unit: '㎡', unitPrice: 8000, amount: 6800000, costPrice: 4760000, grossProfitRate: 30 },
    { id: 'sub3', name: '鉄骨工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 42200000, category: '鉄骨工事' },
    { id: 'cat4', name: '屋根・外壁工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '4-1', category: '屋根・外壁工事', name: '屋根工事', specification: '折板屋根 t=0.8', quantity: 550, unit: '㎡', unitPrice: 8500, amount: 4675000, costPrice: 3272500, grossProfitRate: 30 },
    { id: '4-2', category: '屋根・外壁工事', name: '外壁工事', specification: 'ALC板 t=100', quantity: 450, unit: '㎡', unitPrice: 12000, amount: 5400000, costPrice: 3780000, grossProfitRate: 30 },
    { id: '4-3', category: '屋根・外壁工事', name: 'シャッター', specification: '電動シャッター W5000×H4000', quantity: 3, unit: '箇所', unitPrice: 1850000, amount: 5550000, costPrice: 3885000, grossProfitRate: 30 },
    { id: 'sub4', name: '屋根・外壁工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 15625000, category: '屋根・外壁工事' },
    { id: 'cat5', name: '諸経費', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '5-1', category: '諸経費', name: '現場管理費', specification: '安全管理・品質管理', quantity: 1, unit: '式', unitPrice: 2100000, amount: 2100000, costPrice: 1470000, grossProfitRate: 30 },
    { id: '5-2', category: '諸経費', name: '一般管理費', specification: '本社経費・利益', quantity: 1, unit: '式', unitPrice: 2075000, amount: 2075000, costPrice: 1452500, grossProfitRate: 30 },
    { id: 'sub5', name: '諸経費 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 4175000, category: '諸経費' },
  ];
  localStorage.setItem('estimate_EST-006', JSON.stringify({ id: 'EST-006', items: est006Items, validUntil: '2025-10-07' }));

  // EST-007: 小林クリニック 内装改修工事 (200㎡全面改修)
  const est007Items = [
    { id: 'cat1', name: '解体工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '解体工事', name: '内装解体', specification: '既存内装撤去・処分', quantity: 200, unit: '㎡', unitPrice: 4500, amount: 900000, costPrice: 630000, grossProfitRate: 30 },
    { id: 'sub1', name: '解体工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 900000, category: '解体工事' },
    { id: 'cat2', name: '内装工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '内装工事', name: '床材（抗菌仕様）', specification: 'サンゲツ メディカルフロア', quantity: 200, unit: '㎡', unitPrice: 8500, amount: 1700000, costPrice: 1190000, grossProfitRate: 30 },
    { id: '2-2', category: '内装工事', name: '壁クロス（抗菌）', specification: 'リリカラ 抗ウイルス壁紙', quantity: 520, unit: '㎡', unitPrice: 2800, amount: 1456000, costPrice: 1019200, grossProfitRate: 30 },
    { id: '2-3', category: '内装工事', name: '天井材', specification: '化粧石膏ボード クリーンルーム仕様', quantity: 200, unit: '㎡', unitPrice: 5500, amount: 1100000, costPrice: 770000, grossProfitRate: 30 },
    { id: '2-4', category: '内装工事', name: '間仕切り工事', specification: 'LGS下地・石膏ボード', quantity: 85, unit: '㎡', unitPrice: 12000, amount: 1020000, costPrice: 714000, grossProfitRate: 30 },
    { id: 'sub2', name: '内装工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 5276000, category: '内装工事' },
    { id: 'cat3', name: '建具工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '3-1', category: '建具工事', name: '自動ドア', specification: 'ナブコ 両開き センサー付', quantity: 1, unit: '台', unitPrice: 1200000, amount: 1200000, costPrice: 840000, grossProfitRate: 30 },
    { id: '3-2', category: '建具工事', name: '診察室ドア', specification: '防音仕様 片開き', quantity: 6, unit: '枚', unitPrice: 220000, amount: 1320000, costPrice: 924000, grossProfitRate: 30 },
    { id: '3-3', category: '建具工事', name: '処置室引戸', specification: '自動引戸 抗菌仕様', quantity: 3, unit: '箇所', unitPrice: 380000, amount: 1140000, costPrice: 798000, grossProfitRate: 30 },
    { id: 'sub3', name: '建具工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 3660000, category: '建具工事' },
    { id: 'cat4', name: '電気設備工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '4-1', category: '電気設備工事', name: 'LED照明器具', specification: '調光機能付 クリーンルーム用', quantity: 45, unit: '台', unitPrice: 35000, amount: 1575000, costPrice: 1102500, grossProfitRate: 30 },
    { id: '4-2', category: '電気設備工事', name: 'コンセント工事', specification: '医療用アース付', quantity: 35, unit: '箇所', unitPrice: 18000, amount: 630000, costPrice: 441000, grossProfitRate: 30 },
    { id: 'sub4', name: '電気設備工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 2205000, category: '電気設備工事' },
    { id: 'cat5', name: '諸経費', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '5-1', category: '諸経費', name: '現場管理費', specification: '品質・安全管理', quantity: 1, unit: '式', unitPrice: 459000, amount: 459000, costPrice: 321300, grossProfitRate: 30 },
    { id: 'sub5', name: '諸経費 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 459000, category: '諸経費' },
  ];
  localStorage.setItem('estimate_EST-007', JSON.stringify({ id: 'EST-007', items: est007Items, validUntil: '2025-09-01' }));

  // EST-008: 高橋ビル 外壁改修工事 (8階建てオフィスビル)
  const est008Items = [
    { id: 'cat1', name: '仮設工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '仮設工事', name: 'ゴンドラ足場', specification: '8階建て全面 2500㎡', quantity: 2500, unit: '㎡', unitPrice: 1800, amount: 4500000, costPrice: 3150000, grossProfitRate: 30 },
    { id: '1-2', category: '仮設工事', name: '防護ネット', specification: 'メッシュシート', quantity: 2500, unit: '㎡', unitPrice: 350, amount: 875000, costPrice: 612500, grossProfitRate: 30 },
    { id: 'sub1', name: '仮設工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 5375000, category: '仮設工事' },
    { id: 'cat2', name: '外壁工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '外壁工事', name: '高圧洗浄', specification: '外壁全面', quantity: 2200, unit: '㎡', unitPrice: 600, amount: 1320000, costPrice: 924000, grossProfitRate: 30 },
    { id: '2-2', category: '外壁工事', name: 'タイル補修', specification: '浮き部分張替え', quantity: 180, unit: '㎡', unitPrice: 18000, amount: 3240000, costPrice: 2268000, grossProfitRate: 30 },
    { id: '2-3', category: '外壁工事', name: 'シーリング打替', specification: '外壁目地全面', quantity: 1800, unit: 'm', unitPrice: 2200, amount: 3960000, costPrice: 2772000, grossProfitRate: 30 },
    { id: '2-4', category: '外壁工事', name: '外壁塗装', specification: 'フッ素樹脂塗料 3回塗り', quantity: 2200, unit: '㎡', unitPrice: 5800, amount: 12760000, costPrice: 8932000, grossProfitRate: 30 },
    { id: 'sub2', name: '外壁工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 21280000, category: '外壁工事' },
    { id: 'cat3', name: '防水工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '3-1', category: '防水工事', name: '屋上防水', specification: 'ウレタン防水 通気緩衝工法', quantity: 450, unit: '㎡', unitPrice: 12000, amount: 5400000, costPrice: 3780000, grossProfitRate: 30 },
    { id: '3-2', category: '防水工事', name: 'パラペット防水', specification: 'アスファルト防水', quantity: 120, unit: 'm', unitPrice: 8500, amount: 1020000, costPrice: 714000, grossProfitRate: 30 },
    { id: 'sub3', name: '防水工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 6420000, category: '防水工事' },
    { id: 'cat4', name: '諸経費', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '4-1', category: '諸経費', name: '現場管理費', specification: '安全管理・品質管理', quantity: 1, unit: '式', unitPrice: 1150000, amount: 1150000, costPrice: 805000, grossProfitRate: 30 },
    { id: '4-2', category: '諸経費', name: '一般管理費', specification: '本社経費等', quantity: 1, unit: '式', unitPrice: 775000, amount: 775000, costPrice: 542500, grossProfitRate: 30 },
    { id: 'sub4', name: '諸経費 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1925000, category: '諸経費' },
  ];
  localStorage.setItem('estimate_EST-008', JSON.stringify({ id: 'EST-008', items: est008Items, validUntil: '2025-08-25' }));

  // EST-009: 渡辺邸 バリアフリー改修工事
  const est009Items = [
    { id: 'cat1', name: '浴室工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '浴室工事', name: 'バリアフリーユニットバス', specification: 'TOTO 1616 手すり・段差解消', quantity: 1, unit: 'セット', unitPrice: 1250000, amount: 1250000, costPrice: 875000, grossProfitRate: 30 },
    { id: '1-2', category: '浴室工事', name: '浴室暖房乾燥機', specification: 'ヒートショック対策', quantity: 1, unit: '台', unitPrice: 180000, amount: 180000, costPrice: 126000, grossProfitRate: 30 },
    { id: 'sub1', name: '浴室工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1430000, category: '浴室工事' },
    { id: 'cat2', name: 'トイレ工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: 'トイレ工事', name: 'バリアフリートイレ', specification: 'TOTO 車椅子対応 自動開閉', quantity: 2, unit: '箇所', unitPrice: 380000, amount: 760000, costPrice: 532000, grossProfitRate: 30 },
    { id: '2-2', category: 'トイレ工事', name: '手すり設置', specification: 'L型・可動式', quantity: 2, unit: 'セット', unitPrice: 45000, amount: 90000, costPrice: 63000, grossProfitRate: 30 },
    { id: 'sub2', name: 'トイレ工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 850000, category: 'トイレ工事' },
    { id: 'cat3', name: '廊下・玄関工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '3-1', category: '廊下・玄関工事', name: '床段差解消', specification: 'スロープ設置', quantity: 8, unit: '箇所', unitPrice: 65000, amount: 520000, costPrice: 364000, grossProfitRate: 30 },
    { id: '3-2', category: '廊下・玄関工事', name: '廊下手すり', specification: '両側連続手すり', quantity: 25, unit: 'm', unitPrice: 18000, amount: 450000, costPrice: 315000, grossProfitRate: 30 },
    { id: '3-3', category: '廊下・玄関工事', name: '滑り止め床材', specification: 'ノンスリップシート', quantity: 45, unit: '㎡', unitPrice: 8500, amount: 382500, costPrice: 267750, grossProfitRate: 30 },
    { id: 'sub3', name: '廊下・玄関工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1352500, category: '廊下・玄関工事' },
    { id: 'cat4', name: '建具工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '4-1', category: '建具工事', name: '引戸への変更', specification: '開き戸→引戸 6箇所', quantity: 6, unit: '箇所', unitPrice: 120000, amount: 720000, costPrice: 504000, grossProfitRate: 30 },
    { id: 'sub4', name: '建具工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 720000, category: '建具工事' },
    { id: 'cat5', name: '諸経費', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '5-1', category: '諸経費', name: '現場管理費', specification: '安全管理・品質管理', quantity: 1, unit: '式', unitPrice: 147500, amount: 147500, costPrice: 103250, grossProfitRate: 30 },
    { id: 'sub5', name: '諸経費 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 147500, category: '諸経費' },
  ];
  localStorage.setItem('estimate_EST-009', JSON.stringify({ id: 'EST-009', items: est009Items, validUntil: '2025-08-20' }));

  // EST-010: 伊藤物流センター 耐震補強工事 (2000㎡)
  const est010Items = [
    { id: 'cat1', name: '仮設工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '仮設工事', name: '内部足場', specification: '枠組足場 H=12m', quantity: 2000, unit: '㎡', unitPrice: 1200, amount: 2400000, costPrice: 1680000, grossProfitRate: 30 },
    { id: '1-2', category: '仮設工事', name: '養生シート', specification: '防音・防塵シート', quantity: 2000, unit: '㎡', unitPrice: 450, amount: 900000, costPrice: 630000, grossProfitRate: 30 },
    { id: 'sub1', name: '仮設工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 3300000, category: '仮設工事' },
    { id: 'cat2', name: '耐震補強工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '耐震補強工事', name: '鉄骨ブレース', specification: 'H-300×300×10×15', quantity: 85, unit: 't', unitPrice: 380000, amount: 32300000, costPrice: 22610000, grossProfitRate: 30 },
    { id: '2-2', category: '耐震補強工事', name: '柱補強', specification: '炭素繊維巻き付け', quantity: 48, unit: '本', unitPrice: 185000, amount: 8880000, costPrice: 6216000, grossProfitRate: 30 },
    { id: '2-3', category: '耐震補強工事', name: '耐震壁新設', specification: 'RC造 t=200', quantity: 120, unit: '㎡', unitPrice: 65000, amount: 7800000, costPrice: 5460000, grossProfitRate: 30 },
    { id: '2-4', category: '耐震補強工事', name: 'アンカーボルト', specification: 'D25 L=500', quantity: 850, unit: '本', unitPrice: 4500, amount: 3825000, costPrice: 2677500, grossProfitRate: 30 },
    { id: 'sub2', name: '耐震補強工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 52805000, category: '耐震補強工事' },
    { id: 'cat3', name: '付帯工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '3-1', category: '付帯工事', name: '構造調査', specification: '強度試験・診断', quantity: 1, unit: '式', unitPrice: 850000, amount: 850000, costPrice: 595000, grossProfitRate: 30 },
    { id: '3-2', category: '付帯工事', name: '仕上げ復旧', specification: '内装復旧工事', quantity: 1, unit: '式', unitPrice: 620000, amount: 620000, costPrice: 434000, grossProfitRate: 30 },
    { id: 'sub3', name: '付帯工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1470000, category: '付帯工事' },
    { id: 'cat4', name: '諸経費', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '4-1', category: '諸経費', name: '現場管理費', specification: '安全管理・品質管理', quantity: 1, unit: '式', unitPrice: 425000, amount: 425000, costPrice: 297500, grossProfitRate: 30 },
    { id: 'sub4', name: '諸経費 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 425000, category: '諸経費' },
  ];
  localStorage.setItem('estimate_EST-010', JSON.stringify({ id: 'EST-010', items: est010Items, validUntil: '2025-08-15' }));
};

export default function SavedEstimatesModal({ isOpen, onClose, onLoad }: SavedEstimatesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // モーダルが開かれたときに見積データを生成（強制上書き）
  useEffect(() => {
    if (isOpen) {
      // 既存データをクリア
      for (let i = 1; i <= 10; i++) {
        localStorage.removeItem(`estimate_EST-${String(i).padStart(3, '0')}`);
      }
      generateAndStoreEstimateData();
    }
  }, [isOpen]);

  // サンプルデータ（実際の建設業界の相場に合わせた金額）
  const savedEstimates: SavedEstimate[] = [
    {
      id: 'EST-001',
      title: '田中様邸 新築工事',
      customerName: '田中太郎',
      amount: 28500000, // 木造2階建て 延床面積120㎡ 新築住宅
      createdAt: '2025-09-26',
      updatedAt: '2025-09-26',
      status: '交渉中',
      tags: ['新築', '住宅', '木造']
    },
    {
      id: 'EST-002',
      title: '株式会社田中建設 新築工事見積',
      customerName: '株式会社田中建設',
      amount: 1545000, // 浴室工事945,000 + 給排水工事600,000
      createdAt: '2025-09-20',
      updatedAt: '2025-09-24',
      status: '提出済み',
      tags: ['新築', '住宅', 'VIP顧客']
    },
    {
      id: 'EST-003',
      title: '佐藤商事 倉庫改修工事',
      customerName: '佐藤商事株式会社',
      amount: 1790000, // 電気工事740,000 + 内装工事1,050,000
      createdAt: '2025-09-15',
      updatedAt: '2025-09-18',
      status: '受注',
      tags: ['改修', '倉庫', '法人']
    },
    {
      id: 'EST-004',
      title: '鈴木邸 外壁塗装工事見積',
      customerName: '鈴木太郎',
      amount: 976000, // 外壁工事756,000 + 仮設工事220,000
      createdAt: '2025-09-10',
      updatedAt: '2025-09-11',
      status: '失注',
      tags: ['塗装', '外壁', '個人']
    },
    {
      id: 'EST-005',
      title: 'グリーンホーム マンション共用部改修',
      customerName: 'グリーンホーム管理組合',
      amount: 7771000, // 防水工事4,105,000 + 内装工事3,666,000
      createdAt: '2025-09-08',
      updatedAt: '2025-09-22',
      status: '交渉中',
      tags: ['マンション', '共用部', '大規模']
    },
    {
      id: 'EST-006',
      title: '中村産業 工場増築工事',
      customerName: '中村産業株式会社',
      amount: 85000000, // 鉄骨造平屋建て 工場増築 500㎡
      createdAt: '2025-09-05',
      updatedAt: '2025-09-07',
      status: '下書き',
      tags: ['工場', '増築', '鉄骨造']
    },
    {
      id: 'EST-007',
      title: '小林クリニック 内装改修工事',
      customerName: '医療法人小林クリニック',
      amount: 12000000, // クリニック内装全面改修 200㎡
      createdAt: '2025-09-01',
      updatedAt: '2025-09-01',
      status: '受注',
      tags: ['医療施設', '内装改修', 'クリーン']
    },
    {
      id: 'EST-008',
      title: '高橋ビル 外壁改修工事',
      customerName: '高橋不動産開発',
      amount: 35000000, // オフィスビル外壁改修 8階建て
      createdAt: '2025-08-28',
      updatedAt: '2025-08-28',
      status: '提出済み',
      tags: ['オフィス', '外壁改修', '高層']
    },
    {
      id: 'EST-009',
      title: '渡辺邸 バリアフリー改修工事',
      customerName: '渡辺花子',
      amount: 4500000, // バリアフリー改修（浴室・トイレ・廊下・玄関）
      createdAt: '2025-08-21',
      updatedAt: '2025-08-21',
      status: '受注',
      tags: ['バリアフリー', '介護', '補助金']
    },
    {
      id: 'EST-010',
      title: '伊藤物流センター 耐震補強工事',
      customerName: '伊藤物流株式会社',
      amount: 58000000, // 物流倉庫耐震補強 2000㎡
      createdAt: '2025-08-20',
      updatedAt: '2025-08-20',
      status: '交渉中',
      tags: ['耐震', '物流', '安全対策']
    }
  ];

  // フィルタリングとソート
  const filteredEstimates = useMemo(() => {
    let filtered = savedEstimates;

    // ステータスフィルタ
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // ソート
    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'amount':
        return filtered.sort((a, b) => b.amount - a.amount);
      case 'customer':
        return filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
      default:
        return filtered;
    }
  }, [searchTerm, sortBy, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '下書き': return 'bg-gray-100 text-gray-700';
      case '提出済み': return 'bg-blue-100 text-blue-700';
      case '交渉中': return 'bg-yellow-100 text-yellow-700';
      case '受注': return 'bg-green-100 text-green-700';
      case '失注': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-6xl h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">保存済み見積書</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 検索・フィルター */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="見積書名、顧客名、タグで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="下書き">下書き</option>
              <option value="提出済み">提出済み</option>
              <option value="交渉中">交渉中</option>
              <option value="受注">受注</option>
              <option value="失注">失注</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">更新日順</option>
              <option value="amount">金額順</option>
              <option value="customer">顧客名順</option>
            </select>
          </div>
        </div>

        {/* リスト */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4">
            {filteredEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onLoad(estimate)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{estimate.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                        {estimate.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {estimate.customerName}
                      </span>
                      <span className="font-semibold text-gray-800">
                        ¥{estimate.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        更新: {new Date(estimate.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {estimate.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(estimate.id);
                        alert(`見積書ID ${estimate.id} をコピーしました`);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="複製"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`見積書「${estimate.title}」を削除しますか？`)) {
                          alert('削除機能は実装予定です');
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEstimates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">該当する見積書が見つかりません</p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredEstimates.length}件の見積書が見つかりました
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}