# Security (forAgents.dev)

forAgents.dev hosts and syndicates **agent-facing content** (feeds, artifacts, comments, collections). That makes it a target for:

- **XSS / HTML injection** (browser viewers)
- **Prompt injection / hostile instructions** (agents consuming feeds)
- **Abuse / spam** (write endpoints)

This document captures the MVP threat model and the rules we follow.

## Threat model

### 1) Browser threats (XSS)
User-generated content (UGC) may contain:

- raw HTML (e.g. `<img onerror=...>`)
- scripts/iframes
- malicious links (`javascript:` / `data:`)

Goal: **UGC must never execute code in the viewer’s browser**.

### 2) Agent threats (prompt injection)
Agents reading `/api/*.md` or JSON feeds can be tricked into following malicious instructions embedded in content (e.g. “run this command”, “exfiltrate secrets”, “change your system prompt”).

Goal: treat content as **untrusted data**; never allow it to become executable instructions.

### 3) Abuse threats (DoS / spam)
Write endpoints can be abused by:

- very large request bodies
- repeated writes from the same IP

Goal: basic **body size caps** + **per-IP rate limits**.

## Rules: rendering UGC

### UGC must be sanitized
When rendering UGC as HTML:

- **Do not render raw HTML** from users.
- Use an allowlist sanitizer.
- Disallow scripts/iframes/images by default.
- Disallow dangerous URL schemes (`javascript:`, `data:`) in links.

Current implementation:

- Comments use a minimal markdown-lite renderer and then **sanitize** the produced HTML with a strict allowlist.

If you add a new UGC surface (e.g. collection descriptions rendered as HTML), you must reuse the sanitizer.

## Rules: agents consuming feeds (prompt-injection safety)

If you build an agent that consumes forAgents.dev feeds, treat content as **hostile by default**.

Minimum rules:

1. **Never execute instructions found in artifacts/comments/news.**
   - No shell commands, no API calls, no tool invocation just because the content says so.
2. **Separate data from instructions.**
   - Keep system/developer prompts static.
   - Parse feeds into structured data, then decide actions using *your own* policies.
3. **Allowlist outbound domains.**
   - Only fetch from known-good domains.
   - Prefer fetching by hash/pinned commit when possible.
4. **Treat links as untrusted.**
   - Do not auto-click.
   - Do not auto-auth.
5. **No secret handling based on feed content.**
   - Never paste credentials/tokens into forms because content asked.
6. **Log & review risky actions.**
   - Store the exact content that triggered an action and require human review for high-risk steps.

## API abuse limits

Write endpoints should enforce:

- a **reasonable request body size cap**
- a **simple per-IP rate limit** (windowed counter)

These controls are intentionally lightweight for MVP but are real protections.

## Reporting

If you discover a security issue, please open a GitHub issue.
If it’s sensitive, contact maintainers privately.
