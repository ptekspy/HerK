import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrAnalysisJobPayload } from '@herk/api';

import { PrismaService } from '../services/prisma.service';
import { ContractSourceService } from '../services/contract-source.service';
import { DiffEngineService } from '../services/diff-engine.service';
import { GithubPublisherService } from '../services/github-publisher.service';
import { NotificationsService } from '../services/notifications.service';
import { PolicyEngineService } from '../services/policy-engine.service';

@Injectable()
@Processor('pr-analysis')
export class PrAnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(PrAnalysisProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contractSourceService: ContractSourceService,
    private readonly diffEngineService: DiffEngineService,
    private readonly policyEngine: PolicyEngineService,
    private readonly githubPublisher: GithubPublisherService,
    private readonly notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<PrAnalysisJobPayload>) {
    const payload = job.data;

    const checkRun = await this.prisma.checkRun.findUnique({
      where: {
        id: payload.checkRunId,
      },
      include: {
        service: {
          include: {
            policy: true,
          },
        },
        repository: true,
      },
    });

    if (!checkRun) {
      this.logger.warn(`Missing check run ${payload.checkRunId}. Skipping job.`);
      return;
    }

    await this.prisma.checkRun.update({
      where: { id: checkRun.id },
      data: {
        status: 'RUNNING',
        summary: 'Running OpenAPI diff analysis',
      },
    });

    try {
      let baselineContract: string;
      let candidateContract: string;

      if (checkRun.service.contractSourceType === 'GITHUB_FILE') {
        if (!checkRun.service.contractPath) {
          throw new Error('Service is configured as GITHUB_FILE but contractPath is empty.');
        }

        baselineContract = await this.contractSourceService.fetchGithubFile(
          payload,
          checkRun.service.contractPath,
          payload.defaultBranch,
        );

        candidateContract = await this.contractSourceService.fetchGithubFile(
          payload,
          checkRun.service.contractPath,
          payload.headSha,
        );
      } else {
        if (!checkRun.service.contractUrlTemplate) {
          throw new Error(
            'Service is configured as PUBLIC_URL but contractUrlTemplate is empty.',
          );
        }

        baselineContract = await this.contractSourceService.fetchPublicUrl(
          payload,
          checkRun.service.contractUrlTemplate,
          true,
        );

        candidateContract = await this.contractSourceService.fetchPublicUrl(
          payload,
          checkRun.service.contractUrlTemplate,
          false,
        );
      }

      const rawIssues = this.diffEngineService.computeDiff(baselineContract, candidateContract);

      const orgPolicy = await this.prisma.policy.findFirst({
        where: {
          orgId: payload.orgId,
          serviceId: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const effectiveFailOnBreaking =
        checkRun.service.policy?.failOnBreaking ?? orgPolicy?.failOnBreaking ?? true;

      const effectiveRuleOverrides = {
        ...(orgPolicy?.ruleOverrides as Record<string, 'OFF' | 'WARN' | 'BLOCK'>),
        ...((checkRun.service.policy?.ruleOverrides as Record<string, 'OFF' | 'WARN' | 'BLOCK'>) ??
          {}),
      };

      const waivers = await this.prisma.waiver.findMany({
        where: {
          orgId: payload.orgId,
          expiresAt: {
            gt: new Date(),
          },
          OR: [
            {
              serviceId: null,
            },
            {
              serviceId: payload.serviceId,
            },
          ],
        },
      });

      const policy = this.policyEngine.apply(
        rawIssues,
        effectiveFailOnBreaking,
        effectiveRuleOverrides,
        waivers,
        {
          serviceId: payload.serviceId,
          repositoryId: payload.repositoryId,
          pullRequestNumber: payload.pullRequestNumber,
        },
      );

      await this.prisma.$transaction([
        this.prisma.diffIssue.deleteMany({
          where: {
            checkRunId: checkRun.id,
          },
        }),
        this.prisma.diffIssue.createMany({
          data: policy.issues.map((issue) => ({
            checkRunId: checkRun.id,
            ruleCode: issue.ruleCode,
            title: issue.title,
            path: issue.path,
            beforeValue: issue.beforeValue,
            afterValue: issue.afterValue,
            severity: issue.severity,
            isBreaking: issue.isBreaking,
            isWaived: issue.isWaived,
          })),
        }),
      ]);

      const githubResult = await this.githubPublisher.publish({
        payload,
        checkRunId: checkRun.id,
        githubCheckRunId: checkRun.githubCheckRunId,
        githubCommentId: checkRun.githubCommentId,
        serviceName: checkRun.service.name,
        conclusion: policy.conclusion,
        summary: policy.summary,
        issues: policy.issues,
      });

      await this.prisma.checkRun.update({
        where: {
          id: checkRun.id,
        },
        data: {
          status: 'COMPLETED',
          conclusion: policy.conclusion,
          summary: policy.summary,
          githubCheckRunId: githubResult.githubCheckRunId,
          githubCommentId: githubResult.githubCommentId,
        },
      });

      await this.notifications.createCheckNotification({
        orgId: payload.orgId,
        title: `ContractGuard ${policy.conclusion} for ${checkRun.service.name}`,
        body: policy.summary,
        link: `/app/${payload.orgId}/checks/${checkRun.id}`,
        severity: policy.conclusion,
      });

      return {
        conclusion: policy.conclusion,
        issueCount: policy.issues.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown analysis error';
      this.logger.error(message);

      await this.prisma.checkRun.update({
        where: {
          id: checkRun.id,
        },
        data: {
          status: 'FAILED',
          conclusion: 'ERROR',
          summary: message,
        },
      });

      await this.notifications.createCheckNotification({
        orgId: payload.orgId,
        title: `ContractGuard ERROR for ${checkRun.service.name}`,
        body: message,
        link: `/app/${payload.orgId}/checks/${checkRun.id}`,
        severity: 'ERROR',
      });

      throw error;
    }
  }
}
