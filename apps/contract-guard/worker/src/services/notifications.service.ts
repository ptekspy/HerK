import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

import { PrismaService } from './prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resend: Resend | null;

  constructor(private readonly prisma: PrismaService) {
    this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }

  private async sendNotificationEmails(args: {
    orgId: string;
    notificationId: string;
    title: string;
    body: string;
    link?: string | null;
  }) {
    const members = await this.prisma.organizationMember.findMany({
      where: { orgId: args.orgId },
      include: { user: true },
    });

    const emails = members
      .map((member) => member.user.email)
      .filter((email): email is string => Boolean(email));

    if (!emails.length) {
      return;
    }

    await this.prisma.emailDelivery.createMany({
      data: emails.map((email) => ({
        orgId: args.orgId,
        notificationId: args.notificationId,
        recipientEmail: email,
        subject: args.title,
        provider: 'RESEND',
        status: 'PENDING',
      })),
    });

    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY is not set. Email deliveries are recorded as pending.');
      return;
    }

    const from = process.env.RESEND_FROM_EMAIL ?? 'API Contract Guard <alerts@contractguard.local>';

    for (const recipientEmail of emails) {
      try {
        const result = await this.resend.emails.send({
          from,
          to: recipientEmail,
          subject: args.title,
          html: `<p>${args.body}</p>${
            args.link ? `<p><a href="${args.link}">View details</a></p>` : ''
          }`,
        });

        await this.prisma.emailDelivery.updateMany({
          where: {
            orgId: args.orgId,
            notificationId: args.notificationId,
            recipientEmail,
          },
          data: {
            status: 'SENT',
            providerMessageId: result.data?.id ?? null,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown resend error';
        this.logger.error(message);

        await this.prisma.emailDelivery.updateMany({
          where: {
            orgId: args.orgId,
            notificationId: args.notificationId,
            recipientEmail,
          },
          data: {
            status: 'FAILED',
            errorMessage: message,
          },
        });
      }
    }
  }

  async createOrgNotification(args: {
    orgId: string;
    kind: string;
    title: string;
    body: string;
    link?: string | null;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        orgId: args.orgId,
        kind: args.kind,
        title: args.title,
        body: args.body,
        link: args.link ?? null,
      },
    });

    await this.sendNotificationEmails({
      orgId: args.orgId,
      notificationId: notification.id,
      title: args.title,
      body: args.body,
      link: args.link,
    });
  }

  async createCheckNotification(args: {
    orgId: string;
    title: string;
    body: string;
    link: string;
    severity: 'PASS' | 'WARN' | 'FAIL' | 'ERROR';
  }) {
    if (args.severity === 'PASS') {
      return;
    }

    const org = await this.prisma.organization.findUnique({
      where: {
        id: args.orgId,
      },
      select: {
        emailOnPrFailure: true,
      },
    });

    const notification = await this.prisma.notification.create({
      data: {
        orgId: args.orgId,
        kind: `CHECK_${args.severity}`,
        title: args.title,
        body: args.body,
        link: args.link,
      },
    });

    if (!org?.emailOnPrFailure) {
      return;
    }

    await this.sendNotificationEmails({
      orgId: args.orgId,
      notificationId: notification.id,
      title: args.title,
      body: args.body,
      link: args.link,
    });
  }
}
