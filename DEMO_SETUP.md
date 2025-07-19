# CRM システム デモ環境セットアップガイド

## 前提条件
- Docker Desktop インストール済み
- Node.js 20以上
- pnpm インストール済み

## 1. リポジトリのクローン
```bash
git clone [リポジトリURL]
cd crm-monorepo
```

## 2. 環境変数の設定
```bash
cp .env.template .env
# .envファイルを編集して以下を設定：
# - DANDORI_API_KEY（実際のAPIキーまたはモック用のダミー値）
# - GOOGLE_MAPS_API_KEY（実際のAPIキーまたはモック用のダミー値）
```

## 3. Dockerコンテナの起動
```bash
docker-compose up -d
```

## 4. 依存関係のインストール
```bash
pnpm install
```

## 5. データベースのセットアップ
```bash
cd crm-core
pnpm prisma migrate dev
pnpm prisma db seed
```

## 6. 開発サーバーの起動
```bash
# ルートディレクトリで
pnpm dev
```

## アクセスURL
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3000/api
- API仕様書: http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050 (admin@crm.local / admin)

## デモアカウント
### 管理者
- Email: admin@crm.com
- Password: password123

### マネージャー
- Email: manager@crm.com  
- Password: password123

## デモデータ
シードスクリプトで以下のデータが投入されます：
- 会社: デモ建設株式会社
- ユーザー: 2名（管理者、マネージャー）
- 顧客: 2名
- プロジェクト: 2件（契約済み1件、見込み1件）
- 発注: 1件（150万円）
- KPIスナップショット: サンプルデータ

## トラブルシューティング

### Dockerが起動しない場合
```bash
docker-compose down -v
docker-compose up -d
```

### データベース接続エラー
```bash
# PostgreSQLが起動しているか確認
docker-compose ps
```

### ポート競合
.envファイルでポート番号を変更してください。