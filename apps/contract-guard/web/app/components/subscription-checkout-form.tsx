'use client';

import { useMemo, useState } from 'react';

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
    <div className="form-grid mt-form-offset">
      <label htmlFor="plan-select">
        Plan
        <select
          id="plan-select"
          value={plan}
          onChange={(event) => setPlan(event.target.value as BillingPlan)}
          disabled={loading}
        >
          <option value="STARTER">Starter</option>
          <option value="GROWTH">Growth</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </label>
      <label htmlFor="billing-cycle-select">
        Billing cycle
        <select
          id="billing-cycle-select"
          value={billingCycle}
          onChange={(event) => setBillingCycle(event.target.value as BillingCycle)}
          disabled={loading}
        >
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly (2 months free)</option>
        </select>
      </label>
      <p className="text-muted mt-0 mb-0">{helpText}</p>
      <button className="btn btn-primary" type="button" onClick={openCheckout} disabled={loading}>
        {loading ? 'Opening checkout…' : ctaLabel}
      </button>
      <p className="text-muted mt-0 mb-0">
        3-day free trial. Card details are collected at checkout.
      </p>
      {error && <p className="flash flash-error">{error}</p>}
    </div>
  );
}
