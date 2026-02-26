import { SectionHeader } from '../../../components/section-header';
import { CreateWaiverForm } from '../../../components/create-waiver-form';
import { WaiverActions } from '../../../components/waiver-actions';
import { apiGet } from '../../../../lib/api-server';

interface Waiver {
  id: string;
  reason: string;
  pullRequestNumber: number | null;
  expiresAt: string;
  service: { name: string } | null;
  repository: { fullName: string } | null;
  createdBy: { email: string | null; name: string | null };
}

interface ServiceOption {
  id: string;
  name: string;
}

interface RepositoryOption {
  id: string;
  fullName: string;
}

export default async function WaiversPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const waivers = await apiGet<Waiver[]>(`/v1/orgs/${orgId}/waivers`).catch(() => []);
  const services = await apiGet<ServiceOption[]>(`/v1/orgs/${orgId}/services`).catch(() => []);
  const repositories = await apiGet<RepositoryOption[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);

  return (
    <>
      <SectionHeader title="Waivers" subtitle="Time-bound exceptions with auditability" />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Grant waiver</h3>
          <CreateWaiverForm orgId={orgId} services={services} repositories={repositories} />
        </article>

        <article className="card card-grid-6">
          <h3>Notes</h3>
          <p>
            Waivers should remain narrowly scoped and short-lived. Each waiver is recorded for
            policy and incident audits.
          </p>
          <table className="table mt-4">
            <thead>
              <tr>
                <th>Reason</th>
                <th>Scope</th>
                <th>PR</th>
                <th>Expires</th>
                <th>By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {waivers.map((waiver) => (
                <tr key={waiver.id}>
                  <td>{waiver.reason}</td>
                  <td>{waiver.service?.name ?? waiver.repository?.fullName ?? 'Org-wide'}</td>
                  <td>{waiver.pullRequestNumber ?? 'Any'}</td>
                  <td>{new Date(waiver.expiresAt).toLocaleString()}</td>
                  <td>{waiver.createdBy.name ?? waiver.createdBy.email ?? 'Unknown'}</td>
                  <td>
                    <WaiverActions orgId={orgId} waiverId={waiver.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </>
  );
}
