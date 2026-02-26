import { V1Service } from './v1.service';

function createMockPrisma() {
  return {
    organization: {
      findUniqueOrThrow: jest.fn(),
    },
    githubInstallation: {
      count: jest.fn(),
    },
    dashboardWizardState: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    checkRun: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
    },
  };
}

function createMockRbac() {
  return {
    requireOrgRole: jest.fn(),
  };
}

describe('V1Service dashboard summary', () => {
  const now = new Date('2026-02-26T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns completed GitHub step for normal onboarded orgs', async () => {
    const prisma = createMockPrisma();
    const rbac = createMockRbac();
    const service = new V1Service(prisma as never, rbac as never);

    rbac.requireOrgRole.mockResolvedValue('OWNER');

    prisma.organization.findUniqueOrThrow.mockResolvedValue({
      id: 'org_1',
      name: 'Acme',
      billingPlan: 'GROWTH',
      subscription: {
        status: 'ACTIVE',
        currentPeriodEnd: new Date('2026-03-01T00:00:00.000Z'),
        cancelAtPeriodEnd: false,
      },
      _count: {
        members: 2,
        repositories: 3,
        services: 2,
        checkRuns: 4,
      },
    });

    prisma.githubInstallation.count.mockResolvedValue(1);
    prisma.dashboardWizardState.findUnique.mockResolvedValue({
      id: 'wiz_1',
      orgId: 'org_1',
      userId: 'user_1',
      acknowledgedSteps: ['policy_reviewed', 'notifications_reviewed'],
      dismissedAt: null,
      completedAt: new Date('2026-02-25T00:00:00.000Z'),
      createdAt: new Date('2026-02-25T00:00:00.000Z'),
      updatedAt: new Date('2026-02-25T00:00:00.000Z'),
      lastSeenAt: null,
    });

    prisma.checkRun.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    prisma.notification.count.mockResolvedValue(3);
    prisma.checkRun.findMany.mockResolvedValue([
      {
        id: 'chk_1',
        conclusion: 'FAIL',
        createdAt: new Date('2026-02-26T10:00:00.000Z'),
        pullRequestNumber: 42,
        service: { name: 'Public API' },
        repository: { fullName: 'acme/public-api' },
      },
    ]);
    prisma.notification.findMany.mockResolvedValue([
      {
        id: 'note_1',
        kind: 'CHECK_FAILED',
        title: 'Check failed',
        readAt: null,
        createdAt: new Date('2026-02-26T10:30:00.000Z'),
      },
    ]);

    const summary = await service.getDashboardSummary('user_1', 'org_1');

    expect(rbac.requireOrgRole).toHaveBeenCalledWith('user_1', 'org_1', 'VIEWER');

    const githubStep = summary.wizard.steps.find(
      (step) => step.id === 'github_installation_connected',
    );

    expect(githubStep).toEqual(
      expect.objectContaining({
        completed: true,
        status: 'completed',
        note: 'Connected during sign-in.',
      }),
    );

    expect(summary.wizard.requiredCompleted).toBe(summary.wizard.requiredTotal);
    expect(summary.attention.some((item) => item.key === 'billing_inactive')).toBe(false);
  });

  it('returns warning GitHub step for legacy org with missing installation', async () => {
    const prisma = createMockPrisma();
    const rbac = createMockRbac();
    const service = new V1Service(prisma as never, rbac as never);

    rbac.requireOrgRole.mockResolvedValue('OWNER');

    prisma.organization.findUniqueOrThrow.mockResolvedValue({
      id: 'org_legacy',
      name: 'Legacy Org',
      billingPlan: 'STARTER',
      subscription: null,
      _count: {
        members: 1,
        repositories: 0,
        services: 0,
        checkRuns: 0,
      },
    });

    prisma.githubInstallation.count.mockResolvedValue(0);
    prisma.dashboardWizardState.findUnique.mockResolvedValue(null);
    prisma.checkRun.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.notification.count.mockResolvedValue(0);
    prisma.checkRun.findMany.mockResolvedValue([]);
    prisma.notification.findMany.mockResolvedValue([]);

    const summary = await service.getDashboardSummary('user_1', 'org_legacy');

    const githubStep = summary.wizard.steps.find(
      (step) => step.id === 'github_installation_connected',
    );

    expect(githubStep).toEqual(
      expect.objectContaining({
        completed: false,
        status: 'warning',
        actionLabel: 'Reconnect GitHub',
      }),
    );

    expect(summary.attention.some((item) => item.key === 'missing_installation')).toBe(true);
    expect(summary.attention.some((item) => item.key === 'billing_inactive')).toBe(true);
  });

  it('updates wizard state and persists acknowledge/dismiss values', async () => {
    const prisma = createMockPrisma();
    const rbac = createMockRbac();
    const service = new V1Service(prisma as never, rbac as never);

    rbac.requireOrgRole.mockResolvedValue('OWNER');

    prisma.dashboardWizardState.upsert.mockResolvedValue({
      id: 'wiz_1',
      orgId: 'org_1',
      userId: 'user_1',
      acknowledgedSteps: [],
      dismissedAt: null,
      completedAt: null,
      lastSeenAt: null,
      createdAt: new Date('2026-02-25T00:00:00.000Z'),
      updatedAt: new Date('2026-02-25T00:00:00.000Z'),
    });
    prisma.dashboardWizardState.update.mockResolvedValue({ id: 'wiz_1' });

    prisma.organization.findUniqueOrThrow.mockResolvedValue({
      id: 'org_1',
      name: 'Acme',
      billingPlan: 'GROWTH',
      subscription: {
        status: 'ACTIVE',
        currentPeriodEnd: new Date('2026-03-01T00:00:00.000Z'),
        cancelAtPeriodEnd: false,
      },
      _count: {
        members: 1,
        repositories: 1,
        services: 1,
        checkRuns: 0,
      },
    });
    prisma.githubInstallation.count.mockResolvedValue(1);
    prisma.dashboardWizardState.findUnique.mockResolvedValue({
      id: 'wiz_1',
      orgId: 'org_1',
      userId: 'user_1',
      acknowledgedSteps: ['policy_reviewed'],
      dismissedAt: now,
      completedAt: null,
      lastSeenAt: now,
      createdAt: new Date('2026-02-25T00:00:00.000Z'),
      updatedAt: new Date('2026-02-25T00:00:00.000Z'),
    });
    prisma.checkRun.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    prisma.notification.count.mockResolvedValue(0);
    prisma.checkRun.findMany.mockResolvedValue([]);
    prisma.notification.findMany.mockResolvedValue([]);

    const wizard = await service.updateDashboardWizardState('user_1', 'org_1', {
      dismissed: true,
      markSeen: true,
      acknowledgeStepId: 'policy_reviewed',
    });

    expect(rbac.requireOrgRole).toHaveBeenNthCalledWith(1, 'user_1', 'org_1', 'MEMBER');
    expect(prisma.dashboardWizardState.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wiz_1' },
        data: expect.objectContaining({
          acknowledgedSteps: ['policy_reviewed'],
        }),
      }),
    );

    expect(wizard.requiredTotal).toBe(5);
  });
});
