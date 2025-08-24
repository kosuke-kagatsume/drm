# Claude Code 引き継ぎドキュメント

## 🎯 明日のClaude（またはあなた）へ

### 最重要情報

**最新URL**: https://web-frontend-qt2fly6eh-kosukes-projects-c6ad92ba.vercel.app/

これが2025年8月24日 21:45時点の最新デプロイです。他のURLは古いので使わないこと。

### プロジェクト概要

- **場所**: `/Users/dw100/crm-monorepo/drm-suite/`
- **内容**: 建設業界向けCRM「DRMスイート」の見積システム
- **技術**: Next.js 14 + TypeScript + Tailwind CSS

### 最新の実装内容（2025/08/24）

#### 1. 見積作成フローの完全実装 ✅

- `/estimates/create-v2` - 2択の初期選択画面
  - 顧客情報がある → 顧客選択 → 見積タイプ選択
  - クイック見積 → 直接見積タイプ選択
- `/estimates/editor-v3` - 統一された詳細見積エディタ
  - マスタ原価の参照機能（階層選択UI）
  - コメント機能（サイドバー）
  - インポート/エクスポート機能

#### 2. 見積管理機能の大幅強化 🆕

- **ステータス管理**
  - 下書き → 提出済み → 交渉中 → 受注/失注
  - ステータス変更モーダル実装
- **失注分析機能**
  - 失注理由の記録（価格/仕様/納期/競合他社）
  - 競合情報の記録
- **複数見積管理（A案/B案/C案）**
  - 同一顧客への複数提案管理
  - 提案タイプのバッジ表示
- **受注率の可視化**
  - リアルタイム受注率計算
  - 統計ダッシュボード

### 実装済み機能一覧

1. **editor-v3** (`/estimates/editor-v3/[id]`)
   - 1500行以上の本格実装
   - ドラッグ&ドロップ対応
   - マスターデータ連携（75種類以上）
   - 原価管理・粗利計算
   - 階層型マスタ検索（商品種別→メーカー→製品）

2. **その他の見積画面**
   - `/estimates/financial/[id]` - 資金計画書
   - `/estimates/templates` - テンプレート管理
   - `/estimates/page.tsx` - 見積一覧（管理機能強化済み）

### 作業の始め方

```bash
# 1. ローカル開発サーバー起動
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
pnpm dev

# 2. 最新URLで動作確認
open https://web-frontend-qt2fly6eh-kosukes-projects-c6ad92ba.vercel.app/
```

### 次の開発タスク候補

- [ ] 見積から契約書への自動変換
- [ ] 契約後の請求書発行機能
- [ ] 工事進捗と請求の連動
- [ ] 承認ワークフローの実装
- [ ] 営業分析ダッシュボード（失注分析など）

### デプロイ方法

```bash
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
vercel --prod
# 新しいURLが出たら必ずこのファイルを更新すること！
```

### 重要な変更点

- 全ての見積編集はeditor-v3に統一済み
- create-v2が正式な見積作成フロー
- ステータス管理が業務フローに対応（受注/失注追跡可能）

---

最終更新: 2025/08/24 21:45
