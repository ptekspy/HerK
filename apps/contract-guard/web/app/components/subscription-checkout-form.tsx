'use client';

import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@herk/ui/base/alert';
import { Button } from '@herk/ui/base/button';
import { Label } from '@herk/ui/base/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@herk/ui/base/select';

import { apiPost } from '../../lib/api';

type BillingPlan = 'STARTER' | 'GROWTH' | 'ENTERPRISE';
type BillingCycle = 'MONTHLY' | 'YEARLY';

interface SubscriptionCheckoutFormProps {
  orgId: string;
  successUrl?: string;
  cancelUrl?: string;
  ctaLabel?: string;
}

export function SubscriptionCheckoutForm({
  orgId,
  successUrl,
  cancelUrl,
  ctaLabel = 'Start 3-day trial',
}: SubscriptionCheckoutFormProps) {
  const [plan, setPlan] = useState<BillingPlan>('GROWTH');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const helpText = useMemo(() => {
    if (plan === 'STARTER') return 'Starter: up to 3 services.';
    if (plan === 'GROWTH') return 'Growth: up to 15 services.';
    return 'Enterprise: unlimited services.';
  }, [plan]);

  const openCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await apiPost<{ checkoutUrl?: string }>(
        `/v1/orgs/${orgId}/billing/checkout-session`,
        {
          plan,
          billingCycle,
          successUrl,
          cancelUrl,
        },
      );

      if (!result.checkoutUrl) {
        throw new Error('Checkout URL was not returned by API.');
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Plan</Label>
          <Select value={plan} onValueChange={(value) => setPlan(value as BillingPlan)} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STARTER">Starter</SelectItem>
              <SelectItem value="GROWTH">Growth</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Billing cycle</Label>
          <Select
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as BillingCycle)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly (2 months free)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{helpText}</p>
      <Button type="button" onClick={openCheckout} disabled={loading}>
        {loading ? 'Opening checkout…' : ctaLabel}
      </Button>
      <p className="text-sm text-muted-foreground">
        3-day free trial. Card details are collected at checkout.
      </p>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
