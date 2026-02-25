import { SectionHeader } from '../../../components/section-header';
import { SimpleCreateForm } from '../../../components/simple-form';

import { apiGet } from '../../../../lib/api';

interface Repo {
  id: string;
  fullName: string;
  defaultBranch: string;
  _count: { services: number };
}

export default async function ReposPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const repos = await apiGet<Repo[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);

  return (
    <>
      <SectionHeader title="Repositories" subtitle="Map GitHub repositories to ContractGuard services" />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Connected repositories</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Default branch</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody>
              {repos.map((repo) => (
                <tr key={repo.id}>
                  <td>{repo.fullName}</td>
                  <td>{repo.defaultBranch}</td>
                  <td>{repo._count.services}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-grid-6">
          <h3>Add repository</h3>
          <SimpleCreateForm
            endpoint={`/v1/orgs/${orgId}/repos`}
            title="repository"
            fields={[
              { name: 'owner', label: 'Owner', placeholder: 'acme' },
              { name: 'name', label: 'Repo name', placeholder: 'platform-api' },
              {
                name: 'githubInstallationId',
                label: 'Installation ID (internal row id)',
                placeholder: 'installation-id',
              },
              { name: 'defaultBranch', label: 'Default branch', placeholder: 'main' },
            ]}
          />
        </article>
      </section>
    </>
  );
}
