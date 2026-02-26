'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SiteLink } from '../content/site';

interface SiteNavProps {
  links: SiteLink[];
  className?: string;
  onNavigate?: () => void;
}

function isActiveLink(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  if (href.startsWith('/app/')) {
    return pathname.startsWith('/app/');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ links, className, onNavigate }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Primary navigation">
      {links.map((item) => {
        const active = isActiveLink(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
