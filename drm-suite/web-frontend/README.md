# DRM Suite Frontend

建設業界向け統合CRMシステムのフロントエンド

## 🚀 開発環境セットアップ

### 必須要件
- Node.js v20 (v22は非対応)
- npm v10以上

### 初回セットアップ
```bash
# Node.jsバージョン確認・変更
nvm use  # .nvmrcから自動でv20を選択

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## 📝 開発ルール

### パッケージマネージャー
**npm固定** - pnpm/yarnは使用禁止（preinstallフックで強制）

### Node.jsバージョン
**v20系固定** - .nvmrc + .npmrcのengine-strictで強制

## 🛠 利用可能なスクリプト

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run start      # プロダクションサーバー起動
npm run lint       # ESLint実行
npm run clean      # キャッシュ完全削除
npm run reset      # 依存関係再インストール
npm run dev:fresh  # クリーンスタート（キャッシュ削除→開発サーバー）
npm run analyze    # バンドルサイズ分析
```

## 🔧 トラブルシューティング

### 開発開始手順（毎朝）
1. `nvm use` - Node v20固定
2. `npm run dev:fresh` - クリーン起動

### webpack chunk loadingエラーが発生した場合

#### ステップ1: ブラウザキャッシュクリア
1. DevTools → Application → Storage → Clear site data
2. Service Workers → Unregister
3. ハードリロード（⌘⇧R / Ctrl+F5）

#### ステップ2: 軽量リセット
```bash
npm run reset
```

#### ステップ3: 完全リセット（最終手段）
```bash
# 全プロセス停止
pkill -f "next|node"

# 完全クリーンアップ
rm -rf .next .turbo node_modules package-lock.json

# npmキャッシュクリア
npm cache clean --force

# 再インストール
npm install

# 開発サーバー起動
npm run dev
```

### 依存関係の重複チェック
```bash
npm ls react react-dom
```
複数ツリーが表示された場合はワークスペース設定の見直しが必要

## 🏗 プロジェクト構造

```
web-frontend/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # 共通コンポーネント
│   ├── hooks/         # カスタムフック
│   ├── services/      # APIサービス
│   └── types/         # TypeScript型定義
├── public/            # 静的ファイル
├── scripts/           # ビルドスクリプト
└── .env.local         # 環境変数（要作成）
```

## 🔐 環境変数

`.env.local`ファイルを作成し、以下を設定：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
# その他必要な環境変数
```

## 📚 技術スタック

- **フレームワーク**: Next.js 14.2.5
- **言語**: TypeScript 5.5.2
- **スタイリング**: Tailwind CSS 3.4
- **状態管理**: React Context API
- **チャート**: Chart.js + react-chartjs-2
- **地図**: Google Maps API
- **PDF生成**: jsPDF

## 🐛 既知の問題と対策

### webpack関連
- 動的importの乱用を避ける
- framer-motion等の重いライブラリは慎重に導入
- SSR/CSRの境界を明確にする

### パフォーマンス
- 大きなコンポーネントはdynamic importで遅延ロード
- 画像は next/image を使用
- 不要な再レンダリングを防ぐ（React.memo, useMemo）

## 👥 開発チーム

建設業界向けCRMシステム開発チーム

## 📄 ライセンス

Private - All rights reserved