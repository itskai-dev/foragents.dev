import { NextRequest } from 'next/server';

jest.mock('@/lib/stripe', () => ({
  createCheckoutSession: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

import { createCheckoutSession } from '@/lib/stripe';
import { POST as subscribePOST } from '@/app/api/subscribe/route';

describe('/api/subscribe', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('passes plan through to createCheckoutSession', async () => {
    (createCheckoutSession as unknown as jest.Mock).mockResolvedValue({ url: 'https://stripe.test/checkout' });

    const req = new NextRequest('http://localhost/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', plan: 'annual' }),
    });

    const res = await subscribePOST(req);
    expect(res.status).toBe(200);

    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'annual',
        agentHandle: 'test',
      })
    );
  });
});
