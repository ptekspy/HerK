import { Button } from '@herk/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

interface DashboardQuickActionsProps {
  orgId: string;
}

export function DashboardQuickActions({ orgId }: DashboardQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Jump to the actions needed most during setup and daily operations.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/app/${orgId}/repos#github-sync`}>Refresh repositories</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/app/${orgId}/services#create-service`}>Create service</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/app/${orgId}/policies`}>Edit policy</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/app/${orgId}/notifications`}>Notification settings</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/app/${orgId}/billing`}>Billing</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
