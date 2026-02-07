import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

import { POST as premiumPOST } from '@/app/api/agents/profile/premium/route';

describe('/api/agents/profile/premium request limits', () => {
  test('rejects large bodies with 413', async () => {
    const huge = 'x'.repeat(50_000);

    const req = new NextRequest('http://localhost/api/agents/profile/premium', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '1.2.3.4',
      },
      body: JSON.stringify({
        agentHandle: '@a',
        config: { extendedBio: huge },
      }),
    });

    const res = await premiumPOST(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.error).toMatch(/too large/i);
  });
});
