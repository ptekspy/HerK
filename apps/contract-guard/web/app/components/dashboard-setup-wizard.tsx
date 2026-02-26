'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Badge } from '@herk/ui/base/badge';
import { Button } from '@herk/ui/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@herk/ui/base/card';

import { apiPatch } from '../../lib/api';
import type { DashboardWizardStepId, DashboardWizardSummary } from './dashboard-types';

interface DashboardSetupWizardProps {
  orgId: string;
  wizard: DashboardWizardSummary;
  compact?: boolean;
}

function isAcknowledgableStep(stepId: DashboardWizardStepId) {
  return stepId === 'policy_reviewed' || stepId === 'notifications_reviewed';
}

function formatStatusLabel(status: 'completed' | 'pending' | 'warning') {
  if (status === 'completed') return 'Done';
  if (status === 'warning') return 'Needs attention';
  return 'Pending';
}

export function DashboardSetupWizard({ orgId, wizard, compact = false }: DashboardSetupWizardProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (actionKey: string, payload: Record<string, unknown>) => {
    setError(null);
    setLoadingAction(actionKey);

    try {
      await apiPatch(`/v1/orgs/${orgId}/dashboard/wizard-state`, payload);
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Update failed');
    } finally {
      setLoadingAction(null);
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup checklist hidden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {wizard.requiredCompleted}/{wizard.requiredTotal} required tasks complete.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => runAction('resume', { dismissed: false, markSeen: true })}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'resume' ? 'Resuming…' : 'Resume setup'}
            </Button>
            <Button asChild variant="outline">
              <a href={`/app/${orgId}/repos#github-sync`}>Open repositories</a>
            </Button>
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-lg">First-time setup wizard</CardTitle>
          <p className="text-sm text-muted-foreground">
            {wizard.requiredCompleted}/{wizard.requiredTotal} required tasks complete.
          </p>
        </div>
        {!wizard.isComplete ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => runAction('dismiss', { dismissed: true, markSeen: true })}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'dismiss' ? 'Hiding…' : 'Hide for now'}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {wizard.steps.map((step) => (
          <article
            key={step.id}
            className="rounded-lg border border-border/70 bg-muted/30 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">{step.label}</h4>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    step.status === 'warning'
                      ? 'destructive'
                      : step.status === 'completed'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {formatStatusLabel(step.status)}
                </Badge>
                <Badge variant="outline">{step.required ? 'Required' : 'Optional'}</Badge>
              </div>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            {step.note ? <p className="mt-1 text-xs text-muted-foreground">{step.note}</p> : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {step.actionHref && step.actionLabel ? (
                <Button asChild variant="outline" size="sm">
                  <a href={step.actionHref}>{step.actionLabel}</a>
                </Button>
              ) : null}

              {isAcknowledgableStep(step.id) && !step.completed ? (
                <Button
                  size="sm"
                  type="button"
                  onClick={() =>
                    runAction(`ack:${step.id}`, {
                      acknowledgeStepId: step.id,
                      markSeen: true,
                    })
                  }
                  disabled={loadingAction !== null}
                >
                  {loadingAction === `ack:${step.id}` ? 'Saving…' : 'Mark reviewed'}
                </Button>
              ) : null}

              {isAcknowledgableStep(step.id) && step.completed ? (
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    runAction(`clear:${step.id}`, {
                      clearAcknowledgeStepId: step.id,
                    })
                  }
                  disabled={loadingAction !== null}
                >
                  {loadingAction === `clear:${step.id}` ? 'Updating…' : 'Undo review'}
                </Button>
              ) : null}
            </div>
          </article>
        ))}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
