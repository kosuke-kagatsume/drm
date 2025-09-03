// 見積テストデータのセットアップスクリプト
// ブラウザのコンソールで実行してください

// 田中太郎様の見積データ（ID: 1）
const estimateData1 = {
  id: '1',
  estimateNumber: 'EST-2024-001',
  customerName: '田中太郎',
  customerCompany: '田中建設株式会社',
  customerId: '1',
  projectName: '田中様邸 外壁塗装工事',
  projectType: 'reform',
  status: 'pending',
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      no: 1,
      category: '外壁工事',
      itemName: '外壁塗装',
      specification: 'シリコン塗料',
      quantity: 120,
      unit: '㎡',
      unitPrice: 3500,
      amount: 420000,
      costPrice: 2800,
      costAmount: 336000,
      grossProfit: 84000,
      grossProfitRate: 20,
      remarks: '下地処理含む',
    },
    {
      id: 'item-2',
      no: 2,
      category: '屋根工事',
      itemName: '屋根塗装',
      specification: '遮熱塗料',
      quantity: 80,
      unit: '㎡',
      unitPrice: 4000,
      amount: 320000,
      costPrice: 3000,
      costAmount: 240000,
      grossProfit: 80000,
      grossProfitRate: 25,
      remarks: '高耐久性塗料使用',
    },
  ],
  totals: {
    directCost: 740000,
    totalCost: 576000,
    grossProfitAmount: 164000,
    grossProfitRate: 22.16,
  },
};

// 佐藤花子様の見積データ（ID: 2）
const estimateData2 = {
  id: '2',
  estimateNumber: 'EST-2024-002',
  customerName: '佐藤花子',
  customerCompany: '佐藤工務店',
  customerId: '2',
  projectName: 'キッチンリフォーム工事',
  projectType: 'reform',
  status: 'draft',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'item-3',
      no: 1,
      category: 'キッチン工事',
      itemName: 'システムキッチン設置',
      specification: 'LIXIL製 Shiera S',
      quantity: 1,
      unit: '式',
      unitPrice: 1200000,
      amount: 1200000,
      costPrice: 900000,
      costAmount: 900000,
      grossProfit: 300000,
      grossProfitRate: 25,
      remarks: '配管工事含む',
    },
    {
      id: 'item-4',
      no: 2,
      category: '内装工事',
      itemName: 'キッチン壁クロス張替',
      specification: '防汚・防水クロス',
      quantity: 25,
      unit: '㎡',
      unitPrice: 3000,
      amount: 75000,
      costPrice: 2000,
      costAmount: 50000,
      grossProfit: 25000,
      grossProfitRate: 33.33,
      remarks: '下地補修含む',
    },
  ],
  totals: {
    directCost: 1275000,
    totalCost: 950000,
    grossProfitAmount: 325000,
    grossProfitRate: 25.49,
  },
};

// 高橋建設様の見積データ（ID: 3）
const estimateData3 = {
  id: '3',
  estimateNumber: 'EST-2024-003',
  customerName: '高橋一郎',
  customerCompany: '高橋建設',
  customerId: '3',
  projectName: '浴室リフォーム工事',
  projectType: 'reform',
  status: 'negotiating',
  validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: 'item-5',
      no: 1,
      category: '浴室工事',
      itemName: 'ユニットバス設置',
      specification: 'TOTO サザナ 1616サイズ',
      quantity: 1,
      unit: '式',
      unitPrice: 800000,
      amount: 800000,
      costPrice: 600000,
      costAmount: 600000,
      grossProfit: 200000,
      grossProfitRate: 25,
      remarks: '既存浴室解体含む',
    },
  ],
  totals: {
    directCost: 800000,
    totalCost: 600000,
    grossProfitAmount: 200000,
    grossProfitRate: 25.0,
  },
};

// LocalStorageに保存する関数
function saveTestEstimates() {
  // 既存の見積データを保存
  localStorage.setItem('estimate_1', JSON.stringify(estimateData1));
  localStorage.setItem('estimate_2', JSON.stringify(estimateData2));
  localStorage.setItem('estimate_3', JSON.stringify(estimateData3));

  // 見積一覧データも保存
  const estimatesList = [estimateData1, estimateData2, estimateData3];
  localStorage.setItem('estimates_list', JSON.stringify(estimatesList));

  console.log('✅ テスト見積データを保存しました');
  console.log('保存された見積:');
  console.log('- 見積 ID:1 - 田中太郎様 外壁塗装工事（740,000円）');
  console.log('- 見積 ID:2 - 佐藤花子様 キッチンリフォーム（1,275,000円）');
  console.log('- 見積 ID:3 - 高橋一郎様 浴室リフォーム（800,000円）');

  return {
    estimate1: estimateData1,
    estimate2: estimateData2,
    estimate3: estimateData3,
  };
}

// 実行
if (typeof window !== 'undefined') {
  saveTestEstimates();
} else {
  console.log('このスクリプトはブラウザのコンソールで実行してください');
}
