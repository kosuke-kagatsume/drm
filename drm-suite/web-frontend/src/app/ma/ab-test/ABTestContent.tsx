'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MultivariateTestBuilder from '@/components/ma/multivariate-test-builder';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Paper,
  Grid,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  PlayArrow,
  Pause,
  Stop,
  Analytics,
  Email,
  Web,
  MobileFriendly,
  TrendingUp,
  Science,
  CheckCircle,
  Cancel,
  Info,
  ThumbUp,
  Speed,
  Groups,
  Assessment,
  Timer,
  Lightbulb,
  EmojiEvents,
  Settings,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ABTest {
  id: string;
  name: string;
  type: 'email' | 'landing' | 'journey' | 'pricing';
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  variants: TestVariant[];
  metrics: TestMetrics;
  winner?: string;
  confidence?: number;
  settings: TestSettings;
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  allocation: number;
  content: any;
  results: VariantResults;
}

interface VariantResults {
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgOrderValue: number;
  bounceRate?: number;
  clickRate?: number;
  openRate?: number;
}

interface TestMetrics {
  primaryGoal: string;
  secondaryGoals: string[];
  successMetric: string;
  minimumSampleSize: number;
  statisticalSignificance: number;
}

interface TestSettings {
  audience: string;
  duration: string;
  trafficAllocation: number;
  autoStop: boolean;
  autoSelectWinner: boolean;
}

export default function ABTestPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewTestDialog, setShowNewTestDialog] = useState(false);
  const [showMultivariateDialog, setShowMultivariateDialog] = useState(false);
  const [testType, setTestType] = useState<
    'email' | 'landing' | 'journey' | 'pricing'
  >('email');

  // モックデータ
  const activeTests: ABTest[] = [
    {
      id: '1',
      name: '見積メール件名テスト',
      type: 'email',
      status: 'running',
      startDate: '2025-09-20',
      endDate: '2025-09-27',
      variants: [
        {
          id: 'a',
          name: 'バリアントA（数字強調）',
          description: '「最大30%割引」を件名に',
          allocation: 50,
          content: {
            subject: '【期間限定】外壁塗装が最大30%OFF！無料見積実施中',
          },
          results: {
            visitors: 2450,
            conversions: 147,
            conversionRate: 6.0,
            revenue: 7350000,
            avgOrderValue: 50000,
            openRate: 42.5,
            clickRate: 8.2,
          },
        },
        {
          id: 'b',
          name: 'バリアントB（緊急性訴求）',
          description: '「今週末まで」を強調',
          allocation: 50,
          content: {
            subject: '【今週末まで】外壁塗装の無料診断＆特別価格のご案内',
          },
          results: {
            visitors: 2380,
            conversions: 178,
            conversionRate: 7.5,
            revenue: 8900000,
            avgOrderValue: 50000,
            openRate: 48.3,
            clickRate: 10.1,
          },
        },
      ],
      metrics: {
        primaryGoal: 'メール開封率',
        secondaryGoals: ['クリック率', '見積依頼数'],
        successMetric: 'conversion_rate',
        minimumSampleSize: 1000,
        statisticalSignificance: 95,
      },
      winner: 'b',
      confidence: 94.5,
      settings: {
        audience: '過去6ヶ月以内の見込み客',
        duration: '7日間',
        trafficAllocation: 100,
        autoStop: true,
        autoSelectWinner: true,
      },
    },
    {
      id: '2',
      name: 'LP価格表示テスト',
      type: 'landing',
      status: 'running',
      startDate: '2025-09-18',
      endDate: '2025-09-25',
      variants: [
        {
          id: 'a',
          name: '総額表示',
          description: '工事費込みの総額を大きく表示',
          allocation: 33,
          content: { priceDisplay: 'total' },
          results: {
            visitors: 1820,
            conversions: 91,
            conversionRate: 5.0,
            revenue: 4550000,
            avgOrderValue: 50000,
            bounceRate: 35,
          },
        },
        {
          id: 'b',
          name: '月額表示',
          description: 'ローン利用時の月額を強調',
          allocation: 33,
          content: { priceDisplay: 'monthly' },
          results: {
            visitors: 1795,
            conversions: 125,
            conversionRate: 7.0,
            revenue: 6250000,
            avgOrderValue: 50000,
            bounceRate: 28,
          },
        },
        {
          id: 'c',
          name: '坪単価表示',
          description: '1坪あたりの価格を表示',
          allocation: 34,
          content: { priceDisplay: 'per_tsubo' },
          results: {
            visitors: 1850,
            conversions: 102,
            conversionRate: 5.5,
            revenue: 5100000,
            avgOrderValue: 50000,
            bounceRate: 32,
          },
        },
      ],
      metrics: {
        primaryGoal: 'フォーム送信率',
        secondaryGoals: ['滞在時間', 'ページ深度'],
        successMetric: 'conversion_rate',
        minimumSampleSize: 1500,
        statisticalSignificance: 95,
      },
      confidence: 87.2,
      settings: {
        audience: '新規訪問者',
        duration: '7日間',
        trafficAllocation: 80,
        autoStop: false,
        autoSelectWinner: true,
      },
    },
  ];

  const completedTests = [
    {
      id: '3',
      name: 'CTAボタンテスト',
      type: 'landing',
      status: 'completed',
      winner: 'b',
      confidence: 98.5,
      improvement: '+42%',
      startDate: '2025-09-01',
      endDate: '2025-09-08',
    },
    {
      id: '4',
      name: 'メール配信時間テスト',
      type: 'email',
      status: 'completed',
      winner: 'a',
      confidence: 96.2,
      improvement: '+28%',
      startDate: '2025-08-25',
      endDate: '2025-09-01',
    },
  ];

  const testTemplates = [
    {
      id: '1',
      name: '件名最適化',
      type: 'email',
      description: 'メール開封率を向上させる件名テスト',
      icon: <Email />,
      expectedImprovement: '+15-30%',
    },
    {
      id: '2',
      name: '価格表示方法',
      type: 'landing',
      description: 'コンバージョン率を高める価格表示',
      icon: <Web />,
      expectedImprovement: '+20-40%',
    },
    {
      id: '3',
      name: 'フォーム項目数',
      type: 'landing',
      description: 'フォーム完了率を改善',
      icon: <Assessment />,
      expectedImprovement: '+10-25%',
    },
    {
      id: '4',
      name: 'ジャーニータイミング',
      type: 'journey',
      description: 'メール送信の最適タイミング',
      icon: <Timer />,
      expectedImprovement: '+15-35%',
    },
  ];

  const calculateStatisticalSignificance = (
    variantA: VariantResults,
    variantB: VariantResults,
  ) => {
    const pA = variantA.conversionRate / 100;
    const pB = variantB.conversionRate / 100;
    const nA = variantA.visitors;
    const nB = variantB.visitors;

    const pooledP = (pA * nA + pB * nB) / (nA + nB);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / nA + 1 / nB));
    const z = Math.abs(pA - pB) / se;
    const significance =
      (1 - 2 * (1 - 0.5 * (1 + Math.erf(z / Math.sqrt(2))))) * 100;

    return Math.min(99.9, Math.max(0, significance));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <Box sx={{ bgcolor: 'white', p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push('/ma')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              🧪 A/Bテスト管理
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => router.push('/ma/ab-test/settings')}
              sx={{ borderColor: '#4285f4', color: '#4285f4' }}
            >
              詳細設定
            </Button>
            <Button
              variant="outlined"
              startIcon={<Science />}
              onClick={() => setShowMultivariateDialog(true)}
              sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
            >
              多変量テスト
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowNewTestDialog(true)}
              sx={{ bgcolor: '#4285f4' }}
            >
              新規A/Bテスト
            </Button>
          </Box>
        </Box>

        {/* サマリーカード */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#4285f4', color: 'white' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      実行中のテスト
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {activeTests.length}
                    </Typography>
                  </Box>
                  <Science sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#34a853', color: 'white' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      平均改善率
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      +28%
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#fbbc04', color: 'white' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      テスト勝率
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      76%
                    </Typography>
                  </Box>
                  <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#ea4335', color: 'white' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      増収効果
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      +450万
                    </Typography>
                  </Box>
                  <Analytics sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* タブ */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="実行中のテスト" />
          <Tab label="完了済みテスト" />
          <Tab label="テンプレート" />
          <Tab label="レポート" />
        </Tabs>
      </Box>

      {/* コンテンツエリア */}
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <>
            {/* 実行中のテスト */}
            <Grid container spacing={3}>
              {activeTests.map((test) => (
                <Grid item xs={12} key={test.id}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {test.name}
                          </Typography>
                          <Chip
                            label={
                              test.type === 'email'
                                ? 'メール'
                                : test.type === 'landing'
                                  ? 'LP'
                                  : 'ジャーニー'
                            }
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label="実行中"
                            size="small"
                            color="success"
                            icon={<PlayArrow sx={{ fontSize: 16 }} />}
                          />
                          {test.winner && (
                            <Chip
                              label={`勝者: ${test.winner.toUpperCase()}`}
                              size="small"
                              color="warning"
                              icon={<EmojiEvents sx={{ fontSize: 16 }} />}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedTest(test)}
                          >
                            <Analytics />
                          </IconButton>
                          <IconButton size="small">
                            <Pause />
                          </IconButton>
                          <IconButton size="small">
                            <Stop />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        {test.variants.map((variant, index) => (
                          <Grid item xs={12} md={6} key={variant.id}>
                            <Paper
                              sx={{
                                p: 2,
                                bgcolor:
                                  test.winner === variant.id
                                    ? '#fff3e0'
                                    : '#f5f5f5',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {variant.name}
                                </Typography>
                                {test.winner === variant.id && (
                                  <Chip
                                    label="暫定勝者"
                                    size="small"
                                    color="warning"
                                    icon={<ThumbUp sx={{ fontSize: 16 }} />}
                                  />
                                )}
                              </Box>

                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      コンバージョン率
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      sx={{ fontWeight: 600, color: '#4285f4' }}
                                    >
                                      {variant.results.conversionRate}%
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {variant.results.conversions} /{' '}
                                      {variant.results.visitors}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6}>
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      収益
                                    </Typography>
                                    <Typography
                                      variant="h5"
                                      sx={{ fontWeight: 600, color: '#34a853' }}
                                    >
                                      ¥
                                      {(
                                        variant.results.revenue / 10000
                                      ).toFixed(0)}
                                      万
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      単価: ¥
                                      {(
                                        variant.results.avgOrderValue / 10000
                                      ).toFixed(0)}
                                      万
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>

                              {test.type === 'email' && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    pt: 2,
                                    borderTop: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        開封率
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {variant.results.openRate}%
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        クリック率
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        {variant.results.clickRate}%
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Box>
                              )}

                              <Box sx={{ mt: 2 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    (variant.results.visitors /
                                      test.metrics.minimumSampleSize) *
                                    100
                                  }
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  サンプル数: {variant.results.visitors} /{' '}
                                  {test.metrics.minimumSampleSize}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>

                      {/* 統計的有意性 */}
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: '#f5f5f5',
                          borderRadius: 2,
                        }}
                      >
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              統計的有意性
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {test.confidence ||
                                  calculateStatisticalSignificance(
                                    test.variants[0].results,
                                    test.variants[1].results,
                                  ).toFixed(1)}
                                %
                              </Typography>
                              {(test.confidence ||
                                calculateStatisticalSignificance(
                                  test.variants[0].results,
                                  test.variants[1].results,
                                )) >= 95 ? (
                                <CheckCircle sx={{ color: '#34a853' }} />
                              ) : (
                                <Info sx={{ color: '#fbbc04' }} />
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              テスト期間
                            </Typography>
                            <Typography variant="body1">
                              {test.startDate} ~ {test.endDate}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              対象オーディエンス
                            </Typography>
                            <Typography variant="body1">
                              {test.settings.audience}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {activeTab === 1 && (
          <>
            {/* 完了済みテスト */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>テスト名</TableCell>
                    <TableCell>タイプ</TableCell>
                    <TableCell>期間</TableCell>
                    <TableCell>勝者</TableCell>
                    <TableCell>改善率</TableCell>
                    <TableCell>信頼度</TableCell>
                    <TableCell>アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={test.type === 'email' ? 'メール' : 'LP'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {test.startDate} ~ {test.endDate}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`バリアント${test.winner.toUpperCase()}`}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#34a853', fontWeight: 600 }}>
                          {test.improvement}
                        </Typography>
                      </TableCell>
                      <TableCell>{test.confidence}%</TableCell>
                      <TableCell>
                        <Button size="small">詳細</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {activeTab === 2 && (
          <>
            {/* テンプレート */}
            <Grid container spacing={3}>
              {testTemplates.map((template) => (
                <Grid item xs={12} md={6} lg={3} key={template.id}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        <Box sx={{ color: '#4285f4', mr: 2 }}>
                          {template.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {template.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {template.description}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Chip
                          label={template.type}
                          size="small"
                          variant="outlined"
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: '#34a853', fontWeight: 600 }}
                        >
                          {template.expectedImprovement}
                        </Typography>
                      </Box>
                      <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                        このテンプレートを使用
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {activeTab === 3 && (
          <>
            {/* レポート */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    月間パフォーマンス推移
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { month: '7月', tests: 8, success: 6, improvement: 22 },
                        {
                          month: '8月',
                          tests: 12,
                          success: 9,
                          improvement: 28,
                        },
                        {
                          month: '9月',
                          tests: 10,
                          success: 8,
                          improvement: 35,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="tests"
                        stroke="#4285f4"
                        name="実施テスト数"
                      />
                      <Line
                        type="monotone"
                        dataKey="success"
                        stroke="#34a853"
                        name="成功数"
                      />
                      <Line
                        type="monotone"
                        dataKey="improvement"
                        stroke="#fbbc04"
                        name="改善率(%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    テストタイプ別成功率
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'メール', value: 82 },
                          { name: 'LP', value: 75 },
                          { name: 'ジャーニー', value: 68 },
                          { name: '価格', value: 71 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4285f4" />
                        <Cell fill="#34a853" />
                        <Cell fill="#fbbc04" />
                        <Cell fill="#ea4335" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="success" icon={<Lightbulb />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  今月のインサイト
                </Typography>
                <Typography variant="body2">
                  メール件名に数字を含めると開封率が平均23%向上しています。
                  また、価格を月額表示にすると問い合わせ率が32%改善する傾向があります。
                </Typography>
              </Alert>
            </Box>
          </>
        )}
      </Box>

      {/* 新規テスト作成ダイアログ */}
      <Dialog
        open={showNewTestDialog}
        onClose={() => setShowNewTestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            新規A/Bテスト作成
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>テストタイプ</InputLabel>
              <Select
                value={testType}
                label="テストタイプ"
                onChange={(e) => setTestType(e.target.value as any)}
              >
                <MenuItem value="email">メールキャンペーン</MenuItem>
                <MenuItem value="landing">ランディングページ</MenuItem>
                <MenuItem value="journey">カスタマージャーニー</MenuItem>
                <MenuItem value="pricing">価格表示</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="テスト名"
              placeholder="例: 見積メール件名テスト"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              テストバリアント
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <TextField
                    fullWidth
                    label="バリアントA"
                    placeholder="コントロール版"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="説明"
                    placeholder="現在の標準版"
                    multiline
                    rows={2}
                    size="small"
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <TextField
                    fullWidth
                    label="バリアントB"
                    placeholder="テスト版"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="説明"
                    placeholder="改善案"
                    multiline
                    rows={2}
                    size="small"
                  />
                </Paper>
              </Grid>
            </Grid>

            <Typography
              variant="subtitle2"
              sx={{ mt: 3, mb: 2, fontWeight: 600 }}
            >
              成功指標
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>主要目標</InputLabel>
              <Select value="conversion" label="主要目標">
                <MenuItem value="conversion">コンバージョン率</MenuItem>
                <MenuItem value="revenue">収益</MenuItem>
                <MenuItem value="engagement">エンゲージメント</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="テスト期間"
                  type="number"
                  defaultValue="7"
                  InputProps={{ endAdornment: '日間' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="必要サンプル数"
                  type="number"
                  defaultValue="1000"
                  InputProps={{ endAdornment: '件' }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewTestDialog(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowNewTestDialog(false)}
          >
            テスト開始
          </Button>
        </DialogActions>
      </Dialog>

      {/* 多変量テストビルダー */}
      <MultivariateTestBuilder
        open={showMultivariateDialog}
        onClose={() => setShowMultivariateDialog(false)}
        onSave={(config) => {
          console.log('多変量テスト設定:', config);
          // TODO: 実際のテスト作成処理
          setShowMultivariateDialog(false);
        }}
      />
    </Box>
  );
}
