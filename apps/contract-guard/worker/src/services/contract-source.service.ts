import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { PrAnalysisJobPayload } from '@herk/api';

@Injectable()
export class ContractSourceService {
  private async buildInstallationClient(installationId: number) {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      throw new InternalServerErrorException(
        'GitHub App credentials are missing. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY.',
      );
    }

    const auth = createAppAuth({
      appId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });

    const installationAuth = await auth({
      type: 'installation',
      installationId,
    });

    return new Octokit({
      auth: installationAuth.token,
    });
  }

  async fetchGithubFile(
    payload: PrAnalysisJobPayload,
    filePath: string,
    ref: string,
  ): Promise<string> {
    const octokit = await this.buildInstallationClient(payload.githubInstallationId);

    const response = await octokit.rest.repos.getContent({
      owner: payload.repositoryOwner,
      repo: payload.repositoryName,
      path: filePath,
      ref,
    });

    if (!('content' in response.data)) {
      throw new InternalServerErrorException(
        `Expected file content for ${filePath} at ref ${ref}, but received directory payload.`,
      );
    }

    return Buffer.from(response.data.content, 'base64').toString('utf-8');
  }

  private renderTemplate(template: string, payload: PrAnalysisJobPayload, baseline: boolean): string {
    const replacements: Record<string, string | number> = {
      pr: payload.pullRequestNumber,
      headSha: payload.headSha,
      baseSha: payload.baseSha,
      sha: baseline ? payload.baseSha : payload.headSha,
      mode: baseline ? 'baseline' : 'candidate',
      repositoryOwner: payload.repositoryOwner,
      repositoryName: payload.repositoryName,
    };

    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
      const value = replacements[key];
      return value === undefined ? '' : String(value);
    });
  }

  async fetchPublicUrl(
    payload: PrAnalysisJobPayload,
    template: string,
    baseline: boolean,
  ): Promise<string> {
    const url = this.renderTemplate(template, payload, baseline);
    const response = await fetch(url);

    if (!response.ok) {
      throw new InternalServerErrorException(`Failed to fetch contract URL ${url}.`);
    }

    return response.text();
  }
}
