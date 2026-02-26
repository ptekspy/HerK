import { Card, CardContent } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import { SectionHeader } from '../../../components/section-header';
import { MarkNotificationsReadButton } from '../../../components/mark-notifications-read-button';
import { PrFailureEmailToggle } from '../../../components/pr-failure-email-toggle';

import { apiGet } from '../../../../lib/api-server';
import { requireActiveSubscription } from '../../../../lib/subscription';

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  link?: string | null;
  readAt: string | null;
}

interface NotificationPreferences {
  emailOnPrFailure: boolean;
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  await requireActiveSubscription(orgId);
  const notifications = await apiGet<Notification[]>(`/v1/orgs/${orgId}/notifications`).catch(
    () => [],
  );
  const preferences = await apiGet<NotificationPreferences>(
    `/v1/orgs/${orgId}/notifications/preferences`,
  ).catch(() => ({
    emailOnPrFailure: true,
  }));
  const unreadIds = notifications.filter((notification) => !notification.readAt).map((notification) => notification.id);

  return (
    <>
      <SectionHeader title="Notifications" subtitle="In-app alerts for failing and warning checks" />
      <PrFailureEmailToggle orgId={orgId} initialValue={preferences.emailOnPrFailure} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-2">
            <MarkNotificationsReadButton
              orgId={orgId}
              label="Mark all unread as read"
              disabled={unreadIds.length === 0}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.kind}</TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>
                    {notification.body}
                    {notification.link ? (
                      <>
                        {' '}
                        <a className="text-primary hover:underline" href={notification.link}>Open</a>
                      </>
                    ) : null}
                  </TableCell>
                  <TableCell>{notification.readAt ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <MarkNotificationsReadButton
                      orgId={orgId}
                      ids={[notification.id]}
                      label="Mark read"
                      disabled={Boolean(notification.readAt)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
