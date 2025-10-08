import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST: 契約から工事台帳を自動生成
export async function POST(request: NextRequest) {
  try {
    const tenantId = cookies().get('tenantId')?.value || 'demo-tenant';
    const { contractId } = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // 契約データを取得
    const contractRes = await fetch(`${request.nextUrl.origin}/api/contracts?id=${contractId}`, {
      headers: {
        Cookie: `tenantId=${tenantId}`,
      },
    });

    if (!contractRes.ok) {
      throw new Error('Failed to fetch contract');
    }

    const contractData = await contractRes.json();

    if (!contractData.success || !contractData.contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    const contract = contractData.contract;

    // 工事台帳データの生成
    const constructionLedgerData = {
      tenantId,
      constructionName: contract.projectName,
      constructionType: contract.projectType.split('/')[0] || '一般建築',
      constructionCategory: contract.projectType.split('/')[1] || '一般工事',

      // 顧客情報
      customerId: contract.customerId || 'UNKNOWN',
      customerName: contract.customerName,
      customerCompany: contract.customerCompany,
      customerContact: contract.customerPhone || contract.customerEmail || '',

      // 工事場所（契約の顧客住所を使用）
      constructionAddress: contract.customerAddress || '',
      constructionCity: extractCity(contract.customerAddress || ''),
      constructionPrefecture: extractPrefecture(contract.customerAddress || ''),
      constructionPostalCode: '000-0000', // デフォルト値

      // 工期
      scheduledStartDate: contract.startDate,
      scheduledEndDate: contract.endDate,
      constructionDays: contract.duration,

      // 契約金額
      contractAmount: contract.contractAmount,
      taxAmount: contract.taxAmount,
      totalContractAmount: contract.totalAmount,

      // 見積・契約との紐付け
      estimateId: contract.estimateId,
      estimateNo: contract.estimateNo,
      contractId: contract.id,
      contractNo: contract.contractNo,

      // 実行予算の計算（見積項目がある場合）
      executionBudget: contract.estimateItems
        ? calculateExecutionBudget(contract.estimateItems, contract.totalAmount)
        : undefined,

      // 進捗情報の初期化
      progress: {
        status: 'not_started',
        progressRate: 0,
        completedWorkValue: 0,
        billedAmount: 0,
        receivedAmount: 0,
      },

      // 担当者
      salesPerson: contract.manager || '未設定',
      constructionManager: contract.manager || '未設定',

      // ステータス
      status: 'approved', // 契約から作成する場合は承認済みとする

      // メモ
      notes: contract.notes || '',
      createdBy: cookies().get('userId')?.value || 'system',
    };

    // 工事台帳APIに送信
    const createRes = await fetch(`${request.nextUrl.origin}/api/construction-ledgers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `tenantId=${tenantId}`,
      },
      body: JSON.stringify(constructionLedgerData),
    });

    if (!createRes.ok) {
      throw new Error('Failed to create construction ledger');
    }

    const createData = await createRes.json();

    return NextResponse.json({
      success: true,
      ledger: createData.ledger,
      message: '契約から工事台帳を作成しました',
    });
  } catch (error) {
    console.error('Error creating construction ledger from contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create construction ledger from contract' },
      { status: 500 }
    );
  }
}

// 実行予算の計算
function calculateExecutionBudget(estimateItems: any[], totalContractAmount: number) {
  // 見積項目から原価を集計
  let materialCost = 0;
  let laborCost = 0;
  let outsourcingCost = 0;
  let expenseCost = 0;

  // カテゴリ別に分類（簡易的な分類）
  estimateItems.forEach((item) => {
    const category = item.category.toLowerCase();
    const amount = item.amount;

    if (
      category.includes('材料') ||
      category.includes('資材') ||
      category.includes('設備機器')
    ) {
      materialCost += amount;
    } else if (category.includes('労務') || category.includes('人件費')) {
      laborCost += amount;
    } else if (
      category.includes('外注') ||
      category.includes('工事') ||
      category.includes('基礎') ||
      category.includes('木') ||
      category.includes('屋根') ||
      category.includes('電気') ||
      category.includes('給排水') ||
      category.includes('空調') ||
      category.includes('ガス') ||
      category.includes('外構')
    ) {
      outsourcingCost += amount;
    } else {
      expenseCost += amount;
    }
  });

  const totalBudget = materialCost + laborCost + outsourcingCost + expenseCost;
  const expectedProfit = totalContractAmount - totalBudget;
  const expectedProfitRate = (expectedProfit / totalContractAmount) * 100;

  return {
    materialCost,
    laborCost,
    outsourcingCost,
    expenseCost,
    totalBudget,
    expectedProfit,
    expectedProfitRate,
  };
}

// 住所から都道府県を抽出
function extractPrefecture(address: string): string {
  const prefectures = [
    '北海道',
    '青森県',
    '岩手県',
    '宮城県',
    '秋田県',
    '山形県',
    '福島県',
    '茨城県',
    '栃木県',
    '群馬県',
    '埼玉県',
    '千葉県',
    '東京都',
    '神奈川県',
    '新潟県',
    '富山県',
    '石川県',
    '福井県',
    '山梨県',
    '長野県',
    '岐阜県',
    '静岡県',
    '愛知県',
    '三重県',
    '滋賀県',
    '京都府',
    '大阪府',
    '兵庫県',
    '奈良県',
    '和歌山県',
    '鳥取県',
    '島根県',
    '岡山県',
    '広島県',
    '山口県',
    '徳島県',
    '香川県',
    '愛媛県',
    '高知県',
    '福岡県',
    '佐賀県',
    '長崎県',
    '熊本県',
    '大分県',
    '宮崎県',
    '鹿児島県',
    '沖縄県',
  ];

  for (const pref of prefectures) {
    if (address.includes(pref)) {
      return pref;
    }
  }

  return '東京都'; // デフォルト値
}

// 住所から市区町村を抽出（簡易版）
function extractCity(address: string): string {
  // 都道府県を除去
  const pref = extractPrefecture(address);
  const withoutPref = address.replace(pref, '');

  // 市区町村の候補
  const cityKeywords = ['市', '区', '町', '村'];

  for (const keyword of cityKeywords) {
    const index = withoutPref.indexOf(keyword);
    if (index !== -1) {
      return withoutPref.substring(0, index + 1);
    }
  }

  return ''; // 見つからない場合は空文字
}
