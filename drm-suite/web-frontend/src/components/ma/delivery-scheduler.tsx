'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Schedule,
  AccessTime,
  ContentCopy,
  Delete,
  Add,
  TrendingUp,
  TrendingDown,
  Warning,
  Info,
  CheckCircle,
  AutoAwesome,
  Insights,
  CalendarMonth,
  WbSunny,
  NightsStay,
  LunchDining,
} from '@mui/icons-material';

interface TimeSlot {
  hour: number;
  effectiveness: number;
  volume: number;
  enabled: boolean;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
  optimalTime?: string;
}

interface DeliverySchedulerProps {
  open: boolean;
  onClose: () => void;
  onSave: (schedule: any) => void;
  campaignType?: 'email' | 'push' | 'sms' | 'line';
}

const DeliveryScheduler: React.FC<DeliverySchedulerProps> = ({
  open,
  onClose,
  onSave,
  campaignType = 'email',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [scheduleMode, setScheduleMode] = useState<'manual' | 'auto' | 'ai'>('manual');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [deliverySpeed, setDeliverySpeed] = useState<'immediate' | 'gradual' | 'throttled'>('gradual');
  const [maxDeliveryPerHour, setMaxDeliveryPerHour] = useState(1000);

  const daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

  const [schedule, setSchedule] = useState<DaySchedule[]>(
    daysOfWeek.map((day, index) => ({
      day,
      enabled: index < 5, // 平日のみデフォルトで有効
      slots: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        effectiveness:
          hour >= 9 && hour <= 11 ? 85 :
          hour >= 14 && hour <= 16 ? 75 :
          hour >= 19 && hour <= 21 ? 90 :
          hour >= 6 && hour <= 23 ? 50 : 20,
        volume:
          hour >= 9 && hour <= 11 ? 30 :
          hour >= 14 && hour <= 16 ? 20 :
          hour >= 19 && hour <= 21 ? 25 :
          hour >= 6 && hour <= 23 ? 15 : 5,
        enabled: hour >= 9 && hour <= 21,
      })),
      optimalTime: index < 5 ? '10:00' : '11:00',
    }))
  );

  const industryPresets = {
    construction: {
      name: '建設業界向け',
      description: '朝の準備時間と夕方の終業後を重視',
      schedule: {
        weekdays: { morning: [6, 8], evening: [17, 19] },
        weekends: { morning: [9, 11] },
      },
    },
    b2b: {
      name: 'B2B標準',
      description: '営業時間内の配信を重視',
      schedule: {
        weekdays: { morning: [9, 11], afternoon: [14, 16] },
        weekends: { disabled: true },
      },
    },
    b2c: {
      name: 'B2C標準',
      description: '通勤時間と夜間を重視',
      schedule: {
        weekdays: { morning: [7, 9], evening: [19, 22] },
        weekends: { morning: [10, 12], evening: [19, 21] },
      },
    },
  };

  const timeIcons = {
    morning: <WbSunny sx={{ color: '#ffc107' }} />,
    afternoon: <LunchDining sx={{ color: '#ff9800' }} />,
    evening: <NightsStay sx={{ color: '#3f51b5' }} />,
  };

  const getTimeOfDay = (hour: number) => {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  const getHeatmapColor = (effectiveness: number) => {
    if (effectiveness >= 80) return '#4caf50';
    if (effectiveness >= 60) return '#8bc34a';
    if (effectiveness >= 40) return '#ffeb3b';
    if (effectiveness >= 20) return '#ff9800';
    return '#f44336';
  };

  const updateSlot = (dayIndex: number, hour: number, updates: Partial<TimeSlot>) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[hour] = {
      ...newSchedule[dayIndex].slots[hour],
      ...updates,
    };
    setSchedule(newSchedule);
  };

  const toggleDay = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].enabled = !newSchedule[dayIndex].enabled;
    setSchedule(newSchedule);
  };

  const applyPreset = (preset: keyof typeof industryPresets) => {
    const presetConfig = industryPresets[preset];
    const newSchedule = [...schedule];

    newSchedule.forEach((day, dayIndex) => {
      const isWeekday = dayIndex < 5;
      const dayConfig = isWeekday ? presetConfig.schedule.weekdays : presetConfig.schedule.weekends;

      if (dayConfig.disabled) {
        day.enabled = false;
      } else {
        day.enabled = true;
        day.slots.forEach((slot) => {
          slot.enabled = false;
          slot.effectiveness = 20;
        });

        if (dayConfig.morning) {
          for (let h = dayConfig.morning[0]; h <= dayConfig.morning[1]; h++) {
            day.slots[h].enabled = true;
            day.slots[h].effectiveness = 85;
          }
        }
        if (dayConfig.afternoon) {
          for (let h = dayConfig.afternoon[0]; h <= dayConfig.afternoon[1]; h++) {
            day.slots[h].enabled = true;
            day.slots[h].effectiveness = 70;
          }
        }
        if (dayConfig.evening) {
          for (let h = dayConfig.evening[0]; h <= dayConfig.evening[1]; h++) {
            day.slots[h].enabled = true;
            day.slots[h].effectiveness = 90;
          }
        }
      }
    });

    setSchedule(newSchedule);
  };

  const calculateOptimalTimes = () => {
    const newSchedule = [...schedule];
    newSchedule.forEach((day) => {
      if (day.enabled) {
        const bestSlot = day.slots.reduce((best, current, index) => {
          if (current.enabled && current.effectiveness > best.effectiveness) {
            return { ...current, hour: index };
          }
          return best;
        }, { effectiveness: 0, hour: 10 });

        day.optimalTime = `${String(bestSlot.hour).padStart(2, '0')}:00`;
      }
    });
    setSchedule(newSchedule);
  };

  const getTotalDeliveryHours = () => {
    return schedule.reduce((total, day) => {
      if (!day.enabled) return total;
      return total + day.slots.filter(slot => slot.enabled).length;
    }, 0);
  };

  const getAverageEffectiveness = () => {
    let totalEffectiveness = 0;
    let count = 0;

    schedule.forEach((day) => {
      if (day.enabled) {
        day.slots.forEach((slot) => {
          if (slot.enabled) {
            totalEffectiveness += slot.effectiveness;
            count++;
          }
        });
      }
    });

    return count > 0 ? Math.round(totalEffectiveness / count) : 0;
  };

  const handleSave = () => {
    const config = {
      mode: scheduleMode,
      timezone,
      deliverySpeed,
      maxDeliveryPerHour,
      schedule,
      metrics: {
        totalHours: getTotalDeliveryHours(),
        avgEffectiveness: getAverageEffectiveness(),
      },
    };
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Schedule color="primary" />
          <Typography variant="h6">時間帯別配信設定</Typography>
          <Chip
            label={`${getTotalDeliveryHours()}時間/週`}
            size="small"
            color="primary"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="スケジュール設定" />
          <Tab label="配信速度" />
          <Tab label="AI最適化" />
          <Tab label="プレビュー" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                設定モード
              </Typography>
              <ToggleButtonGroup
                value={scheduleMode}
                onChange={(_, value) => value && setScheduleMode(value)}
                exclusive
                fullWidth
              >
                <ToggleButton value="manual">
                  <Box sx={{ textAlign: 'center' }}>
                    <AccessTime sx={{ mb: 0.5 }} />
                    <Typography variant="caption" display="block">
                      手動設定
                    </Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="auto">
                  <Box sx={{ textAlign: 'center' }}>
                    <Schedule sx={{ mb: 0.5 }} />
                    <Typography variant="caption" display="block">
                      自動最適化
                    </Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="ai">
                  <Box sx={{ textAlign: 'center' }}>
                    <AutoAwesome sx={{ mb: 0.5 }} />
                    <Typography variant="caption" display="block">
                      AI推奨
                    </Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {scheduleMode === 'manual' && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    業界別テンプレート
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(industryPresets).map(([key, preset]) => (
                      <Grid item xs={12} md={4} key={key}>
                        <Paper
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => applyPreset(key as keyof typeof industryPresets)}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {preset.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {preset.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    曜日別スケジュール
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>曜日</TableCell>
                          <TableCell>有効</TableCell>
                          <TableCell>配信時間帯</TableCell>
                          <TableCell>最適時刻</TableCell>
                          <TableCell>効果予測</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {schedule.map((day, dayIndex) => (
                          <TableRow key={day.day}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {day.day}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={day.enabled}
                                onChange={() => toggleDay(dayIndex)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {day.slots.map((slot, hour) => (
                                  <Tooltip
                                    key={hour}
                                    title={`${hour}:00 - 効果: ${slot.effectiveness}%`}
                                  >
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        bgcolor: slot.enabled
                                          ? getHeatmapColor(slot.effectiveness)
                                          : '#e0e0e0',
                                        cursor: day.enabled ? 'pointer' : 'default',
                                        opacity: day.enabled ? 1 : 0.5,
                                        border: '1px solid #fff',
                                      }}
                                      onClick={() => {
                                        if (day.enabled) {
                                          updateSlot(dayIndex, hour, { enabled: !slot.enabled });
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {day.enabled && day.optimalTime ? (
                                <Chip
                                  label={day.optimalTime}
                                  size="small"
                                  icon={timeIcons[getTimeOfDay(parseInt(day.optimalTime))]}
                                />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {day.enabled ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={
                                      day.slots.filter(s => s.enabled).reduce((sum, s) => sum + s.effectiveness, 0) /
                                      day.slots.filter(s => s.enabled).length || 0
                                    }
                                    sx={{ width: 60, height: 6 }}
                                  />
                                  <Typography variant="caption">
                                    {Math.round(
                                      day.slots.filter(s => s.enabled).reduce((sum, s) => sum + s.effectiveness, 0) /
                                      day.slots.filter(s => s.enabled).length || 0
                                    )}%
                                  </Typography>
                                </Box>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Alert severity="info" icon={<Info />}>
                  各時間帯をクリックして配信の有効/無効を切り替えられます。
                  色が濃いほど配信効果が高い時間帯です。
                </Alert>
              </>
            )}

            {scheduleMode === 'auto' && (
              <Box>
                <Alert severity="success" icon={<AutoAwesome />}>
                  過去の配信データを基に、最適な配信時間を自動で設定します。
                </Alert>
                <Button
                  variant="contained"
                  onClick={calculateOptimalTimes}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  最適化を実行
                </Button>
              </Box>
            )}

            {scheduleMode === 'ai' && (
              <Box>
                <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    AI推奨設定
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: 'white' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          🎯 ターゲット分析
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • 主要ターゲット: 30-50代男性
                          <br />
                          • アクティブ時間: 朝6-8時、夜19-21時
                          <br />
                          • デバイス: 60%モバイル、40%PC
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: 'white' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          📊 推奨配信パターン
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • 平日朝: 6:30-7:30（通勤前）
                          <br />
                          • 平日夜: 19:00-20:00（帰宅後）
                          <br />
                          • 週末: 10:00-11:00（活動開始）
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    onClick={() => applyPreset('construction')}
                    sx={{ mt: 2 }}
                    fullWidth
                    startIcon={<AutoAwesome />}
                  >
                    AI推奨設定を適用
                  </Button>
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
              配信速度設定
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    配信モード
                  </Typography>
                  <ToggleButtonGroup
                    value={deliverySpeed}
                    onChange={(_, value) => value && setDeliverySpeed(value)}
                    exclusive
                    orientation="vertical"
                    fullWidth
                  >
                    <ToggleButton value="immediate">
                      <Box sx={{ textAlign: 'left', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          即時配信
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          全件を一度に配信
                        </Typography>
                      </Box>
                    </ToggleButton>
                    <ToggleButton value="gradual">
                      <Box sx={{ textAlign: 'left', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          段階配信
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          時間をかけて徐々に配信
                        </Typography>
                      </Box>
                    </ToggleButton>
                    <ToggleButton value="throttled">
                      <Box sx={{ textAlign: 'left', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          制限付き配信
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          1時間あたりの配信数を制限
                        </Typography>
                      </Box>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    配信上限（1時間あたり）
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={maxDeliveryPerHour}
                      onChange={(_, value) => setMaxDeliveryPerHour(value as number)}
                      min={100}
                      max={10000}
                      step={100}
                      marks={[
                        { value: 100, label: '100' },
                        { value: 5000, label: '5,000' },
                        { value: 10000, label: '10,000' },
                      ]}
                      valueLabelDisplay="on"
                      disabled={deliverySpeed === 'immediate'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    サーバー負荷を考慮した配信速度を設定します
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="warning" icon={<Warning />}>
                  大量配信を行う場合は、ISPのレート制限に注意してください。
                  段階配信を推奨します。
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
              AI最適化分析
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Insights color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h6">配信パフォーマンス予測</Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
                          +32%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          開封率向上予測
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" color="success.main" sx={{ fontWeight: 600 }}>
                          +18%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          クリック率向上予測
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" color="warning.main" sx={{ fontWeight: 600 }}>
                          -15%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          配信停止率低下予測
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    学習データ
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        分析期間:
                      </Typography>
                      <Typography variant="body2">過去90日間</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        配信数:
                      </Typography>
                      <Typography variant="body2">125,430通</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        学習精度:
                      </Typography>
                      <Chip label="92%" size="small" color="success" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Info color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      AI最適化のメリット
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    • 個々の受信者の行動パターンを学習し、最適な配信時刻を自動調整
                    <br />
                    • 曜日・時間帯別の反応率を分析し、配信スケジュールを継続的に改善
                    <br />
                    • 季節変動や業界トレンドを考慮した動的な最適化
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
              配信スケジュール プレビュー
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    週間ビュー
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5 }}>
                    <Box />
                    {daysOfWeek.map((day) => (
                      <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 600 }}>
                        {day.substring(0, 1)}
                      </Typography>
                    ))}
                    {Array.from({ length: 24 }, (_, hour) => (
                      <React.Fragment key={hour}>
                        <Typography variant="caption" sx={{ pr: 1, textAlign: 'right' }}>
                          {hour}:00
                        </Typography>
                        {schedule.map((day) => (
                          <Box
                            key={`${day.day}-${hour}`}
                            sx={{
                              bgcolor: day.enabled && day.slots[hour].enabled
                                ? getHeatmapColor(day.slots[hour].effectiveness)
                                : '#f5f5f5',
                              height: 20,
                              border: '1px solid #fff',
                            }}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    サマリー
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        配信時間合計
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {getTotalDeliveryHours()} 時間/週
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        平均効果スコア
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {getAverageEffectiveness()}%
                        </Typography>
                        {getAverageEffectiveness() > 70 ? (
                          <TrendingUp color="success" />
                        ) : (
                          <TrendingDown color="error" />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        タイムゾーン
                      </Typography>
                      <Chip label={timezone} />
                    </Box>
                  </Box>
                </Paper>

                <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
                  設定は自動的に保存され、次回配信から適用されます
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="contained" onClick={handleSave} startIcon={<CheckCircle />}>
          設定を保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryScheduler;