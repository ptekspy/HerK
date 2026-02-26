import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@herk/ui/base/table';

import type { DashboardRecentCheck } from './dashboard-types';

interface DashboardRecentChecksProps {
  checks: DashboardRecentCheck[];
}

export function DashboardRecentChecks({ checks }: DashboardRecentChecksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent checks</CardTitle>
      </CardHeader>
      <CardContent>
        {checks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No checks yet. Open a pull request to trigger your first contract check.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Conclusion</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>PR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>{new Date(check.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{check.conclusion ?? 'N/A'}</TableCell>
                  <TableCell>{check.serviceName}</TableCell>
                  <TableCell>{check.repositoryFullName}</TableCell>
                  <TableCell>#{check.pullRequestNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
