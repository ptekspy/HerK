import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import type { DashboardRecentNotification } from './dashboard-types';

interface DashboardRecentNotificationsProps {
  notifications: DashboardRecentNotification[];
}

export function DashboardRecentNotifications({ notifications }: DashboardRecentNotificationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{new Date(notification.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{notification.kind}</TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.readAt ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
