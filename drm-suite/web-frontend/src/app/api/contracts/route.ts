import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 契約書型定義
export interface Contract {
  id: string;
  tenantId: string;
  // 見積との紐付け
  estimateId: string;
  estimateNo: string;
  // 基本情報
  contractNo: string;
  contractDate: string;
  projectName: string;
  projectType: string;
  // 顧客情報
  customerId?: string; // 顧客ID（Phase 10で追加）
  customerName: string;
  customerCompany?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  // 契約内容
  contractType:
    | 'construction'
    | 'subcontract'
    | 'maintenance'
    | 'lease'
    | 'consulting';
  contractAmount: number;
  taxAmount: number;
  totalAmount: number;
  // 工期
  startDate: string;
  endDate: string;
  duration: number; // 日数
  // 支払条件
  paymentTerms: string;
  paymentSchedule?: {
    phase: string;
    percentage: number;
    amount: number;
    dueDate: string;
  }[];
  // 契約条項（見積項目から自動生成）
  clauses: {
    title: string;
    content: string;
  }[];
  // 見積の詳細項目（発注時に使用）
  estimateItems?: {
    category: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
    notes?: string;
  }[];
  // ステータス
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'signed'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalFlowId?: string;
  // 担当者
  manager: string;
  managerId?: string;
  // メタデータ
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
  signedAt?: string;
  completedAt?: string;
  // 添付ファイル
  attachments?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  // メモ
  notes?: string;
}

// メモリ内データストア
let contracts: Map<string, Contract[]> = new Map();

// 初期サンプルデータ
const initializeSampleData = () => {
  const demoTenantId = 'demo-tenant';
  const sampleContracts: Contract[] = [
    {
      id: 'CON-2024-001',
      tenantId: demoTenantId,
      estimateId: 'EST-2024-001',
      estimateNo: 'EST-2024-001',
      contractNo: 'CON-2024-001',
      contractDate: '2024-07-01',
      projectName: '田中様邸新築工事',
      projectType: '新築/一戸建て',
      customerName: '田中太郎',
      customerCompany: '',
      customerAddress: '東京都新宿区',
      customerPhone: '03-1234-5678',
      customerEmail: 'tanaka@example.com',
      contractType: 'construction',
      contractAmount: 32000000,
      taxAmount: 3200000,
      totalAmount: 35000000,
      startDate: '2024-07-15',
      endDate: '2024-12-15',
      duration: 153,
      paymentTerms: '3回分割払い：着工時30%、上棟時40%、引渡時30%',
      clauses: [
        { title: '第1条 工事内容', content: '木造2階建て住宅新築工事一式' },
        { title: '第2条 工期', content: '2024年7月15日から2024年12月15日まで' },
        { title: '第3条 契約金額', content: '税込35,000,000円' },
      ],
      estimateItems: [
        {
          category: '仮設工事',
          name: '足場工事',
          quantity: 150,
          unit: 'm2',
          unitPrice: 1500,
          amount: 225000,
        },
        {
          category: '仮設工事',
          name: '養生・安全設備',
          quantity: 1,
          unit: '式',
          unitPrice: 180000,
          amount: 180000,
        },
        {
          category: '土工事',
          name: '掘削工事',
          quantity: 80,
          unit: 'm3',
          unitPrice: 3500,
          amount: 280000,
        },
        {
          category: '土工事',
          name: '残土処分',
          quantity: 80,
          unit: 'm3',
          unitPrice: 4000,
          amount: 320000,
        },
        {
          category: '基礎工事',
          name: 'べた基礎工事',
          quantity: 100,
          unit: 'm2',
          unitPrice: 15000,
          amount: 1500000,
        },
        {
          category: '基礎工事',
          name: '基礎配筋工事',
          quantity: 2,
          unit: 't',
          unitPrice: 250000,
          amount: 500000,
        },
        {
          category: 'コンクリート工事',
          name: '生コン打設',
          quantity: 25,
          unit: 'm3',
          unitPrice: 18000,
          amount: 450000,
        },
        {
          category: '型枠工事',
          name: '基礎型枠',
          quantity: 60,
          unit: 'm2',
          unitPrice: 3500,
          amount: 210000,
        },
        {
          category: '木工事',
          name: '土台・大引',
          quantity: 1,
          unit: '式',
          unitPrice: 450000,
          amount: 450000,
        },
        {
          category: '木工事',
          name: '柱・梁・桁',
          quantity: 1,
          unit: '式',
          unitPrice: 1800000,
          amount: 1800000,
        },
        {
          category: '木工事',
          name: '小屋組・垂木',
          quantity: 1,
          unit: '式',
          unitPrice: 600000,
          amount: 600000,
        },
        {
          category: '木工事',
          name: '床下地',
          quantity: 150,
          unit: 'm2',
          unitPrice: 4500,
          amount: 675000,
        },
        {
          category: '木工事',
          name: '壁下地',
          quantity: 250,
          unit: 'm2',
          unitPrice: 3200,
          amount: 800000,
        },
        {
          category: '木工事',
          name: '天井下地',
          quantity: 150,
          unit: 'm2',
          unitPrice: 3500,
          amount: 525000,
        },
        {
          category: '屋根工事',
          name: '野地板',
          quantity: 180,
          unit: 'm2',
          unitPrice: 2000,
          amount: 360000,
        },
        {
          category: '屋根工事',
          name: 'ルーフィング',
          quantity: 180,
          unit: 'm2',
          unitPrice: 800,
          amount: 144000,
        },
        {
          category: '屋根工事',
          name: 'ガルバリウム鋼板',
          quantity: 180,
          unit: 'm2',
          unitPrice: 6500,
          amount: 1170000,
        },
        {
          category: '板金工事',
          name: '雨樋工事',
          quantity: 50,
          unit: 'm',
          unitPrice: 4500,
          amount: 225000,
        },
        {
          category: '板金工事',
          name: '棟板金・水切り',
          quantity: 1,
          unit: '式',
          unitPrice: 180000,
          amount: 180000,
        },
        {
          category: '防水工事',
          name: 'バルコニー防水',
          quantity: 15,
          unit: 'm2',
          unitPrice: 8500,
          amount: 127500,
        },
        {
          category: '防水工事',
          name: '基礎防水',
          quantity: 1,
          unit: '式',
          unitPrice: 150000,
          amount: 150000,
        },
        {
          category: '断熱工事',
          name: '壁断熱材',
          quantity: 250,
          unit: 'm2',
          unitPrice: 2800,
          amount: 700000,
        },
        {
          category: '断熱工事',
          name: '天井断熱材',
          quantity: 150,
          unit: 'm2',
          unitPrice: 3200,
          amount: 480000,
        },
        {
          category: '外壁工事',
          name: 'サイディング工事',
          quantity: 280,
          unit: 'm2',
          unitPrice: 7500,
          amount: 2100000,
        },
        {
          category: '外壁工事',
          name: 'コーキング工事',
          quantity: 150,
          unit: 'm',
          unitPrice: 1200,
          amount: 180000,
        },
        {
          category: '左官工事',
          name: '内部左官',
          quantity: 1,
          unit: '式',
          unitPrice: 350000,
          amount: 350000,
        },
        {
          category: '建具工事',
          name: 'アルミサッシ',
          quantity: 1,
          unit: '式',
          unitPrice: 850000,
          amount: 850000,
        },
        {
          category: '建具工事',
          name: '玄関ドア',
          quantity: 1,
          unit: '箇所',
          unitPrice: 250000,
          amount: 250000,
        },
        {
          category: '建具工事',
          name: '内部建具',
          quantity: 12,
          unit: '箇所',
          unitPrice: 45000,
          amount: 540000,
        },
        {
          category: '内装工事',
          name: '壁クロス貼り',
          quantity: 350,
          unit: 'm2',
          unitPrice: 1500,
          amount: 525000,
        },
        {
          category: '内装工事',
          name: '天井クロス貼り',
          quantity: 150,
          unit: 'm2',
          unitPrice: 1800,
          amount: 270000,
        },
        {
          category: '内装工事',
          name: 'フローリング',
          quantity: 120,
          unit: 'm2',
          unitPrice: 8500,
          amount: 1020000,
        },
        {
          category: '内装工事',
          name: 'CFシート',
          quantity: 30,
          unit: 'm2',
          unitPrice: 3500,
          amount: 105000,
        },
        {
          category: '塗装工事',
          name: '内部塗装',
          quantity: 1,
          unit: '式',
          unitPrice: 280000,
          amount: 280000,
        },
        {
          category: '塗装工事',
          name: '外部塗装',
          quantity: 1,
          unit: '式',
          unitPrice: 320000,
          amount: 320000,
        },
        {
          category: '電気工事',
          name: '電気配線工事',
          quantity: 1,
          unit: '式',
          unitPrice: 650000,
          amount: 650000,
        },
        {
          category: '電気工事',
          name: '照明器具',
          quantity: 1,
          unit: '式',
          unitPrice: 380000,
          amount: 380000,
        },
        {
          category: '電気工事',
          name: 'コンセント・スイッチ',
          quantity: 1,
          unit: '式',
          unitPrice: 220000,
          amount: 220000,
        },
        {
          category: '電気工事',
          name: '分電盤',
          quantity: 1,
          unit: '台',
          unitPrice: 85000,
          amount: 85000,
        },
        {
          category: '給排水工事',
          name: '給水配管工事',
          quantity: 1,
          unit: '式',
          unitPrice: 420000,
          amount: 420000,
        },
        {
          category: '給排水工事',
          name: '排水配管工事',
          quantity: 1,
          unit: '式',
          unitPrice: 380000,
          amount: 380000,
        },
        {
          category: '給排水工事',
          name: '衛生器具設置',
          quantity: 1,
          unit: '式',
          unitPrice: 650000,
          amount: 650000,
        },
        {
          category: '空調工事',
          name: 'エアコン工事',
          quantity: 4,
          unit: '台',
          unitPrice: 95000,
          amount: 380000,
        },
        {
          category: '空調工事',
          name: '換気設備',
          quantity: 1,
          unit: '式',
          unitPrice: 280000,
          amount: 280000,
        },
        {
          category: 'ガス工事',
          name: 'ガス配管工事',
          quantity: 1,
          unit: '式',
          unitPrice: 180000,
          amount: 180000,
        },
        {
          category: '設備機器',
          name: 'システムキッチン',
          quantity: 1,
          unit: '台',
          unitPrice: 1200000,
          amount: 1200000,
        },
        {
          category: '設備機器',
          name: 'ユニットバス',
          quantity: 1,
          unit: '台',
          unitPrice: 850000,
          amount: 850000,
        },
        {
          category: '設備機器',
          name: '洗面化粧台',
          quantity: 2,
          unit: '台',
          unitPrice: 120000,
          amount: 240000,
        },
        {
          category: '設備機器',
          name: 'トイレ',
          quantity: 2,
          unit: '台',
          unitPrice: 150000,
          amount: 300000,
        },
        {
          category: '設備機器',
          name: '給湯器',
          quantity: 1,
          unit: '台',
          unitPrice: 280000,
          amount: 280000,
        },
        {
          category: '外構工事',
          name: 'アプローチ工事',
          quantity: 20,
          unit: 'm2',
          unitPrice: 12000,
          amount: 240000,
        },
        {
          category: '外構工事',
          name: 'カーポート',
          quantity: 1,
          unit: '台',
          unitPrice: 350000,
          amount: 350000,
        },
        {
          category: '外構工事',
          name: 'フェンス工事',
          quantity: 25,
          unit: 'm',
          unitPrice: 15000,
          amount: 375000,
        },
        {
          category: '外構工事',
          name: '植栽工事',
          quantity: 1,
          unit: '式',
          unitPrice: 180000,
          amount: 180000,
        },
        {
          category: '諸経費',
          name: '現場管理費',
          quantity: 1,
          unit: '式',
          unitPrice: 1200000,
          amount: 1200000,
        },
        {
          category: '諸経費',
          name: '設計監理費',
          quantity: 1,
          unit: '式',
          unitPrice: 800000,
          amount: 800000,
        },
      ],
      status: 'in_progress',
      approvalStatus: 'approved',
      manager: '山田次郎',
      managerId: 'USR-001',
      createdAt: '2024-07-01T09:00:00Z',
      createdBy: '山田次郎',
      updatedAt: '2024-07-01T09:00:00Z',
      signedAt: '2024-07-01T14:00:00Z',
      notes: '順調に進行中',
    },
    {
      id: 'CON-2024-002',
      tenantId: demoTenantId,
      estimateId: 'EST-2024-002',
      estimateNo: 'EST-2024-002',
      contractNo: 'CON-2024-002',
      contractDate: '2024-07-15',
      projectName: '山田ビル改修工事',
      projectType: '改修/単価契約',
      customerName: '山田商事株式会社',
      customerCompany: '山田商事株式会社',
      customerAddress: '東京都渋谷区',
      customerPhone: '03-5555-6666',
      customerEmail: 'info@yamada-corp.co.jp',
      contractType: 'construction',
      contractAmount: 59000000,
      taxAmount: 6000000,
      totalAmount: 65000000,
      startDate: '2024-08-01',
      endDate: '2025-01-31',
      duration: 184,
      paymentTerms: '月末締め翌月末払い',
      clauses: [
        {
          title: '第1条 工事内容',
          content: 'ビル改修工事一式（外装・内装・設備）',
        },
        { title: '第2条 工期', content: '2024年8月1日から2025年1月31日まで' },
        { title: '第3条 契約金額', content: '税込65,000,000円' },
      ],
      status: 'signed',
      approvalStatus: 'approved',
      manager: '佐藤健一',
      managerId: 'USR-002',
      createdAt: '2024-07-15T10:00:00Z',
      createdBy: '佐藤健一',
      updatedAt: '2024-07-15T10:00:00Z',
      signedAt: '2024-07-15T15:30:00Z',
      notes: '未払い',
    },
    {
      id: 'CON-2024-004',
      tenantId: demoTenantId,
      estimateId: 'EST-2024-004',
      estimateNo: 'EST-2024-004',
      contractNo: 'CON-2024-004',
      contractDate: '2024-08-10',
      projectName: '鈴木マンション外装塗装',
      projectType: '塗装/一括請負',
      customerName: '鈴木不動産管理株式会社',
      customerCompany: '鈴木不動産管理株式会社',
      customerAddress: '東京都世田谷区',
      customerPhone: '03-7777-8888',
      customerEmail: 'suzuki-fm@example.com',
      contractType: 'construction',
      contractAmount: 11000000,
      taxAmount: 1000000,
      totalAmount: 12000000,
      startDate: '2024-09-01',
      endDate: '2024-11-30',
      duration: 91,
      paymentTerms: '完了後一括払い、約3ヶ月間',
      clauses: [
        { title: '第1条 工事内容', content: 'マンション外装塗装工事一式' },
        { title: '第2条 工期', content: '2024年9月1日から2024年11月30日まで' },
        { title: '第3条 契約金額', content: '税込12,000,000円' },
      ],
      status: 'pending_approval',
      manager: '鈴木花子',
      managerId: 'USR-003',
      createdAt: '2024-08-10T11:00:00Z',
      createdBy: '鈴木花子',
      updatedAt: '2024-08-10T11:00:00Z',
      notes: '承認待ち',
    },
    {
      id: 'CON-2024-005',
      tenantId: demoTenantId,
      estimateId: 'EST-2024-005',
      estimateNo: 'EST-2024-005',
      contractNo: 'CON-2024-005',
      contractDate: '2024-08-20',
      projectName: '高橋工場増築工事',
      projectType: '新築/コストプラス',
      customerName: '高橋製作所株式会社',
      customerCompany: '高橋製作所株式会社',
      customerAddress: '神奈川県横浜市',
      customerPhone: '045-1111-2222',
      customerEmail: 'takahashi-factory@example.com',
      contractType: 'construction',
      contractAmount: 113000000,
      taxAmount: 12000000,
      totalAmount: 125000000,
      startDate: '2024-09-15',
      endDate: '2025-03-31',
      duration: 197,
      paymentTerms: '一括入金。約利益率 15.2%',
      clauses: [
        {
          title: '第1条 工事内容',
          content: '工場増築工事一式（鉄骨造、延床面積500㎡）',
        },
        { title: '第2条 工期', content: '2024年9月15日から2025年3月31日まで' },
        { title: '第3条 契約金額', content: '税込125,000,000円' },
      ],
      status: 'in_progress',
      approvalStatus: 'approved',
      manager: '伊藤美咲',
      managerId: 'USR-004',
      createdAt: '2024-08-20T13:00:00Z',
      createdBy: '伊藤美咲',
      updatedAt: '2024-08-20T13:00:00Z',
      signedAt: '2024-08-20T16:00:00Z',
      notes: '進行中。リスク：高（20%）',
    },
  ];

  contracts.set(demoTenantId, sampleContracts);
};

// 初期化実行
initializeSampleData();

// テナントIDを取得する関数
function getTenantIdFromRequest(request: NextRequest): string {
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// 契約番号を生成
function generateContractNo(tenantId: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `CON-${year}${month}-${random}`;
}

// GET: 契約一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    // テナントの契約データがなければ空配列
    const tenantContracts = contracts.get(tenantId) || [];

    // クエリパラメータ処理
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');
    const status = searchParams.get('status');
    const contractId = searchParams.get('id');

    let filteredContracts = [...tenantContracts];

    // 契約ID指定
    if (contractId) {
      const contract = filteredContracts.find((c) => c.id === contractId);
      if (!contract) {
        return NextResponse.json(
          { success: false, error: 'Contract not found' },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        contract,
      });
    }

    // 見積IDフィルタ
    if (estimateId) {
      filteredContracts = filteredContracts.filter(
        (c) => c.estimateId === estimateId,
      );
    }

    // ステータスフィルタ
    if (status) {
      filteredContracts = filteredContracts.filter((c) => c.status === status);
    }

    return NextResponse.json({
      success: true,
      contracts: filteredContracts,
      total: filteredContracts.length,
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contracts' },
      { status: 500 },
    );
  }
}

// POST: 新規契約作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    // バリデーション
    if (!body.estimateId || !body.projectName || !body.customerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // テナントの契約データがなければ初期化
    if (!contracts.has(tenantId)) {
      contracts.set(tenantId, []);
    }

    const tenantContracts = contracts.get(tenantId) || [];

    const now = new Date().toISOString();
    const newContract: Contract = {
      id: `contract_${tenantId}_${Date.now()}`,
      tenantId,
      estimateId: body.estimateId,
      estimateNo: body.estimateNo || '',
      contractNo: generateContractNo(tenantId),
      contractDate: body.contractDate || new Date().toISOString().split('T')[0],
      projectName: body.projectName,
      projectType: body.projectType || '建設工事',
      customerName: body.customerName,
      customerCompany: body.customerCompany,
      customerAddress: body.customerAddress,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      contractType: body.contractType || 'construction',
      contractAmount: body.contractAmount || 0,
      taxAmount: body.taxAmount || 0,
      totalAmount: body.totalAmount || body.contractAmount || 0,
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || '',
      duration: body.duration || 0,
      paymentTerms: body.paymentTerms || '',
      paymentSchedule: body.paymentSchedule || [],
      clauses: body.clauses || [],
      status: body.status || 'draft',
      approvalStatus: body.approvalStatus,
      approvalFlowId: body.approvalFlowId,
      manager: body.manager || '',
      managerId: body.managerId,
      createdAt: now,
      createdBy: body.createdBy || 'システム',
      updatedAt: now,
      attachments: body.attachments || [],
      notes: body.notes,
    };

    tenantContracts.push(newContract);
    contracts.set(tenantId, tenantContracts);

    return NextResponse.json({
      success: true,
      contract: newContract,
      message: '契約書を作成しました',
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contract' },
      { status: 500 },
    );
  }
}

// PUT: 契約更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 },
      );
    }

    const tenantContracts = contracts.get(tenantId) || [];
    const contractIndex = tenantContracts.findIndex((c) => c.id === body.id);

    if (contractIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 },
      );
    }

    const updatedContract: Contract = {
      ...tenantContracts[contractIndex],
      ...body,
      id: tenantContracts[contractIndex].id,
      tenantId: tenantContracts[contractIndex].tenantId,
      createdAt: tenantContracts[contractIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };

    tenantContracts[contractIndex] = updatedContract;
    contracts.set(tenantId, tenantContracts);

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: '契約書を更新しました',
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contract' },
      { status: 500 },
    );
  }
}

// DELETE: 契約削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 },
      );
    }

    const tenantContracts = contracts.get(tenantId) || [];
    const contractIndex = tenantContracts.findIndex((c) => c.id === contractId);

    if (contractIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 },
      );
    }

    tenantContracts.splice(contractIndex, 1);
    contracts.set(tenantId, tenantContracts);

    return NextResponse.json({
      success: true,
      message: '契約書を削除しました',
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contract' },
      { status: 500 },
    );
  }
}
