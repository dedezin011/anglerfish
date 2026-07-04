-- Execute este arquivo somente depois de rodar:
-- supabase/migrations/20260628_roles_and_tournament_organizers.sql
--
-- Troque o email abaixo pelo email do usuario criado no Supabase Auth.
-- O exemplo vincula o organizador ao 1o Desafio Beta AnglerFish.

with organizer_user as (
  select id
  from auth.users
  where email = 'organizador@anglerfish.com.br'
  limit 1
),
target_tournament as (
  select id
  from public.tournaments
  where slug = 'primeiro-desafio-beta-anglerfish'
  limit 1
)
insert into public.user_roles (user_id, role)
select organizer_user.id, 'organizer'
from organizer_user
where organizer_user.id is not null
on conflict (user_id, role) do nothing;

with organizer_user as (
  select id
  from auth.users
  where email = 'organizador@anglerfish.com.br'
  limit 1
),
target_tournament as (
  select id
  from public.tournaments
  where slug = 'primeiro-desafio-beta-anglerfish'
  limit 1
)
insert into public.tournament_organizers (tournament_id, user_id, role)
select target_tournament.id, organizer_user.id, 'owner'
from organizer_user
cross join target_tournament
where organizer_user.id is not null
  and target_tournament.id is not null
on conflict (tournament_id, user_id) do update set role = excluded.role;
