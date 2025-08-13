import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@drm-suite/prisma';
import { CreateExpenseAttachmentDto, ExpenseAttachmentFilterDto } from './dto';

@Injectable()
export class ExpenseAttachmentService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(private prisma: PrismaService) {}

  async create(createAttachmentDto: CreateExpenseAttachmentDto) {
    // Validate expense exists
    const expense = await this.prisma.expense.findUnique({
      where: { id: createAttachmentDto.expenseId },
    });

    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${createAttachmentDto.expenseId} not found`,
      );
    }

    // Validate file size
    if (createAttachmentDto.fileSize > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    if (!this.ALLOWED_FILE_TYPES.includes(createAttachmentDto.fileType)) {
      throw new BadRequestException(
        `File type ${createAttachmentDto.fileType} is not allowed`,
      );
    }

    // Check attachment count limit per expense
    const existingAttachmentsCount = await this.prisma.expenseAttachment.count({
      where: { expenseId: createAttachmentDto.expenseId },
    });

    if (existingAttachmentsCount >= 10) {
      throw new BadRequestException(
        'Maximum 10 attachments allowed per expense',
      );
    }

    return this.prisma.expenseAttachment.create({
      data: createAttachmentDto,
      include: {
        expense: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(filter: ExpenseAttachmentFilterDto) {
    const attachments = await this.prisma.expenseAttachment.findMany({
      where: {
        expenseId: filter.expenseId,
      },
      include: {
        expense: {
          select: {
            id: true,
            title: true,
            status: true,
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return attachments;
  }

  async findOne(id: string) {
    const attachment = await this.prisma.expenseAttachment.findUnique({
      where: { id },
      include: {
        expense: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async remove(id: string) {
    const attachment = await this.findOne(id);

    // Check if expense is in a state that allows attachment deletion
    if (attachment.expense.status === 'paid') {
      throw new BadRequestException(
        'Cannot delete attachments from paid expenses',
      );
    }

    return this.prisma.expenseAttachment.delete({
      where: { id },
    });
  }

  async bulkDelete(expenseId: string, attachmentIds: string[]) {
    // Validate expense exists
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${expenseId} not found`);
    }

    // Check if expense allows attachment deletion
    if (expense.status === 'paid') {
      throw new BadRequestException(
        'Cannot delete attachments from paid expenses',
      );
    }

    // Validate all attachments belong to the expense
    const attachments = await this.prisma.expenseAttachment.findMany({
      where: {
        id: { in: attachmentIds },
        expenseId,
      },
    });

    if (attachments.length !== attachmentIds.length) {
      throw new BadRequestException(
        'Some attachments do not belong to this expense',
      );
    }

    // Delete attachments
    const result = await this.prisma.expenseAttachment.deleteMany({
      where: {
        id: { in: attachmentIds },
        expenseId,
      },
    });

    return {
      deletedCount: result.count,
      attachmentIds,
    };
  }

  async validateAttachment(file: any, expenseId: string) {
    // Validate expense exists
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${expenseId} not found`);
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    if (!this.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }

    // Check if file name is unique for this expense
    const existingAttachment = await this.prisma.expenseAttachment.findFirst({
      where: {
        expenseId,
        fileName: file.originalname,
      },
    });

    if (existingAttachment) {
      throw new BadRequestException(
        `File with name ${file.originalname} already exists for this expense`,
      );
    }

    // Check attachment count limit
    const attachmentCount = await this.prisma.expenseAttachment.count({
      where: { expenseId },
    });

    if (attachmentCount >= 10) {
      throw new BadRequestException(
        'Maximum 10 attachments allowed per expense',
      );
    }

    return {
      isValid: true,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
    };
  }

  async getAttachmentStatistics(companyId: string) {
    // Get expense IDs for the company
    const expenses = await this.prisma.expense.findMany({
      where: { companyId },
      select: { id: true },
    });

    const expenseIds = expenses.map((exp) => exp.id);

    if (expenseIds.length === 0) {
      return {
        totalAttachments: 0,
        totalFileSize: 0,
        averageAttachmentsPerExpense: 0,
        fileTypeDistribution: {},
        largestFile: null,
        oldestAttachment: null,
        newestAttachment: null,
      };
    }

    const attachments = await this.prisma.expenseAttachment.findMany({
      where: {
        expenseId: { in: expenseIds },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    const totalFileSize = attachments.reduce(
      (sum, att) => sum + att.fileSize,
      0,
    );
    const fileTypeDistribution: Record<string, number> = {};

    attachments.forEach((att) => {
      fileTypeDistribution[att.fileType] =
        (fileTypeDistribution[att.fileType] || 0) + 1;
    });

    const largestFile =
      attachments.length > 0
        ? attachments.reduce((largest, current) =>
            current.fileSize > largest.fileSize ? current : largest,
          )
        : null;

    return {
      totalAttachments: attachments.length,
      totalFileSize,
      averageFileSizeMB:
        attachments.length > 0
          ? totalFileSize / attachments.length / 1024 / 1024
          : 0,
      averageAttachmentsPerExpense: attachments.length / expenses.length,
      fileTypeDistribution,
      largestFile: largestFile
        ? {
            id: largestFile.id,
            fileName: largestFile.fileName,
            fileSize: largestFile.fileSize,
            fileType: largestFile.fileType,
          }
        : null,
      oldestAttachment:
        attachments.length > 0
          ? attachments[attachments.length - 1].uploadedAt
          : null,
      newestAttachment:
        attachments.length > 0 ? attachments[0].uploadedAt : null,
    };
  }

  async generatePresignedUrl(id: string): Promise<string> {
    const attachment = await this.findOne(id);

    // In a real implementation, this would generate a presigned URL for cloud storage (S3, GCS, etc.)
    // For now, return the file URL directly
    return attachment.fileUrl;
  }

  async archiveOldAttachments(companyId: string, daysOld: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Get expenses for the company
    const expenses = await this.prisma.expense.findMany({
      where: { companyId },
      select: { id: true },
    });

    const expenseIds = expenses.map((exp) => exp.id);

    if (expenseIds.length === 0) {
      return { archivedCount: 0, totalSize: 0 };
    }

    const oldAttachments = await this.prisma.expenseAttachment.findMany({
      where: {
        expenseId: { in: expenseIds },
        uploadedAt: { lte: cutoffDate },
      },
    });

    const totalSize = oldAttachments.reduce(
      (sum, att) => sum + att.fileSize,
      0,
    );

    // In a real implementation, you would move these files to archive storage
    // For now, we'll just return statistics

    return {
      candidatesForArchival: oldAttachments.length,
      totalSize,
      cutoffDate,
      attachments: oldAttachments.map((att) => ({
        id: att.id,
        fileName: att.fileName,
        fileSize: att.fileSize,
        uploadedAt: att.uploadedAt,
      })),
    };
  }

  getFileTypeDisplayName(fileType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'application/pdf': 'PDF Document',
      'text/csv': 'CSV File',
      'application/vnd.ms-excel': 'Excel File (XLS)',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'Excel File (XLSX)',
    };

    return typeMap[fileType] || fileType;
  }

  formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

    return (
      parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  }
}
