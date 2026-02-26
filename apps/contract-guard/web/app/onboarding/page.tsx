import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SubscriptionCheckoutForm } from '../components/subscription-checkout-form';
import { apiGet } from '../../lib/api-server';
import { getRequestOrigin } from '../../lib/request-origin';

interface Organization {
  id: string;
  name: string;
}

interface GithubInstallation {
  id: string;
}

interface BillingSummary {
  status: string | null;
}

function envOrDefault(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; orgId?: string }>;
}) {
  const query = await searchParams;
  const requestOrigin = await getRequestOrigin();
  const apiBase = requestOrigin;
  const webBase = requestOrigin;
  const demoMode = Boolean(process.env.NEXT_PUBLIC_DEMO_USER_EMAIL);
  const orgs = await apiGet<Organization[]>('/v1/orgs').catch(() => []);
  const primaryOrg = orgs.find((org) => org.id === query.orgId) ?? orgs[0] ?? null;
  const oauthReturnTo = `${webBase}/onboarding?after=oauth`;
  const installReturnTo = primaryOrg
    ? `${webBase}/onboarding?after=install&orgId=${encodeURIComponent(primaryOrg.id)}`
    : `${webBase}/onboarding`;

  const oauthStartUrl = envOrDefault(
    process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL,
    `${apiBase}/auth/github/start?returnTo=${encodeURIComponent(oauthReturnTo)}`,
  );

  const appInstallUrl = primaryOrg && !demoMode
    ? `${apiBase}/auth/github/app/install/start?orgId=${encodeURIComponent(primaryOrg.id)}&returnTo=${encodeURIComponent(installReturnTo)}`
    : null;

  if (query.after === 'oauth' && appInstallUrl) {
    redirect(appInstallUrl);
  }

  const installations = primaryOrg
    ? await apiGet<GithubInstallation[]>(`/v1/orgs/${primaryOrg.id}/github/installations`).catch(() => [])
    : [];
  const hasInstallation = installations.length > 0;

  const billing = primaryOrg
    ? await apiGet<BillingSummary>(`/v1/orgs/${primaryOrg.id}/billing`).catch(() => ({ status: null }))
    : { status: null };
  const isSubscribed =
    billing.status === 'ACTIVE' || billing.status === 'TRIALING' || billing.status === 'PAST_DUE';

  if ((query.after === 'billing' || query.after === 'install') && primaryOrg && hasInstallation && isSubscribed) {
    redirect(`/app/${primaryOrg.id}/dashboard`);
  }

  return (
    <main className="page-wrap pt-8 pb-12">
      <section className="card">
        <h1>Onboarding wizard</h1>
        <p>
          Connect your GitHub account, install the API Contract Guard GitHub App, then start a 3-day trial by
          selecting a paid plan.
        </p>
        <div className="cta-row mt-4">
          <a className="btn btn-primary" href={oauthStartUrl}>
            Connect GitHub
          </a>
          {appInstallUrl ? (
            <a className="btn btn-secondary" href={appInstallUrl}>
              Install or Refresh App ({primaryOrg?.name ?? primaryOrg?.id})
            </a>
          ) : (
            <button className="btn btn-secondary" disabled type="button">
              Install App {demoMode ? '(disabled in demo mode)' : '(after connect)'}
            </button>
          )}
          {primaryOrg && isSubscribed ? (
            <Link className="btn btn-secondary" href={`/app/${primaryOrg.id}/dashboard`}>
              Open workspace
            </Link>
          ) : null}
        </div>

        {primaryOrg && hasInstallation && !isSubscribed ? (
          <div className="mt-5">
            <h2 className="mb-2">Subscription required</h2>
            <p className="mt-0">
              Choose a plan and enter card details to activate your 3-day free trial before using the
              workspace.
            </p>
            <SubscriptionCheckoutForm
              orgId={primaryOrg.id}
              successUrl={`${webBase}/onboarding?after=billing&orgId=${encodeURIComponent(primaryOrg.id)}`}
              cancelUrl={`${webBase}/onboarding?after=install&orgId=${encodeURIComponent(primaryOrg.id)}`}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
