import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { UpdatePolicyDto } from './dto/policy.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId')
@UseGuards(SessionGuard)
export class PoliciesController {
  constructor(private readonly v1Service: V1Service) {}

  @Get('policies/default')
  async getDefaultPolicy(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
  ): Promise<unknown> {
    return this.v1Service.getDefaultPolicy(user.id, orgId);
  }

  @Put('policies/default')
  async updateDefaultPolicy(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: UpdatePolicyDto,
  ): Promise<unknown> {
    return this.v1Service.updateDefaultPolicy(user.id, orgId, dto);
  }

  @Get('services/:serviceId/policy')
  async getServicePolicy(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<unknown> {
    return this.v1Service.getServicePolicy(user.id, orgId, serviceId);
  }

  @Put('services/:serviceId/policy')
  async updateServicePolicy(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdatePolicyDto,
  ): Promise<unknown> {
    return this.v1Service.updateServicePolicy(user.id, orgId, serviceId, dto);
  }
}
