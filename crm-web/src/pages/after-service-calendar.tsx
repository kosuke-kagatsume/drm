import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import Calendar, { CalendarEvent } from '@/components/calendar/Calendar';
import EventDetailModal from '@/components/calendar/EventDetailModal';
import { mockProjects } from '@/lib/mock-data';

// モックデータ生成
const generateMockEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const today = new Date();
  const types: CalendarEvent['type'][] = [
    'inspection-1m',
    'inspection-6m',
    'inspection-1y',
    'inspection-2y',
    'inspection-5y',
    'inspection-10y',
  ];

  // 過去3ヶ月から未来3ヶ月のイベントを生成
  for (let i = -90; i <= 90; i++) {
    if (Math.random() > 0.9) {
      // 10%の確率でイベントを生成
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const project = mockProjects[Math.floor(Math.random() * mockProjects.length)];
      const type = types[Math.floor(Math.random() * types.length)];

      events.push({
        id: `event-${i}`,
        title: `${project.customerName}様 点検`,
        date,
        type,
        customerId: project.id,
        customerName: project.customerName,
        address: project.address || '東京都渋谷区',
        dandoriWorkUrl:
          Math.random() > 0.5 ? `https://dandori.work/projects/${project.id}` : undefined,
        status: i < 0 && Math.random() > 0.3 ? 'completed' : 'pending',
      });
    }
  }

  return events;
};

export default function AfterServiceCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(generateMockEvents());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEventDrop = (eventId: string, newDate: Date) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, date: newDate } : event)));
  };

  const handleAddEvent = (date: Date) => {
    // 実際の実装では、ここで新規イベント作成モーダルを開く
    console.log('Add event for date:', date);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEvent(updatedEvent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/after-service"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold">アフターサービス カレンダー</h1>
            </div>
            <Link
              to="/after-service"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <List className="w-4 h-4" />
              リスト表示
            </Link>
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="p-6">
        <Calendar
          events={events}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onAddEvent={handleAddEvent}
        />
      </div>

      {/* イベント詳細モーダル */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onUpdate={handleUpdateEvent}
      />

      {/* 凡例 */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">点検種別</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">1ヶ月点検</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-600">6ヶ月点検</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-sm text-gray-600">1年点検</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
              <span className="text-sm text-gray-600">2年点検</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
              <span className="text-sm text-gray-600">5年点検</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm text-gray-600">10年点検</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
