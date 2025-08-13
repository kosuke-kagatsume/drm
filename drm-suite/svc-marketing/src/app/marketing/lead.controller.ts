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
import { LeadService } from './lead.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadFilterDto,
  LeadConversionDto,
} from './dto';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  async findAll(@Query() filter: LeadFilterDto) {
    return this.leadService.findAll(filter);
  }

  @Get('analytics')
  async getConversionAnalytics(
    @Query('campaignId') campaignId?: string,
    @Query('companyId') companyId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.leadService.getConversionAnalytics(
      campaignId,
      companyId,
      storeId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadService.findOne(id);
  }

  @Get(':id/tracking')
  async getTracking(@Param('id') id: string) {
    return this.leadService.getLeadTracking(id);
  }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadService.create(createLeadDto);
  }

  @Post('convert')
  async convertLead(@Body() conversion: LeadConversionDto) {
    return this.leadService.convertLead(conversion);
  }

  @Post('score/:campaignId')
  async scoreLeads(@Param('campaignId') campaignId: string) {
    return this.leadService.scoreLeads(campaignId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.leadService.remove(id);
  }
}
