import { SectionHeader } from '../../../components/section-header';
import { SimpleCreateForm } from '../../../components/simple-form';

export default async function WaiversPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  return (
    <>
      <SectionHeader title="Waivers" subtitle="Time-bound exceptions with auditability" />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Grant waiver</h3>
          <SimpleCreateForm
            endpoint={`/v1/orgs/${orgId}/waivers`}
            title="waiver"
            fields={[
              { name: 'serviceId', label: 'Service ID', placeholder: 'service-id' },
              { name: 'repositoryId', label: 'Repository ID', placeholder: 'repo-id' },
              { name: 'pullRequestNumber', label: 'PR number', placeholder: '12' },
              { name: 'reason', label: 'Reason', placeholder: 'Migration window for mobile clients' },
              {
                name: 'expiresAt',
                label: 'Expiry ISO timestamp',
                placeholder: '2026-12-01T00:00:00.000Z',
              },
            ]}
          />
        </article>

        <article className="card card-grid-6">
          <h3>Notes</h3>
          <p>
            Waivers should remain narrowly scoped and short-lived. Each waiver is recorded for
            policy and incident audits.
          </p>
        </article>
      </section>
    </>
  );
}
