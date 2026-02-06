import { NextRequest } from 'next/server';

// Force JSON fallback store, but keep it in-memory by mocking fs.
jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(() => null),
}));

let memFile = '[]';

jest.mock('node:fs/promises', () => ({
  __esModule: true,
  default: {
    readFile: jest.fn(async () => memFile),
    writeFile: jest.fn(async (_p: string, content: string) => {
      memFile = content;
    }),
    mkdir: jest.fn(async () => undefined),
  },
}));

jest.mock('@/lib/server/ssrf', () => ({
  safeFetch: jest.fn(),
}));

import { safeFetch } from '@/lib/server/ssrf';
import {
  generateVerificationCode,
  normalizeHandle,
  validateHttpsUrl,
} from '@/lib/verifications';
import { POST as startPOST } from '@/app/api/verify/start/route';
import { POST as checkPOST } from '@/app/api/verify/check/route';

describe('verification v0', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    memFile = '[]';
  });

  test('normalizeHandle accepts @name@domain and lowercases', () => {
    expect(normalizeHandle('@Kai@Example.COM')).toBe('@kai@example.com');
    expect(() => normalizeHandle('kai@example.com')).toThrow(/expected @name@domain/i);
  });

  test('validateHttpsUrl rejects http', () => {
    expect(() => validateHttpsUrl('http://example.com')).toThrow(/https/i);
    expect(validateHttpsUrl('https://example.com/a')).toBe('https://example.com/a');
  });

  test('generateVerificationCode produces stable prefix', () => {
    const c = generateVerificationCode();
    expect(c.startsWith('foragents-verify-')).toBe(true);
    expect(c.length).toBeGreaterThan(20);
  });

  test('/api/verify/start returns id+code+instructions', async () => {
    const req = new NextRequest('http://localhost/api/verify/start', {
      method: 'POST',
      body: JSON.stringify({ handle: '@kai@example.com' }),
    });

    const res = await startPOST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.verification_id).toBeTruthy();
    expect(json.code).toMatch(/^foragents-verify-/);
    expect(String(json.instructions)).toContain('POST /api/verify/check');
  });

  test('/api/verify/check succeeds when code is present', async () => {
    // Start one
    const startReq = new NextRequest('http://localhost/api/verify/start', {
      method: 'POST',
      body: JSON.stringify({ handle: '@kai@example.com' }),
    });
    const startRes = await startPOST(startReq);
    const startJson = await startRes.json();

    (safeFetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/html' }),
      body: null,
      text: async () => `hello ${startJson.code} world`,
    });

    const checkReq = new NextRequest('http://localhost/api/verify/check', {
      method: 'POST',
      body: JSON.stringify({
        verification_id: startJson.verification_id,
        url: 'https://example.com/proof',
      }),
    });

    const checkRes = await checkPOST(checkReq);
    expect(checkRes.status).toBe(200);

    const checkJson = await checkRes.json();
    expect(checkJson.status).toBe('succeeded');
  });

  test('/api/verify/check fails when code is missing', async () => {
    const startReq = new NextRequest('http://localhost/api/verify/start', {
      method: 'POST',
      body: JSON.stringify({ handle: '@kai@example.com' }),
    });
    const startRes = await startPOST(startReq);
    const startJson = await startRes.json();

    (safeFetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/plain' }),
      body: null,
      text: async () => 'nope',
    });

    const checkReq = new NextRequest('http://localhost/api/verify/check', {
      method: 'POST',
      body: JSON.stringify({
        verification_id: startJson.verification_id,
        url: 'https://example.com/proof',
      }),
    });

    const checkRes = await checkPOST(checkReq);
    const checkJson = await checkRes.json();
    expect(checkJson.status).toBe('failed');
    expect(checkJson.reason).toBe('code_not_found');
  });
});
