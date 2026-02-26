import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BrandLogo } from '../components/brand-logo';
import { apiGet } from '../../lib/api-server';
import { getRequestOrigin } from '../../lib/request-origin';
import { isSubscriptionActive } from '../../lib/subscription';

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
  searchParams: Promise<{
    after?: string;
    mode?: string;
    orgId?: string;
    githubAppInstall?: string;
    githubAppInstallReason?: string;
  }>;
}) {
  const query = await searchParams;
  const requestOrigin = await getRequestOrigin();
  const apiBase = requestOrigin;
  const webBase = requestOrigin;

  if (query.after || query.githubAppInstall) {
    const planUrl = new URL('/onboarding/plan', `${webBase}/`);
    if (query.after) {
      planUrl.searchParams.set('after', query.after);
    }
    if (query.orgId) {
      planUrl.searchParams.set('orgId', query.orgId);
    }
    if (query.githubAppInstall) {
      planUrl.searchParams.set('githubAppInstall', query.githubAppInstall);
    }
    if (query.githubAppInstallReason) {
      planUrl.searchParams.set('githubAppInstallReason', query.githubAppInstallReason);
    }
    redirect(planUrl.toString());
  }

  const authMode = query.mode === 'signin' ? 'signin' : 'signup';
  const isSignInMode = authMode === 'signin';
  const demoMode = Boolean(process.env.NEXT_PUBLIC_DEMO_USER_EMAIL);
  const orgs = await apiGet<Organization[]>('/v1/orgs').catch(() => []);
  const primaryOrg = orgs.find((org) => org.id === query.orgId) ?? orgs[0] ?? null;

  const oauthReturnTo = `${webBase}/onboarding/plan?after=oauth`;
  const installReturnTo = primaryOrg
    ? `${webBase}/onboarding/plan?after=install&orgId=${encodeURIComponent(primaryOrg.id)}`
    : `${webBase}/onboarding/plan`;

  const oauthStartUrl = envOrDefault(
    process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL,
    `${apiBase}/auth/github/start?returnTo=${encodeURIComponent(oauthReturnTo)}`,
  );

  const appInstallUrl =
    primaryOrg && !demoMode
      ? `${apiBase}/auth/github/app/install/start?orgId=${encodeURIComponent(primaryOrg.id)}&returnTo=${encodeURIComponent(installReturnTo)}`
      : null;

  const installations = primaryOrg
    ? await apiGet<GithubInstallation[]>(`/v1/orgs/${primaryOrg.id}/github/installations`).catch(() => [])
    : [];
  const hasInstallation = installations.length > 0;

  const billing = primaryOrg
    ? await apiGet<BillingSummary>(`/v1/orgs/${primaryOrg.id}/billing`).catch(() => ({ status: null }))
    : { status: null };
  const subscribed = isSubscriptionActive(billing.status);

  if (primaryOrg && hasInstallation && subscribed) {
    redirect(`/app/${primaryOrg.id}/dashboard`);
  }

  if (primaryOrg && !subscribed) {
    redirect(`/onboarding/plan?orgId=${encodeURIComponent(primaryOrg.id)}`);
  }

  const githubConnected = orgs.length > 0;
  const planHref = primaryOrg ? `/onboarding/plan?orgId=${encodeURIComponent(primaryOrg.id)}` : '/onboarding/plan';

  return (
    <main className="page-wrap onboarding-shell">
      <section className="onboarding-auth-card">
        <div className="onboarding-auth-head">
          <BrandLogo variant="square" className="onboarding-logo" priority />
          <nav aria-label="Authentication mode" className="onboarding-auth-tabs">
            <Link
              aria-current={isSignInMode ? 'page' : undefined}
              className={`onboarding-auth-tab${isSignInMode ? ' is-active' : ''}`}
              href="/onboarding?mode=signin"
            >
              Sign in
            </Link>
            <Link
              aria-current={isSignInMode ? undefined : 'page'}
              className={`onboarding-auth-tab${isSignInMode ? '' : ' is-active'}`}
              href="/onboarding?mode=signup"
            >
              Create account
            </Link>
          </nav>
        </div>
        <h1>{isSignInMode ? 'Sign in to your account' : 'Create your account'}</h1>
        <p className="onboarding-auth-copy">
          {isSignInMode
            ? 'Use GitHub to sign in securely and continue where you left off.'
            : 'Create your API Contract Guard account with GitHub and continue to plan activation.'}
        </p>
        <a className="onboarding-oauth-button" href={oauthStartUrl}>
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path
              d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07
              -.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08
              -.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.66 7.66 0 0 1 2-.27c.68 0
              1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
              1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
              1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
            />
          </svg>
          <span>{isSignInMode ? 'Continue with GitHub' : 'Sign up with GitHub'}</span>
        </a>
        <p className="onboarding-auth-footnote">GitHub OAuth only. No passwords are stored by API Contract Guard.</p>
        <p className="onboarding-auth-switch">
          {isSignInMode ? 'No account yet?' : 'Already have an account?'}{' '}
          <Link href={isSignInMode ? '/onboarding?mode=signup' : '/onboarding?mode=signin'}>
            {isSignInMode ? 'Create account' : 'Sign in'}
          </Link>
        </p>
        <p className="onboarding-legal-links">
          <Link href="/terms-of-use">Terms of Use</Link>
          <span aria-hidden="true">|</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </p>
      </section>

      <section className="card onboarding-setup-card">
        <h2>Next step after sign-in</h2>
        <p>
          You will be routed to a dedicated plan page where API Contract Guard checks GitHub App status and
          starts your 3-day trial checkout.
        </p>

        <ul className="onboarding-setup-list">
          <li className={`onboarding-setup-step${githubConnected ? ' is-complete' : ''}`}>
            <span className="onboarding-step-indicator" aria-hidden="true">
              {githubConnected ? '✓' : '1'}
            </span>
            <div>
              <strong>GitHub account connected</strong>
              <p>{githubConnected ? 'Connected' : 'Connect your GitHub account to continue.'}</p>
            </div>
          </li>
          <li className={`onboarding-setup-step${hasInstallation ? ' is-complete' : ''}`}>
            <span className="onboarding-step-indicator" aria-hidden="true">
              {hasInstallation ? '✓' : '2'}
            </span>
            <div>
              <strong>GitHub App installed</strong>
              <p>
                {hasInstallation
                  ? `Installed for ${primaryOrg?.name ?? 'your organization'}.`
                  : 'Install or refresh the GitHub App installation to continue.'}
              </p>
            </div>
          </li>
          <li className={`onboarding-setup-step${subscribed ? ' is-complete' : ''}`}>
            <span className="onboarding-step-indicator" aria-hidden="true">
              {subscribed ? '✓' : '3'}
            </span>
            <div>
              <strong>Plan activated</strong>
              <p>{subscribed ? 'Subscription active.' : 'Choose plan and enter card details on the next screen.'}</p>
            </div>
          </li>
        </ul>

        <div className="onboarding-setup-actions">
          {appInstallUrl ? (
            <a className="btn btn-secondary" href={appInstallUrl}>
              Install or refresh app ({primaryOrg?.name ?? primaryOrg?.id})
            </a>
          ) : (
            <button className="btn btn-secondary" disabled type="button">
              Install app {demoMode ? '(disabled in demo mode)' : '(after GitHub sign-in)'}
            </button>
          )}
          {primaryOrg ? (
            <Link className="btn btn-primary" href={subscribed ? `/app/${primaryOrg.id}/dashboard` : planHref}>
              {subscribed ? 'Open workspace' : 'Continue to plans'}
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
