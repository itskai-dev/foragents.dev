import { NextRequest } from 'next/server';

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        retrieve: jest.fn(),
      },
    },
  },
  mapSubscriptionStatus: (s: string) => s,
}));

jest.mock('@/lib/server/supabase-admin', () => ({
  getSupabaseAdmin: jest.fn(),
}));

import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { GET as activateGET } from '@/app/api/stripe/activate/route';

describe('/api/stripe/activate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('400 when session_id missing', async () => {
    const req = new NextRequest('http://localhost/api/stripe/activate');
    const res = await activateGET(req);
    expect(res.status).toBe(400);
  });

  test('200 and updates agent when session complete', async () => {
    // Minimal supabase chain mock
    const eq = jest.fn().mockResolvedValue({ data: null, error: null });
    const update = jest.fn(() => ({ eq }));
    const upsert = jest.fn().mockResolvedValue({ data: null, error: null });
    const from = jest.fn((table: string) => {
      if (table === 'agents') return { update };
      if (table === 'subscriptions') return { upsert };
      throw new Error('unknown table ' + table);
    });

    (getSupabaseAdmin as unknown as jest.Mock).mockReturnValue({ from });

    (stripe.checkout.sessions.retrieve as unknown as jest.Mock).mockResolvedValue({
      id: 'cs_test',
      status: 'complete',
      mode: 'subscription',
      customer: 'cus_123',
      metadata: { agentId: 'agent_1', agentHandle: 'demo' },
      subscription: {
        id: 'sub_123',
        status: 'active',
        current_period_end: 1730000000,
        current_period_start: 1720000000,
        cancel_at_period_end: false,
        items: { data: [{ price: { id: 'price_123' } }] },
      },
    });

    const req = new NextRequest('http://localhost/api/stripe/activate?session_id=cs_test');
    const res = await activateGET(req);
    expect(res.status).toBe(200);

    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith('cs_test', { expand: ['subscription'] });
    expect(from).toHaveBeenCalledWith('subscriptions');
    expect(from).toHaveBeenCalledWith('agents');
    expect(update).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'agent_1');

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.isPremium).toBe(true);
  });
});
