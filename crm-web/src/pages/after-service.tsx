import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockProjects } from '@/lib/mock-data';
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  Home,
  CalendarDays,
} from 'lucide-react';

// アフターサービスの種類
const serviceTypes = [
  { id: 'inspection-1m', name: '1ヶ月点検', defaultDays: 30, color: 'bg-blue-500' },
  { id: 'inspection-3m', name: '3ヶ月点検', defaultDays: 90, color: 'bg-green-500' },
  { id: 'inspection-6m', name: '6ヶ月点検', defaultDays: 180, color: 'bg-yellow-500' },
  { id: 'inspection-1y', name: '1年点検', defaultDays: 365, color: 'bg-orange-500' },
  { id: 'inspection-2y', name: '2年点検', defaultDays: 730, color: 'bg-red-500' },
  { id: 'inspection-5y', name: '5年点検', defaultDays: 1825, color: 'bg-purple-500' },
  { id: 'inspection-10y', name: '10年点検', defaultDays: 3650, color: 'bg-pink-500' },
];

interface ServiceRecord {
  id: string;
  projectId: string;
  serviceType: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'overdue' | 'completed';
  notes: string;
  inspector?: string;
  issues?: string[];
  nextServiceId?: string;
}

// モックのアフターサービスデータ
const mockServiceRecords: ServiceRecord[] = [
  {
    id: 'as-1',
    projectId: '4',
    serviceType: 'inspection-1m',
    scheduledDate: '2024-12-01',
    completedDate: '2024-12-03',
    status: 'completed',
    notes: '特に問題なし。建具の調整を実施。',
    inspector: '山田太郎',
    issues: ['建具の微調整'],
  },
  {
    id: 'as-2',
    projectId: '4',
    serviceType: 'inspection-3m',
    scheduledDate: '2025-01-31',
    status: 'overdue',
    notes: '',
  },
  {
    id: 'as-3',
    projectId: '10',
    serviceType: 'inspection-6m',
    scheduledDate: '2025-02-28',
    status: 'scheduled',
    notes: '',
  },
];

export default function AfterServicePage() {
  const navigate = useNavigate();
  const [serviceRecords, setServiceRecords] = useState(mockServiceRecords);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'overdue' | 'completed'>('all');

  // アフターサービス対象のプロジェクトのみ抽出
  const afterServiceProjects = mockProjects.filter((p) => p.status === 'AFTER_SERVICE');

  // フィルタリング
  const filteredRecords = serviceRecords.filter((record) => {
    if (selectedProject && record.projectId !== selectedProject) return false;
    if (filter === 'all') return true;
    return record.status === filter;
  });

  // ステータス別の件数
  const statusCounts = {
    scheduled: serviceRecords.filter((r) => r.status === 'scheduled').length,
    overdue: serviceRecords.filter((r) => r.status === 'overdue').length,
    completed: serviceRecords.filter((r) => r.status === 'completed').length,
  };

  // プロジェクト情報の取得
  const getProject = (projectId: string) => {
    return mockProjects.find((p) => p.id === projectId);
  };

  // サービスタイプ情報の取得
  const getServiceType = (serviceTypeId: string) => {
    return serviceTypes.find((st) => st.id === serviceTypeId);
  };

  // 次回点検の自動スケジューリング
  const scheduleNextService = (projectId: string, currentServiceType: string) => {
    const currentIndex = serviceTypes.findIndex((st) => st.id === currentServiceType);
    if (currentIndex < serviceTypes.length - 1) {
      const nextServiceType = serviceTypes[currentIndex + 1];
      const project = getProject(projectId);
      if (project) {
        const baseDate = new Date(project.completionDate);
        baseDate.setDate(baseDate.getDate() + nextServiceType.defaultDays);

        const newRecord: ServiceRecord = {
          id: `as-${Date.now()}`,
          projectId: projectId,
          serviceType: nextServiceType.id,
          scheduledDate: baseDate.toISOString().split('T')[0],
          status: 'scheduled',
          notes: '',
        };

        setServiceRecords([...serviceRecords, newRecord]);
      }
    }
  };

  // 点検完了処理
  const completeService = (recordId: string) => {
    setServiceRecords(
      serviceRecords.map((record) => {
        if (record.id === recordId) {
          const updatedRecord = {
            ...record,
            status: 'completed' as const,
            completedDate: new Date().toISOString().split('T')[0],
          };

          // 次回点検を自動スケジューリング
          scheduleNextService(record.projectId, record.serviceType);

          return updatedRecord;
        }
        return record;
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">アフターサービス管理</h1>
          <p className="text-gray-600">定期点検スケジュールの管理と実施記録</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/after-service-calendar"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <CalendarDays className="w-4 h-4" />
            カレンダー表示
          </Link>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            プロジェクト一覧へ
          </button>
        </div>
      </div>

      {/* ステータスサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">予定</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">期限超過</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">完了</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">プロジェクト</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべてのプロジェクト</option>
              {afterServiceProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.customerName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">ステータス</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="scheduled">予定</option>
              <option value="overdue">期限超過</option>
              <option value="completed">完了</option>
            </select>
          </div>
        </div>
      </div>

      {/* 点検スケジュールリスト */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            点検スケジュール
          </h2>
        </div>
        <div className="divide-y">
          {filteredRecords.map((record) => {
            const project = getProject(record.projectId);
            const serviceType = getServiceType(record.serviceType);

            if (!project || !serviceType) return null;

            return (
              <div key={record.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${serviceType.color}`}
                      >
                        {serviceType.name}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          record.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.status === 'completed'
                          ? '完了'
                          : record.status === 'overdue'
                            ? '期限超過'
                            : '予定'}
                      </span>
                    </div>

                    <h3 className="font-medium text-lg mb-1">{project.name}</h3>
                    <p className="text-gray-600 mb-2">
                      {project.customerName}様 | {project.address}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        予定日: {record.scheduledDate}
                      </span>
                      {record.completedDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          実施日: {record.completedDate}
                        </span>
                      )}
                      {record.inspector && <span>担当: {record.inspector}</span>}
                    </div>

                    {record.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <p className="font-medium mb-1">実施内容:</p>
                        <p>{record.notes}</p>
                        {record.issues && record.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">対応事項:</p>
                            <ul className="list-disc list-inside">
                              {record.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {record.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => completeService(record.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          完了登録
                        </button>
                        <button className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          日程変更
                        </button>
                      </>
                    )}
                    {record.status === 'completed' && (
                      <button className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        報告書
                      </button>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button className="p-2 border rounded hover:bg-gray-50">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 border rounded hover:bg-gray-50">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 border rounded hover:bg-gray-50">
                        <Home className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-12 text-center text-gray-500">該当する点検スケジュールがありません</div>
        )}
      </div>

      {/* 点検スケジュール一括生成 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">点検スケジュール一括生成</h3>
        <p className="text-sm text-gray-600 mb-4">
          竣工したプロジェクトに対して、標準的な点検スケジュールを一括で生成できます。
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          スケジュール生成
        </button>
      </div>
    </div>
  );
}
