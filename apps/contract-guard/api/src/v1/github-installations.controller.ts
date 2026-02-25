import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { SyncGithubInstallationDto } from './dto/github-installation.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/github/installations')
@UseGuards(SessionGuard)
export class GithubInstallationsController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async list(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.listGithubInstallations(user.id, orgId);
  }

  @Post('sync')
  async sync(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: SyncGithubInstallationDto,
  ) {
    return this.v1Service.syncGithubInstallation(user.id, orgId, dto);
  }
}
