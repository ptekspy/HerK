import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SubscriptionCheckoutForm } from '../../components/subscription-checkout-form';
import { apiGet } from '../../../lib/api-server';
import { getRequestOrigin } from '../../../lib/request-origin';
import { isSubscriptionActive } from '../../../lib/subscription';

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

export const metadata: Metadata = {
  title: 'Pick Your Plan',
  description:
    'Activate your 3-day free trial and choose the API Contract Guard plan that fits your API footprint.',
};

function installStatusMessage(status: string | undefined, reason: string | undefined) {
  if (status === 'ok') {
    return {
      tone: 'success',
      text: 'GitHub App installation connected. Choose your plan to activate the trial.',
    } as const;
  }

  if (status === 'pending') {
    return {
      tone: 'warning',
      text: reason === 'missing-installation-id'
        ? 'GitHub did not return an installation ID. Click install again to continue.'
        : 'GitHub App install is still pending. Complete installation and return.',
    } as const;
  }

  if (status === 'error') {
    return {
      tone: 'error',
      text: reason === 'expired'
        ? 'GitHub install state expired. Start installation again to continue.'
        : 'GitHub App installation failed. Retry installation to continue.',
    } as const;
  }

  return null;
}

export default async function PlanSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{
    after?: string;
    orgId?: string;
    githubAppInstall?: string;
    githubAppInstallReason?: string;
  }>;
}) {
  const query = await searchParams;
  const requestOrigin = await getRequestOrigin();
  const apiBase = requestOrigin;
  const webBase = requestOrigin;
  const demoMode = Boolean(process.env.NEXT_PUBLIC_DEMO_USER_EMAIL);

  const orgs = await apiGet<Organization[]>('/v1/orgs').catch(() => []);
  const org = orgs.find((item) => item.id === query.orgId) ?? orgs[0];
  if (!org) {
    redirect('/onboarding');
  }

  const installReturnTo = `${webBase}/onboarding/plan?after=install&orgId=${encodeURIComponent(org.id)}`;
  const appInstallUrl =
    !demoMode
      ? `${apiBase}/auth/github/app/install/start?orgId=${encodeURIComponent(org.id)}&returnTo=${encodeURIComponent(installReturnTo)}`
      : null;

  const installations = await apiGet<GithubInstallation[]>(`/v1/orgs/${org.id}/github/installations`).catch(
    () => [],
  );
  const hasInstallation = installations.length > 0;

  if (query.after === 'oauth' && appInstallUrl && !hasInstallation) {
    redirect(appInstallUrl);
  }

  const billing = await apiGet<BillingSummary>(`/v1/orgs/${org.id}/billing`).catch(() => ({ status: null }));
  if (isSubscriptionActive(billing.status)) {
    redirect(`/app/${org.id}/dashboard`);
  }

  const installMessage = installStatusMessage(query.githubAppInstall, query.githubAppInstallReason);
  const billingMessage =
    query.after === 'billing'
      ? {
          tone: 'warning',
          text: 'Checkout completed but subscription status has not activated yet. Refresh in a moment.',
        }
      : null;
  const notice = installMessage ?? billingMessage;
  const checkoutSuccessUrl = `${webBase}/onboarding/plan?after=billing&orgId=${encodeURIComponent(org.id)}`;
  const checkoutCancelUrl = `${webBase}/onboarding/plan?after=install&orgId=${encodeURIComponent(org.id)}`;

  return (
    <main className="page-wrap plan-pick-shell">
      <section className="card plan-pick-hero">
        <p className="plan-pick-kicker">Activation Step</p>
        <h1>Pick your plan and start protecting pull requests</h1>
        <p>
          GitHub is connected for <strong>{org.name}</strong>. Choose a plan to activate your 3-day free trial.
          Most API teams start on <strong>Growth</strong> for full coverage across core services.
        </p>
        <div className="plan-growth-proof">
          <span>Recommended: Growth</span>
          <span>Up to 15 services</span>
          <span>Yearly option includes 2 months free</span>
        </div>
      </section>

      {notice ? (
        <section className={`card plan-pick-notice plan-pick-notice-${notice.tone}`}>
          <p>{notice.text}</p>
        </section>
      ) : null}

      <section className="plan-pick-grid">
        <article className="card plan-tier">
          <h2>Starter</h2>
          <p className="plan-tier-price">$49/mo</p>
          <p>For initial rollout and a focused API surface.</p>
          <ul>
            <li>Up to 3 monitored services</li>
            <li>GitHub PR checks and policy controls</li>
            <li>In-app notifications and waiver workflows</li>
          </ul>
        </article>

        <article className="card plan-tier plan-tier-growth">
          <span className="plan-tier-badge">Most popular</span>
          <h2>Growth</h2>
          <p className="plan-tier-price">$199/mo</p>
          <p>Best fit for production teams shipping multiple APIs.</p>
          <ul>
            <li>Up to 15 monitored services</li>
            <li>Full policy controls and team collaboration</li>
            <li>Email alerts for PR failures</li>
          </ul>
        </article>

        <article className="card plan-tier">
          <h2>Enterprise</h2>
          <p className="plan-tier-price">Contact sales</p>
          <p>For organizations needing unlimited scale and enterprise procurement support.</p>
          <ul>
            <li>Unlimited services</li>
            <li>Priority onboarding and roadmap alignment</li>
            <li>Governance and SLA planning</li>
          </ul>
        </article>
      </section>

      {!hasInstallation ? (
        <section className="card plan-install-warning">
          <h2>Install GitHub App to continue</h2>
          <p>Complete GitHub App installation first, then return to choose and activate your plan.</p>
          {appInstallUrl ? (
            <a className="btn btn-primary" href={appInstallUrl}>
              Install or refresh GitHub App
            </a>
          ) : (
            <button className="btn btn-primary" type="button" disabled>
              GitHub App install unavailable in demo mode
            </button>
          )}
        </section>
      ) : (
        <section className="card plan-checkout-card">
          <h2>Start your 3-day free trial</h2>
          <p>
            Card details are collected securely at checkout. Choose monthly or yearly billing and continue to
            workspace setup immediately after payment authorization.
          </p>
          <SubscriptionCheckoutForm
            orgId={org.id}
            successUrl={checkoutSuccessUrl}
            cancelUrl={checkoutCancelUrl}
            ctaLabel="Continue to secure checkout"
          />
          <p className="text-muted mt-0 mb-0">
            Prefer an enterprise conversation?{' '}
            <Link href="/pricing">Review enterprise details and contact sales.</Link>
          </p>
        </section>
      )}
    </main>
  );
}
