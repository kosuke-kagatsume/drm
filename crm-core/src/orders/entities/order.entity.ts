import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('orders_table')
export class Order {
  @PrimaryColumn({ type: 'int', unsigned: true, comment: '発注ID' })
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '現場ID' })
  @Index('IDX_orders_site_id')
  site_id: string;

  @Column({ type: 'varchar', length: 255, comment: '仕入先名' })
  supplier_name: string;

  @Column({ type: 'date', comment: '発注日' })
  @Index('IDX_orders_order_date')
  order_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, comment: '発注金額' })
  amount: number;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: 'pending', 
    comment: '発注ステータス' 
  })
  @Index('IDX_orders_status')
  status: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true, 
    comment: '工事種別' 
  })
  category: string;

  @Column({ type: 'text', nullable: true, comment: '備考' })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}