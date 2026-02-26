import { cookies } from 'next/headers';

import type { MarketingNavState, PrimaryOrg, SessionUser } from '../app/content/site';
import { MARKETING_NAV_LINKS } from '../app/content/site';

function getApiBaseUrl() {
  return (
    process.env.INTERNAL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://localhost:4001'
  );
}

async function fetchWithSession(path: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const headers: Record<string, string> = {};

  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    headers,
    cache: 'no-store',
    credentials: 'include',
  });
}

export async function getOptionalSession(): Promise<SessionUser | null> {
  let response: Response;
  try {
    response = await fetchWithSession('/auth/session');
  } catch {
    return null;
  }

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<SessionUser>;
}

export async function getPrimaryOrg(session: SessionUser | null): Promise<PrimaryOrg | null> {
  if (!session) {
    return null;
  }

  let response: Response;
  try {
    response = await fetchWithSession('/v1/orgs');
  } catch {
    return null;
  }
  if (!response.ok) {
    return null;
  }

  const orgs = (await response.json()) as PrimaryOrg[];
  return orgs[0] ?? null;
}

export function toMarketingNavState(session: SessionUser | null, org: PrimaryOrg | null): MarketingNavState {
  const workspaceHref = org ? `/app/${org.id}/dashboard` : '/onboarding';
  const billingHref = org ? `/app/${org.id}/billing` : null;

  return {
    isAuthenticated: Boolean(session),
    workspaceHref,
    billingHref,
    navLinks: session ? [...MARKETING_NAV_LINKS, { label: 'Workspace', href: workspaceHref }] : MARKETING_NAV_LINKS,
  };
}
