import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { CreateOrgDto } from './dto/org.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs')
@UseGuards(SessionGuard)
export class OrgsController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async findAll(@CurrentUserContext() user: CurrentUser) {
    return this.v1Service.listOrgs(user.id, user.email);
  }

  @Post()
  async create(@CurrentUserContext() user: CurrentUser, @Body() dto: CreateOrgDto) {
    return this.v1Service.createOrg(user.id, dto);
  }

  @Get(':orgId')
  async findOne(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.getOrg(user.id, orgId);
  }
}
