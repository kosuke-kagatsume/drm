# 開発コマンド一覧

## 基本コマンド

### 開発サーバー起動
```bash
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
pnpm dev
# または
npm run dev
```
http://localhost:3001 で起動

### ビルド
```bash
pnpm build
# または
npm run build
```

### 本番サーバー起動
```bash
pnpm start
# または
npm run start
```

### リント
```bash
pnpm lint
# または
npm run lint
```

## デプロイコマンド

### Vercelへのデプロイ
```bash
vercel --prod
```
新しいURLが生成されたら、CLAUDE.mdファイルを更新すること

## システムコマンド（Darwin/macOS）

### ファイル操作
- `ls` - ファイル一覧
- `cd` - ディレクトリ移動
- `cat` - ファイル内容表示
- `grep` - ファイル内検索（ripgrep `rg` 推奨）
- `find` - ファイル検索

### Git操作
- `git status` - 変更状態確認
- `git add .` - 変更をステージング
- `git commit -m "message"` - コミット
- `git push origin main` - リモートへプッシュ
- `git diff` - 変更内容確認

## パッケージ管理
```bash
# 依存関係インストール
pnpm install
# または
npm install

# パッケージ追加
pnpm add [package-name]
# または
npm install [package-name]
```