import { SectionHeader } from '../../../components/section-header';

import { apiGet } from '../../../../lib/api-server';

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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

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

  return (
    <>
      <SectionHeader
        title={`${org.name} dashboard`}
        subtitle="Recent contract integrity posture and adoption metrics"
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
