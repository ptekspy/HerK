import { WebhooksService } from './webhooks.service';

describe('WebhooksService GitHub PR integration', () => {
  const prisma = {
    webhookEvent: {
      create: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      findFirst: jest.fn(),
    },
    githubInstallation: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    repository: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    checkRun: {
      create: jest.fn(),
    },
  } as const;

  const queues = {
    enqueuePrAnalysis: jest.fn(),
    enqueueOrgEmailNotification: jest.fn(),
  };

  const service = new WebhooksService(prisma as never, queues as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists webhook event, creates check runs, and enqueues analysis jobs', async () => {
    prisma.webhookEvent.create.mockResolvedValue({ id: 'evt_1' });
    prisma.webhookEvent.update.mockResolvedValue({});
    prisma.repository.findFirst.mockResolvedValue({
      id: 'repo_1',
      orgId: 'org_1',
      owner: 'acme',
      name: 'api',
      defaultBranch: 'main',
      installation: {
        installationId: BigInt(11),
      },
      services: [{ id: 'svc_1' }],
    });
    prisma.checkRun.create.mockResolvedValue({ id: 'check_1' });
    queues.enqueuePrAnalysis.mockResolvedValue({});

    const payload = {
      action: 'opened',
      pull_request: {
        number: 23,
        head: { sha: 'head-sha' },
        base: { sha: 'base-sha' },
      },
      repository: {
        full_name: 'acme/api',
      },
      installation: {
        id: 11,
      },
    };

    const result = await service.handleGithubWebhook('pull_request', 'delivery-1', payload);

    expect(result).toEqual({ ok: true, queued: 1 });
    expect(prisma.checkRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org_1',
          repositoryId: 'repo_1',
          serviceId: 'svc_1',
          pullRequestNumber: 23,
          pullRequestHeadSha: 'head-sha',
        }),
      }),
    );
    expect(queues.enqueuePrAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org_1',
        repositoryId: 'repo_1',
        serviceId: 'svc_1',
        checkRunId: 'check_1',
      }),
    );
    expect(prisma.webhookEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt_1' },
      }),
    );
  });

  it('treats duplicate delivery IDs as idempotent duplicates', async () => {
    prisma.webhookEvent.create.mockRejectedValue(new Error('duplicate key'));

    const result = await service.handleGithubWebhook('pull_request', 'delivery-1', {
      action: 'opened',
    });

    expect(result).toEqual({ ok: true, duplicate: true });
    expect(prisma.repository.findFirst).not.toHaveBeenCalled();
    expect(queues.enqueuePrAnalysis).not.toHaveBeenCalled();
  });

  it('handles installation webhook with organization slug mapping', async () => {
    prisma.webhookEvent.create.mockResolvedValue({ id: 'evt_install_1' });
    prisma.webhookEvent.update.mockResolvedValue({});
    prisma.organization.findFirst.mockResolvedValue({ id: 'org_1' });
    prisma.githubInstallation.upsert.mockResolvedValue({ id: 'inst_1' });

    const result = await service.handleGithubWebhook('installation', 'delivery-install-1', {
      action: 'created',
      installation: {
        id: 44,
        account: {
          login: 'acme',
        },
      },
    });

    expect(result).toEqual({ ok: true, installation: { id: 'inst_1' } });
    expect(prisma.githubInstallation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          installationId: BigInt(44),
        },
      }),
    );
  });

  it('handles installation_repositories webhook and syncs add/remove changes', async () => {
    prisma.webhookEvent.create.mockResolvedValue({ id: 'evt_install_repo_1' });
    prisma.webhookEvent.update.mockResolvedValue({});
    prisma.githubInstallation.findUnique.mockResolvedValue({
      id: 'inst_1',
      orgId: 'org_1',
    });
    prisma.repository.upsert.mockResolvedValue({});
    prisma.repository.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.handleGithubWebhook(
      'installation_repositories',
      'delivery-install-repos-1',
      {
        action: 'added',
        installation: {
          id: 44,
        },
        repositories_added: [
          {
            full_name: 'acme/new-api',
            name: 'new-api',
            default_branch: 'main',
            owner: { login: 'acme' },
          },
        ],
        repositories_removed: [
          {
            full_name: 'acme/old-api',
          },
        ],
      },
    );

    expect(result).toEqual({ ok: true, added: 1, removed: 1 });
    expect(prisma.repository.upsert).toHaveBeenCalled();
    expect(prisma.repository.deleteMany).toHaveBeenCalled();
  });
});
