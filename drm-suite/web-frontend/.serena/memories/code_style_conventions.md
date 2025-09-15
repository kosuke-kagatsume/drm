# コードスタイルとコンベンション

## TypeScript/React コーディング規約

### ファイル命名規則
- コンポーネント: PascalCase (例: `EstimateEditor.tsx`)
- ページ: `page.tsx` (Next.js App Router)
- サービス: kebab-case + `.service.ts` (例: `dw-integration.service.ts`)
- 型定義: PascalCase + `.types.ts`

### コンポーネント構造
```typescript
'use client';  // クライアントコンポーネントの場合

import { useState, useEffect } from 'react';
// ... その他のインポート

interface ComponentProps {
  // Props定義
}

export default function ComponentName({ props }: ComponentProps) {
  // Hooks
  // ロジック
  // return JSX
}
```

### 状態管理
- ローカル状態: `useState`
- グローバル状態: React Context API
- 現在はLocalStorageを使用（本番環境ではDB移行予定）

### スタイリング
- Tailwind CSSクラスを使用
- インラインスタイルは最小限に
- グラデーション等の複雑なスタイルはstyle属性で定義

### エラーハンドリング
- try-catchブロックで適切にエラーを処理
- ユーザー向けのエラーメッセージを表示

### インポート順序
1. React/Next.js関連
2. 外部ライブラリ
3. 内部コンポーネント/サービス
4. 型定義
5. スタイル

### 命名規則
- 変数/関数: camelCase
- 定数: UPPER_SNAKE_CASE
- 型/インターフェース: PascalCase
- ブーリアン: is/has/shouldプレフィックス

### コメント
- 必要最小限のコメントのみ
- 複雑なロジックには説明を追加
- TODOコメントは具体的に

## 注意事項
- セキュリティ: APIキー等の機密情報はコミットしない
- パフォーマンス: 大きなリストには仮想スクロール使用
- アクセシビリティ: 適切なARIA属性を追加