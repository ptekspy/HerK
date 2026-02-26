import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { UpdateDashboardWizardStateDto } from './dto/dashboard-wizard.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/dashboard')
@UseGuards(SessionGuard)
export class DashboardController {
  constructor(private readonly v1Service: V1Service) {}

  @Get('summary')
  async summary(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.getDashboardSummary(user.id, orgId);
  }

  @Patch('wizard-state')
  async updateWizardState(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: UpdateDashboardWizardStateDto,
  ) {
    return this.v1Service.updateDashboardWizardState(user.id, orgId, dto);
  }
}
