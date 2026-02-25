import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUserContext } from '../common/auth/current-user.decorator';
import { SessionGuard } from '../common/auth/session.guard';
import type { CurrentUser } from '../common/auth/current-user.type';

import { CreateCheckoutSessionDto } from './dto/billing.dto';
import { V1Service } from './v1.service';

@Controller('v1/orgs/:orgId/billing')
@UseGuards(SessionGuard)
export class BillingController {
  constructor(private readonly v1Service: V1Service) {}

  @Get()
  async summary(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.getBilling(user.id, orgId);
  }

  @Post('checkout-session')
  async checkoutSession(
    @CurrentUserContext() user: CurrentUser,
    @Param('orgId') orgId: string,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.v1Service.createCheckoutSession(user.id, orgId, dto);
  }

  @Post('portal-session')
  async portalSession(@CurrentUserContext() user: CurrentUser, @Param('orgId') orgId: string) {
    return this.v1Service.createPortalSession(user.id, orgId);
  }
}
