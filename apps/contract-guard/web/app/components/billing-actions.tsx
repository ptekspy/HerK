'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';

import { apiPost } from '../../lib/api';
import { SubscriptionCheckoutForm } from './subscription-checkout-form';

export function BillingActions({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState<'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setError(null);
    setLoading('portal');

    try {
      const result = await apiPost<{ portalUrl?: string; mode?: string }>(
        `/v1/orgs/${orgId}/billing/portal-session`,
        {},
      );

      if (!result.portalUrl) {
        throw new Error('Portal URL was not returned by API.');
      }

      window.location.assign(result.portalUrl);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Portal launch failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <SubscriptionCheckoutForm orgId={orgId} ctaLabel="Choose plan and checkout" />
      <Button type="button" variant="outline" onClick={openPortal} disabled={loading !== null}>
        {loading === 'portal' ? 'Opening portal…' : 'Open customer portal'}
      </Button>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
