import Link from 'next/link';
import { Button } from '@herk/ui/base/button';

import type { MarketingNavState } from '../content/site';

import { BrandLogo } from './brand-logo';
import { LogoutButton } from './logout-button';
import { MobileNavDrawer } from './mobile-nav-drawer';
import { SiteNav } from './site-nav';

export function SiteHeader({ navState }: { navState: MarketingNavState }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link className="inline-flex items-center" href="/">
            <BrandLogo variant="long" priority />
          </Link>
          <SiteNav links={navState.navLinks} className="hidden md:flex" />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {navState.isAuthenticated ? (
            <>
              {navState.billingHref ? (
                <Button asChild variant="outline">
                  <Link href={navState.billingHref}>Billing</Link>
                </Button>
              ) : null}
              <Button asChild>
                <Link href={navState.workspaceHref}>Workspace</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/onboarding">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/onboarding">Start free trial</Link>
              </Button>
            </>
          )}
        </div>

        <MobileNavDrawer
          links={navState.navLinks}
          isAuthenticated={navState.isAuthenticated}
          workspaceHref={navState.workspaceHref}
          billingHref={navState.billingHref}
        />
      </div>
    </header>
  );
}
