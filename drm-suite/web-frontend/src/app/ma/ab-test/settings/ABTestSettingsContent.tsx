'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SegmentBuilder from '@/components/ma/segment-builder';
import DeliveryScheduler from '@/components/ma/delivery-scheduler';
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
  FormControlLabel,
  Checkbox,
  InputLabel,
  Slider,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  AvatarGroup,
  Tooltip,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  ExpandMore,
  Group,
  LocationOn,
  CalendarToday,
  AccessTime,
  Devices,
  Psychology,
  TrendingUp,
  Warning,
  Info,
  CheckCircle,
  Settings,
  FilterList,
  Timeline,
  PersonAdd,
  Business,
  Home,
  Cake,
  AttachMoney,
  LocalOffer,
  Assignment,
  Schedule,
  Shuffle,
  CompareArrows,
  Science,
  Speed,
  Visibility,
} from '@mui/icons-material';

interface TestSegment {
  id: string;
  name: string;
  type:
    | 'demographic'
    | 'behavioral'
    | 'geographic'
    | 'technographic'
    | 'construction';
  conditions: SegmentCondition[];
  size: number;
  enabled: boolean;
}

interface SegmentCondition {
  field: string;
  operator: string;
  value: any;
}

interface TestVariant {
  id: string;
  name: string;
  allocation: number;
  color: string;
  content: any;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export default function ABTestSettingsPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [testName, setTestName] = useState('新規A/Bテスト');
  const [testType, setTestType] = useState<'ab' | 'multivariate' | 'split'>(
    'ab',
  );
  const [variants, setVariants] = useState<TestVariant[]>([
    {
      id: 'a',
      name: 'コントロール',
      allocation: 50,
      color: '#4285f4',
      content: {},
    },
    {
      id: 'b',
      name: 'バリアントB',
      allocation: 50,
      color: '#34a853',
      content: {},
    },
  ]);

  const [segments, setSegments] = useState<TestSegment[]>([
    {
      id: '1',
      name: '都市部の若年層',
      type: 'demographic',
      conditions: [
        { field: 'age', operator: 'between', value: [25, 40] },
        { field: 'area', operator: 'in', value: ['東京', '大阪', '名古屋'] },
      ],
      size: 3240,
      enabled: true,
    },
    {
      id: '2',
      name: '高額物件検討者',
      type: 'behavioral',
      conditions: [
        { field: 'budget', operator: '>', value: 5000000 },
        { field: 'property_type', operator: '=', value: 'residential' },
      ],
      size: 856,
      enabled: false,
    },
  ]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { day: '月曜日', startTime: '09:00', endTime: '18:00', enabled: true },
    { day: '火曜日', startTime: '09:00', endTime: '18:00', enabled: true },
    { day: '水曜日', startTime: '09:00', endTime: '18:00', enabled: true },
    { day: '木曜日', startTime: '09:00', endTime: '18:00', enabled: true },
    { day: '金曜日', startTime: '09:00', endTime: '18:00', enabled: true },
    { day: '土曜日', startTime: '10:00', endTime: '15:00', enabled: false },
    { day: '日曜日', startTime: '10:00', endTime: '15:00', enabled: false },
  ]);

  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);

  const segmentTemplates = [
    {
      name: '新規見込み客',
      icon: <PersonAdd />,
      conditions: [
        { field: 'lead_status', operator: '=', value: 'new' },
        { field: 'days_since_signup', operator: '<', value: 30 },
      ],
    },
    {
      name: 'リピーター',
      icon: <TrendingUp />,
      conditions: [
        { field: 'purchase_count', operator: '>', value: 1 },
        { field: 'last_purchase', operator: '<', value: 180 },
      ],
    },
    {
      name: '高額顧客',
      icon: <AttachMoney />,
      conditions: [{ field: 'total_spent', operator: '>', value: 10000000 }],
    },
    {
      name: '地方在住',
      icon: <LocationOn />,
      conditions: [
        { field: 'region', operator: 'not_in', value: ['東京', '大阪'] },
      ],
    },
  ];

  const handleAddVariant = () => {
    const newVariant: TestVariant = {
      id: `v${variants.length + 1}`,
      name: `バリアント${String.fromCharCode(65 + variants.length)}`,
      allocation: 0,
      color:
        ['#fbbc04', '#ea4335', '#9c27b0', '#00bcd4'][variants.length - 2] ||
        '#666',
      content: {},
    };

    // 配分を再計算
    const newAllocation = Math.floor(100 / (variants.length + 1));
    const updatedVariants = variants.map((v) => ({
      ...v,
      allocation: newAllocation,
    }));
    updatedVariants.push({
      ...newVariant,
      allocation: 100 - newAllocation * variants.length,
    });

    setVariants(updatedVariants);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 2) return;

    const remainingVariants = variants.filter((v) => v.id !== id);
    const newAllocation = Math.floor(100 / remainingVariants.length);
    const updatedVariants = remainingVariants.map((v, index) => ({
      ...v,
      allocation:
        index === remainingVariants.length - 1
          ? 100 - newAllocation * (remainingVariants.length - 1)
          : newAllocation,
    }));

    setVariants(updatedVariants);
  };

  const handleAllocationChange = (id: string, value: number) => {
    const updatedVariants = variants.map((v) =>
      v.id === id ? { ...v, allocation: value } : v,
    );
    setVariants(updatedVariants);
  };

  const totalAllocation = variants.reduce((sum, v) => sum + v.allocation, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <Box sx={{ bgcolor: 'white', p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push('/ma/ab-test')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              ⚙️ A/Bテスト詳細設定
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined">下書き保存</Button>
            <Button
              variant="contained"
              startIcon={<Science />}
              sx={{ bgcolor: '#4285f4' }}
              disabled={totalAllocation !== 100}
            >
              テスト開始
            </Button>
          </Box>
        </Box>
      </Box>

      {/* メインコンテンツ */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 左側 - 設定ステッパー */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: 基本設定 */}
                <Step>
                  <StepLabel>
                    <Typography sx={{ fontWeight: 600 }}>基本設定</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="テスト名"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        sx={{ mb: 3 }}
                      />

                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 2, fontWeight: 600 }}
                      >
                        テストタイプ
                      </Typography>
                      <RadioGroup
                        value={testType}
                        onChange={(e) => setTestType(e.target.value as any)}
                      >
                        <FormControlLabel
                          value="ab"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600 }}
                              >
                                A/Bテスト
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                2つのバリアントを比較する標準的なテスト
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="multivariate"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600 }}
                              >
                                多変量テスト
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                3つ以上のバリアントを同時にテスト
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="split"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600 }}
                              >
                                スプリットURL
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                異なるURLでページ全体をテスト
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(1)}
                        >
                          次へ
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 2: バリアント設定 */}
                <Step>
                  <StepLabel>
                    <Typography sx={{ fontWeight: 600 }}>
                      バリアント設定
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          テストバリアント
                        </Typography>
                        <Button
                          startIcon={<Add />}
                          onClick={handleAddVariant}
                          disabled={variants.length >= 6}
                        >
                          バリアント追加
                        </Button>
                      </Box>

                      {variants.map((variant, index) => (
                        <Paper
                          key={variant.id}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: `2px solid ${variant.color}`,
                          }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={4}>
                              <TextField
                                fullWidth
                                label="バリアント名"
                                value={variant.name}
                                size="small"
                                onChange={(e) => {
                                  const updated = variants.map((v) =>
                                    v.id === variant.id
                                      ? { ...v, name: e.target.value }
                                      : v,
                                  );
                                  setVariants(updated);
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={5}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ minWidth: 80 }}
                                >
                                  配分: {variant.allocation}%
                                </Typography>
                                <Slider
                                  value={variant.allocation}
                                  onChange={(e, value) =>
                                    handleAllocationChange(
                                      variant.id,
                                      value as number,
                                    )
                                  }
                                  min={0}
                                  max={100}
                                  sx={{ color: variant.color }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={
                                    index === 0
                                      ? 'コントロール'
                                      : `テスト${index}`
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: variant.color,
                                    color: 'white',
                                  }}
                                />
                                {variants.length > 2 && (
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleRemoveVariant(variant.id)
                                    }
                                    disabled={index === 0}
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}

                      {totalAllocation !== 100 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          配分の合計が100%になるように調整してください（現在:{' '}
                          {totalAllocation}%）
                        </Alert>
                      )}

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(0)}>戻る</Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(2)}
                          disabled={totalAllocation !== 100}
                        >
                          次へ
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: セグメント設定 */}
                <Step>
                  <StepLabel>
                    <Typography sx={{ fontWeight: 600 }}>
                      セグメント設定
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          対象セグメント
                        </Typography>
                        <Button
                          startIcon={<Add />}
                          onClick={() => setShowSegmentDialog(true)}
                        >
                          セグメント追加
                        </Button>
                      </Box>

                      {segments.map((segment) => (
                        <Paper key={segment.id} sx={{ p: 2, mb: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Switch
                                checked={segment.enabled}
                                onChange={(e) => {
                                  const updated = segments.map((s) =>
                                    s.id === segment.id
                                      ? { ...s, enabled: e.target.checked }
                                      : s,
                                  );
                                  setSegments(updated);
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {segment.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  {segment.conditions.map(
                                    (condition, index) => (
                                      <Chip
                                        key={index}
                                        label={`${condition.field} ${condition.operator} ${Array.isArray(condition.value) ? condition.value.join('-') : condition.value}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ),
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Chip
                                label={`${segment.size.toLocaleString()}人`}
                                icon={<Group />}
                                color="primary"
                              />
                              <IconButton size="small">
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}

                      <Alert severity="info" sx={{ mt: 2 }}>
                        複数のセグメントを有効にすると、条件に合致するすべての顧客がテスト対象になります
                      </Alert>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(1)}>戻る</Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(3)}
                        >
                          次へ
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 4: 配信設定 */}
                <Step>
                  <StepLabel>
                    <Typography sx={{ fontWeight: 600 }}>配信設定</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 2, fontWeight: 600 }}
                      >
                        時間帯別配信
                      </Typography>

                      <Grid container spacing={2}>
                        {timeSlots.map((slot) => (
                          <Grid item xs={12} md={6} key={slot.day}>
                            <Paper
                              sx={{ p: 2, opacity: slot.enabled ? 1 : 0.5 }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {slot.day}
                                </Typography>
                                <Switch
                                  checked={slot.enabled}
                                  onChange={(e) => {
                                    const updated = timeSlots.map((s) =>
                                      s.day === slot.day
                                        ? { ...s, enabled: e.target.checked }
                                        : s,
                                    );
                                    setTimeSlots(updated);
                                  }}
                                />
                              </Box>
                              {slot.enabled && (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'center',
                                  }}
                                >
                                  <TextField
                                    type="time"
                                    value={slot.startTime}
                                    size="small"
                                    onChange={(e) => {
                                      const updated = timeSlots.map((s) =>
                                        s.day === slot.day
                                          ? { ...s, startTime: e.target.value }
                                          : s,
                                      );
                                      setTimeSlots(updated);
                                    }}
                                  />
                                  <Typography variant="body2">〜</Typography>
                                  <TextField
                                    type="time"
                                    value={slot.endTime}
                                    size="small"
                                    onChange={(e) => {
                                      const updated = timeSlots.map((s) =>
                                        s.day === slot.day
                                          ? { ...s, endTime: e.target.value }
                                          : s,
                                      );
                                      setTimeSlots(updated);
                                    }}
                                  />
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>

                      <Divider sx={{ my: 3 }} />

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          配信速度
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Schedule />}
                          onClick={() => setShowDeliveryScheduler(true)}
                        >
                          高度な配信設定
                        </Button>
                      </Box>
                      <RadioGroup defaultValue="normal">
                        <FormControlLabel
                          value="immediate"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">
                                即座に配信
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                すべての対象者に一度に配信
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="normal"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">通常配信</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                1時間あたり1,000件のペースで配信
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="throttled"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">段階配信</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                最初は10%、問題なければ徐々に増やす
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(2)}>戻る</Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(4)}
                        >
                          次へ
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 5: 確認 */}
                <Step>
                  <StepLabel>
                    <Typography sx={{ fontWeight: 600 }}>確認</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{ mb: 2 }}
                      >
                        テスト設定が完了しました。以下の内容でテストを開始します。
                      </Alert>

                      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              テスト名
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {testName}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              テストタイプ
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {testType === 'ab'
                                ? 'A/Bテスト'
                                : testType === 'multivariate'
                                  ? '多変量テスト'
                                  : 'スプリットURL'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              バリアント数
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {variants.length}パターン
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              想定対象者数
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {segments
                                .filter((s) => s.enabled)
                                .reduce((sum, s) => sum + s.size, 0)
                                .toLocaleString()}
                              人
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button onClick={() => setActiveStep(3)}>戻る</Button>
                        <Button
                          variant="contained"
                          startIcon={<Science />}
                          sx={{ bgcolor: '#4285f4' }}
                        >
                          テスト開始
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Paper>
          </Grid>

          {/* 右側 - プレビュー */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                テストサマリー
              </Typography>

              {/* バリアント配分の可視化 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  トラフィック配分
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    height: 40,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  {variants.map((variant) => (
                    <Tooltip
                      key={variant.id}
                      title={`${variant.name}: ${variant.allocation}%`}
                    >
                      <Box
                        sx={{
                          width: `${variant.allocation}%`,
                          bgcolor: variant.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {variant.allocation > 10 && `${variant.allocation}%`}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 推定効果 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  推定結果
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Speed />
                    </ListItemIcon>
                    <ListItemText
                      primary="テスト期間"
                      secondary="7-14日（95%信頼度）"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary="必要サンプル数"
                      secondary="各バリアント1,500件以上"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="期待改善率"
                      secondary="+15-30%（業界平均）"
                    />
                  </ListItem>
                </List>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 注意事項 */}
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  テスト実施の注意点
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • テスト期間中は設定を変更しない
                  <br />
                  • 最低7日間は継続する
                  <br />• 外部要因の影響を考慮する
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* セグメント追加ダイアログ - 高度なセグメントビルダー */}
      <SegmentBuilder
        open={showSegmentDialog}
        onClose={() => setShowSegmentDialog(false)}
        onSave={(newSegment) => {
          setSegments([...segments, newSegment]);
          setShowSegmentDialog(false);
        }}
      />

      {/* 時間帯別配信スケジューラー */}
      <DeliveryScheduler
        open={showDeliveryScheduler}
        onClose={() => setShowDeliveryScheduler(false)}
        onSave={(schedule) => {
          console.log('配信スケジュール:', schedule);
          // TODO: スケジュール設定を保存
          setShowDeliveryScheduler(false);
        }}
        campaignType="email"
      />
    </Box>
  );
}
