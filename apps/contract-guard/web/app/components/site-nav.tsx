'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@herk/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@herk/ui/base/navigation-menu';

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
    <NavigationMenu className={cn('max-w-none justify-start', className)}>
      <NavigationMenuList className="flex-wrap gap-1">
        {links.map((item) => {
          const active = isActiveLink(pathname, item.href);
          return (
            <NavigationMenuItem key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
