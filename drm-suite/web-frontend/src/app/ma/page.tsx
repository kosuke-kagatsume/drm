'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Stack
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
  Circle
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
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter
} from 'recharts';
import { getMaDashboard } from '@/services/ma/dashboard';
import { MaDashboard } from '@/types/ma';

const COLORS = ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#feca57', '#48dbfb'];

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
  };

  // Realistic mock data
  const conversionFunnelData = [
    { stage: '訪問者', value: 12450, percentage: 100, color: '#667eea' },
    { stage: 'リード化', value: 3240, percentage: 26, color: '#764ba2' },
    { stage: '商談化', value: 856, percentage: 6.9, color: '#f093fb' },
    { stage: '見積提出', value: 342, percentage: 2.7, color: '#f5576c' },
    { stage: '成約', value: 126, percentage: 1.0, color: '#4facfe' }
  ];

  const journeyPerformance = [
    { month: '7月', リード獲得: 2850, 商談化: 342, 成約: 89 },
    { month: '8月', リード獲得: 3120, 商談化: 418, 成約: 102 },
    { month: '9月', リード獲得: 3240, 商談化: 456, 成約: 126 },
    { month: '10月', リード獲得: 3580, 商談化: 512, 成約: 145 }
  ];

  const channelPerformance = [
    { channel: 'Web広告', リード: 1450, 商談: 203, 成約: 48, CPA: 8500, ROI: 420 },
    { channel: 'SEO', リード: 892, 商談: 156, 成約: 42, CPA: 3200, ROI: 680 },
    { channel: 'メール', リード: 567, 商談: 78, 成約: 25, CPA: 2100, ROI: 520 },
    { channel: 'SNS', リード: 331, 商談: 19, 成約: 11, CPA: 12000, ROI: 180 }
  ];

  const activeJourneys = [
    {
      id: 1,
      name: '新規リード獲得',
      status: 'active',
      contacts: 3240,
      conversion: 3.9,
      trend: 'up',
      steps: 8,
      avgDays: 14
    },
    {
      id: 2,
      name: 'ナーチャリング',
      status: 'active',
      contacts: 1856,
      conversion: 6.8,
      trend: 'up',
      steps: 12,
      avgDays: 28
    },
    {
      id: 3,
      name: '休眠顧客掘り起こし',
      status: 'paused',
      contacts: 654,
      conversion: 2.1,
      trend: 'down',
      steps: 6,
      avgDays: 45
    },
    {
      id: 4,
      name: 'アップセル',
      status: 'active',
      contacts: 432,
      conversion: 12.3,
      trend: 'up',
      steps: 5,
      avgDays: 7
    }
  ];

  const recentActivity = [
    { time: '2分前', type: 'conversion', message: '山田様が見積依頼を送信', value: '¥2,500,000' },
    { time: '5分前', type: 'lead', message: '新規リード獲得（Web広告経由）', value: 'Hot' },
    { time: '8分前', type: 'email', message: 'メールキャンペーン配信完了', value: '2,456件' },
    { time: '12分前', type: 'journey', message: 'ナーチャリングステップ3移行', value: '156名' },
    { time: '15分前', type: 'alert', message: 'LINE配信エラー', value: '要対応' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f7fa">
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>MA管理システムを読み込み中...</Typography>
      </Box>
    );
  }

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header - Full Width */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', px: 3, py: 2, boxShadow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <AutoMode sx={{ fontSize: 32, color: '#667eea' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
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
            '& .MuiTab-root': { minHeight: 56, fontWeight: 600 }
          }}
        >
          <Tab icon={<Analytics />} label="ダッシュボード" />
          <Tab icon={<Timeline />} label="ジャーニー管理" />
          <Tab icon={<Science />} label="A/Bテスト" />
          <Tab icon={<AttachMoney />} label="ROI分析" />
          <Tab icon={<Schedule />} label="スケジュール" />
        </Tabs>
      </Box>

      {/* Main Container */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Content - Left Side */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* Dashboard Tab */}
          <TabPanel value={activeTab} index={0}>
            {/* KPI Cards - Extended to use full width */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, width: '100%' }}>
              <Box sx={{ flex: 1 }}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                          総リード数
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
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
                <Card sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                          今月のコンバージョン
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
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
                <Card sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                          稼働中ジャーニー
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                          5
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          本（3本アクティブ）
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <Circle sx={{ fontSize: 8, color: '#4caf50', mr: 0.5 }} />
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
                <Card sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                          月間ROI
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
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

            {/* Main Dashboard Content - Optimized Layout */}
            <Grid container spacing={1.5}>
              {/* Left Column */}
              <Grid item xs={12} lg={6}>
                {/* Conversion Funnel - Taller for better visibility */}
                <Card sx={{ mb: 1.5, height: 500 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      コンバージョンファネル分析
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      {conversionFunnelData.map((stage, index) => (
                        <Box key={stage.stage} sx={{ mb: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: stage.color
                              }} />
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
                                  fontWeight: 600
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
                                borderRadius: 2
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Journey Performance Trend - Compact */}
                <Card sx={{ height: 360 }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        月次パフォーマンストレンド
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="リード獲得" fill="#667eea" barSize={40} />
                        <Bar dataKey="商談化" fill="#f093fb" barSize={40} />
                        <Line type="monotone" dataKey="成約" stroke="#4facfe" strokeWidth={3} dot={{ r: 5 }} />
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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        アクティブジャーニー
                      </Typography>
                      <Button size="small" startIcon={<Add />} variant="outlined">
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
                            bgcolor: journey.status === 'active' ? '#f8f9fa' : '#fefefe',
                            border: '1px solid',
                            borderColor: journey.status === 'active' ? '#667eea20' : '#e0e0e0'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Circle
                                sx={{
                                  fontSize: 10,
                                  color: journey.status === 'active' ? '#4caf50' : '#ffa726'
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
                              <Typography variant="caption" color="text.secondary">
                                コンタクト
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {journey.contacts.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">
                                CVR
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <Typography variant="body1" fontWeight={600}>
                                  {journey.conversion}%
                                </Typography>
                                {journey.trend === 'up' ?
                                  <ArrowUpward sx={{ fontSize: 14, color: '#4caf50', ml: 0.5 }} /> :
                                  <ArrowDownward sx={{ fontSize: 14, color: '#f44336', ml: 0.5 }} />
                                }
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">
                                ステップ数
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {journey.steps}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="caption" color="text.secondary">
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
                                <Box display="flex" alignItems="center" gap={1}>
                                  {channel.channel === 'Web広告' && <Campaign fontSize="small" color="primary" />}
                                  {channel.channel === 'SEO' && <Search fontSize="small" color="success" />}
                                  {channel.channel === 'メール' && <Email fontSize="small" color="warning" />}
                                  {channel.channel === 'SNS' && <Share fontSize="small" color="info" />}
                                  <Typography variant="body2" fontWeight={500}>
                                    {channel.channel}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">{channel.リード.toLocaleString()}</TableCell>
                              <TableCell align="right">{channel.商談}</TableCell>
                              <TableCell align="right">{channel.成約}</TableCell>
                              <TableCell align="right">¥{channel.CPA.toLocaleString()}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${channel.ROI}%`}
                                  size="small"
                                  color={channel.ROI > 400 ? 'success' : channel.ROI > 200 ? 'warning' : 'default'}
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

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              ROI分析
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              スケジュール管理
            </Typography>
          </TabPanel>
        </Box>
      </Box>

      {/* Right Sidebar - Optimized Size */}
      <Box sx={{
        width: 320,
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* RAG Assistant - Appropriate height */}
        <Box sx={{
          height: 450,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          overflow: 'auto'
        }}>
          <RAGAssistant />
        </Box>

        {/* Real-time Activities - Remaining space */}
        <Box sx={{
          flex: 1,
          minHeight: 200,
          p: 2,
          overflowY: 'auto',
          bgcolor: '#fafafa'
        }}>
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
                  borderColor: 'divider'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" gap={1}>
                    <Circle
                      sx={{
                        fontSize: 8,
                        color: activity.type === 'conversion' ? '#4caf50' :
                               activity.type === 'lead' ? '#2196f3' :
                               activity.type === 'alert' ? '#ff5722' : '#9e9e9e',
                        mt: 0.8
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.4 }}>
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
                      bgcolor: activity.type === 'alert' ? '#ff572220' : '#f5f5f5'
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
  );
}