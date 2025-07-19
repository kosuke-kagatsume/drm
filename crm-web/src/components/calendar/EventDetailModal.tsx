import { useState } from 'react';
import { X, Calendar, MapPin, User, ExternalLink, Check, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarEvent } from './Calendar';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (event: CalendarEvent) => void;
}

const eventTypeLabels = {
  'inspection-1m': '1ヶ月点検',
  'inspection-6m': '6ヶ月点検',
  'inspection-1y': '1年点検',
  'inspection-2y': '2年点検',
  'inspection-5y': '5年点検',
  'inspection-10y': '10年点検',
};

const eventTypeColors = {
  'inspection-1m': 'bg-blue-100 text-blue-800',
  'inspection-6m': 'bg-green-100 text-green-800',
  'inspection-1y': 'bg-yellow-100 text-yellow-800',
  'inspection-2y': 'bg-orange-100 text-orange-800',
  'inspection-5y': 'bg-purple-100 text-purple-800',
  'inspection-10y': 'bg-red-100 text-red-800',
};

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onUpdate,
}: EventDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [dandoriUrl, setDandoriUrl] = useState(event?.dandoriWorkUrl || '');

  if (!isOpen || !event) return null;

  const handleSaveUrl = () => {
    onUpdate({
      ...event,
      dandoriWorkUrl: dandoriUrl,
    });
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    onUpdate({
      ...event,
      status: event.status === 'pending' ? 'completed' : 'pending',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">点検詳細</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-4">
          {/* 点検種別 */}
          <div>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${eventTypeColors[event.type]}`}
            >
              {eventTypeLabels[event.type]}
            </span>
          </div>

          {/* 顧客情報 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{event.customerName}</p>
                <p className="text-sm text-gray-600">ID: {event.customerId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">{event.address}</p>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600">
                {format(event.date, 'yyyy年M月d日（E）', { locale: ja })}
              </p>
            </div>
          </div>

          {/* ダンドリワークURL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">ダンドリワーク現場URL</label>
              {!isEditing && event.dandoriWorkUrl && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={dandoriUrl}
                  onChange={(e) => setDandoriUrl(e.target.value)}
                  placeholder="https://dandori.work/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUrl}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDandoriUrl(event.dandoriWorkUrl || '');
                    }}
                    className="px-3 py-1 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {event.dandoriWorkUrl ? (
                  <a
                    href={event.dandoriWorkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    現場を開く
                  </a>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    + URLを追加
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ステータス */}
          <div className="pt-4 border-t">
            <button
              onClick={handleToggleStatus}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                event.status === 'completed'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Check className="w-5 h-5" />
              {event.status === 'completed' ? '未完了に戻す' : '完了にする'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
