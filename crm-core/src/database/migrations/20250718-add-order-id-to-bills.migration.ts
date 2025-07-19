import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddOrderIdToBills20250718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // bills_listテーブルにorders_table_id（発注ID）カラムを追加
    // 先頭0なしのため INT UNSIGNED 型を使用
    await queryRunner.addColumn(
      'bills_list',
      new TableColumn({
        name: 'orders_table_id',
        type: 'int',
        unsigned: true,
        isNullable: true,
        comment: '発注ID（AM列）',
      }),
    );

    // 単体インデックスの作成
    await queryRunner.createIndex(
      'bills_list',
      new TableIndex({
        name: 'IDX_bills_orders_table_id',
        columnNames: ['orders_table_id'],
      }),
    );

    // 現場IDとの複合インデックスの作成
    // 注：現場IDのカラム名を確認して置き換える必要あり
    await queryRunner.createIndex(
      'bills_list',
      new TableIndex({
        name: 'IDX_bills_orders_table_id_site_id',
        columnNames: ['orders_table_id', 'site_id'], // site_idは実際のカラム名に置き換え
      }),
    );

    // orders_tableの作成（存在しない場合）
    const hasOrdersTable = await queryRunner.hasTable('orders_table');
    if (!hasOrdersTable) {
      await queryRunner.query(`
        CREATE TABLE orders_table (
          id INT UNSIGNED PRIMARY KEY COMMENT '発注ID',
          site_id VARCHAR(255) NOT NULL COMMENT '現場ID',
          supplier_name VARCHAR(255) NOT NULL COMMENT '仕入先名',
          order_date DATE NOT NULL COMMENT '発注日',
          amount DECIMAL(12, 2) NOT NULL COMMENT '発注金額',
          status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT '発注ステータス',
          category VARCHAR(100) COMMENT '工事種別',
          notes TEXT COMMENT '備考',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX IDX_orders_site_id (site_id),
          INDEX IDX_orders_order_date (order_date),
          INDEX IDX_orders_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='発注管理テーブル';
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // インデックスの削除
    await queryRunner.dropIndex('bills_list', 'IDX_bills_orders_table_id_site_id');
    await queryRunner.dropIndex('bills_list', 'IDX_bills_orders_table_id');
    
    // カラムの削除
    await queryRunner.dropColumn('bills_list', 'orders_table_id');
    
    // orders_tableの削除（必要に応じて）
    // await queryRunner.dropTable('orders_table');
  }
}