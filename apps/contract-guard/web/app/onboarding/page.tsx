import Link from 'next/link';

import { apiGet } from '../../lib/api-server';

interface Organization {
  id: string;
  name: string;
}

function envOrDefault(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export default async function OnboardingPage() {
  const apiBase = envOrDefault(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:4001');
  const webBase = envOrDefault(process.env.NEXT_PUBLIC_WEB_URL, 'http://localhost:4000');
  const demoMode = Boolean(process.env.NEXT_PUBLIC_DEMO_USER_EMAIL);
  const orgs = await apiGet<Organization[]>('/v1/orgs').catch(() => []);
  const primaryOrg = orgs[0] ?? null;

  const oauthStartUrl = envOrDefault(
    process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL,
    `${apiBase}/auth/github/start?returnTo=${encodeURIComponent(`${webBase}/onboarding`)}`,
  );

  const appInstallUrl = primaryOrg && !demoMode
    ? `${apiBase}/auth/github/app/install/start?orgId=${encodeURIComponent(primaryOrg.id)}&returnTo=${encodeURIComponent(`${webBase}/app/${primaryOrg.id}/repos`)}`
    : null;

  return (
    <main className="page-wrap" style={{ padding: '2rem 0 3rem' }}>
      <section className="card">
        <h1>Onboarding wizard</h1>
        <p>
          Connect GitHub OAuth, install the ContractGuard GitHub App, then map repositories to
          services.
        </p>
        <div className="cta-row" style={{ marginTop: '1rem' }}>
          <a className="btn btn-primary" href={oauthStartUrl}>
            1. Connect GitHub OAuth
          </a>
          {appInstallUrl ? (
            <a className="btn btn-secondary" href={appInstallUrl}>
              2. Install GitHub App ({primaryOrg?.name ?? primaryOrg?.id})
            </a>
          ) : (
            <button className="btn btn-secondary" disabled type="button">
              2. Install GitHub App {demoMode ? '(disabled in demo mode)' : '(after OAuth)'}
            </button>
          )}
          <Link className="btn btn-secondary" href={primaryOrg ? `/app/${primaryOrg.id}/dashboard` : '/app'}>
            3. Open workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
