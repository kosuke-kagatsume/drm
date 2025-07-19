import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationLog } from '../entities/validation-log.entity';

@Injectable()
export class ValidationLogService {
  private readonly logger = new Logger(ValidationLogService.name);

  constructor(
    @InjectRepository(ValidationLog)
    private validationLogRepository: Repository<ValidationLog>,
  ) {}

  async logInvalidOrderId(data: {
    invalidValue: string;
    ip: string;
    userAgent: string;
    endpoint: string;
    method: string;
    additionalData?: any;
  }): Promise<void> {
    try {
      const log = this.validationLogRepository.create({
        validation_type: 'order_id',
        invalid_value: data.invalidValue,
        ip_address: data.ip,
        user_agent: data.userAgent,
        endpoint: data.endpoint,
        method: data.method,
        additional_data: data.additionalData,
        created_at: new Date(),
      });

      await this.validationLogRepository.save(log);

      this.logger.warn(`Invalid order ID logged: ${data.invalidValue} from IP: ${data.ip}`);
    } catch (error) {
      this.logger.error('Failed to save validation log', error);
    }
  }

  async getInvalidOrderIdLogs(options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<ValidationLog[]> {
    const query = this.validationLogRepository
      .createQueryBuilder('log')
      .where('log.validation_type = :type', { type: 'order_id' });

    if (options?.startDate) {
      query.andWhere('log.created_at >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('log.created_at <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('log.created_at', 'DESC');

    if (options?.limit) {
      query.limit(options.limit);
    }

    return query.getMany();
  }
}
