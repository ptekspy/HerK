import Link from 'next/link';

import type { MarketingNavState } from '../content/site';

import { BrandLogo } from './brand-logo';
import { LogoutButton } from './logout-button';
import { MobileNavDrawer } from './mobile-nav-drawer';
import { SiteNav } from './site-nav';

export function SiteHeader({ navState }: { navState: MarketingNavState }) {
  return (
    <header className="site-header">
      <div className="site-header-inner page-wrap">
        <div className="site-brand-wrap">
          <Link className="site-brand-mark" href="/">
            <BrandLogo variant="long" priority />
          </Link>
          <SiteNav links={navState.navLinks} className="site-nav-links desktop-site-nav" />
        </div>

        <div className="site-header-actions">
          {navState.isAuthenticated ? (
            <>
              {navState.billingHref ? (
                <Link className="btn btn-secondary desktop-action" href={navState.billingHref}>
                  Billing
                </Link>
              ) : null}
              <Link className="btn btn-primary desktop-action" href={navState.workspaceHref}>
                Workspace
              </Link>
              <LogoutButton className="btn btn-ghost desktop-action" />
            </>
          ) : (
            <>
              <Link className="btn btn-secondary desktop-action" href="/onboarding">
                Sign in
              </Link>
              <Link className="btn btn-primary desktop-action" href="/onboarding">
                Start free trial
              </Link>
            </>
          )}

          <MobileNavDrawer
            links={navState.navLinks}
            isAuthenticated={navState.isAuthenticated}
            workspaceHref={navState.workspaceHref}
            billingHref={navState.billingHref}
          />
        </div>
      </div>
    </header>
  );
}
