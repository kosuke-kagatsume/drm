// リアルな建設工事見積データ

// EST-001: 新築住宅工事（木造2階建て 延床面積120㎡）
export const newHouseEstimate = {
  id: 'EST-001',
  title: '田中様邸 新築工事',
  customerName: '田中太郎',
  totalAmount: 28500000,
  items: [
    // 仮設工事
    { id: 'cat1', name: '仮設工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '1-1', category: '仮設工事', name: '仮設トイレ', specification: '水洗式 6ヶ月リース', quantity: 1, unit: '式', unitPrice: 180000, amount: 180000, costPrice: 126000, grossProfitRate: 30 },
    { id: '1-2', category: '仮設工事', name: '仮設電気', specification: '仮設分電盤・配線工事', quantity: 1, unit: '式', unitPrice: 85000, amount: 85000, costPrice: 59500, grossProfitRate: 30 },
    { id: '1-3', category: '仮設工事', name: '仮設水道', specification: '給水管仮設工事', quantity: 1, unit: '式', unitPrice: 65000, amount: 65000, costPrice: 45500, grossProfitRate: 30 },
    { id: '1-4', category: '仮設工事', name: '外部足場', specification: 'クサビ足場 280㎡', quantity: 280, unit: '㎡', unitPrice: 1200, amount: 336000, costPrice: 235200, grossProfitRate: 30 },
    { id: '1-5', category: '仮設工事', name: '養生費', specification: 'シート養生・防護ネット', quantity: 1, unit: '式', unitPrice: 120000, amount: 120000, costPrice: 84000, grossProfitRate: 30 },
    { id: '1-6', category: '仮設工事', name: '現場管理費', specification: '安全管理・清掃費', quantity: 6, unit: 'ヶ月', unitPrice: 50000, amount: 300000, costPrice: 210000, grossProfitRate: 30 },
    { id: 'sub1', name: '仮設工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1086000, category: '仮設工事' },

    // 基礎工事
    { id: 'cat2', name: '基礎工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '2-1', category: '基礎工事', name: '地盤調査', specification: 'スウェーデン式サウンディング', quantity: 5, unit: '箇所', unitPrice: 25000, amount: 125000, costPrice: 87500, grossProfitRate: 30 },
    { id: '2-2', category: '基礎工事', name: '地盤改良', specification: '柱状改良 φ600 L=5m', quantity: 25, unit: '本', unitPrice: 45000, amount: 1125000, costPrice: 787500, grossProfitRate: 30 },
    { id: '2-3', category: '基礎工事', name: '根切り工事', specification: '機械掘削・残土処分', quantity: 85, unit: '㎥', unitPrice: 3500, amount: 297500, costPrice: 208250, grossProfitRate: 30 },
    { id: '2-4', category: '基礎工事', name: '砕石地業', specification: '再生砕石 t=150', quantity: 75, unit: '㎡', unitPrice: 2800, amount: 210000, costPrice: 147000, grossProfitRate: 30 },
    { id: '2-5', category: '基礎工事', name: '防湿シート', specification: '0.15mm厚', quantity: 75, unit: '㎡', unitPrice: 850, amount: 63750, costPrice: 44625, grossProfitRate: 30 },
    { id: '2-6', category: '基礎工事', name: '捨てコンクリート', specification: 'FC18 t=50', quantity: 75, unit: '㎡', unitPrice: 3200, amount: 240000, costPrice: 168000, grossProfitRate: 30 },
    { id: '2-7', category: '基礎工事', name: '基礎配筋', specification: 'D13 @200', quantity: 2.8, unit: 't', unitPrice: 180000, amount: 504000, costPrice: 352800, grossProfitRate: 30 },
    { id: '2-8', category: '基礎工事', name: '基礎型枠', specification: '合板型枠', quantity: 120, unit: '㎡', unitPrice: 4500, amount: 540000, costPrice: 378000, grossProfitRate: 30 },
    { id: '2-9', category: '基礎工事', name: '基礎コンクリート', specification: 'FC24 S15', quantity: 32, unit: '㎥', unitPrice: 18000, amount: 576000, costPrice: 403200, grossProfitRate: 30 },
    { id: 'sub2', name: '基礎工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 3681250, category: '基礎工事' },

    // 木工事
    { id: 'cat3', name: '木工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '3-1', category: '木工事', name: '土台', specification: 'ヒノキ 120角 防腐処理', quantity: 45, unit: 'm', unitPrice: 4800, amount: 216000, costPrice: 151200, grossProfitRate: 30 },
    { id: '3-2', category: '木工事', name: '大引', specification: '米松 90角 @910', quantity: 85, unit: 'm', unitPrice: 2200, amount: 187000, costPrice: 130900, grossProfitRate: 30 },
    { id: '3-3', category: '木工事', name: '柱', specification: 'スギ集成材 120角', quantity: 42, unit: '本', unitPrice: 12000, amount: 504000, costPrice: 352800, grossProfitRate: 30 },
    { id: '3-4', category: '木工事', name: '梁・桁', specification: '米松集成材', quantity: 8.5, unit: '㎥', unitPrice: 95000, amount: 807500, costPrice: 565250, grossProfitRate: 30 },
    { id: '3-5', category: '木工事', name: '筋交い', specification: '45×90 スギ', quantity: 120, unit: 'm', unitPrice: 1200, amount: 144000, costPrice: 100800, grossProfitRate: 30 },
    { id: '3-6', category: '木工事', name: '構造用合板', specification: 't=24 床・壁', quantity: 280, unit: '枚', unitPrice: 3800, amount: 1064000, costPrice: 744800, grossProfitRate: 30 },
    { id: '3-7', category: '木工事', name: '垂木', specification: '45×60 @455', quantity: 180, unit: 'm', unitPrice: 650, amount: 117000, costPrice: 81900, grossProfitRate: 30 },
    { id: '3-8', category: '木工事', name: '野地板', specification: 't=12 構造用合板', quantity: 95, unit: '枚', unitPrice: 2200, amount: 209000, costPrice: 146300, grossProfitRate: 30 },
    { id: '3-9', category: '木工事', name: '造作材', specification: '窓枠・廻り縁等', quantity: 1, unit: '式', unitPrice: 380000, amount: 380000, costPrice: 266000, grossProfitRate: 30 },
    { id: '3-10', category: '木工事', name: '金物', specification: '構造金物一式', quantity: 1, unit: '式', unitPrice: 450000, amount: 450000, costPrice: 315000, grossProfitRate: 30 },
    { id: '3-11', category: '木工事', name: '大工手間', specification: '建方・造作工事', quantity: 120, unit: '㎡', unitPrice: 18000, amount: 2160000, costPrice: 1512000, grossProfitRate: 30 },
    { id: 'sub3', name: '木工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 6238500, category: '木工事' },

    // 屋根工事
    { id: 'cat4', name: '屋根工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '4-1', category: '屋根工事', name: 'アスファルトルーフィング', specification: '改質アスファルト', quantity: 95, unit: '㎡', unitPrice: 1800, amount: 171000, costPrice: 119700, grossProfitRate: 30 },
    { id: '4-2', category: '屋根工事', name: 'ガルバリウム鋼板', specification: '立平葺き t=0.35', quantity: 95, unit: '㎡', unitPrice: 7500, amount: 712500, costPrice: 498750, grossProfitRate: 30 },
    { id: '4-3', category: '屋根工事', name: '棟包み', specification: 'ガルバリウム鋼板', quantity: 12, unit: 'm', unitPrice: 4500, amount: 54000, costPrice: 37800, grossProfitRate: 30 },
    { id: '4-4', category: '屋根工事', name: '軒先唐草', specification: 'ガルバリウム鋼板', quantity: 28, unit: 'm', unitPrice: 2800, amount: 78400, costPrice: 54880, grossProfitRate: 30 },
    { id: '4-5', category: '屋根工事', name: '雨樋', specification: '軒樋・竪樋 塩ビ製', quantity: 1, unit: '式', unitPrice: 185000, amount: 185000, costPrice: 129500, grossProfitRate: 30 },
    { id: 'sub4', name: '屋根工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1200900, category: '屋根工事' },

    // 外壁工事
    { id: 'cat5', name: '外壁工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '5-1', category: '外壁工事', name: '透湿防水シート', specification: 'タイベック等', quantity: 180, unit: '㎡', unitPrice: 650, amount: 117000, costPrice: 81900, grossProfitRate: 30 },
    { id: '5-2', category: '外壁工事', name: '通気胴縁', specification: '18×45 @455', quantity: 420, unit: 'm', unitPrice: 380, amount: 159600, costPrice: 111720, grossProfitRate: 30 },
    { id: '5-3', category: '外壁工事', name: '窯業系サイディング', specification: '16mm ニチハ等', quantity: 180, unit: '㎡', unitPrice: 6800, amount: 1224000, costPrice: 856800, grossProfitRate: 30 },
    { id: '5-4', category: '外壁工事', name: 'シーリング', specification: '変性シリコン', quantity: 180, unit: 'm', unitPrice: 1200, amount: 216000, costPrice: 151200, grossProfitRate: 30 },
    { id: '5-5', category: '外壁工事', name: '軒天', specification: 'ケイカル板 t=8', quantity: 35, unit: '㎡', unitPrice: 3800, amount: 133000, costPrice: 93100, grossProfitRate: 30 },
    { id: '5-6', category: '外壁工事', name: '破風板', specification: 'ガルバリウム鋼板', quantity: 28, unit: 'm', unitPrice: 4200, amount: 117600, costPrice: 82320, grossProfitRate: 30 },
    { id: 'sub5', name: '外壁工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1967200, category: '外壁工事' },

    // 断熱工事
    { id: 'cat6', name: '断熱工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '6-1', category: '断熱工事', name: '床断熱材', specification: '押出法ポリスチレン t=90', quantity: 65, unit: '㎡', unitPrice: 3500, amount: 227500, costPrice: 159250, grossProfitRate: 30 },
    { id: '6-2', category: '断熱工事', name: '壁断熱材', specification: 'グラスウール16K t=100', quantity: 150, unit: '㎡', unitPrice: 2800, amount: 420000, costPrice: 294000, grossProfitRate: 30 },
    { id: '6-3', category: '断熱工事', name: '天井断熱材', specification: 'グラスウール t=200', quantity: 65, unit: '㎡', unitPrice: 3200, amount: 208000, costPrice: 145600, grossProfitRate: 30 },
    { id: '6-4', category: '断熱工事', name: '気密シート', specification: '防湿気密シート', quantity: 280, unit: '㎡', unitPrice: 450, amount: 126000, costPrice: 88200, grossProfitRate: 30 },
    { id: 'sub6', name: '断熱工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 981500, category: '断熱工事' },

    // 建具工事
    { id: 'cat7', name: '建具工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '7-1', category: '建具工事', name: '玄関ドア', specification: 'YKK AP 断熱ドア', quantity: 1, unit: '箇所', unitPrice: 280000, amount: 280000, costPrice: 196000, grossProfitRate: 30 },
    { id: '7-2', category: '建具工事', name: '掃出し窓', specification: 'Low-Eペアガラス W1800×H2000', quantity: 2, unit: '箇所', unitPrice: 125000, amount: 250000, costPrice: 175000, grossProfitRate: 30 },
    { id: '7-3', category: '建具工事', name: '引違い窓', specification: 'Low-Eペアガラス W1650×H1200', quantity: 4, unit: '箇所', unitPrice: 68000, amount: 272000, costPrice: 190400, grossProfitRate: 30 },
    { id: '7-4', category: '建具工事', name: '腰窓', specification: 'Low-Eペアガラス W1200×H900', quantity: 3, unit: '箇所', unitPrice: 45000, amount: 135000, costPrice: 94500, grossProfitRate: 30 },
    { id: '7-5', category: '建具工事', name: 'FIX窓', specification: 'Low-Eペアガラス W600×H900', quantity: 2, unit: '箇所', unitPrice: 35000, amount: 70000, costPrice: 49000, grossProfitRate: 30 },
    { id: '7-6', category: '建具工事', name: '勝手口ドア', specification: 'アルミドア ガラス入り', quantity: 1, unit: '箇所', unitPrice: 85000, amount: 85000, costPrice: 59500, grossProfitRate: 30 },
    { id: '7-7', category: '建具工事', name: '室内建具', specification: '片開きドア', quantity: 8, unit: '箇所', unitPrice: 38000, amount: 304000, costPrice: 212800, grossProfitRate: 30 },
    { id: '7-8', category: '建具工事', name: '室内引戸', specification: '片引き戸', quantity: 3, unit: '箇所', unitPrice: 52000, amount: 156000, costPrice: 109200, grossProfitRate: 30 },
    { id: '7-9', category: '建具工事', name: '収納建具', specification: '折戸 W1800', quantity: 4, unit: '箇所', unitPrice: 42000, amount: 168000, costPrice: 117600, grossProfitRate: 30 },
    { id: '7-10', category: '建具工事', name: 'シャッター', specification: '電動シャッター W1800', quantity: 2, unit: '箇所', unitPrice: 180000, amount: 360000, costPrice: 252000, grossProfitRate: 30 },
    { id: 'sub7', name: '建具工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 2080000, category: '建具工事' },

    // 内装工事
    { id: 'cat8', name: '内装工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '8-1', category: '内装工事', name: '石膏ボード', specification: 't=12.5 壁・天井', quantity: 420, unit: '㎡', unitPrice: 1200, amount: 504000, costPrice: 352800, grossProfitRate: 30 },
    { id: '8-2', category: '内装工事', name: 'クロス下地処理', specification: 'パテ処理', quantity: 420, unit: '㎡', unitPrice: 850, amount: 357000, costPrice: 249900, grossProfitRate: 30 },
    { id: '8-3', category: '内装工事', name: '壁クロス', specification: '量産クロス AA級', quantity: 320, unit: '㎡', unitPrice: 1800, amount: 576000, costPrice: 403200, grossProfitRate: 30 },
    { id: '8-4', category: '内装工事', name: '天井クロス', specification: '量産クロス AA級', quantity: 100, unit: '㎡', unitPrice: 1800, amount: 180000, costPrice: 126000, grossProfitRate: 30 },
    { id: '8-5', category: '内装工事', name: 'フローリング', specification: '複合フローリング t=12', quantity: 95, unit: '㎡', unitPrice: 8500, amount: 807500, costPrice: 565250, grossProfitRate: 30 },
    { id: '8-6', category: '内装工事', name: 'クッションフロア', specification: '住宅用CF t=1.8', quantity: 12, unit: '㎡', unitPrice: 3200, amount: 38400, costPrice: 26880, grossProfitRate: 30 },
    { id: '8-7', category: '内装工事', name: '巾木', specification: 'MDF製 H=60', quantity: 120, unit: 'm', unitPrice: 850, amount: 102000, costPrice: 71400, grossProfitRate: 30 },
    { id: '8-8', category: '内装工事', name: '廻り縁', specification: '塩ビ製', quantity: 95, unit: 'm', unitPrice: 650, amount: 61750, costPrice: 43225, grossProfitRate: 30 },
    { id: '8-9', category: '内装工事', name: '階段', specification: '集成材 13段', quantity: 1, unit: '式', unitPrice: 380000, amount: 380000, costPrice: 266000, grossProfitRate: 30 },
    { id: '8-10', category: '内装工事', name: '手摺', specification: '階段手摺・壁付', quantity: 1, unit: '式', unitPrice: 85000, amount: 85000, costPrice: 59500, grossProfitRate: 30 },
    { id: 'sub8', name: '内装工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 3091650, category: '内装工事' },

    // 設備工事（給排水・電気・空調）
    { id: 'cat9', name: '設備工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '9-1', category: '設備工事', name: 'システムキッチン', specification: 'LIXIL シエラS I型2550', quantity: 1, unit: 'セット', unitPrice: 850000, amount: 850000, costPrice: 595000, grossProfitRate: 30 },
    { id: '9-2', category: '設備工事', name: 'IHクッキングヒーター', specification: '3口 パナソニック製', quantity: 1, unit: '台', unitPrice: 180000, amount: 180000, costPrice: 126000, grossProfitRate: 30 },
    { id: '9-3', category: '設備工事', name: 'レンジフード', specification: '同時給排 W750', quantity: 1, unit: '台', unitPrice: 95000, amount: 95000, costPrice: 66500, grossProfitRate: 30 },
    { id: '9-4', category: '設備工事', name: 'ユニットバス', specification: 'TOTO サザナ 1616', quantity: 1, unit: 'セット', unitPrice: 980000, amount: 980000, costPrice: 686000, grossProfitRate: 30 },
    { id: '9-5', category: '設備工事', name: '洗面化粧台', specification: 'LIXIL ピアラ W750', quantity: 1, unit: '台', unitPrice: 185000, amount: 185000, costPrice: 129500, grossProfitRate: 30 },
    { id: '9-6', category: '設備工事', name: 'トイレ', specification: 'TOTO ピュアレストQR タンクレス', quantity: 2, unit: '台', unitPrice: 220000, amount: 440000, costPrice: 308000, grossProfitRate: 30 },
    { id: '9-7', category: '設備工事', name: '給水配管', specification: 'ポリ管 保温付', quantity: 1, unit: '式', unitPrice: 380000, amount: 380000, costPrice: 266000, grossProfitRate: 30 },
    { id: '9-8', category: '設備工事', name: '排水配管', specification: 'VP管・VU管', quantity: 1, unit: '式', unitPrice: 320000, amount: 320000, costPrice: 224000, grossProfitRate: 30 },
    { id: '9-9', category: '設備工事', name: '給湯器', specification: 'エコキュート 370L', quantity: 1, unit: '台', unitPrice: 450000, amount: 450000, costPrice: 315000, grossProfitRate: 30 },
    { id: '9-10', category: '設備工事', name: '電気配線', specification: 'VVFケーブル・配管', quantity: 1, unit: '式', unitPrice: 580000, amount: 580000, costPrice: 406000, grossProfitRate: 30 },
    { id: '9-11', category: '設備工事', name: '分電盤', specification: '単相3線式 20回路', quantity: 1, unit: '面', unitPrice: 85000, amount: 85000, costPrice: 59500, grossProfitRate: 30 },
    { id: '9-12', category: '設備工事', name: 'スイッチ・コンセント', specification: 'パナソニック製', quantity: 45, unit: '個', unitPrice: 3800, amount: 171000, costPrice: 119700, grossProfitRate: 30 },
    { id: '9-13', category: '設備工事', name: '照明器具', specification: 'LED照明一式', quantity: 1, unit: '式', unitPrice: 280000, amount: 280000, costPrice: 196000, grossProfitRate: 30 },
    { id: '9-14', category: '設備工事', name: 'エアコン', specification: '6畳用×3台、14畳用×1台', quantity: 1, unit: '式', unitPrice: 480000, amount: 480000, costPrice: 336000, grossProfitRate: 30 },
    { id: '9-15', category: '設備工事', name: '24時間換気システム', specification: '第3種換気', quantity: 1, unit: '式', unitPrice: 185000, amount: 185000, costPrice: 129500, grossProfitRate: 30 },
    { id: '9-16', category: '設備工事', name: 'TV・通信配線', specification: 'アンテナ・LAN配線', quantity: 1, unit: '式', unitPrice: 120000, amount: 120000, costPrice: 84000, grossProfitRate: 30 },
    { id: 'sub9', name: '設備工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 5781000, category: '設備工事' },

    // 外構工事
    { id: 'cat10', name: '外構工事', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '10-1', category: '外構工事', name: '土間コンクリート', specification: 't=100 ワイヤーメッシュ入', quantity: 45, unit: '㎡', unitPrice: 8500, amount: 382500, costPrice: 267750, grossProfitRate: 30 },
    { id: '10-2', category: '外構工事', name: 'カーポート', specification: '2台用 ポリカ屋根', quantity: 1, unit: '基', unitPrice: 580000, amount: 580000, costPrice: 406000, grossProfitRate: 30 },
    { id: '10-3', category: '外構工事', name: 'フェンス', specification: 'メッシュフェンス H1200', quantity: 35, unit: 'm', unitPrice: 12000, amount: 420000, costPrice: 294000, grossProfitRate: 30 },
    { id: '10-4', category: '外構工事', name: '門扉', specification: 'アルミ製 両開き', quantity: 1, unit: '基', unitPrice: 180000, amount: 180000, costPrice: 126000, grossProfitRate: 30 },
    { id: '10-5', category: '外構工事', name: '門柱', specification: '機能門柱 ポスト・表札付', quantity: 1, unit: '基', unitPrice: 85000, amount: 85000, costPrice: 59500, grossProfitRate: 30 },
    { id: '10-6', category: '外構工事', name: 'アプローチ', specification: 'インターロッキング', quantity: 12, unit: '㎡', unitPrice: 9500, amount: 114000, costPrice: 79800, grossProfitRate: 30 },
    { id: '10-7', category: '外構工事', name: '植栽', specification: 'シンボルツリー・低木', quantity: 1, unit: '式', unitPrice: 120000, amount: 120000, costPrice: 84000, grossProfitRate: 30 },
    { id: 'sub10', name: '外構工事 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 1881500, category: '外構工事' },

    // 諸経費
    { id: 'cat11', name: '諸経費', isCategory: true, quantity: 0, unit: '', unitPrice: 0, amount: 0 },
    { id: '11-1', category: '諸経費', name: '現場管理費', specification: '現場監督人件費等', quantity: 1, unit: '式', unitPrice: 1200000, amount: 1200000, costPrice: 1200000, grossProfitRate: 0 },
    { id: '11-2', category: '諸経費', name: '一般管理費', specification: '本社経費等', quantity: 1, unit: '式', unitPrice: 800000, amount: 800000, costPrice: 800000, grossProfitRate: 0 },
    { id: '11-3', category: '諸経費', name: '法定福利費', specification: '社会保険料事業主負担分', quantity: 1, unit: '式', unitPrice: 350000, amount: 350000, costPrice: 350000, grossProfitRate: 0 },
    { id: 'sub11', name: '諸経費 小計', isSubtotal: true, quantity: 0, unit: '', unitPrice: 0, amount: 2350000, category: '諸経費' },
  ]
};

// EST-002: 大型リフォーム工事（築30年戸建て全面改修）
export const largeRenovationEstimate = {
  id: 'EST-002',
  title: '山田様邸 全面リフォーム工事',
  customerName: '山田花子',
  totalAmount: 18500000,
  items: [
    // 解体工事
    { id: 'cat1', name: '解体工事', isCategory: true },
    { id: '1-1', category: '解体工事', name: '内装解体', specification: '壁・天井・床材撤去', quantity: 180, unit: '㎡', unitPrice: 3500, amount: 630000, costPrice: 441000 },
    { id: '1-2', category: '解体工事', name: 'キッチン解体', specification: '既存システムキッチン撤去', quantity: 1, unit: '式', unitPrice: 85000, amount: 85000, costPrice: 59500 },
    { id: '1-3', category: '解体工事', name: '浴室解体', specification: '在来浴室解体', quantity: 1, unit: '式', unitPrice: 120000, amount: 120000, costPrice: 84000 },
    { id: '1-4', category: '解体工事', name: 'トイレ解体', specification: '便器・内装撤去', quantity: 2, unit: '箇所', unitPrice: 35000, amount: 70000, costPrice: 49000 },
    { id: '1-5', category: '解体工事', name: '建具撤去', specification: '室内建具・サッシ', quantity: 15, unit: '箇所', unitPrice: 8000, amount: 120000, costPrice: 84000 },
    { id: '1-6', category: '解体工事', name: '廃材処分', specification: '産廃処理費込み', quantity: 15, unit: '㎥', unitPrice: 25000, amount: 375000, costPrice: 262500 },
    { id: 'sub1', name: '解体工事 小計', isSubtotal: true, amount: 1400000 },

    // 続く...（以降も同様に詳細な項目を追加）
  ]
};