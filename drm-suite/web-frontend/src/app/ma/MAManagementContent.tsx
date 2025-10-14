'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableEvent from '@/components/ma/draggable-event';
import DroppableDateCell from '@/components/ma/droppable-date-cell';
import EventEditModal from '@/components/ma/event-edit-modal';
import RAGAssistant from '@/components/rag-assistant';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Tab,
  Tabs,
  Badge,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Grid,
  Paper,
  TextField,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Send,
  Timeline,
  Add,
  PlayArrow,
  Pause,
  Stop,
  Edit,
  Delete,
  MoreVert,
  Email,
  WhatsApp,
  MessageOutlined,
  NotificationsActive,
  Analytics,
  Campaign,
  AutoMode,
  GroupWork,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Settings,
  FilterList,
  Download,
  Upload,
  Search,
  Refresh,
  ArrowForward,
  ArrowBack,
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  ViewWeek,
  ViewDay,
  ViewModule,
  Assessment,
  PersonAdd,
  Visibility,
  CloudUpload,
  Share,
  SaveAlt,
  AttachMoney,
  Science,
  Timer,
  TrendingDown,
  AutoFixHigh,
  Psychology,
  Speed,
  ArrowUpward,
  ArrowDownward,
  Circle,
  Paid,
  AccountBalance,
  Person,
  TrendingFlat,
  Home,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
} from 'recharts';
import { getMaDashboard } from '@/services/ma/dashboard';
import { MaDashboard } from '@/types/ma';

const COLORS = [
  '#667eea',
  '#f093fb',
  '#4facfe',
  '#fa709a',
  '#feca57',
  '#48dbfb',
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ma-tabpanel-${index}`}
      aria-labelledby={`ma-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function MAManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<MaDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // カレンダー機能の状態管理
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(
    'month',
  );
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 25)); // 2025年9月25日
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: '1',
      title: '展示場イベント',
      type: 'exhibition',
      date: new Date(2025, 8, 3),
      time: '10:00',
      participants: 50,
    },
    {
      id: '2',
      title: '断熱キャンペーン',
      type: 'campaign',
      date: new Date(2025, 8, 8),
      time: '終日',
    },
    {
      id: '3',
      title: 'フォローメール',
      type: 'follow',
      date: new Date(2025, 8, 12),
      time: '09:00',
    },
    {
      id: '4',
      title: '秋の展示会',
      type: 'exhibition',
      date: new Date(2025, 8, 15),
      time: '13:00',
      participants: 80,
    },
    {
      id: '5',
      title: '省エネ相談会',
      type: 'campaign',
      date: new Date(2025, 8, 20),
      time: '14:00',
    },
    {
      id: '6',
      title: '見積フォロー',
      type: 'follow',
      date: new Date(2025, 8, 25),
      time: '11:00',
    },
    {
      id: '7',
      title: '完工後フォロー',
      type: 'follow',
      date: new Date(2025, 8, 28),
      time: '15:00',
    },
  ]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await getMaDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load MA dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // ジャーニー管理タブの場合は専用ページへ遷移
    if (newValue === 1) {
      router.push('/ma/journey');
    }
    // メールタブの場合は専用ページへ遷移
    if (newValue === 2) {
      router.push('/ma/email');
    }
    // A/Bテストタブの場合は専用ページへ遷移
    if (newValue === 3) {
      router.push('/ma/ab-test');
    }
  };

  // カレンダー機能のハンドラー
  const handleEventDrop = (date: Date, event: any) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, date } : e)),
    );
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = (updatedEvent: any) => {
    if (updatedEvent.id) {
      setCalendarEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
      );
    } else {
      setCalendarEvents((prev) => [
        ...prev,
        { ...updatedEvent, id: Date.now().toString() },
      ]);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // 新規イベント作成（空のセルをクリック）
  const handleDateCellClick = (date: Date) => {
    setSelectedEvent({
      title: '',
      type: 'campaign',
      date: date,
      time: '10:00',
      participants: 0,
      location: '',
      description: '',
      reminder: '1day',
    });
    setShowEventModal(true);
  };

  // カレンダーのヘルパー関数（useCallbackでメモ化）
  const getEventsForDate = useCallback(
    (date: Date) => {
      return calendarEvents.filter((event) => {
        return (
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear()
        );
      });
    },
    [calendarEvents],
  );

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (current.getDay() === 0 && current > lastDay) break;
    }

    return days;
  }, []);

  // 週表示用のヘルパー関数（useCallbackでメモ化）
  const getDaysInWeek = useCallback((date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, []);

  // 時間スロット用のヘルパー関数（useMemoでメモ化 - 常に同じ結果）
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour}:00`);
    }
    return slots;
  }, []);

  // 後方互換性のため関数形式も残す
  const getTimeSlots = useCallback(() => timeSlots, [timeSlots]);

  // Realistic mock data
  const conversionFunnelData = [
    { stage: '訪問者', value: 12450, percentage: 100, color: '#667eea' },
    { stage: 'リード化', value: 3240, percentage: 26, color: '#764ba2' },
    { stage: '商談化', value: 856, percentage: 6.9, color: '#f093fb' },
    { stage: '見積提出', value: 342, percentage: 2.7, color: '#f5576c' },
    { stage: '成約', value: 126, percentage: 1.0, color: '#4facfe' },
  ];

  const journeyPerformance = [
    { month: '7月', リード獲得: 2850, 商談化: 342, 成約: 89 },
    { month: '8月', リード獲得: 3120, 商談化: 418, 成約: 102 },
    { month: '9月', リード獲得: 3240, 商談化: 456, 成約: 126 },
    { month: '10月', リード獲得: 3580, 商談化: 512, 成約: 145 },
  ];

  // 他の必要なデータ定義をここに追加
  const activeJourneys = [
    {
      id: '1',
      name: '新築検討者ジャーニー',
      status: 'active',
      contacts: 1250,
      conversion: 8.4,
      trend: 'up',
      steps: 7,
      avgDays: 45,
    },
    {
      id: '2',
      name: 'リフォーム検討者ジャーニー',
      status: 'active',
      contacts: 890,
      conversion: 6.2,
      trend: 'up',
      steps: 5,
      avgDays: 30,
    },
    {
      id: '3',
      name: '展示場来場者フォロー',
      status: 'active',
      contacts: 450,
      conversion: 12.5,
      trend: 'down',
      steps: 4,
      avgDays: 21,
    },
    {
      id: '4',
      name: '資料請求後ナーチャリング',
      status: 'draft',
      contacts: 650,
      conversion: 4.8,
      trend: 'up',
      steps: 6,
      avgDays: 60,
    },
    {
      id: '5',
      name: 'アフターメンテナンス',
      status: 'draft',
      contacts: 0,
      conversion: 0,
      trend: 'neutral',
      steps: 3,
      avgDays: 365,
    },
  ];

  const channelPerformance = [
    {
      channel: 'Web広告',
      リード: 1250,
      商談: 156,
      成約: 42,
      CPA: 8200,
      ROI: 380,
    },
    { channel: 'SEO', リード: 820, 商談: 98, 成約: 28, CPA: 3500, ROI: 680 },
    {
      channel: 'メール',
      リード: 680,
      商談: 112,
      成約: 35,
      CPA: 2100,
      ROI: 520,
    },
    { channel: 'SNS', リード: 490, 商談: 90, 成約: 21, CPA: 4800, ROI: 290 },
  ];

  const recentActivity = [
    {
      type: 'conversion',
      message: '新規成約：山田様（新築注文住宅）',
      time: '5分前',
      value: '¥45M',
    },
    {
      type: 'lead',
      message: '新規リード獲得（展示場来場）',
      time: '12分前',
      value: '+3件',
    },
    {
      type: 'alert',
      message: 'キャンペーン「秋の断熱リフォーム」予算80%消化',
      time: '30分前',
      value: '要確認',
    },
    {
      type: 'conversion',
      message: '商談ステージ移行：田中様→見積提出',
      time: '1時間前',
      value: '¥12M',
    },
    {
      type: 'lead',
      message: 'Webフォームからの問い合わせ',
      time: '2時間前',
      value: '+5件',
    },
  ];

  if (!data) {
    return (
      <Box p={3}>
        <Alert severity="error">
          MA管理システムのデータ読み込みに失敗しました。
        </Alert>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        {/* Header - Full Width */}
        <Box
          sx={{
            bgcolor: 'white',
            borderBottom: 1,
            borderColor: 'divider',
            px: 3,
            py: 2,
            boxShadow: 1,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <AutoMode sx={{ fontSize: 32, color: '#667eea' }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#1a1a1a' }}
                >
                  MA管理システム
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Marketing Automation Management
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={() => router.push('/dashboard')}
                sx={{ borderColor: '#667eea', color: '#667eea' }}
              >
                ダッシュボードに戻る
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
              >
                新規ジャーニー作成
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tabs Header - Full Width */}
        <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              px: 3,
              '& .MuiTab-root': { minHeight: 56, fontWeight: 600 },
            }}
          >
            <Tab icon={<Analytics />} label="ダッシュボード" />
            <Tab icon={<Timeline />} label="ジャーニー管理" />
            <Tab icon={<Email />} label="メール" />
            <Tab icon={<Science />} label="A/Bテスト" />
            <Tab icon={<AttachMoney />} label="ROI分析" />
            <Tab icon={<Schedule />} label="スケジュール" />
          </Tabs>
        </Box>

        {/* Main Container */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Main Content - Left Side */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Content Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* Dashboard Tab */}
              <TabPanel value={activeTab} index={0}>
                {/* KPI Cards - Extended to use full width */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2, width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Card
                      sx={{
                        background:
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        height: '100%',
                      }}
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.9, fontSize: '0.75rem' }}
                            >
                              総リード数
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{ fontWeight: 700, my: 1 }}
                            >
                              3,240
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              人
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <ArrowUpward sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                +15% 前月比
                              </Typography>
                            </Box>
                          </Box>
                          <People sx={{ fontSize: 48, opacity: 0.5 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Card
                      sx={{
                        background:
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        height: '100%',
                      }}
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.9, fontSize: '0.75rem' }}
                            >
                              今月のコンバージョン
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{ fontWeight: 700, my: 1 }}
                            >
                              126
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              件（CVR 3.9%）
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <ArrowUpward sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                +23% 前月比
                              </Typography>
                            </Box>
                          </Box>
                          <TrendingUp sx={{ fontSize: 48, opacity: 0.5 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Card
                      sx={{
                        background:
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        height: '100%',
                      }}
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.9, fontSize: '0.75rem' }}
                            >
                              稼働中ジャーニー
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{ fontWeight: 700, my: 1 }}
                            >
                              5
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              本（3本アクティブ）
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <Circle
                                sx={{ fontSize: 8, color: '#4caf50', mr: 0.5 }}
                              />
                              <Typography variant="caption">
                                稼働率 60%
                              </Typography>
                            </Box>
                          </Box>
                          <AutoMode sx={{ fontSize: 48, opacity: 0.5 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Card
                      sx={{
                        background:
                          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white',
                        height: '100%',
                      }}
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.9, fontSize: '0.75rem' }}
                            >
                              月間ROI
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{ fontWeight: 700, my: 1 }}
                            >
                              425
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              %（投資対効果）
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <ArrowUpward sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                +85% 改善
                              </Typography>
                            </Box>
                          </Box>
                          <AttachMoney sx={{ fontSize: 48, opacity: 0.5 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Email Quick Access Card */}
                <Box sx={{ mb: 2 }}>
                  <Card
                    sx={{
                      background:
                        'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                      color: 'white',
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Email sx={{ fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              メールコミュニケーション
                            </Typography>
                            <Box display="flex" gap={3} mt={1}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.9 }}
                                >
                                  本日の配信
                                </Typography>
                                <Typography variant="h6">2,456件</Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.9 }}
                                >
                                  平均開封率
                                </Typography>
                                <Typography variant="h6">28.4%</Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ opacity: 0.9 }}
                                >
                                  クリック率
                                </Typography>
                                <Typography variant="h6">5.2%</Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => router.push('/ma/email')}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                          }}
                          endIcon={<ArrowForward />}
                        >
                          メール管理へ
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Main Dashboard Content - Optimized Layout */}
                <Grid container spacing={1.5}>
                  {/* Left Column */}
                  <Grid item xs={12} lg={6}>
                    {/* Conversion Funnel - Taller for better visibility */}
                    <Card sx={{ mb: 1.5, height: 500 }}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 3 }}
                        >
                          コンバージョンファネル分析
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          {conversionFunnelData.map((stage, index) => (
                            <Box key={stage.stage} sx={{ mb: 3 }}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: stage.color,
                                    }}
                                  />
                                  <Typography variant="body1" fontWeight={600}>
                                    {stage.stage}
                                  </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Typography variant="body1" fontWeight={700}>
                                    {stage.value.toLocaleString()}人
                                  </Typography>
                                  <Chip
                                    label={`${stage.percentage}%`}
                                    size="small"
                                    sx={{
                                      bgcolor: stage.color,
                                      color: 'white',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={stage.percentage}
                                sx={{
                                  height: 28,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(0,0,0,0.05)',
                                  '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}dd 100%)`,
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Journey Performance Trend - Compact */}
                    <Card sx={{ height: 360 }}>
                      <CardContent
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={3}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            月次パフォーマンストレンド
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={selectedPeriod}
                              onChange={(e) =>
                                setSelectedPeriod(e.target.value)
                              }
                              sx={{ fontSize: 14 }}
                            >
                              <MenuItem value="quarter">四半期</MenuItem>
                              <MenuItem value="month">月次</MenuItem>
                              <MenuItem value="week">週次</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <ResponsiveContainer width="100%" height={260}>
                          <ComposedChart data={journeyPerformance}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar
                              dataKey="リード獲得"
                              fill="#667eea"
                              barSize={40}
                            />
                            <Bar dataKey="商談化" fill="#f093fb" barSize={40} />
                            <Line
                              type="monotone"
                              dataKey="成約"
                              stroke="#4facfe"
                              strokeWidth={3}
                              dot={{ r: 5 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} lg={6}>
                    {/* Active Journeys Management - Matching height */}
                    <Card sx={{ mb: 1.5, height: 500 }}>
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={3}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            アクティブジャーニー
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            variant="outlined"
                          >
                            追加
                          </Button>
                        </Box>
                        <Box sx={{ overflowY: 'auto', height: 400 }}>
                          {activeJourneys.map((journey) => (
                            <Paper
                              key={journey.id}
                              sx={{
                                p: 2,
                                mb: 2,
                                bgcolor:
                                  journey.status === 'active'
                                    ? '#f8f9fa'
                                    : '#fefefe',
                                border: '1px solid',
                                borderColor:
                                  journey.status === 'active'
                                    ? '#667eea20'
                                    : '#e0e0e0',
                              }}
                            >
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1.5}
                                >
                                  <Circle
                                    sx={{
                                      fontSize: 10,
                                      color:
                                        journey.status === 'active'
                                          ? '#4caf50'
                                          : '#ffa726',
                                    }}
                                  />
                                  <Typography variant="body1" fontWeight={600}>
                                    {journey.name}
                                  </Typography>
                                </Box>
                                <IconButton size="small">
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={3}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    コンタクト
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {journey.contacts.toLocaleString()}
                                  </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    CVR
                                  </Typography>
                                  <Box display="flex" alignItems="center">
                                    <Typography
                                      variant="body1"
                                      fontWeight={600}
                                    >
                                      {journey.conversion}%
                                    </Typography>
                                    {journey.trend === 'up' ? (
                                      <ArrowUpward
                                        sx={{
                                          fontSize: 14,
                                          color: '#4caf50',
                                          ml: 0.5,
                                        }}
                                      />
                                    ) : (
                                      <ArrowDownward
                                        sx={{
                                          fontSize: 14,
                                          color: '#f44336',
                                          ml: 0.5,
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ステップ数
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {journey.steps}
                                  </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    平均日数
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {journey.avgDays}日
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Channel Performance Analysis - Compact height */}
                    <Card sx={{ height: 360 }}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 3 }}
                        >
                          チャネル別パフォーマンス
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>チャネル</TableCell>
                                <TableCell align="right">リード</TableCell>
                                <TableCell align="right">商談</TableCell>
                                <TableCell align="right">成約</TableCell>
                                <TableCell align="right">CPA</TableCell>
                                <TableCell align="right">ROI</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {channelPerformance.map((channel) => (
                                <TableRow key={channel.channel}>
                                  <TableCell>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      {channel.channel === 'Web広告' && (
                                        <Campaign
                                          fontSize="small"
                                          color="primary"
                                        />
                                      )}
                                      {channel.channel === 'SEO' && (
                                        <Search
                                          fontSize="small"
                                          color="success"
                                        />
                                      )}
                                      {channel.channel === 'メール' && (
                                        <Email
                                          fontSize="small"
                                          color="warning"
                                        />
                                      )}
                                      {channel.channel === 'SNS' && (
                                        <Share fontSize="small" color="info" />
                                      )}
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {channel.channel}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    {channel.リード.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    {channel.商談}
                                  </TableCell>
                                  <TableCell align="right">
                                    {channel.成約}
                                  </TableCell>
                                  <TableCell align="right">
                                    ¥{channel.CPA.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={`${channel.ROI}%`}
                                      size="small"
                                      color={
                                        channel.ROI > 400
                                          ? 'success'
                                          : channel.ROI > 200
                                            ? 'warning'
                                            : 'default'
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Other Tabs */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                  カスタマージャーニー管理
                </Typography>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                  A/Bテスト管理
                </Typography>
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                {/* ROI分析タブ */}
                <Box sx={{ p: 2 }}>
                  {/* ヘッダー */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      💰 ROI分析・レポート
                    </Typography>
                    <Box display="flex" gap={1}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value="month" sx={{ fontSize: 14 }}>
                          <MenuItem value="week">週次</MenuItem>
                          <MenuItem value="month">月次</MenuItem>
                          <MenuItem value="quarter">四半期</MenuItem>
                          <MenuItem value="year">年次</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        size="small"
                      >
                        レポート出力
                      </Button>
                    </Box>
                  </Box>

                  {/* KPIカード */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                総ROI
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                425%
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <TrendingUp sx={{ fontSize: 16 }} />
                                <Typography variant="caption">
                                  前月比 +85%
                                </Typography>
                              </Box>
                            </Box>
                            <AttachMoney sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                総収益
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                ¥18.5M
                              </Typography>
                              <Typography variant="caption">
                                今月実績
                              </Typography>
                            </Box>
                            <Paid sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                総投資額
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                ¥3.2M
                              </Typography>
                              <Typography variant="caption">
                                マーケティング費用
                              </Typography>
                            </Box>
                            <AccountBalance
                              sx={{ fontSize: 40, opacity: 0.5 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                CPA
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                ¥8,420
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <TrendingDown sx={{ fontSize: 16 }} />
                                <Typography variant="caption">
                                  前月比 -12%
                                </Typography>
                              </Box>
                            </Box>
                            <Person sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* チャネル別ROI分析 */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={8}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            📊 チャネル別ROI分析
                          </Typography>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={[
                                {
                                  channel: 'Web広告',
                                  roi: 380,
                                  revenue: 6800000,
                                  cost: 1500000,
                                },
                                {
                                  channel: 'メール',
                                  roi: 520,
                                  revenue: 4200000,
                                  cost: 680000,
                                },
                                {
                                  channel: 'SNS',
                                  roi: 290,
                                  revenue: 3100000,
                                  cost: 800000,
                                },
                                {
                                  channel: 'SEO',
                                  roi: 680,
                                  revenue: 2400000,
                                  cost: 300000,
                                },
                                {
                                  channel: 'イベント',
                                  roi: 150,
                                  revenue: 2000000,
                                  cost: 800000,
                                },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="channel" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar
                                dataKey="roi"
                                fill="#667eea"
                                name="ROI (%)"
                              />
                            </BarChart>
                          </ResponsiveContainer>

                          {/* チャネル詳細テーブル */}
                          <TableContainer sx={{ mt: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>チャネル</TableCell>
                                  <TableCell align="right">投資額</TableCell>
                                  <TableCell align="right">収益</TableCell>
                                  <TableCell align="right">ROI</TableCell>
                                  <TableCell align="right">状態</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {[
                                  {
                                    channel: 'Web広告',
                                    cost: '¥1.5M',
                                    revenue: '¥6.8M',
                                    roi: '380%',
                                    status: 'success',
                                  },
                                  {
                                    channel: 'メール',
                                    cost: '¥680K',
                                    revenue: '¥4.2M',
                                    roi: '520%',
                                    status: 'success',
                                  },
                                  {
                                    channel: 'SNS',
                                    cost: '¥800K',
                                    revenue: '¥3.1M',
                                    roi: '290%',
                                    status: 'warning',
                                  },
                                  {
                                    channel: 'SEO',
                                    cost: '¥300K',
                                    revenue: '¥2.4M',
                                    roi: '680%',
                                    status: 'success',
                                  },
                                  {
                                    channel: 'イベント',
                                    cost: '¥800K',
                                    revenue: '¥2.0M',
                                    roi: '150%',
                                    status: 'error',
                                  },
                                ].map((row) => (
                                  <TableRow key={row.channel}>
                                    <TableCell>{row.channel}</TableCell>
                                    <TableCell align="right">
                                      {row.cost}
                                    </TableCell>
                                    <TableCell align="right">
                                      {row.revenue}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                      >
                                        {row.roi}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip
                                        label={
                                          row.status === 'success'
                                            ? '好調'
                                            : row.status === 'warning'
                                              ? '要改善'
                                              : '要対策'
                                        }
                                        size="small"
                                        color={row.status as any}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* キャンペーン別パフォーマンス */}
                    <Grid item xs={4}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            🎯 キャンペーン別ROI
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: '夏季キャンペーン',
                                      value: 35,
                                      color: '#667eea',
                                    },
                                    {
                                      name: '新築祝い',
                                      value: 28,
                                      color: '#764ba2',
                                    },
                                    {
                                      name: 'リフォーム',
                                      value: 22,
                                      color: '#f093fb',
                                    },
                                    {
                                      name: 'メンテナンス',
                                      value: 15,
                                      color: '#4facfe',
                                    },
                                  ]}
                                  dataKey="value"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                >
                                  {[0, 1, 2, 3].map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        [
                                          '#667eea',
                                          '#764ba2',
                                          '#f093fb',
                                          '#4facfe',
                                        ][index]
                                      }
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>

                          <List dense>
                            {[
                              {
                                name: '夏季キャンペーン',
                                roi: '520%',
                                trend: 'up',
                              },
                              { name: '新築祝い', roi: '380%', trend: 'up' },
                              {
                                name: 'リフォーム',
                                roi: '290%',
                                trend: 'stable',
                              },
                              {
                                name: 'メンテナンス',
                                roi: '180%',
                                trend: 'down',
                              },
                            ].map((item) => (
                              <ListItem key={item.name}>
                                <ListItemText
                                  primary={item.name}
                                  secondary={`ROI: ${item.roi}`}
                                />
                                <ListItemSecondaryAction>
                                  {item.trend === 'up' ? (
                                    <TrendingUp color="success" />
                                  ) : item.trend === 'down' ? (
                                    <TrendingDown color="error" />
                                  ) : (
                                    <TrendingFlat color="action" />
                                  )}
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* コンバージョンファネル分析 */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            🔄 コンバージョンファネル
                          </Typography>
                          <Box sx={{ px: 3 }}>
                            {[
                              {
                                stage: '認知',
                                value: 12450,
                                color: '#667eea',
                                percent: 100,
                              },
                              {
                                stage: '興味',
                                value: 8920,
                                color: '#764ba2',
                                percent: 72,
                              },
                              {
                                stage: '検討',
                                value: 4230,
                                color: '#f093fb',
                                percent: 34,
                              },
                              {
                                stage: '見積依頼',
                                value: 1856,
                                color: '#f5576c',
                                percent: 15,
                              },
                              {
                                stage: '成約',
                                value: 426,
                                color: '#4facfe',
                                percent: 3.4,
                              },
                            ].map((stage, index) => (
                              <Box key={stage.stage} sx={{ mb: 2 }}>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  mb={0.5}
                                >
                                  <Typography variant="body2" fontWeight={600}>
                                    {stage.stage}
                                  </Typography>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Typography variant="body2">
                                      {stage.value.toLocaleString()}人
                                    </Typography>
                                    <Chip
                                      label={`${stage.percent}%`}
                                      size="small"
                                      sx={{
                                        bgcolor: stage.color,
                                        color: 'white',
                                      }}
                                    />
                                  </Box>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={stage.percent}
                                  sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: stage.color,
                                      borderRadius: 1,
                                    },
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* 月次トレンド */}
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            📈 月次ROIトレンド
                          </Typography>
                          <ResponsiveContainer width="100%" height={280}>
                            <LineChart
                              data={[
                                { month: '4月', roi: 280, cpa: 12500 },
                                { month: '5月', roi: 320, cpa: 11200 },
                                { month: '6月', roi: 290, cpa: 11800 },
                                { month: '7月', roi: 380, cpa: 9800 },
                                { month: '8月', roi: 420, cpa: 8900 },
                                { month: '9月', roi: 425, cpa: 8420 },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <RechartsTooltip />
                              <Legend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="roi"
                                stroke="#667eea"
                                strokeWidth={2}
                                name="ROI (%)"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="cpa"
                                stroke="#f5576c"
                                strokeWidth={2}
                                name="CPA (¥)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={5}>
                {/* スケジュール管理タブ */}
                <Box sx={{ p: 2 }}>
                  {/* ヘッダー */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      📅 建設業界特化スケジュール管理
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        startIcon={<CalendarToday />}
                        size="small"
                      >
                        今月のスケジュール
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        sx={{
                          background:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        キャンペーン作成
                      </Button>
                    </Box>
                  </Box>

                  {/* ビュー切替 */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Box>
                      <Button
                        variant={
                          calendarView === 'month' ? 'contained' : 'outlined'
                        }
                        sx={{
                          mr: 1,
                          ...(calendarView === 'month' && {
                            background:
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }),
                        }}
                        startIcon={<ViewModule />}
                        onClick={() => setCalendarView('month')}
                      >
                        月表示
                      </Button>
                      <Button
                        variant={
                          calendarView === 'week' ? 'contained' : 'outlined'
                        }
                        sx={{
                          mr: 1,
                          ...(calendarView === 'week' && {
                            background:
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }),
                        }}
                        startIcon={<ViewWeek />}
                        onClick={() => setCalendarView('week')}
                      >
                        週表示
                      </Button>
                      <Button
                        variant={
                          calendarView === 'day' ? 'contained' : 'outlined'
                        }
                        sx={{
                          ...(calendarView === 'day' && {
                            background:
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }),
                        }}
                        startIcon={<ViewDay />}
                        onClick={() => setCalendarView('day')}
                      >
                        日表示
                      </Button>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          if (calendarView === 'month') {
                            newDate.setMonth(newDate.getMonth() - 1);
                          } else if (calendarView === 'week') {
                            newDate.setDate(newDate.getDate() - 7);
                          } else {
                            newDate.setDate(newDate.getDate() - 1);
                          }
                          setSelectedDate(newDate);
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          minWidth: 180,
                          textAlign: 'center',
                        }}
                      >
                        {calendarView === 'month'
                          ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
                          : calendarView === 'week'
                            ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月 第${Math.ceil(selectedDate.getDate() / 7)}週`
                            : `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          if (calendarView === 'month') {
                            newDate.setMonth(newDate.getMonth() + 1);
                          } else if (calendarView === 'week') {
                            newDate.setDate(newDate.getDate() + 7);
                          } else {
                            newDate.setDate(newDate.getDate() + 1);
                          }
                          setSelectedDate(newDate);
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedDate(new Date())}
                        sx={{ ml: 2 }}
                      >
                        今日
                      </Button>
                    </Box>
                  </Box>

                  {/* 今月の概要カード */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                今月の配信予定
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                28
                              </Typography>
                              <Typography variant="caption">
                                件（メール・SMS・DM）
                              </Typography>
                            </Box>
                            <Send sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                展示場イベント
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                5
                              </Typography>
                              <Typography variant="caption">
                                件（相談会・見学会）
                              </Typography>
                            </Box>
                            <Home sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                季節キャンペーン
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                3
                              </Typography>
                              <Typography variant="caption">
                                件（冬前断熱・年末）
                              </Typography>
                            </Box>
                            <Psychology sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={3}>
                      <Card
                        sx={{
                          background:
                            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          color: 'white',
                        }}
                      >
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.9 }}
                              >
                                自動フォロー
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, my: 0.5 }}
                              >
                                156
                              </Typography>
                              <Typography variant="caption">
                                件（見積後・完工後）
                              </Typography>
                            </Box>
                            <AutoFixHigh sx={{ fontSize: 40, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* カレンダー＆詳細 */}
                  <Grid container spacing={2}>
                    {/* 左：カレンダービュー */}
                    <Grid item xs={8}>
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            📅 2025年9月 キャンペーンカレンダー
                          </Typography>

                          {/* カレンダーグリッド - ドラッグ&ドロップ対応 */}
                          <Box
                            sx={{
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                            }}
                          >
                            {/* 月表示 */}
                            {calendarView === 'month' && (
                              <>
                                {/* ヘッダー（曜日） */}
                                <Grid container>
                                  {[
                                    '日',
                                    '月',
                                    '火',
                                    '水',
                                    '木',
                                    '金',
                                    '土',
                                  ].map((day, index) => (
                                    <Grid item xs={12 / 7} key={day}>
                                      <Box
                                        sx={{
                                          p: 1,
                                          bgcolor: '#f5f5f5',
                                          textAlign: 'center',
                                          borderRight:
                                            index < 6
                                              ? '1px solid #e0e0e0'
                                              : 'none',
                                          color:
                                            index === 0
                                              ? '#f44336'
                                              : index === 6
                                                ? '#2196f3'
                                                : 'inherit',
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                        >
                                          {day}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  ))}
                                </Grid>

                                {/* カレンダーの日付 - ドラッグ&ドロップ対応 */}
                                <Grid container>
                                  {getDaysInMonth(selectedDate).map(
                                    (date, index) => {
                                      const events = getEventsForDate(date);
                                      const isCurrentMonth =
                                        date.getMonth() ===
                                        selectedDate.getMonth();
                                      const isToday =
                                        date.getDate() ===
                                          new Date().getDate() &&
                                        date.getMonth() ===
                                          new Date().getMonth() &&
                                        date.getFullYear() ===
                                          new Date().getFullYear();

                                      return (
                                        <Grid
                                          item
                                          xs={12 / 7}
                                          key={index}
                                          sx={{
                                            border: '1px solid #e0e0e0',
                                            borderTop: 'none',
                                            borderLeft:
                                              index % 7 === 0
                                                ? '1px solid #e0e0e0'
                                                : 'none',
                                          }}
                                        >
                                          <DroppableDateCell
                                            date={date}
                                            onDropEvent={handleEventDrop}
                                            isToday={isToday}
                                            isCurrentMonth={isCurrentMonth}
                                            onClick={() =>
                                              handleDateCellClick(date)
                                            }
                                          >
                                            {events.map((event) => (
                                              <DraggableEvent
                                                key={event.id}
                                                event={event}
                                                onClick={handleEventClick}
                                              />
                                            ))}
                                          </DroppableDateCell>
                                        </Grid>
                                      );
                                    },
                                  )}
                                </Grid>
                              </>
                            )}

                            {/* 週表示 */}
                            {calendarView === 'week' && (
                              <Box sx={{ display: 'flex' }}>
                                {/* 時間軸 */}
                                <Box
                                  sx={{
                                    width: 60,
                                    borderRight: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: 40,
                                      borderBottom: '1px solid #e0e0e0',
                                    }}
                                  />
                                  {getTimeSlots().map((time) => (
                                    <Box
                                      key={time}
                                      sx={{
                                        height: 60,
                                        borderBottom: '1px solid #e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        color: 'text.secondary',
                                      }}
                                    >
                                      {time}
                                    </Box>
                                  ))}
                                </Box>

                                {/* 週の日付 */}
                                {getDaysInWeek(selectedDate).map(
                                  (date, index) => {
                                    const isToday =
                                      date.toDateString() ===
                                      new Date().toDateString();
                                    const dayEvents = getEventsForDate(date);

                                    return (
                                      <Box
                                        key={index}
                                        sx={{
                                          flex: 1,
                                          borderRight:
                                            index < 6
                                              ? '1px solid #e0e0e0'
                                              : 'none',
                                        }}
                                      >
                                        {/* 日付ヘッダー */}
                                        <Box
                                          sx={{
                                            height: 40,
                                            bgcolor: isToday
                                              ? 'primary.light'
                                              : '#f5f5f5',
                                            borderBottom: '1px solid #e0e0e0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color:
                                              index === 0
                                                ? '#f44336'
                                                : index === 6
                                                  ? '#2196f3'
                                                  : 'inherit',
                                          }}
                                        >
                                          <Typography variant="caption">
                                            {
                                              [
                                                '日',
                                                '月',
                                                '火',
                                                '水',
                                                '木',
                                                '金',
                                                '土',
                                              ][date.getDay()]
                                            }
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            fontWeight={isToday ? 700 : 400}
                                          >
                                            {date.getDate()}
                                          </Typography>
                                        </Box>

                                        {/* 時間スロット */}
                                        {getTimeSlots().map((time) => (
                                          <Box
                                            key={time}
                                            sx={{
                                              height: 60,
                                              borderBottom: '1px solid #e0e0e0',
                                              p: 0.5,
                                              position: 'relative',
                                              '&:hover': {
                                                bgcolor: 'action.hover',
                                              },
                                              cursor: 'pointer',
                                            }}
                                            onClick={() =>
                                              handleDateCellClick(date)
                                            }
                                          >
                                            {/* ここにイベントを表示 */}
                                            {dayEvents
                                              .slice(0, 2)
                                              .map((event, i) => (
                                                <Box
                                                  key={event.id}
                                                  sx={{
                                                    position: 'absolute',
                                                    top: i * 25,
                                                    left: 2,
                                                    right: 2,
                                                    bgcolor:
                                                      event.type ===
                                                      'exhibition'
                                                        ? '#f093fb'
                                                        : event.type ===
                                                            'campaign'
                                                          ? '#667eea'
                                                          : '#4facfe',
                                                    color: 'white',
                                                    p: 0.25,
                                                    borderRadius: 0.5,
                                                    fontSize: '0.65rem',
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                  }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEventClick(event);
                                                  }}
                                                >
                                                  {event.time} {event.title}
                                                </Box>
                                              ))}
                                          </Box>
                                        ))}
                                      </Box>
                                    );
                                  },
                                )}
                              </Box>
                            )}

                            {/* 日表示 */}
                            {calendarView === 'day' && (
                              <Box>
                                {/* 日付ヘッダー */}
                                <Box
                                  sx={{
                                    p: 2,
                                    bgcolor:
                                      selectedDate.toDateString() ===
                                      new Date().toDateString()
                                        ? 'primary.light'
                                        : '#f5f5f5',
                                    borderBottom: '1px solid #e0e0e0',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography variant="h6" fontWeight={600}>
                                    {selectedDate.getFullYear()}年
                                    {selectedDate.getMonth() + 1}月
                                    {selectedDate.getDate()}日 （
                                    {
                                      [
                                        '日',
                                        '月',
                                        '火',
                                        '水',
                                        '木',
                                        '金',
                                        '土',
                                      ][selectedDate.getDay()]
                                    }
                                    ）
                                  </Typography>
                                </Box>

                                {/* タイムライン */}
                                <Box sx={{ display: 'flex' }}>
                                  {/* 時間軸 */}
                                  <Box
                                    sx={{
                                      width: 80,
                                      borderRight: '1px solid #e0e0e0',
                                    }}
                                  >
                                    {getTimeSlots().map((time) => (
                                      <Box
                                        key={time}
                                        sx={{
                                          height: 80,
                                          borderBottom: '1px solid #e0e0e0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.875rem',
                                          fontWeight: 500,
                                          color: 'text.secondary',
                                        }}
                                      >
                                        {time}
                                      </Box>
                                    ))}
                                  </Box>

                                  {/* イベントエリア */}
                                  <Box sx={{ flex: 1 }}>
                                    {getTimeSlots().map((time) => {
                                      const hour = parseInt(time.split(':')[0]);
                                      const dayEvents = getEventsForDate(
                                        selectedDate,
                                      ).filter((event) => {
                                        if (
                                          !event.time ||
                                          event.time === '終日'
                                        )
                                          return hour === 8;
                                        const eventHour = parseInt(
                                          event.time.split(':')[0],
                                        );
                                        return eventHour === hour;
                                      });

                                      return (
                                        <Box
                                          key={time}
                                          sx={{
                                            height: 80,
                                            borderBottom: '1px solid #e0e0e0',
                                            p: 1,
                                            '&:hover': {
                                              bgcolor: 'action.hover',
                                            },
                                            cursor: 'pointer',
                                            position: 'relative',
                                          }}
                                          onClick={() => {
                                            const newDate = new Date(
                                              selectedDate,
                                            );
                                            newDate.setHours(hour, 0, 0, 0);
                                            handleDateCellClick(newDate);
                                          }}
                                        >
                                          {dayEvents.map((event, i) => (
                                            <Paper
                                              key={event.id}
                                              elevation={2}
                                              sx={{
                                                position: 'absolute',
                                                top: 8 + i * 35,
                                                left: 8,
                                                right: 8,
                                                background: `linear-gradient(135deg, ${
                                                  event.type === 'exhibition'
                                                    ? '#f093fb'
                                                    : event.type === 'campaign'
                                                      ? '#667eea'
                                                      : '#4facfe'
                                                } 0%, ${
                                                  event.type === 'exhibition'
                                                    ? '#f093fbaa'
                                                    : event.type === 'campaign'
                                                      ? '#667eeaaa'
                                                      : '#4facfeaa'
                                                } 100%)`,
                                                color: 'white',
                                                p: 1,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                  transform: 'scale(1.02)',
                                                },
                                                transition: 'transform 0.2s',
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEventClick(event);
                                              }}
                                            >
                                              <Typography
                                                variant="caption"
                                                fontWeight={600}
                                              >
                                                {event.time} - {event.title}
                                              </Typography>
                                              {event.participants > 0 && (
                                                <Typography
                                                  variant="caption"
                                                  display="block"
                                                >
                                                  参加者: {event.participants}名
                                                </Typography>
                                              )}
                                            </Paper>
                                          ))}
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </Box>

                          {/* 凡例 */}
                          <Box
                            display="flex"
                            gap={2}
                            mt={2}
                            justifyContent="center"
                          >
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: '#f093fb',
                                  borderRadius: 0.5,
                                }}
                              ></Box>
                              <Typography variant="caption">
                                展示場イベント
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: '#667eea',
                                  borderRadius: 0.5,
                                }}
                              ></Box>
                              <Typography variant="caption">
                                季節キャンペーン
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: '#4facfe',
                                  borderRadius: 0.5,
                                }}
                              ></Box>
                              <Typography variant="caption">
                                自動フォロー
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* 右：詳細情報 */}
                    <Grid item xs={4}>
                      {/* 今日の予定 */}
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            📋 今日の予定（9/25）
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor: '#667eea',
                                    width: 32,
                                    height: 32,
                                  }}
                                >
                                  <Send sx={{ fontSize: 16 }} />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary="断熱工事キャンペーン配信"
                                secondary="対象：築10年以上 342件"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor: '#f093fb',
                                    width: 32,
                                    height: 32,
                                  }}
                                >
                                  <People sx={{ fontSize: 16 }} />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary="見積フォローメール"
                                secondary="1週間後自動配信 28件"
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>

                      {/* 建設業界スケジュールテンプレート */}
                      <Card>
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            🏗️ 業界テンプレート
                          </Typography>
                          <List dense>
                            <ListItem button>
                              <ListItemText
                                primary="春の新築シーズン"
                                secondary="3-5月 住宅展示場キャンペーン"
                              />
                              <ListItemSecondaryAction>
                                <IconButton size="small">
                                  <Add />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem button>
                              <ListItemText
                                primary="梅雨前防水工事"
                                secondary="5月中旬 雨漏り対策PR"
                              />
                              <ListItemSecondaryAction>
                                <IconButton size="small">
                                  <Add />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem button>
                              <ListItemText
                                primary="夏の省エネリフォーム"
                                secondary="6-8月 断熱・遮熱工事"
                              />
                              <ListItemSecondaryAction>
                                <IconButton size="small">
                                  <Add />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem button>
                              <ListItemText
                                primary="年末駆け込みリフォーム"
                                secondary="11-12月 税制優遇活用"
                              />
                              <ListItemSecondaryAction>
                                <IconButton size="small">
                                  <Add />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* 自動化フォローアップ設定 */}
                  <Box sx={{ mt: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 3 }}
                        >
                          🤖 自動フォローアップ設定
                        </Typography>
                        <Grid container spacing={3}>
                          {[
                            {
                              title: '見積後フォロー',
                              description:
                                '見積提出後の自動フォローアップシーケンス',
                              schedule: [
                                '1日後：お礼メール',
                                '1週間後：進捗確認',
                                '1ヶ月後：再提案',
                              ],
                              status: 'active',
                            },
                            {
                              title: '工事完了後フォロー',
                              description:
                                '工事完了後の満足度調査とメンテナンス案内',
                              schedule: [
                                '1週間後：満足度調査',
                                '1年後：点検案内',
                                '5年後：リフォーム提案',
                              ],
                              status: 'active',
                            },
                            {
                              title: '築年数別リフォーム提案',
                              description:
                                '築年数に応じた適切なタイミングでの提案',
                              schedule: [
                                '5年後：外壁塗装',
                                '10年後：水回り',
                                '15年後：全面リフォーム',
                              ],
                              status: 'draft',
                            },
                          ].map((automation, index) => (
                            <Grid item xs={4} key={index}>
                              <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    mb={2}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{ fontWeight: 600, fontSize: 14 }}
                                    >
                                      {automation.title}
                                    </Typography>
                                    <Chip
                                      label={
                                        automation.status === 'active'
                                          ? '稼働中'
                                          : '下書き'
                                      }
                                      size="small"
                                      color={
                                        automation.status === 'active'
                                          ? 'success'
                                          : 'default'
                                      }
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                  >
                                    {automation.description}
                                  </Typography>
                                  <Box>
                                    {automation.schedule.map((item, idx) => (
                                      <Box
                                        key={idx}
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                        mb={0.5}
                                      >
                                        <Circle
                                          sx={{ fontSize: 6, color: '#667eea' }}
                                        />
                                        <Typography variant="caption">
                                          {item}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                  <Box mt={2} display="flex" gap={1}>
                                    <Button size="small" variant="outlined">
                                      編集
                                    </Button>
                                    <Button size="small" variant="outlined">
                                      {automation.status === 'active'
                                        ? '停止'
                                        : '開始'}
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          </Box>

          {/* Right Sidebar - Optimized Size */}
          <Box
            sx={{
              width: 320,
              borderLeft: 1,
              borderColor: 'divider',
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* RAG Assistant - Appropriate height */}
            <Box
              sx={{
                height: 450,
                flexShrink: 0,
                borderBottom: 1,
                borderColor: 'divider',
                overflow: 'auto',
              }}
            >
              <RAGAssistant />
            </Box>

            {/* Real-time Activities - Remaining space */}
            <Box
              sx={{
                flex: 1,
                minHeight: 200,
                p: 2,
                overflowY: 'auto',
                bgcolor: '#fafafa',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                リアルタイムアクティビティ
              </Typography>
              <Stack spacing={1.5}>
                {recentActivity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box display="flex" gap={1}>
                        <Circle
                          sx={{
                            fontSize: 8,
                            color:
                              activity.type === 'conversion'
                                ? '#4caf50'
                                : activity.type === 'lead'
                                  ? '#2196f3'
                                  : activity.type === 'alert'
                                    ? '#ff5722'
                                    : '#9e9e9e',
                            mt: 0.8,
                          }}
                        />
                        <Box flex={1}>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: 13, lineHeight: 1.4 }}
                          >
                            {activity.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={activity.value}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 20,
                          bgcolor:
                            activity.type === 'alert' ? '#ff572220' : '#f5f5f5',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* イベント編集モーダル */}
      <EventEditModal
        open={showEventModal}
        event={selectedEvent}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={selectedEvent?.id ? handleDeleteEvent : undefined}
      />
    </DndProvider>
  );
}
