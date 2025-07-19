# 発注ID実装仕様書

## 概要
bills_listテーブルのAM列に発注ID（orders_table_id）を追加し、orders_listとの一意のキーを作成する実装です。

## カラム仕様

### カラム名
- **物理名**: `orders_table_id`
- **論理名**: 発注ID
- **CSVヘッダー表記**: 発注ID

### データ型
**INT UNSIGNED** - 8桁の数値（先頭0なし確定）
- 有効範囲: 10000000 ～ 99999999

## バリデーション

### 実装内容
1. **正規表現チェック**: `/^[1-9][0-9]{7}$/` （先頭0を許可しない）
2. **数値範囲チェック**: 10000000 ≤ ID ≤ 99999999
3. **自動リジェクト**: 不正な形式は即座に拒否
4. **ログ記録**: validation_logsテーブルに記録

### バリデーションフロー
```
リクエスト受信
    ↓
発注ID形式チェック（8桁数値）
    ↓
  不正 → 自動リジェクト + ログ記録
    ↓
  正常 → 処理継続
```

### ログ内容
- 不正な値
- IPアドレス
- ユーザーエージェント
- タイムスタンプ
- エンドポイント
- HTTPメソッド

## インデックス

### 1. 単体インデックス
```sql
INDEX IDX_bills_orders_table_id (orders_table_id)
```

### 2. 複合インデックス
```sql
INDEX IDX_bills_orders_table_id_site_id (orders_table_id, site_id)
```

## 実装ファイル

### 1. バリデーター
- `/src/common/validators/order-id.validator.ts`
- カスタムバリデーター for class-validator

### 2. インターセプター
- `/src/common/interceptors/order-validation.interceptor.ts`
- リクエスト時の自動バリデーション

### 3. エンティティ
- `/src/orders/entities/order.entity.ts` - 発注テーブル
- `/src/bills/entities/bill.entity.ts` - 請求書テーブル（更新）

### 4. DTO
- `/src/orders/dto/create-order.dto.ts`

### 5. サービス
- `/src/orders/services/order-import.service.ts` - CSVインポート
- `/src/common/services/validation-log.service.ts` - ログ管理

### 6. マイグレーション
- `/src/database/migrations/20250718-add-order-id-to-bills.migration.ts`

## 環境設定

### 必要な環境変数
```env
# 先頭0を許可するか（false固定）
ORDER_ID_ALLOW_LEADING_ZEROS=false

# 発注IDの桁数
ORDER_ID_LENGTH=8

# 自動リジェクト有効化
ORDER_VALIDATION_AUTO_REJECT=true

# ログ保存期間（日数）
ORDER_VALIDATION_LOG_RETENTION_DAYS=90
```

## 使用例

### 1. 発注作成API
```json
POST /api/orders
{
  "id": 12345678,
  "site_id": "SITE001",
  "supplier_name": "山田建材",
  "order_date": "2025-01-18",
  "amount": 1500000,
  "category": "基礎工事"
}
```

### 2. 請求書への紐付けAPI
```json
POST /api/bills/link-order
{
  "orders_table_id": 12345678,
  "bill_id": "BILL001"
}
```

### 3. CSVインポート
```
POST /api/orders/import
Content-Type: multipart/form-data

発注ID,現場ID,仕入先名,発注日,発注金額,ステータス,工事種別,備考
12345678,SITE001,山田建材,2025-01-18,1500000,confirmed,基礎工事,
```

## 注意事項

1. **データ型**
   - 発注IDは**INT UNSIGNED**型（先頭0なし確定）
   - 有効範囲: 10000000 ～ 99999999

2. **インデックス**
   - 大量データでのパフォーマンスを考慮
   - 定期的なインデックス統計更新を推奨

3. **ログ管理**
   - 90日経過後は自動削除される設定
   - 必要に応じて保存期間を調整

## 実装確定内容

✅ **先頭0なし確定により、以下の仕様で実装完了：**
- データベース型: **INT UNSIGNED**
- バリデーション: 10000000 ≤ 発注ID ≤ 99999999
- 正規表現: `/^[1-9][0-9]{7}$/`
- 環境変数: `ORDER_ID_ALLOW_LEADING_ZEROS=false`