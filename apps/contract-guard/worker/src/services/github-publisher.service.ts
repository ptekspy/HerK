import { Injectable, Logger } from '@nestjs/common';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { PrAnalysisJobPayload } from '@herk/api';

import { ComputedIssue } from './diff-engine.service';

interface PublishInput {
  payload: PrAnalysisJobPayload;
  checkRunId: string;
  githubCheckRunId: bigint | null;
  githubCommentId: bigint | null;
  serviceName: string;
  conclusion: 'PASS' | 'WARN' | 'FAIL' | 'ERROR';
  summary: string;
  issues: Array<ComputedIssue & { isWaived: boolean }>;
}

@Injectable()
export class GithubPublisherService {
  private readonly logger = new Logger(GithubPublisherService.name);

  private async buildInstallationClient(installationId: number) {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      return null;
    }

    const auth = createAppAuth({
      appId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });

    const installationAuth = await auth({
      type: 'installation',
      installationId,
    });

    return new Octokit({ auth: installationAuth.token });
  }

  private buildMarkdownReport(
    serviceName: string,
    summary: string,
    issues: Array<ComputedIssue & { isWaived: boolean }>,
  ): string {
    if (!issues.length) {
      return `### API Contract Guard report for ${serviceName}\n\n${summary}`;
    }

    const lines = issues.map((issue) => {
      const waivedText = issue.isWaived ? ' (waived)' : '';
      return `- **${issue.ruleCode}**${waivedText}: ${issue.title}`;
    });

    return [
      `### API Contract Guard report for ${serviceName}`,
      '',
      summary,
      '',
      ...lines,
    ].join('\n');
  }

  async publish(input: PublishInput) {
    const octokit = await this.buildInstallationClient(input.payload.githubInstallationId);
    if (!octokit) {
      this.logger.warn('Skipping GitHub publish because app credentials are not configured.');
      return { githubCheckRunId: input.githubCheckRunId, githubCommentId: input.githubCommentId };
    }

    const output = {
      title: 'API Contract Guard analysis',
      summary: input.summary,
      text: this.buildMarkdownReport(input.serviceName, input.summary, input.issues),
    };

    let nextCheckRunId = input.githubCheckRunId;

    const checkStatus = input.conclusion === 'ERROR' ? 'completed' : 'completed';
    const checkConclusion =
      input.conclusion === 'FAIL'
        ? 'failure'
        : input.conclusion === 'WARN'
          ? 'neutral'
          : input.conclusion === 'ERROR'
            ? 'timed_out'
            : 'success';

    if (input.githubCheckRunId) {
      await octokit.rest.checks.update({
        owner: input.payload.repositoryOwner,
        repo: input.payload.repositoryName,
        check_run_id: Number(input.githubCheckRunId),
        status: checkStatus,
        conclusion: checkConclusion,
        completed_at: new Date().toISOString(),
        output,
      });
    } else {
      const created = await octokit.rest.checks.create({
        owner: input.payload.repositoryOwner,
        repo: input.payload.repositoryName,
        name: `API Contract Guard / ${input.serviceName}`,
        head_sha: input.payload.headSha,
        status: checkStatus,
        conclusion: checkConclusion,
        completed_at: new Date().toISOString(),
        output,
      });
      nextCheckRunId = BigInt(created.data.id);
    }

    const commentBody = this.buildMarkdownReport(input.serviceName, input.summary, input.issues);
    let nextCommentId = input.githubCommentId;

    if (input.githubCommentId) {
      await octokit.rest.issues.updateComment({
        owner: input.payload.repositoryOwner,
        repo: input.payload.repositoryName,
        comment_id: Number(input.githubCommentId),
        body: commentBody,
      });
    } else {
      const comment = await octokit.rest.issues.createComment({
        owner: input.payload.repositoryOwner,
        repo: input.payload.repositoryName,
        issue_number: input.payload.pullRequestNumber,
        body: commentBody,
      });

      nextCommentId = BigInt(comment.data.id);
    }

    return {
      githubCheckRunId: nextCheckRunId,
      githubCommentId: nextCommentId,
    };
  }
}
