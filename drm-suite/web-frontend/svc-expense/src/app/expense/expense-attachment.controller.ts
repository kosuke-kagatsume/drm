import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ExpenseAttachmentService } from './expense-attachment.service';
import { CreateExpenseAttachmentDto, ExpenseAttachmentFilterDto } from './dto';

@Controller('expense-attachments')
export class ExpenseAttachmentController {
  constructor(
    private readonly expenseAttachmentService: ExpenseAttachmentService,
  ) {}

  @Post()
  async create(
    @Body(ValidationPipe) createAttachmentDto: CreateExpenseAttachmentDto,
  ) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Expense attachment created successfully',
      data: await this.expenseAttachmentService.create(createAttachmentDto),
    };
  }

  @Get()
  async findAll(@Query(ValidationPipe) filter: ExpenseAttachmentFilterDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense attachments retrieved successfully',
      data: await this.expenseAttachmentService.findAll(filter),
    };
  }

  @Get('statistics/:companyId')
  async getAttachmentStatistics(@Param('companyId') companyId: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Attachment statistics retrieved successfully',
      data: await this.expenseAttachmentService.getAttachmentStatistics(
        companyId,
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense attachment retrieved successfully',
      data: await this.expenseAttachmentService.findOne(id),
    };
  }

  @Get(':id/download')
  async generatePresignedUrl(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Download URL generated successfully',
      data: {
        id,
        downloadUrl:
          await this.expenseAttachmentService.generatePresignedUrl(id),
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.expenseAttachmentService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expense attachment deleted successfully',
    };
  }

  @Post('bulk-delete')
  async bulkDelete(
    @Body() body: { expenseId: string; attachmentIds: string[] },
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Attachments deleted successfully',
      data: await this.expenseAttachmentService.bulkDelete(
        body.expenseId,
        body.attachmentIds,
      ),
    };
  }

  @Post('validate')
  async validateAttachment(@Body() body: { file: any; expenseId: string }) {
    return {
      statusCode: HttpStatus.OK,
      message: 'File validation completed',
      data: await this.expenseAttachmentService.validateAttachment(
        body.file,
        body.expenseId,
      ),
    };
  }

  @Get('archive/:companyId')
  async archiveOldAttachments(
    @Param('companyId') companyId: string,
    @Query('daysOld') daysOld?: string,
  ) {
    const days = daysOld ? parseInt(daysOld) : 365;
    return {
      statusCode: HttpStatus.OK,
      message: 'Archive candidates retrieved successfully',
      data: await this.expenseAttachmentService.archiveOldAttachments(
        companyId,
        days,
      ),
    };
  }
}
