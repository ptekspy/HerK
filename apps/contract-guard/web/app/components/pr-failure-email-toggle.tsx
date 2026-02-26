'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@herk/ui/base/card';
import { Label } from '@herk/ui/base/label';
import { Switch } from '@herk/ui/base/switch';

import { apiPatch } from '../../lib/api';

interface PrFailureEmailToggleProps {
  orgId: string;
  initialValue: boolean;
}

export function PrFailureEmailToggle({ orgId, initialValue }: PrFailureEmailToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (next: boolean) => {
    setEnabled(next);
    setSaving(true);
    setError(null);

    try {
      await apiPatch(`/v1/orgs/${orgId}/notifications/preferences`, {
        emailOnPrFailure: next,
      });
    } catch (toggleError) {
      setEnabled(!next);
      setError(toggleError instanceof Error ? toggleError.message : 'Failed to update email preference');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">PR failure emails</CardTitle>
        <CardDescription>
          Email notifications for failed/error API Contract Guard pull request checks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="pr-failure-email-toggle"
            checked={enabled}
            disabled={saving}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
          />
          <Label htmlFor="pr-failure-email-toggle">{enabled ? 'Enabled' : 'Disabled'}</Label>
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
