import type Stripe from 'stripe';

import { WebhooksService } from './webhooks.service';

describe('WebhooksService Stripe integration', () => {
  const prisma = {
    webhookEvent: {
      create: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as {
    webhookEvent: {
      create: jest.Mock;
      update: jest.Mock;
    };
    subscription: {
      upsert: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const service = new WebhooksService(
    prisma as never,
    {
      enqueuePrAnalysis: jest.fn(),
    } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.webhookEvent.create.mockResolvedValue({ id: 'evt_db_1' });
    prisma.webhookEvent.update.mockResolvedValue({});
  });

  it('syncs checkout.session.completed into subscription upsert', async () => {
    const event = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_1',
          subscription: 'sub_1',
          metadata: {
            orgId: 'org_1',
          },
        },
      },
    } as unknown as Stripe.Event;

    const result = await service.handleStripeWebhook(event, {
      id: 'evt_1',
    });

    expect(result).toEqual({ ok: true });
    expect(prisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          orgId: 'org_1',
        },
      }),
    );
  });

  it('syncs customer.subscription.updated status and period end', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'sub_db_1',
    });

    const event = {
      id: 'evt_2',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_1',
          status: 'active',
          cancel_at_period_end: false,
          items: {
            data: [
              {
                current_period_end: 1_900_000_000,
              },
            ],
          },
        },
      },
    } as unknown as Stripe.Event;

    const result = await service.handleStripeWebhook(event, {
      id: 'evt_2',
    });

    expect(result).toEqual({ ok: true });
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub_db_1' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        }),
      }),
    );

    const updateCall = prisma.subscription.update.mock.calls[0][0];
    expect(updateCall.data.currentPeriodEnd).toBeInstanceOf(Date);
  });
});
