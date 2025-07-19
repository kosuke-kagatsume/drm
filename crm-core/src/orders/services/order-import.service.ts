import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Bill } from '../../bills/entities/bill.entity';
import { ValidationLogService } from '../../common/services/validation-log.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

interface OrderCsvRow {
  '発注ID': string;
  '現場ID': string;
  '仕入先名': string;
  '発注日': string;
  '発注金額': string;
  'ステータス': string;
  '工事種別': string;
  '備考': string;
}

@Injectable()
export class OrderImportService {
  private readonly logger = new Logger(OrderImportService.name);
  private readonly orderIdRegex = /^[1-9][0-9]{7}$/; // 先頭0を許可しない

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private validationLogService: ValidationLogService,
  ) {}

  async importOrdersFromCsv(
    csvBuffer: Buffer,
    metadata: { ip: string; userAgent: string },
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    const orders: Order[] = [];
    let rowNumber = 0;

    return new Promise((resolve, reject) => {
      const stream = Readable.from(csvBuffer.toString());
      
      stream
        .pipe(csv())
        .on('data', async (row: OrderCsvRow) => {
          rowNumber++;
          
          try {
            // 発注IDのバリデーション
            const orderId = row['発注ID']?.trim();
            if (!this.validateOrderId(orderId)) {
              results.failed++;
              results.errors.push({
                row: rowNumber,
                error: `不正な発注ID形式: ${orderId}`,
              });
              
              // 不正な発注IDをログに記録
              await this.validationLogService.logInvalidOrderId({
                invalidValue: orderId,
                ip: metadata.ip,
                userAgent: metadata.userAgent,
                endpoint: '/api/orders/import',
                method: 'POST',
                additionalData: { row: rowNumber, csvRow: row },
              });
              
              return;
            }

            // 発注データの作成（文字列から数値に変換）
            const order = this.orderRepository.create({
              id: parseInt(orderId, 10),
              site_id: row['現場ID']?.trim(),
              supplier_name: row['仕入先名']?.trim(),
              order_date: new Date(row['発注日']),
              amount: parseFloat(row['発注金額'].replace(/,/g, '')),
              status: row['ステータス']?.trim() || 'pending',
              category: row['工事種別']?.trim(),
              notes: row['備考']?.trim(),
            });

            orders.push(order);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              row: rowNumber,
              error: error.message,
            });
          }
        })
        .on('end', async () => {
          try {
            // バッチ保存
            if (orders.length > 0) {
              await this.orderRepository.save(orders, { chunk: 100 });
              this.logger.log(`Imported ${orders.length} orders successfully`);
            }
            resolve(results);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async linkOrdersToBills(): Promise<{
    linked: number;
    failed: number;
  }> {
    const results = { linked: 0, failed: 0 };

    try {
      // すべての発注を取得
      const orders = await this.orderRepository.find();
      
      for (const order of orders) {
        try {
          // 同じ現場IDを持つ請求書を更新
          const result = await this.billRepository
            .createQueryBuilder()
            .update(Bill)
            .set({ orders_table_id: order.id })
            .where('site_id = :siteId', { siteId: order.site_id })
            .andWhere('orders_table_id IS NULL')
            .execute();

          if (result.affected > 0) {
            results.linked += result.affected;
            this.logger.log(`Linked order ${order.id} to ${result.affected} bills`);
          }
        } catch (error) {
          results.failed++;
          this.logger.error(`Failed to link order ${order.id}`, error);
        }
      }

      return results;
    } catch (error) {
      throw new BadRequestException('発注と請求書の紐付けに失敗しました');
    }
  }

  private validateOrderId(orderId: string): boolean {
    if (!orderId || typeof orderId !== 'string') {
      return false;
    }
    return this.orderIdRegex.test(orderId);
  }
}