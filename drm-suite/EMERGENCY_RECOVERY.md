# 🚨 緊急復旧手順 - 12:30時点（aca0700）への確実復帰

**最終成功日時:** 2025年9月7日 21:52  
**成功コミット:** `aca0700` (useSearchParams修正版)  
**動作URL:** http://localhost:3000

## ✅ 実証済み復旧コマンド（4ブロック方式）

### ① プロセス停止 & 参照コミット決定
```bash
APP="/Users/dw100/crm-monorepo/drm-suite/web-frontend"
cd "$APP" || exit 1

# 走ってる開発サーバーを可能な範囲で停止（権限エラーは無視でOK）
pkill -f "next|node|vercel|vite|expo" || true
lsof -nP -iTCP:3000-3050 -sTCP:LISTEN || true

# 12:30時点の"良い"リビジョンを解決
GOOD_REF=""
git rev-parse --verify good-2025-09-07-1230-aca0700 >/dev/null 2>&1 && GOOD_REF="good-2025-09-07-1230-aca0700"
[ -z "$GOOD_REF" ] && git rev-parse --verify aca0700 >/dev/null 2>&1 && GOOD_REF="aca0700"
[ -z "$GOOD_REF" ] && GOOD_REF="$(git rev-list -n 1 --before='2025-09-07 12:30:00 +0900' HEAD)"

echo "GOOD_REF = $GOOD_REF"
```

### ② 未追跡の設計/ICファイルを"二重バックアップ"
```bash
BACKUP=~/rescue_$(date +%m%d-%H%M)
mkdir -p "$BACKUP"

# 代表パス（存在すればコピー）
for p in src/app/dashboard/design.tsx src/app/dashboard/interior.tsx; do
  [ -f "$p" ] && { mkdir -p "$BACKUP/$(dirname "$p")"; cp "$p" "$BACKUP/$p"; }
done

# 念のため探索（取りこぼし防止）
find src -maxdepth 6 \( -name "design.tsx" -o -name "interior.tsx" \) | while read -r f; do
  mkdir -p "$BACKUP/$(dirname "$f")"
  cp "$f" "$BACKUP/$f"
done

echo "Backed up to: $BACKUP"
ls -R "$BACKUP" || true
```

### ③ "12:30直前"へ戻す（履歴は温存）
```bash
# 現在ブランチを記録
CURBR=$(git branch --show-current); echo "CURRENT BRANCH = $CURBR"

# 追跡済み変更を避難（未追跡は②で保護済み）
git stash push -m "pre-restore-$(date +%m%d-%H%M)" || true

# 良い状態へハードリセット
git reset --hard "aca0700"
git status -s
git log --oneline -n 1
```

### ④ 手戻しコピー → 依存再構築 → 起動
```bash
# バックアップから元の場所へ復元（既存が無ければ作成）
rsync -av "$BACKUP/src/" src/ || true

# 復元点としてコミット（任意だが推奨）
git add -A
git commit -m "Restore design/interior files (12:30 state)" || true

# 【重要】NPMで確実起動（pnpmエラー回避）
cd /Users/dw100/crm-monorepo/drm-suite/web-frontend
npm install && npm run dev
```

## 🎯 成功チェック

- [ ] http://localhost:3000 が起動する
- [ ] design.tsx / interior.tsx が反映されている
- [ ] git log -1 が aca0700（12:30時点）
- [ ] エラーなしでコンパイル完了

## 💡 別のVercel環境への切り替え

**web-frontend-ii3145bd1への復帰方法:**

```bash
# ① commit 92e706f を確認・復帰テスト（必要に応じて）
git reset --hard 92e706f
npm install && npm run dev

# 本番動作確認
curl -I https://web-frontend-ii3145bd1-kosukes-projects-c6ad92ba.vercel.app/ || echo "URL確認中..."
```

**推測コミット**: `92e706f` (Successfully deployed to Vercel - frontend is now live)

**注意**: ii3145bd1は完全確証なし。要動作確認。

## ⚠️ 緊急時の注意

1. **必ずこの順番で実行**（4ブロック順守）
2. **pnpmエラー時はNPMを使用**
3. **権限エラーは無視してOK**  
4. **バックアップは自動作成される**

---

**この手順は2025年9月7日21:52に実証済みです**