# クラウドデモ環境構築

## 必要な外部サービス

### 1. データベース（PostgreSQL）
以下のいずれかが必要：
- **Supabase** (無料枠あり) - https://supabase.com
- **Neon** (無料枠あり) - https://neon.tech
- **Railway** - https://railway.app
- **自社のPostgreSQL**

必要な情報：
```
DATABASE_URL=postgresql://[ユーザー]:[パスワード]@[ホスト]:[ポート]/[データベース名]
```

### 2. Redis（キャッシュ・キュー）
以下のいずれかが必要：
- **Upstash Redis** (無料枠あり) - https://upstash.com
- **Redis Cloud** - https://redis.com
- **Railway Redis**

必要な情報：
```
REDIS_URL=redis://[パスワード]@[ホスト]:[ポート]
```

### 3. バックエンドホスティング
以下のいずれかが必要：
- **Fly.io** (推奨) - https://fly.io
- **Railway** - https://railway.app
- **Render** - https://render.com

### 4. Google Maps API キー（オプション）
地図機能を使う場合：
- Google Cloud Console でAPIキーを発行
- Maps JavaScript API と Geocoding API を有効化

## セットアップ手順

### ステップ1: データベース作成
選んだサービスでPostgreSQLインスタンスを作成し、接続URLを取得

### ステップ2: バックエンドデプロイ
```bash
# Fly.ioの場合
cd crm-core
fly launch
fly secrets set DATABASE_URL="取得したURL"
fly secrets set JWT_SECRET="ランダムな文字列"
fly deploy
```

### ステップ3: データベース初期化
```bash
# ローカルから実行
DATABASE_URL="取得したURL" pnpm prisma migrate deploy
DATABASE_URL="取得したURL" pnpm prisma db seed
```

### ステップ4: フロントエンド設定更新
```javascript
// crm-web/vercel.json を編集
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://[バックエンドURL]/api/:path*"  // ← ここを更新
    }
  ]
}
```

### ステップ5: Vercelに再デプロイ
```bash
cd crm-web
vercel --prod
```

## 提供が必要な情報

以下の情報を提供いただければ、すぐにセットアップできます：

1. **データベース接続URL** または 作成を依頼
2. **Redis接続URL** または 作成を依頼  
3. **Google Maps APIキー** または モックで対応
4. **DandoriWork API認証情報** または モックで対応

## 代替案：完全モックモード

外部サービスなしでデモを行う場合、以下の機能制限があります：
- ✅ ログイン・認証（モック）
- ✅ ダッシュボード表示（静的データ）
- ❌ データの永続化
- ❌ 複数ユーザーでのデータ共有
- ❌ リアルタイムKPI更新