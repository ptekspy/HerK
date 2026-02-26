import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SubscriptionCheckoutForm } from '../components/subscription-checkout-form';
import { SiteLogo } from '../components/site-logo';
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
  searchParams: Promise<{ after?: string; mode?: string; orgId?: string }>;
}) {
  const query = await searchParams;
  const requestOrigin = await getRequestOrigin();
  const apiBase = requestOrigin;
  const webBase = requestOrigin;
  const authMode = query.mode === 'signin' ? 'signin' : 'signup';
  const isSignInMode = authMode === 'signin';
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

  const githubConnected = orgs.length > 0 || query.after === 'oauth';
  const setupNotice = query.after === 'install'
    ? 'GitHub App connected. Choose a plan to start your 3-day free trial.'
    : query.after === 'billing'
      ? 'Billing completed. Opening your workspace.'
      : null;

  return (
    <main className="page-wrap onboarding-shell">
      <section className="onboarding-auth-card">
        <div className="onboarding-auth-head">
          <SiteLogo className="onboarding-logo" showWordmark={false} />
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
            : 'Start your 3-day free trial by creating your API Contract Guard account with GitHub.'}
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
        <h2>Complete setup</h2>
        <p>
          After GitHub sign-in, install the GitHub App for your organization and choose a paid plan to activate
          your 3-day free trial.
        </p>

        {setupNotice ? <p className="onboarding-notice">{setupNotice}</p> : null}

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
                  : 'Install or refresh the GitHub App installation.'}
              </p>
            </div>
          </li>
          <li className={`onboarding-setup-step${isSubscribed ? ' is-complete' : ''}`}>
            <span className="onboarding-step-indicator" aria-hidden="true">
              {isSubscribed ? '✓' : '3'}
            </span>
            <div>
              <strong>Plan selected</strong>
              <p>{isSubscribed ? 'Subscription active.' : 'Pick a plan and enter card details.'}</p>
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
          {primaryOrg && isSubscribed ? (
            <Link className="btn btn-primary" href={`/app/${primaryOrg.id}/dashboard`}>
              Open workspace
            </Link>
          ) : null}
        </div>

        {primaryOrg && hasInstallation && !isSubscribed ? (
          <div className="onboarding-subscription">
            <h3>Subscription required</h3>
            <p>Choose a plan and add a card to activate your 3-day free trial.</p>
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
