# Scripts

## refresh-news

Refreshes the `forAgents.dev` news feed by fetching recent AI agent ecosystem news via RSS search feeds, then writing new items into `src/data/news.json`.

### Run manually

```bash
npm install
npm run refresh-news
```

Optional flags:

- `--dry-run` — fetch + print what would be added, but don’t write the JSON file.
- `--hours=<n>` — look back `n` hours (default: 48).

Examples:

```bash
npm run refresh-news -- --dry-run
npm run refresh-news -- --hours=24
```

### What it does

- Searches for recent AI-agent-related news (last 24–48h by default) using Google News RSS search results for these queries:
  - `AI agents news`
  - `MCP protocol updates`
  - `agent frameworks`
  - `AI agent tools`
- For each result, generates a news entry in the same schema as `src/data/news.json`:

```json
{
  "id": "feed-XXXXXX",
  "title": "...",
  "summary": "...",
  "source_url": "https://...",
  "source_name": "...",
  "tags": ["agents", "tools", "models"],
  "published_at": "ISO 8601"
}
```

### Deduplication

Dedup is done by `source_url`:

- Existing URLs in `src/data/news.json` are loaded into a set.
- Any fetched result whose `source_url` already exists is skipped.
- New entries are prepended to the top of the JSON array.

### Set up a cron job

1) Pick a working directory (the repo root) and ensure Node + npm are available.

2) Add a crontab entry (example: run every 3 hours):

```cron
0 */3 * * * cd /path/to/foragents.dev && npm run refresh-news >> /tmp/foragents-refresh-news.log 2>&1
```

Notes:

- The script writes directly to `src/data/news.json`.
- It’s safe to run repeatedly; duplicates are skipped by URL.
- Consider redirecting output to a log file (as above) so you can audit what was added.
