'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailEditor from '@/components/ma/email-editor';
import EmailReport from '@/components/ma/email-report';
import EmailAnalytics from '@/components/ma/email-analytics';
import EmailSettings from '@/components/ma/email-settings';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  AvatarGroup,
  Tooltip,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Email,
  Send,
  Schedule,
  Edit,
  Delete,
  ContentCopy,
  Visibility,
  PersonAdd,
  AttachFile,
  Image,
  Code,
  Smartphone,
  Computer,
  TrendingUp,
  TrendingDown,
  OpenInNew,
  MouseOutlined,
  TouchApp,
  QueryStats,
  Campaign,
  Construction,
  Settings,
  Home,
  Business,
  Engineering,
  Handyman,
  RequestQuote,
  CheckCircle,
  Warning,
  Error,
  FiberManualRecord,
  MoreVert,
  Star,
  StarBorder,
  Folder,
  FolderOpen,
  GridView as Grid4x4,
  ViewList,
  PauseCircle,
  Tablet,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  previewText: string;
  content: string;
  variables: string[];
  thumbnail: string;
  lastModified: string;
  status: 'draft' | 'active' | 'archived';
  stats?: {
    sent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  tags: string[];
}

interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  sent: number;
  scheduled: string;
  performance: {
    delivered: number;
    opens: number;
    clicks: number;
    unsubscribes: number;
    bounces: number;
    complaints: number;
  };
}

export default function EmailCommunicationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showEmailReport, setShowEmailReport] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  // 建設業界向けテンプレート
  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: '見積依頼後フォロー',
      category: 'estimate',
      subject: '【{{company_name}}】お見積りのご確認はお済みでしょうか？',
      previewText: 'ご提案内容についてご不明な点がございましたらお気軽にご連絡ください',
      content: `
        <p>{{customer_name}} 様</p>
        <p>お世話になっております。{{company_name}}の{{sales_person}}です。</p>
        <p>先日お送りさせていただきました{{project_name}}のお見積りはご確認いただけましたでしょうか。</p>
        <p>ご提案内容について、ご不明な点やご要望がございましたら、お気軽にご連絡ください。</p>
      `,
      variables: ['customer_name', 'company_name', 'sales_person', 'project_name'],
      thumbnail: '📋',
      lastModified: '2025-09-24',
      status: 'active',
      stats: {
        sent: 245,
        openRate: 68.5,
        clickRate: 22.3,
        conversionRate: 8.2,
      },
      tags: ['見積', 'フォローアップ', '営業'],
    },
    {
      id: '2',
      name: '工事完了お礼メール',
      category: 'completion',
      subject: '【工事完了】この度はありがとうございました',
      previewText: '今後ともどうぞよろしくお願いいたします',
      content: `
        <p>{{customer_name}} 様</p>
        <p>この度は{{project_name}}の工事をご依頼いただき、誠にありがとうございました。</p>
        <p>無事に工事が完了し、お引き渡しができましたこと、心より感謝申し上げます。</p>
        <p>アフターサービスも万全に対応させていただきますので、今後ともよろしくお願いいたします。</p>
      `,
      variables: ['customer_name', 'project_name'],
      thumbnail: '🏗️',
      lastModified: '2025-09-23',
      status: 'active',
      stats: {
        sent: 189,
        openRate: 82.1,
        clickRate: 15.8,
        conversionRate: 5.3,
      },
      tags: ['完了', 'お礼', 'アフターサービス'],
    },
    {
      id: '3',
      name: '定期点検のご案内',
      category: 'maintenance',
      subject: '【定期点検のお知らせ】{{inspection_type}}の時期となりました',
      previewText: '大切な建物を長持ちさせるため、定期点検をおすすめします',
      content: `
        <p>{{customer_name}} 様</p>
        <p>いつもお世話になっております。</p>
        <p>{{property_name}}の{{inspection_type}}の時期となりましたのでご案内いたします。</p>
        <p>定期的なメンテナンスにより、建物の寿命を延ばし、快適な環境を維持できます。</p>
      `,
      variables: ['customer_name', 'property_name', 'inspection_type'],
      thumbnail: '🔧',
      lastModified: '2025-09-22',
      status: 'active',
      stats: {
        sent: 567,
        openRate: 45.2,
        clickRate: 18.9,
        conversionRate: 12.1,
      },
      tags: ['メンテナンス', '定期点検', 'アフターサービス'],
    },
    {
      id: '4',
      name: 'リフォームキャンペーン',
      category: 'campaign',
      subject: '【期間限定】リフォーム特別キャンペーンのご案内',
      previewText: '今なら工事費10%OFF！この機会をお見逃しなく',
      content: `
        <p>{{customer_name}} 様</p>
        <p>日頃より格別のご愛顧を賜り、誠にありがとうございます。</p>
        <p>この度、期間限定でリフォーム特別キャンペーンを実施いたします。</p>
        <ul>
          <li>キッチンリフォーム：工事費10%OFF</li>
          <li>浴室リフォーム：工事費10%OFF</li>
          <li>外壁塗装：足場代無料</li>
        </ul>
      `,
      variables: ['customer_name'],
      thumbnail: '🎯',
      lastModified: '2025-09-21',
      status: 'active',
      stats: {
        sent: 1234,
        openRate: 52.3,
        clickRate: 28.7,
        conversionRate: 3.8,
      },
      tags: ['キャンペーン', 'リフォーム', 'プロモーション'],
    },
    {
      id: '5',
      name: '新築完成見学会のご案内',
      category: 'event',
      subject: '【完成見学会】{{event_date}}開催のお知らせ',
      previewText: '実際の建物をご覧いただける貴重な機会です',
      content: `
        <p>{{customer_name}} 様</p>
        <p>新築住宅の完成見学会を開催いたします。</p>
        <p>日時：{{event_date}}</p>
        <p>場所：{{event_location}}</p>
        <p>実際の建物をご覧いただき、質感や空間の広がりを体感できる貴重な機会です。</p>
      `,
      variables: ['customer_name', 'event_date', 'event_location'],
      thumbnail: '🏠',
      lastModified: '2025-09-20',
      status: 'active',
      stats: {
        sent: 456,
        openRate: 61.2,
        clickRate: 35.4,
        conversionRate: 15.2,
      },
      tags: ['イベント', '見学会', '新築'],
    },
  ];

  const campaigns: EmailCampaign[] = [
    {
      id: '1',
      name: '秋のリフォームキャンペーン',
      templateId: '4',
      status: 'sending',
      recipients: 2500,
      sent: 1823,
      scheduled: '2025-09-25 10:00',
      performance: {
        delivered: 1798,
        opens: 892,
        clicks: 245,
        unsubscribes: 12,
        bounces: 25,
        complaints: 2,
      },
    },
    {
      id: '2',
      name: '定期点検リマインダー（9月）',
      templateId: '3',
      status: 'scheduled',
      recipients: 340,
      sent: 0,
      scheduled: '2025-09-26 09:00',
      performance: {
        delivered: 0,
        opens: 0,
        clicks: 0,
        unsubscribes: 0,
        bounces: 0,
        complaints: 0,
      },
    },
  ];

  const categories = [
    { value: 'all', label: 'すべて', icon: <Folder /> },
    { value: 'estimate', label: '見積関連', icon: <RequestQuote /> },
    { value: 'completion', label: '工事完了', icon: <Construction /> },
    { value: 'maintenance', label: 'メンテナンス', icon: <Engineering /> },
    { value: 'campaign', label: 'キャンペーン', icon: <Campaign /> },
    { value: 'event', label: 'イベント', icon: <Home /> },
  ];

  const performanceData = [
    { date: '9/19', sent: 234, opens: 145, clicks: 48 },
    { date: '9/20', sent: 189, opens: 112, clicks: 35 },
    { date: '9/21', sent: 456, opens: 298, clicks: 89 },
    { date: '9/22', sent: 321, opens: 201, clicks: 67 },
    { date: '9/23', sent: 567, opens: 389, clicks: 124 },
    { date: '9/24', sent: 412, opens: 278, clicks: 92 },
    { date: '9/25', sent: 298, opens: 195, clicks: 61 },
  ];

  const deviceStats = [
    { name: 'モバイル', value: 62, color: '#4285f4' },
    { name: 'デスクトップ', value: 31, color: '#34a853' },
    { name: 'タブレット', value: 7, color: '#fbbc04' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const getStatusIcon = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return <Edit sx={{ fontSize: 16 }} />;
      case 'scheduled': return <Schedule sx={{ fontSize: 16 }} />;
      case 'sending': return <FiberManualRecord sx={{ fontSize: 16, color: '#4285f4' }} />;
      case 'sent': return <CheckCircle sx={{ fontSize: 16, color: '#34a853' }} />;
      case 'paused': return <Warning sx={{ fontSize: 16, color: '#fbbc04' }} />;
      default: return null;
    }
  };

  const getStatusColor = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return 'default';
      case 'scheduled': return 'info';
      case 'sending': return 'primary';
      case 'sent': return 'success';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <Box sx={{ bgcolor: 'white', p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push('/ma')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📧 メールコミュニケーション
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<QueryStats />}
              onClick={() => setActiveTab(2)}
            >
              分析レポート
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowEmailEditor(true)}
              sx={{ bgcolor: '#4285f4' }}
            >
              新規メール作成
            </Button>
          </Box>
        </Box>

        {/* サマリーカード */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      今月の配信数
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      12,456
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 16, color: '#34a853' }} />
                      <Typography variant="caption" color="success.main">
                        +23% 前月比
                      </Typography>
                    </Box>
                  </Box>
                  <Send sx={{ fontSize: 40, color: '#4285f4', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      平均開封率
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      58.2%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 16, color: '#34a853' }} />
                      <Typography variant="caption" color="success.main">
                        業界平均 +15%
                      </Typography>
                    </Box>
                  </Box>
                  <OpenInNew sx={{ fontSize: 40, color: '#34a853', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      平均クリック率
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      24.8%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 16, color: '#34a853' }} />
                      <Typography variant="caption" color="success.main">
                        +5.2% 前月比
                      </Typography>
                    </Box>
                  </Box>
                  <TouchApp sx={{ fontSize: 40, color: '#fbbc04', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      配信停止率
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      0.8%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingDown sx={{ fontSize: 16, color: '#34a853' }} />
                      <Typography variant="caption" color="success.main">
                        -0.2% 前月比
                      </Typography>
                    </Box>
                  </Box>
                  <Error sx={{ fontSize: 40, color: '#ea4335', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* タブ */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="テンプレート" />
          <Tab label="キャンペーン" />
          <Tab label="分析" icon={<QueryStats />} iconPosition="start" />
          <Tab label="設定" icon={<Settings />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* メインコンテンツ */}
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <>
            {/* フィルター */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <ToggleButtonGroup
                value={selectedCategory}
                onChange={(_, value) => value && setSelectedCategory(value)}
                exclusive
              >
                {categories.map(cat => (
                  <ToggleButton key={cat.value} value={cat.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {cat.icon}
                      <Typography variant="body2">{cat.label}</Typography>
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box sx={{ flex: 1 }} />

              <ToggleButtonGroup
                value={viewMode}
                onChange={(_, value) => value && setViewMode(value)}
                exclusive
              >
                <ToggleButton value="grid">
                  <Grid4x4 />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* テンプレート一覧 */}
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredTemplates.map(template => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 },
                        position: 'relative',
                      }}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Box sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 48 }}>{template.thumbnail}</Typography>
                      </Box>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {template.subject}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                              {template.tags.map(tag => (
                                <Chip key={tag} label={tag} size="small" />
                              ))}
                            </Box>
                          </Box>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </Box>

                        {template.stats && (
                          <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  配信数
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {template.stats.sent.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  開封率
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {template.stats.openRate}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  クリック率
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {template.stats.clickRate}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  CV率
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {template.stats.conversionRate}%
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCampaign(template);
                              setShowEmailEditor(true);
                            }}
                          >
                            編集
                          </Button>
                          <Button
                            size="small"
                            startIcon={<ContentCopy />}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            複製
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Send />}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            variant="contained"
                          >
                            配信
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>テンプレート名</TableCell>
                      <TableCell>カテゴリ</TableCell>
                      <TableCell>件名</TableCell>
                      <TableCell>配信数</TableCell>
                      <TableCell>開封率</TableCell>
                      <TableCell>クリック率</TableCell>
                      <TableCell>最終更新</TableCell>
                      <TableCell>アクション</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTemplates.map(template => (
                      <TableRow key={template.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{template.thumbnail}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {template.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categories.find(c => c.value === template.category)?.label}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>{template.stats?.sent.toLocaleString() || '-'}</TableCell>
                        <TableCell>{template.stats?.openRate || '-'}%</TableCell>
                        <TableCell>{template.stats?.clickRate || '-'}%</TableCell>
                        <TableCell>{template.lastModified}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small">
                              <ContentCopy />
                            </IconButton>
                            <IconButton size="small">
                              <Send />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>キャンペーン名</TableCell>
                      <TableCell>ステータス</TableCell>
                      <TableCell>配信予定</TableCell>
                      <TableCell>対象者数</TableCell>
                      <TableCell>配信済み</TableCell>
                      <TableCell>開封数</TableCell>
                      <TableCell>クリック数</TableCell>
                      <TableCell>アクション</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {campaign.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={getStatusColor(campaign.status) as any}
                            icon={getStatusIcon(campaign.status)}
                          />
                        </TableCell>
                        <TableCell>{campaign.scheduled}</TableCell>
                        <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(campaign.sent / campaign.recipients) * 100}
                              sx={{ width: 60, height: 6 }}
                            />
                            <Typography variant="body2">
                              {campaign.sent.toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{campaign.performance.opens.toLocaleString()}</TableCell>
                        <TableCell>{campaign.performance.clicks.toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedCampaignId(campaign.id);
                                setShowEmailReport(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingCampaign(campaign);
                                setShowEmailEditor(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                            {campaign.status === 'sending' && (
                              <IconButton size="small">
                                <PauseCircle />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <EmailAnalytics />
          </Box>
        )}

        {/* 設定タブ */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <EmailSettings />
          </Box>
        )}
      </Box>


      {/* SpeedDial for quick actions */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="新規テンプレート"
          onClick={() => router.push('/ma/email/builder')}
        />
        <SpeedDialAction
          icon={<Send />}
          tooltipTitle="キャンペーン作成"
        />
        <SpeedDialAction
          icon={<PersonAdd />}
          tooltipTitle="宛先リスト作成"
        />
      </SpeedDial>

      {/* Email Editor Dialog */}
      <EmailEditor
        open={showEmailEditor}
        onClose={() => {
          setShowEmailEditor(false);
          setEditingCampaign(null);
        }}
        isEdit={!!editingCampaign}
        campaignData={editingCampaign}
      />

      {/* Email Report Dialog */}
      <EmailReport
        open={showEmailReport}
        onClose={() => {
          setShowEmailReport(false);
          setSelectedCampaignId('');
        }}
        campaignId={selectedCampaignId}
      />
    </Box>
  );
}