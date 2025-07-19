import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, ExternalLink } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ja } from 'date-fns/locale';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type:
    | 'inspection-1m'
    | 'inspection-6m'
    | 'inspection-1y'
    | 'inspection-2y'
    | 'inspection-5y'
    | 'inspection-10y';
  customerId: string;
  customerName: string;
  address: string;
  dandoriWorkUrl?: string;
  status: 'pending' | 'completed';
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (eventId: string, newDate: Date) => void;
  onAddEvent: (date: Date) => void;
}

const eventColors = {
  'inspection-1m': 'bg-blue-100 text-blue-800 border-blue-200',
  'inspection-6m': 'bg-green-100 text-green-800 border-green-200',
  'inspection-1y': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'inspection-2y': 'bg-orange-100 text-orange-800 border-orange-200',
  'inspection-5y': 'bg-purple-100 text-purple-800 border-purple-200',
  'inspection-10y': 'bg-red-100 text-red-800 border-red-200',
};

const eventLabels = {
  'inspection-1m': '1ヶ月',
  'inspection-6m': '6ヶ月',
  'inspection-1y': '1年',
  'inspection-2y': '2年',
  'inspection-5y': '5年',
  'inspection-10y': '10年',
};

export default function Calendar({ events, onEventClick, onEventDrop, onAddEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent && !isSameDay(draggedEvent.date, date)) {
      onEventDrop(draggedEvent.id, date);
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          今日
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isDragOver = dragOverDate && isSameDay(day, dragOverDate);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-r border-b ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              } ${isDragOver ? 'bg-blue-50' : ''} ${dayIdx % 7 === 0 ? 'border-l' : ''}`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    !isCurrentMonth
                      ? 'text-gray-400'
                      : dayIdx % 7 === 0
                        ? 'text-red-600'
                        : dayIdx % 7 === 6
                          ? 'text-blue-600'
                          : 'text-gray-900'
                  } ${isToday ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}`}
                >
                  {format(day, 'd')}
                </span>
                {isCurrentMonth && (
                  <button
                    onClick={() => onAddEvent(day)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onClick={() => onEventClick(event)}
                    className={`px-2 py-1 text-xs rounded cursor-pointer border transition-all hover:shadow-sm ${
                      eventColors[event.type]
                    } ${event.status === 'completed' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{eventLabels[event.type]}</span>
                      {event.dandoriWorkUrl && <ExternalLink className="w-3 h-3" />}
                    </div>
                    <div className="truncate text-xs opacity-75">{event.customerName}</div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    onClick={() => onEventClick(dayEvents[0])}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    他 {dayEvents.length - 3} 件
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
