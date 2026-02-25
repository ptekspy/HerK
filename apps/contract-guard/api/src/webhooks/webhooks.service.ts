import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@herk/db';
import { PrAnalysisJobPayload } from '@herk/api';
import Stripe from 'stripe';

import { PrismaService } from '../common/prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

interface GithubPullRequestEvent {
  action: string;
  pull_request?: {
    number: number;
    head: { sha: string };
    base: { sha: string };
  };
  repository?: {
    owner?: { login: string };
    name?: string;
    full_name?: string;
    default_branch?: string;
  };
  installation?: {
    id: number;
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

  async handleGithubWebhook(
    eventName: string,
    deliveryId: string,
    payload: GithubPullRequestEvent,
  ) {
    const record = await this.saveWebhookEvent('GITHUB', deliveryId, eventName, payload);

    if (!record) {
      return { ok: true, duplicate: true };
    }

    if (eventName !== 'pull_request') {
      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { ok: true, ignored: true };
    }

    if (!payload.pull_request || !payload.repository || !payload.installation) {
      throw new BadRequestException('Missing pull request payload details.');
    }

    if (!['opened', 'synchronize', 'reopened'].includes(payload.action)) {
      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

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
      await this.prisma.webhookEvent.update({
        where: { id: record.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

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

    await this.prisma.webhookEvent.update({
      where: { id: record.id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

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
