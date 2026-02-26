export interface SessionMembership {
  orgId: string;
  role: string;
}

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  memberships: SessionMembership[];
  expiresAt: string;
}

export interface PrimaryOrg {
  id: string;
  name: string;
}

export interface SiteLink {
  label: string;
  href: string;
}

export interface MarketingNavState {
  isAuthenticated: boolean;
  workspaceHref: string;
  billingHref: string | null;
  navLinks: SiteLink[];
}

export interface FooterColumn {
  heading: string;
  links: SiteLink[];
}

export const SITE_BRAND_NAME = 'API Contract Guard';
export const LEGAL_LAST_UPDATED = 'February 26, 2026';
export const DEFAULT_SUPPORT_EMAIL = 'support@apicontractguard.com';

export const MARKETING_NAV_LINKS: SiteLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Help', href: '/help' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'App', href: '/app' },
      { label: 'Onboarding', href: '/onboarding' },
    ],
  },
  {
    heading: 'Company',
    links: [{ label: 'About', href: '/about' }],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Use', href: '/terms-of-use' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
  {
    heading: 'Support',
    links: [{ label: 'Help', href: '/help' }],
  },
];

export function getSupportEmail() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
}

export function getStatusPageUrl() {
  const value = process.env.NEXT_PUBLIC_STATUS_PAGE_URL?.trim();
  return value && value.length > 0 ? value : null;
}

export function getSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_WEB_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // ignore malformed value
    }
  }

  return 'http://localhost:4000';
}
