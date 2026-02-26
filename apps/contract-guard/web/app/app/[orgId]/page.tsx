import { redirect } from 'next/navigation';

import { apiGet } from '../../../lib/api-server';

export default async function OrgIndexPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const billing = await apiGet<{ status: string | null }>(`/v1/orgs/${orgId}/billing`).catch(() => ({
    status: null,
  }));

  const isSubscribed =
    billing.status === 'ACTIVE' || billing.status === 'TRIALING' || billing.status === 'PAST_DUE';

  if (!isSubscribed) {
    redirect(`/app/${orgId}/billing`);
  }

  redirect(`/app/${orgId}/dashboard`);
}
