'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Button,
  Tooltip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Email,
  OpenInNew,
  TouchApp,
  Schedule,
  People,
  Domain,
  Smartphone,
  Computer,
  Tablet,
  LocationOn,
  Language,
  AccessTime,
  CalendarToday,
  FilterList,
  Download,
  Share,
  MoreVert,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Construction,
  Home,
  Business,
  Engineering,
  AttachMoney,
  ShoppingCart,
  LocalShipping,
  Build,
  Architecture,
  Handyman,
} from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, Funnel, FunnelChart, Sankey,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ComposedChart, ScatterChart, Scatter
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const EmailAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('30days');
  const [compareMode, setCompareMode] = useState(false);
  const [viewMode, setViewMode] = useState('chart');

  // 時系列データ
  const timeSeriesData = [
    { date: '9/1', 送信: 450, 開封: 261, クリック: 65, CVR: 12 },
    { date: '9/2', 送信: 380, 開封: 220, クリック: 55, CVR: 10 },
    { date: '9/3', 送信: 520, 開封: 302, クリック: 75, CVR: 14 },
    { date: '9/4', 送信: 480, 開封: 278, クリック: 70, CVR: 13 },
    { date: '9/5', 送信: 410, 開封: 238, クリック: 60, CVR: 11 },
    { date: '9/6', 送信: 390, 開封: 226, クリック: 57, CVR: 10 },
    { date: '9/7', 送信: 550, 開封: 319, クリック: 80, CVR: 15 },
    { date: '9/8', 送信: 460, 開封: 267, クリック: 67, CVR: 12 },
    { date: '9/9', 送信: 420, 開封: 244, クリック: 61, CVR: 11 },
    { date: '9/10', 送信: 510, 開封: 296, クリック: 74, CVR: 14 },
  ];

  // デバイス別データ
  const deviceData = [
    { name: 'Desktop', value: 45, color: '#4285f4' },
    { name: 'Mobile', value: 38, color: '#34a853' },
    { name: 'Tablet', value: 17, color: '#fbbc04' },
  ];

  // 業界別パフォーマンス
  const industryPerformance = [
    { industry: '住宅リフォーム', 開封率: 62, クリック率: 28, CVR: 5.2 },
    { industry: 'ビル管理', 開封率: 55, クリック率: 24, CVR: 4.8 },
    { industry: '土木工事', 開封率: 58, クリック率: 26, CVR: 5.0 },
    { industry: '電気工事', 開封率: 60, クリック率: 27, CVR: 5.1 },
    { industry: '配管工事', 開封率: 57, クリック率: 25, CVR: 4.9 },
  ];

  // 曜日別ヒートマップデータ
  const heatmapData = [
    { hour: '6時', 月: 35, 火: 38, 水: 42, 木: 40, 金: 45, 土: 55, 日: 48 },
    { hour: '9時', 月: 65, 火: 68, 水: 72, 木: 70, 金: 75, 土: 45, 日: 38 },
    { hour: '12時', 月: 55, 火: 58, 水: 62, 木: 60, 金: 65, 土: 50, 日: 42 },
    { hour: '15時', 月: 50, 火: 52, 水: 55, 木: 53, 金: 58, 土: 48, 日: 40 },
    { hour: '18時', 月: 60, 火: 62, 水: 65, 木: 63, 金: 55, 土: 58, 日: 52 },
    { hour: '21時', 月: 45, 火: 48, 水: 50, 木: 48, 金: 52, 土: 62, 日: 58 },
  ];

  // 地域別データ
  const regionData = [
    { region: '関東', 配信数: 3500, 開封率: 60, クリック率: 26 },
    { region: '関西', 配信数: 2800, 開封率: 58, クリック率: 25 },
    { region: '中部', 配信数: 2200, 開封率: 56, クリック率: 24 },
    { region: '九州', 配信数: 1800, 開封率: 57, クリック率: 25 },
    { region: '東北', 配信数: 1500, 開封率: 55, クリック率: 23 },
    { region: '北海道', 配信数: 1200, 開封率: 54, クリック率: 22 },
    { region: '中国', 配信数: 1100, 開封率: 56, クリック率: 24 },
    { region: '四国', 配信数: 900, 開封率: 55, クリック率: 23 },
  ];

  // コンテンツタイプ別パフォーマンス
  const contentTypeData = [
    { type: '製品紹介', subject: '建設', 送信数: 2500, 開封率: 58, クリック率: 24, CVR: 4.5 },
    { type: 'イベント案内', subject: '建設', 送信数: 2200, 開封率: 62, クリック率: 28, CVR: 5.2 },
    { type: 'お知らせ', subject: '建設', 送信数: 2000, 開封率: 55, クリック率: 22, CVR: 4.0 },
    { type: '事例紹介', subject: '建設', 送信数: 1800, 開封率: 60, クリック率: 26, CVR: 4.8 },
    { type: 'キャンペーン', subject: '建設', 送信数: 3000, 開封率: 65, クリック率: 30, CVR: 5.5 },
  ];

  // ユーザーエンゲージメントスコア
  const engagementScore = [
    { segment: '高関与', count: 1250, percentage: 25 },
    { segment: '中関与', count: 2000, percentage: 40 },
    { segment: '低関与', count: 1500, percentage: 30 },
    { segment: '非アクティブ', count: 250, percentage: 5 },
  ];

  // コホート分析データ
  const cohortData = [
    { cohort: '1月', month1: 100, month2: 85, month3: 72, month4: 65, month5: 58, month6: 52 },
    { cohort: '2月', month1: 100, month2: 88, month3: 75, month4: 68, month5: 61, month6: 55 },
    { cohort: '3月', month1: 100, month2: 90, month3: 78, month4: 70, month5: 63, month6: 57 },
    { cohort: '4月', month1: 100, month2: 87, month3: 76, month4: 69, month5: 62, month6: 56 },
    { cohort: '5月', month1: 100, month2: 89, month3: 77, month4: 71, month5: 64, month6: 58 },
  ];

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">📊 詳細分析</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <MenuItem value="7days">過去7日</MenuItem>
                <MenuItem value="30days">過去30日</MenuItem>
                <MenuItem value="90days">過去90日</MenuItem>
                <MenuItem value="1year">過去1年</MenuItem>
                <MenuItem value="custom">カスタム</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="chart">チャート</ToggleButton>
              <ToggleButton value="table">テーブル</ToggleButton>
            </ToggleButtonGroup>
            <Button startIcon={<Download />} variant="outlined" size="small">
              エクスポート
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="概要" />
          <Tab label="エンゲージメント" />
          <Tab label="デバイス・地域" />
          <Tab label="コンテンツ分析" />
          <Tab label="時間帯分析" />
          <Tab label="コホート" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {/* 概要タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>配信パフォーマンストレンド</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="送信" fill="#e3f2fd" />
                    <Line yAxisId="left" type="monotone" dataKey="開封" stroke="#4285f4" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="クリック" stroke="#34a853" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="CVR" stroke="#ea4335" strokeWidth={2} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>エンゲージメントスコア</Typography>
                <Box sx={{ mt: 2 }}>
                  {engagementScore.map((item) => (
                    <Box key={item.segment} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{item.segment}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count}人 ({item.percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.segment === '高関与' ? '#4285f4' :
                                           item.segment === '中関与' ? '#34a853' :
                                           item.segment === '低関与' ? '#fbbc04' : '#ea4335'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">平均スコア</Typography>
                  <Typography variant="h6" color="primary">72.5</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>業界別パフォーマンス比較</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={industryPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="industry" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="開封率" dataKey="開封率" stroke="#4285f4" fill="#4285f4" fillOpacity={0.6} />
                    <Radar name="クリック率" dataKey="クリック率" stroke="#34a853" fill="#34a853" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* エンゲージメントタブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>エンゲージメントファネル</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { stage: '配信', count: 12456, rate: 100 },
                    { stage: '到達', count: 11832, rate: 95 },
                    { stage: '開封', count: 7249, rate: 58.2 },
                    { stage: 'クリック', count: 3089, rate: 24.8 },
                    { stage: 'コンバージョン', count: 623, rate: 5.0 },
                  ]} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#4285f4" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>リンククリック分布</Typography>
                <List dense>
                  {[
                    { label: 'CTAボタン「詳細を見る」', clicks: 1234, percentage: 40 },
                    { label: 'ヘッダーロゴ', clicks: 617, percentage: 20 },
                    { label: '製品画像', clicks: 493, percentage: 16 },
                    { label: 'フッターリンク', clicks: 370, percentage: 12 },
                    { label: 'その他', clicks: 375, percentage: 12 },
                  ].map((link) => (
                    <ListItem key={link.label}>
                      <ListItemText
                        primary={link.label}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={link.percentage}
                              sx={{ width: 100, height: 6 }}
                            />
                            <Typography variant="caption">
                              {link.clicks}クリック ({link.percentage}%)
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* デバイス・地域タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>デバイス別開封率</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {deviceData.map((device) => (
                    <Box key={device.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {device.name === 'Desktop' ? <Computer sx={{ mr: 1, color: device.color }} /> :
                       device.name === 'Mobile' ? <Smartphone sx={{ mr: 1, color: device.color }} /> :
                       <Tablet sx={{ mr: 1, color: device.color }} />}
                      <Typography variant="body2">{device.name}: {device.value}%</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>地域別パフォーマンス</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="配信数" fill="#4285f4" />
                    <Line yAxisId="right" type="monotone" dataKey="開封率" stroke="#34a853" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="クリック率" stroke="#fbbc04" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* コンテンツ分析タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>コンテンツタイプ別パフォーマンス</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>コンテンツタイプ</TableCell>
                        <TableCell>業界</TableCell>
                        <TableCell align="right">送信数</TableCell>
                        <TableCell align="right">開封率</TableCell>
                        <TableCell align="right">クリック率</TableCell>
                        <TableCell align="right">CVR</TableCell>
                        <TableCell align="center">トレンド</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contentTypeData.map((row) => (
                        <TableRow key={row.type}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {row.type === '製品紹介' && <ShoppingCart fontSize="small" color="primary" />}
                              {row.type === 'イベント案内' && <CalendarToday fontSize="small" color="secondary" />}
                              {row.type === 'お知らせ' && <Info fontSize="small" color="info" />}
                              {row.type === '事例紹介' && <Architecture fontSize="small" color="success" />}
                              {row.type === 'キャンペーン' && <AttachMoney fontSize="small" color="warning" />}
                              {row.type}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={row.subject} size="small" icon={<Construction />} />
                          </TableCell>
                          <TableCell align="right">{row.送信数.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {row.開封率}%
                              {row.開封率 > 60 ? <TrendingUp fontSize="small" color="success" /> :
                               row.開封率 < 56 ? <TrendingDown fontSize="small" color="error" /> : null}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {row.クリック率}%
                              {row.クリック率 > 26 ? <TrendingUp fontSize="small" color="success" /> :
                               row.クリック率 < 23 ? <TrendingDown fontSize="small" color="error" /> : null}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{row.CVR}%</TableCell>
                          <TableCell align="center">
                            <ResponsiveContainer width={100} height={30}>
                              <LineChart data={[
                                { value: Math.random() * 10 + 50 },
                                { value: Math.random() * 10 + 52 },
                                { value: Math.random() * 10 + 55 },
                                { value: Math.random() * 10 + 58 },
                                { value: row.開封率 },
                              ]}>
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={row.開封率 > 58 ? '#34a853' : '#ea4335'}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* 時間帯分析タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>曜日・時間帯別開封率ヒートマップ</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ minWidth: 600, mt: 2 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Box sx={{ width: 60 }} />
                      {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                        <Box key={day} sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="body2">{day}</Typography>
                        </Box>
                      ))}
                    </Box>
                    {heatmapData.map((row) => (
                      <Box key={row.hour} sx={{ display: 'flex', mb: 1 }}>
                        <Box sx={{ width: 60 }}>
                          <Typography variant="body2">{row.hour}</Typography>
                        </Box>
                        {['月', '火', '水', '木', '金', '土', '日'].map((day) => {
                          const value = row[day as keyof typeof row] as number;
                          const intensity = value / 75; // 最大値75で正規化
                          return (
                            <Box
                              key={day}
                              sx={{
                                flex: 1,
                                height: 40,
                                backgroundColor: `rgba(66, 133, 244, ${intensity})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                m: 0.5,
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                              }}
                            >
                              <Typography variant="caption" sx={{ color: intensity > 0.5 ? 'white' : 'inherit' }}>
                                {value}%
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption">低</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {[0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                        <Box
                          key={intensity}
                          sx={{
                            width: 30,
                            height: 20,
                            backgroundColor: `rgba(66, 133, 244, ${intensity})`,
                            borderRadius: 0.5
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption">高</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>最適配信時間帯（建設業）</Typography>
                <List>
                  {[
                    { time: '朝 6:00-9:00', rate: 65, icon: <Construction />, color: '#4285f4' },
                    { time: '昼 11:00-13:00', rate: 58, icon: <Business />, color: '#34a853' },
                    { time: '夕方 17:00-19:00', rate: 62, icon: <Home />, color: '#fbbc04' },
                  ].map((item) => (
                    <ListItem key={item.time}>
                      <ListItemIcon sx={{ color: item.color }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.time}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.rate}
                              sx={{
                                width: 150,
                                height: 8,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': { backgroundColor: item.color }
                              }}
                            />
                            <Typography variant="caption">開封率 {item.rate}%</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>配信頻度別エンゲージメント</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="frequency" name="週間配信数" unit="回" />
                    <YAxis dataKey="engagement" name="エンゲージメント率" unit="%" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter
                      name="ユーザーセグメント"
                      data={[
                        { frequency: 1, engagement: 75, size: 100 },
                        { frequency: 2, engagement: 72, size: 200 },
                        { frequency: 3, engagement: 68, size: 300 },
                        { frequency: 4, engagement: 60, size: 250 },
                        { frequency: 5, engagement: 45, size: 150 },
                        { frequency: 6, engagement: 35, size: 80 },
                        { frequency: 7, engagement: 25, size: 50 },
                      ]}
                      fill="#4285f4"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {/* コホート分析タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>コホート別リテンション率</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>コホート</TableCell>
                        <TableCell align="center">月1</TableCell>
                        <TableCell align="center">月2</TableCell>
                        <TableCell align="center">月3</TableCell>
                        <TableCell align="center">月4</TableCell>
                        <TableCell align="center">月5</TableCell>
                        <TableCell align="center">月6</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cohortData.map((row) => (
                        <TableRow key={row.cohort}>
                          <TableCell>{row.cohort}</TableCell>
                          {['month1', 'month2', 'month3', 'month4', 'month5', 'month6'].map((month) => {
                            const value = row[month as keyof typeof row] as number;
                            const intensity = value / 100;
                            return (
                              <TableCell
                                key={month}
                                align="center"
                                sx={{
                                  backgroundColor: `rgba(52, 168, 83, ${intensity})`,
                                  color: intensity > 0.5 ? 'white' : 'inherit'
                                }}
                              >
                                {value}%
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>ライフサイクルステージ分布</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '新規', value: 15, color: '#4285f4' },
                        { name: 'アクティブ', value: 45, color: '#34a853' },
                        { name: '休眠', value: 25, color: '#fbbc04' },
                        { name: '離脱リスク', value: 10, color: '#ea4335' },
                        { name: '復活', value: 5, color: '#9333ea' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: '新規', value: 15, color: '#4285f4' },
                        { name: 'アクティブ', value: 45, color: '#34a853' },
                        { name: '休眠', value: 25, color: '#fbbc04' },
                        { name: '離脱リスク', value: 10, color: '#ea4335' },
                        { name: '復活', value: 5, color: '#9333ea' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>顧客価値分析</Typography>
                <Box sx={{ mt: 2 }}>
                  {[
                    { segment: 'VIP（上位10%）', ltv: '¥125,000', count: 125, growth: '+15%' },
                    { segment: '優良（上位30%）', ltv: '¥65,000', count: 375, growth: '+8%' },
                    { segment: '一般（中位40%）', ltv: '¥25,000', count: 500, growth: '+3%' },
                    { segment: '低価値（下位30%）', ltv: '¥8,000', count: 375, growth: '-5%' },
                  ].map((item) => (
                    <Box key={item.segment} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{item.segment}</Typography>
                        <Chip
                          label={item.growth}
                          size="small"
                          color={item.growth.startsWith('+') ? 'success' : 'error'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          平均LTV: {item.ltv}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.count}人
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default EmailAnalytics;