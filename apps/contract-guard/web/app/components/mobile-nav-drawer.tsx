'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { SiteLink } from '../content/site';

import { LogoutButton } from './logout-button';
import { SiteNav } from './site-nav';

interface MobileNavDrawerProps {
  links: SiteLink[];
  isAuthenticated: boolean;
  workspaceHref: string;
  billingHref: string | null;
}

export function MobileNavDrawer({
  links,
  isAuthenticated,
  workspaceHref,
  billingHref,
}: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = 'mobile-site-nav-panel';
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>

      {open ? <button className="mobile-nav-backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}

      <aside className={`mobile-nav-panel ${open ? 'is-open' : ''}`} id={panelId}>
        <div className="mobile-nav-header">
          <strong>Navigation</strong>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            Close
          </button>
        </div>
        <SiteNav links={links} className="mobile-site-nav-links" onNavigate={() => setOpen(false)} />

        <div className="mobile-site-nav-actions">
          {isAuthenticated ? (
            <>
              <Link className="btn btn-secondary" href={workspaceHref}>
                Workspace
              </Link>
              {billingHref ? (
                <Link className="btn btn-secondary" href={billingHref}>
                  Billing
                </Link>
              ) : null}
              <LogoutButton className="btn btn-ghost" />
            </>
          ) : (
            <>
              <Link className="btn btn-secondary" href="/onboarding">
                Sign in
              </Link>
              <Link className="btn btn-primary" href="/onboarding">
                Start free trial
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
