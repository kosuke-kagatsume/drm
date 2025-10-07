'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  Move,
  Save,
  GripVertical,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  parentId: string | null;
  managerId: string | null;
  managerName: string | null;
  memberCount: number;
  children: Department[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function OrganizationManagement() {
  const router = useRouter();
  const { user, isLoading, isSuperAdmin } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [draggedDept, setDraggedDept] = useState<Department | null>(null);
  const [dragOverDept, setDragOverDept] = useState<string | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  // 組織構造データ（ドラッグ&ドロップで変更可能）
  const [organization, setOrganization] = useState<Department | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [saving, setSaving] = useState(false);

  // APIから組織データを取得
  const fetchOrganization = async () => {
    try {
      setLoadingOrg(true);
      const response = await fetch('/api/admin/departments', {
        headers: {
          'X-Tenant-Id': 'default-tenant',
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('組織データの取得に失敗:', error);
    } finally {
      setLoadingOrg(false);
    }
  };

  // 部署のメンバーを取得
  const fetchDepartmentMembers = async (departmentId: string) => {
    try {
      setLoadingMembers(true);
      const response = await fetch(
        `/api/admin/departments/${departmentId}/members`,
        {
          headers: {
            'X-Tenant-Id': 'default-tenant',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setDepartmentMembers(data.members || []);
      }
    } catch (error) {
      console.error('メンバーデータの取得に失敗:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // 全ユーザーを取得
  const fetchAllUsers = async () => {
    try {
      setLoadingAllUsers(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'X-Tenant-Id': 'default-tenant',
        },
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users || []);
      }
    } catch (error) {
      console.error('全ユーザーの取得に失敗:', error);
    } finally {
      setLoadingAllUsers(false);
    }
  };

  // メンバー一覧を表示
  const showMembers = (dept: Department) => {
    setSelectedDept(dept);
    setShowMembersModal(true);
    fetchDepartmentMembers(dept.id);
  };

  // メンバー追加モーダルを表示
  const showAddMember = async (dept: Department) => {
    setSelectedDept(dept);
    setShowAddMemberModal(true);
    await Promise.all([fetchAllUsers(), fetchDepartmentMembers(dept.id)]);
  };

  // メンバーを部署に追加
  const addMemberToDepartment = async (userId: string, userName: string) => {
    if (!selectedDept) return;

    try {
      const response = await fetch(
        `/api/admin/departments/${selectedDept.id}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': 'default-tenant',
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // メンバーリストを更新
        await fetchDepartmentMembers(selectedDept.id);
        // 組織データも更新（メンバー数が変わるため）
        await fetchOrganization();
        alert(`${userName}を${selectedDept.name}に追加しました`);
      } else {
        alert(`追加に失敗しました: ${data.error}`);
      }
    } catch (error) {
      console.error('メンバー追加エラー:', error);
      alert('メンバーの追加に失敗しました');
    }
  };

  // 組織構造を更新（APIに保存）
  const saveOrganization = async (updatedOrg: Department) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/departments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': 'default-tenant',
        },
        body: JSON.stringify({ organization: updatedOrg }),
      });
      const data = await response.json();
      if (data.success) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('組織データの保存に失敗:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  // モックデータ（削除予定）
  const mockOrg: Department = {
    id: 'root',
    name: 'デモ建設株式会社',
    parentId: null,
    managerId: '1',
    managerName: '山田 太郎',
    memberCount: 42,
    children: [
      {
        id: 'tokyo',
        name: '東京支店',
        parentId: 'root',
        managerId: '2',
        managerName: '鈴木 一郎',
        memberCount: 15,
        children: [
          {
            id: 'tokyo-sales',
            name: '営業部',
            parentId: 'tokyo',
            managerId: '3',
            managerName: '佐藤 次郎',
            memberCount: 5,
            children: [],
          },
          {
            id: 'tokyo-construction',
            name: '施工部',
            parentId: 'tokyo',
            managerId: '6',
            managerName: '田中 三郎',
            memberCount: 8,
            children: [],
          },
          {
            id: 'tokyo-office',
            name: '事務部',
            parentId: 'tokyo',
            managerId: '7',
            managerName: '高橋 花子',
            memberCount: 2,
            children: [],
          },
        ],
      },
      {
        id: 'osaka',
        name: '大阪支店',
        parentId: 'root',
        managerId: null,
        managerName: null,
        memberCount: 12,
        children: [
          {
            id: 'osaka-sales',
            name: '営業部',
            parentId: 'osaka',
            managerId: null,
            managerName: null,
            memberCount: 4,
            children: [],
          },
          {
            id: 'osaka-construction',
            name: '施工部',
            parentId: 'osaka',
            managerId: null,
            managerName: null,
            memberCount: 6,
            children: [],
          },
          {
            id: 'osaka-office',
            name: '事務部',
            parentId: 'osaka',
            managerId: null,
            managerName: null,
            memberCount: 2,
            children: [],
          },
        ],
      },
      {
        id: 'admin',
        name: '管理本部',
        parentId: 'root',
        managerId: null,
        managerName: null,
        memberCount: 15,
        children: [
          {
            id: 'accounting',
            name: '経理部',
            parentId: 'admin',
            managerId: '4',
            managerName: '山田 愛子',
            memberCount: 3,
            children: [],
          },
          {
            id: 'marketing',
            name: 'マーケティング部',
            parentId: 'admin',
            managerId: '5',
            managerName: '木村 健太',
            memberCount: 4,
            children: [],
          },
          {
            id: 'aftercare',
            name: 'アフターサービス部',
            parentId: 'admin',
            managerId: '8',
            managerName: '中村 次郎',
            memberCount: 3,
            children: [],
          },
          {
            id: 'hr',
            name: '人事部',
            parentId: 'admin',
            managerId: null,
            managerName: null,
            memberCount: 2,
            children: [],
          },
          {
            id: 'it',
            name: 'IT部',
            parentId: 'admin',
            managerId: null,
            managerName: null,
            memberCount: 3,
            children: [],
          },
        ],
      },
    ],
  } as Department;

  useEffect(() => {
    if (!isLoading && !isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isSuperAdmin, router]);

  const toggleExpand = (deptId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  // 新しい部署を追加（API連携）
  const handleAddDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const parentId = formData.get('parentId') as string;
    const managerId = formData.get('managerId') as string;
    const managerName = formData.get('managerName') as string;

    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': 'default-tenant',
        },
        body: JSON.stringify({
          name,
          parentId: parentId || editingDept?.id || 'root',
          managerId,
          managerName,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOrganization(data.organization);
        setShowAddModal(false);
        setEditingDept(null);
      }
    } catch (error) {
      console.error('部署の追加に失敗:', error);
    }
  };

  const handleAddDepartment = (parentDept: Department) => {
    setEditingDept(parentDept);
    setShowAddModal(true);
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDept(dept);
    setShowEditModal(true);
  };

  // 部署を削除（API連携）
  const handleDeleteDepartmentAPI = async (deptId: string) => {
    try {
      const response = await fetch(`/api/admin/departments?id=${deptId}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-Id': 'default-tenant',
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('部署の削除に失敗:', error);
    }
  };

  const handleDeleteDepartment = (dept: Department) => {
    if (dept.children.length > 0) {
      alert('下位部署が存在するため削除できません');
      return;
    }
    if (confirm(`${dept.name}を削除してもよろしいですか？`)) {
      handleDeleteDepartmentAPI(dept.id);
    }
  };

  // ドラッグ&ドロップハンドラー
  const handleDragStart = (e: React.DragEvent, dept: Department) => {
    setDraggedDept(dept);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, deptId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDept(deptId);
  };

  const handleDragLeave = () => {
    setDragOverDept(null);
  };

  const handleDrop = (e: React.DragEvent, targetDept: Department) => {
    e.preventDefault();
    setDragOverDept(null);

    if (!draggedDept || draggedDept.id === targetDept.id) {
      return;
    }

    // 自分の子孫への移動を防ぐ
    const isDescendant = (parent: Department, childId: string): boolean => {
      if (parent.id === childId) return true;
      return parent.children.some(child => isDescendant(child, childId));
    };

    if (isDescendant(draggedDept, targetDept.id)) {
      alert('部署を自身の配下に移動することはできません');
      return;
    }

    // 組織構造を更新
    const updateOrganization = (dept: Department): Department => {
      // ドラッグされた部署を削除
      if (dept.children.some(child => child.id === draggedDept.id)) {
        return {
          ...dept,
          children: dept.children.filter(child => child.id !== draggedDept.id),
          memberCount: dept.memberCount - draggedDept.memberCount,
        };
      }

      // ターゲット部署に追加
      if (dept.id === targetDept.id) {
        return {
          ...dept,
          children: [...dept.children, { ...draggedDept, parentId: dept.id }],
          memberCount: dept.memberCount + draggedDept.memberCount,
        };
      }

      // 再帰的に子部署を更新
      return {
        ...dept,
        children: dept.children.map(child => updateOrganization(child)),
      };
    };

    const updatedOrg = updateOrganization(organization!);
    setOrganization(updatedOrg);
    saveOrganization(updatedOrg);
    setDraggedDept(null);
  };

  const DepartmentNode = ({
    dept,
    level = 0,
  }: {
    dept: Department;
    level?: number;
  }) => {
    const isExpanded = expandedNodes.has(dept.id);
    const hasChildren = dept.children.length > 0;
    const isDragOver = dragOverDept === dept.id;

    return (
      <div>
        <div
          className={`flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
            selectedDept?.id === dept.id ? 'bg-blue-50' : ''
          } ${
            isDragOver ? 'bg-green-100 border-2 border-green-400' : ''
          } ${
            isDragMode ? 'cursor-move' : ''
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => !isDragMode && setSelectedDept(dept)}
          draggable={isDragMode}
          onDragStart={(e) => isDragMode && handleDragStart(e, dept)}
          onDragOver={(e) => isDragMode && handleDragOver(e, dept.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => isDragMode && handleDrop(e, dept)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(dept.id);
            }}
            className="mr-2"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )
            ) : (
              <div className="w-4" />
            )}
          </button>
          {isDragMode && (
            <GripVertical className="h-4 w-4 text-gray-400 mr-1" />
          )}
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">{dept.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({dept.memberCount}名)
                </span>
              </div>
              {!isDragMode && (
                <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddDepartment(dept);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDepartment(dept);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDepartment(dept);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            {dept.managerName && (
              <div className="text-sm text-gray-500">
                責任者: {dept.managerName}
              </div>
            )}
          </div>
        </div>
        {isExpanded &&
          dept.children.map((child) => (
            <DepartmentNode key={child.id} dept={child} level={level + 1} />
          ))}
      </div>
    );
  };

  if (isLoading || loadingOrg || !organization) {
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
      <nav className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
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
                  <Building2 className="h-7 w-7" />
                  組織構造管理
                </h1>
                <p className="text-sm opacity-90 mt-1">部署と階層の管理</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Plus className="h-5 w-5" />
              部署を追加
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 組織ツリー */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">組織図</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDragMode(!isDragMode)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      isDragMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Move className="h-4 w-4 inline mr-1" />
                    {isDragMode ? '移動モード' : '移動'}
                  </button>
                  <button
                    onClick={() => setExpandedNodes(new Set())}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    すべて折りたたむ
                  </button>
                  <button
                    onClick={() => {
                      const allIds = new Set<string>();
                      const collectIds = (dept: Department) => {
                        allIds.add(dept.id);
                        dept.children.forEach(collectIds);
                      };
                      collectIds(organization);
                      setExpandedNodes(allIds);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    すべて展開
                  </button>
                  {saving && (
                    <span className="text-xs text-green-600">保存中...</span>
                  )}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <DepartmentNode dept={organization} />
              </div>
            </div>
          </div>

          {/* 部署詳細 */}
          <div className="lg:col-span-1">
            {selectedDept ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  部署詳細
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">部署名</p>
                    <p className="font-medium text-gray-900">
                      {selectedDept.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">責任者</p>
                    <p className="font-medium text-gray-900">
                      {selectedDept.managerName || '未設定'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">所属人数</p>
                    <p className="font-medium text-gray-900">
                      {selectedDept.memberCount}名
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">下位部署数</p>
                    <p className="font-medium text-gray-900">
                      {selectedDept.children.length}部署
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => showMembers(selectedDept)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    メンバー一覧
                  </button>
                  <button
                    onClick={() => showAddMember(selectedDept)}
                    className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    メンバーを追加
                  </button>
                  <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Move className="h-4 w-4" />
                    部署を移動
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-gray-500 text-center">
                  部署を選択してください
                </p>
              </div>
            )}

            {/* 統計情報 */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">組織統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総部署数</span>
                  <span className="font-medium text-gray-900">11部署</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">総従業員数</span>
                  <span className="font-medium text-gray-900">42名</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">最大階層</span>
                  <span className="font-medium text-gray-900">3階層</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">平均部署人数</span>
                  <span className="font-medium text-gray-900">3.8名</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 部署追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">部署を追加</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleAddDepartmentSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部署名
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="新規部署名"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    親部署
                  </label>
                  <select
                    name="parentId"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue={editingDept?.id || 'root'}
                  >
                    <option value="root">デモ建設株式会社</option>
                    <option value="tokyo">東京支店</option>
                    <option value="osaka">大阪支店</option>
                    <option value="admin">管理本部</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    責任者
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">選択してください</option>
                    <option value="1">山田 太郎</option>
                    <option value="2">鈴木 一郎</option>
                    <option value="3">佐藤 次郎</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    部署を追加
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 部署編集モーダル */}
      {showEditModal && editingDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">部署を編集</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDept(null);
                  }}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    部署名
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingDept.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    責任者
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingDept.managerId || ''}
                  >
                    <option value="">選択してください</option>
                    <option value="1">山田 太郎</option>
                    <option value="2">鈴木 一郎</option>
                    <option value="3">佐藤 次郎</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDept(null);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    変更を保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* メンバー一覧モーダル */}
      {showMembersModal && selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{selectedDept.name}</h2>
                  <p className="text-sm opacity-90 mt-1">
                    所属メンバー: {departmentMembers.length}名
                  </p>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">読み込み中...</p>
                </div>
              ) : departmentMembers.length > 0 ? (
                <div className="space-y-3">
                  {departmentMembers.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {member.status === 'active' ? '在籍中' : '退職'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>メンバーが登録されていません</p>
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <button
                onClick={() => setShowMembersModal(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メンバー追加モーダル */}
      {showAddMemberModal && selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">メンバーを追加</h2>
                  <p className="text-sm opacity-90 mt-1">
                    {selectedDept.name}に追加するメンバーを選択
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSearchUser('');
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="名前・メールで検索..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAllUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">読み込み中...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers
                    .filter((user) => {
                      const searchLower = searchUser.toLowerCase();
                      return (
                        user.name.toLowerCase().includes(searchLower) ||
                        user.email.toLowerCase().includes(searchLower) ||
                        user.role.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((user) => {
                      const isAlreadyMember = departmentMembers.some(
                        (m) => m.id === user.id
                      );
                      return (
                        <div
                          key={user.id}
                          className={`border rounded-lg p-4 transition-colors ${
                            isAlreadyMember
                              ? 'bg-gray-100 cursor-not-allowed'
                              : 'hover:bg-green-50 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isAlreadyMember) {
                              addMemberToDepartment(user.id, user.name);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {user.role} · {user.department}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {isAlreadyMember ? (
                                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                  所属済み
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                  追加
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSearchUser('');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
