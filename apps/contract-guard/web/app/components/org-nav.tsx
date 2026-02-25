'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <nav className="side-nav">
      <div className="brand">ContractGuard</div>
      {navItems.map((item) => {
        const href = `/app/${orgId}/${item.href}`;
        const active = pathname === href;

        return (
          <Link key={item.href} href={href} aria-current={active ? 'page' : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
