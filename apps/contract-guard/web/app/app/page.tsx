import { redirect } from 'next/navigation';

import { apiGet } from '../../lib/api-server';

interface OrgMembership {
  id: string;
}

export default async function AppIndexPage() {
  const orgs = await apiGet<OrgMembership[]>('/v1/orgs').catch(() => []);

  if (orgs[0]?.id) {
    redirect(`/app/${orgs[0].id}/dashboard`);
  }

  redirect('/onboarding');
}
