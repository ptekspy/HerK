import { SectionHeader } from '../../../components/section-header';
import { CreateServiceForm } from '../../../components/create-service-form';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Service {
  id: string;
  name: string;
  slug: string;
  contractSourceType: string;
  repository: { fullName: string };
}

interface RepositoryOption {
  id: string;
  fullName: string;
}

export default async function ServicesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const services = await apiGet<Service[]>(`/v1/orgs/${orgId}/services`).catch(() => []);
  const repositories = await apiGet<RepositoryOption[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);

  return (
    <>
      <SectionHeader title="Services" subtitle="Protect multiple contracts per repository" />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Registered services</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Source</th>
                <th>Repository</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>{service.slug}</td>
                  <td>{service.contractSourceType}</td>
                  <td>{service.repository?.fullName ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-grid-6" id="create-service">
          <h3>Add service</h3>
          <CreateServiceForm
            orgId={orgId}
            repositories={repositories}
            isSubscriptionActive
            billingHref={`/onboarding/plan?orgId=${encodeURIComponent(orgId)}`}
          />
        </article>
      </section>
    </>
  );
}
