'use client';

import React, { useState, useEffect } from 'react';
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
  Alert,
  Slider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Tooltip,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  Science,
  Palette,
  ContentCopy,
  Shuffle,
  AutoAwesome,
  Warning,
  CheckCircle,
  ExpandMore,
  Settings,
  Analytics,
  Psychology,
} from '@mui/icons-material';

interface TestElement {
  id: string;
  type: 'headline' | 'button' | 'image' | 'layout' | 'color' | 'text';
  name: string;
  variations: string[];
}

interface TestCombination {
  id: string;
  elements: { elementId: string; variationIndex: number }[];
  allocation: number;
  estimatedImpact: 'high' | 'medium' | 'low';
}

interface MultivariateTestBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

const MultivariateTestBuilder: React.FC<MultivariateTestBuilderProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [testName, setTestName] = useState('');
  const [testElements, setTestElements] = useState<TestElement[]>([]);
  const [combinations, setCombinations] = useState<TestCombination[]>([]);
  const [autoAllocate, setAutoAllocate] = useState(true);
  const [maxCombinations, setMaxCombinations] = useState(8);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [minimumSampleSize, setMinimumSampleSize] = useState(1000);

  const elementTypes = [
    { value: 'headline', label: '見出し', icon: '📝' },
    { value: 'button', label: 'ボタン', icon: '🔘' },
    { value: 'image', label: '画像', icon: '🖼️' },
    { value: 'layout', label: 'レイアウト', icon: '📐' },
    { value: 'color', label: '色', icon: '🎨' },
    { value: 'text', label: 'テキスト', icon: '📄' },
  ];

  const colorPalette = [
    '#4285f4', '#34a853', '#fbbc04', '#ea4335',
    '#9c27b0', '#00bcd4', '#ff9800', '#795548',
    '#607d8b', '#e91e63', '#4caf50', '#2196f3',
  ];

  const addTestElement = () => {
    const newElement: TestElement = {
      id: Date.now().toString(),
      type: 'headline',
      name: `要素${testElements.length + 1}`,
      variations: ['バリエーション1', 'バリエーション2'],
    };
    setTestElements([...testElements, newElement]);
  };

  const updateElement = (id: string, updates: Partial<TestElement>) => {
    setTestElements(
      testElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const removeElement = (id: string) => {
    setTestElements(testElements.filter((el) => el.id !== id));
  };

  const addVariation = (elementId: string) => {
    const element = testElements.find((el) => el.id === elementId);
    if (element) {
      const newVariations = [
        ...element.variations,
        `バリエーション${element.variations.length + 1}`,
      ];
      updateElement(elementId, { variations: newVariations });
    }
  };

  const removeVariation = (elementId: string, index: number) => {
    const element = testElements.find((el) => el.id === elementId);
    if (element && element.variations.length > 2) {
      const newVariations = element.variations.filter((_, i) => i !== index);
      updateElement(elementId, { variations: newVariations });
    }
  };

  const generateCombinations = () => {
    if (testElements.length === 0) return;

    const totalPossible = testElements.reduce(
      (acc, el) => acc * el.variations.length,
      1
    );

    const numCombinations = Math.min(totalPossible, maxCombinations);
    const newCombinations: TestCombination[] = [];

    // 全要素の第1バリエーション（コントロール）を必ず含める
    newCombinations.push({
      id: 'control',
      elements: testElements.map((el) => ({
        elementId: el.id,
        variationIndex: 0,
      })),
      allocation: autoAllocate ? Math.floor(100 / numCombinations) : 0,
      estimatedImpact: 'medium',
    });

    // ランダムに他の組み合わせを生成
    const usedCombinations = new Set(['0'.repeat(testElements.length)]);

    while (newCombinations.length < numCombinations) {
      const combination: TestCombination = {
        id: Date.now().toString() + Math.random(),
        elements: testElements.map((el) => ({
          elementId: el.id,
          variationIndex: Math.floor(Math.random() * el.variations.length),
        })),
        allocation: autoAllocate ? Math.floor(100 / numCombinations) : 0,
        estimatedImpact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      };

      const key = combination.elements.map((e) => e.variationIndex).join('');
      if (!usedCombinations.has(key)) {
        usedCombinations.add(key);
        newCombinations.push(combination);
      }
    }

    // 配分を100%になるように調整
    if (autoAllocate) {
      const totalAllocation = newCombinations.reduce((acc, c) => acc + c.allocation, 0);
      if (totalAllocation < 100) {
        newCombinations[0].allocation += 100 - totalAllocation;
      }
    }

    setCombinations(newCombinations);
  };

  const updateCombinationAllocation = (id: string, allocation: number) => {
    setCombinations(
      combinations.map((c) => (c.id === id ? { ...c, allocation } : c))
    );
  };

  const getTotalCombinations = () => {
    return testElements.reduce((acc, el) => acc * el.variations.length, 1);
  };

  const getRequiredSampleSize = () => {
    const numCombinations = combinations.length;
    const baseSize = minimumSampleSize;
    return baseSize * numCombinations;
  };

  const getTestDuration = () => {
    const dailyTraffic = 500; // 仮定
    const requiredSize = getRequiredSampleSize();
    return Math.ceil(requiredSize / dailyTraffic);
  };

  useEffect(() => {
    if (autoAllocate && combinations.length > 0) {
      const equalAllocation = Math.floor(100 / combinations.length);
      const updatedCombinations = combinations.map((c, index) => ({
        ...c,
        allocation: index === 0 ? 100 - equalAllocation * (combinations.length - 1) : equalAllocation,
      }));
      setCombinations(updatedCombinations);
    }
  }, [combinations.length, autoAllocate]);

  const handleSave = () => {
    const config = {
      name: testName,
      type: 'multivariate',
      elements: testElements,
      combinations,
      settings: {
        autoAllocate,
        maxCombinations,
        confidenceLevel,
        minimumSampleSize,
      },
      estimatedDuration: getTestDuration(),
      requiredSampleSize: getRequiredSampleSize(),
    };
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Science color="primary" />
          <Typography variant="h6">多変量テスト設定</Typography>
          {getTotalCombinations() > 0 && (
            <Chip
              label={`${getTotalCombinations()}通りの組み合わせ`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="テスト名"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="例: ランディングページ最適化テスト"
            sx={{ mb: 2 }}
          />
        </Box>

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="要素設定" />
          <Tab label="組み合わせ生成" />
          <Tab label="統計設定" />
          <Tab label="プレビュー" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                テスト要素
              </Typography>
              <Button startIcon={<Add />} onClick={addTestElement} variant="contained">
                要素を追加
              </Button>
            </Box>

            {testElements.length === 0 ? (
              <Alert severity="info">
                テストする要素を追加してください。各要素に複数のバリエーションを設定できます。
              </Alert>
            ) : (
              testElements.map((element) => (
                <Accordion key={element.id} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography sx={{ fontSize: '1.2em' }}>
                        {elementTypes.find((t) => t.value === element.type)?.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">{element.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {element.variations.length}個のバリエーション
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(element.id);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="要素名"
                          value={element.name}
                          onChange={(e) => updateElement(element.id, { name: e.target.value })}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>要素タイプ</InputLabel>
                          <Select
                            value={element.type}
                            onChange={(e) =>
                              updateElement(element.id, {
                                type: e.target.value as TestElement['type'],
                              })
                            }
                            label="要素タイプ"
                          >
                            {elementTypes.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            バリエーション
                          </Typography>
                          {element.variations.map((variation, index) => (
                            <Box
                              key={index}
                              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                            >
                              <Chip
                                label={index === 0 ? 'コントロール' : `V${index + 1}`}
                                size="small"
                                color={index === 0 ? 'primary' : 'default'}
                                sx={{
                                  bgcolor: index === 0 ? undefined : colorPalette[index % colorPalette.length],
                                  color: index === 0 ? undefined : 'white',
                                }}
                              />
                              <TextField
                                fullWidth
                                size="small"
                                value={variation}
                                onChange={(e) => {
                                  const newVariations = [...element.variations];
                                  newVariations[index] = e.target.value;
                                  updateElement(element.id, { variations: newVariations });
                                }}
                                placeholder={`バリエーション${index + 1}の内容`}
                              />
                              {element.variations.length > 2 && (
                                <IconButton
                                  size="small"
                                  onClick={() => removeVariation(element.id, index)}
                                  disabled={index === 0}
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() => addVariation(element.id)}
                            disabled={element.variations.length >= 5}
                          >
                            バリエーションを追加
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>最大組み合わせ数</InputLabel>
                    <Select
                      value={maxCombinations}
                      onChange={(e) => setMaxCombinations(Number(e.target.value))}
                      label="最大組み合わせ数"
                    >
                      {[4, 8, 16, 32].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}組み合わせ
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoAllocate}
                        onChange={(e) => setAutoAllocate(e.target.checked)}
                      />
                    }
                    label="トラフィックを均等配分"
                  />
                </Grid>
              </Grid>
            </Box>

            <Button
              variant="contained"
              startIcon={<Shuffle />}
              onClick={generateCombinations}
              disabled={testElements.length === 0}
              fullWidth
              sx={{ mb: 3 }}
            >
              組み合わせを生成
            </Button>

            {combinations.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  生成された組み合わせ
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        {testElements.map((el) => (
                          <TableCell key={el.id}>{el.name}</TableCell>
                        ))}
                        <TableCell>配分</TableCell>
                        <TableCell>予測効果</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {combinations.map((combo) => (
                        <TableRow key={combo.id}>
                          <TableCell>
                            {combo.id === 'control' ? (
                              <Chip label="コントロール" size="small" color="primary" />
                            ) : (
                              <Chip label={`テスト${combinations.indexOf(combo)}`} size="small" />
                            )}
                          </TableCell>
                          {combo.elements.map((el) => {
                            const element = testElements.find((e) => e.id === el.elementId);
                            return (
                              <TableCell key={el.elementId}>
                                <Chip
                                  label={element?.variations[el.variationIndex]}
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      el.variationIndex === 0
                                        ? '#e3f2fd'
                                        : colorPalette[el.variationIndex % colorPalette.length],
                                    color: el.variationIndex === 0 ? '#1976d2' : 'white',
                                  }}
                                />
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Slider
                                value={combo.allocation}
                                onChange={(_, value) =>
                                  updateCombinationAllocation(combo.id, value as number)
                                }
                                disabled={autoAllocate}
                                min={0}
                                max={100}
                                sx={{ width: 80 }}
                              />
                              <Typography variant="body2">{combo.allocation}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                combo.estimatedImpact === 'high'
                                  ? '高'
                                  : combo.estimatedImpact === 'medium'
                                  ? '中'
                                  : '低'
                              }
                              size="small"
                              color={
                                combo.estimatedImpact === 'high'
                                  ? 'success'
                                  : combo.estimatedImpact === 'medium'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {!autoAllocate && (
                  <Alert
                    severity={
                      combinations.reduce((acc, c) => acc + c.allocation, 0) === 100
                        ? 'success'
                        : 'warning'
                    }
                    sx={{ mt: 2 }}
                  >
                    配分合計: {combinations.reduce((acc, c) => acc + c.allocation, 0)}%
                  </Alert>
                )}
              </>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
              統計設定
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    信頼水準
                  </Typography>
                  <Slider
                    value={confidenceLevel}
                    onChange={(_, value) => setConfidenceLevel(value as number)}
                    min={90}
                    max={99}
                    marks={[
                      { value: 90, label: '90%' },
                      { value: 95, label: '95%' },
                      { value: 99, label: '99%' },
                    ]}
                    valueLabelDisplay="on"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    高い信頼水準は、より正確な結果を提供しますが、必要なサンプルサイズが増加します
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    最小サンプルサイズ（組み合わせごと）
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={minimumSampleSize}
                    onChange={(e) => setMinimumSampleSize(Number(e.target.value))}
                    inputProps={{ min: 100, step: 100 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    各組み合わせで統計的有意性を得るために必要な最小訪問者数
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" icon={<Analytics />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    テスト要件
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • 必要総サンプルサイズ: {getRequiredSampleSize().toLocaleString()}人
                    </Typography>
                    <Typography variant="body2">
                      • 推定テスト期間: {getTestDuration()}日（日次500訪問者と仮定）
                    </Typography>
                    <Typography variant="body2">
                      • 組み合わせ数: {combinations.length}
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
              テスト設定プレビュー
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Science /> テスト概要
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        テスト名:
                      </Typography>
                      <Typography variant="body2">{testName || '未設定'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        テストタイプ:
                      </Typography>
                      <Chip label="多変量テスト" size="small" color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        要素数:
                      </Typography>
                      <Typography variant="body2">{testElements.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        組み合わせ数:
                      </Typography>
                      <Typography variant="body2">{combinations.length}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology /> 効果予測
                  </Typography>
                  <Box>
                    {combinations.length > 0 && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            高効果の組み合わせ:
                          </Typography>
                          <Typography variant="body2">
                            {combinations.filter((c) => c.estimatedImpact === 'high').length}個
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (combinations.filter((c) => c.estimatedImpact === 'high').length /
                              combinations.length) *
                            100
                          }
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          複数要素の変更により、より大きな改善効果が期待できます
                        </Typography>
                      </>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    テスト要素サマリー
                  </Typography>
                  {testElements.map((element) => (
                    <Box key={element.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {elementTypes.find((t) => t.value === element.type)?.icon} {element.name}:{' '}
                        {element.variations.join(' / ')}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!testName || testElements.length === 0 || combinations.length === 0}
          startIcon={<CheckCircle />}
        >
          テストを開始
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultivariateTestBuilder;