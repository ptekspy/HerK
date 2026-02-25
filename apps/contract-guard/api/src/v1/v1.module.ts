import { Module } from '@nestjs/common';

import { SessionGuard } from '../common/auth/session.guard';

import { BillingController } from './billing.controller';
import { ChecksController } from './checks.controller';
import { MembersController } from './members.controller';
import { MeController } from './me.controller';
import { NotificationsController } from './notifications.controller';
import { OrgsController } from './orgs.controller';
import { PoliciesController } from './policies.controller';
import { ReposController } from './repos.controller';
import { ServicesController } from './services.controller';
import { V1Service } from './v1.service';
import { WaiversController } from './waivers.controller';

@Module({
  controllers: [
    MeController,
    OrgsController,
    ReposController,
    ServicesController,
    PoliciesController,
    ChecksController,
    WaiversController,
    NotificationsController,
    MembersController,
    BillingController,
  ],
  providers: [V1Service, SessionGuard],
})
export class V1Module {}
