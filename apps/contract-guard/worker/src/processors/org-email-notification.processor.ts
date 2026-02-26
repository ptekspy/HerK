import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OrgEmailNotificationJobPayload } from '@herk/api';
import { Job } from 'bullmq';

import { NotificationsService } from '../services/notifications.service';

@Injectable()
@Processor('email-notifications')
export class OrgEmailNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(OrgEmailNotificationProcessor.name);

  constructor(private readonly notifications: NotificationsService) {
    super();
  }

  async process(job: Job<OrgEmailNotificationJobPayload>) {
    try {
      await this.notifications.createOrgNotification(job.data);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown org email notification error';
      this.logger.error(message);
      throw error;
    }
  }
}
