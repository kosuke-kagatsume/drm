import { registerAs } from '@nestjs/config';

export default registerAs('order', () => ({
  // 発注IDの設定
  orderId: {
    // 先頭0を許可するかどうか
    allowLeadingZeros: process.env.ORDER_ID_ALLOW_LEADING_ZEROS === 'true',
    // 桁数
    length: parseInt(process.env.ORDER_ID_LENGTH || '8', 10),
    // データベースのカラムタイプ
    dbType: process.env.ORDER_ID_ALLOW_LEADING_ZEROS === 'true' ? 'CHAR' : 'INT UNSIGNED',
  },
  
  // バリデーション設定
  validation: {
    // 自動リジェクトを有効にするか
    autoReject: process.env.ORDER_VALIDATION_AUTO_REJECT !== 'false',
    // ログ保存期間（日数）
    logRetentionDays: parseInt(process.env.ORDER_VALIDATION_LOG_RETENTION_DAYS || '90', 10),
  },
  
  // インポート設定
  import: {
    // バッチサイズ
    batchSize: parseInt(process.env.ORDER_IMPORT_BATCH_SIZE || '100', 10),
    // CSVの文字コード
    encoding: process.env.ORDER_IMPORT_ENCODING || 'utf-8',
  },
}));