create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('angler', 'organizer', 'admin')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.tournament_organizers (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'reviewer' check (role in ('owner', 'manager', 'reviewer')),
  created_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);

create index if not exists user_roles_user_id_idx
  on public.user_roles(user_id);

create index if not exists user_roles_role_idx
  on public.user_roles(role);

create index if not exists tournament_organizers_tournament_id_idx
  on public.tournament_organizers(tournament_id);

create index if not exists tournament_organizers_user_id_idx
  on public.tournament_organizers(user_id);

alter table public.user_roles enable row level security;
alter table public.tournament_organizers enable row level security;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can read own organizer links" on public.tournament_organizers;
create policy "Users can read own organizer links"
  on public.tournament_organizers
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Organizers can read submissions for their tournaments" on public.catch_submissions;
create policy "Organizers can read submissions for their tournaments"
  on public.catch_submissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tournament_organizers organizers
      where organizers.tournament_id = catch_submissions.tournament_id
        and organizers.user_id = auth.uid()
    )
  );

create or replace function public.review_tournament_submission(
  submission_id uuid,
  new_status text,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_tournament_id uuid;
begin
  if new_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Invalid review status: %', new_status;
  end if;

  select tournament_id
    into target_tournament_id
  from public.catch_submissions
  where id = submission_id;

  if target_tournament_id is null then
    raise exception 'Submission not found.';
  end if;

  if not exists (
    select 1
    from public.tournament_organizers organizers
    where organizers.tournament_id = target_tournament_id
      and organizers.user_id = auth.uid()
  ) then
    raise exception 'Not allowed to review this tournament submission.';
  end if;

  update public.catch_submissions
  set
    status = new_status,
    reviewer_notes = nullif(trim(notes), ''),
    updated_at = now()
  where id = submission_id;
end;
$$;

revoke all on function public.review_tournament_submission(uuid, text, text) from public;
grant execute on function public.review_tournament_submission(uuid, text, text) to authenticated;

-- Seed opcional: vincula usuarios admin/organizer manualmente depois que eles existirem no Auth.
-- Exemplo:
-- insert into public.user_roles (user_id, role)
-- values ('00000000-0000-0000-0000-000000000000', 'organizer')
-- on conflict (user_id, role) do nothing;
--
-- insert into public.tournament_organizers (tournament_id, user_id, role)
-- values (
--   '11111111-1111-4111-8111-111111111111',
--   '00000000-0000-0000-0000-000000000000',
--   'owner'
-- )
-- on conflict (tournament_id, user_id) do update set role = excluded.role;
