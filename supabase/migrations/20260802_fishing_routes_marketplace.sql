create extension if not exists pgcrypto;

create table if not exists public.fishing_routes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  city text not null,
  state text not null,
  modality text not null,
  target_species text[] not null default '{}'::text[],
  difficulty text not null default 'media' check (difficulty in ('facil', 'media', 'dificil')),
  price_cents integer not null default 0 check (price_cents >= 0),
  is_published boolean not null default false,
  active_until timestamptz not null default (now() + interval '30 days'),
  preview_lat numeric(10, 7) not null check (preview_lat between -90 and 90),
  preview_lng numeric(10, 7) not null check (preview_lng between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fishing_routes
  add column if not exists active_until timestamptz not null default (now() + interval '30 days');

create table if not exists public.fishing_route_points (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.fishing_routes(id) on delete cascade,
  title text not null,
  notes text,
  latitude numeric(10, 7) not null check (latitude between -90 and 90),
  longitude numeric(10, 7) not null check (longitude between -180 and 180),
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.fishing_route_unlocks (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.fishing_routes(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  price_cents integer not null default 0 check (price_cents >= 0),
  status text not null default 'unlocked' check (status in ('pending', 'unlocked', 'refunded')),
  created_at timestamptz not null default now(),
  unique (route_id, buyer_id)
);

create index if not exists fishing_routes_owner_id_idx on public.fishing_routes(owner_id);
create index if not exists fishing_routes_published_idx on public.fishing_routes(is_published, active_until desc, created_at desc);
create index if not exists fishing_routes_active_until_idx on public.fishing_routes(active_until);
create index if not exists fishing_routes_location_idx on public.fishing_routes(preview_lat, preview_lng);
create index if not exists fishing_route_points_route_id_idx on public.fishing_route_points(route_id, sort_order);
create index if not exists fishing_route_unlocks_buyer_id_idx on public.fishing_route_unlocks(buyer_id);
create index if not exists fishing_route_unlocks_route_id_idx on public.fishing_route_unlocks(route_id);

alter table public.fishing_routes enable row level security;
alter table public.fishing_route_points enable row level security;
alter table public.fishing_route_unlocks enable row level security;

drop policy if exists "Owners and anglers can read published fishing routes" on public.fishing_routes;
create policy "Owners and anglers can read published fishing routes"
  on public.fishing_routes
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or (is_published = true and active_until > now())
    or exists (
      select 1
      from public.fishing_route_unlocks unlocks
      where unlocks.route_id = fishing_routes.id
        and unlocks.buyer_id = auth.uid()
        and unlocks.status = 'unlocked'
    )
  );

drop policy if exists "Users can create own fishing routes" on public.fishing_routes;
create policy "Users can create own fishing routes"
  on public.fishing_routes
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update own fishing routes" on public.fishing_routes;
create policy "Owners can update own fishing routes"
  on public.fishing_routes
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Owners can delete own fishing routes" on public.fishing_routes;
create policy "Owners can delete own fishing routes"
  on public.fishing_routes
  for delete
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Unlocked users can read route points" on public.fishing_route_points;
create policy "Unlocked users can read route points"
  on public.fishing_route_points
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.fishing_routes routes
      where routes.id = fishing_route_points.route_id
        and (
          routes.owner_id = auth.uid()
          or (routes.is_published = true and routes.active_until > now() and routes.price_cents = 0)
          or exists (
            select 1
            from public.fishing_route_unlocks unlocks
            where unlocks.route_id = routes.id
              and unlocks.buyer_id = auth.uid()
              and unlocks.status = 'unlocked'
          )
        )
    )
  );

drop policy if exists "Owners can create route points" on public.fishing_route_points;
create policy "Owners can create route points"
  on public.fishing_route_points
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.fishing_routes routes
      where routes.id = fishing_route_points.route_id
        and routes.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update route points" on public.fishing_route_points;
create policy "Owners can update route points"
  on public.fishing_route_points
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.fishing_routes routes
      where routes.id = fishing_route_points.route_id
        and routes.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.fishing_routes routes
      where routes.id = fishing_route_points.route_id
        and routes.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can delete route points" on public.fishing_route_points;
create policy "Owners can delete route points"
  on public.fishing_route_points
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.fishing_routes routes
      where routes.id = fishing_route_points.route_id
        and routes.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can read own route unlocks" on public.fishing_route_unlocks;
create policy "Users can read own route unlocks"
  on public.fishing_route_unlocks
  for select
  to authenticated
  using (buyer_id = auth.uid());

drop policy if exists "Users can unlock published routes" on public.fishing_route_unlocks;
create policy "Users can unlock published routes"
  on public.fishing_route_unlocks
  for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1
      from public.fishing_routes routes
      where routes.id = fishing_route_unlocks.route_id
        and routes.is_published = true
        and routes.active_until > now()
        and routes.owner_id <> auth.uid()
    )
  );

-- MVP: price_cents records purchase intent. Real payment provider confirmation should
-- update/insert unlocks from a trusted server route before charging real money.
