import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProjects } from '@/lib/mock-data';
import {
  Phone,
  Mail,
  Home,
  MessageSquare,
  Smartphone,
  Calendar,
  Plus,
  AlertCircle,
} from 'lucide-react';

// アクションタイプ
const actionTypes = [
  { id: 'phone', label: '電話', icon: Phone, color: 'bg-blue-500' },
  { id: 'email', label: 'メール', icon: Mail, color: 'bg-green-500' },
  { id: 'visit', label: '訪問', icon: Home, color: 'bg-purple-500' },
  { id: 'line', label: 'LINE', icon: MessageSquare, color: 'bg-emerald-500' },
  { id: 'sms', label: 'SMS', icon: Smartphone, color: 'bg-orange-500' },
];

// アラート設定オプション
const alertOptions = [
  { value: '1', label: '1日前' },
  { value: '3', label: '3日前' },
  { value: '7', label: '7日前' },
];

interface FollowUpRecord {
  id: string;
  date: string;
  actionType: string;
  content: string;
  attachments: string[];
  nextActionDate?: string;
  alerts: string[];
}

export default function FollowUpPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === projectId);

  const [records, setRecords] = useState<FollowUpRecord[]>([
    {
      id: '1',
      date: '2025-01-15 10:30',
      actionType: 'phone',
      content: '初回ヒアリング実施。予算感と希望工期を確認。',
      attachments: [],
      nextActionDate: '2025-01-20',
      alerts: ['3'],
    },
    {
      id: '2',
      date: '2025-01-20 14:00',
      actionType: 'email',
      content: '概算見積書を送付。詳細は以下URLから確認可能。',
      attachments: ['https://example.com/estimate/12345'],
      alerts: [],
    },
  ]);

  const [showNewRecord, setShowNewRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<FollowUpRecord>>({
    actionType: 'phone',
    content: '',
    attachments: [],
    alerts: [],
  });

  const handleAddRecord = () => {
    if (!newRecord.content) return;

    const record: FollowUpRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ja-JP'),
      actionType: newRecord.actionType || 'phone',
      content: newRecord.content,
      attachments: newRecord.attachments || [],
      nextActionDate: newRecord.nextActionDate,
      alerts: newRecord.alerts || [],
    };

    setRecords([record, ...records]);
    setNewRecord({
      actionType: 'phone',
      content: '',
      attachments: [],
      alerts: [],
    });
    setShowNewRecord(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const urls = e.dataTransfer
      .getData('text/uri-list')
      .split('\n')
      .filter((url) => url.trim());

    const newAttachments = [...(newRecord.attachments || []), ...files.map((f) => f.name), ...urls];

    setNewRecord({ ...newRecord, attachments: newAttachments });
  };

  if (!project) {
    return <div>プロジェクトが見つかりません</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="text-blue-600 hover:text-blue-800 mb-2"
        >
          ← プロジェクトに戻る
        </button>
        <h1 className="text-2xl font-bold">{project.name} - 追客履歴</h1>
        <p className="text-gray-600">{project.customerName}様</p>
      </div>

      {/* 新規追加ボタン */}
      <div className="mb-6">
        <button
          onClick={() => setShowNewRecord(!showNewRecord)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新規アクションを記録
        </button>
      </div>

      {/* 新規記録フォーム */}
      {showNewRecord && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">新規アクション記録</h3>

          {/* アクションタイプ選択 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">アクションタイプ</label>
            <div className="flex gap-2">
              {actionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setNewRecord({ ...newRecord, actionType: type.id })}
                    className={`p-3 rounded-lg transition-all ${
                      newRecord.actionType === type.id
                        ? `${type.color} text-white`
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 内容入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">内容</label>
            <textarea
              value={newRecord.content || ''}
              onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="対応内容を入力..."
            />
          </div>

          {/* 添付ファイル・URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">添付ファイル・URL</label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors"
            >
              <p className="text-gray-500 text-sm">ファイルをドラッグ&ドロップ または URLを入力</p>
              <input
                type="text"
                placeholder="URLを入力..."
                className="mt-2 w-full px-3 py-1 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    if (input.value) {
                      setNewRecord({
                        ...newRecord,
                        attachments: [...(newRecord.attachments || []), input.value],
                      });
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
            {newRecord.attachments && newRecord.attachments.length > 0 && (
              <div className="mt-2">
                {newRecord.attachments.map((att, idx) => (
                  <div key={idx} className="text-sm text-blue-600 hover:underline">
                    {att}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 次回アクション設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                次回アクション予定日
              </label>
              <input
                type="date"
                value={newRecord.nextActionDate || ''}
                onChange={(e) => setNewRecord({ ...newRecord, nextActionDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <AlertCircle className="inline w-4 h-4 mr-1" />
                アラート設定
              </label>
              <div className="flex gap-2">
                {alertOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={newRecord.alerts?.includes(option.value) || false}
                      onChange={(e) => {
                        const alerts = newRecord.alerts || [];
                        if (e.target.checked) {
                          setNewRecord({ ...newRecord, alerts: [...alerts, option.value] });
                        } else {
                          setNewRecord({
                            ...newRecord,
                            alerts: alerts.filter((a) => a !== option.value),
                          });
                        }
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <button
              onClick={handleAddRecord}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              記録を追加
            </button>
            <button
              onClick={() => setShowNewRecord(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 履歴一覧 */}
      <div className="space-y-4">
        {records.map((record) => {
          const actionType = actionTypes.find((t) => t.id === record.actionType);
          const Icon = actionType?.icon || Phone;

          return (
            <div key={record.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${actionType?.color || 'bg-gray-500'} text-white`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{actionType?.label}</span>
                      <span className="text-gray-500 text-sm ml-2">{record.date}</span>
                    </div>
                    {record.nextActionDate && (
                      <div className="text-sm text-gray-600">
                        次回: {record.nextActionDate}
                        {record.alerts.length > 0 && (
                          <span className="ml-2 text-orange-600">
                            🔔{' '}
                            {record.alerts
                              .map((a) => alertOptions.find((o) => o.value === a)?.label)
                              .join('・')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{record.content}</p>
                  {record.attachments.length > 0 && (
                    <div className="mt-2">
                      {record.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.startsWith('http') ? att : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block"
                        >
                          📎 {att}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
