import { NextRequest } from 'next/server';

jest.mock('@/lib/ingest-runtime', () => ({
  runIngestion: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadIngestPOST() {
  // CRON_SECRET is read at module load time in the route.
  jest.resetModules();
  const mod = await import('@/app/api/ingest/route');
  return mod.POST as typeof mod.POST;
}

describe('/api/ingest', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.CRON_SECRET;
  });

  test('returns 401 when CRON_SECRET is set and auth header missing/incorrect', async () => {
    process.env.CRON_SECRET = 'secret';
    const ingestPOST = await loadIngestPOST();

    const req = new NextRequest('http://localhost/api/ingest', { method: 'POST' });
    const res = await ingestPOST(req);
    expect(res.status).toBe(401);
  });

  test('runs ingestion and returns success when authorized', async () => {
    process.env.CRON_SECRET = 'secret';
    const ingestPOST = await loadIngestPOST();

    const { runIngestion } = jest.requireMock('@/lib/ingest-runtime') as {
      runIngestion: jest.Mock;
    };

    runIngestion.mockResolvedValue({
      items: [],
      stats: { fetched: 0, parsed: 0 },
    });

    const req = new NextRequest('http://localhost/api/ingest', {
      method: 'POST',
      headers: {
        authorization: 'Bearer secret',
      },
    });

    const res = await ingestPOST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.supabaseConfigured).toBe(false);
    expect(runIngestion).toHaveBeenCalledTimes(1);
  });

  test('returns 500 when ingestion throws', async () => {
    const ingestPOST = await loadIngestPOST();

    const { runIngestion } = jest.requireMock('@/lib/ingest-runtime') as {
      runIngestion: jest.Mock;
    };
    runIngestion.mockRejectedValue(new Error('boom'));

    const req = new NextRequest('http://localhost/api/ingest', { method: 'POST' });
    const res = await ingestPOST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe('Ingestion failed');
  });
});
