#!/usr/bin/env node

/**
 * パッケージマネージャー強制スクリプト
 * npm以外のパッケージマネージャー（pnpm/yarn）の使用を防ぐ
 */

const ua = process.env.npm_config_user_agent || "";

if (!ua.includes("npm/")) {
  console.error("\n❌ 使用禁止: npm以外のパッケージマネージャ（pnpm/yarn）検出");
  console.error("   → このリポジトリでは npm 固定です。");
  console.error("   → 実行: rm -rf node_modules && npm install\n");
  process.exit(1);
}

console.log("✅ npm使用確認OK");