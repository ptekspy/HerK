import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

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
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Activation Step</p>
          <CardTitle className="text-4xl">Pick your plan and start protecting pull requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            GitHub is connected for <strong>{org.name}</strong>. Choose a plan to activate your 3-day free trial.
            Most API teams start on <strong>Growth</strong> for full coverage across core services.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1">Recommended: Growth</span>
            <span className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1">Up to 15 services</span>
            <span className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1">Yearly option includes 2 months free</span>
          </div>
        </CardContent>
      </Card>

      {notice ? (
        <Alert
          className={
            notice.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : notice.tone === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : ''
          }
          variant={notice.tone === 'error' ? 'destructive' : 'default'}
        >
          {notice.tone === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{notice.text}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Starter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="text-3xl font-semibold text-foreground">$49/mo</p>
            <p>For initial rollout and a focused API surface.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Up to 3 monitored services</li>
              <li>GitHub PR checks and policy controls</li>
              <li>In-app notifications and waiver workflows</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/40 shadow-lg">
          <CardHeader>
            <p className="inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Most popular</p>
            <CardTitle className="text-2xl">Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="text-3xl font-semibold text-foreground">$199/mo</p>
            <p>Best fit for production teams shipping multiple APIs.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Up to 15 monitored services</li>
              <li>Full policy controls and team collaboration</li>
              <li>Email alerts for PR failures</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enterprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="text-3xl font-semibold text-foreground">Contact sales</p>
            <p>For organizations needing unlimited scale and enterprise procurement support.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Unlimited services</li>
              <li>Priority onboarding and roadmap alignment</li>
              <li>Governance and SLA planning</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {!hasInstallation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Install GitHub App to continue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Complete GitHub App installation first, then return to choose and activate your plan.</p>
            {appInstallUrl ? (
              <Button asChild>
                <a href={appInstallUrl}>Install or refresh GitHub App</a>
              </Button>
            ) : (
              <Button type="button" disabled>
                GitHub App install unavailable in demo mode
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Start your 3-day free trial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Card details are collected securely at checkout. Choose monthly or yearly billing and continue to
              workspace setup immediately after payment authorization.
            </p>
            <SubscriptionCheckoutForm
              orgId={org.id}
              successUrl={checkoutSuccessUrl}
              cancelUrl={checkoutCancelUrl}
              ctaLabel="Continue to secure checkout"
            />
            <p className="text-sm text-muted-foreground">
              Prefer an enterprise conversation?{' '}
              <Link className="text-primary hover:underline" href="/pricing">Review enterprise details and contact sales.</Link>
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
