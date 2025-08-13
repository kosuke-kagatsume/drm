import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { Prisma } from '@prisma/client';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodFilterDto,
  PaymentMethodType,
} from './dto';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    // If this is being set as default, remove default from existing methods
    if (createPaymentMethodDto.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: {
          companyId: createPaymentMethodDto.companyId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Validate payment method details based on type
    if (createPaymentMethodDto.details) {
      this.validatePaymentMethodDetails(
        createPaymentMethodDto.type,
        createPaymentMethodDto.details,
      );
    }

    return this.prisma.paymentMethod.create({
      data: {
        ...createPaymentMethodDto,
        details: createPaymentMethodDto.details || {},
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(filter: PaymentMethodFilterDto) {
    const where: Prisma.PaymentMethodWhereInput = {};

    if (filter.companyId) {
      where.companyId = filter.companyId;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.isDefault !== undefined) {
      where.isDefault = filter.isDefault;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return paymentMethods.map((method) => ({
      ...method,
      // Mask sensitive details for security
      details: this.maskSensitiveDetails(method.type, method.details as any),
    }));
  }

  async findOne(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return {
      ...paymentMethod,
      details: this.maskSensitiveDetails(
        paymentMethod.type,
        paymentMethod.details as any,
      ),
    };
  }

  async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // If this is being set as default, remove default from existing methods
    if (updatePaymentMethodDto.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: {
          companyId: paymentMethod.companyId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Validate payment method details if being updated
    if (updatePaymentMethodDto.details && updatePaymentMethodDto.type) {
      this.validatePaymentMethodDetails(
        updatePaymentMethodDto.type,
        updatePaymentMethodDto.details,
      );
    } else if (updatePaymentMethodDto.details) {
      this.validatePaymentMethodDetails(
        paymentMethod.type as PaymentMethodType,
        updatePaymentMethodDto.details,
      );
    }

    const updatedMethod = await this.prisma.paymentMethod.update({
      where: { id },
      data: updatePaymentMethodDto,
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      ...updatedMethod,
      details: this.maskSensitiveDetails(
        updatedMethod.type,
        updatedMethod.details as any,
      ),
    };
  }

  async remove(id: string) {
    const paymentMethod = await this.findOne(id);

    // Check if this is the only payment method for the company
    const companyPaymentMethods = await this.prisma.paymentMethod.count({
      where: {
        companyId: paymentMethod.companyId,
        isActive: true,
      },
    });

    if (companyPaymentMethods === 1) {
      throw new BadRequestException(
        'Cannot delete the last active payment method for the company',
      );
    }

    // If this is the default method, set another method as default
    if (paymentMethod.isDefault) {
      const nextMethod = await this.prisma.paymentMethod.findFirst({
        where: {
          companyId: paymentMethod.companyId,
          isActive: true,
          id: { not: id },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextMethod) {
        await this.prisma.paymentMethod.update({
          where: { id: nextMethod.id },
          data: { isDefault: true },
        });
      }
    }

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async setDefault(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException(
        'Cannot set inactive payment method as default',
      );
    }

    // Remove default from existing methods
    await this.prisma.paymentMethod.updateMany({
      where: {
        companyId: paymentMethod.companyId,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Set new default
    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getDefaultPaymentMethod(companyId: string) {
    const defaultMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        companyId,
        isDefault: true,
        isActive: true,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!defaultMethod) {
      // If no default method, return the first active one
      const firstActiveMethod = await this.prisma.paymentMethod.findFirst({
        where: {
          companyId,
          isActive: true,
        },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return firstActiveMethod
        ? {
            ...firstActiveMethod,
            details: this.maskSensitiveDetails(
              firstActiveMethod.type,
              firstActiveMethod.details as any,
            ),
          }
        : null;
    }

    return {
      ...defaultMethod,
      details: this.maskSensitiveDetails(
        defaultMethod.type,
        defaultMethod.details as any,
      ),
    };
  }

  async getPaymentMethodsByType(companyId: string, type: PaymentMethodType) {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: {
        companyId,
        type,
        isActive: true,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return paymentMethods.map((method) => ({
      ...method,
      details: this.maskSensitiveDetails(method.type, method.details as any),
    }));
  }

  async validatePaymentMethod(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException('Payment method is not active');
    }

    // Additional validation based on type
    const validation = this.performPaymentMethodValidation(
      paymentMethod.type as PaymentMethodType,
      paymentMethod.details as any,
    );

    return {
      id: paymentMethod.id,
      name: paymentMethod.name,
      type: paymentMethod.type,
      isValid: validation.isValid,
      validationErrors: validation.errors,
      lastValidated: new Date(),
    };
  }

  async getPaymentMethodStatistics(companyId: string) {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { companyId },
    });

    const statistics = {
      total: paymentMethods.length,
      active: paymentMethods.filter((method) => method.isActive).length,
      inactive: paymentMethods.filter((method) => !method.isActive).length,
      byType: {} as Record<string, number>,
      defaultMethod: null as any,
      oldestMethod: null as any,
      newestMethod: null as any,
    };

    // Group by type
    paymentMethods.forEach((method) => {
      statistics.byType[method.type] =
        (statistics.byType[method.type] || 0) + 1;
    });

    // Find default method
    const defaultMethod = paymentMethods.find(
      (method) => method.isDefault && method.isActive,
    );
    if (defaultMethod) {
      statistics.defaultMethod = {
        id: defaultMethod.id,
        name: defaultMethod.name,
        type: defaultMethod.type,
      };
    }

    // Find oldest and newest
    if (paymentMethods.length > 0) {
      const sorted = paymentMethods.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      statistics.oldestMethod = {
        id: sorted[0].id,
        name: sorted[0].name,
        createdAt: sorted[0].createdAt,
      };
      statistics.newestMethod = {
        id: sorted[sorted.length - 1].id,
        name: sorted[sorted.length - 1].name,
        createdAt: sorted[sorted.length - 1].createdAt,
      };
    }

    return statistics;
  }

  private validatePaymentMethodDetails(type: PaymentMethodType, details: any) {
    switch (type) {
      case PaymentMethodType.CREDIT_CARD:
        this.validateCreditCardDetails(details);
        break;
      case PaymentMethodType.BANK_TRANSFER:
        this.validateBankTransferDetails(details);
        break;
      case PaymentMethodType.DIGITAL_WALLET:
        this.validateDigitalWalletDetails(details);
        break;
      // CASH and CHECK don't require additional validation
    }
  }

  private validateCreditCardDetails(details: any) {
    if (!details.cardNumber) {
      throw new BadRequestException('Credit card number is required');
    }
    if (!details.cardholderName) {
      throw new BadRequestException('Cardholder name is required');
    }
    if (!details.expiryMonth || !details.expiryYear) {
      throw new BadRequestException('Card expiry date is required');
    }
    // Add more validation as needed (card number format, expiry validation, etc.)
  }

  private validateBankTransferDetails(details: any) {
    if (!details.bankName) {
      throw new BadRequestException('Bank name is required');
    }
    if (!details.accountNumber) {
      throw new BadRequestException('Account number is required');
    }
    if (!details.accountHolderName) {
      throw new BadRequestException('Account holder name is required');
    }
  }

  private validateDigitalWalletDetails(details: any) {
    if (!details.walletProvider) {
      throw new BadRequestException('Wallet provider is required');
    }
    if (!details.walletId) {
      throw new BadRequestException('Wallet ID is required');
    }
  }

  private maskSensitiveDetails(type: string, details: any): any {
    if (!details) return {};

    const maskedDetails = { ...details };

    switch (type) {
      case PaymentMethodType.CREDIT_CARD:
        if (maskedDetails.cardNumber) {
          const cardNumber = maskedDetails.cardNumber.toString();
          maskedDetails.cardNumber =
            cardNumber.slice(0, 4) +
            '*'.repeat(cardNumber.length - 8) +
            cardNumber.slice(-4);
        }
        if (maskedDetails.cvv) {
          delete maskedDetails.cvv; // Never return CVV
        }
        break;
      case PaymentMethodType.BANK_TRANSFER:
        if (maskedDetails.accountNumber) {
          const accountNumber = maskedDetails.accountNumber.toString();
          maskedDetails.accountNumber =
            '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
        }
        break;
      case PaymentMethodType.DIGITAL_WALLET:
        if (maskedDetails.walletId) {
          const walletId = maskedDetails.walletId.toString();
          maskedDetails.walletId =
            walletId.slice(0, 3) +
            '*'.repeat(Math.max(0, walletId.length - 6)) +
            walletId.slice(-3);
        }
        break;
    }

    return maskedDetails;
  }

  private performPaymentMethodValidation(
    type: PaymentMethodType,
    details: any,
  ) {
    const errors: string[] = [];
    let isValid = true;

    switch (type) {
      case PaymentMethodType.CREDIT_CARD:
        if (details.expiryMonth && details.expiryYear) {
          const now = new Date();
          const expiryDate = new Date(
            details.expiryYear,
            details.expiryMonth - 1,
          );
          if (expiryDate < now) {
            errors.push('Credit card has expired');
            isValid = false;
          }
        }
        break;
      case PaymentMethodType.BANK_TRANSFER:
        // Add bank account validation logic if needed
        break;
      case PaymentMethodType.DIGITAL_WALLET:
        // Add wallet validation logic if needed
        break;
    }

    return { isValid, errors };
  }
}
