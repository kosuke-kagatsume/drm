import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ユーザー型定義
interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastLogin?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

// メモリ内データストア（本番環境ではデータベースを使用）
let users: Map<string, User[]> = new Map();

// 初期データを設定
function initializeUsersForTenant(tenantId: string): User[] {
  const baseUsers: Omit<User, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[] = [
    // 経営層（3人）
    { name: '山田 太郎', email: 'yamada@drm.com', role: '代表取締役', department: '経営', status: 'active', joinDate: '2015-04-01', lastLogin: '2025-09-28 09:00' },
    { name: '佐藤 次郎', email: 'sato@drm.com', role: '専務取締役', department: '経営', status: 'active', joinDate: '2015-04-01', lastLogin: '2025-09-28 08:30' },
    { name: '高橋 花子', email: 'takahashi@drm.com', role: '常務取締役', department: '経営', status: 'active', joinDate: '2016-07-01', lastLogin: '2025-09-27 18:00' },
    
    // 支店長・部長レベル（5人）
    { name: '鈴木 一郎', email: 'suzuki@drm.com', role: '東京支店長', department: '営業', status: 'active', joinDate: '2017-04-01', lastLogin: '2025-09-28 09:15' },
    { name: '田中 美咲', email: 'tanaka@drm.com', role: '大阪支店長', department: '営業', status: 'active', joinDate: '2018-10-01', lastLogin: '2025-09-28 08:45' },
    { name: '伊藤 健太', email: 'ito@drm.com', role: '施工部長', department: '施工', status: 'active', joinDate: '2016-04-01', lastLogin: '2025-09-28 07:30' },
    { name: '渡辺 さくら', email: 'watanabe@drm.com', role: '設計部長', department: '設計', status: 'active', joinDate: '2017-01-15', lastLogin: '2025-09-27 19:30' },
    { name: '山本 修', email: 'yamamoto@drm.com', role: '総務部長', department: '総務', status: 'active', joinDate: '2018-04-01', lastLogin: '2025-09-28 08:00' },
    
    // 営業部（10人）
    { name: '中村 大輔', email: 'nakamura@drm.com', role: '営業課長', department: '営業', status: 'active', joinDate: '2019-04-01', lastLogin: '2025-09-28 09:00' },
    { name: '小林 由美', email: 'kobayashi@drm.com', role: '営業主任', department: '営業', status: 'active', joinDate: '2020-04-01', lastLogin: '2025-09-28 08:50' },
    { name: '加藤 真一', email: 'kato@drm.com', role: '営業担当', department: '営業', status: 'active', joinDate: '2021-04-01', lastLogin: '2025-09-28 09:10' },
    { name: '吉田 愛', email: 'yoshida@drm.com', role: '営業担当', department: '営業', status: 'active', joinDate: '2022-04-01', lastLogin: '2025-09-27 18:30' },
    { name: '斎藤 翔太', email: 'saito@drm.com', role: '営業担当', department: '営業', status: 'active', joinDate: '2023-04-01', lastLogin: '2025-09-28 08:40' },
    { name: '松本 美穂', email: 'matsumoto@drm.com', role: '営業担当', department: '営業', status: 'active', joinDate: '2023-07-01', lastLogin: '2025-09-27 17:45' },
    { name: '井上 健', email: 'inoue@drm.com', role: '営業アシスタント', department: '営業', status: 'active', joinDate: '2024-04-01', lastLogin: '2025-09-28 09:20' },
    { name: '木村 理沙', email: 'kimura@drm.com', role: '営業事務', department: '営業', status: 'active', joinDate: '2024-01-15', lastLogin: '2025-09-28 08:55' },
    { name: '林 太一', email: 'hayashi@drm.com', role: '見積担当', department: '営業', status: 'active', joinDate: '2022-10-01', lastLogin: '2025-09-27 16:30' },
    { name: '清水 綾香', email: 'shimizu@drm.com', role: 'カスタマーサポート', department: '営業', status: 'active', joinDate: '2023-04-01', lastLogin: '2025-09-28 09:00' },
    
    // 施工部（8人）
    { name: '森 大輝', email: 'mori@drm.com', role: '現場監督', department: '施工', status: 'active', joinDate: '2019-04-01', lastLogin: '2025-09-28 06:00' },
    { name: '石田 洋平', email: 'ishida@drm.com', role: '施工管理技士', department: '施工', status: 'active', joinDate: '2020-07-01', lastLogin: '2025-09-28 06:30' },
    { name: '橋本 誠', email: 'hashimoto@drm.com', role: '工事課長', department: '施工', status: 'active', joinDate: '2018-04-01', lastLogin: '2025-09-28 07:00' },
    { name: '前田 裕子', email: 'maeda@drm.com', role: '安全管理者', department: '施工', status: 'active', joinDate: '2021-04-01', lastLogin: '2025-09-28 06:45' },
    { name: '後藤 賢一', email: 'goto@drm.com', role: '品質管理者', department: '施工', status: 'active', joinDate: '2020-10-01', lastLogin: '2025-09-28 07:15' },
    { name: '岡田 浩二', email: 'okada@drm.com', role: '施工担当', department: '施工', status: 'active', joinDate: '2022-04-01', lastLogin: '2025-09-27 18:00' },
    { name: '藤田 純', email: 'fujita@drm.com', role: '施工担当', department: '施工', status: 'active', joinDate: '2023-04-01', lastLogin: '2025-09-28 06:00' },
    { name: '村田 和也', email: 'murata@drm.com', role: '施工補助', department: '施工', status: 'active', joinDate: '2024-04-01', lastLogin: '2025-09-27 17:30' },
    
    // 設計部（6人）
    { name: '池田 奈美', email: 'ikeda@drm.com', role: '設計課長', department: '設計', status: 'active', joinDate: '2019-04-01', lastLogin: '2025-09-28 08:00' },
    { name: '原田 智也', email: 'harada@drm.com', role: '一級建築士', department: '設計', status: 'active', joinDate: '2018-07-01', lastLogin: '2025-09-28 08:30' },
    { name: '小川 優花', email: 'ogawa@drm.com', role: '二級建築士', department: '設計', status: 'active', joinDate: '2020-04-01', lastLogin: '2025-09-28 08:45' },
    { name: '金子 大介', email: 'kaneko@drm.com', role: 'CADオペレーター', department: '設計', status: 'active', joinDate: '2021-10-01', lastLogin: '2025-09-28 09:00' },
    { name: '中島 美紀', email: 'nakajima@drm.com', role: 'CADオペレーター', department: '設計', status: 'active', joinDate: '2023-04-01', lastLogin: '2025-09-27 19:00' },
    { name: '坂本 涼', email: 'sakamoto@drm.com', role: '設計補助', department: '設計', status: 'active', joinDate: '2024-04-01', lastLogin: '2025-09-28 08:50' },
    
    // 経理部（5人）
    { name: '西村 恵子', email: 'nishimura@drm.com', role: '経理課長', department: '経理', status: 'active', joinDate: '2017-04-01', lastLogin: '2025-09-28 09:00' },
    { name: '東 裕樹', email: 'higashi@drm.com', role: '経理主任', department: '経理', status: 'active', joinDate: '2019-04-01', lastLogin: '2025-09-28 08:45' },
    { name: '北川 麻衣', email: 'kitagawa@drm.com', role: '経理担当', department: '経理', status: 'active', joinDate: '2021-04-01', lastLogin: '2025-09-28 08:50' },
    { name: '南 健二', email: 'minami@drm.com', role: '経理担当', department: '経理', status: 'active', joinDate: '2022-07-01', lastLogin: '2025-09-27 18:00' },
    { name: '三浦 千夏', email: 'miura@drm.com', role: '経理事務', department: '経理', status: 'active', joinDate: '2023-10-01', lastLogin: '2025-09-28 09:10' },
    
    // 総務・人事部（4人）
    { name: '安藤 正人', email: 'ando@drm.com', role: '人事課長', department: '総務', status: 'active', joinDate: '2018-04-01', lastLogin: '2025-09-28 08:30' },
    { name: '河野 由美子', email: 'kono@drm.com', role: '総務主任', department: '総務', status: 'active', joinDate: '2020-04-01', lastLogin: '2025-09-28 08:40' },
    { name: '大野 健太郎', email: 'ono@drm.com', role: '人事担当', department: '総務', status: 'active', joinDate: '2022-04-01', lastLogin: '2025-09-28 09:00' },
    { name: '上田 彩', email: 'ueda@drm.com', role: '総務事務', department: '総務', status: 'active', joinDate: '2024-01-01', lastLogin: '2025-09-27 17:30' },
    
    // アフターサービス部（3人）
    { name: '平野 剛', email: 'hirano@drm.com', role: 'アフターサービス課長', department: 'アフターサービス', status: 'active', joinDate: '2019-07-01', lastLogin: '2025-09-28 08:00' },
    { name: '酒井 美和', email: 'sakai@drm.com', role: 'メンテナンス担当', department: 'アフターサービス', status: 'active', joinDate: '2021-04-01', lastLogin: '2025-09-28 08:15' },
    { name: '谷口 隆', email: 'taniguchi@drm.com', role: 'クレーム対応', department: 'アフターサービス', status: 'active', joinDate: '2022-10-01', lastLogin: '2025-09-27 18:30' }
  ];

  const now = new Date().toISOString();
  return baseUsers.map((user, index) => ({
    ...user,
    id: `user_${tenantId}_${index + 1}`,
    tenantId,
    createdAt: now,
    updatedAt: now,
  }));
}

// テナントIDを取得する関数（実際の実装ではJWTやセッションから取得）
function getTenantIdFromRequest(request: NextRequest): string {
  // ここでは簡易的にクッキーから取得
  const cookieStore = cookies();
  const tenantId = cookieStore.get('tenantId')?.value || 'demo-tenant';
  return tenantId;
}

// GET: ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    
    // テナントのユーザーデータがなければ初期化
    if (!users.has(tenantId)) {
      users.set(tenantId, initializeUsersForTenant(tenantId));
    }
    
    const tenantUsers = users.get(tenantId) || [];
    
    // クエリパラメータ処理
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const status = searchParams.get('status') as User['status'] | null;
    
    let filteredUsers = [...tenantUsers];
    
    // 検索フィルタ
    if (search) {
      filteredUsers = filteredUsers.filter(
        user => 
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.role.toLowerCase().includes(search)
      );
    }
    
    // 部署フィルタ
    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department);
    }
    
    // 役職フィルタ
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // ステータスフィルタ
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    return NextResponse.json({
      success: true,
      users: filteredUsers,
      total: filteredUsers.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST: 新規ユーザー作成
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    
    // バリデーション
    if (!body.name || !body.email || !body.role || !body.department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // テナントのユーザーデータがなければ初期化
    if (!users.has(tenantId)) {
      users.set(tenantId, []);
    }
    
    const tenantUsers = users.get(tenantId) || [];
    
    // メールアドレスの重複チェック
    const existingUser = tenantUsers.find(u => u.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    const now = new Date().toISOString();
    const newUser: User = {
      id: `user_${tenantId}_${Date.now()}`,
      tenantId,
      name: body.name,
      email: body.email,
      role: body.role,
      department: body.department,
      status: body.status || 'pending',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      permissions: body.permissions || [],
      createdAt: now,
      updatedAt: now,
    };
    
    tenantUsers.push(newUser);
    users.set(tenantId, tenantUsers);
    
    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT: ユーザー更新
export async function PUT(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const tenantUsers = users.get(tenantId) || [];
    const userIndex = tenantUsers.findIndex(u => u.id === body.id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // メールアドレス変更時の重複チェック
    if (body.email && body.email !== tenantUsers[userIndex].email) {
      const existingUser = tenantUsers.find(u => u.email === body.email && u.id !== body.id);
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        );
      }
    }
    
    const updatedUser: User = {
      ...tenantUsers[userIndex],
      ...body,
      id: tenantUsers[userIndex].id,
      tenantId: tenantUsers[userIndex].tenantId,
      createdAt: tenantUsers[userIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    tenantUsers[userIndex] = updatedUser;
    users.set(tenantId, tenantUsers);
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: ユーザー削除
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = getTenantIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const tenantUsers = users.get(tenantId) || [];
    const userIndex = tenantUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    tenantUsers.splice(userIndex, 1);
    users.set(tenantId, tenantUsers);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}