import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Badge } from '@herk/ui/base/badge';
import { Button, buttonVariants } from '@herk/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import { cn } from '@herk/utils';

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
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo variant="square" className="w-12" priority />
            <div className="inline-flex rounded-full border border-border/70 bg-muted/30 p-1">
              <Link
                aria-current={isSignInMode ? 'page' : undefined}
                className={cn(
                  buttonVariants({ variant: isSignInMode ? 'default' : 'ghost', size: 'sm' }),
                  'rounded-full',
                )}
                href="/onboarding?mode=signin"
              >
                Sign in
              </Link>
              <Link
                aria-current={isSignInMode ? undefined : 'page'}
                className={cn(
                  buttonVariants({ variant: isSignInMode ? 'ghost' : 'default', size: 'sm' }),
                  'rounded-full',
                )}
                href="/onboarding?mode=signup"
              >
                Create account
              </Link>
            </div>
          </div>
          <CardTitle className="text-4xl">{isSignInMode ? 'Sign in to your account' : 'Create your account'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isSignInMode
              ? 'Use GitHub to sign in securely and continue where you left off.'
              : 'Create your API Contract Guard account with GitHub and continue to plan activation.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <a className={cn(buttonVariants({ size: 'lg' }), 'w-full')} href={oauthStartUrl}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.66 7.66 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span>{isSignInMode ? 'Continue with GitHub' : 'Sign up with GitHub'}</span>
          </a>
          <p className="text-sm text-muted-foreground">GitHub OAuth only. No passwords are stored by API Contract Guard.</p>
          <p className="text-sm text-muted-foreground">
            {isSignInMode ? 'No account yet?' : 'Already have an account?'}{' '}
            <Link className="font-medium text-primary hover:underline" href={isSignInMode ? '/onboarding?mode=signup' : '/onboarding?mode=signin'}>
              {isSignInMode ? 'Create account' : 'Sign in'}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link className="text-primary hover:underline" href="/terms-of-use">Terms of Use</Link>{' '}
            <span aria-hidden="true">|</span>{' '}
            <Link className="text-primary hover:underline" href="/privacy-policy">Privacy Policy</Link>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Next step after sign-in</CardTitle>
          <p className="text-sm text-muted-foreground">
            You will be routed to a dedicated plan page where API Contract Guard checks GitHub App status and
            starts your 3-day trial checkout.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              {githubConnected ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Badge variant="outline">1</Badge>}
              <strong className="text-sm text-foreground">GitHub account connected</strong>
            </div>
            <p className="text-sm text-muted-foreground">{githubConnected ? 'Connected' : 'Connect your GitHub account to continue.'}</p>
          </div>

          <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              {hasInstallation ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Badge variant="outline">2</Badge>}
              <strong className="text-sm text-foreground">GitHub App installed</strong>
            </div>
            <p className="text-sm text-muted-foreground">
              {hasInstallation
                ? `Installed for ${primaryOrg?.name ?? 'your organization'}.`
                : 'Install or refresh the GitHub App installation to continue.'}
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              {subscribed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Badge variant="outline">3</Badge>}
              <strong className="text-sm text-foreground">Plan activated</strong>
            </div>
            <p className="text-sm text-muted-foreground">{subscribed ? 'Subscription active.' : 'Choose plan and enter card details on the next screen.'}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {appInstallUrl ? (
              <Button asChild variant="outline">
                <a href={appInstallUrl}>Install or refresh app ({primaryOrg?.name ?? primaryOrg?.id})</a>
              </Button>
            ) : (
              <Button variant="outline" disabled type="button">
                Install app {demoMode ? '(disabled in demo mode)' : '(after GitHub sign-in)'}
              </Button>
            )}
            {primaryOrg ? (
              <Button asChild>
                <Link href={subscribed ? `/app/${primaryOrg.id}/dashboard` : planHref}>
                  {subscribed ? 'Open workspace' : 'Continue to plans'}
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
