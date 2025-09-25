'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Close,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Link,
  Image,
  Code,
  PersonAdd,
  Business,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Engineering,
  Home,
  Preview,
  Send,
  Save,
  AddCircle,
  Delete,
  ContentCopy,
  Schedule,
  People,
  FilterList,
  CheckCircle,
  Warning,
  Email,
  Smartphone,
  Computer,
  Tablet,
} from '@mui/icons-material';

interface EmailEditorProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  campaignData?: any;
}

export default function EmailEditor({ open, onClose, isEdit = false, campaignData }: EmailEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [subject, setSubject] = useState(campaignData?.subject || '');
  const [fromName, setFromName] = useState(campaignData?.fromName || 'DRMスイート');
  const [fromEmail, setFromEmail] = useState(campaignData?.fromEmail || 'info@drm-suite.com');
  const [template, setTemplate] = useState(campaignData?.template || 'estimate_follow');
  const [content, setContent] = useState(campaignData?.content || '');
  const [alignment, setAlignment] = useState('left');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [selectedList, setSelectedList] = useState([]);
  const [schedule, setSchedule] = useState('immediate');

  const templates = [
    { id: 'estimate_follow', name: '見積フォローアップ', category: '営業' },
    { id: 'completion_report', name: '工事完了報告', category: 'カスタマーサクセス' },
    { id: 'maintenance_reminder', name: 'メンテナンスリマインダー', category: 'アフターサービス' },
    { id: 'seasonal_campaign', name: '季節キャンペーン', category: 'マーケティング' },
    { id: 'blank', name: '空白テンプレート', category: '基本' },
  ];

  const personalizationTags = [
    { label: '顧客名', value: '{{customer.name}}', icon: <PersonAdd /> },
    { label: '会社名', value: '{{customer.company}}', icon: <Business /> },
    { label: '住所', value: '{{customer.address}}', icon: <LocationOn /> },
    { label: '見積金額', value: '{{estimate.amount}}', icon: <AttachMoney /> },
    { label: '工事予定日', value: '{{project.date}}', icon: <CalendarToday /> },
    { label: '担当者名', value: '{{staff.name}}', icon: <Engineering /> },
    { label: '物件情報', value: '{{property.info}}', icon: <Home /> },
  ];

  const mailingLists = [
    { id: 1, name: '全顧客', count: 3240, type: 'all' },
    { id: 2, name: 'ホットリード', count: 156, type: 'hot' },
    { id: 3, name: '見積提出済み', count: 342, type: 'quoted' },
    { id: 4, name: '工事完了顧客', count: 1856, type: 'completed' },
    { id: 5, name: '住宅オーナー', count: 2103, type: 'residential' },
    { id: 6, name: 'ビル・法人', count: 1137, type: 'commercial' },
  ];

  const getDefaultContent = (templateId: string) => {
    const contents: { [key: string]: string } = {
      estimate_follow: `<p>{{customer.name}} 様</p>
<p>いつもお世話になっております。<br>
DRMスイートの{{staff.name}}です。</p>
<p>先日お送りした見積書はご確認いただけましたでしょうか。</p>
<p><strong>見積金額: {{estimate.amount}}</strong></p>
<p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
<p>よろしくお願いいたします。</p>`,
      completion_report: `<p>{{customer.name}} 様</p>
<p>この度は工事のご依頼をいただき、誠にありがとうございました。</p>
<p>{{property.info}}の工事が無事完了いたしました。</p>
<p>今後のメンテナンスについてもお任せください。</p>`,
      maintenance_reminder: `<p>{{customer.name}} 様</p>
<p>定期メンテナンスのお知らせです。</p>
<p>{{property.info}}の次回点検予定日: {{project.date}}</p>
<p>ご都合をお聞かせください。</p>`,
      seasonal_campaign: `<p>【期間限定キャンペーン】</p>
<p>今なら外壁塗装が特別価格でご提供可能です！</p>
<p>詳しくはこちら → [リンク]</p>`,
      blank: `<p>ここに本文を入力してください。</p>`,
    };
    return contents[templateId] || contents.blank;
  };

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    setContent(getDefaultContent(newTemplate));
  };

  const insertTag = (tag: string) => {
    setContent(content + tag);
  };

  const handleSave = () => {
    // 保存処理
    onClose();
  };

  const handleSend = () => {
    // 送信処理
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEdit ? 'メールキャンペーン編集' : '新規メールキャンペーン作成'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="基本設定" />
          <Tab label="コンテンツ編集" />
          <Tab label="配信リスト" />
          <Tab label="スケジュール" />
          <Tab label="プレビュー" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 500 }}>
        {/* 基本設定タブ */}
        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="キャンペーン名"
                  defaultValue={isEdit ? campaignData?.name : ''}
                  placeholder="例: 2024年秋の外壁塗装キャンペーン"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="送信者名"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="送信元メールアドレス"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="件名"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="例: 【重要】見積書のご確認をお願いします"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  テンプレート選択
                </Typography>
                <Grid container spacing={2}>
                  {templates.map((t) => (
                    <Grid item xs={12} sm={6} md={4} key={t.id}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: 2,
                          borderColor: template === t.id ? 'primary.main' : 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => handleTemplateChange(t.id)}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          {t.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.category}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* コンテンツ編集タブ */}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Paper sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <ToggleButtonGroup value={alignment} exclusive onChange={(e, v) => v && setAlignment(v)}>
                  <ToggleButton value="bold">
                    <FormatBold />
                  </ToggleButton>
                  <ToggleButton value="italic">
                    <FormatItalic />
                  </ToggleButton>
                  <ToggleButton value="underline">
                    <FormatUnderlined />
                  </ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup value={alignment} exclusive>
                  <ToggleButton value="left">
                    <FormatAlignLeft />
                  </ToggleButton>
                  <ToggleButton value="center">
                    <FormatAlignCenter />
                  </ToggleButton>
                  <ToggleButton value="right">
                    <FormatAlignRight />
                  </ToggleButton>
                </ToggleButtonGroup>
                <IconButton>
                  <Link />
                </IconButton>
                <IconButton>
                  <Image />
                </IconButton>
                <IconButton>
                  <Code />
                </IconButton>
              </Paper>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="メール本文を入力してください..."
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    パーソナライゼーションタグ
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    クリックして挿入
                  </Typography>
                  <List dense>
                    {personalizationTags.map((tag) => (
                      <ListItem
                        key={tag.value}
                        button
                        onClick={() => insertTag(tag.value)}
                        sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {tag.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={tag.label}
                          secondary={tag.value}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 配信リストタブ */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              複数のリストを選択すると、重複を除いた配信対象者に送信されます
            </Alert>
            <Grid container spacing={2}>
              {mailingLists.map((list) => (
                <Grid item xs={12} sm={6} md={4} key={list.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: 2,
                      borderColor: selectedList.includes(list.id) ? 'primary.main' : 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => {
                      if (selectedList.includes(list.id)) {
                        setSelectedList(selectedList.filter((id) => id !== list.id));
                      } else {
                        setSelectedList([...selectedList, list.id]);
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {list.name}
                          </Typography>
                          <Typography variant="h4" sx={{ my: 1 }}>
                            {list.count.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            件
                          </Typography>
                        </Box>
                        {selectedList.includes(list.id) && (
                          <CheckCircle color="primary" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="h6">
                選択中の配信対象者数: {selectedList.reduce((sum, id) => {
                  const list = mailingLists.find((l) => l.id === id);
                  return sum + (list?.count || 0);
                }, 0).toLocaleString()} 件
              </Typography>
            </Box>
          </Box>
        )}

        {/* スケジュールタブ */}
        {activeTab === 3 && (
          <Box sx={{ p: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>配信タイミング</InputLabel>
              <Select value={schedule} onChange={(e) => setSchedule(e.target.value)} label="配信タイミング">
                <MenuItem value="immediate">即時配信</MenuItem>
                <MenuItem value="scheduled">予約配信</MenuItem>
                <MenuItem value="recurring">定期配信</MenuItem>
              </Select>
            </FormControl>

            {schedule === 'scheduled' && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="配信日"
                    InputLabelProps={{ shrink: true }}
                    defaultValue="2024-10-01"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="配信時刻"
                    InputLabelProps={{ shrink: true }}
                    defaultValue="10:00"
                  />
                </Grid>
              </Grid>
            )}

            {schedule === 'recurring' && (
              <>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>配信頻度</InputLabel>
                  <Select defaultValue="weekly" label="配信頻度">
                    <MenuItem value="daily">毎日</MenuItem>
                    <MenuItem value="weekly">毎週</MenuItem>
                    <MenuItem value="monthly">毎月</MenuItem>
                  </Select>
                </FormControl>
                <Alert severity="warning">
                  定期配信は配信リストの条件に合致する新規顧客にも自動配信されます
                </Alert>
              </>
            )}

            <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                配信時間最適化
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                過去の開封データから最適な配信時間をAIが推奨します
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="body1" fontWeight={600} color="primary.main">
                  推奨配信時間: 火曜日 10:30
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  この時間帯の平均開封率: 34.2%
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {/* プレビュータブ */}
        {activeTab === 4 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={previewDevice}
                exclusive
                onChange={(e, v) => v && setPreviewDevice(v)}
              >
                <ToggleButton value="desktop">
                  <Computer sx={{ mr: 1 }} /> デスクトップ
                </ToggleButton>
                <ToggleButton value="tablet">
                  <Tablet sx={{ mr: 1 }} /> タブレット
                </ToggleButton>
                <ToggleButton value="mobile">
                  <Smartphone sx={{ mr: 1 }} /> モバイル
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Paper
              sx={{
                mx: 'auto',
                p: 3,
                maxWidth: previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : '100%',
                minHeight: 400,
                border: 2,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  差出人: {fromName} &lt;{fromEmail}&gt;
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {subject || '（件名未設定）'}
                </Typography>
              </Box>
              <Box dangerouslySetInnerHTML={{ __html: content }} />
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="outlined" startIcon={<Save />} onClick={handleSave}>
          下書き保存
        </Button>
        <Button variant="contained" startIcon={<Send />} onClick={handleSend}>
          {schedule === 'immediate' ? '送信' : '予約'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}