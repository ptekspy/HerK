import { AuthService } from './auth.service';

jest.mock('@octokit/auth-app', () => ({
  createAppAuth: jest.fn(),
}));

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      apps: {
        getInstallation: jest.fn().mockResolvedValue({
          data: {
            account: {
              login: 'acme',
            },
          },
        }),
      },
    },
  })),
}));

describe('AuthService GitHub App install flow', () => {
  const prisma = {
    organizationMember: {
      findUnique: jest.fn(),
    },
    githubAppInstallState: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    githubInstallation: {
      upsert: jest.fn(),
    },
  } as const;

  const service = new AuthService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_APP_SLUG = 'contract-guard';
    process.env.FRONTEND_URL = 'http://localhost:4000/app';
    delete process.env.GITHUB_APP_INSTALL_URL;

    prisma.organizationMember.findUnique.mockResolvedValue({
      id: 'member_1',
      role: 'ADMIN',
    });
  });

  afterEach(() => {
    delete process.env.GITHUB_APP_SLUG;
    delete process.env.GITHUB_APP_INSTALL_URL;
    delete process.env.FRONTEND_URL;
  });

  it('creates install state and returns GitHub install URL with state', async () => {
    prisma.githubAppInstallState.create.mockResolvedValue({ id: 'state_1' });

    const redirectUrl = await service.startGithubAppInstall({
      userId: 'user_1',
      orgId: 'org_1',
      returnTo: 'http://localhost:4000/app/org_1/repos',
    });

    expect(redirectUrl).toContain('https://github.com/apps/contract-guard/installations/new');

    const [createArgs] = prisma.githubAppInstallState.create.mock.calls[0];
    expect(createArgs).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org_1',
          userId: 'user_1',
        }),
      }),
    );

    expect(redirectUrl).toContain(`state=${createArgs.data.state}`);
  });

  it('marks callback pending when installation id is missing', async () => {
    prisma.githubAppInstallState.findUnique.mockResolvedValue({
      id: 'state_1',
      state: 'state-token',
      orgId: 'org_1',
      userId: 'user_1',
      returnTo: 'http://localhost:4000/app/org_1/repos',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    prisma.githubAppInstallState.update.mockResolvedValue({ id: 'state_1' });

    const result = await service.completeGithubAppInstall({
      state: 'state-token',
      setupAction: 'request',
    });

    expect(result.redirectTo).toContain('githubAppInstall=pending');
    expect(prisma.githubInstallation.upsert).not.toHaveBeenCalled();
    expect(prisma.githubAppInstallState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'state_1' },
      }),
    );
  });

  it('upserts installation and redirects with success when callback has installation id', async () => {
    prisma.githubAppInstallState.findUnique.mockResolvedValue({
      id: 'state_1',
      state: 'state-token',
      orgId: 'org_1',
      userId: 'user_1',
      returnTo: 'http://localhost:4000/app/org_1/repos',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    prisma.githubInstallation.upsert.mockResolvedValue({ id: 'inst_1' });
    prisma.githubAppInstallState.update.mockResolvedValue({ id: 'state_1' });

    const result = await service.completeGithubAppInstall({
      state: 'state-token',
      installationId: '12345',
      setupAction: 'install',
    });

    expect(prisma.githubInstallation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          installationId: BigInt(12345),
        },
      }),
    );
    expect(result.redirectTo).toContain('githubAppInstall=ok');
  });
});
