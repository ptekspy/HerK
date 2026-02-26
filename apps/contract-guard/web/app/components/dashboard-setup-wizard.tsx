'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

function statusBadgeClass(status: 'completed' | 'pending' | 'warning') {
  if (status === 'completed') return 'badge-pass';
  if (status === 'warning') return 'badge-warn';
  return 'badge-pending';
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
      <section className="card dashboard-wizard dashboard-wizard-compact">
        <div className="dashboard-wizard-topline">
          <h3>Setup checklist hidden</h3>
          <p>
            {wizard.requiredCompleted}/{wizard.requiredTotal} required tasks complete.
          </p>
        </div>
        <div className="cta-row">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => runAction('resume', { dismissed: false, markSeen: true })}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'resume' ? 'Resuming…' : 'Resume setup'}
          </button>
          <a className="btn btn-secondary" href={`/app/${orgId}/repos#github-sync`}>
            Open repositories
          </a>
        </div>
        {error && <p className="flash flash-error">{error}</p>}
      </section>
    );
  }

  return (
    <section className="card dashboard-wizard">
      <div className="dashboard-wizard-head">
        <div>
          <h3>First-time setup wizard</h3>
          <p>
            {wizard.requiredCompleted}/{wizard.requiredTotal} required tasks complete.
          </p>
        </div>
        {!wizard.isComplete && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => runAction('dismiss', { dismissed: true, markSeen: true })}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'dismiss' ? 'Hiding…' : 'Hide for now'}
          </button>
        )}
      </div>

      <div className="dashboard-wizard-steps">
        {wizard.steps.map((step) => (
          <article
            key={step.id}
            className={`dashboard-wizard-step dashboard-wizard-step-${step.status}`}
          >
            <div className="dashboard-wizard-step-head">
              <h4>{step.label}</h4>
              <div className="dashboard-wizard-badges">
                <span className={`badge ${statusBadgeClass(step.status)}`}>
                  {formatStatusLabel(step.status)}
                </span>
                <span className="badge dashboard-wizard-required-badge">
                  {step.required ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>

            <p>{step.description}</p>
            {step.note ? <p className="dashboard-wizard-step-note">{step.note}</p> : null}

            <div className="cta-row">
              {step.actionHref && step.actionLabel ? (
                <a className="btn btn-secondary" href={step.actionHref}>
                  {step.actionLabel}
                </a>
              ) : null}

              {isAcknowledgableStep(step.id) && !step.completed ? (
                <button
                  className="btn btn-primary"
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
                </button>
              ) : null}

              {isAcknowledgableStep(step.id) && step.completed ? (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() =>
                    runAction(`clear:${step.id}`, {
                      clearAcknowledgeStepId: step.id,
                    })
                  }
                  disabled={loadingAction !== null}
                >
                  {loadingAction === `clear:${step.id}` ? 'Updating…' : 'Undo review'}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {error && <p className="flash flash-error">{error}</p>}
    </section>
  );
}
