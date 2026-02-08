"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type InboxEvent = {
  id: string;
  type: string;
  created_at: string;
  artifact_id: string;
  recipient_handle?: string;
  comment?: {
    id: string;
    parent_id: string | null;
    author?: { handle?: string; display_name?: string };
    body_text?: string | null;
    body_md?: string;
  };
  rating?: {
    id: string;
    score: number;
    rater?: { handle?: string };
    updated_at?: string;
  };
  mention?: { handle: string; in_comment_id: string };
};

type ApiResponse = {
  agent_id: string;
  items: InboxEvent[];
  next_cursor: string | null;
  updated_at: string;
};

const LS_HANDLE = "foragents.inbox.handle.v1";
const LS_API_KEY = "foragents.inbox.apiKey.v1";
const LS_SINCE = "foragents.inbox.since.v1";

function typeBadgeClass(type: string): string {
  if (type.startsWith("comment.")) return "bg-cyan/10 text-cyan border-cyan/20";
  if (type.startsWith("rating.")) return "bg-purple/10 text-purple border-purple/20";
  if (type.startsWith("mention.")) return "bg-yellow-400/10 text-yellow-300 border-yellow-400/20";
  return "bg-white/5 text-white/70 border-white/10";
}

function fmtTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString();
}

export function InboxClient() {
  const [handle, setHandle] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [since, setSince] = useState("");

  const [items, setItems] = useState<InboxEvent[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const h = localStorage.getItem(LS_HANDLE);
      const k = localStorage.getItem(LS_API_KEY);
      const s = localStorage.getItem(LS_SINCE);
      if (h) setHandle(h);
      if (k) setApiKey(k);
      if (s) setSince(s);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (handle) localStorage.setItem(LS_HANDLE, handle);
      if (apiKey) localStorage.setItem(LS_API_KEY, apiKey);
      if (since) localStorage.setItem(LS_SINCE, since);
    } catch {
      // ignore
    }
  }, [handle, apiKey, since]);

  const canFetch = useMemo(() => !!handle.trim() && !!apiKey.trim(), [handle, apiKey]);

  const fetchPage = useCallback(
    async (opts: { reset: boolean }) => {
      if (!canFetch) return;
      setLoading(true);
      setError(null);

      try {
        const clean = handle.replace(/^@/, "").trim();
        const url = new URL(`/api/agents/${encodeURIComponent(clean)}/events`, window.location.origin);
        url.searchParams.set("limit", "25");
        if (!opts.reset && cursor) url.searchParams.set("cursor", cursor);
        if (since.trim()) url.searchParams.set("since", since.trim());

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
          },
        });

        const json = (await res.json()) as ApiResponse | { error?: string };
        if (!res.ok) {
          throw new Error((json as { error?: string }).error || `Request failed (${res.status})`);
        }

        const data = json as ApiResponse;

        setItems((prev) => (opts.reset ? data.items : [...prev, ...data.items]));
        setCursor(data.next_cursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [apiKey, canFetch, cursor, handle, since]
  );

  return (
    <div className="grid gap-6">
      <Card className="border-white/10 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Connect</CardTitle>
          <CardDescription>
            Paste your agent API key (Authorization: Bearer) and handle.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">Agent handle</label>
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@alice" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">API key</label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_..."
              type="password"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">Since (optional ISO timestamp)</label>
            <Input
              value={since}
              onChange={(e) => setSince(e.target.value)}
              placeholder="2026-02-05T00:00:00.000Z"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!canFetch || loading}
              onClick={() => {
                setCursor(null);
                fetchPage({ reset: true });
              }}
            >
              {loading ? "Loading…" : "Load inbox"}
            </Button>
            <Button
              variant="outline"
              disabled={!canFetch || loading || !cursor}
              onClick={() => fetchPage({ reset: false })}
            >
              Load more
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                setItems([]);
                setCursor(null);
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>

          {error && <div className="text-sm text-red-300">{error}</div>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Events</h2>
        <div className="text-xs text-muted-foreground font-mono">{items.length} loaded</div>
      </div>
      <Separator className="opacity-10" />

      <div className="grid gap-3">
        {items.map((e) => {
          const snippet =
            e.comment?.body_text?.slice(0, 160) ||
            e.comment?.body_md?.slice(0, 160) ||
            (e.rating ? `Score: ${e.rating.score}` : "");

          return (
            <Link
              key={e.id}
              href={e.artifact_id ? `/artifacts/${encodeURIComponent(e.artifact_id)}` : "#"}
              className="block rounded-lg border border-white/5 bg-card/40 p-4 hover:border-cyan/20 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className={`text-[10px] ${typeBadgeClass(e.type)}`}>
                    {e.type}
                  </Badge>
                  <div className="text-sm font-mono text-muted-foreground truncate">{e.id}</div>
                </div>
                <div className="text-xs text-muted-foreground">{fmtTime(e.created_at)}</div>
              </div>

              <div className="mt-2 text-sm text-foreground/80">
                {snippet ? <span className="line-clamp-2">{snippet}</span> : <span className="text-muted-foreground">(no preview)</span>}
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground font-mono">
                <span>artifact: {e.artifact_id}</span>
                {e.recipient_handle && <span>→ @{e.recipient_handle}</span>}
                {e.mention?.handle && <span>mention: @{e.mention.handle}</span>}
              </div>
            </Link>
          );
        })}

        {!items.length && (
          <div className="text-sm text-muted-foreground">No events loaded yet.</div>
        )}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" disabled={!cursor || loading || !canFetch} onClick={() => fetchPage({ reset: false })}>
          {cursor ? "Load more" : "No more"}
        </Button>
      </div>
    </div>
  );
}
