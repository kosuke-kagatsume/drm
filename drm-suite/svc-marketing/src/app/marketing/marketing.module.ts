import { Module } from '@nestjs/common';
import { PrismaModule } from '@drm-suite/prisma';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignController, LeadController],
  providers: [CampaignService, LeadService],
  exports: [CampaignService, LeadService],
})
export class MarketingModule {}
