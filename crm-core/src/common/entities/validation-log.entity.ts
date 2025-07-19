import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('validation_logs')
export class ValidationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: 'バリデーションタイプ' })
  @Index('IDX_validation_type')
  validation_type: string;

  @Column({ type: 'varchar', length: 255, comment: '不正な値' })
  invalid_value: string;

  @Column({ type: 'varchar', length: 45, nullable: true, comment: 'IPアドレス' })
  ip_address: string;

  @Column({ type: 'text', nullable: true, comment: 'ユーザーエージェント' })
  user_agent: string;

  @Column({ type: 'varchar', length: 255, comment: 'エンドポイント' })
  endpoint: string;

  @Column({ type: 'varchar', length: 10, comment: 'HTTPメソッド' })
  method: string;

  @Column({ type: 'json', nullable: true, comment: '追加データ' })
  additional_data: any;

  @CreateDateColumn({ type: 'timestamp' })
  @Index('IDX_created_at')
  created_at: Date;
}
