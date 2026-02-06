import { NextRequest } from 'next/server';

jest.mock('@/lib/stripe', () => ({
  createCheckoutSession: jest.fn(),
  constructWebhookEvent: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

import { createCheckoutSession, constructWebhookEvent } from '@/lib/stripe';
import { POST as checkoutPOST } from '@/app/api/stripe/checkout-session/route';
import { POST as stripeWebhookPOST } from '@/app/api/webhooks/stripe/route';

describe('/api/stripe/checkout-session', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('returns 400 when agentHandle and email are missing', async () => {
    const req = new NextRequest('http://localhost/api/stripe/checkout-session', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await checkoutPOST(req);
    expect(res.status).toBe(400);
  });

  test('returns session url when Stripe session is created', async () => {
    (createCheckoutSession as unknown as jest.Mock).mockResolvedValue({
      url: 'https://stripe.test/checkout',
    });

    const req = new NextRequest('http://localhost/api/stripe/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ agentHandle: '@demo', plan: 'monthly' }),
    });

    const res = await checkoutPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.url).toBe('https://stripe.test/checkout');
    expect(createCheckoutSession).toHaveBeenCalledTimes(1);
  });
});

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('returns 400 on invalid signature', async () => {
    (constructWebhookEvent as unknown as jest.Mock).mockReturnValue(null);

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'payload',
      headers: {
        'stripe-signature': 'bad',
      },
    });

    const res = await stripeWebhookPOST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe('Invalid signature');
  });

  test('returns received:true on valid event (no-op without supabase)', async () => {
    (constructWebhookEvent as unknown as jest.Mock).mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { customer: 'cus_123', subscription: 'sub_123' } },
    });

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'payload',
      headers: {
        'stripe-signature': 'good',
      },
    });

    const res = await stripeWebhookPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.received).toBe(true);
  });
});
