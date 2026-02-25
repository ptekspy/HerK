import { SectionHeader } from '../../../components/section-header';
import { SimpleCreateForm } from '../../../components/simple-form';

import { apiGet } from '../../../../lib/api-server';

interface Member {
  id: string;
  role: string;
  user: {
    email: string;
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
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.user.name ?? 'N/A'}</td>
                  <td>{member.user.email}</td>
                  <td>{member.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card card-grid-6">
          <h3>Invite member</h3>
          <SimpleCreateForm
            endpoint={`/v1/orgs/${orgId}/members`}
            title="member"
            fields={[
              { name: 'email', label: 'Email', placeholder: 'engineer@acme.com' },
              { name: 'role', label: 'Role', placeholder: 'MEMBER' },
              { name: 'name', label: 'Name', placeholder: 'Teammate Name' },
            ]}
          />
        </article>
      </section>
    </>
  );
}
