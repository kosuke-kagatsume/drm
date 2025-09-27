'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  ChevronLeft,
  Lock,
  Unlock,
  Users,
  FileText,
  Database,
  Settings,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  DollarSign,
  UserCheck,
  FileSignature,
  Package,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

// 権限タイプ
type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
};

// 役職タイプ
type Role = {
  id: string;
  name: string;
  description: string;
  level: number; // 権限レベル（1-10）
  permissions: string[]; // 権限IDの配列
};

export default function PermissionsManagement() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // 建設業界向けの権限定義
  const permissions: Permission[] = [
    // 見積管理
    { id: 'estimate.view', name: '見積閲覧', description: '見積書を閲覧', category: '見積管理', icon: Eye },
    { id: 'estimate.create', name: '見積作成', description: '新規見積書を作成', category: '見積管理', icon: Edit3 },
    { id: 'estimate.edit', name: '見積編集', description: '既存見積書を編集', category: '見積管理', icon: Edit3 },
    { id: 'estimate.delete', name: '見積削除', description: '見積書を削除', category: '見積管理', icon: Trash2 },
    { id: 'estimate.approve', name: '見積承認', description: '見積書を承認', category: '見積管理', icon: CheckCircle },

    // 契約管理
    { id: 'contract.view', name: '契約閲覧', description: '契約書を閲覧', category: '契約管理', icon: Eye },
    { id: 'contract.create', name: '契約作成', description: '契約書を作成', category: '契約管理', icon: FileSignature },
    { id: 'contract.edit', name: '契約編集', description: '契約内容を編集', category: '契約管理', icon: Edit3 },
    { id: 'contract.approve', name: '契約承認', description: '契約を承認', category: '契約管理', icon: CheckCircle },

    // 工事管理
    { id: 'project.view', name: '工事閲覧', description: '工事情報を閲覧', category: '工事管理', icon: Eye },
    { id: 'project.create', name: '工事登録', description: '新規工事を登録', category: '工事管理', icon: Package },
    { id: 'project.edit', name: '工事編集', description: '工事情報を編集', category: '工事管理', icon: Edit3 },
    { id: 'project.progress', name: '進捗更新', description: '工事進捗を更新', category: '工事管理', icon: TrendingUp },

    // 顧客管理
    { id: 'customer.view', name: '顧客閲覧', description: '顧客情報を閲覧', category: '顧客管理', icon: Eye },
    { id: 'customer.create', name: '顧客登録', description: '新規顧客を登録', category: '顧客管理', icon: Users },
    { id: 'customer.edit', name: '顧客編集', description: '顧客情報を編集', category: '顧客管理', icon: Edit3 },
    { id: 'customer.delete', name: '顧客削除', description: '顧客を削除', category: '顧客管理', icon: Trash2 },

    // 経理・請求
    { id: 'billing.view', name: '請求閲覧', description: '請求情報を閲覧', category: '経理・請求', icon: Eye },
    { id: 'billing.create', name: '請求作成', description: '請求書を作成', category: '経理・請求', icon: DollarSign },
    { id: 'billing.edit', name: '請求編集', description: '請求書を編集', category: '経理・請求', icon: Edit3 },
    { id: 'billing.approve', name: '請求承認', description: '請求を承認', category: '経理・請求', icon: CheckCircle },

    // システム管理
    { id: 'system.users', name: 'ユーザー管理', description: 'ユーザーを管理', category: 'システム', icon: UserCheck },
    { id: 'system.roles', name: '権限管理', description: '権限設定を管理', category: 'システム', icon: Shield },
    { id: 'system.master', name: 'マスタ管理', description: 'マスタデータを管理', category: 'システム', icon: Database },
    { id: 'system.settings', name: 'システム設定', description: 'システム設定を変更', category: 'システム', icon: Settings },
  ];

  // 役職定義（建設業界の階層構造）
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'president',
      name: '代表取締役',
      description: '全権限を保有',
      level: 10,
      permissions: permissions.map(p => p.id), // 全権限
    },
    {
      id: 'executive',
      name: '役員',
      description: '経営判断に関わる権限',
      level: 9,
      permissions: permissions.filter(p =>
        !p.id.includes('system.') || p.id === 'system.users'
      ).map(p => p.id),
    },
    {
      id: 'branch_manager',
      name: '支店長',
      description: '支店の全業務権限',
      level: 8,
      permissions: permissions.filter(p =>
        !p.id.includes('system.') && !p.id.includes('delete')
      ).map(p => p.id),
    },
    {
      id: 'dept_manager',
      name: '部長',
      description: '部門の全業務権限',
      level: 7,
      permissions: permissions.filter(p =>
        !p.id.includes('system.') && !p.id.includes('delete') && !p.id.includes('approve')
      ).map(p => p.id),
    },
    {
      id: 'section_chief',
      name: '課長',
      description: '承認権限を持つ',
      level: 6,
      permissions: [
        'estimate.view', 'estimate.create', 'estimate.edit', 'estimate.approve',
        'contract.view', 'contract.create', 'contract.edit',
        'project.view', 'project.create', 'project.edit', 'project.progress',
        'customer.view', 'customer.create', 'customer.edit',
        'billing.view', 'billing.create', 'billing.edit',
      ],
    },
    {
      id: 'senior_staff',
      name: '主任',
      description: '作成・編集権限',
      level: 5,
      permissions: [
        'estimate.view', 'estimate.create', 'estimate.edit',
        'contract.view', 'contract.create',
        'project.view', 'project.edit', 'project.progress',
        'customer.view', 'customer.create', 'customer.edit',
        'billing.view', 'billing.create',
      ],
    },
    {
      id: 'staff',
      name: '一般社員',
      description: '基本的な作成・閲覧権限',
      level: 3,
      permissions: [
        'estimate.view', 'estimate.create',
        'contract.view',
        'project.view', 'project.progress',
        'customer.view', 'customer.create',
        'billing.view',
      ],
    },
    {
      id: 'assistant',
      name: 'アシスタント',
      description: '閲覧のみ',
      level: 2,
      permissions: [
        'estimate.view',
        'contract.view',
        'project.view',
        'customer.view',
        'billing.view',
      ],
    },
    {
      id: 'trainee',
      name: '研修生',
      description: '限定的な閲覧権限',
      level: 1,
      permissions: [
        'estimate.view',
        'project.view',
        'customer.view',
      ],
    },
  ]);

  // 権限の切り替え
  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
        };
      }
      return role;
    }));
    setHasChanges(true);
  };

  // 権限の保存
  const savePermissions = async () => {
    setSaveLoading(true);
    try {
      // API呼び出し（実装時）
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      alert('権限設定を保存しました');
    } catch (error) {
      alert('保存に失敗しました');
    } finally {
      setSaveLoading(false);
    }
  };

  // カテゴリ別に権限をグループ化
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="hover:bg-white/20 p-2 rounded transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-7 w-7" />
                  権限管理
                </h1>
                <p className="text-sm opacity-90 mt-1">
                  役職別の権限設定を管理
                </p>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-200 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  未保存の変更があります
                </span>
                <button
                  onClick={savePermissions}
                  disabled={saveLoading}
                  className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                >
                  {saveLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  保存
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 役職選択タブ */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    selectedRole === role.id || (!selectedRole && role.id === 'president')
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      role.level >= 8 ? 'bg-red-500' :
                      role.level >= 6 ? 'bg-orange-500' :
                      role.level >= 4 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    {role.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    レベル {role.level}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 選択された役職の情報 */}
        {(() => {
          const currentRole = roles.find(r => r.id === (selectedRole || 'president'));
          if (!currentRole) return null;

          return (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentRole.name}</h2>
                    <p className="text-gray-600 mt-1">{currentRole.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        権限レベル: {currentRole.level}/10
                      </span>
                      <span className="text-sm text-gray-500">
                        付与権限数: {currentRole.permissions.length}/{permissions.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRoles(prev => prev.map(r =>
                          r.id === currentRole.id
                            ? { ...r, permissions: permissions.map(p => p.id) }
                            : r
                        ));
                        setHasChanges(true);
                      }}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      全権限付与
                    </button>
                    <button
                      onClick={() => {
                        setRoles(prev => prev.map(r =>
                          r.id === currentRole.id
                            ? { ...r, permissions: [] }
                            : r
                        ));
                        setHasChanges(true);
                      }}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      全権限解除
                    </button>
                  </div>
                </div>
              </div>

              {/* 権限マトリックス */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                  <div key={category} className="border-b last:border-b-0">
                    <div className="bg-gray-50 px-6 py-3">
                      <h3 className="font-bold text-gray-700">{category}</h3>
                    </div>
                    <div className="divide-y">
                      {categoryPermissions.map((permission) => {
                        const hasPermission = currentRole.permissions.includes(permission.id);
                        const Icon = permission.icon;
                        return (
                          <div
                            key={permission.id}
                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {permission.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {permission.description}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => togglePermission(currentRole.id, permission.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                hasPermission ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  hasPermission ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* 権限比較表 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">役職別権限一覧</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">権限</th>
                  {roles.map(role => (
                    <th key={role.id} className="text-center py-2 px-2 min-w-[100px]">
                      <div className="text-xs">{role.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, idx) => (
                  <tr key={permission.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 text-xs">{permission.name}</td>
                    {roles.map(role => (
                      <td key={role.id} className="text-center py-2 px-2">
                        {role.permissions.includes(permission.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 inline" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}