import { SectionHeader } from '../../../components/section-header';
import { CreateRepoForm } from '../../../components/create-repo-form';
import { RefreshRepositoriesButton } from '../../../components/refresh-repositories-button';

import { apiGet } from '../../../../lib/api-server';

interface Repo {
  id: string;
  fullName: string;
  defaultBranch: string;
  _count: { services: number };
}

interface GithubInstallation {
  id: string;
  installationId: string;
  accountLogin: string;
  _count: { repositories: number };
}

interface PageSearchParams {
  githubAppInstall?: string;
  githubAppInstallReason?: string;
}

export default async function ReposPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { orgId } = await params;
  const query = await searchParams;
  const installStatus = query.githubAppInstall;
  const installStatusReason = query.githubAppInstallReason;
  const repos = await apiGet<Repo[]>(`/v1/orgs/${orgId}/repos`).catch(() => []);
  const installations = await apiGet<GithubInstallation[]>(
    `/v1/orgs/${orgId}/github/installations`,
  ).catch(() => []);

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
          <h3>GitHub App</h3>
          <p>Refresh repositories from your connected GitHub App installation.</p>

          {installStatus === 'ok' && (
            <p className="flash flash-ok" style={{ marginTop: '0.85rem' }}>
              GitHub App installation connected.
            </p>
          )}
          {installStatus === 'pending' && (
            <p className="flash" style={{ marginTop: '0.85rem' }}>
              GitHub App installation is pending approval.
            </p>
          )}
          {installStatus === 'error' && (
            <p className="flash flash-error" style={{ marginTop: '0.85rem' }}>
              Installation callback failed{installStatusReason ? ` (${installStatusReason})` : ''}.
            </p>
          )}
          <div style={{ marginTop: '1rem' }}>
            <RefreshRepositoriesButton
              orgId={orgId}
              installations={installations.map((installation) => ({
                installationId: installation.installationId,
                accountLogin: installation.accountLogin,
              }))}
            />
          </div>

          <table className="table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Account</th>
                <th>Installation ID</th>
                <th>Repositories</th>
              </tr>
            </thead>
            <tbody>
              {installations.map((installation) => (
                <tr key={installation.id}>
                  <td>{installation.accountLogin}</td>
                  <td>{installation.installationId}</td>
                  <td>{installation._count.repositories}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-grid-6">
          <h3>Manual repository mapping</h3>
          <p>Use this when a repository is not yet in the synced list.</p>
          <CreateRepoForm orgId={orgId} installations={installations} />
        </article>
      </section>
    </>
  );
}
