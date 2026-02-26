'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@herk/utils';

import { BrandLogo } from './brand-logo';

const navItems = [
  { href: 'dashboard', label: 'Dashboard' },
  { href: 'repos', label: 'Repositories' },
  { href: 'services', label: 'Services' },
  { href: 'policies', label: 'Policies' },
  { href: 'checks', label: 'Checks' },
  { href: 'waivers', label: 'Waivers' },
  { href: 'notifications', label: 'Notifications' },
  { href: 'team', label: 'Team' },
  { href: 'billing', label: 'Billing' },
];

export function OrgNav({ orgId }: { orgId: string }) {
  const pathname = usePathname();

  return (
    <nav className="w-full shrink-0 border-b border-border/70 bg-sidebar px-4 py-4 md:sticky md:top-[var(--header-height)] md:h-[calc(100vh-var(--header-height))] md:w-64 md:border-b-0 md:border-r md:py-5">
      <div className="mb-5 flex items-center gap-2 border-b border-sidebar-border pb-4">
        <BrandLogo variant="square" className="w-8" />
        <span className="text-sm font-semibold text-sidebar-foreground">API Contract Guard</span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0">
        {navItems.map((item) => {
          const href = `/app/${orgId}/${item.href}`;
          const active = pathname === href;

          return (
            <Link
              key={item.href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
