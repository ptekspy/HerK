import { Injectable } from '@nestjs/common';

import { ComputedIssue } from './diff-engine.service';

interface ActiveWaiver {
  id: string;
  serviceId: string | null;
  repositoryId: string | null;
  pullRequestNumber: number | null;
  expiresAt: Date;
}

export interface PolicyResult {
  issues: Array<ComputedIssue & { isWaived: boolean }>;
  conclusion: 'PASS' | 'WARN' | 'FAIL';
  summary: string;
}

@Injectable()
export class PolicyEngineService {
  apply(
    issues: ComputedIssue[],
    failOnBreaking: boolean,
    ruleOverrides: Record<string, 'OFF' | 'WARN' | 'BLOCK'>,
    waivers: ActiveWaiver[],
    context: {
      serviceId: string;
      repositoryId: string;
      pullRequestNumber: number;
    },
  ): PolicyResult {
    let hasBlockingIssue = false;
    let hasWarningIssue = false;

    const now = new Date();

    const resolvedIssues = issues.map((issue) => {
      const waived = waivers.some((waiver) => {
        if (waiver.expiresAt <= now) {
          return false;
        }

        const serviceMatches = !waiver.serviceId || waiver.serviceId === context.serviceId;
        const repositoryMatches =
          !waiver.repositoryId || waiver.repositoryId === context.repositoryId;
        const prMatches =
          !waiver.pullRequestNumber || waiver.pullRequestNumber === context.pullRequestNumber;

        return serviceMatches && repositoryMatches && prMatches;
      });

      if (waived) {
        return {
          ...issue,
          isWaived: true,
        };
      }

      const override = ruleOverrides[issue.ruleCode];

      if (override === 'OFF') {
        return {
          ...issue,
          isWaived: false,
        };
      }

      if (override === 'WARN') {
        hasWarningIssue = true;
        return {
          ...issue,
          isWaived: false,
        };
      }

      if (override === 'BLOCK') {
        hasBlockingIssue = true;
        return {
          ...issue,
          isWaived: false,
        };
      }

      if (issue.isBreaking && failOnBreaking) {
        hasBlockingIssue = true;
      } else if (issue.isBreaking) {
        hasWarningIssue = true;
      }

      return {
        ...issue,
        isWaived: false,
      };
    });

    const activeCount = resolvedIssues.filter((issue) => !issue.isWaived).length;

    if (hasBlockingIssue) {
      return {
        issues: resolvedIssues,
        conclusion: 'FAIL',
        summary: `${activeCount} active issue(s) detected. Blocking merge.`,
      };
    }

    if (hasWarningIssue) {
      return {
        issues: resolvedIssues,
        conclusion: 'WARN',
        summary: `${activeCount} active issue(s) detected. Merge allowed with warning.`,
      };
    }

    return {
      issues: resolvedIssues,
      conclusion: 'PASS',
      summary: resolvedIssues.length === 0 ? 'No contract changes detected.' : 'All issues waived.',
    };
  }
}
