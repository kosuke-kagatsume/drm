import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProjects, statusColors, statusLabels } from '@/lib/mock-data';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // フィルタリング
  let filteredProjects = mockProjects;

  if (statusFilter !== 'ALL') {
    filteredProjects = filteredProjects.filter((p) => p.status === statusFilter);
  }

  if (searchTerm) {
    filteredProjects = filteredProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  // ソート
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    } else {
      return b.contractAmount - a.contractAmount;
    }
  });

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">プロジェクト一覧</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規プロジェクト
        </button>
      </div>

      {/* フィルター・検索 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
            <input
              type="text"
              placeholder="プロジェクト名、顧客名、住所..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ステータスフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">すべて</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* ソート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">開始日順</option>
              <option value="amount">契約金額順</option>
            </select>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">総プロジェクト数</p>
          <p className="text-2xl font-bold">{filteredProjects.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">契約総額</p>
          <p className="text-2xl font-bold">
            ¥{filteredProjects.reduce((sum, p) => sum + p.contractAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">施工中</p>
          <p className="text-2xl font-bold">
            {filteredProjects.filter((p) => p.status === 'ON_SITE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">平均進捗</p>
          <p className="text-2xl font-bold">
            {Math.round(
              filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length,
            )}
            %
          </p>
        </div>
      </div>

      {/* プロジェクトリスト */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロジェクト名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  契約金額
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  進捗
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-xs text-gray-500">{project.address}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{project.customerName}</td>
                  <td className="px-4 py-4">
                    <span
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: statusColors[project.status] }}
                    >
                      {statusLabels[project.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    ¥{project.contractAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 mr-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">
                    {project.startDate} 〜 {project.completionDate}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
