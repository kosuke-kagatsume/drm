/**
 * 列アクセサ定義
 * テーブルUIが読むキー名を定義
 */

/**
 * 正規キー → UI列アクセサのマッピング
 */
export const COLUMN_ACCESSORS = {
  name: 'itemName',
  spec: 'specification',
  qty: 'quantity',
  unit: 'unit',
  sellUnitPrice: 'unitPrice',
  costUnitPrice: 'costPrice',
  sellAmount: 'amount',
  costAmount: 'costAmount',
  grossProfit: 'grossProfit',
  grossProfitRate: 'grossProfitRate',
  remarks: 'remarks',
} as const;

/**
 * 列定義（v3互換）
 */
export const COLUMN_DEFINITIONS = [
  { key: 'no', label: 'NO.', width: '50px', type: 'number' },
  { key: 'itemName', label: '項目名', width: '180px', type: 'text' },
  { key: 'specification', label: '仕様・規格', width: '200px', type: 'text' },
  { key: 'quantity', label: '数量', width: '60px', type: 'number' },
  { key: 'unit', label: '単位', width: '60px', type: 'text' },
  { key: 'unitPrice', label: '売価単価', width: '100px', type: 'number' },
  {
    key: 'amount',
    label: '売価金額',
    width: '100px',
    type: 'number',
    readonly: true,
  },
  {
    key: 'costPrice',
    label: '原価単価',
    width: '100px',
    type: 'number',
    className: 'bg-amber-50',
    internal: true,
  },
  {
    key: 'costAmount',
    label: '原価金額',
    width: '100px',
    type: 'number',
    readonly: true,
    className: 'bg-amber-50',
    internal: true,
  },
  {
    key: 'grossProfit',
    label: '粗利額',
    width: '100px',
    type: 'number',
    readonly: true,
    className: 'bg-green-50',
    internal: true,
  },
  {
    key: 'grossProfitRate',
    label: '粗利率',
    width: '70px',
    type: 'number',
    readonly: true,
    className: 'bg-green-50',
    internal: true,
  },
  { key: 'remarks', label: '備考', width: '120px', type: 'text' },
];

/**
 * 開発環境での列アクセサ検証
 */
export const validateColumnAccessors = (actualColumns: any[]): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const expectedKeys = Object.values(COLUMN_ACCESSORS);
  const actualKeys = actualColumns.map(
    (col) => col.key || col.accessor || col.field,
  );

  const missing = expectedKeys.filter((key) => !actualKeys.includes(key));
  const extra = actualKeys.filter(
    (key) => !expectedKeys.includes(key) && key !== 'no',
  );

  if (missing.length > 0) {
    console.warn('[estimate-core] Missing column accessors:', missing);
  }

  if (extra.length > 0) {
    console.warn(
      '[estimate-core] Extra column accessors (might need mapping):',
      extra,
    );
  }
};
