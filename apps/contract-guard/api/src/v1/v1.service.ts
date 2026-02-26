import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type {
  BillingPlan,
  DashboardAttentionItem,
  DashboardSummary,
  DashboardWizardAcknowledgedStepId,
  DashboardWizardStep,
  DashboardWizardStepStatus,
  UpdateDashboardWizardStateRequest,
} from '@herk/api';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import Stripe from 'stripe';

import { PrismaService } from '../common/prisma/prisma.service';
import { RbacService } from '../common/rbac/rbac.service';

import { CreateOrgDto } from './dto/org.dto';
import { CreateRepositoryDto, UpdateRepositoryDto } from './dto/repo.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { UpdatePolicyDto } from './dto/policy.dto';
import { CreateWaiverDto, UpdateWaiverDto } from './dto/waiver.dto';
import { MarkNotificationsReadDto } from './dto/notifications.dto';
import { UpdateNotificationPreferencesDto } from './dto/notification-preferences.dto';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { CreateCheckoutSessionDto } from './dto/billing.dto';
import { UpdateDashboardWizardStateDto } from './dto/dashboard-wizard.dto';
import { SyncGithubInstallationDto } from './dto/github-installation.dto';

const PLAN_LIMITS: Record<BillingPlan, number | null> = {
  STARTER: 3,
  GROWTH: 15,
  ENTERPRISE: null,
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['ACTIVE', 'TRIALING', 'PAST_DUE']);

const REQUIRED_WIZARD_STEP_IDS = [
  'github_installation_connected',
  'repositories_synced',
  'first_service_created',
  'policy_reviewed',
  'notifications_reviewed',
] as const;

@Injectable()
export class V1Service {
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbac: RbacService,
  ) {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-08-27.basil',
        })
      : null;
  }

  private async createGithubInstallationClient(installationId: number) {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      throw new InternalServerErrorException(
        'GitHub App credentials are missing. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY.',
      );
    }

    const auth = createAppAuth({
      appId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });

    const installationAuth = await auth({
      type: 'installation',
      installationId,
    });

    return new Octokit({
      auth: installationAuth.token,
    });
  }

  async ensureDefaultOrgForUser(userId: string, email: string | null) {
    const membershipCount = await this.prisma.organizationMember.count({
      where: { userId },
    });

    if (membershipCount > 0) {
      return;
    }

    const slugBase = (email?.split('@')[0] ?? 'team').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const org = await this.prisma.organization.create({
      data: {
        name: `${slugBase} team`,
        slug,
        billingPlan: 'STARTER',
      },
    });

    await this.prisma.organizationMember.create({
      data: {
        orgId: org.id,
        userId,
        role: 'OWNER',
      },
    });

    await this.prisma.policy.create({
      data: {
        orgId: org.id,
        failOnBreaking: true,
        ruleOverrides: {},
      },
    });
  }

  async getMe(userId: string, email: string | null) {
    await this.ensureDefaultOrgForUser(userId, email);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      memberships: user.memberships.map((membership) => ({
        orgId: membership.orgId,
        role: membership.role,
        orgName: membership.organization.name,
        orgSlug: membership.organization.slug,
      })),
    };
  }

  async listOrgs(userId: string, email: string | null) {
    await this.ensureDefaultOrgForUser(userId, email);

    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
      billingPlan: membership.organization.billingPlan,
      createdAt: membership.organization.createdAt,
      updatedAt: membership.organization.updatedAt,
    }));
  }

  async createOrg(userId: string, dto: CreateOrgDto) {
    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });

    await this.prisma.organizationMember.create({
      data: {
        orgId: org.id,
        userId,
        role: 'OWNER',
      },
    });

    await this.prisma.policy.create({
      data: {
        orgId: org.id,
        failOnBreaking: true,
        ruleOverrides: {},
      },
    });

    return org;
  }

  async getOrg(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: true,
            repositories: true,
            services: true,
            checkRuns: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return organization;
  }

  async getDashboardSummary(userId: string, orgId: string): Promise<DashboardSummary> {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');
    return this.buildDashboardSummary(userId, orgId);
  }

  async updateDashboardWizardState(
    userId: string,
    orgId: string,
    dto: UpdateDashboardWizardStateDto,
  ) {
    await this.rbac.requireOrgRole(userId, orgId, 'MEMBER');

    const wizardState = await this.prisma.dashboardWizardState.upsert({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
      create: {
        orgId,
        userId,
      },
      update: {},
    });

    const isAcknowledgeStep = (
      step: string,
    ): step is DashboardWizardAcknowledgedStepId =>
      step === 'policy_reviewed' || step === 'notifications_reviewed';

    const acknowledgedSteps = new Set<DashboardWizardAcknowledgedStepId>(
      wizardState.acknowledgedSteps.filter(isAcknowledgeStep),
    );

    if (dto.acknowledgeStepId) {
      acknowledgedSteps.add(dto.acknowledgeStepId);
    }

    if (dto.clearAcknowledgeStepId) {
      acknowledgedSteps.delete(dto.clearAcknowledgeStepId);
    }

    const updateData: UpdateDashboardWizardStateRequest = {};

    if (dto.dismissed !== undefined) {
      updateData.dismissed = dto.dismissed;
    }

    if (dto.markSeen) {
      updateData.markSeen = true;
    }

    if (dto.acknowledgeStepId) {
      updateData.acknowledgeStepId = dto.acknowledgeStepId;
    }

    if (dto.clearAcknowledgeStepId) {
      updateData.clearAcknowledgeStepId = dto.clearAcknowledgeStepId;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.dashboardWizardState.update({
        where: { id: wizardState.id },
        data: {
          dismissedAt:
            dto.dismissed === undefined
              ? undefined
              : dto.dismissed
                ? new Date()
                : null,
          lastSeenAt: dto.markSeen ? new Date() : undefined,
          acknowledgedSteps:
            dto.acknowledgeStepId || dto.clearAcknowledgeStepId
              ? Array.from(acknowledgedSteps).sort()
              : undefined,
        },
      });
    }

    const summary = await this.buildDashboardSummary(userId, orgId);
    return summary.wizard;
  }

  private async buildDashboardSummary(
    userId: string,
    orgId: string,
  ): Promise<DashboardSummary> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      org,
      installationCount,
      wizardState,
      checksLast7Days,
      failingChecksLast7Days,
      unreadNotifications,
      recentChecks,
      recentNotifications,
    ] = await Promise.all([
      this.prisma.organization.findUniqueOrThrow({
        where: { id: orgId },
        include: {
          subscription: true,
          _count: {
            select: {
              members: true,
              repositories: true,
              services: true,
              checkRuns: true,
            },
          },
        },
      }),
      this.prisma.githubInstallation.count({
        where: { orgId },
      }),
      this.prisma.dashboardWizardState.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
      }),
      this.prisma.checkRun.count({
        where: {
          orgId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      this.prisma.checkRun.count({
        where: {
          orgId,
          createdAt: {
            gte: sevenDaysAgo,
          },
          OR: [
            {
              status: 'FAILED',
            },
            {
              conclusion: {
                in: ['FAIL', 'ERROR'],
              },
            },
          ],
        },
      }),
      this.prisma.notification.count({
        where: {
          orgId,
          OR: [{ userId: null }, { userId }],
          readAt: null,
        },
      }),
      this.prisma.checkRun.findMany({
        where: { orgId },
        include: {
          service: {
            select: {
              name: true,
            },
          },
          repository: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
      this.prisma.notification.findMany({
        where: {
          orgId,
          OR: [{ userId: null }, { userId }],
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    const isAcknowledgeStep = (
      step: string,
    ): step is DashboardWizardAcknowledgedStepId =>
      step === 'policy_reviewed' || step === 'notifications_reviewed';
    const acknowledged = new Set<DashboardWizardAcknowledgedStepId>(
      (wizardState?.acknowledgedSteps ?? []).filter(isAcknowledgeStep),
    );

    const hasGithubInstallation = installationCount > 0;
    const hasRepositories = org._count.repositories > 0;
    const hasServices = org._count.services > 0;
    const hasFirstCheck = org._count.checkRuns > 0;
    const hasTeammate = org._count.members > 1;

    const toStepStatus = (
      completed: boolean,
      warning = false,
    ): DashboardWizardStepStatus => {
      if (completed) return 'completed';
      if (warning) return 'warning';
      return 'pending';
    };

    const steps: DashboardWizardStep[] = [
      {
        id: 'github_installation_connected',
        label: 'Connect GitHub App',
        description:
          'GitHub App connection is expected as part of sign-in/onboarding and should already be complete.',
        required: true,
        completed: hasGithubInstallation,
        status: toStepStatus(hasGithubInstallation, !hasGithubInstallation),
        actionLabel: hasGithubInstallation ? 'Manage installation' : 'Reconnect GitHub',
        actionHref: `/app/${orgId}/repos#github-sync`,
        note: hasGithubInstallation
          ? 'Connected during sign-in.'
          : 'No installation record found for this organization.',
      },
      {
        id: 'repositories_synced',
        label: 'Sync repositories',
        description: 'Import repositories from the GitHub App installation.',
        required: true,
        completed: hasRepositories,
        status: toStepStatus(hasRepositories),
        actionLabel: 'Open repositories',
        actionHref: `/app/${orgId}/repos#github-sync`,
      },
      {
        id: 'first_service_created',
        label: 'Create first service',
        description: 'Map a repository contract path to a tracked API Contract Guard service.',
        required: true,
        completed: hasServices,
        status: toStepStatus(hasServices),
        actionLabel: 'Create service',
        actionHref: `/app/${orgId}/services#create-service`,
      },
      {
        id: 'policy_reviewed',
        label: 'Review policy defaults',
        description: 'Confirm your organization policy defaults for breaking-change enforcement.',
        required: true,
        completed: acknowledged.has('policy_reviewed'),
        status: toStepStatus(acknowledged.has('policy_reviewed')),
        actionLabel: 'Open policies',
        actionHref: `/app/${orgId}/policies`,
      },
      {
        id: 'notifications_reviewed',
        label: 'Confirm notifications',
        description: 'Review PR failure email preference and in-app notification behavior.',
        required: true,
        completed: acknowledged.has('notifications_reviewed'),
        status: toStepStatus(acknowledged.has('notifications_reviewed')),
        actionLabel: 'Open notifications',
        actionHref: `/app/${orgId}/notifications`,
      },
      {
        id: 'first_check_received',
        label: 'Receive first PR check',
        description: 'Run a pull request with a contract change and verify check reporting.',
        required: false,
        completed: hasFirstCheck,
        status: toStepStatus(hasFirstCheck),
        actionLabel: 'Open checks',
        actionHref: `/app/${orgId}/checks`,
      },
      {
        id: 'teammate_invited',
        label: 'Invite a teammate',
        description: 'Add at least one collaborator so reviews and ownership are shared.',
        required: false,
        completed: hasTeammate,
        status: toStepStatus(hasTeammate),
        actionLabel: 'Manage team',
        actionHref: `/app/${orgId}/team`,
      },
    ];

    const requiredTotal = REQUIRED_WIZARD_STEP_IDS.length;
    const requiredCompleted = steps.filter(
      (step) =>
        step.required &&
        REQUIRED_WIZARD_STEP_IDS.includes(
          step.id as (typeof REQUIRED_WIZARD_STEP_IDS)[number],
        ) &&
        step.completed,
    ).length;
    const isComplete = requiredCompleted === requiredTotal;

    let completedAt = wizardState?.completedAt ?? null;
    if (isComplete && !completedAt) {
      completedAt = new Date();
      await this.prisma.dashboardWizardState.upsert({
        where: {
          orgId_userId: {
            orgId,
            userId,
          },
        },
        create: {
          orgId,
          userId,
          acknowledgedSteps: Array.from(acknowledged),
          completedAt,
        },
        update: {
          completedAt,
        },
      });
    }

    const isSubscribed = Boolean(
      org.subscription?.status &&
        ACTIVE_SUBSCRIPTION_STATUSES.has(org.subscription.status),
    );
    const attention: DashboardAttentionItem[] = [];

    if (!hasGithubInstallation) {
      attention.push({
        key: 'missing_installation',
        level: 'warn',
        title: 'GitHub App requires reconnection',
        message:
          'This organization has no GitHub installation record. Reconnect to restore repository sync and checks.',
        href: `/app/${orgId}/repos#github-sync`,
      });
    }

    if (!hasRepositories) {
      attention.push({
        key: 'missing_repositories',
        level: 'warn',
        title: 'No repositories synced',
        message:
          'Sync repositories from GitHub so services can be created and checks can run.',
        href: `/app/${orgId}/repos#github-sync`,
      });
    }

    if (!hasServices) {
      attention.push({
        key: 'missing_services',
        level: 'warn',
        title: 'No services configured',
        message:
          'Create your first service to start contract checks on pull requests.',
        href: `/app/${orgId}/services#create-service`,
      });
    }

    if (failingChecksLast7Days > 0) {
      attention.push({
        key: 'failing_checks',
        level: 'error',
        title: 'Recent failing contract checks',
        message: `${failingChecksLast7Days} checks failed in the last 7 days.`,
        href: `/app/${orgId}/checks`,
      });
    }

    if (org.subscription?.status === 'PAST_DUE') {
      attention.push({
        key: 'billing_past_due',
        level: 'warn',
        title: 'Billing is past due',
        message:
          'Update billing details to avoid interruption to service creation and checks.',
        href: `/app/${orgId}/billing`,
      });
    } else if (!isSubscribed) {
      attention.push({
        key: 'billing_inactive',
        level: 'error',
        title: 'Subscription is not active',
        message:
          'Choose a plan and complete checkout to continue using API Contract Guard fully.',
        href: `/app/${orgId}/billing`,
      });
    }

    return {
      org: {
        id: org.id,
        name: org.name,
        billingPlan: org.billingPlan as BillingPlan,
      },
      billing: {
        status: org.subscription?.status ?? null,
        serviceCount: org._count.services,
        serviceLimit: PLAN_LIMITS[org.billingPlan as BillingPlan],
        currentPeriodEnd: org.subscription?.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: org.subscription?.cancelAtPeriodEnd ?? false,
      },
      metrics: {
        repositories: org._count.repositories,
        services: org._count.services,
        members: org._count.members,
        checksTotal: org._count.checkRuns,
        checksLast7Days,
        failingChecksLast7Days,
        unreadNotifications,
      },
      wizard: {
        isDismissed: Boolean(wizardState?.dismissedAt) && !isComplete,
        isComplete,
        completedAt: completedAt?.toISOString() ?? null,
        dismissedAt: wizardState?.dismissedAt?.toISOString() ?? null,
        requiredCompleted,
        requiredTotal,
        steps,
      },
      recentChecks: recentChecks.map((check) => ({
        id: check.id,
        conclusion: check.conclusion,
        createdAt: check.createdAt.toISOString(),
        serviceName: check.service.name,
        repositoryFullName: check.repository.fullName,
        pullRequestNumber: check.pullRequestNumber,
      })),
      recentNotifications: recentNotifications.map((notification) => ({
        id: notification.id,
        kind: notification.kind,
        title: notification.title,
        readAt: notification.readAt?.toISOString() ?? null,
        createdAt: notification.createdAt.toISOString(),
      })),
      attention,
    };
  }

  async listGithubInstallations(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    const installations = await this.prisma.githubInstallation.findMany({
      where: { orgId },
      include: {
        _count: {
          select: {
            repositories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return installations.map((installation) => ({
      ...installation,
      installationId: installation.installationId.toString(),
    }));
  }

  async syncGithubInstallation(
    userId: string,
    orgId: string,
    dto: SyncGithubInstallationDto,
  ) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const installation = await this.prisma.githubInstallation.upsert({
      where: {
        installationId: BigInt(dto.installationId),
      },
      create: {
        orgId,
        installationId: BigInt(dto.installationId),
        accountLogin: dto.accountLogin,
      },
      update: {
        orgId,
        accountLogin: dto.accountLogin,
      },
    });

    if (dto.syncRepositories === false) {
      return {
        installation: {
          ...installation,
          installationId: installation.installationId.toString(),
        },
        syncedRepositories: 0,
      };
    }

    const octokit = await this.createGithubInstallationClient(dto.installationId);

    let page = 1;
    let syncedRepositories = 0;

    for (;;) {
      const response = await octokit.rest.apps.listReposAccessibleToInstallation({
        per_page: 100,
        page,
      });

      const repositories = response.data.repositories ?? [];
      if (repositories.length === 0) {
        break;
      }

      for (const repository of repositories) {
        const fullName = repository.full_name;
        const owner = repository.owner?.login || dto.accountLogin;
        const name = repository.name;
        const defaultBranch = repository.default_branch || 'main';

        await this.prisma.repository.upsert({
          where: {
            fullName,
          },
          create: {
            orgId,
            githubInstallationId: installation.id,
            owner,
            name,
            fullName,
            defaultBranch,
          },
          update: {
            orgId,
            githubInstallationId: installation.id,
            owner,
            name,
            defaultBranch,
          },
        });

        syncedRepositories += 1;
      }

      if (repositories.length < 100) {
        break;
      }

      page += 1;
    }

    return {
      installation: {
        ...installation,
        installationId: installation.installationId.toString(),
      },
      syncedRepositories,
    };
  }

  async listRepos(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    return this.prisma.repository.findMany({
      where: { orgId },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createRepo(userId: string, orgId: string, dto: CreateRepositoryDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const installation = await this.prisma.githubInstallation.findFirst({
      where: {
        id: dto.githubInstallationId,
        orgId,
      },
    });

    if (!installation) {
      throw new NotFoundException('GitHub installation not found for organization.');
    }

    return this.prisma.repository.create({
      data: {
        orgId,
        githubInstallationId: installation.id,
        owner: dto.owner,
        name: dto.name,
        fullName: `${dto.owner}/${dto.name}`,
        defaultBranch: dto.defaultBranch ?? 'main',
      },
    });
  }

  async updateRepo(userId: string, orgId: string, repoId: string, dto: UpdateRepositoryDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const repository = await this.prisma.repository.findFirst({
      where: { id: repoId, orgId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found for organization.');
    }

    return this.prisma.repository.update({
      where: { id: repoId },
      data: {
        defaultBranch: dto.defaultBranch,
      },
    });
  }

  async deleteRepo(userId: string, orgId: string, repoId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const repository = await this.prisma.repository.findFirst({
      where: { id: repoId, orgId },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found for organization.');
    }

    await this.prisma.repository.delete({
      where: { id: repoId },
    });

    return { deleted: true };
  }

  async listServices(userId: string, orgId: string): Promise<unknown> {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    return this.prisma.service.findMany({
      where: { orgId },
      include: {
        repository: true,
        policy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async assertServiceLimit(orgId: string) {
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    const limit = PLAN_LIMITS[org.billingPlan as BillingPlan];
    if (limit !== null && org._count.services >= limit) {
      throw new BadRequestException(
        `Plan limit reached for ${org.billingPlan}. Maximum ${limit} services allowed.`,
      );
    }
  }

  private async assertActiveSubscription(orgId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { orgId },
      select: {
        status: true,
      },
    });

    if (!subscription?.status || !ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
      throw new BadRequestException(
        'An active subscription is required before creating services. Please start billing checkout.',
      );
    }
  }

  async createService(userId: string, orgId: string, dto: CreateServiceDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    await this.assertActiveSubscription(orgId);
    await this.assertServiceLimit(orgId);

    const repository = await this.prisma.repository.findFirst({
      where: {
        id: dto.repositoryId,
        orgId,
      },
    });

    if (!repository) {
      throw new NotFoundException('Repository not found for organization.');
    }

    if (dto.contractSourceType === 'GITHUB_FILE' && !dto.contractPath) {
      throw new BadRequestException('contractPath is required for GITHUB_FILE source type.');
    }

    if (dto.contractSourceType === 'PUBLIC_URL' && !dto.contractUrlTemplate) {
      throw new BadRequestException('contractUrlTemplate is required for PUBLIC_URL source type.');
    }

    return this.prisma.service.create({
      data: {
        orgId,
        repositoryId: dto.repositoryId,
        name: dto.name,
        slug: dto.slug,
        contractSourceType: dto.contractSourceType,
        contractPath: dto.contractPath ?? null,
        contractUrlTemplate: dto.contractUrlTemplate ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateService(userId: string, orgId: string, serviceId: string, dto: UpdateServiceDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        orgId,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for organization.');
    }

    return this.prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        name: dto.name,
        slug: dto.slug,
        contractPath: dto.contractPath,
        contractUrlTemplate: dto.contractUrlTemplate,
        isActive: dto.isActive,
      },
    });
  }

  async deleteService(userId: string, orgId: string, serviceId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        orgId,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found for organization.');
    }

    await this.prisma.service.delete({
      where: {
        id: serviceId,
      },
    });

    return { deleted: true };
  }

  async getDefaultPolicy(userId: string, orgId: string): Promise<unknown> {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    let policy = await this.prisma.policy.findFirst({
      where: {
        orgId,
        serviceId: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!policy) {
      policy = await this.prisma.policy.create({
        data: {
          orgId,
          failOnBreaking: true,
          ruleOverrides: {},
        },
      });
    }

    return policy;
  }

  async updateDefaultPolicy(
    userId: string,
    orgId: string,
    dto: UpdatePolicyDto,
  ): Promise<unknown> {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const existing = (await this.getDefaultPolicy(userId, orgId)) as { id: string };

    return this.prisma.policy.update({
      where: {
        id: existing.id,
      },
      data: {
        failOnBreaking: dto.failOnBreaking,
        ruleOverrides: dto.ruleOverrides,
        updatedByUserId: userId,
      },
    });
  }

  async getServicePolicy(
    userId: string,
    orgId: string,
    serviceId: string,
  ): Promise<unknown> {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    return this.prisma.policy.findFirst({
      where: {
        orgId,
        serviceId,
      },
    });
  }

  async updateServicePolicy(
    userId: string,
    orgId: string,
    serviceId: string,
    dto: UpdatePolicyDto,
  ): Promise<unknown> {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const existing = await this.prisma.policy.findFirst({
      where: { orgId, serviceId },
    });

    if (existing) {
      return this.prisma.policy.update({
        where: { id: existing.id },
        data: {
          failOnBreaking: dto.failOnBreaking,
          ruleOverrides: dto.ruleOverrides,
          updatedByUserId: userId,
        },
      });
    }

    return this.prisma.policy.create({
      data: {
        orgId,
        serviceId,
        failOnBreaking: dto.failOnBreaking ?? true,
        ruleOverrides: dto.ruleOverrides ?? {},
        updatedByUserId: userId,
      },
    });
  }

  async listChecks(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    const checks = await this.prisma.checkRun.findMany({
      where: { orgId },
      include: {
        service: true,
        repository: true,
        _count: {
          select: {
            issues: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return checks.map((check) => ({
      ...check,
      githubCheckRunId: check.githubCheckRunId?.toString() ?? null,
      githubCommentId: check.githubCommentId?.toString() ?? null,
    }));
  }

  async getCheck(userId: string, orgId: string, checkId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    const check = await this.prisma.checkRun.findFirst({
      where: {
        id: checkId,
        orgId,
      },
      include: {
        service: true,
        repository: true,
        issues: true,
      },
    });

    if (!check) {
      throw new NotFoundException('Check run not found.');
    }

    return {
      ...check,
      githubCheckRunId: check.githubCheckRunId?.toString() ?? null,
      githubCommentId: check.githubCommentId?.toString() ?? null,
    };
  }

  async listWaivers(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    return this.prisma.waiver.findMany({
      where: {
        orgId,
      },
      include: {
        service: true,
        repository: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    });
  }

  async createWaiver(userId: string, orgId: string, dto: CreateWaiverDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const expiresAt = new Date(dto.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt value.');
    }

    if (expiresAt <= new Date()) {
      throw new BadRequestException('Waiver expiry must be in the future.');
    }

    if (dto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: {
          id: dto.serviceId,
          orgId,
        },
      });
      if (!service) {
        throw new NotFoundException('Service not found for organization.');
      }
    }

    if (dto.repositoryId) {
      const repository = await this.prisma.repository.findFirst({
        where: {
          id: dto.repositoryId,
          orgId,
        },
      });
      if (!repository) {
        throw new NotFoundException('Repository not found for organization.');
      }
    }

    return this.prisma.waiver.create({
      data: {
        orgId,
        serviceId: dto.serviceId,
        repositoryId: dto.repositoryId,
        pullRequestNumber: dto.pullRequestNumber,
        reason: dto.reason,
        expiresAt,
        createdByUserId: userId,
      },
    });
  }

  async updateWaiver(
    userId: string,
    orgId: string,
    waiverId: string,
    dto: UpdateWaiverDto,
  ) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const waiver = await this.prisma.waiver.findFirst({
      where: {
        id: waiverId,
        orgId,
      },
    });

    if (!waiver) {
      throw new NotFoundException('Waiver not found for organization.');
    }

    if (dto.serviceId) {
      const service = await this.prisma.service.findFirst({
        where: {
          id: dto.serviceId,
          orgId,
        },
      });
      if (!service) {
        throw new NotFoundException('Service not found for organization.');
      }
    }

    if (dto.repositoryId) {
      const repository = await this.prisma.repository.findFirst({
        where: {
          id: dto.repositoryId,
          orgId,
        },
      });
      if (!repository) {
        throw new NotFoundException('Repository not found for organization.');
      }
    }

    let nextExpiresAt: Date | undefined;
    if (dto.expiresAt !== undefined) {
      nextExpiresAt = new Date(dto.expiresAt);
      if (Number.isNaN(nextExpiresAt.getTime())) {
        throw new BadRequestException('Invalid expiresAt value.');
      }

      if (nextExpiresAt <= new Date()) {
        throw new BadRequestException('Waiver expiry must be in the future.');
      }
    }

    return this.prisma.waiver.update({
      where: {
        id: waiverId,
      },
      data: {
        serviceId: dto.serviceId === undefined ? undefined : dto.serviceId,
        repositoryId: dto.repositoryId === undefined ? undefined : dto.repositoryId,
        pullRequestNumber:
          dto.pullRequestNumber === undefined ? undefined : dto.pullRequestNumber,
        reason: dto.reason,
        expiresAt: nextExpiresAt,
      },
      include: {
        service: true,
        repository: true,
      },
    });
  }

  async deleteWaiver(userId: string, orgId: string, waiverId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const waiver = await this.prisma.waiver.findFirst({
      where: {
        id: waiverId,
        orgId,
      },
    });

    if (!waiver) {
      throw new NotFoundException('Waiver not found for organization.');
    }

    await this.prisma.waiver.delete({
      where: {
        id: waiverId,
      },
    });

    return { deleted: true };
  }

  async listNotifications(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    return this.prisma.notification.findMany({
      where: {
        orgId,
        OR: [{ userId: null }, { userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    });
  }

  async getNotificationPreferences(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: {
        emailOnPrFailure: true,
      },
    });

    return org;
  }

  async updateNotificationPreferences(
    userId: string,
    orgId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        emailOnPrFailure: dto.emailOnPrFailure,
      },
      select: {
        emailOnPrFailure: true,
      },
    });
  }

  async markNotificationsRead(userId: string, orgId: string, dto: MarkNotificationsReadDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'MEMBER');

    const where = dto.ids?.length
      ? {
          id: { in: dto.ids },
          orgId,
          OR: [{ userId: null }, { userId }],
        }
      : {
          orgId,
          OR: [{ userId: null }, { userId }],
          readAt: null,
        };

    const result = await this.prisma.notification.updateMany({
      where,
      data: {
        readAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  async listMembers(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    return this.prisma.organizationMember.findMany({
      where: { orgId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async addMember(userId: string, orgId: string, dto: CreateMemberDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const invited = await this.prisma.user.upsert({
      where: { email: dto.email.toLowerCase() },
      update: {
        name: dto.name,
      },
      create: {
        email: dto.email.toLowerCase(),
        name: dto.name,
      },
    });

    return this.prisma.organizationMember.upsert({
      where: {
        orgId_userId: {
          orgId,
          userId: invited.id,
        },
      },
      update: {
        role: dto.role,
      },
      create: {
        orgId,
        userId: invited.id,
        role: dto.role,
      },
      include: {
        user: true,
      },
    });
  }

  async updateMember(userId: string, orgId: string, memberId: string, dto: UpdateMemberDto) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        orgId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found for organization.');
    }

    return this.prisma.organizationMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: dto.role,
      },
      include: {
        user: true,
      },
    });
  }

  async removeMember(userId: string, orgId: string, memberId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        orgId,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found for organization.');
    }

    await this.prisma.organizationMember.delete({
      where: {
        id: memberId,
      },
    });

    return { deleted: true };
  }

  async getBilling(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'VIEWER');

    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      include: {
        subscription: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    const limit = PLAN_LIMITS[org.billingPlan as BillingPlan];

    return {
      orgId,
      plan: org.billingPlan,
      serviceLimit: limit,
      serviceCount: org._count.services,
      stripeCustomerId: org.subscription?.stripeCustomerId ?? null,
      stripeSubscriptionId: org.subscription?.stripeSubscriptionId ?? null,
      status: org.subscription?.status ?? null,
      currentPeriodEnd: org.subscription?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: org.subscription?.cancelAtPeriodEnd ?? false,
    };
  }

  async createCheckoutSession(
    userId: string,
    orgId: string,
    dto: CreateCheckoutSessionDto,
  ) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    if (!this.stripe) {
      return {
        checkoutUrl: 'https://dashboard.stripe.com/test/checkout',
        mode: 'mock',
      };
    }

    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      include: {
        subscription: true,
      },
    });

    const plan = dto.plan ?? 'GROWTH';
    const billingCycle = dto.billingCycle ?? 'MONTHLY';
    const priceIdByPlan: Record<
      string,
      {
        MONTHLY?: string;
        YEARLY?: string;
      }
    > = {
      STARTER: {
        MONTHLY: process.env.STRIPE_PRICE_ID_STARTER,
        YEARLY: process.env.STRIPE_PRICE_ID_STARTER_YEARLY,
      },
      GROWTH: {
        MONTHLY: process.env.STRIPE_PRICE_ID_GROWTH,
        YEARLY: process.env.STRIPE_PRICE_ID_GROWTH_YEARLY,
      },
      ENTERPRISE: {
        MONTHLY: process.env.STRIPE_PRICE_ID_ENTERPRISE,
        YEARLY: process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY,
      },
    };

    const priceId = priceIdByPlan[plan]?.[billingCycle];

    if (!priceId) {
      throw new BadRequestException(
        `Stripe price id is not configured for ${plan} (${billingCycle.toLowerCase()}).`,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: dto.successUrl ?? process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:4000/app',
      cancel_url: dto.cancelUrl ?? process.env.STRIPE_CANCEL_URL ?? 'http://localhost:4000/app',
      payment_method_collection: 'always',
      customer: org.subscription?.stripeCustomerId ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data:
        org.subscription?.stripeSubscriptionId
          ? undefined
          : {
              trial_period_days: 3,
            },
      metadata: {
        orgId,
        requestedPlan: plan,
        requestedBillingCycle: billingCycle,
      },
    });

    return {
      checkoutUrl: session.url,
      mode: 'live',
      sessionId: session.id,
    };
  }

  async createPortalSession(userId: string, orgId: string) {
    await this.rbac.requireOrgRole(userId, orgId, 'ADMIN');

    const subscription = await this.prisma.subscription.findUnique({
      where: { orgId },
    });

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found for this organization.');
    }

    if (!this.stripe) {
      return {
        portalUrl: 'https://dashboard.stripe.com/test/customers',
        mode: 'mock',
      };
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: process.env.STRIPE_PORTAL_RETURN_URL ?? 'http://localhost:4000/app',
    });

    return {
      portalUrl: session.url,
      mode: 'live',
    };
  }
}
