import { redirect } from 'next/navigation';

import { apiGet } from './api-server';

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['ACTIVE', 'TRIALING', 'PAST_DUE']);

export function isSubscriptionActive(status: string | null | undefined) {
  return Boolean(status && ACTIVE_SUBSCRIPTION_STATUSES.has(status));
}

export async function requireActiveSubscription(orgId: string) {
  const billing = await apiGet<{ status: string | null }>(`/v1/orgs/${orgId}/billing`).catch(() => ({
    status: null,
  }));

  if (!isSubscriptionActive(billing.status)) {
    redirect(`/app/${orgId}/billing`);
  }
}
