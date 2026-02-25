import { SectionHeader } from '../../../components/section-header';

import { apiGet } from '../../../../lib/api';

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  readAt: string | null;
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const notifications = await apiGet<Notification[]>(`/v1/orgs/${orgId}/notifications`).catch(
    () => [],
  );

  return (
    <>
      <SectionHeader title="Notifications" subtitle="In-app alerts for failing and warning checks" />
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Message</th>
              <th>Read</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td>{notification.kind}</td>
                <td>{notification.title}</td>
                <td>{notification.body}</td>
                <td>{notification.readAt ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
