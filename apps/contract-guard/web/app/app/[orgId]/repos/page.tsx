import { SectionHeader } from '../../../components/section-header';
import { CreateRepoForm } from '../../../components/create-repo-form';
import { InstallationSyncForm } from '../../../components/installation-sync-form';

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
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';
  const webBase = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:4000';
  const demoMode = Boolean(process.env.NEXT_PUBLIC_DEMO_USER_EMAIL);
  const appInstallUrl = demoMode
    ? null
    : `${apiBase}/auth/github/app/install/start?orgId=${encodeURIComponent(orgId)}&returnTo=${encodeURIComponent(`${webBase}/app/${orgId}/repos`)}`;
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
          <h3>GitHub App installation</h3>
          <p>Install or update the ContractGuard GitHub App before syncing repositories.</p>
          <div className="cta-row" style={{ marginTop: '0.75rem' }}>
            {appInstallUrl ? (
              <a className="btn btn-secondary" href={appInstallUrl}>
                Install GitHub App
              </a>
            ) : (
              <button className="btn btn-secondary" type="button" disabled>
                Install disabled in demo mode
              </button>
            )}
          </div>

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

          <h3 style={{ marginTop: '1.25rem' }}>Manual installation sync</h3>
          <InstallationSyncForm orgId={orgId} />

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
