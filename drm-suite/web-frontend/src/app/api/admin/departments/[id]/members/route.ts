import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  departmentId?: string;
  status: 'active' | 'inactive' | 'pending';
}

// GET: 特定部署のメンバー一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;
    const tenantId = request.headers.get('X-Tenant-Id') || 'default-tenant';

    // ユーザー一覧を取得
    const usersResponse = await fetch(
      `${request.nextUrl.protocol}//${request.nextUrl.host}/api/admin/users`,
      {
        headers: {
          'X-Tenant-Id': tenantId,
        },
      }
    );

    if (!usersResponse.ok) {
      throw new Error('ユーザーデータの取得に失敗しました');
    }

    const usersData = await usersResponse.json();
    const allUsers: User[] = usersData.users || [];

    // 部署IDと部署名のマッピング
    const departmentMapping: Record<string, string[]> = {
      'tokyo': ['営業', '東京支店'],
      'tokyo-sales': ['営業'],
      'tokyo-construction': ['施工'],
      'tokyo-office': ['総務', '事務'],
      'osaka': ['営業', '大阪支店'],
      'osaka-sales': ['営業'],
      'osaka-construction': ['施工'],
      'osaka-office': ['総務', '事務'],
      'accounting': ['経理'],
      'marketing': ['マーケティング'],
      'aftercare': ['アフターサービス'],
      'hr': ['総務', '人事'],
      'it': ['IT', 'システム'],
    };

    // 該当部署のメンバーをフィルタリング
    const departmentNames = departmentMapping[departmentId] || [];
    const members = allUsers.filter((user) =>
      departmentNames.some((deptName) =>
        user.department.includes(deptName)
      )
    );

    return NextResponse.json({
      success: true,
      members,
      count: members.length,
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

// POST: 部署にメンバーを追加
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザーIDが必要です',
        },
        { status: 400 }
      );
    }

    // TODO: ユーザーの部署を更新する処理
    // 実際の実装では、ユーザーのdepartmentIdを更新する

    return NextResponse.json({
      success: true,
      message: 'メンバーを追加しました',
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
