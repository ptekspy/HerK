import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { CreateWaiverDto } from './dto/waiver.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/waivers')
@UseGuards(SessionGuard)
export class WaiversController {
  constructor(private readonly v1Service: V1Service) {}

  @Post()
  async create(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: CreateWaiverDto,
  ) {
    return this.v1Service.createWaiver(user.id, orgId, dto);
  }

  @Delete(':waiverId')
  async remove(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('waiverId') waiverId: string,
  ) {
    return this.v1Service.deleteWaiver(user.id, orgId, waiverId);
  }
}
