import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@herk/db-contract-guard';
import { PrAnalysisJobPayload } from '@herk/api';
import Stripe from 'stripe';

import { PrismaService } from '../common/prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

interface GithubRepositoryPayload {
  owner?: { login?: string };
  name?: string;
  full_name?: string;
  default_branch?: string;
}

interface GithubWebhookPayload {
  action: string;
  pull_request?: {
    number: number;
    head: { sha: string };
    base: { sha: string };
  };
  repository?: GithubRepositoryPayload;
  repositories_added?: GithubRepositoryPayload[];
  repositories_removed?: GithubRepositoryPayload[];
  installation?: {
    id: number;
    account?: {
      login?: string;
    };
  };
  account?: {
    login?: string;
  };
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly queues: QueuesService,
  ) {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-08-27.basil',
        })
      : null;
  }

  private toJsonValue(payload: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue;
  }

  verifyGithubSignature(rawBody: Buffer | string, signature: string | undefined) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return;
    }

    if (!signature) {
      throw new UnauthorizedException('Missing GitHub signature header.');
    }

    const payloadBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
    const digest = createHmac('sha256', secret).update(payloadBuffer).digest('hex');
    const expected = Buffer.from(`sha256=${digest}`);
    const actual = Buffer.from(signature);

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new UnauthorizedException('Invalid GitHub webhook signature.');
    }
  }

  private async saveWebhookEvent(
    provider: 'GITHUB' | 'STRIPE',
    deliveryId: string | null,
    eventType: string,
    payload: unknown,
  ) {
    try {
      return await this.prisma.webhookEvent.create({
        data: {
          provider,
          deliveryId,
          eventType,
          payload: this.toJsonValue(payload),
        },
      });
    } catch {
      return null;
    }
  }

  private async markGithubWebhookProcessed(recordId: string) {
    await this.prisma.webhookEvent.update({
      where: { id: recordId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  }

  private async handleGithubInstallationEvent(
    recordId: string,
    payload: GithubWebhookPayload,
  ) {
    if (!payload.installation?.id) {
      throw new BadRequestException('Missing installation payload details.');
    }

    const installationId = BigInt(payload.installation.id);
    const accountLogin = payload.installation.account?.login ?? payload.account?.login ?? '';

    if (payload.action === 'deleted') {
      await this.prisma.githubInstallation.deleteMany({
        where: {
          installationId,
        },
      });

      await this.markGithubWebhookProcessed(recordId);
      return { ok: true, deletedInstallationId: payload.installation.id };
    }

    const org = accountLogin
      ? await this.prisma.organization.findFirst({
          where: {
            slug: accountLogin.toLowerCase(),
          },
        })
      : null;

    if (!org) {
      await this.markGithubWebhookProcessed(recordId);
      return { ok: true, ignored: true, reason: 'organization not mapped yet' };
    }

    const installation = await this.prisma.githubInstallation.upsert({
      where: {
        installationId,
      },
      create: {
        orgId: org.id,
        installationId,
        accountLogin: accountLogin.toLowerCase(),
      },
      update: {
        orgId: org.id,
        accountLogin: accountLogin.toLowerCase(),
      },
    });

    await this.markGithubWebhookProcessed(recordId);
    return { ok: true, installation };
  }

  private async handleGithubInstallationRepositoriesEvent(
    recordId: string,
    payload: GithubWebhookPayload,
  ) {
    if (!payload.installation?.id) {
      throw new BadRequestException('Missing installation payload details.');
    }

    const installationId = BigInt(payload.installation.id);
    const installation = await this.prisma.githubInstallation.findUnique({
      where: {
        installationId,
      },
    });

    if (!installation) {
      await this.markGithubWebhookProcessed(recordId);
      return { ok: true, ignored: true, reason: 'installation not mapped' };
    }

    let added = 0;
    let removed = 0;

    for (const repository of payload.repositories_added ?? []) {
      const fullName = repository.full_name;
      const name = repository.name;
      const owner = repository.owner?.login;

      if (!fullName || !name || !owner) {
        continue;
      }

      await this.prisma.repository.upsert({
        where: {
          fullName,
        },
        create: {
          orgId: installation.orgId,
          githubInstallationId: installation.id,
          owner,
          name,
          fullName,
          defaultBranch: repository.default_branch ?? 'main',
        },
        update: {
          orgId: installation.orgId,
          githubInstallationId: installation.id,
          owner,
          name,
          defaultBranch: repository.default_branch ?? 'main',
        },
      });
      added += 1;
    }

    const removedFullNames = (payload.repositories_removed ?? [])
      .map((repository) => repository.full_name)
      .filter((value): value is string => Boolean(value));

    if (removedFullNames.length > 0) {
      const deleted = await this.prisma.repository.deleteMany({
        where: {
          orgId: installation.orgId,
          githubInstallationId: installation.id,
          fullName: {
            in: removedFullNames,
          },
        },
      });
      removed = deleted.count;
    }

    await this.markGithubWebhookProcessed(recordId);
    return { ok: true, added, removed };
  }

  async handleGithubWebhook(
    eventName: string,
    deliveryId: string,
    payload: GithubWebhookPayload,
  ) {
    const record = await this.saveWebhookEvent('GITHUB', deliveryId, eventName, payload);

    if (!record) {
      return { ok: true, duplicate: true };
    }

    if (eventName === 'installation') {
      return this.handleGithubInstallationEvent(record.id, payload);
    }

    if (eventName === 'installation_repositories') {
      return this.handleGithubInstallationRepositoriesEvent(record.id, payload);
    }

    if (eventName !== 'pull_request') {
      await this.markGithubWebhookProcessed(record.id);
      return { ok: true, ignored: true };
    }

    if (!payload.pull_request || !payload.repository || !payload.installation) {
      throw new BadRequestException('Missing pull request payload details.');
    }

    if (!['opened', 'synchronize', 'reopened'].includes(payload.action)) {
      await this.markGithubWebhookProcessed(record.id);
      return { ok: true, ignored: true };
    }

    const installationId = BigInt(payload.installation.id);
    const fullName = payload.repository.full_name;

    if (!fullName) {
      throw new BadRequestException('Repository full_name is missing in payload.');
    }

    const repository = await this.prisma.repository.findFirst({
      where: {
        fullName,
        installation: {
          installationId,
        },
      },
      include: {
        installation: true,
        services: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!repository) {
      await this.markGithubWebhookProcessed(record.id);
      return { ok: true, ignored: true, reason: 'repository not configured' };
    }

    for (const service of repository.services) {
      const checkRun = await this.prisma.checkRun.create({
        data: {
          orgId: repository.orgId,
          repositoryId: repository.id,
          serviceId: service.id,
          pullRequestNumber: payload.pull_request.number,
          pullRequestHeadSha: payload.pull_request.head.sha,
          status: 'PENDING',
          summary: 'Queued for analysis',
        },
      });

      const jobPayload: PrAnalysisJobPayload = {
        orgId: repository.orgId,
        repositoryId: repository.id,
        serviceId: service.id,
        checkRunId: checkRun.id,
        pullRequestNumber: payload.pull_request.number,
        headSha: payload.pull_request.head.sha,
        baseSha: payload.pull_request.base.sha,
        githubInstallationId: Number(repository.installation.installationId),
        repositoryOwner: repository.owner,
        repositoryName: repository.name,
        defaultBranch: repository.defaultBranch,
      };

      await this.queues.enqueuePrAnalysis(jobPayload);
    }

    await this.markGithubWebhookProcessed(record.id);

    return {
      ok: true,
      queued: repository.services.length,
    };
  }

  verifyStripeEvent(rawBody: Buffer | string, signature: string | undefined) {
    if (!this.stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return null;
    }

    if (!signature) {
      throw new UnauthorizedException('Missing Stripe signature header.');
    }

    const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  }

  async handleStripeWebhook(event: Stripe.Event | null, rawPayload: unknown) {
    if (!event) {
      return { ok: true, ignored: true };
    }

    const record = await this.saveWebhookEvent('STRIPE', event.id, event.type, rawPayload);
    if (!record) {
      return { ok: true, duplicate: true };
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;

        if (orgId) {
          await this.prisma.subscription.upsert({
            where: { orgId },
            create: {
              orgId,
              stripeCustomerId:
                typeof session.customer === 'string' ? session.customer : null,
              stripeSubscriptionId:
                typeof session.subscription === 'string' ? session.subscription : null,
              status: 'ACTIVE',
            },
            update: {
              stripeCustomerId:
                typeof session.customer === 'string' ? session.customer : null,
              stripeSubscriptionId:
                typeof session.subscription === 'string' ? session.subscription : null,
              status: 'ACTIVE',
            },
          });
        }
      }

      if (
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted'
      ) {
        const sub = event.data.object as Stripe.Subscription;

        const existing = await this.prisma.subscription.findFirst({
          where: {
            stripeSubscriptionId: sub.id,
          },
        });

        if (existing) {
          await this.prisma.subscription.update({
            where: { id: existing.id },
            data: {
              status:
                sub.status === 'active'
                  ? 'ACTIVE'
                  : sub.status === 'trialing'
                    ? 'TRIALING'
                    : sub.status === 'past_due'
                      ? 'PAST_DUE'
                      : sub.status === 'canceled'
                        ? 'CANCELED'
                        : 'INCOMPLETE',
              currentPeriodEnd: sub.items.data[0]
                ? new Date(sub.items.data[0].current_period_end * 1000)
                : null,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          });
        }
      }

      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown stripe webhook error';
      this.logger.error(message);

      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: {
          status: 'FAILED',
          errorMessage: message,
        },
      });

      throw new InternalServerErrorException(message);
    }
  }
}
