import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/members')
@UseGuards(SessionGuard)
export class MembersController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async list(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.listMembers(user.id, orgId);
  }

  @Post()
  async create(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: CreateMemberDto,
  ) {
    return this.v1Service.addMember(user.id, orgId, dto);
  }

  @Patch(':memberId')
  async update(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.v1Service.updateMember(user.id, orgId, memberId, dto);
  }

  @Delete(':memberId')
  async remove(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.v1Service.removeMember(user.id, orgId, memberId);
  }
}
