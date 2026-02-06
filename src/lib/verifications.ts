import 'server-only';

import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { getSupabase } from '@/lib/supabase';

export type VerificationStatus = 'pending' | 'succeeded' | 'failed';

export type VerificationRecord = {
  id: string;
  handle: string; // normalized full handle: @name@domain
  code: string;
  status: VerificationStatus;
  url?: string;
  created_at: string;
  checked_at?: string;
  reason?: string;
};

const VERIFICATIONS_PATH = path.join(process.cwd(), 'data', 'verifications.json');

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_FETCH_BYTES = 200 * 1024;
export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_CHECKS_PER_HOUR = 10;

export function normalizeHandle(input: string): string {
  const h = input.trim();
  // Expect @name@domain (fediverse-like)
  if (!/^@[A-Za-z0-9_\-.]+@[A-Za-z0-9\-.]+$/.test(h)) {
    throw new Error('Invalid handle format; expected @name@domain');
  }
  return h.toLowerCase();
}

export function generateVerificationCode(): string {
  // URL-safe, human copy/paste friendly
  const rand = crypto.randomBytes(16).toString('base64url');
  return `foragents-verify-${rand}`;
}

export function isExpired(createdAtIso: string, now = Date.now()): boolean {
  const created = Date.parse(createdAtIso);
  if (!Number.isFinite(created)) return true;
  return now - created > VERIFICATION_TTL_MS;
}

export function validateHttpsUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Invalid URL');
  }
  if (url.protocol !== 'https:') throw new Error('Only https URLs are allowed');
  if (url.username || url.password) throw new Error('Userinfo not allowed in URL');
  // Avoid absurdly long URLs
  if (input.length > 2000) throw new Error('URL too long');
  return url.toString();
}

async function readFromFile(): Promise<VerificationRecord[]> {
  try {
    const raw = await fs.readFile(VERIFICATIONS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as VerificationRecord[];
  } catch {
    return [];
  }
}

async function writeToFile(records: VerificationRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(VERIFICATIONS_PATH), { recursive: true });
  await fs.writeFile(VERIFICATIONS_PATH, JSON.stringify(records, null, 2) + '\n', 'utf-8');
}

export async function createVerification(handle: string): Promise<VerificationRecord> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const record: VerificationRecord = {
    id: crypto.randomUUID(),
    handle,
    code: generateVerificationCode(),
    status: 'pending',
    created_at: now,
  };

  if (supabase) {
    const { error } = await supabase.from('verifications').insert({
      id: record.id,
      handle: record.handle,
      code: record.code,
      status: record.status,
      created_at: record.created_at,
    });
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return record;
  }

  const all = await readFromFile();
  all.push(record);
  await writeToFile(all);
  return record;
}

export async function getVerificationById(id: string): Promise<VerificationRecord | null> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Supabase select failed: ${error.message}`);
    if (!data) return null;

    return {
      id: data.id,
      handle: data.handle,
      code: data.code,
      status: data.status,
      url: data.url ?? undefined,
      created_at: data.created_at,
      checked_at: data.checked_at ?? undefined,
      reason: data.reason ?? undefined,
    };
  }

  const all = await readFromFile();
  return all.find((v) => v.id === id) ?? null;
}

export async function updateVerification(id: string, patch: Partial<VerificationRecord>): Promise<void> {
  const supabase = getSupabase();

  if (supabase) {
    const { error } = await supabase.from('verifications').update({
      ...(patch.handle !== undefined ? { handle: patch.handle } : {}),
      ...(patch.code !== undefined ? { code: patch.code } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.url !== undefined ? { url: patch.url } : {}),
      ...(patch.created_at !== undefined ? { created_at: patch.created_at } : {}),
      ...(patch.checked_at !== undefined ? { checked_at: patch.checked_at } : {}),
      ...(patch.reason !== undefined ? { reason: patch.reason } : {}),
    }).eq('id', id);

    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return;
  }

  const all = await readFromFile();
  const idx = all.findIndex((v) => v.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch };
  await writeToFile(all);
}

export async function countRecentChecks(handle: string, sinceIso: string): Promise<number> {
  const supabase = getSupabase();

  if (supabase) {
    // Count rows checked since timestamp
    const { data, error } = await supabase
      .from('verifications')
      .select('id, checked_at')
      .eq('handle', handle)
      .gte('checked_at', sinceIso);

    if (error) throw new Error(`Supabase count failed: ${error.message}`);
    return (data ?? []).length;
  }

  const all = await readFromFile();
  const since = Date.parse(sinceIso);
  return all.filter((v) => v.handle === handle && v.checked_at && Date.parse(v.checked_at) >= since).length;
}

export async function isHandleVerified(handle: string): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('verifications')
      .select('id')
      .eq('handle', handle)
      .eq('status', 'succeeded')
      .limit(1);

    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    return (data ?? []).length > 0;
  }

  const all = await readFromFile();
  return all.some((v) => v.handle === handle && v.status === 'succeeded');
}

export async function getLatestVerificationForHandle(handle: string): Promise<VerificationRecord | null> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('handle', handle)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    if (!data) return null;
    return {
      id: data.id,
      handle: data.handle,
      code: data.code,
      status: data.status,
      url: data.url ?? undefined,
      created_at: data.created_at,
      checked_at: data.checked_at ?? undefined,
      reason: data.reason ?? undefined,
    };
  }

  const all = await readFromFile();
  const list = all.filter((v) => v.handle === handle);
  list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return list[0] ?? null;
}

export async function readResponseTextWithLimit(res: Response, maxBytes: number): Promise<string> {
  // If body is absent, fall back to res.text (should be small, but still guard with content-length).
  const contentLength = res.headers.get('content-length');
  if (contentLength) {
    const n = Number(contentLength);
    if (Number.isFinite(n) && n > maxBytes) throw new Error('Response too large');
  }

  if (!res.body) {
    const t = await res.text();
    if (Buffer.byteLength(t, 'utf-8') > maxBytes) throw new Error('Response too large');
    return t;
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) throw new Error('Response too large');
    chunks.push(value);
  }

  const combined = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return combined.toString('utf-8');
}
