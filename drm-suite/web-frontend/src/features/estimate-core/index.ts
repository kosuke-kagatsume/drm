/**
 * estimate-core エクスポート
 */

// 型定義
export * from './domain/types';

// 計算ロジック
export * from './domain/calculations';

// アダプタ
export * from './adapters/legacy-adapter';
export * from './adapters/ui-adapter';
export * from './adapters/column-accessors';

// ヘルパー関数
export { nanoid } from 'nanoid';

/**
 * フィーチャーフラグ
 */
export const FEATURE_FLAGS = {
  ENABLE_LEGACY_NAMECELL_MASTER_PICKER: false, // 旧UI完全無効化
  ENABLE_NEW_MASTER_SELECTOR: true, // 新UI有効化
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
} as const;
