import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EstimateService } from './estimate.service';
import {
  CreateEstimateDto,
  UpdateEstimateDto,
  EstimateFilterDto,
  CopyEstimateDto,
} from './dto';

@Controller('estimates')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Get()
  async findAll(@Query() filter: EstimateFilterDto) {
    return this.estimateService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.estimateService.findOne(id);
  }

  @Post()
  async create(@Body() createEstimateDto: CreateEstimateDto) {
    return this.estimateService.create(createEstimateDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEstimateDto: UpdateEstimateDto,
  ) {
    return this.estimateService.update(id, updateEstimateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.estimateService.remove(id);
  }

  @Post(':id/copy')
  async copy(@Param('id') id: string, @Body() copyDto: CopyEstimateDto) {
    return this.estimateService.copy(id, copyDto.mode);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() approvalData: any) {
    return this.estimateService.approve(id, approvalData);
  }

  @Get(':id/workflow')
  async getApprovalWorkflow(@Param('id') id: string) {
    return this.estimateService.getApprovalWorkflow(id);
  }

  // RAG-based endpoints
  @Get('rag/similar')
  async findSimilarEstimates(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ) {
    const limitNum = limit ? parseInt(limit.toString()) : 5;
    return this.estimateService.findSimilarEstimates(query, limitNum);
  }

  @Post('rag/suggest-items')
  async suggestItems(
    @Body('projectType') projectType: string,
    @Body('description') description: string,
  ) {
    return this.estimateService.suggestItems(projectType, description);
  }

  @Post('rag/optimize-pricing')
  async optimizePricing(@Body('sections') sections: any[]) {
    return this.estimateService.optimizePricing(sections);
  }

  @Get('stats')
  async getStats(@Query('period') period?: string) {
    return this.estimateService.getEstimateStats(period);
  }
}
