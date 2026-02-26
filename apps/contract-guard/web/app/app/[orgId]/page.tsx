import { redirect } from 'next/navigation';

import { requireActiveSubscription } from '../../../lib/subscription';

export default async function OrgIndexPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);

  redirect(`/app/${orgId}/dashboard`);
}
