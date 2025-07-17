import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant info' })
  async getCurrentTenant(@CurrentUser() user: CurrentUserData) {
    return this.tenantsService.findOne(user.companyId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users in current tenant' })
  async getTenantUsers(@CurrentUser() user: CurrentUserData) {
    return this.tenantsService.findAllUsers(user.companyId);
  }
}