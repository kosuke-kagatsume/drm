# CRM Monorepo デプロイメントフロー

## 概要

このプロジェクトは以下の2箇所で管理されています：

1. **GitHub** (プライベートリポジトリ) - コードのバックアップ・バージョン管理用
2. **Vercel** - 本番デプロイメント用

## デプロイメント手順

### 1. 開発・変更作業

```bash
# 変更を行う
# ...

# ビルドテスト
cd crm-web && pnpm build
```

### 2. GitHubへのプッシュ（バックアップ）

```bash
# 変更をステージング
git add -A

# コミット
git commit -m "変更内容の説明"

# GitHubへプッシュ
git push origin main
```

### 3. Vercelへのデプロイ

```bash
# crm-webディレクトリから実行
cd crm-web

# プロダクションデプロイ
vercel --prod
```

## リポジトリ情報

- **GitHub リポジトリ**: https://github.com/daiokawa/crm-monorepo (Private)
- **Vercel プロジェクト**: crm-demo-1752736152
- **本番URL**: https://crm-demo-1752736152.vercel.app/

## 注意事項

- GitHubリポジトリはプライベート設定で、外部からアクセスできません
- Vercelへのデプロイは手動で行います（GitHub連携は使用しません）
- 両方を更新することで、コードのバックアップと本番環境の同期を保ちます

## 環境変数

Vercelダッシュボードで以下の環境変数を設定してください：

- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps APIキー（必要な場合）
- その他必要な環境変数

## トラブルシューティング

### ESLintエラーでコミットできない場合

```bash
# --no-verifyオプションを使用
git commit -m "メッセージ" --no-verify
```

### Vercelデプロイが失敗する場合

1. `pnpm build`でローカルビルドが成功するか確認
2. 環境変数が正しく設定されているか確認
3. `vercel logs`でエラーログを確認
