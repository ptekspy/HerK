import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { EMAIL_NOTIFICATIONS_QUEUE, PR_ANALYSIS_QUEUE } from './queue.constants';
import { QueuesService } from './queues.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PR_ANALYSIS_QUEUE,
    }),
    BullModule.registerQueue({
      name: EMAIL_NOTIFICATIONS_QUEUE,
    }),
  ],
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}
