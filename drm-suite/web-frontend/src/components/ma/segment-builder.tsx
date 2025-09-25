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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Paper,
  Grid,
  Autocomplete,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Slider,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Delete,
  FilterList,
  LocationOn,
  Person,
  Psychology,
  Business,
  Construction,
  QueryStats,
  Home,
} from '@mui/icons-material';

interface SegmentCondition {
  id: string;
  category: string;
  field: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

interface SegmentBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (segment: any) => void;
  existingSegment?: any;
}

const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  open,
  onClose,
  onSave,
  existingSegment,
}) => {
  const [segmentName, setSegmentName] = useState(existingSegment?.name || '');
  const [description, setDescription] = useState(existingSegment?.description || '');
  const [activeTab, setActiveTab] = useState(0);
  const [conditions, setConditions] = useState<SegmentCondition[]>(
    existingSegment?.conditions || []
  );
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const conditionCategories = {
    demographic: {
      label: '属性情報',
      icon: <Person />,
      fields: [
        { value: 'age', label: '年齢', type: 'range' },
        { value: 'gender', label: '性別', type: 'select', options: ['男性', '女性', 'その他'] },
        { value: 'income', label: '年収', type: 'range' },
        { value: 'family_size', label: '世帯人数', type: 'number' },
        { value: 'employment', label: '雇用形態', type: 'select', options: ['正社員', '契約社員', '自営業', 'パート・アルバイト'] },
      ],
    },
    geographic: {
      label: '地域情報',
      icon: <LocationOn />,
      fields: [
        { value: 'prefecture', label: '都道府県', type: 'multiselect' },
        { value: 'city', label: '市区町村', type: 'text' },
        { value: 'distance_from_office', label: '営業所からの距離(km)', type: 'number' },
        { value: 'area_type', label: '地域タイプ', type: 'select', options: ['都市部', '郊外', '地方'] },
      ],
    },
    behavioral: {
      label: '行動履歴',
      icon: <Psychology />,
      fields: [
        { value: 'last_contact', label: '最終接触日', type: 'date' },
        { value: 'contact_frequency', label: '接触頻度', type: 'select', options: ['高', '中', '低'] },
        { value: 'email_open_rate', label: 'メール開封率', type: 'percentage' },
        { value: 'website_visits', label: 'Webサイト訪問回数', type: 'number' },
        { value: 'inquiry_count', label: '問い合わせ回数', type: 'number' },
        { value: 'event_participation', label: 'イベント参加回数', type: 'number' },
      ],
    },
    construction: {
      label: '建築関連',
      icon: <Construction />,
      fields: [
        { value: 'building_type', label: '建物種別', type: 'select', options: ['戸建て', 'マンション', '店舗', 'オフィス'] },
        { value: 'construction_budget', label: '予算規模', type: 'range' },
        { value: 'construction_timeline', label: '建築予定時期', type: 'select', options: ['3ヶ月以内', '6ヶ月以内', '1年以内', '未定'] },
        { value: 'renovation_interest', label: 'リフォーム関心度', type: 'select', options: ['高', '中', '低', 'なし'] },
        { value: 'property_ownership', label: '不動産所有', type: 'boolean' },
      ],
    },
    business: {
      label: '企業情報',
      icon: <Business />,
      fields: [
        { value: 'company_size', label: '企業規模', type: 'select', options: ['大企業', '中小企業', '個人事業主'] },
        { value: 'industry', label: '業界', type: 'select', options: ['製造業', '小売業', 'サービス業', 'IT', 'その他'] },
        { value: 'annual_revenue', label: '年間売上', type: 'range' },
        { value: 'employee_count', label: '従業員数', type: 'range' },
        { value: 'business_years', label: '事業年数', type: 'number' },
      ],
    },
    engagement: {
      label: 'エンゲージメント',
      icon: <QueryStats />,
      fields: [
        { value: 'lead_score', label: 'リードスコア', type: 'range' },
        { value: 'lifecycle_stage', label: 'ライフサイクル', type: 'select', options: ['リード', '見込み客', '商談中', '既存顧客'] },
        { value: 'last_purchase', label: '最終購入日', type: 'date' },
        { value: 'purchase_frequency', label: '購入頻度', type: 'select', options: ['高', '中', '低', 'なし'] },
        { value: 'clv', label: '顧客生涯価値', type: 'range' },
      ],
    },
  };

  const operators = {
    text: ['等しい', '含む', '含まない', '始まる', '終わる'],
    number: ['等しい', '以上', '以下', '範囲内'],
    date: ['等しい', '以前', '以降', '範囲内'],
    select: ['等しい', '等しくない', 'いずれか'],
    multiselect: ['含む', '全て含む', '含まない'],
    boolean: ['はい', 'いいえ'],
    range: ['範囲内', '範囲外'],
    percentage: ['以上', '以下', '範囲内'],
  };

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];

  const addCondition = (category: string) => {
    const newCondition: SegmentCondition = {
      id: Date.now().toString(),
      category,
      field: '',
      operator: '',
      value: '',
      logic: conditions.length > 0 ? 'AND' : undefined,
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<SegmentCondition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const calculateEstimatedSize = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const baseSize = 10000;
      const reduction = conditions.length * 0.15;
      const estimated = Math.floor(baseSize * (1 - Math.min(reduction, 0.8)));
      setEstimatedSize(estimated);
      setIsCalculating(false);
    }, 1000);
  };

  const renderConditionValue = (condition: SegmentCondition, field: any) => {
    if (!field) return null;

    switch (field.type) {
      case 'range':
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              placeholder="最小"
              value={condition.value?.[0] || ''}
              onChange={(e) =>
                updateCondition(condition.id, {
                  value: [e.target.value, condition.value?.[1] || ''],
                })
              }
              sx={{ width: 100 }}
            />
            <Typography>〜</Typography>
            <TextField
              size="small"
              type="number"
              placeholder="最大"
              value={condition.value?.[1] || ''}
              onChange={(e) =>
                updateCondition(condition.id, {
                  value: [condition.value?.[0] || '', e.target.value],
                })
              }
              sx={{ width: 100 }}
            />
            {field.value === 'age' && <Typography>歳</Typography>}
            {field.value === 'income' && <Typography>万円</Typography>}
            {field.value === 'construction_budget' && <Typography>万円</Typography>}
          </Box>
        );

      case 'select':
        return (
          <Select
            size="small"
            value={condition.value || ''}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            sx={{ minWidth: 150 }}
          >
            {field.options?.map((option: string) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );

      case 'multiselect':
        return (
          <Autocomplete
            multiple
            size="small"
            options={field.value === 'prefecture' ? prefectures : []}
            value={condition.value || []}
            onChange={(_, newValue) => updateCondition(condition.id, { value: newValue })}
            renderInput={(params) => <TextField {...params} placeholder="選択" />}
            sx={{ minWidth: 200 }}
          />
        );

      case 'date':
        return (
          <TextField
            size="small"
            type="date"
            value={condition.value || ''}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            sx={{ width: 150 }}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={condition.value || false}
            onChange={(e) => updateCondition(condition.id, { value: e.target.checked })}
          />
        );

      case 'percentage':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Slider
              value={condition.value || 0}
              onChange={(_, newValue) => updateCondition(condition.id, { value: newValue })}
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
              sx={{ width: 150 }}
            />
            <Typography>{condition.value || 0}%</Typography>
          </Box>
        );

      default:
        return (
          <TextField
            size="small"
            value={condition.value || ''}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            sx={{ minWidth: 150 }}
          />
        );
    }
  };

  const handleSave = () => {
    const segment = {
      id: existingSegment?.id || Date.now().toString(),
      name: segmentName,
      description,
      conditions,
      size: estimatedSize,
      enabled: true,
      createdAt: existingSegment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(segment);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">セグメント設定</Typography>
          {estimatedSize > 0 && (
            <Chip
              label={`推定対象: ${estimatedSize.toLocaleString()}人`}
              color="primary"
              icon={<Person />}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="セグメント名"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="例: 建築予定の高関心層"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="説明"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="セグメントの説明を入力"
              />
            </Grid>
          </Grid>
        </Box>

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="条件設定" />
          <Tab label="プレビュー" />
          <Tab label="テンプレート" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                条件カテゴリを選択
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(conditionCategories).map(([key, category]) => (
                  <Button
                    key={key}
                    variant="outlined"
                    size="small"
                    startIcon={category.icon}
                    onClick={() => addCondition(key)}
                  >
                    {category.label}
                  </Button>
                ))}
              </Box>
            </Box>

            {conditions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  設定済み条件
                </Typography>
                {conditions.map((condition, index) => {
                  const category = conditionCategories[condition.category as keyof typeof conditionCategories];
                  const field = category?.fields.find((f) => f.value === condition.field);

                  return (
                    <Paper key={condition.id} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        {index > 0 && (
                          <FormControl size="small" sx={{ minWidth: 80 }}>
                            <Select
                              value={condition.logic || 'AND'}
                              onChange={(e) =>
                                updateCondition(condition.id, { logic: e.target.value as 'AND' | 'OR' })
                              }
                            >
                              <MenuItem value="AND">かつ</MenuItem>
                              <MenuItem value="OR">または</MenuItem>
                            </Select>
                          </FormControl>
                        )}

                        <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={category?.label}
                            size="small"
                            icon={category?.icon}
                            color="primary"
                            variant="outlined"
                          />

                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>項目</InputLabel>
                            <Select
                              value={condition.field}
                              onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                              label="項目"
                            >
                              {category?.fields.map((f) => (
                                <MenuItem key={f.value} value={f.value}>
                                  {f.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {field && (
                            <>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>条件</InputLabel>
                                <Select
                                  value={condition.operator}
                                  onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                                  label="条件"
                                >
                                  {operators[field.type as keyof typeof operators]?.map((op) => (
                                    <MenuItem key={op} value={op}>
                                      {op}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>

                              {renderConditionValue(condition, field)}
                            </>
                          )}
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => removeCondition(condition.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}

            {conditions.length === 0 && (
              <Alert severity="info">
                上記のカテゴリボタンから条件を追加してください
              </Alert>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              条件サマリー
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              {conditions.length > 0 ? (
                conditions.map((condition, index) => {
                  const category = conditionCategories[condition.category as keyof typeof conditionCategories];
                  const field = category?.fields.find((f) => f.value === condition.field);
                  return (
                    <Box key={condition.id} sx={{ mb: 1 }}>
                      {index > 0 && (
                        <Chip
                          label={condition.logic}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      <Typography variant="body2">
                        {category?.label} - {field?.label}: {condition.operator} {
                          Array.isArray(condition.value)
                            ? condition.value.join(' 〜 ')
                            : condition.value
                        }
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  条件が設定されていません
                </Typography>
              )}
            </Paper>

            <Button
              variant="contained"
              onClick={calculateEstimatedSize}
              sx={{ mt: 2 }}
              disabled={isCalculating || conditions.length === 0}
            >
              {isCalculating ? '計算中...' : '対象者数を推定'}
            </Button>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              建設業界向けテンプレート
            </Typography>
            <Grid container spacing={2}>
              {[
                {
                  name: '新築検討層',
                  description: '3-12ヶ月以内に新築を検討',
                  icon: <Home />,
                  conditions: [
                    { category: 'construction', field: 'building_type', value: '戸建て' },
                    { category: 'construction', field: 'construction_timeline', value: '1年以内' },
                    { category: 'behavioral', field: 'website_visits', value: [3, 100] },
                  ],
                },
                {
                  name: 'リフォーム高関心層',
                  description: 'リフォームに高い関心を持つ層',
                  icon: <Construction />,
                  conditions: [
                    { category: 'construction', field: 'renovation_interest', value: '高' },
                    { category: 'construction', field: 'property_ownership', value: true },
                    { category: 'demographic', field: 'age', value: [35, 65] },
                  ],
                },
                {
                  name: '法人建築需要',
                  description: '店舗・オフィス建築を検討する法人',
                  icon: <Business />,
                  conditions: [
                    { category: 'business', field: 'company_size', value: '中小企業' },
                    { category: 'construction', field: 'building_type', value: '店舗' },
                    { category: 'construction', field: 'construction_budget', value: [3000, 50000] },
                  ],
                },
              ].map((template) => (
                <Grid item xs={12} md={4} key={template.name}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => {
                      setSegmentName(template.name);
                      setDescription(template.description);
                      const newConditions = template.conditions.map((c, index) => ({
                        id: Date.now().toString() + index,
                        ...c,
                        operator: '等しい',
                        logic: index > 0 ? 'AND' as const : undefined,
                      }));
                      setConditions(newConditions);
                      setActiveTab(0);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {template.icon}
                      <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>
                        {template.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!segmentName || conditions.length === 0}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SegmentBuilder;