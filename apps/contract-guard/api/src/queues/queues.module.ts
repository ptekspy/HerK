import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PR_ANALYSIS_QUEUE } from './queue.constants';
import { QueuesService } from './queues.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PR_ANALYSIS_QUEUE,
    }),
  ],
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}
