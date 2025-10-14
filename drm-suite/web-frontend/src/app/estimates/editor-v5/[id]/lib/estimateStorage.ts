import { EstimateData, EstimateVersion, EstimateTemplate } from '../types';
import { STORAGE_KEYS } from '../constants';

// ==================== 純粋関数: ストレージ操作 ====================

/**
 * 見積データの保存
 */
export function saveEstimate(estimateId: string, data: EstimateData): void {
  if (typeof window === 'undefined') return;

  const key = `${STORAGE_KEYS.ESTIMATE_PREFIX}${estimateId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 見積データの読み込み
 */
export function loadEstimate(estimateId: string): EstimateData | null {
  if (typeof window === 'undefined') return null;

  const key = `${STORAGE_KEYS.ESTIMATE_PREFIX}${estimateId}`;
  const saved = localStorage.getItem(key);

  if (!saved) return null;

  try {
    return JSON.parse(saved) as EstimateData;
  } catch (error) {
    console.error('Failed to parse estimate data:', error);
    return null;
  }
}

/**
 * バージョンデータの保存
 */
export function saveVersions(
  estimateId: string,
  versions: EstimateVersion[],
): void {
  if (typeof window === 'undefined') return;

  const key = `${STORAGE_KEYS.VERSIONS_PREFIX}${estimateId}`;
  localStorage.setItem(key, JSON.stringify(versions));
}

/**
 * バージョンデータの読み込み
 */
export function loadVersions(estimateId: string): EstimateVersion[] {
  if (typeof window === 'undefined') return [];

  const key = `${STORAGE_KEYS.VERSIONS_PREFIX}${estimateId}`;
  const saved = localStorage.getItem(key);

  if (!saved) return [];

  try {
    return JSON.parse(saved) as EstimateVersion[];
  } catch (error) {
    console.error('Failed to parse versions data:', error);
    return [];
  }
}

/**
 * 特定バージョンの見積データの保存
 */
export function saveVersionData(
  estimateId: string,
  versionId: string,
  data: EstimateData,
): void {
  if (typeof window === 'undefined') return;

  const key = `${STORAGE_KEYS.ESTIMATE_PREFIX}${estimateId}-v${versionId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 特定バージョンの見積データの読み込み
 */
export function loadVersionData(
  estimateId: string,
  versionId: string,
): EstimateData | null {
  if (typeof window === 'undefined') return null;

  const key = `${STORAGE_KEYS.ESTIMATE_PREFIX}${estimateId}-v${versionId}`;
  const saved = localStorage.getItem(key);

  if (!saved) return null;

  try {
    return JSON.parse(saved) as EstimateData;
  } catch (error) {
    console.error('Failed to parse version data:', error);
    return null;
  }
}

/**
 * テンプレートの保存
 */
export function saveTemplates(templates: EstimateTemplate[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

/**
 * テンプレートの読み込み
 */
export function loadTemplates(): EstimateTemplate[] {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);

  if (!saved) return [];

  try {
    return JSON.parse(saved) as EstimateTemplate[];
  } catch (error) {
    console.error('Failed to parse templates data:', error);
    return [];
  }
}

/**
 * 最近の検索履歴の保存
 */
export function saveRecentSearches(searches: string[]): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
}

/**
 * 最近の検索履歴の読み込み
 */
export function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);

  if (!saved) return [];

  try {
    return JSON.parse(saved) as string[];
  } catch (error) {
    console.error('Failed to parse recent searches:', error);
    return [];
  }
}

/**
 * CSVエクスポート用のデータ生成
 */
export function generateCSV(data: EstimateData): string {
  const headers = [
    'No',
    'カテゴリ',
    '項目名',
    '仕様',
    '数量',
    '単位',
    '単価',
    '金額',
    '原価',
    '粗利',
    '粗利率',
    '備考',
  ];

  const rows = data.items.map((item) => [
    item.no.toString(),
    item.category,
    item.itemName,
    item.specification,
    item.quantity.toString(),
    item.unit,
    item.unitPrice.toString(),
    item.amount.toString(),
    (item.costPrice || 0).toString(),
    (item.grossProfit || 0).toString(),
    (item.grossProfitRate || 0).toFixed(1) + '%',
    item.remarks,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');

  // BOM付きUTF-8
  return '\uFEFF' + csvContent;
}

/**
 * CSVのダウンロード
 */
export function downloadCSV(data: EstimateData): void {
  const csvContent = generateCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `見積_${data.title}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
