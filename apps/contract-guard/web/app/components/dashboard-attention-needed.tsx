import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@herk/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

import type { DashboardAttentionItem } from './dashboard-types';

interface DashboardAttentionNeededProps {
  attention: DashboardAttentionItem[];
}

export function DashboardAttentionNeeded({ attention }: DashboardAttentionNeededProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attention needed</CardTitle>
      </CardHeader>
      <CardContent>
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">No urgent issues detected.</p>
        ) : (
          <div className="space-y-3">
            {attention.map((item) => (
              <article
                key={item.key}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3"
              >
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {item.level === 'error' ? (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
                {item.href ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={item.href}>Open</a>
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
