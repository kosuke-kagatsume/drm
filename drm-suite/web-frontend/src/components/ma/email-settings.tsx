'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  Slider,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Settings,
  Email,
  Security,
  Speed,
  People,
  Domain,
  Send,
  Block,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  ExpandMore,
  Verified,
  Key,
  Lock,
  VpnKey,
  CloudUpload,
  CloudDownload,
  Autorenew,
  Schedule,
  MailOutline,
  Unsubscribe,
  PersonAdd,
  PersonRemove,
  FilterList,
  Construction,
  Business,
  Engineering,
  NotificationsActive,
  NotificationsOff,
  Language,
  Translate,
  ColorLens,
  FormatSize,
  Image,
  AttachFile,
  Link,
  QrCode,
  Analytics,
  BugReport,
  Science,
} from '@mui/icons-material';

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

const EmailSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const [showSuppressDialog, setShowSuppressDialog] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  // 設定値の状態管理
  const [settings, setSettings] = useState({
    senderName: '株式会社建設DRM',
    senderEmail: 'info@construction-drm.jp',
    replyToEmail: 'support@construction-drm.jp',
    bounceEmail: 'bounce@construction-drm.jp',
    dailyLimit: 10000,
    hourlyLimit: 500,
    enableTracking: true,
    enableUnsubscribeLink: true,
    enableDoubleOptIn: false,
    retryAttempts: 3,
    throttleRate: 50,
  });

  // ドメイン認証設定
  const [domains, setDomains] = useState([
    { domain: 'construction-drm.jp', spf: true, dkim: true, dmarc: true, status: 'verified' },
    { domain: 'mail.construction-drm.jp', spf: true, dkim: false, dmarc: false, status: 'pending' },
  ]);

  // 配信停止リスト
  const [suppressList, setSuppressList] = useState([
    { email: 'test1@example.com', reason: 'ハードバウンス', date: '2025-09-20' },
    { email: 'test2@example.com', reason: 'スパム報告', date: '2025-09-18' },
    { email: 'test3@example.com', reason: '手動追加', date: '2025-09-15' },
  ]);

  // IPウォームアップ設定
  const [warmupSettings, setWarmupSettings] = useState({
    enabled: true,
    currentDay: 12,
    totalDays: 30,
    currentVolume: 2500,
    targetVolume: 10000,
  });

  // テンプレート設定
  const [templateSettings, setTemplateSettings] = useState({
    defaultTemplate: 'construction_basic',
    headerLogo: '/logo.png',
    footerText: '© 2025 株式会社建設DRM. All rights reserved.',
    socialLinks: {
      facebook: true,
      twitter: true,
      linkedin: true,
      instagram: false,
    },
    customCSS: '',
  });

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">⚙️ メール設定</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<CloudDownload />} variant="outlined" size="small">
              設定をエクスポート
            </Button>
            <Button startIcon={<CloudUpload />} variant="outlined" size="small">
              設定をインポート
            </Button>
            <Button startIcon={<Save />} variant="contained" size="small">
              変更を保存
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="基本設定" icon={<Settings />} iconPosition="start" />
          <Tab label="送信設定" icon={<Send />} iconPosition="start" />
          <Tab label="認証・セキュリティ" icon={<Security />} iconPosition="start" />
          <Tab label="配信制御" icon={<Speed />} iconPosition="start" />
          <Tab label="テンプレート" icon={<ColorLens />} iconPosition="start" />
          <Tab label="高度な設定" icon={<Science />} iconPosition="start" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {/* 基本設定タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MailOutline /> 送信者情報
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  label="送信者名"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  margin="normal"
                  helperText="受信者に表示される送信者名"
                />
                <TextField
                  fullWidth
                  label="送信元メールアドレス"
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                  margin="normal"
                  helperText="認証済みドメインのメールアドレスを使用"
                  InputProps={{
                    endAdornment: settings.senderEmail.includes('@construction-drm.jp') && (
                      <InputAdornment position="end">
                        <Verified color="success" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="返信先メールアドレス"
                  value={settings.replyToEmail}
                  onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
                  margin="normal"
                  helperText="受信者が返信した際の宛先"
                />
                <TextField
                  fullWidth
                  label="バウンス通知先"
                  value={settings.bounceEmail}
                  onChange={(e) => setSettings({ ...settings, bounceEmail: e.target.value })}
                  margin="normal"
                  helperText="配信エラー通知を受け取るアドレス"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People /> デフォルト設定
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableTracking}
                        onChange={(e) => setSettings({ ...settings, enableTracking: e.target.checked })}
                      />
                    }
                    label="開封・クリックトラッキング有効"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableUnsubscribeLink}
                        onChange={(e) => setSettings({ ...settings, enableUnsubscribeLink: e.target.checked })}
                      />
                    }
                    label="配信停止リンク自動挿入"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableDoubleOptIn}
                        onChange={(e) => setSettings({ ...settings, enableDoubleOptIn: e.target.checked })}
                      />
                    }
                    label="ダブルオプトイン必須"
                  />
                </FormGroup>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Email />}
                    fullWidth
                    onClick={() => setTestEmailSent(true)}
                  >
                    テストメール送信
                  </Button>
                  {testEmailSent && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      テストメールを送信しました
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* 送信設定タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed /> 送信制限
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>日次送信上限: {settings.dailyLimit.toLocaleString()}通</Typography>
                  <Slider
                    value={settings.dailyLimit}
                    onChange={(e, value) => setSettings({ ...settings, dailyLimit: value as number })}
                    min={1000}
                    max={50000}
                    step={1000}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>時間あたり送信上限: {settings.hourlyLimit}通</Typography>
                  <Slider
                    value={settings.hourlyLimit}
                    onChange={(e, value) => setSettings({ ...settings, hourlyLimit: value as number })}
                    min={100}
                    max={2000}
                    step={100}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="リトライ回数"
                  value={settings.retryAttempts}
                  onChange={(e) => setSettings({ ...settings, retryAttempts: parseInt(e.target.value) })}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">回</InputAdornment>,
                  }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Autorenew /> IPウォームアップ
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={warmupSettings.enabled}
                      onChange={(e) => setWarmupSettings({ ...warmupSettings, enabled: e.target.checked })}
                    />
                  }
                  label="IPウォームアップ有効"
                />
                {warmupSettings.enabled && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        進捗: Day {warmupSettings.currentDay} / {warmupSettings.totalDays}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(warmupSettings.currentDay / warmupSettings.totalDays) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {Math.round((warmupSettings.currentDay / warmupSettings.totalDays) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        現在の配信量: {warmupSettings.currentVolume.toLocaleString()} / {warmupSettings.targetVolume.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(warmupSettings.currentVolume / warmupSettings.targetVolume) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                            color="secondary"
                          />
                        </Box>
                        <Typography variant="caption">
                          {Math.round((warmupSettings.currentVolume / warmupSettings.targetVolume) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      IPレピュテーション構築中。段階的に送信量を増やしています。
                    </Alert>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* 認証・セキュリティタブ */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Domain /> ドメイン認証
                  </Typography>
                  <Button startIcon={<Add />} variant="outlined" size="small" onClick={() => setShowDomainDialog(true)}>
                    ドメイン追加
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ドメイン</TableCell>
                        <TableCell align="center">SPF</TableCell>
                        <TableCell align="center">DKIM</TableCell>
                        <TableCell align="center">DMARC</TableCell>
                        <TableCell align="center">ステータス</TableCell>
                        <TableCell align="center">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {domains.map((domain) => (
                        <TableRow key={domain.domain}>
                          <TableCell>{domain.domain}</TableCell>
                          <TableCell align="center">
                            {domain.spf ? <CheckCircle color="success" /> : <Warning color="warning" />}
                          </TableCell>
                          <TableCell align="center">
                            {domain.dkim ? <CheckCircle color="success" /> : <Warning color="warning" />}
                          </TableCell>
                          <TableCell align="center">
                            {domain.dmarc ? <CheckCircle color="success" /> : <Warning color="warning" />}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={domain.status === 'verified' ? '認証済み' : '保留中'}
                              color={domain.status === 'verified' ? 'success' : 'warning'}
                              size="small"
                              icon={domain.status === 'verified' ? <Verified /> : <Warning />}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small"><Edit /></IconButton>
                            <IconButton size="small"><Delete /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="info" sx={{ mt: 2 }}>
                  SPF、DKIM、DMARCの設定により、メールの到達率が向上し、なりすましを防ぎます。
                </Alert>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Key /> API設定
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  label="APIキー"
                  type="password"
                  value="sk_live_********************************"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small">
                          <VpnKey />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value="https://construction-drm.jp/api/webhooks/email"
                  margin="normal"
                />
                <FormGroup sx={{ mt: 2 }}>
                  <FormControlLabel control={<Switch defaultChecked />} label="配信完了通知" />
                  <FormControlLabel control={<Switch defaultChecked />} label="バウンス通知" />
                  <FormControlLabel control={<Switch defaultChecked />} label="スパム報告通知" />
                  <FormControlLabel control={<Switch />} label="開封通知" />
                  <FormControlLabel control={<Switch />} label="クリック通知" />
                </FormGroup>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock /> セキュリティ設定
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormGroup>
                  <FormControlLabel control={<Switch defaultChecked />} label="TLS暗号化必須" />
                  <FormControlLabel control={<Switch defaultChecked />} label="リンクスキャン有効" />
                  <FormControlLabel control={<Switch defaultChecked />} label="添付ファイルスキャン" />
                  <FormControlLabel control={<Switch />} label="サンドボックス環境でテスト" />
                </FormGroup>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    最終セキュリティスキャン
                  </Typography>
                  <Alert severity="success">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle />
                      問題は検出されませんでした（2025-09-25 10:30）
                    </Box>
                  </Alert>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* 配信制御タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Block /> 配信停止リスト
                  </Typography>
                  <Button startIcon={<Add />} variant="outlined" size="small" onClick={() => setShowSuppressDialog(true)}>
                    追加
                  </Button>
                </Box>
                <List dense>
                  {suppressList.map((item) => (
                    <ListItem key={item.email}>
                      <ListItemIcon>
                        <Unsubscribe color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.email}
                        secondary={`${item.reason} - ${item.date}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" fullWidth startIcon={<CloudUpload />}>
                    CSVインポート
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule /> スケジュール制御
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormGroup>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="営業時間内のみ配信（9:00-18:00）"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="週末配信を避ける"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="祝日配信を避ける"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="タイムゾーン考慮"
                  />
                </FormGroup>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    スロットリング設定
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Slider
                      value={settings.throttleRate}
                      onChange={(e, value) => setSettings({ ...settings, throttleRate: value as number })}
                      min={10}
                      max={100}
                      step={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="body2">{settings.throttleRate}%</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    配信速度を制御して、サーバー負荷を分散
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList /> 自動フィルター
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {[
                    { label: '重複アドレス除去', enabled: true, icon: <PersonRemove /> },
                    { label: '無効なアドレス除去', enabled: true, icon: <ErrorIcon /> },
                    { label: 'ロールアカウント除去', enabled: false, icon: <Business /> },
                    { label: 'エンゲージメント低除去', enabled: false, icon: <TrendingDown /> },
                    { label: '長期未開封者除去', enabled: true, icon: <Schedule /> },
                    { label: 'ハードバウンス自動除去', enabled: true, icon: <Block /> },
                  ].map((filter) => (
                    <Grid item xs={12} sm={6} md={4} key={filter.label}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {filter.icon}
                              <Typography variant="body2">{filter.label}</Typography>
                            </Box>
                            <Switch checked={filter.enabled} size="small" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* テンプレート設定タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColorLens /> デザイン設定
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormControl fullWidth margin="normal">
                  <InputLabel>デフォルトテンプレート</InputLabel>
                  <Select
                    value={templateSettings.defaultTemplate}
                    onChange={(e) => setTemplateSettings({ ...templateSettings, defaultTemplate: e.target.value })}
                  >
                    <MenuItem value="construction_basic">建設業ベーシック</MenuItem>
                    <MenuItem value="construction_pro">建設業プロフェッショナル</MenuItem>
                    <MenuItem value="minimal">ミニマル</MenuItem>
                    <MenuItem value="newsletter">ニュースレター</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="ヘッダーロゴURL"
                  value={templateSettings.headerLogo}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, headerLogo: e.target.value })}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small">
                          <Image />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="フッターテキスト"
                  value={templateSettings.footerText}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, footerText: e.target.value })}
                  margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>ソーシャルリンク</Typography>
                  <FormGroup row>
                    {Object.keys(templateSettings.socialLinks).map((social) => (
                      <FormControlLabel
                        key={social}
                        control={
                          <Switch
                            checked={templateSettings.socialLinks[social as keyof typeof templateSettings.socialLinks]}
                            size="small"
                          />
                        }
                        label={social.charAt(0).toUpperCase() + social.slice(1)}
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code /> カスタムCSS
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  label="カスタムCSS"
                  value={templateSettings.customCSS}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, customCSS: e.target.value })}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">プレビュー</Button>
                  <Button variant="outlined" size="small">検証</Button>
                  <Button variant="outlined" size="small">リセット</Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {/* 高度な設定タブ */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReport /> A/Bテスト設定
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="自動A/Bテスト有効"
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="テストグループサイズ"
                        defaultValue="10"
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="テスト期間"
                        defaultValue="4"
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">時間</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>勝者判定基準</InputLabel>
                        <Select defaultValue="open_rate">
                          <MenuItem value="open_rate">開封率</MenuItem>
                          <MenuItem value="click_rate">クリック率</MenuItem>
                          <MenuItem value="conversion">コンバージョン</MenuItem>
                          <MenuItem value="revenue">収益</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>統計的有意水準</InputLabel>
                        <Select defaultValue="95">
                          <MenuItem value="90">90%</MenuItem>
                          <MenuItem value="95">95%</MenuItem>
                          <MenuItem value="99">99%</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics /> トラッキング詳細
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormGroup>
                        <FormControlLabel control={<Switch defaultChecked />} label="UTMパラメータ自動付与" />
                        <FormControlLabel control={<Switch defaultChecked />} label="Googleアナリティクス連携" />
                        <FormControlLabel control={<Switch />} label="Facebook Pixel連携" />
                        <FormControlLabel control={<Switch />} label="カスタムイベント送信" />
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="UTMソース"
                        defaultValue="email"
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="UTMメディア"
                        defaultValue="email"
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="カスタムパラメータ"
                        placeholder="key=value形式"
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language /> 多言語対応
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={<Switch />}
                        label="自動翻訳有効"
                      />
                      <FormControl fullWidth margin="normal">
                        <InputLabel>デフォルト言語</InputLabel>
                        <Select defaultValue="ja">
                          <MenuItem value="ja">日本語</MenuItem>
                          <MenuItem value="en">英語</MenuItem>
                          <MenuItem value="zh">中国語</MenuItem>
                          <MenuItem value="ko">韓国語</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormGroup>
                        <FormControlLabel control={<Switch defaultChecked />} label="言語別配信停止リンク" />
                        <FormControlLabel control={<Switch />} label="自動言語検出" />
                        <FormControlLabel control={<Switch />} label="RTL言語サポート" />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Science /> 実験的機能
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    実験的機能は予告なく変更される可能性があります
                  </Alert>
                  <FormGroup>
                    <FormControlLabel control={<Switch />} label="AI件名最適化（Beta）" />
                    <FormControlLabel control={<Switch />} label="送信時間自動最適化（Beta）" />
                    <FormControlLabel control={<Switch />} label="コンテンツ自動パーソナライズ（Alpha）" />
                    <FormControlLabel control={<Switch />} label="予測配信停止防止（Alpha）" />
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </TabPanel>
      </CardContent>

      {/* ドメイン追加ダイアログ */}
      <Dialog open={showDomainDialog} onClose={() => setShowDomainDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>新しいドメインを追加</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ドメイン名"
            placeholder="example.com"
            margin="normal"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            ドメインを追加後、DNSレコードの設定が必要です。
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDomainDialog(false)}>キャンセル</Button>
          <Button variant="contained">追加</Button>
        </DialogActions>
      </Dialog>

      {/* 配信停止リスト追加ダイアログ */}
      <Dialog open={showSuppressDialog} onClose={() => setShowSuppressDialog(false)}>
        <DialogTitle>配信停止リストに追加</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="メールアドレス"
            placeholder="user@example.com"
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>理由</InputLabel>
            <Select defaultValue="">
              <MenuItem value="bounce">バウンス</MenuItem>
              <MenuItem value="spam">スパム報告</MenuItem>
              <MenuItem value="unsubscribe">配信停止要求</MenuItem>
              <MenuItem value="manual">手動追加</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuppressDialog(false)}>キャンセル</Button>
          <Button variant="contained">追加</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EmailSettings;