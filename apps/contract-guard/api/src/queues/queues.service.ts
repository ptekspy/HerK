import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrAnalysisJobPayload } from '@herk/api';

import { PR_ANALYSIS_QUEUE } from './queue.constants';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue(PR_ANALYSIS_QUEUE)
    private readonly prAnalysisQueue: Queue,
  ) {}

  async enqueuePrAnalysis(payload: PrAnalysisJobPayload) {
    return this.prAnalysisQueue.add('analyze-pull-request', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2_000,
      },
      removeOnComplete: {
        age: 86_400,
        count: 500,
      },
      removeOnFail: {
        age: 172_800,
      },
    });
  }
}
