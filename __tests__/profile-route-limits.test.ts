import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

import { PUT as profilePUT } from '@/app/api/profile/route';

describe('/api/profile request limits', () => {
  test('rejects large bodies with 413', async () => {
    const huge = 'x'.repeat(40_000);

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '1.2.3.4',
      },
      body: JSON.stringify({
        agentHandle: '@a',
        premiumConfig: { extendedBio: huge },
      }),
    });

    const res = await profilePUT(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.error).toMatch(/too large/i);
  });
});
