import { Module } from '@nestjs/common';

import { SessionGuard } from '../common/auth/session.guard';
import { RbacService } from '../common/rbac/rbac.service';

import { BillingController } from './billing.controller';
import { ChecksController } from './checks.controller';
import { DashboardController } from './dashboard.controller';
import { GithubInstallationsController } from './github-installations.controller';
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
    DashboardController,
    GithubInstallationsController,
    WaiversController,
    NotificationsController,
    MembersController,
    BillingController,
  ],
  providers: [V1Service, SessionGuard, RbacService],
})
export class V1Module {}
