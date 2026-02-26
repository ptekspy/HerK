import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { MarkNotificationsReadDto } from './dto/notifications.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/notifications')
@UseGuards(SessionGuard)
export class NotificationsController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async list(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.listNotifications(user.id, orgId);
  }

  @Get('preferences')
  async preferences(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.getNotificationPreferences(user.id, orgId);
  }

  @Patch()
  async markRead(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: MarkNotificationsReadDto,
  ) {
    return this.v1Service.markNotificationsRead(user.id, orgId, dto);
  }

  @Patch('preferences')
  async updatePreferences(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.v1Service.updateNotificationPreferences(user.id, orgId, dto);
  }
}
