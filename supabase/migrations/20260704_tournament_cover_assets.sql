alter table public.tournaments
  add column if not exists cover_image_path text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tournament-assets',
  'tournament-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tournament assets are publicly readable" on storage.objects;
create policy "Tournament assets are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'tournament-assets');
