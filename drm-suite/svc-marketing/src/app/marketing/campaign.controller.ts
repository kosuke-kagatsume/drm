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
import { CampaignService } from './campaign.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignFilterDto,
  CampaignMetricsDto,
} from './dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  async findAll(@Query() filter: CampaignFilterDto) {
    return this.campaignService.findAll(filter);
  }

  @Get('performance-report')
  async getPerformanceReport(
    @Query('companyId') companyId: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.campaignService.getCampaignPerformanceReport(
      companyId,
      storeId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignService.findOne(id);
  }

  @Get(':id/metrics')
  async getMetrics(@Param('id') id: string) {
    return this.campaignService.getMetrics(id);
  }

  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Put(':id/metrics')
  async updateMetrics(
    @Param('id') id: string,
    @Body() metrics: Partial<CampaignMetricsDto>,
  ) {
    return this.campaignService.updateMetrics(id, metrics);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.campaignService.remove(id);
  }
}
