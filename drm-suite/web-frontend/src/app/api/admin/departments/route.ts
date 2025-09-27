import { NextRequest, NextResponse } from 'next/server';

// 部署インターフェース
interface Department {
  id: string;
  name: string;
  parentId: string | null;
  managerId: string | null;
  managerName: string | null;
  memberCount: number;
  children: Department[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// テナントIDの取得
function getTenantIdFromRequest(request: NextRequest): string {
  const tenantId = request.headers.get('X-Tenant-Id');
  if (!tenantId) {
    return 'default-tenant';
  }
  return tenantId;
}

// 組織構造データの保存（テナントごと）
const organizations = new Map<string, Department>();

// 初期組織構造の生成
function initializeOrganizationForTenant(tenantId: string): Department {
  return {
    id: 'root',
    name: 'デモ建設株式会社',
    parentId: null,
    managerId: '1',
    managerName: '山田 太郎',
    memberCount: 42,
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [
      {
        id: 'tokyo',
        name: '東京支店',
        parentId: 'root',
        managerId: '2',
        managerName: '鈴木 一郎',
        memberCount: 15,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'tokyo-sales',
            name: '営業部',
            parentId: 'tokyo',
            managerId: '3',
            managerName: '佐藤 次郎',
            memberCount: 5,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'tokyo-construction',
            name: '施工部',
            parentId: 'tokyo',
            managerId: '6',
            managerName: '田中 三郎',
            memberCount: 8,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'tokyo-office',
            name: '事務部',
            parentId: 'tokyo',
            managerId: '7',
            managerName: '高橋 花子',
            memberCount: 2,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
        ],
      },
      {
        id: 'osaka',
        name: '大阪支店',
        parentId: 'root',
        managerId: '9',
        managerName: '伊藤 四郎',
        memberCount: 12,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'osaka-sales',
            name: '営業部',
            parentId: 'osaka',
            managerId: '10',
            managerName: '渡辺 五郎',
            memberCount: 4,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'osaka-construction',
            name: '施工部',
            parentId: 'osaka',
            managerId: '11',
            managerName: '山本 六郎',
            memberCount: 6,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'osaka-office',
            name: '事務部',
            parentId: 'osaka',
            managerId: '12',
            managerName: '中村 美香',
            memberCount: 2,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
        ],
      },
      {
        id: 'admin',
        name: '管理本部',
        parentId: 'root',
        managerId: '13',
        managerName: '小林 七郎',
        memberCount: 15,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'accounting',
            name: '経理部',
            parentId: 'admin',
            managerId: '4',
            managerName: '山田 愛子',
            memberCount: 3,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'marketing',
            name: 'マーケティング部',
            parentId: 'admin',
            managerId: '5',
            managerName: '木村 健太',
            memberCount: 4,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'aftercare',
            name: 'アフターサービス部',
            parentId: 'admin',
            managerId: '8',
            managerName: '中村 次郎',
            memberCount: 3,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'hr',
            name: '人事部',
            parentId: 'admin',
            managerId: '14',
            managerName: '松田 八郎',
            memberCount: 2,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
          {
            id: 'it',
            name: 'IT部',
            parentId: 'admin',
            managerId: '15',
            managerName: '吉田 九郎',
            memberCount: 3,
            tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          },
        ],
      },
    ],
  };
}

// GET: 組織構造の取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);

    // 初回アクセス時は初期化
    if (!organizations.has(tenantId)) {
      organizations.set(tenantId, initializeOrganizationForTenant(tenantId));
    }

    const organization = organizations.get(tenantId);

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT: 組織構造の更新（ドラッグ&ドロップなど）
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { organization } = body;

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: '組織構造データが必要です',
        },
        { status: 400 }
      );
    }

    // 更新日時を設定
    const updateTimestamp = (dept: Department): Department => ({
      ...dept,
      updatedAt: new Date(),
      children: dept.children.map(updateTimestamp),
    });

    const updatedOrganization = updateTimestamp(organization);
    organizations.set(tenantId, updatedOrganization);

    return NextResponse.json({
      success: true,
      organization: updatedOrganization,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: 新しい部署の追加
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    const { name, parentId, managerId, managerName } = body;

    if (!name || !parentId) {
      return NextResponse.json(
        {
          success: false,
          error: '部署名と親部署IDが必要です',
        },
        { status: 400 }
      );
    }

    // 初回アクセス時は初期化
    if (!organizations.has(tenantId)) {
      organizations.set(tenantId, initializeOrganizationForTenant(tenantId));
    }

    const organization = organizations.get(tenantId)!;

    // 新しい部署を追加する関数
    const addDepartment = (dept: Department): Department => {
      if (dept.id === parentId) {
        const newDept: Department = {
          id: `dept-${Date.now()}`,
          name,
          parentId,
          managerId: managerId || null,
          managerName: managerName || null,
          memberCount: 0,
          tenantId,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        };
        return {
          ...dept,
          children: [...dept.children, newDept],
        };
      }
      return {
        ...dept,
        children: dept.children.map(addDepartment),
      };
    };

    const updatedOrganization = addDepartment(organization);
    organizations.set(tenantId, updatedOrganization);

    return NextResponse.json({
      success: true,
      organization: updatedOrganization,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: 部署の削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('id');

    if (!departmentId) {
      return NextResponse.json(
        {
          success: false,
          error: '部署IDが必要です',
        },
        { status: 400 }
      );
    }

    // 初回アクセス時は初期化
    if (!organizations.has(tenantId)) {
      organizations.set(tenantId, initializeOrganizationForTenant(tenantId));
    }

    const organization = organizations.get(tenantId)!;

    // 部署を削除する関数
    const deleteDepartment = (dept: Department): Department => {
      return {
        ...dept,
        children: dept.children
          .filter(child => child.id !== departmentId)
          .map(deleteDepartment),
      };
    };

    const updatedOrganization = deleteDepartment(organization);
    organizations.set(tenantId, updatedOrganization);

    return NextResponse.json({
      success: true,
      organization: updatedOrganization,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}