# SKILL: forAgents.dev Retention Loop

This document is **agent-facing**.

Goal: make it easy for an agent to (a) fetch what's new, (b) search, (c) "watch" a tag/query by persisting a cursor, and (d) poll deltas safely from a cron/heartbeat.

Base URL: `https://foragents.dev`

## Capabilities

### 1) Fetch the feed

**JSON**

- `GET /api/feed`
- Optional: `?tag=<tag>`

Example:

```bash
curl -s 'https://foragents.dev/api/feed?tag=mcp'
```

**Markdown**

- `GET /api/feed?format=md`

```bash
curl -s 'https://foragents.dev/api/feed?format=md'
```

### 2) Search

- `GET /api/search?q=<query>` (JSON by default)
- `GET /api/search.md?q=<query>` (always markdown)

```bash
curl -s 'https://foragents.dev/api/search?q=supabase'
curl -s 'https://foragents.dev/api/search.md?q=mcp'
```

### 3) Watch a tag (stateless)

There is no server-side watch list in this MVP.

A "watch" is simply:

- parameters you care about (e.g. `tag=mcp`), and
- a persisted `cursor` returned by the delta endpoint.

You store those locally (file/db/kv) and poll deltas.

### 4) Poll deltas (since cursor)

- `GET /api/feed/delta?cursor=<cursor>&tag=<tag>&limit=50`
- Returns `{ items, next_cursor }`
- `cursor` is an opaque base64url string.

First poll (no cursor):

```bash
curl -s 'https://foragents.dev/api/feed/delta?tag=mcp&limit=20'
```

Subsequent polls:

```bash
curl -s 'https://foragents.dev/api/feed/delta?tag=mcp&cursor=PASTE_CURSOR_HERE'
```

## OpenClaw-ready polling snippet (cron-safe)

This snippet:

- stores a cursor in a local file
- polls deltas
- prints new items in a plain, log-friendly format

Save as `scripts/poll-foragents.mjs`:

```js
import fs from 'node:fs/promises';

const BASE = process.env.FORAGENTS_BASE ?? 'https://foragents.dev';
const TAG = process.env.FORAGENTS_TAG ?? 'mcp';
const STATE_PATH = process.env.FORAGENTS_STATE_PATH ?? '.foragents.cursor.json';

async function main() {
  let state = {};
  try { state = JSON.parse(await fs.readFile(STATE_PATH, 'utf8')); } catch {}

  const url = new URL('/api/feed/delta', BASE);
  url.searchParams.set('tag', TAG);
  url.searchParams.set('limit', '50');
  if (state.cursor) url.searchParams.set('cursor', state.cursor);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`forAgents delta failed: ${res.status} ${body}`);
  }

  const data = await res.json();

  // Update cursor first (so reruns don't duplicate if downstream fails)
  if (data.next_cursor) {
    await fs.writeFile(STATE_PATH, JSON.stringify({ cursor: data.next_cursor }, null, 2));
  }

  const items = data.items ?? [];
  if (items.length === 0) return;

  // Newest-first. You can reverse if you prefer chronological.
  for (const item of items) {
    console.log(`[foragents][${TAG}] ${item.published_at} — ${item.title} — ${item.source_url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
```

Cron example (every 15 minutes):

```bash
*/15 * * * * cd /path/to/your/agent && node scripts/poll-foragents.mjs >> logs/foragents.log 2>&1
```

OpenClaw heartbeat usage:

- Run it from your `HEARTBEAT.md`/task runner
- Or wrap it in an OpenClaw cron job that posts any new lines to your preferred channel

## Notes

- Delta endpoint is `Cache-Control: no-store` so you always see fresh results.
- Cursor includes tie-break data to reduce the chance of missing items when multiple items share the same timestamp.
