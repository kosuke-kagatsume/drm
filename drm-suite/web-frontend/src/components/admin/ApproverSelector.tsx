'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users as UsersIcon } from 'lucide-react';
import type { Approver } from '@/types/approval-flow';

interface ApproverSelectorProps {
  selectedApprovers: Approver[];
  onApproversChange: (approvers: Approver[]) => void;
  mode?: 'serial' | 'parallel';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export default function ApproverSelector({
  selectedApprovers,
  onApproversChange,
  mode = 'serial',
}: ApproverSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    if (showSelector) {
      fetchUsers();
    }
  }, [showSelector]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const departments = Array.from(
    new Set(
      (Array.isArray(users) ? users : [])
        .map((u) => u.department)
        .filter(Boolean)
    )
  );

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === 'all' || user.department === filterDepartment;

    const notSelected = !selectedApprovers.some((a) => a.id === user.id);

    return matchesSearch && matchesDepartment && notSelected && user.status === 'active';
  });

  const addApprover = (user: User) => {
    const newApprover: Approver = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      department: user.department,
      order: selectedApprovers.length + 1,
    };
    onApproversChange([...selectedApprovers, newApprover]);
  };

  const removeApprover = (approverId: string) => {
    const newApprovers = selectedApprovers
      .filter((a) => a.id !== approverId)
      .map((a, index) => ({ ...a, order: index + 1 }));
    onApproversChange(newApprovers);
  };

  const moveApprover = (index: number, direction: 'up' | 'down') => {
    if (mode === 'parallel') return; // 並列承認では順序変更不可

    const newApprovers = [...selectedApprovers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newApprovers.length) return;

    [newApprovers[index], newApprovers[targetIndex]] = [
      newApprovers[targetIndex],
      newApprovers[index],
    ];

    // 順序を振り直し
    newApprovers.forEach((a, i) => {
      a.order = i + 1;
    });

    onApproversChange(newApprovers);
  };

  return (
    <div>
      {/* 選択済み承認者リスト */}
      <div className="space-y-2 mb-3">
        {selectedApprovers.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <UsersIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">承認者が設定されていません</p>
          </div>
        ) : (
          selectedApprovers.map((approver, index) => (
            <div
              key={approver.id}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              {mode === 'serial' && (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveApprover(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveApprover(index, 'down')}
                    disabled={index === selectedApprovers.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▼
                  </button>
                </div>
              )}

              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {mode === 'serial' && (
                    <span className="text-blue-600 mr-2">#{approver.order}</span>
                  )}
                  {approver.name}
                </div>
                <div className="text-xs text-gray-600">
                  {approver.department} - {approver.email}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeApprover(approver.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 承認者追加ボタン */}
      <button
        type="button"
        onClick={() => setShowSelector(true)}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600"
      >
        <UserPlus className="h-4 w-4" />
        承認者を追加
      </button>

      {/* 承認者選択モーダル */}
      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">承認者を選択</h3>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* 検索・フィルター */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="名前、メール、役職で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部署</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ユーザー一覧 */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>該当するユーザーが見つかりません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        addApprover(user);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        {user.role} - {user.department}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setShowSelector(false)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
