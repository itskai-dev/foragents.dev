-- Verification-as-distribution v0

create table if not exists public.verifications (
  id uuid primary key,
  handle text not null,
  code text not null,
  status text not null check (status in ('pending','succeeded','failed')),
  url text,
  reason text,
  created_at timestamptz not null default now(),
  checked_at timestamptz
);

create index if not exists verifications_handle_idx on public.verifications(handle);
create index if not exists verifications_checked_at_idx on public.verifications(checked_at);
