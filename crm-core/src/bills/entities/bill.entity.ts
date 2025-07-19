import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('bills_list')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '請求書番号' })
  bill_number: string;

  @Column({ type: 'varchar', length: 255, comment: '現場ID' })
  @Index('IDX_bills_site_id')
  site_id: string;

  @Column({ type: 'varchar', length: 255, comment: '顧客名' })
  customer_name: string;

  @Column({ type: 'date', comment: '請求日' })
  bill_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, comment: '請求金額' })
  amount: number;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'pending', 
    comment: '請求ステータス' 
  })
  status: string;

  // 新規追加: 発注ID（AM列）
  @Column({ 
    type: 'int', 
    unsigned: true,
    nullable: true, 
    comment: '発注ID（AM列）' 
  })
  @Index('IDX_bills_orders_table_id')
  @Index('IDX_bills_orders_table_id_site_id', ['orders_table_id', 'site_id'])
  orders_table_id: number;

  @Column({ type: 'text', nullable: true, comment: '備考' })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}