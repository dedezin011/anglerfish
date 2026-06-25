create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  handle text unique,
  city text,
  state text,
  fishing_style text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  code text not null,
  prize text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  rules jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);

create table if not exists public.catch_submissions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  fish_species text not null,
  length_cm numeric(6, 2) not null check (length_cm > 0),
  city text not null,
  state text not null,
  modality text not null,
  code_spoken text not null,
  photo_path text not null,
  video_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tournaments_status_idx on public.tournaments(status);
create index if not exists tournament_participants_user_idx on public.tournament_participants(user_id);
create index if not exists catch_submissions_tournament_idx on public.catch_submissions(tournament_id);
create index if not exists catch_submissions_user_idx on public.catch_submissions(user_id);
create index if not exists catch_submissions_status_length_idx on public.catch_submissions(status, length_cm desc);

insert into public.tournaments (
  id,
  name,
  slug,
  description,
  code,
  prize,
  status,
  rules
)
values (
  '11111111-1111-4111-8111-111111111111',
  '1º Desafio Beta AnglerFish',
  'primeiro-desafio-beta-anglerfish',
  'Primeiro teste da comunidade para validar campeonatos digitais, ranking e envio de capturas com foto e vídeo.',
  'ANGLER-01',
  'Kit de iscas para os 3 melhores registros',
  'active',
  '[
    "Envie uma foto do peixe na régua.",
    "Envie um vídeo curto falando o código do desafio.",
    "Informe espécie, medida, cidade, estado e modalidade.",
    "Capturas ficam em análise antes de entrar no ranking."
  ]'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  code = excluded.code,
  prize = excluded.prize,
  status = excluded.status,
  rules = excluded.rules,
  updated_at = now();

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'catch-media',
  'catch-media',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.catch_submissions enable row level security;

drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Active tournaments are readable" on public.tournaments;
create policy "Active tournaments are readable"
  on public.tournaments
  for select
  to authenticated
  using (status in ('active', 'completed'));

drop policy if exists "Users can view own participation" on public.tournament_participants;
create policy "Users can view own participation"
  on public.tournament_participants
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can join tournaments" on public.tournament_participants;
create policy "Users can join tournaments"
  on public.tournament_participants
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can view approved or own submissions" on public.catch_submissions;
create policy "Users can view approved or own submissions"
  on public.catch_submissions
  for select
  to authenticated
  using (status = 'approved' or user_id = auth.uid());

drop policy if exists "Users can create own submissions" on public.catch_submissions;
create policy "Users can create own submissions"
  on public.catch_submissions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can upload own catch media" on storage.objects;
create policy "Users can upload own catch media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'catch-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read own catch media" on storage.objects;
create policy "Users can read own catch media"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'catch-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
