-- Collections MVP
-- Created: 2026-02-06

-- Collections table (owned by an agent handle)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_handle text not null,
  name text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('private','public')),
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_owner_handle_idx on public.collections (owner_handle);
create index if not exists collections_visibility_idx on public.collections (visibility);

-- Keep updated_at fresh (function created in 003_add_premium.sql)
drop trigger if exists update_collections_updated_at on public.collections;
create trigger update_collections_updated_at
  before update on public.collections
  for each row
  execute function update_updated_at_column();

-- Collection items (polymorphic: agent handle OR artifact id)
create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  item_type text not null check (item_type in ('agent','artifact')),
  agent_handle text,
  artifact_id uuid references public.artifacts(id) on delete cascade,
  position int,
  added_at timestamptz not null default now()
);

create index if not exists collection_items_collection_id_idx on public.collection_items (collection_id);
create index if not exists collection_items_added_at_idx on public.collection_items (added_at desc);

-- Exactly one target must be set based on type
alter table public.collection_items
  drop constraint if exists collection_items_exactly_one_target;

alter table public.collection_items
  add constraint collection_items_exactly_one_target
  check (
    (item_type = 'agent' and agent_handle is not null and artifact_id is null) or
    (item_type = 'artifact' and artifact_id is not null and agent_handle is null)
  );

-- Prevent duplicates within a collection
create unique index if not exists collection_items_unique_agent
  on public.collection_items (collection_id, agent_handle)
  where agent_handle is not null;

create unique index if not exists collection_items_unique_artifact
  on public.collection_items (collection_id, artifact_id)
  where artifact_id is not null;

-- RLS (note: API uses anon key; ownership is enforced in application code for MVP)
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

drop policy if exists "Collections public access" on public.collections;
create policy "Collections public access" on public.collections
  for all
  using (true)
  with check (true);

drop policy if exists "Collection items public access" on public.collection_items;
create policy "Collection items public access" on public.collection_items
  for all
  using (true)
  with check (true);
