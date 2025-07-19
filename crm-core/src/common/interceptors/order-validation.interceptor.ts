import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class OrderValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OrderValidationInterceptor.name);
  private readonly orderIdRegex = /^[1-9][0-9]{7}$/; // 先頭0を許可しない

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // リクエストボディに発注IDが含まれる場合のバリデーション
    if (body && body.orders_table_id) {
      if (!this.validateOrderId(body.orders_table_id)) {
        const errorMessage = `Invalid order ID format: ${body.orders_table_id}`;

        // 不正な発注IDをログに記録
        this.logger.error(errorMessage, {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          timestamp: new Date().toISOString(),
          invalidOrderId: body.orders_table_id,
          endpoint: request.url,
          method: request.method,
        });

        // 自動リジェクト
        throw new BadRequestException('発注IDは8桁の数値である必要があります');
      }
    }

    // 配列形式のデータの場合
    if (Array.isArray(body)) {
      body.forEach((item, index) => {
        if (item.orders_table_id && !this.validateOrderId(item.orders_table_id)) {
          const errorMessage = `Invalid order ID format at index ${index}: ${item.orders_table_id}`;

          this.logger.error(errorMessage, {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            timestamp: new Date().toISOString(),
            invalidOrderId: item.orders_table_id,
            endpoint: request.url,
            method: request.method,
            arrayIndex: index,
          });

          throw new BadRequestException(
            `発注ID（インデックス: ${index}）は8桁の数値である必要があります`,
          );
        }
      });
    }

    return next.handle().pipe(
      tap(() => {
        // 成功時のログ（必要に応じて）
        if (body && body.orders_table_id) {
          this.logger.log(`Valid order ID processed: ${body.orders_table_id}`);
        }
      }),
      catchError((error) => {
        // エラー時の追加ログ
        this.logger.error('Order validation error', error);
        return throwError(() => error);
      }),
    );
  }

  private validateOrderId(orderId: any): boolean {
    // 数値型の場合
    if (typeof orderId === 'number') {
      return orderId >= 10000000 && orderId <= 99999999 && Number.isInteger(orderId);
    }

    // 文字列型の場合
    if (typeof orderId === 'string') {
      return this.orderIdRegex.test(orderId);
    }

    return false;
  }
}
