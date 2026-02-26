import { SectionHeader } from '../../../components/section-header';
import { DashboardAttentionNeeded } from '../../../components/dashboard-attention-needed';
import { DashboardKpiGrid } from '../../../components/dashboard-kpi-grid';
import { DashboardQuickActions } from '../../../components/dashboard-quick-actions';
import { DashboardRecentChecks } from '../../../components/dashboard-recent-checks';
import { DashboardRecentNotifications } from '../../../components/dashboard-recent-notifications';
import { DashboardSetupWizard } from '../../../components/dashboard-setup-wizard';
import type { DashboardSummary } from '../../../components/dashboard-types';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface OrgSummary {
  id: string;
  name: string;
  billingPlan: string;
  _count: {
    members: number;
    repositories: number;
    services: number;
    checkRuns: number;
  };
}

function isSummaryNotFoundError(error: unknown) {
  return error instanceof Error && error.message.includes('status 404');
}

function setupSubtitle(summary: DashboardSummary) {
  if (summary.wizard.isComplete) {
    return 'Setup complete. Monitor ongoing contract health and team activity below.';
  }

  return `${summary.wizard.requiredCompleted}/${summary.wizard.requiredTotal} required setup tasks complete.`;
}

function LegacyDashboard({ org }: { org: OrgSummary }) {
  return (
    <>
      <SectionHeader
        title={`${org.name} dashboard`}
        subtitle="Dashboard summary endpoint not available yet; showing compatibility fallback."
      />

      <section className="grid">
        <article className="card card-grid-4">
          <h2>Plan</h2>
          <p>{org.billingPlan}</p>
        </article>
        <article className="card card-grid-4">
          <h2>Repositories</h2>
          <p>{org._count.repositories}</p>
        </article>
        <article className="card card-grid-4">
          <h2>Services</h2>
          <p>{org._count.services}</p>
        </article>
        <article className="card card-grid-6">
          <h3>Checks processed</h3>
          <p>{org._count.checkRuns} total PR analyses have been recorded.</p>
        </article>
        <article className="card card-grid-6">
          <h3>Members</h3>
          <p>{org._count.members} collaborators currently have access.</p>
        </article>
      </section>
    </>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);

  let summary: DashboardSummary | null = null;

  try {
    summary = await apiGet<DashboardSummary>(`/v1/orgs/${orgId}/dashboard/summary`);
  } catch (summaryError) {
    if (!isSummaryNotFoundError(summaryError)) {
      summary = null;
    }
  }

  if (!summary) {
    const org = await apiGet<OrgSummary>(`/v1/orgs/${orgId}`).catch(() => ({
      id: orgId,
      name: 'Demo Org',
      billingPlan: 'STARTER',
      _count: {
        members: 0,
        repositories: 0,
        services: 0,
        checkRuns: 0,
      },
    }));

    return <LegacyDashboard org={org} />;
  }

  return (
    <>
      <SectionHeader title={`${summary.org.name} dashboard`} subtitle={setupSubtitle(summary)} />

      {!summary.wizard.isComplete ? (
        <DashboardSetupWizard
          orgId={orgId}
          wizard={summary.wizard}
          compact={summary.wizard.isDismissed}
        />
      ) : (
        <section className="card dashboard-setup-complete">
          <h3>Setup complete</h3>
          <p>Your workspace is fully configured. Use quick actions to continue daily operations.</p>
        </section>
      )}

      <DashboardKpiGrid
        metrics={summary.metrics}
        billing={summary.billing}
        plan={summary.org.billingPlan}
      />

      <DashboardQuickActions orgId={orgId} />

      <section className="grid dashboard-activity-grid">
        <DashboardRecentChecks checks={summary.recentChecks} />
        <DashboardRecentNotifications notifications={summary.recentNotifications} />
      </section>

      <DashboardAttentionNeeded attention={summary.attention} />
    </>
  );
}
