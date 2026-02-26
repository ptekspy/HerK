import { createHash, randomBytes } from 'node:crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

import { PrismaService } from '../common/prisma/prisma.service';

interface GithubUserProfile {
  id: number;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  getCookieName() {
    return process.env.SESSION_COOKIE_NAME || 'cg_session';
  }

  shouldUseSecureCookies() {
    return process.env.NODE_ENV === 'production';
  }

  getFrontendFallbackUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:4000/app';
  }

  getAllowedRedirectOrigins() {
    const frontend = new URL(this.getFrontendFallbackUrl());
    const fromEnv = (process.env.AUTH_ALLOWED_REDIRECT_ORIGINS || frontend.origin)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return new Set(fromEnv);
  }

  private normalizeReturnTo(input?: string | null) {
    const fallback = this.getFrontendFallbackUrl();
    const fallbackUrl = new URL(fallback);

    if (!input) {
      return fallbackUrl.toString();
    }

    if (input.startsWith('/')) {
      return new URL(input, `${fallbackUrl.origin}/`).toString();
    }

    try {
      const parsed = new URL(input);
      if (this.getAllowedRedirectOrigins().has(parsed.origin)) {
        return parsed.toString();
      }
    } catch {
      // ignore malformed input and fallback
    }

    return fallbackUrl.toString();
  }

  private getGithubOAuthConfig() {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'GitHub OAuth credentials are missing. Set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET.',
      );
    }

    const redirectUri =
      process.env.GITHUB_OAUTH_REDIRECT_URI ||
      `${process.env.PUBLIC_API_URL || 'http://localhost:4001'}/auth/github/callback`;

    return {
      clientId,
      clientSecret,
      redirectUri,
    };
  }

  private getGithubAppInstallUrl() {
    const configuredInstallUrl = process.env.GITHUB_APP_INSTALL_URL?.trim();
    const hasPlaceholderInstallUrl =
      configuredInstallUrl &&
      (configuredInstallUrl.includes('<') || configuredInstallUrl.includes('>'));

    if (configuredInstallUrl && !hasPlaceholderInstallUrl) {
      return configuredInstallUrl;
    }

    const appSlug = process.env.GITHUB_APP_SLUG?.trim();
    const hasPlaceholderSlug = appSlug && (appSlug.includes('<') || appSlug.includes('>'));
    if (!appSlug) {
      throw new InternalServerErrorException(
        'GitHub App install URL is missing. Set GITHUB_APP_INSTALL_URL or GITHUB_APP_SLUG.',
      );
    }
    if (hasPlaceholderSlug) {
      throw new InternalServerErrorException(
        'GITHUB_APP_SLUG contains a placeholder value. Replace it with your real GitHub App slug.',
      );
    }

    return `https://github.com/apps/${appSlug}/installations/new`;
  }

  private async requireOrgAdminRole(userId: string, orgId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of this organization.');
    }

    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException('Owner or Admin role is required for GitHub App installation.');
    }
  }

  private getDefaultInstallReturnTo(orgId: string) {
    const frontendOrigin = new URL(this.getFrontendFallbackUrl()).origin;
    return new URL(`/app/${orgId}/repos`, `${frontendOrigin}/`).toString();
  }

  private appendInstallResult(
    returnTo: string | null | undefined,
    status: 'ok' | 'error' | 'pending',
    reason?: string,
  ) {
    const redirect = new URL(this.normalizeReturnTo(returnTo));
    redirect.searchParams.set('githubAppInstall', status);
    if (reason) {
      redirect.searchParams.set('githubAppInstallReason', reason);
    }
    return redirect.toString();
  }

  private async fetchInstallationAccountLogin(installationId: number) {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      return null;
    }

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      },
    });

    const installation = await octokit.rest.apps.getInstallation({
      installation_id: installationId,
    });

    const account = installation.data.account;

    if (!account) {
      return null;
    }

    if ('login' in account && typeof account.login === 'string') {
      return account.login;
    }

    if ('slug' in account && typeof account.slug === 'string') {
      return account.slug;
    }

    return null;
  }

  async startGithubOAuth(returnTo?: string) {
    const { clientId, redirectUri } = this.getGithubOAuthConfig();

    const state = randomBytes(24).toString('hex');
    const normalizedReturnTo = this.normalizeReturnTo(returnTo);

    await this.prisma.oAuthState.create({
      data: {
        state,
        provider: 'GITHUB',
        returnTo: normalizedReturnTo,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'read:user user:email');
    url.searchParams.set('state', state);
    url.searchParams.set('allow_signup', 'false');

    return url.toString();
  }

  async startGithubAppInstall(args: {
    userId: string;
    orgId: string;
    returnTo?: string;
  }) {
    if (!args.orgId) {
      throw new BadRequestException('orgId is required.');
    }

    await this.requireOrgAdminRole(args.userId, args.orgId);

    const state = randomBytes(24).toString('hex');
    const normalizedReturnTo = this.normalizeReturnTo(
      args.returnTo ?? this.getDefaultInstallReturnTo(args.orgId),
    );

    await this.prisma.githubAppInstallState.create({
      data: {
        state,
        orgId: args.orgId,
        userId: args.userId,
        returnTo: normalizedReturnTo,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const installUrl = new URL(this.getGithubAppInstallUrl());
    installUrl.searchParams.set('state', state);

    return installUrl.toString();
  }

  async completeGithubAppInstall(args: {
    state: string;
    installationId?: string;
    setupAction?: string;
  }) {
    if (!args.state) {
      throw new BadRequestException('GitHub App callback requires state.');
    }

    const installState = await this.prisma.githubAppInstallState.findUnique({
      where: {
        state: args.state,
      },
    });

    if (!installState || installState.consumedAt) {
      throw new UnauthorizedException('Invalid GitHub App installation state.');
    }

    if (installState.expiresAt <= new Date()) {
      await this.prisma.githubAppInstallState.update({
        where: {
          id: installState.id,
        },
        data: {
          consumedAt: new Date(),
          setupAction: args.setupAction,
        },
      });

      return {
        redirectTo: this.appendInstallResult(installState.returnTo, 'error', 'expired'),
      };
    }

    await this.requireOrgAdminRole(installState.userId, installState.orgId);

    const installationIdRaw = args.installationId;
    if (!installationIdRaw) {
      await this.prisma.githubAppInstallState.update({
        where: {
          id: installState.id,
        },
        data: {
          consumedAt: new Date(),
          setupAction: args.setupAction,
        },
      });

      return {
        redirectTo: this.appendInstallResult(installState.returnTo, 'pending', 'missing-installation-id'),
      };
    }

    const installationId = Number(installationIdRaw);
    if (!Number.isInteger(installationId) || installationId <= 0) {
      throw new BadRequestException('installation_id must be a positive integer.');
    }

    const accountLogin =
      (await this.fetchInstallationAccountLogin(installationId).catch(() => null)) ||
      `installation-${installationId}`;

    await this.prisma.githubInstallation.upsert({
      where: {
        installationId: BigInt(installationId),
      },
      create: {
        orgId: installState.orgId,
        installationId: BigInt(installationId),
        accountLogin,
      },
      update: {
        orgId: installState.orgId,
        accountLogin,
      },
    });

    await this.prisma.githubAppInstallState.update({
      where: {
        id: installState.id,
      },
      data: {
        consumedAt: new Date(),
        installationId: BigInt(installationId),
        setupAction: args.setupAction,
      },
    });

    return {
      redirectTo: this.appendInstallResult(installState.returnTo, 'ok'),
    };
  }

  private async exchangeCodeForToken(code: string, state: string) {
    const { clientId, clientSecret, redirectUri } = this.getGithubOAuthConfig();

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange GitHub OAuth code.');
    }

    const payload = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!payload.access_token) {
      throw new UnauthorizedException(payload.error_description || payload.error || 'GitHub OAuth token missing.');
    }

    return payload.access_token;
  }

  private async fetchGithubProfile(accessToken: string) {
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!profileResponse.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub user profile.');
    }

    const profile = (await profileResponse.json()) as GithubUserProfile;

    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const emails = emailResponse.ok
      ? ((await emailResponse.json()) as GithubEmail[])
      : ([] as GithubEmail[]);

    const preferredEmail =
      profile.email ||
      emails.find((item) => item.primary && item.verified)?.email ||
      emails.find((item) => item.verified)?.email ||
      emails[0]?.email ||
      null;

    return {
      profile,
      email: preferredEmail?.toLowerCase() ?? null,
    };
  }

  private async ensureDefaultOrgForUser(userId: string, email: string | null) {
    const membershipCount = await this.prisma.organizationMember.count({
      where: {
        userId,
      },
    });

    if (membershipCount > 0) {
      return;
    }

    const slugBase = (email?.split('@')[0] || 'team')
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    const slug = `${slugBase || 'team'}-${Math.random().toString(36).slice(2, 8)}`;

    const organization = await this.prisma.organization.create({
      data: {
        name: `${slugBase || 'team'} team`,
        slug,
        billingPlan: 'STARTER',
      },
    });

    await this.prisma.organizationMember.create({
      data: {
        orgId: organization.id,
        userId,
        role: 'OWNER',
      },
    });

    await this.prisma.policy.create({
      data: {
        orgId: organization.id,
        failOnBreaking: true,
        ruleOverrides: {},
      },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async completeGithubOAuth(args: {
    code: string;
    state: string;
    ipAddress: string | null;
    userAgent: string | null;
  }) {
    if (!args.code || !args.state) {
      throw new BadRequestException('OAuth callback requires code and state.');
    }

    const oauthState = await this.prisma.oAuthState.findUnique({
      where: {
        state: args.state,
      },
    });

    if (!oauthState || oauthState.provider !== 'GITHUB' || oauthState.consumedAt) {
      throw new UnauthorizedException('Invalid OAuth state.');
    }

    if (oauthState.expiresAt <= new Date()) {
      await this.prisma.oAuthState.update({
        where: { id: oauthState.id },
        data: {
          consumedAt: new Date(),
        },
      });
      throw new UnauthorizedException('OAuth state has expired.');
    }

    const accessToken = await this.exchangeCodeForToken(args.code, args.state);
    const github = await this.fetchGithubProfile(accessToken);

    const githubUserId = BigInt(String(github.profile.id));

    let user = await this.prisma.user.findUnique({
      where: {
        githubUserId,
      },
    });

    if (!user && github.email) {
      user = await this.prisma.user.findUnique({
        where: {
          email: github.email,
        },
      });
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          githubUserId,
          email: github.email,
          name: github.profile.name,
          avatarUrl: github.profile.avatar_url,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          githubUserId,
          email: github.email || user.email,
          name: github.profile.name || user.name,
          avatarUrl: github.profile.avatar_url || user.avatarUrl,
        },
      });
    }

    await this.ensureDefaultOrgForUser(user.id, user.email);

    await this.prisma.oAuthState.update({
      where: {
        id: oauthState.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    const sessionToken = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(sessionToken);
    const ttlDays = Number(process.env.SESSION_TTL_DAYS || '30');
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        tokenHash,
        provider: 'GITHUB',
        expiresAt,
        ipAddress: args.ipAddress,
        userAgent: args.userAgent,
      },
    });

    return {
      sessionToken,
      expiresAt,
      redirectTo: this.normalizeReturnTo(oauthState.returnTo),
    };
  }

  extractSessionTokenFromCookies(cookieHeader?: string) {
    if (!cookieHeader) {
      return null;
    }

    const cookieName = this.getCookieName();
    const cookies = cookieHeader.split(';').map((item) => item.trim());
    const match = cookies.find((item) => item.startsWith(`${cookieName}=`));

    if (!match) {
      return null;
    }

    const [, value] = match.split('=', 2);
    return value || null;
  }

  async revokeSession(token: string) {
    await this.prisma.authSession.updateMany({
      where: {
        tokenHash: this.hashToken(token),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async getSessionUserByToken(token: string) {
    const session = await this.prisma.authSession.findUnique({
      where: {
        tokenHash: this.hashToken(token),
      },
      include: {
        user: {
          include: {
            memberships: true,
          },
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null;
    }

    await this.prisma.authSession.update({
      where: {
        id: session.id,
      },
      data: {
        lastSeenAt: new Date(),
      },
    });

    return {
      sessionId: session.id,
      user: session.user,
      expiresAt: session.expiresAt,
    };
  }
}
