'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@herk/ui/base/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@herk/ui/base/sheet';

import type { SiteLink } from '../content/site';

import { BrandLogo } from './brand-logo';
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

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="grid grid-rows-[auto_1fr_auto] gap-6">
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <BrandLogo variant="square" className="w-8" />
              Navigation
            </SheetTitle>
          </SheetHeader>

          <SiteNav
            links={links}
            className="w-full items-start justify-start"
            onNavigate={() => setOpen(false)}
          />

          <div className="grid gap-3">
            {isAuthenticated ? (
              <>
                <Button asChild variant="outline">
                  <Link href={workspaceHref} onClick={() => setOpen(false)}>
                    Workspace
                  </Link>
                </Button>
                {billingHref ? (
                  <Button asChild variant="outline">
                    <Link href={billingHref} onClick={() => setOpen(false)}>
                      Billing
                    </Link>
                  </Button>
                ) : null}
                <LogoutButton className="justify-start" />
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/onboarding" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/onboarding" onClick={() => setOpen(false)}>
                    Start free trial
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
