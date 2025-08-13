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
import { BudgetService } from './budget.service';
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetFilterDto,
  BudgetAnalysisRequestDto,
} from './dto';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async create(@Body(ValidationPipe) createBudgetDto: CreateBudgetDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Budget created successfully',
      data: await this.budgetService.create(createBudgetDto),
    };
  }

  @Get()
  async findAll(@Query(ValidationPipe) filter: BudgetFilterDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Budgets retrieved successfully',
      data: await this.budgetService.findAll(filter),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Budget retrieved successfully',
      data: await this.budgetService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateBudgetDto: UpdateBudgetDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Budget updated successfully',
      data: await this.budgetService.update(id, updateBudgetDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.budgetService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Budget deleted successfully',
    };
  }

  @Post('analysis')
  async getBudgetAnalysis(
    @Body(ValidationPipe) request: BudgetAnalysisRequestDto,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Budget analysis retrieved successfully',
      data: await this.budgetService.getBudgetAnalysis(request),
    };
  }

  @Post('copy')
  async copyBudgetToNextPeriod(
    @Body()
    body: {
      sourceCompanyId: string;
      sourceFiscal: string;
      targetFiscal: string;
      adjustmentFactor?: number;
    },
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Budget copied to next period successfully',
      data: await this.budgetService.copyBudgetToNextPeriod(
        body.sourceCompanyId,
        body.sourceFiscal,
        body.targetFiscal,
        body.adjustmentFactor,
      ),
    };
  }
}
