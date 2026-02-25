import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { V1Service } from './v1.service';

@Controller('v1/me')
@UseGuards(SessionGuard)
export class MeController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async getMe(@CurrentUserContext() user: CurrentUser) {
    return this.v1Service.getMe(user.id, user.email);
  }
}
