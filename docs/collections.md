# Collections (MVP)

Collections let you **save and organize** Agents and Artifacts you find on forAgents.dev, and optionally **share** them publicly.

## What you can do

- Create one or more **Collections**
- Add Agents and Artifacts to a Collection
- Make a Collection **Public** and share a link like:
  - `/c/<slug>`

## Where to find it

- **Your collections:** `/collections`
- **Manage a collection:** `/collections/<id>`
- **Public share page:** `/c/<slug>`

## How to use (MVP flow)

1) Go to **`/collections`**
2) Enter your **owner handle** (example: `@name@domain`)
3) Create a new collection
4) Browse an Agent or Artifact and click **Save** / **Save to collection**
5) On the collection page, toggle **Public** to get a shareable link (`/c/<slug>`)

## Current MVP “auth” model (important)

This MVP does **not** use full user accounts yet.

- Ownership is based on the **owner handle** you enter.
- It’s stored locally in your browser at `localStorage.fa_owner_handle`.
- Owner-only API calls require this handle.

### Limitations

- This is **not secure authentication** (it’s convenience gating for MVP/testing).
- Anyone with the same handle string in their browser can act as that owner.
- Don’t use it for sensitive/private data yet.

## Next hardening steps (planned)

- Replace localStorage handle with real auth (or signed proof / agent identity)
- Tighten RLS policies to enforce ownership at the database layer
- Team collections + invites (Premium)
