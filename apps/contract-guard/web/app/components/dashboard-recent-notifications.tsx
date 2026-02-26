import type { DashboardRecentNotification } from './dashboard-types';

interface DashboardRecentNotificationsProps {
  notifications: DashboardRecentNotification[];
}

export function DashboardRecentNotifications({ notifications }: DashboardRecentNotificationsProps) {
  return (
    <article className="card card-grid-6">
      <h3>Recent notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Title</th>
              <th>Read</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td>{new Date(notification.createdAt).toLocaleString()}</td>
                <td>{notification.kind}</td>
                <td>{notification.title}</td>
                <td>{notification.readAt ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
