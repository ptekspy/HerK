import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import { SectionHeader } from '../../../components/section-header';
import { TeamInviteForm } from '../../../components/team-invite-form';
import { TeamMemberActions } from '../../../components/team-member-actions';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Member {
  id: string;
  role: string;
  user: {
    email: string | null;
    name: string | null;
  };
}

export default async function TeamPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const members = await apiGet<Member[]>(`/v1/orgs/${orgId}/members`).catch(() => []);

  return (
    <>
      <SectionHeader title="Team" subtitle="Owner/Admin/Member/Viewer role management" />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.user.name ?? 'N/A'}</TableCell>
                    <TableCell>{member.user.email ?? 'N/A'}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <TeamMemberActions
                        orgId={orgId}
                        memberId={member.id}
                        initialRole={member.role}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite member</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamInviteForm orgId={orgId} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
