'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  Email,
  TouchApp,
  Link as LinkIcon,
  AttachMoney,
  Timer,
  Smartphone,
  Computer,
  Tablet,
  Person,
  Business,
  LocationOn,
  Download,
  Share,
  Print,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Cancel,
  Schedule,
  Visibility,
  Mouse,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface EmailReportProps {
  open: boolean;
  onClose: () => void;
  campaignId: string;
}

export default function EmailReport({ open, onClose, campaignId }: EmailReportProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data
  const campaign = {
    name: '秋の外壁塗装キャンペーン',
    subject: '【期間限定】外壁塗装が最大30%OFF！',
    sentDate: '2024-09-15 10:30',
    status: 'completed',
    totalSent: 2456,
    delivered: 2401,
    bounced: 55,
    opened: 698,
    clicked: 156,
    converted: 12,
    revenue: 8500000,
  };

  const timelineData = [
    { time: '10:00', opens: 45, clicks: 5 },
    { time: '11:00', opens: 123, clicks: 18 },
    { time: '12:00', opens: 89, clicks: 12 },
    { time: '13:00', opens: 156, clicks: 28 },
    { time: '14:00', opens: 102, clicks: 22 },
    { time: '15:00', opens: 78, clicks: 15 },
    { time: '16:00', opens: 65, clicks: 10 },
    { time: '17:00', opens: 40, clicks: 8 },
  ];

  const deviceData = [
    { name: 'デスクトップ', value: 42, color: '#667eea' },
    { name: 'モバイル', value: 45, color: '#f093fb' },
    { name: 'タブレット', value: 13, color: '#4facfe' },
  ];

  const linkClickData = [
    { name: 'キャンペーン詳細', clicks: 89, rate: 57.1 },
    { name: '見積依頼フォーム', clicks: 42, rate: 26.9 },
    { name: '施工事例', clicks: 15, rate: 9.6 },
    { name: '会社概要', clicks: 10, rate: 6.4 },
  ];

  const topPerformers = [
    { name: '田中建設株式会社', email: 'tanaka@construction.co.jp', opens: 5, clicks: 3, converted: true },
    { name: '山田工務店', email: 'yamada@koumuten.jp', opens: 3, clicks: 2, converted: true },
    { name: '佐藤不動産', email: 'sato@fudosan.com', opens: 4, clicks: 2, converted: false },
    { name: '鈴木ビル管理', email: 'suzuki@building.jp', opens: 2, clicks: 1, converted: false },
    { name: '高橋住宅', email: 'takahashi@jutaku.co.jp', opens: 3, clicks: 1, converted: false },
  ];

  const conversionFunnel = [
    { stage: '配信', value: 2456, rate: 100 },
    { stage: '到達', value: 2401, rate: 97.8 },
    { stage: '開封', value: 698, rate: 28.4 },
    { stage: 'クリック', value: 156, rate: 6.4 },
    { stage: '成約', value: 12, rate: 0.5 },
  ];

  const kpiCards = [
    {
      label: '開封率',
      value: `${((campaign.opened / campaign.delivered) * 100).toFixed(1)}%`,
      benchmark: '業界平均 22.3%',
      trend: 'up',
      color: '#667eea',
    },
    {
      label: 'クリック率',
      value: `${((campaign.clicked / campaign.opened) * 100).toFixed(1)}%`,
      benchmark: '業界平均 18.5%',
      trend: 'up',
      color: '#f093fb',
    },
    {
      label: 'CVR',
      value: `${((campaign.converted / campaign.clicked) * 100).toFixed(1)}%`,
      benchmark: '業界平均 5.2%',
      trend: 'down',
      color: '#4facfe',
    },
    {
      label: 'ROI',
      value: `${((campaign.revenue / 50000) * 100).toFixed(0)}%`,
      benchmark: '目標 300%',
      trend: 'up',
      color: '#fa709a',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">{campaign.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              配信日時: {campaign.sentDate} | ステータス: 配信完了
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton size="small">
              <Print />
            </IconButton>
            <IconButton size="small">
              <Download />
            </IconButton>
            <IconButton size="small">
              <Share />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="サマリー" />
          <Tab label="エンゲージメント" />
          <Tab label="リンク分析" />
          <Tab label="顧客詳細" />
          <Tab label="A/Bテスト結果" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 600 }}>
        {/* サマリータブ */}
        {activeTab === 0 && (
          <Box>
            {/* KPIカード */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {kpiCards.map((kpi) => (
                <Grid item xs={6} md={3} key={kpi.label}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        {kpi.label}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 600 }}>
                          {kpi.value}
                        </Typography>
                        {kpi.trend === 'up' ? (
                          <TrendingUp color="success" />
                        ) : (
                          <TrendingDown color="error" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {kpi.benchmark}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* コンバージョンファネル */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                コンバージョンファネル
              </Typography>
              <Box sx={{ mt: 3 }}>
                {conversionFunnel.map((stage, index) => (
                  <Box key={stage.stage} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {stage.stage}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2">
                          {stage.value.toLocaleString()}件
                        </Typography>
                        <Chip
                          label={`${stage.rate}%`}
                          size="small"
                          color={index === 0 ? 'primary' : 'default'}
                        />
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stage.rate}
                      sx={{
                        height: 24,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, #667eea ${index * 20}%, #f093fb 100%)`,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* 時系列グラフ */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                時間別パフォーマンス
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="opens" stroke="#667eea" fill="#667eea" fillOpacity={0.3} name="開封数" />
                  <Area type="monotone" dataKey="clicks" stroke="#f093fb" fill="#f093fb" fillOpacity={0.3} name="クリック数" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        )}

        {/* エンゲージメントタブ */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    デバイス別開封率
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    エンゲージメントマップ
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Visibility color="primary" />
                        <Typography>開封のみ</Typography>
                      </Box>
                      <Typography variant="h5">542名</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Mouse color="secondary" />
                        <Typography>クリックあり</Typography>
                      </Box>
                      <Typography variant="h5">156名</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircle color="success" />
                        <Typography>コンバージョン</Typography>
                      </Box>
                      <Typography variant="h5">12名</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                エンゲージメント時間分布
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                配信から開封/クリックまでの経過時間
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4">32%</Typography>
                    <Typography>1時間以内に開封</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4">58%</Typography>
                    <Typography>24時間以内に開封</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4">10%</Typography>
                    <Typography>24時間以降に開封</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* リンク分析タブ */}
        {activeTab === 2 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                クリックされたリンク
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>リンク名</TableCell>
                      <TableCell align="right">クリック数</TableCell>
                      <TableCell align="right">クリック率</TableCell>
                      <TableCell>ヒートマップ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {linkClickData.map((link) => (
                      <TableRow key={link.name}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinkIcon fontSize="small" />
                            {link.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{link.clicks}</TableCell>
                        <TableCell align="right">{link.rate}%</TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={link.rate}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                クリックヒートマップ
              </Typography>
              <Box sx={{ mt: 2, p: 3, border: 2, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  メール内のクリック位置分布（ヒートマップシミュレーション）
                </Typography>
                <Box sx={{ position: 'relative', height: 400, background: 'linear-gradient(180deg, rgba(255,0,0,0.3) 0%, rgba(255,255,0,0.2) 50%, rgba(0,255,0,0.1) 100%)' }}>
                  <Box sx={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <Typography variant="h6">最もクリックされた箇所</Typography>
                    <Typography>CTAボタン「今すぐ見積もり」</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* 顧客詳細タブ */}
        {activeTab === 3 && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              高エンゲージメント顧客のリストです。フォローアップの参考にご活用ください。
            </Alert>
            <Paper>
              <List>
                {topPerformers.map((customer, index) => (
                  <React.Fragment key={customer.email}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: customer.converted ? 'success.main' : 'grey.400' }}>
                          {customer.converted ? <CheckCircle /> : <Person />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={customer.name}
                        secondary={customer.email}
                      />
                      <Box display="flex" gap={3} alignItems="center">
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.secondary">開封</Typography>
                          <Typography variant="h6">{customer.opens}</Typography>
                        </Box>
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.secondary">クリック</Typography>
                          <Typography variant="h6">{customer.clicks}</Typography>
                        </Box>
                        {customer.converted && (
                          <Chip label="成約" color="success" />
                        )}
                      </Box>
                    </ListItem>
                    {index < topPerformers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                セグメント別パフォーマンス
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { segment: '新規顧客', 開封率: 35, クリック率: 8 },
                    { segment: '既存顧客', 開封率: 28, クリック率: 6 },
                    { segment: 'ホットリード', 開封率: 42, クリック率: 12 },
                    { segment: '休眠顧客', 開封率: 15, クリック率: 2 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="開封率" fill="#667eea" />
                  <Bar dataKey="クリック率" fill="#f093fb" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        )}

        {/* A/Bテスト結果タブ */}
        {activeTab === 4 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              統計的有意性: 95%信頼度で勝者が決定しました
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, border: 2, borderColor: 'success.main' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">バリアントA（勝者）</Typography>
                    <Chip label="勝者" color="success" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    件名: 【期間限定】外壁塗装が最大30%OFF！
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>配信数</Typography>
                      <Typography fontWeight={600}>1,228</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>開封率</Typography>
                      <Typography fontWeight={600} color="success.main">32.4%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>クリック率</Typography>
                      <Typography fontWeight={600} color="success.main">7.8%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>CVR</Typography>
                      <Typography fontWeight={600} color="success.main">0.8%</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, border: 2, borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom>
                    バリアントB
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    件名: 今なら外壁塗装がお得！特別価格でご提供
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>配信数</Typography>
                      <Typography fontWeight={600}>1,228</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>開封率</Typography>
                      <Typography fontWeight={600}>24.5%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>クリック率</Typography>
                      <Typography fontWeight={600}>5.2%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>CVR</Typography>
                      <Typography fontWeight={600}>0.3%</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                パフォーマンス改善率
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>開封率の改善</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h5" color="success.main">+32.2%</Typography>
                    <ArrowUpward color="success" />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography>クリック率の改善</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h5" color="success.main">+50.0%</Typography>
                    <ArrowUpward color="success" />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>CVRの改善</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h5" color="success.main">+166.7%</Typography>
                    <ArrowUpward color="success" />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}