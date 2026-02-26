import { SectionHeader } from '../../../components/section-header';
import { TeamInviteForm } from '../../../components/team-invite-form';
import { TeamMemberActions } from '../../../components/team-member-actions';

import { apiGet } from '../../../../lib/api-server';

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
  const members = await apiGet<Member[]>(`/v1/orgs/${orgId}/members`).catch(() => []);

  return (
    <>
      <SectionHeader title="Team" subtitle="Owner/Admin/Member/Viewer role management" />

      <section className="grid">
        <article className="card card-grid-6">
          <h3>Members</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.user.name ?? 'N/A'}</td>
                  <td>{member.user.email ?? 'N/A'}</td>
                  <td>{member.role}</td>
                  <td>
                    <TeamMemberActions
                      orgId={orgId}
                      memberId={member.id}
                      initialRole={member.role}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-grid-6">
          <h3>Invite member</h3>
          <TeamInviteForm orgId={orgId} />
        </article>
      </section>
    </>
  );
}
