import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/checks')
@UseGuards(SessionGuard)
export class ChecksController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async list(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.listChecks(user.id, orgId);
  }

  @Get(':checkId')
  async get(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('checkId') checkId: string,
  ) {
    return this.v1Service.getCheck(user.id, orgId, checkId);
  }
}
