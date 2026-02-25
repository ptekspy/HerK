import { SectionHeader } from '../../../components/section-header';
import { SimpleCreateForm } from '../../../components/simple-form';

import { apiGet } from '../../../../lib/api';

interface Service {
  id: string;
  name: string;
  slug: string;
  contractSourceType: string;
  repository: { fullName: string };
}

export default async function ServicesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const services = await apiGet<Service[]>(`/v1/orgs/${orgId}/services`).catch(() => []);

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

        <article className="card card-grid-6">
          <h3>Add service</h3>
          <SimpleCreateForm
            endpoint={`/v1/orgs/${orgId}/services`}
            title="service"
            fields={[
              { name: 'repositoryId', label: 'Repository ID', placeholder: 'repo-id' },
              { name: 'name', label: 'Name', placeholder: 'Public API' },
              { name: 'slug', label: 'Slug', placeholder: 'public-api' },
              {
                name: 'contractSourceType',
                label: 'Source type (GITHUB_FILE or PUBLIC_URL)',
                placeholder: 'GITHUB_FILE',
              },
              { name: 'contractPath', label: 'Contract path', placeholder: 'openapi.yaml' },
              {
                name: 'contractUrlTemplate',
                label: 'Contract URL template',
                placeholder: 'https://example.com/openapi?sha={sha}',
              },
            ]}
          />
        </article>
      </section>
    </>
  );
}
