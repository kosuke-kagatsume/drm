import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodFilterDto,
  PaymentMethodType,
} from './dto';

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment method created successfully',
      data: await this.paymentMethodService.create(createPaymentMethodDto),
    };
  }

  @Get()
  async findAll(@Query(ValidationPipe) filter: PaymentMethodFilterDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment methods retrieved successfully',
      data: await this.paymentMethodService.findAll(filter),
    };
  }

  @Get('default/:companyId')
  async getDefaultPaymentMethod(@Param('companyId') companyId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Default payment method retrieved successfully',
      data: await this.paymentMethodService.getDefaultPaymentMethod(companyId),
    };
  }

  @Get('by-type/:companyId/:type')
  async getPaymentMethodsByType(
    @Param('companyId') companyId: string,
    @Param('type') type: PaymentMethodType,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment methods by type retrieved successfully',
      data: await this.paymentMethodService.getPaymentMethodsByType(
        companyId,
        type,
      ),
    };
  }

  @Get('statistics/:companyId')
  async getPaymentMethodStatistics(@Param('companyId') companyId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment method statistics retrieved successfully',
      data: await this.paymentMethodService.getPaymentMethodStatistics(
        companyId,
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment method retrieved successfully',
      data: await this.paymentMethodService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment method updated successfully',
      data: await this.paymentMethodService.update(id, updatePaymentMethodDto),
    };
  }

  @Post(':id/set-default')
  async setDefault(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Default payment method updated successfully',
      data: await this.paymentMethodService.setDefault(id),
    };
  }

  @Post(':id/validate')
  async validatePaymentMethod(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment method validation completed',
      data: await this.paymentMethodService.validatePaymentMethod(id),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.paymentMethodService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment method deleted successfully',
    };
  }
}
