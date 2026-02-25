import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './services/prisma.module';
import { PrAnalysisProcessor } from './processors/pr-analysis.processor';
import { ContractSourceService } from './services/contract-source.service';
import { DiffEngineService } from './services/diff-engine.service';
import { GithubPublisherService } from './services/github-publisher.service';
import { NotificationsService } from './services/notifications.service';
import { PolicyEngineService } from './services/policy-engine.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', '127.0.0.1'),
          port: Number(configService.get('REDIS_PORT', '6379')),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'pr-analysis',
    }),
    PrismaModule,
  ],
  providers: [
    PrAnalysisProcessor,
    ContractSourceService,
    DiffEngineService,
    PolicyEngineService,
    GithubPublisherService,
    NotificationsService,
  ],
})
export class WorkerModule {}
